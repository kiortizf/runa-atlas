import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Check, Vote, Users, BookOpen, MessageCircle, BarChart3, RotateCcw } from 'lucide-react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';

type PollOption = { id: string; text: string; votes: number };

type Poll = {
  id: string;
  type: string;
  title: string;
  description: string;
  options: PollOption[];
  totalVotes: number;
  daysLeft: number;
};

type ReaderCircle = {
  id: string;
  name: string;
  focus: string;
  members: number;
  status: string;
  description: string;
  currentRead?: string;
  schedule?: string[];
};

type BookClubGuide = {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  discussionQuestions?: string[];
  readingSchedule?: { week: number; chapters: string; date?: string }[];
};

type QASession = {
  id: string;
  title: string;
  author: string;
  date: Timestamp;
  link: string;
  isPersistent?: boolean;
};

export default function AdminCommunity() {
  const [activeSubTab, setActiveSubTab] = useState<'polls' | 'circles' | 'guides' | 'qa'>('polls');

  const [polls, setPolls] = useState<Poll[]>([]);
  const [circles, setCircles] = useState<ReaderCircle[]>([]);
  const [guides, setGuides] = useState<BookClubGuide[]>([]);
  const [qaSessions, setQaSessions] = useState<QASession[]>([]);

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  // Poll options editor state
  const [pollOptions, setPollOptions] = useState<PollOption[]>([]);
  const [newOptionText, setNewOptionText] = useState('');

  // Guide questions & schedule
  const [guideQuestions, setGuideQuestions] = useState<string[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [guideSchedule, setGuideSchedule] = useState<{ week: number; chapters: string; date: string }[]>([]);

  // Circle schedule items
  const [circleSchedule, setCircleSchedule] = useState<string[]>([]);
  const [newScheduleItem, setNewScheduleItem] = useState('');

  useEffect(() => {
    const unsubPolls = onSnapshot(collection(db, 'polls'), s => setPolls(s.docs.map(d => ({ id: d.id, ...d.data() } as Poll))),
      e => handleFirestoreError(e, OperationType.LIST, 'polls'));
    const unsubCircles = onSnapshot(collection(db, 'readerCircles'), s => setCircles(s.docs.map(d => ({ id: d.id, ...d.data() } as ReaderCircle))),
      e => handleFirestoreError(e, OperationType.LIST, 'readerCircles'));
    const unsubGuides = onSnapshot(collection(db, 'bookClubGuides'), s => setGuides(s.docs.map(d => ({ id: d.id, ...d.data() } as BookClubGuide))),
      e => handleFirestoreError(e, OperationType.LIST, 'bookClubGuides'));
    const unsubQA = onSnapshot(collection(db, 'qaSessions'), s => { setQaSessions(s.docs.map(d => ({ id: d.id, ...d.data() } as QASession))); setLoading(false); },
      e => { handleFirestoreError(e, OperationType.LIST, 'qaSessions'); setLoading(false); });
    return () => { unsubPolls(); unsubCircles(); unsubGuides(); unsubQA(); };
  }, []);

  const handleSave = async () => {
    try {
      let collectionName = '';
      let dataToSave = { ...formData };
      delete dataToSave.id;

      if (activeSubTab === 'polls') {
        collectionName = 'polls';
        dataToSave.totalVotes = pollOptions.reduce((s, o) => s + o.votes, 0);
        dataToSave.daysLeft = Number(dataToSave.daysLeft) || 0;
        dataToSave.options = pollOptions.map((o, i) => ({
          id: o.id || `opt${i + 1}`,
          text: o.text,
          votes: Number(o.votes) || 0,
        }));
      } else if (activeSubTab === 'circles') {
        collectionName = 'readerCircles';
        dataToSave.members = Number(dataToSave.members) || 0;
        dataToSave.schedule = circleSchedule.filter(s => s.trim());
      } else if (activeSubTab === 'guides') {
        collectionName = 'bookClubGuides';
        dataToSave.discussionQuestions = guideQuestions.filter(q => q.trim());
        dataToSave.readingSchedule = guideSchedule.filter(s => s.chapters.trim());
      } else if (activeSubTab === 'qa') {
        collectionName = 'qaSessions';
        if (typeof dataToSave.date === 'string') {
          dataToSave.date = Timestamp.fromDate(new Date(dataToSave.date));
        }
        dataToSave.isPersistent = !!dataToSave.isPersistent;
      }

      if (editingId) {
        await updateDoc(doc(db, collectionName, editingId), dataToSave);
      } else {
        await addDoc(collection(db, collectionName), { ...dataToSave, createdAt: serverTimestamp() });
      }

      setIsEditing(false);
      setEditingId(null);
      setFormData({});
      setPollOptions([]);
    } catch (err: any) {
      handleFirestoreError(err, editingId ? OperationType.UPDATE : OperationType.CREATE, editingId ? `${activeSubTab}/${editingId}` : activeSubTab);
    }
  };

  const handleDelete = async (id: string, collectionName: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try { await deleteDoc(doc(db, collectionName, id)); } catch (err: any) {
        handleFirestoreError(err, OperationType.DELETE, `${collectionName}/${id}`);
      }
    }
  };

  const resetVotes = async (poll: Poll) => {
    if (!window.confirm(`Reset all votes on "${poll.title}"?`)) return;
    try {
      await updateDoc(doc(db, 'polls', poll.id), {
        options: poll.options.map(o => ({ ...o, votes: 0 })),
        totalVotes: 0,
      });
    } catch { /* ignore */ }
  };

  const startEdit = (item: any, type: string) => {
    const data = { ...item };
    if (type === 'qa' && item.date instanceof Timestamp) {
      const d = item.date.toDate();
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      data.date = d.toISOString().slice(0, 16);
    }
    setFormData(data);
    setEditingId(item.id);
    setIsEditing(true);

    if (type === 'polls') {
      setPollOptions(item.options || []);
    }
    if (type === 'guides') {
      setGuideQuestions(item.discussionQuestions || []);
      setGuideSchedule((item.readingSchedule || []).map((s: any) => ({ week: s.week, chapters: s.chapters, date: s.date || '' })));
    }
    if (type === 'circles') {
      setCircleSchedule(item.schedule || []);
    }
  };

  const startNew = () => {
    setFormData({});
    setEditingId(null);
    setIsEditing(true);
    setPollOptions([]);
    setGuideQuestions([]);
    setGuideSchedule([]);
    setCircleSchedule([]);
  };

  const addPollOption = () => {
    if (!newOptionText.trim()) return;
    setPollOptions(prev => [...prev, { id: `opt${prev.length + 1}`, text: newOptionText.trim(), votes: 0 }]);
    setNewOptionText('');
  };

  const removePollOption = (idx: number) => setPollOptions(prev => prev.filter((_, i) => i !== idx));

  const addGuideQuestion = () => {
    if (!newQuestion.trim()) return;
    setGuideQuestions(prev => [...prev, newQuestion.trim()]);
    setNewQuestion('');
  };

  const addScheduleWeek = () => {
    setGuideSchedule(prev => [...prev, { week: prev.length + 1, chapters: '', date: '' }]);
  };

  const addCircleScheduleItem = () => {
    if (!newScheduleItem.trim()) return;
    setCircleSchedule(prev => [...prev, newScheduleItem.trim()]);
    setNewScheduleItem('');
  };

  const inputCls = "w-full bg-void-black border border-border rounded-sm px-4 py-2 text-text-primary font-ui text-sm focus:outline-none focus:border-starforge-gold transition-colors";
  const labelCls = "block font-ui text-[10px] text-text-muted uppercase tracking-wider mb-1";

  if (loading) return <div className="text-text-primary">Loading community data...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-3xl text-text-primary uppercase tracking-widest">Community</h2>
        {!isEditing && (
          <button onClick={startNew} className="flex items-center gap-1.5 px-3 py-2 bg-starforge-gold text-void-black font-ui text-xs uppercase tracking-wider rounded-sm hover:bg-yellow-500">
            <Plus className="w-3.5 h-3.5" /> Add New
          </button>
        )}
      </div>

      {/* Sub-tabs */}
      {!isEditing && (
        <div className="flex gap-2 overflow-x-auto">
          {([
            { id: 'polls' as const, label: 'Polls', icon: Vote, count: polls.length },
            { id: 'circles' as const, label: 'Reader Circles', icon: Users, count: circles.length },
            { id: 'guides' as const, label: 'Guides', icon: BookOpen, count: guides.length },
            { id: 'qa' as const, label: 'Q&A Sessions', icon: MessageCircle, count: qaSessions.length },
          ]).map(tab => (
            <button key={tab.id} onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 font-ui text-xs uppercase tracking-wider rounded-sm whitespace-nowrap transition-colors ${activeSubTab === tab.id ? 'bg-starforge-gold text-void-black' : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
                }`}>
              <tab.icon className="w-3.5 h-3.5" /> {tab.label}
              <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded-sm ${activeSubTab === tab.id ? 'bg-void-black/20' : 'bg-surface-elevated'}`}>{tab.count}</span>
            </button>
          ))}
        </div>
      )}

      {/* ─── EDITING FORM ─── */}
      {isEditing ? (
        <div className="bg-surface border border-border p-6 rounded-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading text-xl text-text-primary">{editingId ? 'Edit' : 'New'} {activeSubTab === 'polls' ? 'Poll' : activeSubTab === 'circles' ? 'Reader Circle' : activeSubTab === 'guides' ? 'Book Club Guide' : 'Q&A Session'}</h3>
            <button onClick={() => setIsEditing(false)} className="text-text-muted hover:text-text-primary"><X className="w-5 h-5" /></button>
          </div>

          <div className="space-y-4">
            {/* ── Poll Form ── */}
            {activeSubTab === 'polls' && (
              <>
                <div>
                  <label className={labelCls}>Category / Type</label>
                  <input type="text" placeholder="e.g., Anthology Theme, Cover Design, Next Read" value={formData.type || ''} onChange={e => setFormData({ ...formData, type: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Title</label>
                  <input type="text" placeholder="Poll title" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea placeholder="What are readers voting on?" rows={3} value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} className={inputCls + ' resize-none'} />
                </div>
                <div>
                  <label className={labelCls}>Days Remaining</label>
                  <input type="number" min={0} placeholder="e.g., 14" value={formData.daysLeft || ''} onChange={e => setFormData({ ...formData, daysLeft: e.target.value })} className="w-32 bg-void-black border border-border rounded-sm px-4 py-2 text-text-primary font-ui text-sm focus:outline-none focus:border-starforge-gold" />
                </div>

                {/* Poll Options Builder */}
                <div className="border border-border rounded-sm p-4 bg-void-black/30">
                  <label className={labelCls}>Voting Options ({pollOptions.length})</label>
                  <div className="space-y-2 mb-3">
                    {pollOptions.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="font-mono text-xs text-text-muted w-6 text-center shrink-0">{i + 1}.</span>
                        <input type="text" value={opt.text} onChange={e => {
                          const updated = [...pollOptions];
                          updated[i] = { ...updated[i], text: e.target.value };
                          setPollOptions(updated);
                        }} className="flex-1 bg-deep-space border border-border rounded-sm px-3 py-1.5 text-text-primary font-ui text-sm outline-none focus:border-starforge-gold" />
                        <span className="font-mono text-[9px] text-text-muted w-12 text-right">{opt.votes} votes</span>
                        <button onClick={() => removePollOption(i)} className="text-text-muted hover:text-forge-red p-1"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    ))}
                    {pollOptions.length === 0 && <p className="font-ui text-xs text-text-muted text-center py-2">No options yet. Add at least 2.</p>}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={newOptionText} onChange={e => setNewOptionText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addPollOption())}
                      placeholder="Type an option and press Enter" className="flex-1 bg-deep-space border border-border rounded-sm px-3 py-1.5 text-text-primary font-ui text-sm outline-none focus:border-starforge-gold" />
                    <button onClick={addPollOption} className="px-3 py-1.5 bg-starforge-gold text-void-black font-ui text-[10px] uppercase rounded-sm hover:bg-yellow-500"><Plus className="w-3 h-3" /></button>
                  </div>
                </div>
              </>
            )}

            {/* ── Reader Circle Form ── */}
            {activeSubTab === 'circles' && (
              <>
                <div>
                  <label className={labelCls}>Circle Name</label>
                  <input type="text" placeholder="e.g., The Obsidian Spire" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Focus / Genre</label>
                    <input type="text" placeholder="e.g., Dark Fantasy & Horror" value={formData.focus || ''} onChange={e => setFormData({ ...formData, focus: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Status</label>
                    <select value={formData.status || ''} onChange={e => setFormData({ ...formData, status: e.target.value })} className={inputCls + ' appearance-none'}>
                      <option value="">Select Status</option>
                      <option value="Accepting Applications">Accepting Applications</option>
                      <option value="Waitlist">Waitlist</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Members Count</label>
                    <input type="number" min={0} placeholder="0" value={formData.members || ''} onChange={e => setFormData({ ...formData, members: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Currently Reading</label>
                    <input type="text" placeholder="e.g., The Hollow Crown by Maren Voss" value={formData.currentRead || ''} onChange={e => setFormData({ ...formData, currentRead: e.target.value })} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea rows={3} placeholder="Circle description..." value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} className={inputCls + ' resize-none'} />
                </div>

                {/* Schedule Items */}
                <div className="border border-border rounded-sm p-4 bg-void-black/30">
                  <label className={labelCls}>Reading Schedule</label>
                  <div className="space-y-2 mb-3">
                    {circleSchedule.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input type="text" value={item} onChange={e => {
                          const updated = [...circleSchedule];
                          updated[i] = e.target.value;
                          setCircleSchedule(updated);
                        }} className="flex-1 bg-deep-space border border-border rounded-sm px-3 py-1.5 text-text-primary font-ui text-sm outline-none focus:border-starforge-gold" />
                        <button onClick={() => setCircleSchedule(prev => prev.filter((_, j) => j !== i))} className="text-text-muted hover:text-forge-red p-1"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={newScheduleItem} onChange={e => setNewScheduleItem(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCircleScheduleItem())}
                      placeholder="e.g., Ch. 1-5 by Mar 15" className="flex-1 bg-deep-space border border-border rounded-sm px-3 py-1.5 text-text-primary font-ui text-sm outline-none focus:border-starforge-gold" />
                    <button onClick={addCircleScheduleItem} className="px-3 py-1.5 bg-starforge-gold text-void-black font-ui text-[10px] uppercase rounded-sm hover:bg-yellow-500"><Plus className="w-3 h-3" /></button>
                  </div>
                </div>
              </>
            )}

            {/* ── Guide Form ── */}
            {activeSubTab === 'guides' && (
              <>
                <div>
                  <label className={labelCls}>Guide Title</label>
                  <input type="text" placeholder="e.g., The Hollow Crown Discussion Kit" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea rows={2} value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} className={inputCls + ' resize-none'} placeholder="A complete guide for discussing..." />
                </div>
                <div>
                  <label className={labelCls}>Download File URL</label>
                  <input type="text" placeholder="https://..." value={formData.fileUrl || ''} onChange={e => setFormData({ ...formData, fileUrl: e.target.value })} className={inputCls} />
                </div>

                {/* Discussion Questions */}
                <div className="border border-border rounded-sm p-4 bg-void-black/30">
                  <label className={labelCls}>Discussion Questions ({guideQuestions.length})</label>
                  <div className="space-y-2 mb-3">
                    {guideQuestions.map((q, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="font-mono text-xs text-cosmic-purple w-6 text-center shrink-0 mt-1.5">{i + 1}.</span>
                        <input type="text" value={q} onChange={e => {
                          const updated = [...guideQuestions];
                          updated[i] = e.target.value;
                          setGuideQuestions(updated);
                        }} className="flex-1 bg-deep-space border border-border rounded-sm px-3 py-1.5 text-text-primary font-ui text-sm outline-none focus:border-starforge-gold" />
                        <button onClick={() => setGuideQuestions(prev => prev.filter((_, j) => j !== i))} className="text-text-muted hover:text-forge-red p-1 mt-0.5"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={newQuestion} onChange={e => setNewQuestion(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addGuideQuestion())}
                      placeholder="Add a discussion question..." className="flex-1 bg-deep-space border border-border rounded-sm px-3 py-1.5 text-text-primary font-ui text-sm outline-none focus:border-starforge-gold" />
                    <button onClick={addGuideQuestion} className="px-3 py-1.5 bg-starforge-gold text-void-black font-ui text-[10px] uppercase rounded-sm hover:bg-yellow-500"><Plus className="w-3 h-3" /></button>
                  </div>
                </div>

                {/* Reading Schedule */}
                <div className="border border-border rounded-sm p-4 bg-void-black/30">
                  <div className="flex items-center justify-between mb-3">
                    <label className={labelCls + ' mb-0'}>Reading Schedule ({guideSchedule.length} weeks)</label>
                    <button onClick={addScheduleWeek} className="font-ui text-[9px] text-starforge-gold uppercase hover:text-yellow-500">+ Add Week</button>
                  </div>
                  <div className="space-y-2">
                    {guideSchedule.map((s, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="font-mono text-xs text-cosmic-purple w-8 text-center shrink-0">W{s.week}</span>
                        <input type="text" value={s.chapters} placeholder="Chapters / Section"
                          onChange={e => {
                            const u = [...guideSchedule];
                            u[i] = { ...u[i], chapters: e.target.value };
                            setGuideSchedule(u);
                          }} className="flex-1 bg-deep-space border border-border rounded-sm px-3 py-1.5 text-text-primary font-ui text-sm outline-none focus:border-starforge-gold" />
                        <input type="text" value={s.date} placeholder="Date range"
                          onChange={e => {
                            const u = [...guideSchedule];
                            u[i] = { ...u[i], date: e.target.value };
                            setGuideSchedule(u);
                          }} className="w-36 bg-deep-space border border-border rounded-sm px-3 py-1.5 text-text-primary font-ui text-sm outline-none focus:border-starforge-gold" />
                        <button onClick={() => setGuideSchedule(prev => prev.filter((_, j) => j !== i))} className="text-text-muted hover:text-forge-red p-1"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── Q&A Form ── */}
            {activeSubTab === 'qa' && (
              <>
                <div>
                  <label className={labelCls}>Session Title</label>
                  <input type="text" placeholder="e.g., Worldbuilding in the Void" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Author</label>
                    <input type="text" placeholder="Author name" value={formData.author || ''} onChange={e => setFormData({ ...formData, author: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Date & Time</label>
                    <input type="datetime-local" value={formData.date || ''} onChange={e => setFormData({ ...formData, date: e.target.value })} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Join Link URL</label>
                  <input type="text" placeholder="https://..." value={formData.link || ''} onChange={e => setFormData({ ...formData, link: e.target.value })} className={inputCls} />
                </div>
                <div className="flex items-center gap-3 py-2">
                  <button onClick={() => setFormData({ ...formData, isPersistent: !formData.isPersistent })}
                    className={`w-10 h-5 rounded-full transition-colors relative ${formData.isPersistent ? 'bg-starforge-gold' : 'bg-border'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${formData.isPersistent ? 'left-5.5' : 'left-0.5'}`} />
                  </button>
                  <span className="font-ui text-sm text-text-primary">Persistent Q&A (questions remain visible after event)</span>
                </div>
              </>
            )}

            {/* Save / Cancel */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <button onClick={() => { setIsEditing(false); setFormData({}); }} className="px-4 py-2 border border-border text-text-muted font-ui text-xs uppercase tracking-wider rounded-sm hover:text-text-primary">Cancel</button>
              <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 bg-starforge-gold text-void-black font-ui text-xs uppercase tracking-wider rounded-sm hover:bg-yellow-500">
                <Check className="w-3.5 h-3.5" /> {editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ─── LIST VIEWS ─── */
        <div className="space-y-3">
          {/* Polls */}
          {activeSubTab === 'polls' && (
            <>
              {polls.length === 0 && <p className="text-center py-8 font-ui text-sm text-text-muted">No polls yet. Create your first poll above.</p>}
              {polls.map(poll => (
                <div key={poll.id} className="bg-surface border border-border rounded-sm p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-ui text-[9px] uppercase tracking-wider text-aurora-teal bg-aurora-teal/10 px-2 py-0.5 rounded-sm">{poll.type}</span>
                        <span className="font-mono text-[9px] text-text-muted">{poll.daysLeft}d left</span>
                      </div>
                      <h4 className="font-heading text-sm text-text-primary">{poll.title}</h4>
                      <p className="font-ui text-xs text-text-muted mt-0.5">{poll.description}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-3 shrink-0">
                      <button onClick={() => resetVotes(poll)} className="p-1.5 text-text-muted hover:text-starforge-gold transition-colors" title="Reset Votes"><RotateCcw className="w-3.5 h-3.5" /></button>
                      <button onClick={() => startEdit(poll, 'polls')} className="p-1.5 text-text-muted hover:text-starforge-gold transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(poll.id, 'polls')} className="p-1.5 text-text-muted hover:text-forge-red transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  {/* Show Options With Vote Bars */}
                  <div className="mt-3 space-y-1.5">
                    {poll.options?.map((opt) => {
                      const pct = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;
                      return (
                        <div key={opt.id} className="relative bg-void-black rounded-sm overflow-hidden">
                          <div className="absolute inset-y-0 left-0 bg-starforge-gold/10" style={{ width: `${pct}%` }} />
                          <div className="relative flex justify-between px-3 py-1.5">
                            <span className="font-ui text-[10px] text-text-secondary">{opt.text}</span>
                            <span className="font-mono text-[9px] text-starforge-gold">{opt.votes} ({pct}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="font-mono text-[9px] text-text-muted mt-2"><BarChart3 className="w-2.5 h-2.5 inline mr-1" />{poll.totalVotes} total votes</p>
                </div>
              ))}
            </>
          )}

          {/* Circles */}
          {activeSubTab === 'circles' && (
            <>
              {circles.length === 0 && <p className="text-center py-8 font-ui text-sm text-text-muted">No reader circles yet.</p>}
              {circles.map(circle => (
                <div key={circle.id} className="flex items-center justify-between p-4 bg-surface border border-border rounded-sm">
                  <div>
                    <h4 className="font-heading text-sm text-text-primary">{circle.name}</h4>
                    <p className="font-ui text-xs text-text-muted">{circle.focus} · {circle.members} members · {circle.status}</p>
                    {circle.currentRead && <p className="font-ui text-[9px] text-starforge-gold mt-0.5">Reading: {circle.currentRead}</p>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(circle, 'circles')} className="p-1.5 text-text-muted hover:text-starforge-gold"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(circle.id, 'readerCircles')} className="p-1.5 text-text-muted hover:text-forge-red"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Guides */}
          {activeSubTab === 'guides' && (
            <>
              {guides.length === 0 && <p className="text-center py-8 font-ui text-sm text-text-muted">No book club guides yet.</p>}
              {guides.map(guide => (
                <div key={guide.id} className="flex items-center justify-between p-4 bg-surface border border-border rounded-sm">
                  <div>
                    <h4 className="font-heading text-sm text-text-primary">{guide.title}</h4>
                    <p className="font-ui text-xs text-text-muted">
                      {guide.discussionQuestions?.length || 0} questions · {guide.readingSchedule?.length || 0} weeks
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(guide, 'guides')} className="p-1.5 text-text-muted hover:text-starforge-gold"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(guide.id, 'bookClubGuides')} className="p-1.5 text-text-muted hover:text-forge-red"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Q&A */}
          {activeSubTab === 'qa' && (
            <>
              {qaSessions.length === 0 && <p className="text-center py-8 font-ui text-sm text-text-muted">No Q&A sessions yet.</p>}
              {qaSessions.map(qa => (
                <div key={qa.id} className="flex items-center justify-between p-4 bg-surface border border-border rounded-sm">
                  <div>
                    <h4 className="font-heading text-sm text-text-primary">{qa.title}</h4>
                    <p className="font-ui text-xs text-text-muted">with {qa.author} {qa.isPersistent && <span className="text-cosmic-purple ml-1">· Persistent</span>}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(qa, 'qa')} className="p-1.5 text-text-muted hover:text-starforge-gold"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(qa.id, 'qaSessions')} className="p-1.5 text-text-muted hover:text-forge-red"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
