import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Save, Plus, Trash2, Edit2, ChevronDown, ChevronRight,
  Star, Hash, Eye, EyeOff, Palette, Tag, Globe, CheckCircle
} from 'lucide-react';
import { doc, setDoc, onSnapshot, collection, deleteDoc, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';

// ═══════════════════════════════════════════════════════════════
// ADMIN IMPRINTS — Imprint settings, genre mgmt, thematic tags
// ═══════════════════════════════════════════════════════════════

interface ImprintSetting {
  id: string;
  name: string;
  tagline: string;
  description: string;
  active: boolean;
  primaryColor: string;
  icon: string;
}

interface ThematicTagDoc {
  id: string;
  name: string;
  hashtag: string;
  description: string;
}

const Panel = ({ title, icon: Icon, children, defaultOpen = false }: {
  title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-surface border border-border rounded-xl mb-4 overflow-hidden">
      <button onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-5 text-left hover:bg-white/[0.02] transition-colors">
        <Icon className="w-5 h-5 text-starforge-gold" />
        <span className="font-heading text-lg text-text-primary flex-1">{title}</span>
        {isOpen ? <ChevronDown className="w-4 h-4 text-text-secondary" /> : <ChevronRight className="w-4 h-4 text-text-secondary" />}
      </button>
      {isOpen && <div className="px-5 pb-5 border-t border-border/50 pt-4">{children}</div>}
    </div>
  );
};

const inputClass = 'w-full bg-void-black border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-starforge-gold focus:ring-1 focus:ring-starforge-gold outline-none font-ui';

export default function AdminImprints() {
  const [imprints, setImprints] = useState<ImprintSetting[]>([]);
  const [tags, setTags] = useState<ThematicTagDoc[]>([]);
  const [editingImprint, setEditingImprint] = useState<ImprintSetting | null>(null);
  const [newTag, setNewTag] = useState({ name: '', hashtag: '', description: '' });
  const [saved, setSaved] = useState(false);

  // Load imprints
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'imprint_settings'), snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as ImprintSetting));
      if (data.length > 0) {
        setImprints(data);
      } else {
        // Seed defaults
        setImprints([
          { id: 'runa-atlas', name: 'Rüna Atlas Press', tagline: 'Stories become stars', description: 'BIPOC/Queer speculative fiction', active: true, primaryColor: '#C6A92B', icon: '✦' },
          { id: 'bohio-press', name: 'Bohío Press', tagline: 'Home is the story we carry', description: 'Puerto Rican authors', active: true, primaryColor: '#F97316', icon: '☀' },
          { id: 'void-noir', name: 'Void Noir', tagline: 'Where the dark looks back', description: 'Horror & dark fiction', active: true, primaryColor: '#DC2626', icon: '🌑' },
        ]);
      }
    }, err => handleFirestoreError(err, OperationType.LIST, 'imprint_settings'));
    return () => unsub();
  }, []);

  // Load tags
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'thematic_tags'), snap => {
      setTags(snap.docs.map(d => ({ id: d.id, ...d.data() } as ThematicTagDoc)));
    }, err => handleFirestoreError(err, OperationType.LIST, 'thematic_tags'));
    return () => unsub();
  }, []);

  const saveImprint = async (imp: ImprintSetting) => {
    try {
      await setDoc(doc(db, 'imprint_settings', imp.id), {
        name: imp.name, tagline: imp.tagline, description: imp.description,
        active: imp.active, primaryColor: imp.primaryColor, icon: imp.icon,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setEditingImprint(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'imprint_settings');
    }
  };

  const addTag = async () => {
    if (!newTag.name || !newTag.hashtag) return;
    try {
      await addDoc(collection(db, 'thematic_tags'), {
        ...newTag, createdAt: serverTimestamp(),
      });
      setNewTag({ name: '', hashtag: '', description: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'thematic_tags');
    }
  };

  const deleteTag = async (id: string) => {
    if (!window.confirm('Delete this tag?')) return;
    try {
      await deleteDoc(doc(db, 'thematic_tags', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'thematic_tags');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl text-text-primary uppercase tracking-widest flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-starforge-gold" /> Imprints & Genres
        </h2>
        {saved && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-aurora-teal text-xs font-ui flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Saved
          </motion.span>
        )}
      </div>

      {/* ── Imprint Cards ── */}
      <Panel title="Imprints" icon={Globe} defaultOpen>
        <div className="space-y-4">
          {imprints.map(imp => (
            <div key={imp.id}
              className={`p-4 rounded-xl border transition-all ${imp.active ? 'border-border bg-white/[0.02]' : 'border-border/30 bg-white/[0.01] opacity-60'}`}>
              {editingImprint?.id === imp.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">Name</label>
                      <input value={editingImprint.name} onChange={e => setEditingImprint({ ...editingImprint, name: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">Tagline</label>
                      <input value={editingImprint.tagline} onChange={e => setEditingImprint({ ...editingImprint, tagline: e.target.value })} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">Description</label>
                    <textarea rows={2} value={editingImprint.description} onChange={e => setEditingImprint({ ...editingImprint, description: e.target.value })} className={inputClass} />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">Icon</label>
                      <input value={editingImprint.icon} onChange={e => setEditingImprint({ ...editingImprint, icon: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">Primary Color</label>
                      <input type="color" value={editingImprint.primaryColor} onChange={e => setEditingImprint({ ...editingImprint, primaryColor: e.target.value })} className="w-full h-9 rounded-lg cursor-pointer" />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={editingImprint.active} onChange={e => setEditingImprint({ ...editingImprint, active: e.target.checked })} className="accent-starforge-gold" />
                        <span className="text-xs text-text-secondary">Active</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => saveImprint(editingImprint)}
                      className="px-4 py-2 bg-starforge-gold text-void-black text-xs font-ui uppercase tracking-wider rounded-lg font-semibold flex items-center gap-1.5">
                      <Save className="w-3.5 h-3.5" /> Save
                    </button>
                    <button onClick={() => setEditingImprint(null)}
                      className="px-4 py-2 text-text-muted text-xs font-ui uppercase tracking-wider rounded-lg hover:text-white">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{imp.icon}</span>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-text-primary">{imp.name}</h4>
                    <p className="text-[10px] text-text-secondary italic">"{imp.tagline}"</p>
                    <p className="text-xs text-text-muted mt-1">{imp.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: imp.primaryColor }} />
                    {imp.active ? (
                      <span className="text-[10px] text-aurora-teal bg-aurora-teal/10 px-2 py-0.5 rounded-full">Active</span>
                    ) : (
                      <span className="text-[10px] text-text-muted bg-white/5 px-2 py-0.5 rounded-full">Inactive</span>
                    )}
                    <button onClick={() => setEditingImprint({ ...imp })}
                      className="p-1.5 text-text-muted hover:text-starforge-gold transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Panel>

      {/* ── Thematic Tags ── */}
      <Panel title="Thematic Tags" icon={Hash}>
        <div className="space-y-4">
          {/* Add new tag */}
          <div className="flex items-end gap-3 p-3 bg-white/[0.02] border border-border/50 rounded-xl">
            <div className="flex-1">
              <label className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">Tag Name</label>
              <input value={newTag.name} onChange={e => setNewTag({ ...newTag, name: e.target.value })} placeholder="Found Family" className={inputClass} />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">Hashtag</label>
              <input value={newTag.hashtag} onChange={e => setNewTag({ ...newTag, hashtag: e.target.value })} placeholder="#FoundFamily" className={inputClass} />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">Description</label>
              <input value={newTag.description} onChange={e => setNewTag({ ...newTag, description: e.target.value })} placeholder="Chosen family over blood" className={inputClass} />
            </div>
            <button onClick={addTag}
              className="px-4 py-2 bg-starforge-gold text-void-black text-xs font-ui uppercase tracking-wider rounded-lg font-semibold flex items-center gap-1.5 shrink-0">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          {/* Tag list */}
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <div key={tag.id} className="flex items-center gap-2 px-3 py-2 bg-white/[0.03] border border-border/50 rounded-lg group">
                <span className="text-xs font-mono text-starforge-gold">{tag.hashtag}</span>
                <span className="text-[10px] text-text-muted">{tag.description}</span>
                <button onClick={() => deleteTag(tag.id)}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            {tags.length === 0 && (
              <p className="text-xs text-text-muted italic">
                Tags live in the code by default. Add custom tags here to extend the built-in set.
              </p>
            )}
          </div>
        </div>
      </Panel>

      {/* ── Genre Overview ── */}
      <Panel title="Genre Architecture" icon={BookOpen}>
        <p className="text-xs text-text-muted mb-4">
          Genres are defined in code. To modify the genre list, edit <code className="text-starforge-gold/80">src/data/genreData.ts</code>.
          Below is a summary of the current architecture.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Primary Genres', value: '8' },
            { label: 'Subgenres', value: '80+' },
            { label: 'Bohío Specialties', value: '11' },
            { label: 'Void Noir Specialties', value: '13' },
            { label: 'Thematic Tags', value: '21+' },
            { label: 'Not Publishing', value: '9 categories' },
            { label: 'Active Imprints', value: imprints.filter(i => i.active).length.toString() },
            { label: 'Custom Tags', value: tags.length.toString() },
          ].map(stat => (
            <div key={stat.label} className="p-3 bg-void-black border border-border/30 rounded-lg text-center">
              <p className="text-lg font-display text-starforge-gold">{stat.value}</p>
              <p className="text-[10px] text-text-muted uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
