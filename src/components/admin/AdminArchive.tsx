import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, doc, updateDoc, deleteDoc, limit as fbLimit } from 'firebase/firestore';
import { db } from '../../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Archive, Check, X, Eye, EyeOff, Flag, AlertTriangle,
  Clock, ChevronDown, Loader2, ExternalLink, Search
} from 'lucide-react';
import {
  ARTIFACT_TYPE_META, RATING_META,
  type Artifact, type ArtifactStatus
} from '../../data/archiveTypes';

// ═══════════════════════════════════════════════════════════════
// ADMIN ARCHIVE — Moderation Dashboard
// ═══════════════════════════════════════════════════════════════

type Tab = 'pending' | 'published' | 'hidden' | 'reports';

interface Report {
  id: string;
  artifactId: string;
  reporterId: string;
  reason: string;
  status: string;
  createdAt: any;
}

export default function AdminArchive() {
  const [tab, setTab] = useState<Tab>('pending');
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === 'reports') {
        const q = query(
          collection(db, 'archive_reports'),
          where('status', '==', 'pending'),
          orderBy('createdAt', 'desc'),
          fbLimit(50)
        );
        const snap = await getDocs(q);
        setReports(snap.docs.map(d => ({ id: d.id, ...d.data() } as Report)));
      } else {
        const q = query(
          collection(db, 'archive_artifacts'),
          where('status', '==', tab),
          orderBy('createdAt', 'desc'),
          fbLimit(50)
        );
        const snap = await getDocs(q);
        setArtifacts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Artifact)));
      }
    } catch (err) {
      console.error('Failed to load archive data:', err);
    }
    setLoading(false);
  };

  const updateStatus = async (artifactId: string, status: ArtifactStatus) => {
    setActionLoading(artifactId);
    try {
      await updateDoc(doc(db, 'archive_artifacts', artifactId), { status });
      setArtifacts(prev => prev.filter(a => a.id !== artifactId));
    } catch (err) {
      console.error('Failed to update:', err);
    }
    setActionLoading(null);
  };

  const deleteArtifact = async (artifactId: string) => {
    if (!confirm('Permanently delete this artifact?')) return;
    setActionLoading(artifactId);
    try {
      await deleteDoc(doc(db, 'archive_artifacts', artifactId));
      setArtifacts(prev => prev.filter(a => a.id !== artifactId));
    } catch (err) {
      console.error('Failed to delete:', err);
    }
    setActionLoading(null);
  };

  const dismissReport = async (reportId: string) => {
    setActionLoading(reportId);
    try {
      await updateDoc(doc(db, 'archive_reports', reportId), { status: 'dismissed' });
      setReports(prev => prev.filter(r => r.id !== reportId));
    } catch (err) {
      console.error('Failed to dismiss:', err);
    }
    setActionLoading(null);
  };

  const filteredArtifacts = searchTerm
    ? artifacts.filter(a =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.authorDisplayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : artifacts;

  const tabs: { id: Tab; label: string; icon: any; count?: number }[] = [
    { id: 'pending', label: 'Pending', icon: Clock },
    { id: 'published', label: 'Published', icon: Eye },
    { id: 'hidden', label: 'Hidden', icon: EyeOff },
    { id: 'reports', label: 'Reports', icon: Flag },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Archive className="w-5 h-5 text-starforge-gold" /> Runeweave Archive
        </h2>
        <button onClick={loadData} className="text-text-secondary hover:text-white font-ui text-xs uppercase tracking-widest transition-colors">
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/[0.06] pb-3">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-ui text-xs uppercase tracking-widest transition-all ${
                tab === t.id
                  ? 'bg-starforge-gold/15 text-starforge-gold border border-starforge-gold/30'
                  : 'text-text-secondary hover:text-white border border-transparent'
              }`}>
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Search */}
      {tab !== 'reports' && (
        <div className="relative">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by title, author, or type…"
            className="w-full bg-surface border border-white/[0.08] rounded-lg pl-10 pr-4 py-2.5 font-ui text-sm text-white focus:outline-none focus:border-starforge-gold" />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-starforge-gold animate-spin" />
        </div>
      ) : tab === 'reports' ? (
        /* ── Reports View ── */
        reports.length === 0 ? (
          <div className="text-center py-12">
            <Flag className="w-10 h-10 text-white/10 mx-auto mb-3" />
            <p className="font-ui text-sm text-text-secondary">No pending reports</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map(report => (
              <div key={report.id} className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-ui text-xs text-red-400 uppercase tracking-widest">Report: {report.reason}</span>
                  <span className="font-ui text-[10px] text-text-muted">Artifact: {report.artifactId.slice(0, 8)}…</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => updateStatus(report.artifactId, 'hidden')}
                    disabled={actionLoading === report.id}
                    className="px-3 py-1.5 bg-red-500/15 text-red-400 border border-red-400/20 rounded-lg font-ui text-xs uppercase tracking-widest transition-colors hover:bg-red-500/25">
                    Hide Artifact
                  </button>
                  <button onClick={() => dismissReport(report.id)}
                    disabled={actionLoading === report.id}
                    className="px-3 py-1.5 text-text-secondary border border-white/[0.06] rounded-lg font-ui text-xs uppercase tracking-widest hover:text-white transition-colors">
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* ── Artifacts View ── */
        filteredArtifacts.length === 0 ? (
          <div className="text-center py-12">
            <Archive className="w-10 h-10 text-white/10 mx-auto mb-3" />
            <p className="font-ui text-sm text-text-secondary">
              No {tab} artifacts{searchTerm ? ` matching "${searchTerm}"` : ''}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Batch actions for pending */}
            {tab === 'pending' && filteredArtifacts.length > 0 && (
              <div className="flex items-center gap-3 p-3 bg-emerald-900/10 border border-emerald-500/15 rounded-lg mb-4">
                <span className="font-ui text-xs text-emerald-400">{filteredArtifacts.length} pending</span>
                <button
                  onClick={async () => {
                    for (const a of filteredArtifacts) {
                      await updateDoc(doc(db, 'archive_artifacts', a.id), { status: 'published' });
                    }
                    loadData();
                  }}
                  className="px-3 py-1.5 bg-emerald-500/15 text-emerald-400 border border-emerald-400/20 rounded-lg font-ui text-xs uppercase tracking-widest hover:bg-emerald-500/25 transition-colors">
                  <Check className="w-3 h-3 inline mr-1" /> Approve All
                </button>
              </div>
            )}

            {filteredArtifacts.map(artifact => {
              const meta = ARTIFACT_TYPE_META[artifact.type];
              return (
                <div key={artifact.id} className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/[0.06] rounded-lg hover:border-white/[0.1] transition-colors">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-ui text-[10px] uppercase tracking-widest ${meta.color}`}>{meta.label}</span>
                      <span className={`font-ui text-[10px] uppercase tracking-widest ${RATING_META[artifact.rating].color}`}>
                        {RATING_META[artifact.rating].label}
                      </span>
                      {artifact.reports > 0 && (
                        <span className="font-ui text-[10px] text-red-400">⚠ {artifact.reports} reports</span>
                      )}
                    </div>
                    <h4 className="font-heading text-sm text-white truncate">{artifact.title}</h4>
                    <p className="font-ui text-[11px] text-text-muted">
                      by {artifact.authorDisplayName}
                      {artifact.bookTitle && <span> · 📖 {artifact.bookTitle}</span>}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-none">
                    {tab === 'pending' && (
                      <>
                        <button onClick={() => updateStatus(artifact.id, 'published')}
                          disabled={actionLoading === artifact.id}
                          className="p-2 bg-emerald-500/15 text-emerald-400 rounded-lg hover:bg-emerald-500/25 transition-colors" title="Approve">
                          {actionLoading === artifact.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button onClick={() => updateStatus(artifact.id, 'hidden')}
                          disabled={actionLoading === artifact.id}
                          className="p-2 bg-red-500/15 text-red-400 rounded-lg hover:bg-red-500/25 transition-colors" title="Reject">
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {tab === 'published' && (
                      <button onClick={() => updateStatus(artifact.id, 'hidden')}
                        disabled={actionLoading === artifact.id}
                        className="p-2 text-text-muted hover:text-red-400 rounded-lg transition-colors" title="Hide">
                        <EyeOff className="w-4 h-4" />
                      </button>
                    )}
                    {tab === 'hidden' && (
                      <button onClick={() => updateStatus(artifact.id, 'published')}
                        disabled={actionLoading === artifact.id}
                        className="p-2 text-text-muted hover:text-emerald-400 rounded-lg transition-colors" title="Republish">
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => deleteArtifact(artifact.id)}
                      disabled={actionLoading === artifact.id}
                      className="p-2 text-text-muted hover:text-red-500 rounded-lg transition-colors" title="Delete permanently">
                      <AlertTriangle className="w-4 h-4" />
                    </button>
                    <a href={`/archive/${artifact.id}`} target="_blank" rel="noopener"
                      className="p-2 text-text-muted hover:text-white rounded-lg transition-colors" title="View">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
