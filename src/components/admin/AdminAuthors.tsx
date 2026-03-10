import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Mail, Globe, Twitter } from 'lucide-react';
import AdminModal, { FormSection, FormField } from './AdminModal';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';

type Author = {
  id: string;
  name: string;
  bio: string;
  email: string;
  website?: string;
  twitter?: string;
  photoUrl?: string;
  status: 'active' | 'inactive';
};

export default function AdminAuthors() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [twitter, setTwitter] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  useEffect(() => {
    const q = query(collection(db, 'authorProfiles'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const auths = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Author));
      setAuthors(auths);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'authorProfiles');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openModal = (author?: Author) => {
    if (author) {
      setEditingAuthor(author);
      setName(author.name);
      setBio(author.bio);
      setEmail(author.email);
      setWebsite(author.website || '');
      setTwitter(author.twitter || '');
      setStatus(author.status);
    } else {
      setEditingAuthor(null);
      setName('');
      setBio('');
      setEmail('');
      setWebsite('');
      setTwitter('');
      setStatus('active');
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const authorData = { name, bio, email, website, twitter, status };
      if (editingAuthor) {
        await updateDoc(doc(db, 'authorProfiles', editingAuthor.id), authorData);
      } else {
        await addDoc(collection(db, 'authorProfiles'), authorData);
      }
      setIsModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, editingAuthor ? OperationType.UPDATE : OperationType.CREATE, 'authorProfiles');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this author?')) {
      try {
        await deleteDoc(doc(db, 'authorProfiles', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `authorProfiles/${id}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-display text-3xl text-text-primary uppercase tracking-widest">Author Profiles</h1>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Author
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {authors.map((author) => (
          <motion.div 
            key={author.id}
            whileHover={{ y: -4 }}
            className="bg-surface border border-border/50 rounded-3xl p-6 relative group flex flex-col"
          >
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openModal(author)} className="p-2 bg-surface-elevated rounded-full text-text-muted hover:text-starforge-gold transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(author.id)} className="p-2 bg-surface-elevated rounded-full text-text-muted hover:text-forge-red transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-surface-elevated border border-border/50 flex items-center justify-center overflow-hidden">
                {author.photoUrl ? (
                  <img src={author.photoUrl} alt={author.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-display text-2xl text-starforge-gold">{author.name.charAt(0)}</span>
                )}
              </div>
              <div>
                <h2 className="font-heading text-xl text-text-primary">{author.name}</h2>
                <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${author.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-surface-elevated text-text-muted border border-border/50'}`}>
                  {author.status}
                </span>
              </div>
            </div>

            <p className="font-body text-text-secondary text-sm line-clamp-3 mb-6 flex-grow">
              {author.bio}
            </p>

            <div className="flex gap-3 pt-4 border-t border-border/50">
              <a href={`mailto:${author.email}`} className="text-text-muted hover:text-starforge-gold transition-colors" title="Email">
                <Mail className="w-4 h-4" />
              </a>
              {author.website && (
                <a href={author.website} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-starforge-gold transition-colors" title="Website">
                  <Globe className="w-4 h-4" />
                </a>
              )}
              {author.twitter && (
                <a href={`https://twitter.com/${author.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-starforge-gold transition-colors" title="Twitter">
                  <Twitter className="w-4 h-4" />
                </a>
              )}
            </div>
          </motion.div>
        ))}
        {authors.length === 0 && !loading && (
          <div className="col-span-full text-center py-12 text-text-muted">
            No authors found. Add one to get started.
          </div>
        )}
      </div>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAuthor ? "Edit Author" : "New Author"}
      >
        <div className="space-y-6">
          <FormSection title="Basic Info">
            <FormField label="Full Name">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface-elevated border border-border/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-starforge-gold/50 transition-colors font-body"
                placeholder="e.g. Alara Vane"
              />
            </FormField>
            <FormField label="Bio">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full bg-surface-elevated border border-border/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-starforge-gold/50 transition-colors font-body resize-none"
                placeholder="Author biography..."
              />
            </FormField>
          </FormSection>

          <FormSection title="Contact & Links">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Email Address">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-elevated border border-border/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-starforge-gold/50 transition-colors font-body"
                  placeholder="author@example.com"
                />
              </FormField>
              <FormField label="Website URL">
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full bg-surface-elevated border border-border/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-starforge-gold/50 transition-colors font-body"
                  placeholder="https://..."
                />
              </FormField>
              <FormField label="Twitter Handle">
                <input
                  type="text"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  className="w-full bg-surface-elevated border border-border/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-starforge-gold/50 transition-colors font-body"
                  placeholder="@username"
                />
              </FormField>
              <FormField label="Status">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                  className="w-full bg-surface-elevated border border-border/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-starforge-gold/50 transition-colors font-body appearance-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </FormField>
            </div>
          </FormSection>

          <div className="flex justify-end gap-4 pt-4 border-t border-border/50">
            <button onClick={() => setIsModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button onClick={handleSave} className="btn-primary">
              {editingAuthor ? 'Save Changes' : 'Create Author'}
            </button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
