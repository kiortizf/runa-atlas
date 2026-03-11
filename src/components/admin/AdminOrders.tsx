import { useState, useEffect } from 'react';
import {
  ShoppingCart, CreditCard, Tag, Percent, DollarSign, Package, Truck,
  Plus, Edit2, Trash2, Save, Eye, EyeOff, Search, Filter, Download,
  Check, X, Clock, AlertCircle, ChevronDown, ChevronRight, RefreshCw
} from 'lucide-react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import AdminModal, { FormSection, FormField } from './AdminModal';

// ─── Types ──────────────────────────────────────
interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  items: { title: string; format: string; price: number; quantity: number }[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentMethod: string;
  createdAt?: any;
}

interface DiscountCode {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  minOrder: number;
  maxUses: number;
  currentUses: number;
  validFrom: string;
  validUntil: string;
  enabled: boolean;
}

interface PaymentSettings {
  id: string;
  currency: string;
  taxRate: number;
  flatShipping: number;
  freeShippingThreshold: number;
  stripeEnabled: boolean;
  paypalEnabled: boolean;
  allowGuestCheckout: boolean;
}

// ─── Collapsible Panel ──────────────────────────
function Panel({ title, icon: Icon, count, children, defaultOpen = false }: {
  title: string; icon: any; count?: number; children: React.ReactNode; defaultOpen?: boolean;
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
        {count !== undefined && <span className="font-mono text-xs text-text-muted bg-surface-elevated px-2 py-0.5 rounded-full border border-border/50">{count}</span>}
        {open ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
      </button>
      {open && <div className="px-6 pb-6 pt-2 border-t border-border/30">{children}</div>}
    </div>
  );
}

// ─── Status Badge ──────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-400',
  processing: 'bg-blue-500/20 text-blue-400',
  shipped: 'bg-indigo-500/20 text-indigo-400',
  delivered: 'bg-emerald-500/20 text-emerald-400',
  cancelled: 'bg-red-500/20 text-red-400',
  refunded: 'bg-purple-500/20 text-purple-400',
};

// ─── Main Component ─────────────────────────────
export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [paySettings, setPaySettings] = useState<PaymentSettings>({
    id: 'main', currency: 'USD', taxRate: 0, flatShipping: 5.00,
    freeShippingThreshold: 50, stripeEnabled: true, paypalEnabled: false, allowGuestCheckout: false,
  });
  const [paySettingsSaved, setPaySettingsSaved] = useState(false);
  const [discountModal, setDiscountModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<DiscountCode | null>(null);
  const [discountForm, setDiscountForm] = useState<Partial<DiscountCode>>({
    code: '', type: 'percent', value: 10, minOrder: 0, maxUses: 100, currentUses: 0,
    validFrom: '', validUntil: '', enabled: true,
  });
  const [orderFilter, setOrderFilter] = useState<string>('all');

  useEffect(() => {
    const unsubs: (() => void)[] = [];
    unsubs.push(onSnapshot(collection(db, 'orders'), (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'orders')));
    unsubs.push(onSnapshot(collection(db, 'discount_codes'), (snap) => {
      setDiscounts(snap.docs.map(d => ({ id: d.id, ...d.data() } as DiscountCode)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'discount_codes')));
    unsubs.push(onSnapshot(collection(db, 'payment_settings'), (snap) => {
      if (snap.docs.length > 0) setPaySettings({ id: snap.docs[0].id, ...snap.docs[0].data() } as PaymentSettings);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'payment_settings')));
    return () => unsubs.forEach(u => u());
  }, []);

  const savePaySettings = async () => {
    try {
      await setDoc(doc(db, 'payment_settings', paySettings.id), { ...paySettings, updatedAt: serverTimestamp() });
      setPaySettingsSaved(true); setTimeout(() => setPaySettingsSaved(false), 2000);
    } catch (err) { handleFirestoreError(err, OperationType.WRITE, 'payment_settings'); }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try { await updateDoc(doc(db, 'orders', orderId), { status, updatedAt: serverTimestamp() }); }
    catch (err) { handleFirestoreError(err, OperationType.WRITE, 'orders'); }
  };

  const openDiscountModal = (d?: DiscountCode) => {
    if (d) { setEditingDiscount(d); setDiscountForm(d); }
    else { setEditingDiscount(null); setDiscountForm({ code: '', type: 'percent', value: 10, minOrder: 0, maxUses: 100, currentUses: 0, validFrom: '', validUntil: '', enabled: true }); }
    setDiscountModal(true);
  };

  const saveDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { code: discountForm.code?.toUpperCase(), type: discountForm.type, value: discountForm.value, minOrder: discountForm.minOrder, maxUses: discountForm.maxUses, currentUses: discountForm.currentUses ?? 0, validFrom: discountForm.validFrom, validUntil: discountForm.validUntil, enabled: discountForm.enabled ?? true };
      if (editingDiscount) await setDoc(doc(db, 'discount_codes', editingDiscount.id), data, { merge: true });
      else await setDoc(doc(collection(db, 'discount_codes')), { ...data, createdAt: serverTimestamp() });
      setDiscountModal(false);
    } catch (err) { handleFirestoreError(err, OperationType.WRITE, 'discount_codes'); }
  };

  const deleteDiscount = async (id: string) => {
    if (window.confirm('Delete this discount code?')) {
      try { await deleteDoc(doc(db, 'discount_codes', id)); }
      catch (err) { handleFirestoreError(err, OperationType.DELETE, 'discount_codes'); }
    }
  };

  const filteredOrders = orderFilter === 'all' ? orders : orders.filter(o => o.status === orderFilter);
  const inputClass = 'w-full bg-void-black border border-border/50 rounded-xl px-4 py-3 text-text-primary focus:border-starforge-gold/50 outline-none transition-all';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 bg-surface border border-border/50 rounded-3xl p-8">
        <div className="w-12 h-12 rounded-full bg-starforge-gold/10 flex items-center justify-center border border-starforge-gold/20">
          <ShoppingCart className="w-6 h-6 text-starforge-gold" />
        </div>
        <div>
          <h2 className="font-heading text-2xl text-text-primary">Orders & Payments</h2>
          <p className="font-ui text-text-secondary text-sm">Manage orders, discount codes, and payment configuration.</p>
        </div>
      </div>

      {/* ═══ 1. Payment Configuration ═══ */}
      <Panel title="Payment Configuration" icon={CreditCard} defaultOpen>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Currency</label>
              <select value={paySettings.currency} onChange={e => setPaySettings({ ...paySettings, currency: e.target.value })} className={inputClass}>
                <option value="USD">USD ($)</option><option value="EUR">EUR (€)</option><option value="GBP">GBP (£)</option><option value="CAD">CAD (C$)</option>
              </select>
            </div>
            <div>
              <label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Tax Rate (%)</label>
              <input type="number" step="0.01" min="0" max="30" value={paySettings.taxRate} onChange={e => setPaySettings({ ...paySettings, taxRate: Number(e.target.value) })} className={inputClass} />
            </div>
            <div>
              <label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Flat Shipping ($)</label>
              <input type="number" step="0.01" min="0" value={paySettings.flatShipping} onChange={e => setPaySettings({ ...paySettings, flatShipping: Number(e.target.value) })} className={inputClass} />
            </div>
            <div>
              <label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Free Shipping At ($)</label>
              <input type="number" step="1" min="0" value={paySettings.freeShippingThreshold} onChange={e => setPaySettings({ ...paySettings, freeShippingThreshold: Number(e.target.value) })} className={inputClass} />
            </div>
          </div>

          {/* ═══ Stripe API Keys ═══ */}
          <div className="bg-void-black/50 border border-border/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="w-4 h-4 text-starforge-gold" />
              <span className="font-ui text-xs text-starforge-gold uppercase tracking-wider font-semibold">Stripe API Keys</span>
            </div>
            <div>
              <label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Publishable Key</label>
              <input type="text" value={(paySettings as any).stripePublishableKey || ''} onChange={e => setPaySettings({ ...paySettings, stripePublishableKey: e.target.value } as any)} className={inputClass} placeholder="pk_live_..." />
            </div>
            <div>
              <label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Secret Key</label>
              <div className="relative">
                <input type={(paySettings as any).showSecretKey ? 'text' : 'password'} value={(paySettings as any).stripeSecretKey || ''} onChange={e => setPaySettings({ ...paySettings, stripeSecretKey: e.target.value } as any)} className={`${inputClass} pr-12`} placeholder="sk_live_..." />
                <button type="button" onClick={() => setPaySettings({ ...paySettings, showSecretKey: !(paySettings as any).showSecretKey } as any)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                  {(paySettings as any).showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Webhook Secret</label>
              <input type="password" value={(paySettings as any).stripeWebhookSecret || ''} onChange={e => setPaySettings({ ...paySettings, stripeWebhookSecret: e.target.value } as any)} className={inputClass} placeholder="whsec_..." />
            </div>
            <p className="text-[10px] text-text-muted flex items-center gap-1.5"><AlertCircle className="w-3 h-3" /> Keys are stored encrypted in Firestore. Get them from <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noreferrer" className="text-starforge-gold hover:underline">dashboard.stripe.com</a></p>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={paySettings.stripeEnabled} onChange={e => setPaySettings({ ...paySettings, stripeEnabled: e.target.checked })} className="accent-starforge-gold" />
              <span className="text-sm text-text-secondary">Stripe payments</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={paySettings.paypalEnabled} onChange={e => setPaySettings({ ...paySettings, paypalEnabled: e.target.checked })} className="accent-starforge-gold" />
              <span className="text-sm text-text-secondary">PayPal payments</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={paySettings.allowGuestCheckout} onChange={e => setPaySettings({ ...paySettings, allowGuestCheckout: e.target.checked })} className="accent-starforge-gold" />
              <span className="text-sm text-text-secondary">Guest checkout</span>
            </label>
          </div>
          <button onClick={savePaySettings}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-ui text-sm font-medium transition-all ${paySettingsSaved ? 'bg-aurora-teal text-void-black' : 'bg-starforge-gold text-void-black hover:bg-starforge-gold/90'}`}>
            <Save className="w-4 h-4" /> {paySettingsSaved ? 'Saved!' : 'Save Config'}
          </button>
        </div>
      </Panel>

      {/* ═══ 2. Discount Codes ═══ */}
      <Panel title="Discount Codes" icon={Tag} count={discounts.length}>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="font-ui text-xs text-text-muted">Promo codes for cart discounts.</p>
            <button onClick={() => openDiscountModal()}
              className="flex items-center gap-1.5 px-4 py-2 bg-starforge-gold text-void-black rounded-xl font-ui text-sm font-medium hover:bg-starforge-gold/90 transition-all">
              <Plus className="w-3.5 h-3.5" /> New Code
            </button>
          </div>
          {discounts.length === 0 && (
            <div className="text-center py-8 text-text-muted font-ui text-sm">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" /> No discount codes.
            </div>
          )}
          {discounts.map(d => (
            <div key={d.id} className={`flex items-center gap-4 bg-surface-elevated border border-border/50 rounded-xl px-4 py-3 ${!d.enabled ? 'opacity-50' : ''}`}>
              <span className="font-mono text-sm font-bold text-starforge-gold bg-starforge-gold/10 px-3 py-1 rounded-lg">{d.code}</span>
              <span className="text-sm text-text-secondary">{d.type === 'percent' ? `${d.value}% off` : `$${d.value} off`}</span>
              <span className="text-xs text-text-muted">Min: ${d.minOrder}</span>
              <span className="text-xs text-text-muted">{d.currentUses}/{d.maxUses} uses</span>
              <div className="flex gap-1 ml-auto">
                <button onClick={() => openDiscountModal(d)} className="p-1.5 text-text-muted hover:text-starforge-gold"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => deleteDiscount(d.id)} className="p-1.5 text-text-muted hover:text-forge-red"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* ═══ 3. Orders ═══ */}
      <Panel title="Order Management" icon={Package} count={orders.length}>
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'].map(s => (
              <button key={s} onClick={() => setOrderFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-ui capitalize transition-all border ${orderFilter === s ? 'bg-starforge-gold/10 text-starforge-gold border-starforge-gold/30' : 'bg-surface-elevated text-text-muted border-border/50 hover:text-text-primary'}`}>
                {s}
              </button>
            ))}
          </div>
          {filteredOrders.length === 0 && (
            <div className="text-center py-8 text-text-muted font-ui text-sm">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" /> No orders found.
            </div>
          )}
          {filteredOrders.map(order => (
            <div key={order.id} className="bg-surface-elevated border border-border/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-mono text-xs text-text-muted">#{order.id.slice(0, 8)}</span>
                  <span className="font-ui text-sm text-text-primary ml-3">{order.customerName}</span>
                  <span className="font-ui text-xs text-text-muted ml-2">{order.customerEmail}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-lg text-starforge-gold font-semibold">${order.total.toFixed(2)}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-ui uppercase tracking-wider ${STATUS_COLORS[order.status] || ''}`}>{order.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span>{order.items?.length || 0} items</span>
                <span>·</span>
                <span>{order.paymentMethod || 'Stripe'}</span>
              </div>
              {order.status !== 'delivered' && order.status !== 'cancelled' && order.status !== 'refunded' && (
                <div className="flex gap-2 mt-3">
                  {order.status === 'pending' && <button onClick={() => updateOrderStatus(order.id, 'processing')} className="px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-ui hover:bg-blue-500/20 transition-all">Mark Processing</button>}
                  {order.status === 'processing' && <button onClick={() => updateOrderStatus(order.id, 'shipped')} className="px-3 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg text-xs font-ui hover:bg-indigo-500/20 transition-all">Mark Shipped</button>}
                  {order.status === 'shipped' && <button onClick={() => updateOrderStatus(order.id, 'delivered')} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-ui hover:bg-emerald-500/20 transition-all">Mark Delivered</button>}
                  <button onClick={() => updateOrderStatus(order.id, 'cancelled')} className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-xs font-ui hover:bg-red-500/20 transition-all">Cancel</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </Panel>

      {/* Discount Code Modal */}
      <AdminModal isOpen={discountModal} onClose={() => setDiscountModal(false)}
        title={editingDiscount ? 'Edit Discount Code' : 'Create Discount Code'}>
        <form onSubmit={saveDiscount} className="space-y-6">
          <FormSection title="Code Details">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Code">
                <input type="text" required value={discountForm.code} onChange={e => setDiscountForm({ ...discountForm, code: e.target.value.toUpperCase() })} className={`${inputClass} font-mono`} placeholder="e.g. SPRING20" />
              </FormField>
              <FormField label="Type">
                <select value={discountForm.type} onChange={e => setDiscountForm({ ...discountForm, type: e.target.value as any })} className={inputClass}>
                  <option value="percent">Percentage (%)</option><option value="fixed">Fixed Amount ($)</option>
                </select>
              </FormField>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormField label={discountForm.type === 'percent' ? 'Discount %' : 'Discount $'}>
                <input type="number" step="0.01" min="0" required value={discountForm.value} onChange={e => setDiscountForm({ ...discountForm, value: Number(e.target.value) })} className={inputClass} />
              </FormField>
              <FormField label="Minimum Order ($)">
                <input type="number" step="0.01" min="0" value={discountForm.minOrder} onChange={e => setDiscountForm({ ...discountForm, minOrder: Number(e.target.value) })} className={inputClass} />
              </FormField>
              <FormField label="Max Uses">
                <input type="number" min="1" value={discountForm.maxUses} onChange={e => setDiscountForm({ ...discountForm, maxUses: Number(e.target.value) })} className={inputClass} />
              </FormField>
            </div>
          </FormSection>
          <FormSection title="Validity">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Valid From">
                <input type="date" value={discountForm.validFrom} onChange={e => setDiscountForm({ ...discountForm, validFrom: e.target.value })} className={inputClass} />
              </FormField>
              <FormField label="Valid Until">
                <input type="date" value={discountForm.validUntil} onChange={e => setDiscountForm({ ...discountForm, validUntil: e.target.value })} className={inputClass} />
              </FormField>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={discountForm.enabled} onChange={e => setDiscountForm({ ...discountForm, enabled: e.target.checked })} className="accent-starforge-gold" />
              <span className="text-sm text-text-secondary">Code is active</span>
            </label>
          </FormSection>
          <div className="flex gap-4 pt-4">
            <button type="submit" className="flex-1 py-4 bg-starforge-gold text-void-black rounded-xl font-ui font-bold uppercase tracking-widest hover:bg-starforge-gold/90 transition-all">
              {editingDiscount ? 'Update Code' : 'Create Code'}
            </button>
            <button type="button" onClick={() => setDiscountModal(false)} className="px-8 py-4 bg-surface-elevated text-text-primary rounded-xl font-ui font-bold uppercase tracking-widest border border-border/50 hover:bg-surface transition-all">Cancel</button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
