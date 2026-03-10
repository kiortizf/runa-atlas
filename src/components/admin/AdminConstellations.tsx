import { useState, useEffect } from 'react';
import { Star, Plus, Edit2, Trash2, BookOpen, Users, Globe, Layout } from 'lucide-react';
import AdminModal, { FormSection, FormField } from './AdminModal';
import { collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';

interface Constellation {
  id: string;
  name: string;
  description: string;
  curator: string;
  booksCount: number;
  authorsCount: number;
  status: 'Active' | 'Archived' | 'Planned';
  color: string;
  createdAt?: any;
}

export default function AdminConstellations() {
  const [constellations, setConstellations] = useState<Constellation[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConstellation, setEditingConstellation] = useState<Constellation | null>(null);
  const [formData, setFormData] = useState<Partial<Constellation>>({
    name: '',
    description: '',
    curator: '',
    status: 'Active',
    color: '#F27D26'
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'constellations'), (snapshot) => {
      const constellationsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Constellation));
      setConstellations(constellationsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'constellations');
    });
    return () => unsubscribe();
  }, []);

  const handleOpenModal = (constellation?: Constellation) => {
    if (constellation) {
      setEditingConstellation(constellation);
      setFormData(constellation);
    } else {
      setEditingConstellation(null);
      setFormData({
        name: '',
        description: '',
        curator: '',
        status: 'Active',
        color: '#F27D26'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingConstellation(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const constellationDataToSave = {
        name: formData.name,
        description: formData.description,
        curator: formData.curator,
        status: formData.status,
        color: formData.color,
      };

      if (editingConstellation) {
        const constellationRef = doc(db, 'constellations', editingConstellation.id);
        await setDoc(constellationRef, {
          ...constellationDataToSave,
          createdAt: editingConstellation.createdAt || serverTimestamp()
        }, { merge: true });
      } else {
        const newConstellationRef = doc(collection(db, 'constellations'));
        await setDoc(newConstellationRef, {
          ...constellationDataToSave,
          booksCount: 0,
          authorsCount: 0,
          createdAt: serverTimestamp()
        });
      }
      handleCloseModal();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'constellations');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this constellation? All associated story links will be preserved but the grouping will be removed.')) {
      try {
        await deleteDoc(doc(db, 'constellations', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `constellations/${id}`);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface border border-border/50 rounded-3xl p-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-starforge-gold/10 flex items-center justify-center border border-starforge-gold/20">
            <Star className="w-6 h-6 text-starforge-gold" />
          </div>
          <div>
            <h2 className="font-heading text-2xl text-text-primary">Constellations CMS</h2>
            <p className="font-ui text-text-secondary text-sm">Organize and manage thematic story universes.</p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-starforge-gold text-void-black rounded-full font-ui font-medium hover:bg-starforge-gold/90 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Constellation
        </button>
      </div>

      {/* Constellations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {constellations.map((constellation) => (
          <div
            key={constellation.id}
            className="group bg-surface border border-border/50 rounded-3xl p-6 hover:border-starforge-gold/30 transition-all relative overflow-hidden"
          >
            {/* Accent Bar */}
            <div 
              className="absolute top-0 left-0 w-full h-1" 
              style={{ backgroundColor: constellation.color }}
            />

            <div className="flex justify-between items-start mb-4">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center border border-border/50 bg-surface-elevated"
                style={{ color: constellation.color }}
              >
                <Layout className="w-5 h-5" />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleOpenModal(constellation)}
                  className="p-2 text-text-muted hover:text-starforge-gold transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(constellation.id)}
                  className="p-2 text-text-muted hover:text-forge-red transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="font-heading text-xl text-text-primary mb-2">{constellation.name}</h3>
            <p className="text-text-secondary text-sm line-clamp-2 mb-6 h-10">{constellation.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-surface-elevated rounded-2xl p-3 border border-border/50">
                <div className="flex items-center gap-2 text-text-muted mb-1">
                  <BookOpen className="w-3 h-3" />
                  <span className="text-[10px] uppercase tracking-wider">Books</span>
                </div>
                <p className="font-heading text-lg text-text-primary">{constellation.booksCount}</p>
              </div>
              <div className="bg-surface-elevated rounded-2xl p-3 border border-border/50">
                <div className="flex items-center gap-2 text-text-muted mb-1">
                  <Users className="w-3 h-3" />
                  <span className="text-[10px] uppercase tracking-wider">Authors</span>
                </div>
                <p className="font-heading text-lg text-text-primary">{constellation.authorsCount}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <span className="flex items-center gap-1.5 text-xs text-text-muted">
                <Globe className="w-3.5 h-3.5" /> {constellation.curator}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-ui uppercase tracking-wider ${
                constellation.status === 'Active' ? 'bg-aurora-teal/20 text-aurora-teal' : 
                constellation.status === 'Archived' ? 'bg-text-muted/20 text-text-muted' : 
                'bg-starforge-gold/20 text-starforge-gold'
              }`}>
                {constellation.status}
              </span>
            </div>
          </div>
        ))}
        {constellations.length === 0 && (
          <div className="col-span-full text-center py-12 text-text-muted">
            No constellations found. Create one to get started.
          </div>
        )}
      </div>

      {/* Editor Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingConstellation ? 'Edit Constellation' : 'Create New Constellation'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSection title="Core Identity">
            <FormField label="Constellation Name">
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-void-black border border-border/50 rounded-xl px-4 py-3 text-text-primary focus:border-starforge-gold/50 outline-none transition-all"
                placeholder="e.g. The Obsidian Reach"
              />
            </FormField>
            <FormField label="Description">
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-void-black border border-border/50 rounded-xl px-4 py-3 text-text-primary focus:border-starforge-gold/50 outline-none transition-all h-24 resize-none"
                placeholder="Describe the thematic core of this universe..."
              />
            </FormField>
          </FormSection>

          <FormSection title="Management & Style">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Curator / Lead Author">
                <input
                  type="text"
                  required
                  value={formData.curator}
                  onChange={(e) => setFormData({ ...formData, curator: e.target.value })}
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
                  <option value="Archived">Archived</option>
                  <option value="Planned">Planned</option>
                </select>
              </FormField>
            </div>
            <FormField label="Theme Color">
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-12 h-12 bg-transparent border-none cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="flex-1 bg-void-black border border-border/50 rounded-xl px-4 py-3 text-text-primary focus:border-starforge-gold/50 outline-none transition-all font-mono"
                />
              </div>
            </FormField>
          </FormSection>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 py-4 bg-starforge-gold text-void-black rounded-xl font-ui font-bold uppercase tracking-widest hover:bg-starforge-gold/90 transition-all"
            >
              {editingConstellation ? 'Update Constellation' : 'Create Constellation'}
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

