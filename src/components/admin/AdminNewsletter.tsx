import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Users, Send, Plus, X, Search, Tag, Clock, CheckCircle, Edit2, Trash2, BarChart3, Eye } from 'lucide-react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

interface Subscriber {
    id: string;
    email: string;
    name: string;
    segment: string;
    subscribedAt: any;
    status: 'active' | 'unsubscribed';
}

interface Campaign {
    id: string;
    subject: string;
    previewText: string;
    segment: string;
    status: 'draft' | 'scheduled' | 'sent';
    scheduledAt?: string;
    sentAt?: any;
    opens: number;
    clicks: number;
    recipients: number;
    createdAt: any;
}


const SEGMENTS = ['All', 'Readers', 'Book Clubs', 'Reviewers', 'Fantasy', 'Sci-Fi', 'Authors'];

type ViewMode = 'campaigns' | 'subscribers';

export default function AdminNewsletter() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [view, setView] = useState<ViewMode>('campaigns');
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [campaignForm, setCampaignForm] = useState({ subject: '', previewText: '', segment: 'All', scheduledAt: '' });

    useEffect(() => {
        const unsub1 = onSnapshot(collection(db, 'newsletterSubscribers'), snap => {
            setSubscribers(snap.docs.map(d => ({ id: d.id, ...d.data() } as Subscriber)));
        }, () => {});

        const unsub2 = onSnapshot(collection(db, 'newsletterCampaigns'), snap => {
            setCampaigns(snap.docs.map(d => ({ id: d.id, ...d.data() } as Campaign)));
        }, () => {});

        return () => { unsub1(); unsub2(); };
    }, []);

    const createCampaign = async () => {
        if (!campaignForm.subject.trim()) return;
        try {
            await addDoc(collection(db, 'newsletterCampaigns'), {
                ...campaignForm, status: campaignForm.scheduledAt ? 'scheduled' : 'draft',
                recipients: 0, opens: 0, clicks: 0, createdAt: serverTimestamp(),
            });
        } catch { /* local */ }
        setShowModal(false);
        setCampaignForm({ subject: '', previewText: '', segment: 'All', scheduledAt: '' });
    };

    const activeCount = subscribers.filter(s => s.status === 'active').length;
    const segmentCounts = SEGMENTS.reduce((acc, seg) => {
        acc[seg] = seg === 'All' ? subscribers.filter(s => s.status === 'active').length : subscribers.filter(s => s.segment === seg && s.status === 'active').length;
        return acc;
    }, {} as Record<string, number>);

    const filteredSubs = subscribers.filter(s => {
        if (!search) return true;
        const q = search.toLowerCase();
        return s.email.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="font-display text-3xl text-text-primary uppercase tracking-widest">Newsletter</h1>
                <div className="flex items-center gap-2">
                    <button onClick={() => setView('campaigns')} className={`flex items-center gap-1.5 px-3 py-2 font-ui text-xs uppercase tracking-wider rounded-sm ${view === 'campaigns' ? 'bg-starforge-gold text-void-black' : 'text-text-secondary border border-border'}`}>
                        <Send className="w-3.5 h-3.5" /> Campaigns
                    </button>
                    <button onClick={() => setView('subscribers')} className={`flex items-center gap-1.5 px-3 py-2 font-ui text-xs uppercase tracking-wider rounded-sm ${view === 'subscribers' ? 'bg-starforge-gold text-void-black' : 'text-text-secondary border border-border'}`}>
                        <Users className="w-3.5 h-3.5" /> Subscribers
                    </button>
                    <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-3 py-2 bg-starforge-gold text-void-black font-ui text-xs uppercase tracking-wider rounded-sm hover:bg-yellow-500 ml-2">
                        <Plus className="w-3.5 h-3.5" /> New Campaign
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-surface border border-border rounded-sm p-4">
                    <Mail className="w-4 h-4 text-starforge-gold mb-2" />
                    <p className="font-display text-2xl text-text-primary">{activeCount}</p>
                    <p className="font-ui text-[10px] text-text-muted uppercase">Active Subscribers</p>
                </div>
                <div className="bg-surface border border-border rounded-sm p-4">
                    <Send className="w-4 h-4 text-cosmic-purple mb-2" />
                    <p className="font-display text-2xl text-text-primary">{campaigns.filter(c => c.status === 'sent').length}</p>
                    <p className="font-ui text-[10px] text-text-muted uppercase">Campaigns Sent</p>
                </div>
                <div className="bg-surface border border-border rounded-sm p-4">
                    <Eye className="w-4 h-4 text-aurora-teal mb-2" />
                    <p className="font-display text-2xl text-text-primary">
                        {campaigns.reduce((s, c) => s + c.opens, 0) > 0 ? `${Math.round((campaigns.reduce((s, c) => s + c.opens, 0) / Math.max(campaigns.reduce((s, c) => s + c.recipients, 0), 1)) * 100)}%` : 'N/A'}
                    </p>
                    <p className="font-ui text-[10px] text-text-muted uppercase">Open Rate</p>
                </div>
                <div className="bg-surface border border-border rounded-sm p-4">
                    <Tag className="w-4 h-4 text-text-secondary mb-2" />
                    <p className="font-display text-2xl text-text-primary">{SEGMENTS.length - 1}</p>
                    <p className="font-ui text-[10px] text-text-muted uppercase">Segments</p>
                </div>
            </div>

            {/* Campaigns View */}
            {view === 'campaigns' && (
                <div className="space-y-3">
                    {campaigns.map(c => (
                        <div key={c.id} className="bg-surface border border-border rounded-sm p-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-heading text-sm text-text-primary">{c.subject}</h3>
                                    <p className="font-ui text-xs text-text-muted mt-0.5">{c.previewText}</p>
                                </div>
                                <span className={`font-ui text-[9px] uppercase tracking-wider px-2 py-1 rounded-sm ${c.status === 'sent' ? 'bg-aurora-teal/10 text-aurora-teal' : c.status === 'scheduled' ? 'bg-starforge-gold/10 text-starforge-gold' : 'bg-surface-elevated text-text-muted'
                                    }`}>{c.status}</span>
                            </div>
                            {c.status === 'sent' && (
                                <div className="flex gap-6 mt-3 pt-3 border-t border-border">
                                    <div><span className="font-ui text-[9px] text-text-muted block">Recipients</span><span className="font-mono text-xs text-text-primary">{c.recipients.toLocaleString()}</span></div>
                                    <div><span className="font-ui text-[9px] text-text-muted block">Opens</span><span className="font-mono text-xs text-aurora-teal">{c.opens.toLocaleString()} ({Math.round((c.opens / Math.max(c.recipients, 1)) * 100)}%)</span></div>
                                    <div><span className="font-ui text-[9px] text-text-muted block">Clicks</span><span className="font-mono text-xs text-starforge-gold">{c.clicks.toLocaleString()} ({Math.round((c.clicks / Math.max(c.recipients, 1)) * 100)}%)</span></div>
                                </div>
                            )}
                            <div className="flex items-center gap-2 mt-3">
                                <span className="font-ui text-[9px] text-text-muted"><Tag className="w-2.5 h-2.5 inline mr-1" />{c.segment}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Subscribers View */}
            {view === 'subscribers' && (
                <>
                    {/* Segment Chips */}
                    <div className="flex flex-wrap gap-2">
                        {SEGMENTS.map(seg => (
                            <span key={seg} className="px-3 py-1.5 bg-surface border border-border rounded-sm font-ui text-[10px] text-text-secondary">
                                {seg} <span className="text-text-muted ml-1">({segmentCounts[seg]})</span>
                            </span>
                        ))}
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input type="text" placeholder="Search subscribers..." value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full bg-surface border border-border rounded-sm pl-10 pr-4 py-2.5 text-text-primary font-ui text-sm outline-none focus:border-starforge-gold" />
                    </div>

                    <div className="bg-surface border border-border rounded-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead><tr className="bg-deep-space border-b border-border">
                                <th className="p-3 font-ui text-[10px] text-text-muted uppercase">Name</th>
                                <th className="p-3 font-ui text-[10px] text-text-muted uppercase">Email</th>
                                <th className="p-3 font-ui text-[10px] text-text-muted uppercase">Segment</th>
                                <th className="p-3 font-ui text-[10px] text-text-muted uppercase">Status</th>
                            </tr></thead>
                            <tbody>{filteredSubs.map(s => (
                                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-void-black/30">
                                    <td className="p-3 font-heading text-xs text-text-primary">{s.name}</td>
                                    <td className="p-3 font-ui text-xs text-text-secondary">{s.email}</td>
                                    <td className="p-3"><span className="font-ui text-[10px] text-cosmic-purple bg-cosmic-purple/10 px-2 py-0.5 rounded-sm">{s.segment}</span></td>
                                    <td className="p-3"><span className={`font-ui text-[10px] uppercase ${s.status === 'active' ? 'text-aurora-teal' : 'text-text-muted'}`}>{s.status}</span></td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                </>
            )}

            {/* New Campaign Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-void-black/80 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-surface border border-border rounded-sm p-6 max-w-lg w-full" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="font-heading text-xl text-text-primary">New Campaign</h2>
                                <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-text-muted" /></button>
                            </div>
                            <div className="space-y-3">
                                <input type="text" placeholder="Subject line" value={campaignForm.subject} onChange={e => setCampaignForm({ ...campaignForm, subject: e.target.value })}
                                    className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary text-sm font-ui outline-none focus:border-starforge-gold" />
                                <input type="text" placeholder="Preview text" value={campaignForm.previewText} onChange={e => setCampaignForm({ ...campaignForm, previewText: e.target.value })}
                                    className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary text-sm font-ui outline-none focus:border-starforge-gold" />
                                <select value={campaignForm.segment} onChange={e => setCampaignForm({ ...campaignForm, segment: e.target.value })}
                                    className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary text-sm font-ui outline-none appearance-none">
                                    {SEGMENTS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <div>
                                    <label className="font-ui text-[9px] text-text-muted uppercase block mb-1">Schedule (optional)</label>
                                    <input type="datetime-local" value={campaignForm.scheduledAt} onChange={e => setCampaignForm({ ...campaignForm, scheduledAt: e.target.value })}
                                        className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary text-sm font-ui outline-none focus:border-starforge-gold" />
                                </div>
                                <button onClick={createCampaign} className="w-full py-2 bg-starforge-gold text-void-black font-ui text-sm uppercase tracking-wider rounded-sm hover:bg-yellow-500">Create Campaign</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
