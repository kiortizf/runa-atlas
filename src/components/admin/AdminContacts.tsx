import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, ChevronDown, ChevronRight, Search, Edit3, Save, X,
  Trash2, Mail, Phone, Globe, ExternalLink, Instagram, Star, Tag,
  MessageCircle, Calendar, BookOpen, Mic, Camera, Send, Filter, User
} from 'lucide-react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp, query, orderBy, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';

// ─── Types ──────────────────────────────────────────────

interface ContactRecord {
  id: string;
  name: string;
  type: 'reviewer' | 'bookstagrammer' | 'booktuber' | 'podcaster' | 'journalist' | 'agent' | 'event-organizer' | 'book-club' | 'librarian' | 'other';
  email?: string;
  phone?: string;
  website?: string;
  socialHandles?: string;
  platform?: string; // primary platform
  audience?: string; // audience size or description
  genres?: string[]; // genres they focus on
  relationship: 'cold' | 'introduced' | 'warm' | 'active' | 'champion';
  notes?: string;
  lastContact?: string;
  tags?: string[];
  interactions?: { date: string; type: string; notes: string }[];
  createdAt?: Timestamp;
}

// ─── Config ─────────────────────────────────────────────

const CONTACT_TYPES = {
  reviewer: { label: 'Reviewer', icon: BookOpen, color: 'text-purple-400 bg-purple-500/10' },
  bookstagrammer: { label: 'Bookstagrammer', icon: Instagram, color: 'text-pink-400 bg-pink-500/10' },
  booktuber: { label: 'BookTuber', icon: Camera, color: 'text-red-400 bg-red-500/10' },
  podcaster: { label: 'Podcaster', icon: Mic, color: 'text-cyan-400 bg-cyan-500/10' },
  journalist: { label: 'Journalist/Media', icon: Send, color: 'text-amber-400 bg-amber-500/10' },
  agent: { label: 'Agent', icon: User, color: 'text-starforge-gold bg-starforge-gold/10' },
  'event-organizer': { label: 'Event Organizer', icon: Calendar, color: 'text-emerald-400 bg-emerald-500/10' },
  'book-club': { label: 'Book Club', icon: MessageCircle, color: 'text-indigo-400 bg-indigo-500/10' },
  librarian: { label: 'Librarian', icon: BookOpen, color: 'text-orange-400 bg-orange-500/10' },
  other: { label: 'Other', icon: Users, color: 'text-text-muted bg-white/5' },
};

const RELATIONSHIPS = {
  cold: { label: 'Cold', color: 'text-text-muted bg-white/5', desc: 'Haven\'t reached out yet' },
  introduced: { label: 'Introduced', color: 'text-cyan-400 bg-cyan-500/10', desc: 'Initial contact made' },
  warm: { label: 'Warm', color: 'text-amber-400 bg-amber-500/10', desc: 'Ongoing positive relationship' },
  active: { label: 'Active', color: 'text-emerald-400 bg-emerald-500/10', desc: 'Currently collaborating' },
  champion: { label: 'Champion', color: 'text-starforge-gold bg-starforge-gold/10', desc: 'Enthusiastic supporter of our press' },
};

const INTERACTION_TYPES = ['Email Sent', 'ARC Sent', 'Review Received', 'Call/Meeting', 'Event', 'Social Media', 'Follow-up', 'Pitch', 'Thank You'];

const GENRE_FOCUS_OPTIONS = ['Fantasy', 'Sci-Fi', 'Horror', 'Magical Realism', 'Romance', 'Literary Spec', 'Thriller', 'Short Fiction', 'Queer Fiction', 'BIPOC Fiction', 'Indie Press', 'SFF General'];

import { CONTACTS_SEED } from '../../data/operationsSeedData';

type SubView = 'all' | 'arc-list' | 'interactions';

export default function AdminContacts() {
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [subView, setSubView] = useState<SubView>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterRelationship, setFilterRelationship] = useState<string | null>(null);
  const [expandedContact, setExpandedContact] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [newInteraction, setNewInteraction] = useState<Record<string, string>>({});
  const [seeded, setSeeded] = useState(false);

  const resetForm = () => { setFormData({}); setShowAddForm(false); setEditing(null); };
  const updateForm = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));

  // ─── Firestore Sync ──────────────────────────────────

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'contacts'), orderBy('name')),
      (snap) => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as ContactRecord));
        setContacts(data);
        if (data.length === 0 && !seeded) seedContacts();
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'contacts')
    );
    return () => unsub();
  }, []);

  const seedContacts = async () => {
    setSeeded(true);
    try {
      for (const contact of CONTACTS_SEED) {
        await addDoc(collection(db, 'contacts'), {
          ...contact,
          interactions: [],
          createdAt: serverTimestamp(),
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'contacts');
    }
  };

  // ─── CRUD ────────────────────────────────────────────

  const addContact = async () => {
    if (!formData.name?.trim()) return;
    try {
      const genres = formData.genresStr ? formData.genresStr.split(',').map((g: string) => g.trim()) : [];
      const { genresStr, ...rest } = formData;
      await addDoc(collection(db, 'contacts'), {
        ...rest, genres, relationship: formData.relationship || 'cold',
        type: formData.type || 'other', interactions: [], createdAt: serverTimestamp(),
      });
      resetForm();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'contacts');
    }
  };

  const updateContact = async (id: string) => {
    try {
      const genres = formData.genresStr ? formData.genresStr.split(',').map((g: string) => g.trim()) : formData.genres || [];
      const { genresStr, ...rest } = formData;
      await updateDoc(doc(db, 'contacts', id), { ...rest, genres });
      resetForm();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'contacts');
    }
  };

  const deleteContact = async (id: string) => {
    if (!confirm('Delete this contact?')) return;
    try {
      await deleteDoc(doc(db, 'contacts', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'contacts');
    }
  };

  const updateRelationship = async (id: string, relationship: string) => {
    try {
      await updateDoc(doc(db, 'contacts', id), { relationship });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'contacts');
    }
  };

  const addInteraction = async (contactId: string) => {
    const int = newInteraction[contactId];
    const intType = newInteraction[`${contactId}-type`] || 'Email Sent';
    if (!int?.trim()) return;
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;
    const interactions = [...(contact.interactions || []), {
      date: new Date().toISOString().split('T')[0], type: intType, notes: int.trim(),
    }];
    try {
      await updateDoc(doc(db, 'contacts', contactId), { interactions, lastContact: new Date().toISOString().split('T')[0] });
      setNewInteraction(prev => ({ ...prev, [contactId]: '', [`${contactId}-type`]: '' }));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'contacts');
    }
  };

  const startEdit = (contact: ContactRecord) => {
    const { id, createdAt, interactions, ...rest } = contact;
    setFormData({ ...rest, genresStr: (rest.genres || []).join(', ') });
    setEditing(id);
    setShowAddForm(true);
  };

  // ─── Computed ────────────────────────────────────────

  const filtered = useMemo(() => {
    return contacts.filter(c => {
      if (filterType && c.type !== filterType) return false;
      if (filterRelationship && c.relationship !== filterRelationship) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.notes?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [contacts, filterType, filterRelationship, searchQuery]);

  const arcCandidates = useMemo(() =>
    contacts.filter(c => ['reviewer', 'bookstagrammer', 'booktuber', 'podcaster', 'book-club'].includes(c.type) &&
      ['warm', 'active', 'champion'].includes(c.relationship)),
  [contacts]);

  const recentInteractions = useMemo(() => {
    const all: { contact: string; contactId: string; date: string; type: string; notes: string }[] = [];
    contacts.forEach(c => {
      (c.interactions || []).forEach(int => {
        all.push({ contact: c.name, contactId: c.id, ...int });
      });
    });
    return all.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30);
  }, [contacts]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    contacts.forEach(c => { counts[c.type] = (counts[c.type] || 0) + 1; });
    return counts;
  }, [contacts]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl text-text-primary flex items-center gap-3">
            <Users className="w-6 h-6 text-starforge-gold" /> Industry Contacts
          </h2>
          <p className="text-sm text-text-secondary mt-1">Manage reviewers, bookstagrammers, media contacts, agents, and more.</p>
        </div>
        <button onClick={() => { resetForm(); setShowAddForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-starforge-gold text-void-black font-ui text-sm font-semibold rounded-lg hover:bg-yellow-500 transition-colors">
          <Plus className="w-4 h-4" /> Add Contact
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: contacts.length, color: 'text-text-primary' },
          { label: 'Champions', value: contacts.filter(c => c.relationship === 'champion').length, color: 'text-starforge-gold' },
          { label: 'Active', value: contacts.filter(c => c.relationship === 'active').length, color: 'text-emerald-400' },
          { label: 'ARC-Ready', value: arcCandidates.length, color: 'text-purple-400' },
          { label: 'Need Follow-up', value: contacts.filter(c => c.relationship === 'introduced' && c.lastContact && new Date(c.lastContact) < new Date(Date.now() - 30*24*60*60*1000)).length, color: 'text-amber-400' },
        ].map(stat => (
          <div key={stat.label} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
            <p className={`font-display text-xl ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-text-muted uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-2 border-b border-white/[0.06] pb-4">
        {([
          { id: 'all' as SubView, label: 'All Contacts', count: contacts.length },
          { id: 'arc-list' as SubView, label: 'ARC List', count: arcCandidates.length },
          { id: 'interactions' as SubView, label: 'Recent Activity', count: null },
        ]).map(tab => (
          <button key={tab.id} onClick={() => setSubView(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-ui uppercase tracking-wider transition-all border ${subView === tab.id
              ? 'bg-starforge-gold/10 text-starforge-gold border-starforge-gold/30'
              : 'bg-white/[0.02] text-text-secondary border-white/[0.04] hover:text-white'}`}>
            {tab.label}
            {tab.count !== null && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.08]">{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="p-6 rounded-xl bg-surface border border-starforge-gold/20">
            <h3 className="font-heading text-lg text-text-primary mb-4">{editing ? 'Edit' : 'Add'} Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs text-text-secondary mb-1 font-ui uppercase tracking-wider">Name *</label>
                <input value={formData.name || ''} onChange={e => updateForm('name', e.target.value)}
                  className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none" />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1 font-ui uppercase tracking-wider">Type</label>
                <select value={formData.type || ''} onChange={e => updateForm('type', e.target.value)}
                  className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none">
                  <option value="">Select...</option>
                  {Object.entries(CONTACT_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1 font-ui uppercase tracking-wider">Relationship</label>
                <select value={formData.relationship || 'cold'} onChange={e => updateForm('relationship', e.target.value)}
                  className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none">
                  {Object.entries(RELATIONSHIPS).map(([k, v]) => <option key={k} value={k}>{v.label} — {v.desc}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1 font-ui uppercase tracking-wider">Email</label>
                <input value={formData.email || ''} onChange={e => updateForm('email', e.target.value)}
                  className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none" />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1 font-ui uppercase tracking-wider">Social Handles</label>
                <input value={formData.socialHandles || ''} onChange={e => updateForm('socialHandles', e.target.value)} placeholder="@handle"
                  className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none" />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1 font-ui uppercase tracking-wider">Website/Platform</label>
                <input value={formData.website || ''} onChange={e => updateForm('website', e.target.value)}
                  className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none" />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1 font-ui uppercase tracking-wider">Audience Size</label>
                <input value={formData.audience || ''} onChange={e => updateForm('audience', e.target.value)} placeholder="e.g., 15K followers"
                  className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-text-secondary mb-1 font-ui uppercase tracking-wider">Genre Focus (comma-separated)</label>
                <input value={formData.genresStr || ''} onChange={e => updateForm('genresStr', e.target.value)} placeholder="Fantasy, Horror, Queer Fiction"
                  className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none" />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-xs text-text-secondary mb-1 font-ui uppercase tracking-wider">Notes</label>
              <textarea value={formData.notes || ''} onChange={e => updateForm('notes', e.target.value)} rows={2}
                className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none resize-y" />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={resetForm} className="px-4 py-2 text-sm text-text-secondary hover:text-white">Cancel</button>
              <button onClick={() => editing ? updateContact(editing) : addContact()} disabled={!formData.name?.trim()}
                className="px-4 py-2 bg-starforge-gold text-void-black text-sm font-semibold rounded-lg hover:bg-yellow-500 disabled:opacity-50">
                <Save className="w-4 h-4 inline mr-1" /> {editing ? 'Update' : 'Save'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ ALL CONTACTS ═══ */}
      {subView === 'all' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search contacts..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-starforge-gold/40" />
            </div>
            <select value={filterType || ''} onChange={e => setFilterType(e.target.value || null)}
              className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none">
              <option value="">All Types</option>
              {Object.entries(CONTACT_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label} ({typeCounts[k] || 0})</option>)}
            </select>
            <select value={filterRelationship || ''} onChange={e => setFilterRelationship(e.target.value || null)}
              className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none">
              <option value="">All Relationships</option>
              {Object.entries(RELATIONSHIPS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>

          {/* Contact Cards */}
          {filtered.length === 0 && !showAddForm ? (
            <div className="text-center py-16 text-text-muted">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-sm">No contacts yet. Add your first industry contact.</p>
            </div>
          ) : (
            filtered.map(contact => {
              const typeConf = CONTACT_TYPES[contact.type] || CONTACT_TYPES.other;
              const relConf = RELATIONSHIPS[contact.relationship];
              const TypeIcon = typeConf.icon;
              const isExpanded = expandedContact === contact.id;

              return (
                <motion.div key={contact.id} layout className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
                  <button onClick={() => setExpandedContact(isExpanded ? null : contact.id)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors text-left">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-none ${typeConf.color}`}>
                      <TypeIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-text-primary truncate">{contact.name}</h4>
                        <span className="text-[10px] text-text-muted">{typeConf.label}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-text-secondary mt-0.5">
                        {contact.email && <span className="flex items-center gap-1 truncate"><Mail className="w-2.5 h-2.5" />{contact.email}</span>}
                        {contact.socialHandles && <span className="flex items-center gap-1"><Instagram className="w-2.5 h-2.5" />{contact.socialHandles}</span>}
                        {contact.audience && <span className="text-text-muted">{contact.audience}</span>}
                      </div>
                    </div>
                    {contact.genres && contact.genres.length > 0 && (
                      <div className="hidden md:flex gap-1 flex-none">
                        {contact.genres.slice(0, 3).map(g => (
                          <span key={g} className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-text-muted">{g}</span>
                        ))}
                      </div>
                    )}
                    <span className={`text-[10px] px-2.5 py-1 rounded-full flex-none ${relConf.color}`}>{relConf.label}</span>
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-text-secondary flex-none" /> : <ChevronRight className="w-4 h-4 text-text-secondary flex-none" />}
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/[0.04]">
                        <div className="p-5 space-y-4">
                          {/* Relationship Buttons */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] text-text-muted uppercase tracking-wider">Relationship:</span>
                            {(Object.keys(RELATIONSHIPS) as (keyof typeof RELATIONSHIPS)[]).map(r => (
                              <button key={r} onClick={() => updateRelationship(contact.id, r)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] transition-all border ${contact.relationship === r
                                  ? `${RELATIONSHIPS[r].color} border-current/20` : 'text-text-muted border-white/[0.04] hover:text-white'}`}>
                                {RELATIONSHIPS[r].label}
                              </button>
                            ))}
                            <button onClick={() => startEdit(contact)} className="ml-auto text-text-muted hover:text-white transition-colors">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteContact(contact.id)} className="text-text-muted hover:text-red-400 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              {contact.website && (
                                <a href={contact.website} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-xs text-text-secondary hover:text-starforge-gold transition-colors">
                                  <Globe className="w-3 h-3" /> {contact.website}
                                </a>
                              )}
                              {contact.phone && <p className="flex items-center gap-2 text-xs text-text-secondary"><Phone className="w-3 h-3" />{contact.phone}</p>}
                              {contact.lastContact && <p className="text-xs text-text-muted">Last contact: {contact.lastContact}</p>}
                              {contact.notes && <p className="text-xs text-text-secondary italic">{contact.notes}</p>}
                              {contact.genres && contact.genres.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {contact.genres.map(g => <span key={g} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-text-muted border border-white/[0.04]">{g}</span>)}
                                </div>
                              )}
                            </div>

                            {/* Interaction Log */}
                            <div>
                              <h4 className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Interaction Log</h4>
                              <div className="space-y-1.5 max-h-40 overflow-y-auto mb-3">
                                {(!contact.interactions || contact.interactions.length === 0) && (
                                  <p className="text-xs text-text-muted">No interactions recorded.</p>
                                )}
                                {(contact.interactions || []).slice().reverse().map((int, i) => (
                                  <div key={i} className="text-xs p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <span className="text-[10px] text-starforge-gold font-medium">{int.type}</span>
                                      <span className="text-[10px] text-text-muted font-mono">{int.date}</span>
                                    </div>
                                    <p className="text-text-secondary">{int.notes}</p>
                                  </div>
                                ))}
                              </div>
                              {/* Add Interaction */}
                              <div className="flex gap-2">
                                <select value={newInteraction[`${contact.id}-type`] || ''} onChange={e => setNewInteraction(prev => ({ ...prev, [`${contact.id}-type`]: e.target.value }))}
                                  className="bg-void-black border border-border rounded-lg px-2 py-1.5 text-[11px] text-white outline-none w-28">
                                  {INTERACTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <input value={newInteraction[contact.id] || ''} onChange={e => setNewInteraction(prev => ({ ...prev, [contact.id]: e.target.value }))}
                                  onKeyDown={e => e.key === 'Enter' && addInteraction(contact.id)}
                                  placeholder="What happened?" className="flex-1 bg-void-black border border-border rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-starforge-gold" />
                                <button onClick={() => addInteraction(contact.id)}
                                  className="px-2 py-1.5 bg-starforge-gold/10 text-starforge-gold rounded-lg hover:bg-starforge-gold/20 transition-colors">
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* ═══ ARC LIST ═══ */}
      {subView === 'arc-list' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
            <h3 className="font-heading text-sm text-purple-400 mb-1">ARC-Ready Contacts</h3>
            <p className="text-xs text-text-secondary">Reviewers, bookstagrammers, BookTubers, podcasters, and book clubs with warm+ relationships. These are your go-to list for ARC distribution.</p>
          </div>

          {arcCandidates.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No ARC-ready contacts yet. Build relationships first!</p>
            </div>
          ) : (
            arcCandidates.map(contact => {
              const typeConf = CONTACT_TYPES[contact.type] || CONTACT_TYPES.other;
              const TypeIcon = typeConf.icon;
              return (
                <div key={contact.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-none ${typeConf.color}`}>
                    <TypeIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-text-primary">{contact.name}</h4>
                    <div className="text-[11px] text-text-secondary flex items-center gap-2">
                      <span>{typeConf.label}</span>
                      {contact.audience && <span className="text-text-muted">· {contact.audience}</span>}
                      {contact.genres && <span className="text-text-muted">· {contact.genres.join(', ')}</span>}
                    </div>
                  </div>
                  {contact.email && <span className="text-xs text-text-muted hidden md:block">{contact.email}</span>}
                  <span className={`text-[10px] px-2.5 py-1 rounded-full ${RELATIONSHIPS[contact.relationship].color}`}>
                    {RELATIONSHIPS[contact.relationship].label}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ═══ RECENT ACTIVITY ═══ */}
      {subView === 'interactions' && (
        <div className="space-y-3">
          <h3 className="font-heading text-base text-text-primary">Recent Interactions</h3>
          {recentInteractions.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No interactions logged yet.</p>
            </div>
          ) : (
            recentInteractions.map((int, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="text-[9px] text-text-muted font-mono w-20 flex-none mt-0.5">{int.date}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm text-text-primary font-medium">{int.contact}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-starforge-gold/10 text-starforge-gold">{int.type}</span>
                  </div>
                  <p className="text-xs text-text-secondary">{int.notes}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
