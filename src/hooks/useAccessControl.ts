import { useState, useEffect, useMemo } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

// ═══════════════════════════════════════════
// useAccessControl — Central Access Gate
// ═══════════════════════════════════════════
// Single source of truth for "can this user do X?"
// Reads from users/{uid} doc for role + tier data.

export type UserTier = 'public' | 'member' | 'founder';
export type UserRole = 'reader' | 'beta_reader' | 'author' | 'editor' | 'admin';

interface AccessControlState {
  tier: UserTier;
  role: UserRole;
  isBanned: boolean;
  banReason?: string;
  loading: boolean;
}

// Feature → minimum requirements
const FEATURE_GATES: Record<string, { minTier?: UserTier; roles?: UserRole[]; requireAuth?: boolean }> = {
  // Community features
  'spoiler_discussions.read': { requireAuth: false },
  'spoiler_discussions.post': { requireAuth: true, minTier: 'member' },
  'spoiler_discussions.like': { requireAuth: true },

  // Beta reader features
  'beta_reading.apply': { requireAuth: true, minTier: 'member' },
  'beta_reading.manage': { requireAuth: true, roles: ['editor', 'admin'] },
  'beta_reading.participate': { requireAuth: true, roles: ['beta_reader', 'admin'] },

  // Author features
  'manuscripts.create': { requireAuth: true, roles: ['author', 'admin'] },
  'manuscripts.review': { requireAuth: true, roles: ['editor', 'admin'] },
  'creator_studio': { requireAuth: true, roles: ['author', 'admin'] },

  // Admin features
  'admin_panel': { requireAuth: true, roles: ['admin'] },
  'moderation.review_reports': { requireAuth: true, roles: ['admin'] },
  'moderation.ban_user': { requireAuth: true, roles: ['admin'] },
  'moderation.delete_content': { requireAuth: true, roles: ['admin'] },

  // Reader features
  'bookshelf': { requireAuth: true },
  'reading_progress': { requireAuth: true },
  'highlights': { requireAuth: true },
  'book_dna': { requireAuth: true, minTier: 'member' },
  'buddy_reads': { requireAuth: true, minTier: 'member' },
};

const TIER_LEVELS: Record<UserTier, number> = {
  public: 0,
  member: 1,
  founder: 2,
};

export function useAccessControl() {
  const { user } = useAuth();
  const [state, setState] = useState<AccessControlState>({
    tier: 'public',
    role: 'reader',
    isBanned: false,
    loading: true,
  });

  // Listen to user doc for role + tier
  useEffect(() => {
    if (!user?.uid) {
      setState({ tier: 'public', role: 'reader', isBanned: false, loading: false });
      return;
    }

    const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setState({
          tier: (data.membershipTier as UserTier) || 'member',
          role: (data.role as UserRole) || 'reader',
          isBanned: data.isBanned === true,
          banReason: data.banReason,
          loading: false,
        });
      } else {
        setState({ tier: 'member', role: 'reader', isBanned: false, loading: false });
      }
    }, () => {
      setState({ tier: 'member', role: 'reader', isBanned: false, loading: false });
    });

    return () => unsub();
  }, [user?.uid]);

  const canAccess = useMemo(() => (feature: string): boolean => {
    if (state.loading) return false;
    if (state.isBanned) return false;

    const gate = FEATURE_GATES[feature];
    if (!gate) return true; // No gate defined = open access

    // Auth check
    if (gate.requireAuth && !user) return false;

    // Tier check
    if (gate.minTier) {
      if (TIER_LEVELS[state.tier] < TIER_LEVELS[gate.minTier]) return false;
    }

    // Role check (user must have one of the allowed roles)
    if (gate.roles && gate.roles.length > 0) {
      if (!gate.roles.includes(state.role)) return false;
    }

    return true;
  }, [state, user]);

  return {
    ...state,
    canAccess,
    isAuthenticated: !!user,
    isAdmin: state.role === 'admin',
    isAuthor: state.role === 'author' || state.role === 'admin',
    isEditor: state.role === 'editor' || state.role === 'admin',
    isBetaReader: state.role === 'beta_reader',
  };
}
