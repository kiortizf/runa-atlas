import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Check, Vote, Users, BookOpen, MessageCircle } from 'lucide-react';
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
};

type BookClubGuide = {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
};

type QASession = {
  id: string;
  title: string;
  author: string;
  date: Timestamp;
  link: string;
};

export default function AdminCommunity() {
  const [activeSubTab, setActiveSubTab] = useState<'polls' | 'circles' | 'guides' | 'qa'>('polls');
  
  // Data States
  const [polls, setPolls] = useState<Poll[]>([]);
  const [circles, setCircles] = useState<ReaderCircle[]>([]);
  const [guides, setGuides] = useState<BookClubGuide[]>([]);
  const [qaSessions, setQaSessions] = useState<QASession[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Generic Form State (could be broken down, but keeping it simple for now)
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    const unsubPolls = onSnapshot(collection(db, 'polls'), (snapshot) => {
      setPolls(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Poll)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'polls'));

    const unsubCircles = onSnapshot(collection(db, 'readerCircles'), (snapshot) => {
      setCircles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ReaderCircle)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'readerCircles'));

    const unsubGuides = onSnapshot(collection(db, 'bookClubGuides'), (snapshot) => {
      setGuides(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BookClubGuide)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'bookClubGuides'));

    const unsubQA = onSnapshot(collection(db, 'qaSessions'), (snapshot) => {
      setQaSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QASession)));
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'qaSessions');
      setLoading(false);
    });

    return () => {
      unsubPolls();
      unsubCircles();
      unsubGuides();
      unsubQA();
    };
  }, []);

  const handleSave = async () => {
    try {
      let collectionName = '';
      let dataToSave = { ...formData };

      if (activeSubTab === 'polls') {
        collectionName = 'polls';
        dataToSave.totalVotes = Number(dataToSave.totalVotes) || 0;
        dataToSave.daysLeft = Number(dataToSave.daysLeft) || 0;
      } else if (activeSubTab === 'circles') {
        collectionName = 'readerCircles';
        dataToSave.members = Number(dataToSave.members) || 0;
      } else if (activeSubTab === 'guides') {
        collectionName = 'bookClubGuides';
      } else if (activeSubTab === 'qa') {
        collectionName = 'qaSessions';
        // Ensure date is a Timestamp if it's a string from the input
        if (typeof dataToSave.date === 'string') {
          dataToSave.date = Timestamp.fromDate(new Date(dataToSave.date));
        }
      }

      if (editingId) {
        await updateDoc(doc(db, collectionName, editingId), dataToSave);
      } else {
        await addDoc(collection(db, collectionName), {
          ...dataToSave,
          createdAt: serverTimestamp()
        });
      }

      setIsEditing(false);
      setEditingId(null);
      setFormData({});
    } catch (err: any) {
      handleFirestoreError(err, editingId ? OperationType.UPDATE : OperationType.CREATE, editingId ? `${activeSubTab}/${editingId}` : activeSubTab);
    }
  };

  const handleDelete = async (id: string, collectionName: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteDoc(doc(db, collectionName, id));
      } catch (err: any) {
        handleFirestoreError(err, OperationType.DELETE, `${collectionName}/${id}`);
      }
    }
  };

  const startEdit = (item: any, type: string) => {
    setFormData({ ...item });
    if (type === 'qa' && item.date instanceof Timestamp) {
      // Convert timestamp to string for datetime-local input
      const d = item.date.toDate();
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      setFormData({ ...item, date: d.toISOString().slice(0, 16) });
    }
    setEditingId(item.id);
    setIsEditing(true);
  };

  const startNew = () => {
    setFormData({});
    setEditingId(null);
    setIsEditing(true);
  };

  if (loading) return <div className="text-text-primary">Loading community data...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h2 className="font-heading text-2xl text-text-primary">Community CMS</h2>
        {!isEditing && (
          <button 
            onClick={startNew}
            className="flex items-center gap-2 px-4 py-2 bg-aurora-teal/20 text-aurora-teal font-ui text-sm uppercase tracking-wider rounded-sm hover:bg-aurora-teal/30 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add New
          </button>
        )}
      </div>

      {error && (
        <div className="bg-forge-red/20 border border-forge-red text-forge-red p-4 rounded-sm font-ui text-sm">
          {error}
        </div>
      )}

      {/* Sub-tabs */}
      {!isEditing && (
        <div className="flex gap-4 border-b border-border pb-4">
          <button onClick={() => setActiveSubTab('polls')} className={`flex items-center gap-2 px-4 py-2 font-ui text-sm uppercase tracking-wider rounded-sm transition-colors ${activeSubTab === 'polls' ? 'bg-surface border border-border text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
            <Vote className="w-4 h-4" /> Polls
          </button>
          <button onClick={() => setActiveSubTab('circles')} className={`flex items-center gap-2 px-4 py-2 font-ui text-sm uppercase tracking-wider rounded-sm transition-colors ${activeSubTab === 'circles' ? 'bg-surface border border-border text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
            <Users className="w-4 h-4" /> Reader Circles
          </button>
          <button onClick={() => setActiveSubTab('guides')} className={`flex items-center gap-2 px-4 py-2 font-ui text-sm uppercase tracking-wider rounded-sm transition-colors ${activeSubTab === 'guides' ? 'bg-surface border border-border text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
            <BookOpen className="w-4 h-4" /> Guides
          </button>
          <button onClick={() => setActiveSubTab('qa')} className={`flex items-center gap-2 px-4 py-2 font-ui text-sm uppercase tracking-wider rounded-sm transition-colors ${activeSubTab === 'qa' ? 'bg-surface border border-border text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
            <MessageCircle className="w-4 h-4" /> Q&A Sessions
          </button>
        </div>
      )}

      {/* Editing Form */}
      {isEditing ? (
        <div className="bg-surface border border-border p-6 rounded-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading text-xl text-text-primary">{editingId ? 'Edit' : 'New'} Item</h3>
            <button onClick={() => setIsEditing(false)} className="text-text-muted hover:text-text-primary">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {activeSubTab === 'polls' && (
              <>
                <input type="text" placeholder="Type (e.g., Anthology Theme)" value={formData.type || ''} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-void-black border border-border rounded-sm px-4 py-2 text-text-primary font-ui focus:outline-none focus:border-aurora-teal" />
                <input type="text" placeholder="Title" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-void-black border border-border rounded-sm px-4 py-2 text-text-primary font-ui focus:outline-none focus:border-aurora-teal" />
                <textarea placeholder="Description" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-void-black border border-border rounded-sm px-4 py-2 text-text-primary font-ui focus:outline-none focus:border-aurora-teal h-24" />
                <div className="flex gap-4">
                  <input type="number" placeholder="Days Left" value={formData.daysLeft || ''} onChange={e => setFormData({...formData, daysLeft: e.target.value})} className="w-1/2 bg-void-black border border-border rounded-sm px-4 py-2 text-text-primary font-ui focus:outline-none focus:border-aurora-teal" />
                  <input type="number" placeholder="Total Votes" value={formData.totalVotes || ''} onChange={e => setFormData({...formData, totalVotes: e.target.value})} className="w-1/2 bg-void-black border border-border rounded-sm px-4 py-2 text-text-primary font-ui focus:outline-none focus:border-aurora-teal" />
                </div>
                {/* Simplified options editor for demo */}
                <div className="p-4 border border-border bg-void-black rounded-sm">
                  <p className="text-sm text-text-muted mb-2">Options (JSON format for demo)</p>
                  <textarea 
                    value={formData.options ? JSON.stringify(formData.options, null, 2) : '[\n  { "id": "a", "text": "Option 1", "votes": 0 }\n]'} 
                    onChange={e => {
                      try {
                        setFormData({...formData, options: JSON.parse(e.target.value)});
                      } catch (err) {
                        // Ignore parse errors while typing
                      }
                    }}
                    className="w-full bg-deep-space border border-border rounded-sm px-4 py-2 text-text-primary font-mono text-xs h-32 focus:outline-none focus:border-aurora-teal" 
                  />
                </div>
              </>
            )}

            {activeSubTab === 'circles' && (
              <>
                <input type="text" placeholder="Name" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-void-black border border-border rounded-sm px-4 py-2 text-text-primary font-ui focus:outline-none focus:border-aurora-teal" />
                <input type="text" placeholder="Focus (e.g., Epic Fantasy)" value={formData.focus || ''} onChange={e => setFormData({...formData, focus: e.target.value})} className="w-full bg-void-black border border-border rounded-sm px-4 py-2 text-text-primary font-ui focus:outline-none focus:border-aurora-teal" />
                <div className="flex gap-4">
                  <input type="number" placeholder="Members" value={formData.members || ''} onChange={e => setFormData({...formData, members: e.target.value})} className="w-1/2 bg-void-black border border-border rounded-sm px-4 py-2 text-text-primary font-ui focus:outline-none focus:border-aurora-teal" />
                  <select value={formData.status || ''} onChange={e => setFormData({...formData, status: e.target.value})} className="w-1/2 bg-void-black border border-border rounded-sm px-4 py-2 text-text-primary font-ui focus:outline-none focus:border-aurora-teal">
                    <option value="">Select Status</option>
                    <option value="Accepting Applications">Accepting Applications</option>
                    <option value="Waitlist">Waitlist</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <textarea placeholder="Description" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-void-black border border-border rounded-sm px-4 py-2 text-text-primary font-ui focus:outline-none focus:border-aurora-teal h-24" />
              </>
            )}

            {activeSubTab === 'guides' && (
              <>
                <input type="text" placeholder="Title" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-void-black border border-border rounded-sm px-4 py-2 text-text-primary font-ui focus:outline-none focus:border-aurora-teal" />
                <input type="text" placeholder="File URL" value={formData.fileUrl || ''} onChange={e => setFormData({...formData, fileUrl: e.target.value})} className="w-full bg-void-black border border-border rounded-sm px-4 py-2 text-text-primary font-ui focus:outline-none focus:border-aurora-teal" />
                <textarea placeholder="Description" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-void-black border border-border rounded-sm px-4 py-2 text-text-primary font-ui focus:outline-none focus:border-aurora-teal h-24" />
              </>
            )}

            {activeSubTab === 'qa' && (
              <>
                <input type="text" placeholder="Title" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-void-black border border-border rounded-sm px-4 py-2 text-text-primary font-ui focus:outline-none focus:border-aurora-teal" />
                <input type="text" placeholder="Author" value={formData.author || ''} onChange={e => setFormData({...formData, author: e.target.value})} className="w-full bg-void-black border border-border rounded-sm px-4 py-2 text-text-primary font-ui focus:outline-none focus:border-aurora-teal" />
                <input type="datetime-local" value={formData.date || ''} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-void-black border border-border rounded-sm px-4 py-2 text-text-primary font-ui focus:outline-none focus:border-aurora-teal" />
                <input type="text" placeholder="Link URL" value={formData.link || ''} onChange={e => setFormData({...formData, link: e.target.value})} className="w-full bg-void-black border border-border rounded-sm px-4 py-2 text-text-primary font-ui focus:outline-none focus:border-aurora-teal" />
              </>
            )}

            <div className="flex justify-end gap-4 mt-6">
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 border border-border text-text-primary font-ui text-sm uppercase tracking-wider rounded-sm hover:bg-surface transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-aurora-teal text-void-black font-ui font-semibold text-sm uppercase tracking-wider rounded-sm hover:bg-white transition-colors">
                <Check className="w-4 h-4" /> Save
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* List Views */
        <div className="grid grid-cols-1 gap-4">
          {activeSubTab === 'polls' && polls.map(poll => (
            <div key={poll.id} className="flex items-center justify-between p-4 bg-surface border border-border rounded-sm">
              <div>
                <h4 className="font-heading text-lg text-text-primary">{poll.title}</h4>
                <p className="font-ui text-xs text-text-secondary">{poll.type} • {poll.daysLeft} days left</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(poll, 'polls')} className="p-2 text-text-muted hover:text-aurora-teal transition-colors"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(poll.id, 'polls')} className="p-2 text-text-muted hover:text-forge-red transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}

          {activeSubTab === 'circles' && circles.map(circle => (
            <div key={circle.id} className="flex items-center justify-between p-4 bg-surface border border-border rounded-sm">
              <div>
                <h4 className="font-heading text-lg text-text-primary">{circle.name}</h4>
                <p className="font-ui text-xs text-text-secondary">{circle.focus} • {circle.status}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(circle, 'circles')} className="p-2 text-text-muted hover:text-aurora-teal transition-colors"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(circle.id, 'readerCircles')} className="p-2 text-text-muted hover:text-forge-red transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}

          {activeSubTab === 'guides' && guides.map(guide => (
            <div key={guide.id} className="flex items-center justify-between p-4 bg-surface border border-border rounded-sm">
              <div>
                <h4 className="font-heading text-lg text-text-primary">{guide.title}</h4>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(guide, 'guides')} className="p-2 text-text-muted hover:text-aurora-teal transition-colors"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(guide.id, 'bookClubGuides')} className="p-2 text-text-muted hover:text-forge-red transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}

          {activeSubTab === 'qa' && qaSessions.map(qa => (
            <div key={qa.id} className="flex items-center justify-between p-4 bg-surface border border-border rounded-sm">
              <div>
                <h4 className="font-heading text-lg text-text-primary">{qa.title}</h4>
                <p className="font-ui text-xs text-text-secondary">with {qa.author}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(qa, 'qa')} className="p-2 text-text-muted hover:text-aurora-teal transition-colors"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(qa.id, 'qaSessions')} className="p-2 text-text-muted hover:text-forge-red transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
