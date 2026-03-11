import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Flag, Trash2, UserPlus, Download, BarChart3, ChevronDown, CheckSquare, Square, MoreVertical } from 'lucide-react';
import { collection, onSnapshot, query, orderBy, updateDoc, doc, Timestamp, writeBatch } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { STATUS_MAP, QUEUE_TABS, normalizeStatus, type EditorSubmission, type SubmissionStatus, STATUSES } from './submissionLifecycle';
import SubmissionDetail from './SubmissionDetail';

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<EditorSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeQueue, setActiveQueue] = useState('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailSub, setDetailSub] = useState<EditorSubmission | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [batchAction, setBatchAction] = useState('');

  // ─── Load Submissions ─────────────────────────────
  useEffect(() => {
    const q = query(collection(db, 'submissions'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const subs = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id, ...data,
          status: normalizeStatus(data.status || 'received'),
          wordCount: data.wordCount || 0,
          title: data.title || 'Untitled',
          authorName: data.authorName || 'Unknown',
          email: data.email || '',
          genre: data.genre || '',
        } as EditorSubmission;
      });
      setSubmissions(subs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'submissions');
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // ─── Filtering ────────────────────────────────────
  const activeTab = QUEUE_TABS.find(t => t.id === activeQueue) || QUEUE_TABS[7];
  const filtered = useMemo(() => {
    let list = submissions.filter(s => s.status !== 'draft' as any);
    if (activeTab.phases.length > 0) {
      list = list.filter(s => activeTab.phases.includes(STATUS_MAP[s.status]?.phase || ''));
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(s =>
        s.title.toLowerCase().includes(term) ||
        s.authorName.toLowerCase().includes(term) ||
        (s.trackingId || '').toLowerCase().includes(term) ||
        (s.assignedTo || '').toLowerCase().includes(term)
      );
    }
    return list;
  }, [submissions, activeTab, searchTerm]);

  // ─── Queue Counts ─────────────────────────────────
  const queueCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const nonDraft = submissions.filter(s => s.status !== 'draft' as any);
    QUEUE_TABS.forEach(tab => {
      if (tab.phases.length === 0) counts[tab.id] = nonDraft.length;
      else counts[tab.id] = nonDraft.filter(s => tab.phases.includes(STATUS_MAP[s.status]?.phase || '')).length;
    });
    return counts;
  }, [submissions]);

  // ─── Selection ────────────────────────────────────
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const selectAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map(s => s.id)));
  };

  // ─── Status Change ────────────────────────────────
  const changeStatus = async (id: string, status: SubmissionStatus) => {
    try {
      await updateDoc(doc(db, 'submissions', id), { status });
      if (detailSub?.id === id) setDetailSub(prev => prev ? { ...prev, status } : null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `submissions/${id}`);
    }
  };

  const updateSubmission = async (id: string, data: Partial<EditorSubmission>) => {
    try {
      await updateDoc(doc(db, 'submissions', id), data as Record<string, any>);
      if (detailSub?.id === id) setDetailSub(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `submissions/${id}`);
    }
  };

  // ─── Batch Actions ────────────────────────────────
  const executeBatch = async () => {
    if (!batchAction || selectedIds.size === 0) return;
    if (batchAction === 'export') {
      const rows = filtered.filter(s => selectedIds.has(s.id));
      const csv = [
        ['Tracking ID', 'Title', 'Author', 'Genre', 'Words', 'Status', 'Submitted'].join(','),
        ...rows.map(s => [s.trackingId || s.id.slice(0, 10), `"${s.title}"`, `"${s.authorName}"`, s.genre, s.wordCount, s.status, getDate(s.createdAt)].join(','))
      ].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'submissions_export.csv'; a.click();
      URL.revokeObjectURL(url);
    } else if (STATUSES.includes(batchAction as SubmissionStatus)) {
      const batch = writeBatch(db);
      selectedIds.forEach(id => batch.update(doc(db, 'submissions', id), { status: batchAction }));
      await batch.commit();
    }
    setSelectedIds(new Set()); setBatchAction('');
  };

  // ─── Analytics ────────────────────────────────────
  const analytics = useMemo(() => {
    const nonDraft = submissions.filter(s => s.status !== 'draft' as any);
    const statusCounts: Record<string, number> = {};
    const genreCounts: Record<string, number> = {};
    const editorCounts: Record<string, number> = {};
    nonDraft.forEach(s => {
      statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;
      if (s.genre) genreCounts[s.genre] = (genreCounts[s.genre] || 0) + 1;
      if (s.assignedTo) editorCounts[s.assignedTo] = (editorCounts[s.assignedTo] || 0) + 1;
    });
    const maxStatus = Math.max(...Object.values(statusCounts), 1);
    const maxGenre = Math.max(...Object.values(genreCounts), 1);
    const maxEditor = Math.max(...Object.values(editorCounts), 1);
    return { total: nonDraft.length, statusCounts, genreCounts, editorCounts, maxStatus, maxGenre, maxEditor };
  }, [submissions]);

  const getDate = (d: any) => {
    if (!d) return 'N/A';
    if (d instanceof Timestamp) return d.toDate().toLocaleDateString();
    if (d?.seconds) return new Date(d.seconds * 1000).toLocaleDateString();
    return 'N/A';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="font-display text-3xl text-text-primary uppercase tracking-widest">Manuscript Pipeline</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowAnalytics(!showAnalytics)}
            className={`flex items-center gap-2 px-4 py-2 rounded-sm font-ui text-xs uppercase tracking-wider transition-colors border ${showAnalytics ? 'border-starforge-gold text-starforge-gold bg-starforge-gold/5' : 'border-border text-text-secondary hover:text-text-primary'
              }`}>
            <BarChart3 className="w-4 h-4" /> Analytics
          </button>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search..."
              className="w-full bg-surface border border-border rounded-sm py-2 pl-10 pr-4 text-sm text-text-primary focus:outline-none focus:border-starforge-gold/50 font-ui" />
          </div>
        </div>
      </div>

      {/* Analytics Panel */}
      <AnimatePresence>
        {showAnalytics && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-surface border border-border rounded-sm">
              {/* Funnel */}
              <div>
                <h3 className="font-ui text-[10px] uppercase tracking-wider text-text-muted mb-3">Submission Funnel</h3>
                <div className="space-y-1.5">
                  {STATUSES.filter(s => analytics.statusCounts[s]).map(s => {
                    const cfg = STATUS_MAP[s]; const count = analytics.statusCounts[s];
                    return (
                      <div key={s} className="flex items-center gap-2">
                        <span className="font-ui text-[9px] text-text-muted w-24 truncate text-right">{cfg.label}</span>
                        <div className="flex-1 h-4 bg-void-black rounded-sm overflow-hidden">
                          <div className={`h-full ${cfg.bg} border-r border-current ${cfg.color} transition-all`}
                            style={{ width: `${(count / analytics.maxStatus) * 100}%` }} />
                        </div>
                        <span className="font-mono text-[10px] text-text-secondary w-6 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Genre Breakdown */}
              <div>
                <h3 className="font-ui text-[10px] uppercase tracking-wider text-text-muted mb-3">Genre Breakdown</h3>
                <div className="space-y-1.5">
                  {Object.entries(analytics.genreCounts).sort((a, b) => b[1] - a[1]).map(([genre, count]) => (
                    <div key={genre} className="flex items-center gap-2">
                      <span className="font-ui text-[9px] text-text-muted w-24 truncate text-right capitalize">{genre}</span>
                      <div className="flex-1 h-4 bg-void-black rounded-sm overflow-hidden">
                        <div className="h-full bg-cosmic-purple/30 border-r border-cosmic-purple transition-all"
                          style={{ width: `${(count / analytics.maxGenre) * 100}%` }} />
                      </div>
                      <span className="font-mono text-[10px] text-text-secondary w-6 text-right">{count}</span>
                    </div>
                  ))}
                  {Object.keys(analytics.genreCounts).length === 0 && <p className="font-ui text-xs text-text-muted">No data</p>}
                </div>
              </div>
              {/* Editor Workload */}
              <div>
                <h3 className="font-ui text-[10px] uppercase tracking-wider text-text-muted mb-3">Editor Workload</h3>
                <div className="space-y-1.5">
                  {Object.entries(analytics.editorCounts).sort((a, b) => b[1] - a[1]).map(([editor, count]) => (
                    <div key={editor} className="flex items-center gap-2">
                      <span className="font-ui text-[9px] text-text-muted w-24 truncate text-right">{editor}</span>
                      <div className="flex-1 h-4 bg-void-black rounded-sm overflow-hidden">
                        <div className="h-full bg-aurora-teal/30 border-r border-aurora-teal transition-all"
                          style={{ width: `${(count / analytics.maxEditor) * 100}%` }} />
                      </div>
                      <span className="font-mono text-[10px] text-text-secondary w-6 text-right">{count}</span>
                    </div>
                  ))}
                  {Object.keys(analytics.editorCounts).length === 0 && <p className="font-ui text-xs text-text-muted">No assignments</p>}
                </div>
                <div className="mt-4 pt-3 border-t border-border">
                  <div className="flex justify-between">
                    <span className="font-ui text-[10px] text-text-muted">Total Submissions</span>
                    <span className="font-display text-lg text-text-primary">{analytics.total}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Queue Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {QUEUE_TABS.map(tab => (
          <button key={tab.id} onClick={() => { setActiveQueue(tab.id); setSelectedIds(new Set()); }}
            className={`px-3 py-2 font-ui text-[10px] uppercase tracking-wider whitespace-nowrap rounded-sm transition-colors flex items-center gap-1.5 ${activeQueue === tab.id ? 'bg-starforge-gold text-void-black font-semibold' : 'text-text-secondary hover:bg-surface hover:text-text-primary'
              }`}>
            {tab.label}
            <span className={`ml-0.5 text-[9px] ${activeQueue === tab.id ? 'text-void-black/70' : 'text-text-muted'}`}>
              {queueCounts[tab.id] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Batch Toolbar */}
      {selectedIds.size > 0 && (
        <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-3 p-3 bg-surface border border-starforge-gold/20 rounded-sm">
          <span className="font-ui text-xs text-starforge-gold">{selectedIds.size} selected</span>
          <select value={batchAction} onChange={e => setBatchAction(e.target.value)}
            className="bg-void-black border border-border rounded-sm px-3 py-1.5 text-text-primary text-xs font-ui outline-none appearance-none">
            <option value="">Batch action...</option>
            <option value="declined">Decline Selected</option>
            <option value="first_read">Move to First Read</option>
            <option value="second_read">Move to Second Read</option>
            <option value="export">Export as CSV</option>
          </select>
          <button onClick={executeBatch} disabled={!batchAction}
            className="px-3 py-1.5 bg-starforge-gold text-void-black font-ui text-[10px] uppercase tracking-wider rounded-sm hover:bg-yellow-500 disabled:opacity-50 transition-colors">
            Apply
          </button>
          <button onClick={() => setSelectedIds(new Set())} className="text-text-muted hover:text-text-primary font-ui text-[10px] ml-auto">
            Clear
          </button>
        </motion.div>
      )}

      {/* Table */}
      <div className="bg-surface border border-border rounded-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-deep-space">
              <th className="p-3 w-10">
                <button onClick={selectAll} className="text-text-muted hover:text-starforge-gold">
                  {selectedIds.size === filtered.length && filtered.length > 0 ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                </button>
              </th>
              <th className="p-3 font-ui text-[10px] text-text-muted uppercase tracking-wider">Title & Author</th>
              <th className="p-3 font-ui text-[10px] text-text-muted uppercase tracking-wider">Genre</th>
              <th className="p-3 font-ui text-[10px] text-text-muted uppercase tracking-wider">Words</th>
              <th className="p-3 font-ui text-[10px] text-text-muted uppercase tracking-wider">Status</th>
              <th className="p-3 font-ui text-[10px] text-text-muted uppercase tracking-wider">Assigned</th>
              <th className="p-3 font-ui text-[10px] text-text-muted uppercase tracking-wider">Date</th>
              <th className="p-3 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(sub => {
              const cfg = STATUS_MAP[sub.status];
              const StatusIcon = cfg.icon;
              return (
                <tr key={sub.id} className="border-b border-border last:border-0 hover:bg-void-black/30 transition-colors cursor-pointer"
                  onClick={() => setDetailSub(sub)}>
                  <td className="p-3" onClick={e => { e.stopPropagation(); toggleSelect(sub.id); }}>
                    {selectedIds.has(sub.id) ? <CheckSquare className="w-4 h-4 text-starforge-gold" /> : <Square className="w-4 h-4 text-text-muted" />}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {sub.priority && <Flag className="w-3 h-3 text-forge-red fill-forge-red shrink-0" />}
                      <div className="min-w-0">
                        <p className="font-heading text-sm text-text-primary truncate">{sub.title}</p>
                        <p className="font-ui text-[10px] text-text-muted truncate">{sub.authorName} · {sub.trackingId || sub.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-ui text-xs text-starforge-gold uppercase tracking-wider">{sub.genre}</td>
                  <td className="p-3 font-ui text-xs text-text-secondary">{sub.wordCount?.toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-semibold ${cfg.bg} ${cfg.color}`}>
                      <StatusIcon className="w-2.5 h-2.5" /> {cfg.label}
                    </span>
                  </td>
                  <td className="p-3 font-ui text-xs text-text-muted truncate max-w-24">{sub.assignedTo || 'N/A'}</td>
                  <td className="p-3 font-ui text-xs text-text-secondary">{getDate(sub.createdAt)}</td>
                  <td className="p-3">
                    <button onClick={e => { e.stopPropagation(); setDetailSub(sub); }}
                      className="text-text-muted hover:text-starforge-gold transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && !loading && (
              <tr><td colSpan={8} className="p-8 text-center text-text-muted font-ui text-sm">
                {searchTerm ? 'No results found.' : 'No submissions in this queue.'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Panel */}
      <AnimatePresence>
        {detailSub && (
          <SubmissionDetail
            submission={detailSub}
            onClose={() => setDetailSub(null)}
            onStatusChange={changeStatus}
            onUpdate={updateSubmission}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
