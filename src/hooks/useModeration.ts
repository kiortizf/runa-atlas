import { useState, useCallback, useRef } from 'react';
import { collection, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { checkProfanity, type ProfanityResult } from '../utils/profanityFilter';

// ═══════════════════════════════════════════
// useModeration — Community Safety Tooling
// ═══════════════════════════════════════════
// Report, hide, ban, profanity check, rate limit.

export interface ContentReport {
  id?: string;
  contentId: string;
  contentType: 'discussion' | 'reply' | 'highlight' | 'review';
  collectionPath: string;
  reportedBy: string;
  reporterDisplayName: string;
  reason: 'spam' | 'harassment' | 'hate_speech' | 'inappropriate' | 'spoiler' | 'other';
  details?: string;
  status: 'pending' | 'reviewed' | 'actioned' | 'dismissed';
  createdAt: any;
}

const RATE_LIMIT_MS = 30_000; // 30 seconds between posts

export function useModeration() {
  const { user } = useAuth();
  const [reporting, setReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const lastPostTime = useRef<number>(0);

  // ── Report Content ──
  const reportContent = useCallback(async (
    contentId: string,
    contentType: ContentReport['contentType'],
    collectionPath: string,
    reason: ContentReport['reason'],
    details?: string
  ): Promise<boolean> => {
    if (!user) return false;
    setReporting(true);
    try {
      await addDoc(collection(db, 'content_reports'), {
        contentId,
        contentType,
        collectionPath,
        reportedBy: user.uid,
        reporterDisplayName: user.displayName || 'Anonymous',
        reason,
        details: details || '',
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setReportSuccess(true);
      setTimeout(() => setReportSuccess(false), 3000);
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'content_reports');
      return false;
    } finally {
      setReporting(false);
    }
  }, [user]);

  // ── Hide Content (admin) ──
  const hideContent = useCallback(async (
    collectionPath: string,
    docId: string
  ): Promise<boolean> => {
    try {
      await updateDoc(doc(db, collectionPath, docId), {
        hidden: true,
        hiddenAt: serverTimestamp(),
        hiddenBy: user?.uid || 'system',
      });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${collectionPath}/${docId}`);
      return false;
    }
  }, [user]);

  // ── Delete Content (admin) ──
  const deleteContent = useCallback(async (
    collectionPath: string,
    docId: string
  ): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, collectionPath, docId));
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${collectionPath}/${docId}`);
      return false;
    }
  }, []);

  // ── Ban User (admin) ──
  const banUser = useCallback(async (
    targetUserId: string,
    reason: string,
    durationDays?: number
  ): Promise<boolean> => {
    if (!user) return false;
    try {
      // Set ban on user doc
      await updateDoc(doc(db, 'users', targetUserId), {
        isBanned: true,
        banReason: reason,
        bannedAt: serverTimestamp(),
        bannedBy: user.uid,
        banExpiresAt: durationDays
          ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
          : null, // null = permanent
      });
      // Record in ban log
      await addDoc(collection(db, 'user_bans'), {
        userId: targetUserId,
        reason,
        durationDays: durationDays || null,
        bannedBy: user.uid,
        createdAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'user_bans');
      return false;
    }
  }, [user]);

  // ── Profanity Check (wraps utility) ──
  const validateContent = useCallback((text: string): ProfanityResult => {
    return checkProfanity(text);
  }, []);

  // ── Rate Limiting ──
  const canPost = useCallback((): { allowed: boolean; waitSeconds: number } => {
    const now = Date.now();
    const elapsed = now - lastPostTime.current;
    if (elapsed < RATE_LIMIT_MS) {
      return { allowed: false, waitSeconds: Math.ceil((RATE_LIMIT_MS - elapsed) / 1000) };
    }
    return { allowed: true, waitSeconds: 0 };
  }, []);

  const recordPost = useCallback(() => {
    lastPostTime.current = Date.now();
  }, []);

  return {
    reportContent,
    hideContent,
    deleteContent,
    banUser,
    validateContent,
    canPost,
    recordPost,
    reporting,
    reportSuccess,
  };
}
