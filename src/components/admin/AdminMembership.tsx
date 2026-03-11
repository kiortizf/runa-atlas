import { useState, useEffect } from 'react';
import {
  Crown, Plus, Edit2, Trash2, Save, Eye, EyeOff, GripVertical,
  Star, Sparkles, Check, DollarSign, ArrowUp, ArrowDown, ChevronDown, ChevronRight, AlertCircle, Gift
} from 'lucide-react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import AdminModal, { FormSection, FormField } from './AdminModal';

// ─── Types ──────────────────────────────────────
interface MembershipTier {
  id: string;
  name: string;
  price: number;
  period: string;
  annualDiscount: number;
  description: string;
  features: string[];
  icon: string;
  color: string;
  bgClass: string;
  borderClass: string;
  buttonClass: string;
  popular: boolean;
  enabled: boolean;
  order: number;
}

interface MembershipSettings {
  id: string;
  heroTitle: string;
  heroSubtitle: string;
  annualDiscountPercent: number;
  faqEnabled: boolean;
  faqTitle: string;
  faqBody: string;
  transparencyLinkEnabled: boolean;
}

// ─── Component ──────────────────────────────────
export default function AdminMembership() {
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [settings, setSettings] = useState<MembershipSettings>({
    id: 'main', heroTitle: 'Join the Constellation', heroSubtitle: 'Support marginalized voices and gain exclusive access to the forge.',
    annualDiscountPercent: 20, faqEnabled: true,
    faqTitle: 'Why become a member?',
    faqBody: 'Traditional publishing often leaves marginalized authors behind. By subscribing directly to Rüna Atlas, you bypass the algorithms and gatekeepers, ensuring that 70% of your membership fee goes directly to our authors and editorial staff.',
    transparencyLinkEnabled: true,
  });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [tierModal, setTierModal] = useState(false);
  const [editingTier, setEditingTier] = useState<MembershipTier | null>(null);
  const [tierForm, setTierForm] = useState<Partial<MembershipTier>>({
    name: '', price: 5, period: '/month', annualDiscount: 20, description: '',
    features: [], icon: 'Star', color: 'text-aurora-teal', bgClass: 'bg-aurora-teal/10',
    borderClass: 'border-aurora-teal/30', buttonClass: 'bg-aurora-teal text-void-black hover:bg-white',
    popular: false, enabled: true, order: 0,
  });
  const [featureInput, setFeatureInput] = useState('');

  useEffect(() => {
    const unsubs: (() => void)[] = [];
    unsubs.push(onSnapshot(collection(db, 'membership_tiers'), (snap) => {
      setTiers(snap.docs.map(d => ({ id: d.id, ...d.data() } as MembershipTier)).sort((a, b) => a.order - b.order));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'membership_tiers')));
    unsubs.push(onSnapshot(collection(db, 'membership_settings'), (snap) => {
      if (snap.docs.length > 0) { const d = snap.docs[0]; setSettings({ id: d.id, ...d.data() } as MembershipSettings); }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'membership_settings')));
    return () => unsubs.forEach(u => u());
  }, []);

  const saveSettings = async () => {
    try {
      await setDoc(doc(db, 'membership_settings', settings.id), { ...settings, updatedAt: serverTimestamp() });
      setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 2000);
    } catch (err) { handleFirestoreError(err, OperationType.WRITE, 'membership_settings'); }
  };

  const openTierModal = (tier?: MembershipTier) => {
    if (tier) { setEditingTier(tier); setTierForm(tier); }
    else {
      setEditingTier(null);
      setTierForm({ name: '', price: 5, period: '/month', annualDiscount: 20, description: '', features: [], icon: 'Star',
        color: 'text-aurora-teal', bgClass: 'bg-aurora-teal/10', borderClass: 'border-aurora-teal/30',
        buttonClass: 'bg-aurora-teal text-void-black', popular: false, enabled: true, order: tiers.length });
    }
    setFeatureInput('');
    setTierModal(true);
  };

  const saveTier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { id, ...data } = tierForm as MembershipTier;
      if (editingTier) await setDoc(doc(db, 'membership_tiers', editingTier.id), data, { merge: true });
      else await setDoc(doc(collection(db, 'membership_tiers')), { ...data, createdAt: serverTimestamp() });
      setTierModal(false);
    } catch (err) { handleFirestoreError(err, OperationType.WRITE, 'membership_tiers'); }
  };

  const deleteTier = async (id: string) => {
    if (window.confirm('Delete this membership tier?')) {
      try { await deleteDoc(doc(db, 'membership_tiers', id)); }
      catch (err) { handleFirestoreError(err, OperationType.DELETE, 'membership_tiers'); }
    }
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setTierForm({ ...tierForm, features: [...(tierForm.features || []), featureInput.trim()] });
      setFeatureInput('');
    }
  };
  const removeFeature = (i: number) => {
    setTierForm({ ...tierForm, features: (tierForm.features || []).filter((_, idx) => idx !== i) });
  };

  const inputClass = 'w-full bg-void-black border border-border/50 rounded-xl px-4 py-3 text-text-primary focus:border-starforge-gold/50 outline-none transition-all';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface border border-border/50 rounded-3xl p-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-starforge-gold/10 flex items-center justify-center border border-starforge-gold/20">
            <Crown className="w-6 h-6 text-starforge-gold" />
          </div>
          <div>
            <h2 className="font-heading text-2xl text-text-primary">Membership & Tiers</h2>
            <p className="font-ui text-text-secondary text-sm">Manage subscription tiers, pricing, and perks.</p>
          </div>
        </div>
        <button onClick={() => openTierModal()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-starforge-gold text-void-black rounded-full font-ui font-medium hover:bg-starforge-gold/90 transition-all">
          <Plus className="w-4 h-4" /> New Tier
        </button>
      </div>

      {/* Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map(tier => (
          <div key={tier.id} className={`group bg-surface border border-border/50 rounded-3xl p-6 hover:border-starforge-gold/30 transition-all relative overflow-hidden ${!tier.enabled ? 'opacity-50' : ''}`}>
            {tier.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-starforge-gold text-void-black px-3 py-0.5 rounded-b-lg font-ui text-[10px] uppercase tracking-widest font-semibold">
                Most Popular
              </div>
            )}
            <div className="flex justify-between items-start mb-4 mt-2">
              <div className="w-10 h-10 rounded-xl bg-surface-elevated flex items-center justify-center border border-border/50">
                <Star className="w-5 h-5 text-starforge-gold" />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openTierModal(tier)} className="p-2 text-text-muted hover:text-starforge-gold"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => deleteTier(tier.id)} className="p-2 text-text-muted hover:text-forge-red"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <h3 className="font-heading text-xl text-text-primary mb-1">{tier.name}</h3>
            <p className="text-text-secondary text-sm mb-3 h-10 line-clamp-2">{tier.description}</p>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="font-display text-3xl text-text-primary">${tier.price}</span>
              <span className="font-ui text-sm text-text-muted">{tier.period}</span>
            </div>
            <ul className="space-y-2 mb-4">
              {(tier.features || []).slice(0, 4).map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                  <Check className="w-4 h-4 text-aurora-teal flex-shrink-0 mt-0.5" /> {f}
                </li>
              ))}
              {(tier.features || []).length > 4 && (
                <li className="text-[11px] text-text-muted">+{(tier.features || []).length - 4} more perks</li>
              )}
            </ul>
          </div>
        ))}
        {tiers.length === 0 && (
          <div className="col-span-full text-center py-12 text-text-muted">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
            No tiers configured. Hardcoded defaults will be used.
          </div>
        )}
      </div>

      {/* Page Settings */}
      <div className="bg-surface border border-border/50 rounded-2xl p-6 space-y-4">
        <h3 className="font-heading text-lg text-text-primary">Page Settings</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Hero Title</label>
            <input type="text" value={settings.heroTitle} onChange={e => setSettings({ ...settings, heroTitle: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Annual Discount %</label>
            <input type="number" min={0} max={50} value={settings.annualDiscountPercent} onChange={e => setSettings({ ...settings, annualDiscountPercent: Number(e.target.value) })} className={inputClass} />
          </div>
        </div>
        <div>
          <label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Hero Subtitle</label>
          <input type="text" value={settings.heroSubtitle} onChange={e => setSettings({ ...settings, heroSubtitle: e.target.value })} className={inputClass} />
        </div>
        <div>
          <label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">FAQ Section Title</label>
          <input type="text" value={settings.faqTitle} onChange={e => setSettings({ ...settings, faqTitle: e.target.value })} className={inputClass} />
        </div>
        <div>
          <label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">FAQ Body</label>
          <textarea value={settings.faqBody} onChange={e => setSettings({ ...settings, faqBody: e.target.value })} className={`${inputClass} h-24 resize-none`} />
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={settings.faqEnabled} onChange={e => setSettings({ ...settings, faqEnabled: e.target.checked })} className="accent-starforge-gold" />
            <span className="text-sm text-text-secondary">Show FAQ section</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={settings.transparencyLinkEnabled} onChange={e => setSettings({ ...settings, transparencyLinkEnabled: e.target.checked })} className="accent-starforge-gold" />
            <span className="text-sm text-text-secondary">Show Transparency Report link</span>
          </label>
        </div>
        <button onClick={saveSettings}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-ui text-sm font-medium transition-all ${settingsSaved ? 'bg-aurora-teal text-void-black' : 'bg-starforge-gold text-void-black hover:bg-starforge-gold/90'}`}>
          <Save className="w-4 h-4" /> {settingsSaved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>

      {/* Tier Modal */}
      <AdminModal isOpen={tierModal} onClose={() => setTierModal(false)}
        title={editingTier ? 'Edit Membership Tier' : 'Create Membership Tier'}>
        <form onSubmit={saveTier} className="space-y-6">
          <FormSection title="Tier Details">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Tier Name">
                <input type="text" required value={tierForm.name} onChange={e => setTierForm({ ...tierForm, name: e.target.value })} className={inputClass} placeholder="e.g. Navigator" />
              </FormField>
              <FormField label="Icon">
                <select value={tierForm.icon} onChange={e => setTierForm({ ...tierForm, icon: e.target.value })} className={inputClass}>
                  <option value="Star">⭐ Star</option><option value="Sparkles">✨ Sparkles</option><option value="Crown">👑 Crown</option><option value="Gift">🎁 Gift</option>
                </select>
              </FormField>
            </div>
            <FormField label="Description">
              <textarea value={tierForm.description} onChange={e => setTierForm({ ...tierForm, description: e.target.value })} className={`${inputClass} h-20 resize-none`} placeholder="What makes this tier special..." />
            </FormField>
          </FormSection>
          <FormSection title="Pricing">
            <div className="grid grid-cols-3 gap-4">
              <FormField label="Monthly Price ($)">
                <input type="number" step="0.01" min="0" required value={tierForm.price} onChange={e => setTierForm({ ...tierForm, price: Number(e.target.value) })} className={inputClass} />
              </FormField>
              <FormField label="Period Label">
                <input type="text" value={tierForm.period} onChange={e => setTierForm({ ...tierForm, period: e.target.value })} className={inputClass} placeholder="/month" />
              </FormField>
              <FormField label="Sort Order">
                <input type="number" value={tierForm.order} onChange={e => setTierForm({ ...tierForm, order: Number(e.target.value) })} className={inputClass} />
              </FormField>
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={tierForm.popular} onChange={e => setTierForm({ ...tierForm, popular: e.target.checked })} className="accent-starforge-gold" />
                <span className="text-sm text-text-secondary">Mark as "Most Popular"</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={tierForm.enabled} onChange={e => setTierForm({ ...tierForm, enabled: e.target.checked })} className="accent-starforge-gold" />
                <span className="text-sm text-text-secondary">Enabled</span>
              </label>
            </div>
          </FormSection>
          <FormSection title="Features / Perks">
            <div className="flex gap-2 mb-3">
              <input type="text" value={featureInput} onChange={e => setFeatureInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                className={`${inputClass} flex-1`} placeholder="Type a feature and press Enter..." />
              <button type="button" onClick={addFeature} className="px-4 py-2 bg-surface-elevated text-text-primary rounded-xl border border-border/50 font-ui text-sm hover:bg-surface transition-all">Add</button>
            </div>
            <div className="space-y-1.5">
              {(tierForm.features || []).map((f, i) => (
                <div key={i} className="flex items-center gap-2 bg-surface-elevated rounded-lg px-3 py-2 border border-border/30">
                  <Check className="w-3.5 h-3.5 text-aurora-teal flex-shrink-0" />
                  <span className="text-sm text-text-primary flex-1">{f}</span>
                  <button type="button" onClick={() => removeFeature(i)} className="text-text-muted hover:text-forge-red"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          </FormSection>
          <div className="flex gap-4 pt-4">
            <button type="submit" className="flex-1 py-4 bg-starforge-gold text-void-black rounded-xl font-ui font-bold uppercase tracking-widest hover:bg-starforge-gold/90 transition-all">
              {editingTier ? 'Update Tier' : 'Create Tier'}
            </button>
            <button type="button" onClick={() => setTierModal(false)} className="px-8 py-4 bg-surface-elevated text-text-primary rounded-xl font-ui font-bold uppercase tracking-widest border border-border/50 hover:bg-surface transition-all">Cancel</button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
