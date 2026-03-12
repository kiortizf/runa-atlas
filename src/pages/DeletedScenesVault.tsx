import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Archive, Eye, EyeOff, Trash2, Tag, Search, Lock, Unlock,
    BookOpen, ChevronDown, ChevronUp, Sparkles, Undo2,
    BarChart3, Filter, Clock, FileText
} from 'lucide-react';
import { useDeletedScenes, type DeletedScene } from '../hooks/useDeletedScenes';

const RATIONLE_COLORS: Record<string, string> = {
    'pacing-drag': '#f59e0b',
    'redundant-info': '#ef4444',
    'off-theme': '#8b5cf6',
    'word-count': '#06b6d4',
    'subplot-trim': '#ec4899',
    'simplification': '#10b981',
};

export default function DeletedScenesVault() {
    const { scenes, loading, publishAsBonus, unpublishBonus, updateTags, permanentlyDelete, restoreScene, stats } = useDeletedScenes();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPublished, setFilterPublished] = useState<'all' | 'published' | 'unpublished'>('all');
    const [filterManuscript, setFilterManuscript] = useState<string>('all');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [publishModal, setPublishModal] = useState<DeletedScene | null>(null);
    const [bonusTitle, setBonusTitle] = useState('');
    const [bonusDesc, setBonusDesc] = useState('');
    const [bonusGated, setBonusGated] = useState(true);
    const [newTag, setNewTag] = useState('');

    const filtered = scenes.filter(s => {
        if (filterPublished === 'published' && !s.publishedAsBonus) return false;
        if (filterPublished === 'unpublished' && s.publishedAsBonus) return false;
        if (filterManuscript !== 'all' && s.manuscriptTitle !== filterManuscript) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return s.originalText.toLowerCase().includes(q) ||
                s.chapterTitle.toLowerCase().includes(q) ||
                s.manuscriptTitle.toLowerCase().includes(q) ||
                s.bonusTitle?.toLowerCase().includes(q);
        }
        return true;
    });

    const manuscripts = [...new Set(scenes.map(s => s.manuscriptTitle))];

    return (
        <div className="min-h-screen bg-gradient-to-b from-void-black to-deep-space">
            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-display text-white flex items-center gap-3">
                            <Archive className="w-7 h-7 text-purple-400" />
                            Deleted Scenes Vault
                        </h1>
                        <p className="text-sm text-text-secondary mt-1">Archived editorial cuts — publishable as bonus content</p>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                        <div className="flex items-center gap-2 text-text-secondary mb-1">
                            <Archive className="w-4 h-4" />
                            <span className="text-[10px] uppercase tracking-wider font-semibold">Total Scenes</span>
                        </div>
                        <p className="text-2xl font-semibold text-white">{stats.total}</p>
                    </div>
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                        <div className="flex items-center gap-2 text-text-secondary mb-1">
                            <BookOpen className="w-4 h-4" />
                            <span className="text-[10px] uppercase tracking-wider font-semibold">Published</span>
                        </div>
                        <p className="text-2xl font-semibold text-emerald-400">{stats.published}</p>
                    </div>
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                        <div className="flex items-center gap-2 text-text-secondary mb-1">
                            <Lock className="w-4 h-4" />
                            <span className="text-[10px] uppercase tracking-wider font-semibold">Members Only</span>
                        </div>
                        <p className="text-2xl font-semibold text-amber-400">{stats.gated}</p>
                    </div>
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                        <div className="flex items-center gap-2 text-text-secondary mb-1">
                            <BarChart3 className="w-4 h-4" />
                            <span className="text-[10px] uppercase tracking-wider font-semibold">Words Archived</span>
                        </div>
                        <p className="text-2xl font-semibold text-purple-400">{stats.totalWords.toLocaleString()}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search deleted scenes..."
                            className="w-full pl-9 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-text-secondary focus:outline-none focus:border-purple-500/40"
                        />
                    </div>
                    <select value={filterPublished} onChange={e => setFilterPublished(e.target.value as any)}
                        className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none">
                        <option value="all">All Status</option>
                        <option value="published">Published</option>
                        <option value="unpublished">Unpublished</option>
                    </select>
                    <select value={filterManuscript} onChange={e => setFilterManuscript(e.target.value)}
                        className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none">
                        <option value="all">All Manuscripts</option>
                        {manuscripts.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>

                {/* Scene List */}
                <div className="space-y-3">
                    {filtered.map(scene => {
                        const isExpanded = expandedId === scene.id;
                        const wordCount = scene.originalText?.split(/\s+/).length || 0;
                        return (
                            <motion.div key={scene.id} layout
                                className={`bg-white/[0.02] border rounded-xl overflow-hidden transition-colors ${scene.publishedAsBonus ? 'border-emerald-500/20' : 'border-white/[0.06]'}`}>
                                {/* Card Header */}
                                <button onClick={() => setExpandedId(isExpanded ? null : scene.id)}
                                    className="w-full flex items-start gap-3 px-5 py-4 text-left hover:bg-white/[0.02] transition-colors">
                                    <div className="mt-1 shrink-0">
                                        {scene.publishedAsBonus
                                            ? <Sparkles className="w-4 h-4 text-emerald-400" />
                                            : <FileText className="w-4 h-4 text-text-secondary" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            {scene.publishedAsBonus && (
                                                <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                                                    {scene.membershipGated ? '🔒 Members' : '🌐 Public'} Bonus
                                                </span>
                                            )}
                                            <span className="text-[8px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded"
                                                style={{ color: RATIONLE_COLORS[scene.rationaleTag] || '#888', backgroundColor: (RATIONLE_COLORS[scene.rationaleTag] || '#888') + '15' }}>
                                                {scene.rationaleTag}
                                            </span>
                                        </div>
                                        <h3 className="text-sm font-medium text-white">
                                            {scene.publishedAsBonus && scene.bonusTitle ? scene.bonusTitle : `Cut from "${scene.chapterTitle}"`}
                                        </h3>
                                        <p className="text-[10px] text-text-secondary mt-0.5 flex items-center gap-2">
                                            <span>{scene.manuscriptTitle}</span>
                                            <span>·</span>
                                            <span>{wordCount} words</span>
                                            <span>·</span>
                                            <span>by {scene.authorName}</span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {scene.tags?.map(tag => (
                                            <span key={tag} className="text-[8px] px-1.5 py-0.5 rounded bg-white/[0.06] text-text-secondary">{tag}</span>
                                        ))}
                                        {isExpanded ? <ChevronUp className="w-4 h-4 text-text-secondary" /> : <ChevronDown className="w-4 h-4 text-text-secondary" />}
                                    </div>
                                </button>

                                {/* Expanded Content */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden">
                                            <div className="px-5 pb-5 space-y-4 border-t border-white/[0.04] pt-4">
                                                {/* Original text */}
                                                <div>
                                                    <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-2 font-semibold">Original Text</p>
                                                    <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-4 text-sm text-white/70 leading-relaxed max-h-64 overflow-y-auto whitespace-pre-wrap">
                                                        {scene.originalText}
                                                    </div>
                                                </div>

                                                {/* Editor's rationale */}
                                                <div className="flex gap-4">
                                                    <div className="flex-1">
                                                        <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-1 font-semibold">Editor&apos;s Rationale</p>
                                                        <p className="text-xs text-amber-400/80">{scene.rationale || 'No rationale provided'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-1 font-semibold">Archived</p>
                                                        <p className="text-xs text-text-secondary flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {scene.archivedAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Tags */}
                                                <div>
                                                    <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-2 font-semibold flex items-center gap-1">
                                                        <Tag className="w-3 h-3" /> Tags
                                                    </p>
                                                    <div className="flex flex-wrap gap-1.5 items-center">
                                                        {(scene.tags || []).map(tag => (
                                                            <span key={tag} className="text-[10px] px-2 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
                                                                {tag}
                                                                <button onClick={() => updateTags(scene.id, scene.tags.filter(t => t !== tag))}
                                                                    className="hover:text-red-400 transition-colors">×</button>
                                                            </span>
                                                        ))}
                                                        <div className="flex items-center gap-1">
                                                            <input value={newTag} onChange={e => setNewTag(e.target.value)} placeholder="Add tag"
                                                                className="px-2 py-1 bg-white/[0.04] border border-white/[0.06] rounded text-[10px] text-white w-20 focus:outline-none"
                                                                onKeyDown={e => {
                                                                    if (e.key === 'Enter' && newTag.trim()) {
                                                                        updateTags(scene.id, [...(scene.tags || []), newTag.trim()]);
                                                                        setNewTag('');
                                                                    }
                                                                }} />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Bonus content settings */}
                                                {scene.publishedAsBonus && (
                                                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3 space-y-2">
                                                        <p className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">Published as Bonus Content</p>
                                                        <p className="text-sm text-white font-medium">{scene.bonusTitle}</p>
                                                        <p className="text-xs text-text-secondary">{scene.bonusDescription}</p>
                                                        <div className="flex items-center gap-2 text-[10px]">
                                                            {scene.membershipGated
                                                                ? <span className="flex items-center gap-1 text-amber-400"><Lock className="w-3 h-3" /> Members Only</span>
                                                                : <span className="flex items-center gap-1 text-emerald-400"><Unlock className="w-3 h-3" /> Public</span>}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Actions */}
                                                <div className="flex flex-wrap gap-2 pt-2">
                                                    {!scene.publishedAsBonus ? (
                                                        <button onClick={() => { setPublishModal(scene); setBonusTitle(`Deleted Scene: ${scene.chapterTitle}`); setBonusDesc(''); setBonusGated(true); }}
                                                            className="flex items-center gap-1.5 px-3 py-2 text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                                                            <Sparkles className="w-3 h-3" /> Publish as Bonus
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => unpublishBonus(scene.id)}
                                                            className="flex items-center gap-1.5 px-3 py-2 text-xs bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 hover:bg-amber-500/20 transition-colors">
                                                            <EyeOff className="w-3 h-3" /> Unpublish
                                                        </button>
                                                    )}
                                                    <button onClick={() => restoreScene(scene.id)}
                                                        className="flex items-center gap-1.5 px-3 py-2 text-xs bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-colors">
                                                        <Undo2 className="w-3 h-3" /> Request Restore
                                                    </button>
                                                    <button onClick={() => { if (confirm('Permanently delete this scene? This cannot be undone.')) permanentlyDelete(scene.id); }}
                                                        className="flex items-center gap-1.5 px-3 py-2 text-xs bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors">
                                                        <Trash2 className="w-3 h-3" /> Delete Forever
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>

                {filtered.length === 0 && !loading && (
                    <div className="text-center py-16">
                        <Archive className="w-12 h-12 text-purple-400/20 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-white mb-1">No Deleted Scenes</h3>
                        <p className="text-sm text-text-secondary">
                            {scenes.length === 0
                                ? 'When editors archive manuscript cuts via the Diplomatic Cuts tool, they appear here.'
                                : 'No scenes match your current filters.'}
                        </p>
                    </div>
                )}

                {loading && (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-6 h-6 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                    </div>
                )}
            </div>

            {/* Publish Modal */}
            <AnimatePresence>
                {publishModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setPublishModal(null)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-deep-space border border-white/[0.08] rounded-2xl p-6 w-full max-w-md"
                            onClick={e => e.stopPropagation()}>
                            <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-emerald-400" /> Publish as Bonus Content
                            </h3>
                            <p className="text-xs text-text-secondary mb-4">This will make the deleted scene available to readers.</p>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold block mb-1">Title</label>
                                    <input value={bonusTitle} onChange={e => setBonusTitle(e.target.value)}
                                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/40" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold block mb-1">Description</label>
                                    <textarea value={bonusDesc} onChange={e => setBonusDesc(e.target.value)} rows={3}
                                        placeholder="Brief context for readers about this scene..."
                                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder:text-text-secondary focus:outline-none focus:border-emerald-500/40 resize-none" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setBonusGated(!bonusGated)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs border transition-colors ${bonusGated ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                                        {bonusGated ? <><Lock className="w-3 h-3" /> Members Only</> : <><Unlock className="w-3 h-3" /> Public</>}
                                    </button>
                                    <span className="text-[10px] text-text-secondary flex-1">
                                        {bonusGated ? 'Only paid members can read this scene' : 'Anyone can read this scene'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-6">
                                <button onClick={() => setPublishModal(null)}
                                    className="flex-1 px-4 py-2.5 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-text-secondary hover:text-white transition-colors">
                                    Cancel
                                </button>
                                <button onClick={() => {
                                    if (publishModal) {
                                        publishAsBonus(publishModal.id, bonusTitle, bonusDesc, bonusGated);
                                        setPublishModal(null);
                                    }
                                }}
                                    className="flex-1 px-4 py-2.5 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition-colors font-medium">
                                    Publish
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
