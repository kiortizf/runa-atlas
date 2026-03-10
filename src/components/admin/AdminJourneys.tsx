import { useState, useEffect } from 'react';
import { Scroll, Plus, Edit2, Trash2, BookOpen, Clock, Star, Tag, ChevronRight } from 'lucide-react';
import AdminModal, { FormSection, FormField } from './AdminModal';
import { collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';

interface Journey {
  id: string;
  title: string;
  description: string;
  author: string;
  authorId?: string;
  status: 'Active' | 'Completed' | 'Hiatus';
  episodes: number;
  genre: string;
  constellation: string;
  lastUpdate?: any;
  createdAt?: any;
}

export default function AdminJourneys() {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJourney, setEditingJourney] = useState<Journey | null>(null);
  const { user } = useAuth();

  const [formData, setFormData] = useState<Partial<Journey>>({
    title: '',
    description: '',
    author: '',
    status: 'Active',
    episodes: 0,
    genre: '',
    constellation: ''
  });

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(collection(db, 'journeys'), (snapshot) => {
      const journeysData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Journey));
      // Sort by lastUpdate descending
      journeysData.sort((a, b) => {
        const dateA = a.lastUpdate instanceof Timestamp ? a.lastUpdate.toMillis() : (a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0);
        const dateB = b.lastUpdate instanceof Timestamp ? b.lastUpdate.toMillis() : (b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0);
        return dateB - dateA;
      });
      setJourneys(journeysData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'journeys');
    });
    return () => unsubscribe();
  }, [user]);

  const handleOpenModal = (journey?: Journey) => {
    if (journey) {
      setEditingJourney(journey);
      setFormData(journey);
    } else {
      setEditingJourney(null);
      setFormData({
        title: '',
        description: '',
        author: user?.displayName || '',
        status: 'Active',
        episodes: 0,
        genre: '',
        constellation: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingJourney(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const journeyDataToSave = {
        title: formData.title,
        description: formData.description,
        author: formData.author,
        status: formData.status,
        episodes: formData.episodes,
        genre: formData.genre,
        constellation: formData.constellation,
      };

      if (editingJourney) {
        const journeyRef = doc(db, 'journeys', editingJourney.id);
        const updateData: any = {
          ...journeyDataToSave,
          lastUpdate: serverTimestamp(),
        };
        if (!editingJourney.createdAt) {
          updateData.createdAt = serverTimestamp();
        }
        if (!editingJourney.authorId) {
          updateData.authorId = user.uid;
        }
        await setDoc(journeyRef, updateData, { merge: true });
      } else {
        const newJourneyRef = doc(collection(db, 'journeys'));
        await setDoc(newJourneyRef, {
          ...journeyDataToSave,
          lastUpdate: serverTimestamp(),
          createdAt: serverTimestamp(),
          authorId: user.uid
        });
      }
      handleCloseModal();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'journeys');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this journey?')) {
      try {
        await deleteDoc(doc(db, 'journeys', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `journeys/${id}`);
      }
    }
  };

  const getDisplayDate = (dateObj: any) => {
    if (!dateObj) return 'Unknown';
    if (dateObj instanceof Timestamp) return dateObj.toDate().toLocaleDateString();
    if (typeof dateObj === 'string') return new Date(dateObj).toLocaleDateString();
    return new Date(dateObj).toLocaleDateString();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface border border-border/50 rounded-3xl p-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-starforge-gold/10 flex items-center justify-center border border-starforge-gold/20">
            <Scroll className="w-6 h-6 text-starforge-gold" />
          </div>
          <div>
            <h2 className="font-heading text-2xl text-text-primary">Journeys CMS</h2>
            <p className="font-ui text-text-secondary text-sm">Manage serialized storytelling and episodic releases.</p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-starforge-gold text-void-black rounded-full font-ui font-medium hover:bg-starforge-gold/90 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Journey
        </button>
      </div>

      {/* Journeys List */}
      <div className="grid grid-cols-1 gap-4">
        {journeys.map((journey) => (
          <div
            key={journey.id}
            className="group bg-surface border border-border/50 rounded-2xl p-6 hover:border-starforge-gold/30 transition-all"
          >
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Icon / Status */}
              <div className="w-full lg:w-24 h-24 rounded-xl bg-surface-elevated flex flex-col items-center justify-center border border-border/50 flex-shrink-0">
                <Scroll className="w-8 h-8 text-starforge-gold mb-2" />
                <span className="font-ui text-[10px] text-text-muted uppercase tracking-widest">
                  {journey.episodes} EP
                </span>
              </div>

              {/* Journey Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-ui uppercase tracking-wider ${
                    journey.status === 'Active' ? 'bg-aurora-teal/20 text-aurora-teal' : 
                    journey.status === 'Completed' ? 'bg-starforge-gold/20 text-starforge-gold' : 
                    'bg-forge-red/20 text-forge-red'
                  }`}>
                    {journey.status}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-ui text-text-muted uppercase tracking-wider">
                    <Star className="w-3 h-3" /> {journey.constellation}
                  </span>
                </div>
                <h3 className="font-heading text-xl text-text-primary mb-2 truncate">{journey.title}</h3>
                <p className="text-text-secondary text-sm line-clamp-2 mb-4">{journey.description}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-xs font-ui text-text-muted">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" /> {journey.genre}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" /> {journey.author}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Updated {getDisplayDate(journey.lastUpdate || journey.createdAt)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex lg:flex-col items-center justify-end gap-2 border-t lg:border-t-0 lg:border-l border-border/50 pt-4 lg:pt-0 lg:pl-6">
                <button
                  onClick={() => handleOpenModal(journey)}
                  className="p-2 text-text-muted hover:text-starforge-gold hover:bg-starforge-gold/10 rounded-lg transition-all"
                  title="Edit Journey"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  className="p-2 text-text-muted hover:text-aurora-teal hover:bg-aurora-teal/10 rounded-lg transition-all"
                  title="Manage Episodes"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(journey.id)}
                  className="p-2 text-text-muted hover:text-forge-red hover:bg-forge-red/10 rounded-lg transition-all"
                  title="Delete Journey"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {journeys.length === 0 && (
          <div className="text-center py-12 text-text-muted">
            No journeys found. Create one to get started.
          </div>
        )}
      </div>

      {/* Editor Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingJourney ? 'Edit Journey' : 'Create New Journey'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSection title="Journey Information">
            <FormField label="Journey Title">
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-void-black border border-border/50 rounded-xl px-4 py-3 text-text-primary focus:border-starforge-gold/50 outline-none transition-all"
                placeholder="Enter journey name..."
              />
            </FormField>
            <FormField label="Description">
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-void-black border border-border/50 rounded-xl px-4 py-3 text-text-primary focus:border-starforge-gold/50 outline-none transition-all h-24 resize-none"
                placeholder="What is this journey about?"
              />
            </FormField>
          </FormSection>

          <FormSection title="Metadata & Classification">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Author">
                <input
                  type="text"
                  required
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full bg-void-black border border-border/50 rounded-xl px-4 py-3 text-text-primary focus:border-starforge-gold/50 outline-none transition-all"
                />
              </FormField>
              <FormField label="Genre">
                <input
                  type="text"
                  required
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  className="w-full bg-void-black border border-border/50 rounded-xl px-4 py-3 text-text-primary focus:border-starforge-gold/50 outline-none transition-all"
                />
              </FormField>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Constellation">
                <input
                  type="text"
                  required
                  value={formData.constellation}
                  onChange={(e) => setFormData({ ...formData, constellation: e.target.value })}
                  className="w-full bg-void-black border border-border/50 rounded-xl px-4 py-3 text-text-primary focus:border-starforge-gold/50 outline-none transition-all"
                />
              </FormField>
              <FormField label="Status">
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-void-black border border-border/50 rounded-xl px-4 py-3 text-text-primary focus:border-starforge-gold/50 outline-none transition-all"
                >
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Hiatus">Hiatus</option>
                </select>
              </FormField>
            </div>
            <FormField label="Current Episodes">
              <input
                type="number"
                required
                value={formData.episodes}
                onChange={(e) => setFormData({ ...formData, episodes: parseInt(e.target.value) })}
                className="w-full bg-void-black border border-border/50 rounded-xl px-4 py-3 text-text-primary focus:border-starforge-gold/50 outline-none transition-all"
              />
            </FormField>
          </FormSection>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 py-4 bg-starforge-gold text-void-black rounded-xl font-ui font-bold uppercase tracking-widest hover:bg-starforge-gold/90 transition-all"
            >
              {editingJourney ? 'Update Journey' : 'Create Journey'}
            </button>
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-8 py-4 bg-surface-elevated text-text-primary rounded-xl font-ui font-bold uppercase tracking-widest border border-border/50 hover:bg-surface transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}

