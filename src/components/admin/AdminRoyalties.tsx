import { useState, useEffect } from 'react';
import {
  DollarSign, Plus, Edit2, Trash2, Save, TrendingUp, BarChart3,
  BookOpen, Percent, ChevronDown, ChevronRight, AlertCircle, Calculator, CreditCard, Calendar
} from 'lucide-react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import AdminModal, { FormSection, FormField } from './AdminModal';

// ─── Types ──────────────────────────────────────
interface RoyaltyFormat {
  id: string;
  label: string;
  defaultPrice: number;
  tradRate: number;
  selfRate: number;
  runaRate: number;
  enabled: boolean;
  order: number;
}

interface RoyaltySettings {
  id: string;
  paymentSchedule: 'monthly' | 'quarterly' | 'biannual';
  minimumPayout: number;
  platformFee: number;
  editorialFee: number;
  marketingFee: number;
  advantageTitle: string;
  advantageBody: string;
  calculatorEnabled: boolean;
}

// ─── Collapsible Panel ──────────────────────────
function Panel({ title, icon: Icon, children, defaultOpen = false }: {
  title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-surface border border-border/50 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-6 py-4 hover:bg-surface-elevated/50 transition-colors text-left">
        <div className="w-9 h-9 rounded-xl bg-starforge-gold/10 flex items-center justify-center border border-starforge-gold/20 flex-shrink-0">
          <Icon className="w-4.5 h-4.5 text-starforge-gold" />
        </div>
        <h3 className="font-heading text-lg text-text-primary flex-1">{title}</h3>
        {open ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
      </button>
      {open && <div className="px-6 pb-6 pt-2 border-t border-border/30">{children}</div>}
    </div>
  );
}

// ─── Main Component ─────────────────────────────
export default function AdminRoyalties() {
  const [formats, setFormats] = useState<RoyaltyFormat[]>([]);
  const [settings, setSettings] = useState<RoyaltySettings>({
    id: 'main', paymentSchedule: 'monthly', minimumPayout: 25, platformFee: 15,
    editorialFee: 10, marketingFee: 5, advantageTitle: 'The Runa Atlas Advantage',
    advantageBody: 'While self-publishing offers higher per-unit royalties, Runa Atlas provides professional editorial support, community-powered marketing, beta reader matching, and manuscript analytics.',
    calculatorEnabled: true,
  });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [formatModal, setFormatModal] = useState(false);
  const [editingFormat, setEditingFormat] = useState<RoyaltyFormat | null>(null);
  const [formatForm, setFormatForm] = useState<Partial<RoyaltyFormat>>({
    label: '', defaultPrice: 12.99, tradRate: 0.125, selfRate: 0.70, runaRate: 0.55,
    enabled: true, order: 0,
  });

  useEffect(() => {
    const unsubs: (() => void)[] = [];
    unsubs.push(onSnapshot(collection(db, 'royalty_formats'), (snap) => {
      setFormats(snap.docs.map(d => ({ id: d.id, ...d.data() } as RoyaltyFormat)).sort((a, b) => a.order - b.order));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'royalty_formats')));
    unsubs.push(onSnapshot(collection(db, 'royalty_settings'), (snap) => {
      if (snap.docs.length > 0) setSettings({ id: snap.docs[0].id, ...snap.docs[0].data() } as RoyaltySettings);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'royalty_settings')));
    return () => unsubs.forEach(u => u());
  }, []);

  const saveSettings = async () => {
    try {
      await setDoc(doc(db, 'royalty_settings', settings.id), { ...settings, updatedAt: serverTimestamp() });
      setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 2000);
    } catch (err) { handleFirestoreError(err, OperationType.WRITE, 'royalty_settings'); }
  };

  const openFormatModal = (f?: RoyaltyFormat) => {
    if (f) { setEditingFormat(f); setFormatForm(f); }
    else { setEditingFormat(null); setFormatForm({ label: '', defaultPrice: 12.99, tradRate: 0.125, selfRate: 0.70, runaRate: 0.55, enabled: true, order: formats.length }); }
    setFormatModal(true);
  };

  const saveFormat = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { label: formatForm.label, defaultPrice: formatForm.defaultPrice, tradRate: formatForm.tradRate, selfRate: formatForm.selfRate, runaRate: formatForm.runaRate, enabled: formatForm.enabled ?? true, order: formatForm.order ?? 0 };
      if (editingFormat) await setDoc(doc(db, 'royalty_formats', editingFormat.id), data, { merge: true });
      else await setDoc(doc(collection(db, 'royalty_formats')), { ...data, createdAt: serverTimestamp() });
      setFormatModal(false);
    } catch (err) { handleFirestoreError(err, OperationType.WRITE, 'royalty_formats'); }
  };

  const deleteFormat = async (id: string) => {
    if (window.confirm('Delete this format?')) {
      try { await deleteDoc(doc(db, 'royalty_formats', id)); }
      catch (err) { handleFirestoreError(err, OperationType.DELETE, 'royalty_formats'); }
    }
  };

  const inputClass = 'w-full bg-void-black border border-border/50 rounded-xl px-4 py-3 text-text-primary focus:border-starforge-gold/50 outline-none transition-all';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface border border-border/50 rounded-3xl p-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-starforge-gold/10 flex items-center justify-center border border-starforge-gold/20">
            <DollarSign className="w-6 h-6 text-starforge-gold" />
          </div>
          <div>
            <h2 className="font-heading text-2xl text-text-primary">Royalties & Rates</h2>
            <p className="font-ui text-text-secondary text-sm">Configure royalty rates, format pricing, and author payouts.</p>
          </div>
        </div>
        <button onClick={() => openFormatModal()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-starforge-gold text-void-black rounded-full font-ui font-medium hover:bg-starforge-gold/90 transition-all">
          <Plus className="w-4 h-4" /> New Format
        </button>
      </div>

      {/* ═══ 1. Format Rates ═══ */}
      <Panel title="Format & Royalty Rates" icon={BarChart3} defaultOpen>
        <div className="space-y-3">
          <p className="font-ui text-xs text-text-muted mb-2">Royalty rates per format, compared across publishing channels.</p>
          {formats.length === 0 && (
            <div className="text-center py-8 text-text-muted font-ui text-sm space-y-3">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" /> No formats configured yet.
              <button onClick={async () => {
                const defaults = [
                  { label: 'Hardcover', defaultPrice: 24.99, tradRate: 0.10, selfRate: 0.60, runaRate: 0.55, enabled: true, order: 0 },
                  { label: 'Paperback', defaultPrice: 14.99, tradRate: 0.08, selfRate: 0.60, runaRate: 0.50, enabled: true, order: 1 },
                  { label: 'eBook', defaultPrice: 9.99, tradRate: 0.25, selfRate: 0.70, runaRate: 0.60, enabled: true, order: 2 },
                  { label: 'Audiobook', defaultPrice: 19.99, tradRate: 0.125, selfRate: 0.40, runaRate: 0.45, enabled: true, order: 3 },
                  { label: 'Serial Chapter', defaultPrice: 2.99, tradRate: 0, selfRate: 0.70, runaRate: 0.65, enabled: true, order: 4 },
                ];
                for (const fmt of defaults) {
                  await setDoc(doc(collection(db, 'royalty_formats')), { ...fmt, createdAt: serverTimestamp() });
                }
              }}
                className="flex items-center gap-2 mx-auto px-5 py-2.5 bg-starforge-gold text-void-black rounded-full font-ui font-medium hover:bg-starforge-gold/90 transition-all">
                <Plus className="w-4 h-4" /> Seed Default Formats (5)
              </button>
            </div>
          )}
          {/* Header Row */}
          {formats.length > 0 && (
            <div className="grid grid-cols-7 gap-3 px-4 py-2 text-[10px] uppercase tracking-wider text-text-muted font-ui">
              <span className="col-span-2">Format</span>
              <span>Default Price</span>
              <span>Trad Rate</span>
              <span>Self-Pub Rate</span>
              <span>Rüna Rate</span>
              <span className="text-right">Actions</span>
            </div>
          )}
          {formats.map(f => (
            <div key={f.id} className={`grid grid-cols-7 gap-3 items-center bg-surface-elevated border border-border/50 rounded-xl px-4 py-3 ${!f.enabled ? 'opacity-50' : ''}`}>
              <span className="col-span-2 font-heading text-sm text-text-primary">{f.label}</span>
              <span className="font-mono text-sm text-text-secondary">${(f.defaultPrice ?? 0).toFixed(2)}</span>
              <span className="font-mono text-sm text-text-muted">{((f.tradRate ?? 0) * 100).toFixed(1)}%</span>
              <span className="font-mono text-sm text-aurora-teal">{((f.selfRate ?? 0) * 100).toFixed(0)}%</span>
              <span className="font-mono text-sm text-starforge-gold font-semibold">{((f.runaRate ?? 0) * 100).toFixed(0)}%</span>
              <div className="flex gap-1 justify-end">
                <button onClick={() => openFormatModal(f)} className="p-1.5 text-text-muted hover:text-starforge-gold"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => deleteFormat(f.id)} className="p-1.5 text-text-muted hover:text-forge-red"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* ═══ 2. Fee Structure ═══ */}
      <Panel title="Fee Structure & Payouts" icon={CreditCard}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Platform Fee (%)</label>
              <input type="number" step="0.1" min="0" max="50" value={settings.platformFee} onChange={e => setSettings({ ...settings, platformFee: Number(e.target.value) })} className={inputClass} />
            </div>
            <div>
              <label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Editorial Fee (%)</label>
              <input type="number" step="0.1" min="0" max="50" value={settings.editorialFee} onChange={e => setSettings({ ...settings, editorialFee: Number(e.target.value) })} className={inputClass} />
            </div>
            <div>
              <label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Marketing Fee (%)</label>
              <input type="number" step="0.1" min="0" max="50" value={settings.marketingFee} onChange={e => setSettings({ ...settings, marketingFee: Number(e.target.value) })} className={inputClass} />
            </div>
            <div>
              <label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Minimum Payout ($)</label>
              <input type="number" step="1" min="0" value={settings.minimumPayout} onChange={e => setSettings({ ...settings, minimumPayout: Number(e.target.value) })} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Payment Schedule</label>
            <select value={settings.paymentSchedule} onChange={e => setSettings({ ...settings, paymentSchedule: e.target.value as any })} className={inputClass}>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="biannual">Bi-Annual</option>
            </select>
          </div>
          <div className="bg-surface-elevated border border-border/30 rounded-xl p-4 text-xs text-text-muted">
            <p className="font-ui font-semibold text-text-secondary mb-1">Fee breakdown per sale</p>
            <p>Author receives: <span className="text-starforge-gold font-semibold">{100 - settings.platformFee - settings.editorialFee - settings.marketingFee}%</span> of Rüna rate</p>
            <p>Platform: {settings.platformFee}% · Editorial: {settings.editorialFee}% · Marketing: {settings.marketingFee}%</p>
          </div>
        </div>
      </Panel>

      {/* ═══ 3. Calculator Page Settings ═══ */}
      <Panel title="Calculator Page Settings" icon={Calculator}>
        <div className="space-y-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={settings.calculatorEnabled} onChange={e => setSettings({ ...settings, calculatorEnabled: e.target.checked })} className="accent-starforge-gold" />
            <span className="text-sm text-text-secondary">Enable public royalty calculator page</span>
          </label>
          <div>
            <label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Advantage Box Title</label>
            <input type="text" value={settings.advantageTitle} onChange={e => setSettings({ ...settings, advantageTitle: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Advantage Box Body</label>
            <textarea value={settings.advantageBody} onChange={e => setSettings({ ...settings, advantageBody: e.target.value })} className={`${inputClass} h-24 resize-none`} />
          </div>
          <button onClick={saveSettings}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-ui text-sm font-medium transition-all ${settingsSaved ? 'bg-aurora-teal text-void-black' : 'bg-starforge-gold text-void-black hover:bg-starforge-gold/90'}`}>
            <Save className="w-4 h-4" /> {settingsSaved ? 'Saved!' : 'Save All Settings'}
          </button>
        </div>
      </Panel>

      {/* Format Modal */}
      <AdminModal isOpen={formatModal} onClose={() => setFormatModal(false)}
        title={editingFormat ? 'Edit Format' : 'Add Format'}>
        <form onSubmit={saveFormat} className="space-y-6">
          <FormSection title="Format">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Format Name">
                <input type="text" required value={formatForm.label} onChange={e => setFormatForm({ ...formatForm, label: e.target.value })} className={inputClass} placeholder="e.g. Audiobook" />
              </FormField>
              <FormField label="Default Price ($)">
                <input type="number" step="0.01" min="0" required value={formatForm.defaultPrice} onChange={e => setFormatForm({ ...formatForm, defaultPrice: Number(e.target.value) })} className={inputClass} />
              </FormField>
            </div>
          </FormSection>
          <FormSection title="Royalty Rates (as decimals, e.g. 0.55 = 55%)">
            <div className="grid grid-cols-3 gap-4">
              <FormField label="Traditional Rate">
                <input type="number" step="0.001" min="0" max="1" required value={formatForm.tradRate} onChange={e => setFormatForm({ ...formatForm, tradRate: Number(e.target.value) })} className={inputClass} />
              </FormField>
              <FormField label="Self-Pub Rate">
                <input type="number" step="0.001" min="0" max="1" required value={formatForm.selfRate} onChange={e => setFormatForm({ ...formatForm, selfRate: Number(e.target.value) })} className={inputClass} />
              </FormField>
              <FormField label="Rüna Atlas Rate">
                <input type="number" step="0.001" min="0" max="1" required value={formatForm.runaRate} onChange={e => setFormatForm({ ...formatForm, runaRate: Number(e.target.value) })} className={inputClass} />
              </FormField>
            </div>
          </FormSection>
          <FormSection title="Options">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Sort Order">
                <input type="number" value={formatForm.order} onChange={e => setFormatForm({ ...formatForm, order: Number(e.target.value) })} className={inputClass} />
              </FormField>
              <FormField label="Enabled">
                <select value={formatForm.enabled ? 'true' : 'false'} onChange={e => setFormatForm({ ...formatForm, enabled: e.target.value === 'true' })} className={inputClass}>
                  <option value="true">Yes</option><option value="false">No</option>
                </select>
              </FormField>
            </div>
          </FormSection>
          <div className="flex gap-4 pt-4">
            <button type="submit" className="flex-1 py-4 bg-starforge-gold text-void-black rounded-xl font-ui font-bold uppercase tracking-widest hover:bg-starforge-gold/90 transition-all">
              {editingFormat ? 'Update Format' : 'Add Format'}
            </button>
            <button type="button" onClick={() => setFormatModal(false)} className="px-8 py-4 bg-surface-elevated text-text-primary rounded-xl font-ui font-bold uppercase tracking-widest border border-border/50 hover:bg-surface transition-all">Cancel</button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
