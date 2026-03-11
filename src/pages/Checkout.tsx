import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
    ShoppingBag, CreditCard, Trash2, Plus, Minus, Tag,
    CheckCircle, ArrowRight, Lock, ShieldCheck, Truck, Gift,
    X, Loader2
} from 'lucide-react';
import {
    type CartItem,
    calculateOrderTotal,
    createCheckoutSession,
    completeOrder,
    formatCurrency
} from '../lib/stripe';

// ═══════════════════════════════════════════════════════════════
// CHECKOUT PAGE
// ═══════════════════════════════════════════════════════════════

export default function Checkout() {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [step, setStep] = useState<'review' | 'shipping' | 'payment' | 'confirmation'>('review');
    const [discountCode, setDiscountCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState<string | null>(null);
    const [orderTotals, setOrderTotals] = useState({ subtotal: 0, tax: 0, total: 0, discountAmount: 0 });
    const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);

    // Shipping form
    const [shipping, setShipping] = useState({
        name: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'US'
    });

    // Payment form (demo mode)
    const [payment, setPayment] = useState({
        cardNumber: '', expiry: '', cvc: '', nameOnCard: ''
    });

    // Load cart items from Firestore
    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, (user) => {
            if (!user) {
                setLoading(false);
                return;
            }
            const unsub = onSnapshot(
                query(collection(db, 'user_carts'), where('userId', '==', user.uid)),
                (snap) => {
                    const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as CartItem));
                    setCartItems(items);
                    setLoading(false);
                },
                () => setLoading(false)
            );
            return () => unsub();
        });
        return () => unsubAuth();
    }, []);

    // Calculate totals
    useEffect(() => {
        if (cartItems.length > 0) {
            calculateOrderTotal(cartItems, appliedDiscount || undefined).then(setOrderTotals);
        }
    }, [cartItems, appliedDiscount]);

    const hasPhysical = useMemo(() =>
        cartItems.some(i => i.format === 'hardcover' || i.format === 'paperback'),
        [cartItems]
    );

    const applyDiscount = async () => {
        if (!discountCode.trim()) return;
        const totals = await calculateOrderTotal(cartItems, discountCode.trim());
        if (totals.discountAmount > 0) {
            setAppliedDiscount(discountCode.trim().toUpperCase());
            setOrderTotals(totals);
        }
    };

    const removeDiscount = () => {
        setAppliedDiscount(null);
        setDiscountCode('');
        calculateOrderTotal(cartItems).then(setOrderTotals);
    };

    const handleCheckout = async () => {
        setProcessing(true);
        try {
            const orderId = await createCheckoutSession(
                cartItems,
                appliedDiscount || undefined,
                hasPhysical ? shipping : undefined
            );

            // Simulate payment processing (replace with real Stripe in production)
            await new Promise(r => setTimeout(r, 2000));

            await completeOrder(orderId);
            setCompletedOrderId(orderId);
            setStep('confirmation');
        } catch (err) {
            console.error('Checkout error:', err);
            alert('Checkout failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const canProceedToPayment = !hasPhysical || (
        shipping.name && shipping.line1 && shipping.city && shipping.state && shipping.postalCode
    );

    const canSubmitPayment = payment.cardNumber.length >= 16 && payment.expiry && payment.cvc && payment.nameOnCard;

    if (loading) {
        return (
            <div className="min-h-screen bg-void-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-starforge-gold animate-spin" />
            </div>
        );
    }

    // ── Confirmation Step ──
    if (step === 'confirmation') {
        return (
            <div className="min-h-screen bg-void-black text-white">
                <div className="max-w-2xl mx-auto px-6 py-20 text-center">
                    <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto mb-8">
                            <CheckCircle className="w-10 h-10 text-emerald-400" />
                        </div>
                        <h1 className="text-3xl font-display tracking-wide mb-4">Order Confirmed!</h1>
                        <p className="text-text-secondary mb-2">
                            Thank you for your purchase. Your books have been added to your library.
                        </p>
                        <p className="text-xs text-text-secondary mb-10">
                            Order ID: <span className="text-white font-mono">{completedOrderId}</span>
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Link to="/library"
                                className="px-6 py-3 bg-starforge-gold text-void-black text-sm font-semibold uppercase tracking-wider rounded-lg hover:bg-starforge-gold/90 transition-colors">
                                Go to Library
                            </Link>
                            <Link to="/catalog"
                                className="px-6 py-3 bg-white/[0.06] text-white text-sm font-semibold uppercase tracking-wider rounded-lg hover:bg-white/[0.1] transition-colors">
                                Continue Shopping
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-void-black text-white">
                <div className="max-w-2xl mx-auto px-6 py-20 text-center">
                    <ShoppingBag className="w-16 h-16 text-white/[0.1] mx-auto mb-6" />
                    <h1 className="text-2xl font-display tracking-wide mb-4">Your Cart is Empty</h1>
                    <p className="text-text-secondary mb-8">Explore our catalog to find your next great read.</p>
                    <Link to="/catalog"
                        className="px-6 py-3 bg-starforge-gold text-void-black text-sm font-semibold uppercase tracking-wider rounded-lg hover:bg-starforge-gold/90">
                        Browse Catalog
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-void-black text-white">
            <div className="max-w-6xl mx-auto px-6 py-12">
                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-2 mb-12">
                    {(['review', 'shipping', 'payment'] as const)
                        .filter(s => s !== 'shipping' || hasPhysical)
                        .map((s, idx, arr) => (
                            <div key={s} className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        const stepOrder = arr;
                                        const currentIdx = stepOrder.indexOf(step);
                                        const targetIdx = stepOrder.indexOf(s);
                                        if (targetIdx <= currentIdx) setStep(s);
                                    }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs uppercase tracking-wider font-ui transition-colors ${step === s
                                        ? 'bg-starforge-gold/10 text-starforge-gold border border-starforge-gold/30'
                                        : arr.indexOf(s) < arr.indexOf(step)
                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                            : 'bg-white/[0.04] text-text-secondary border border-white/[0.06]'
                                        }`}>
                                    {arr.indexOf(s) < arr.indexOf(step)
                                        ? <CheckCircle className="w-3.5 h-3.5" />
                                        : <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">{idx + 1}</span>
                                    }
                                    {s === 'review' ? 'Review' : s === 'shipping' ? 'Shipping' : 'Payment'}
                                </button>
                                {idx < arr.length - 1 && <ArrowRight className="w-4 h-4 text-white/[0.15]" />}
                            </div>
                        ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <AnimatePresence mode="wait">
                            {step === 'review' && (
                                <motion.div key="review" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                    <h2 className="text-xl font-display tracking-wide mb-6">Review Your Order</h2>
                                    <div className="space-y-4">
                                        {cartItems.map(item => (
                                            <div key={item.id} className="flex gap-4 p-4 bg-white/[0.03] border border-white/[0.06] rounded-lg">
                                                <div className="w-16 h-24 rounded bg-gradient-to-br from-white/[0.08] to-white/[0.02] flex items-center justify-center flex-none">
                                                    {item.cover ? (
                                                        <img src={item.cover} alt={item.title} className="w-full h-full object-cover rounded" />
                                                    ) : (
                                                        <ShoppingBag className="w-6 h-6 text-white/[0.2]" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-sm font-semibold text-white truncate">{item.title}</h3>
                                                    <p className="text-xs text-text-secondary">{item.author}</p>
                                                    <p className="text-[10px] text-text-secondary uppercase mt-1">{item.format}</p>
                                                </div>
                                                <div className="text-right flex-none">
                                                    <p className="text-sm font-semibold text-white">{formatCurrency(item.price * item.quantity)}</p>
                                                    <p className="text-xs text-text-secondary mt-1">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Discount Code */}
                                    <div className="mt-6 flex gap-2">
                                        {appliedDiscount ? (
                                            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                                <Tag className="w-4 h-4 text-emerald-400" />
                                                <span className="text-xs text-emerald-400 font-semibold">{appliedDiscount}</span>
                                                <span className="text-xs text-emerald-300">-{formatCurrency(orderTotals.discountAmount)}</span>
                                                <button onClick={removeDiscount} className="text-emerald-400/60 hover:text-emerald-400">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <input
                                                    value={discountCode}
                                                    onChange={e => setDiscountCode(e.target.value)}
                                                    placeholder="Discount code"
                                                    className="flex-1 px-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-starforge-gold/40"
                                                    onKeyDown={e => e.key === 'Enter' && applyDiscount()}
                                                />
                                                <button onClick={applyDiscount}
                                                    className="px-4 py-2 bg-white/[0.06] text-text-secondary text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-white/[0.1] hover:text-white">
                                                    Apply
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    <button onClick={() => setStep(hasPhysical ? 'shipping' : 'payment')}
                                        className="mt-8 w-full py-3 bg-starforge-gold text-void-black text-sm font-semibold uppercase tracking-wider rounded-lg hover:bg-starforge-gold/90 flex items-center justify-center gap-2">
                                        Continue <ArrowRight className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            )}

                            {step === 'shipping' && hasPhysical && (
                                <motion.div key="shipping" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                    <h2 className="text-xl font-display tracking-wide mb-6">Shipping Address</h2>
                                    <div className="space-y-4">
                                        <input value={shipping.name} onChange={e => setShipping(s => ({ ...s, name: e.target.value }))}
                                            placeholder="Full name" className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-starforge-gold/40" />
                                        <input value={shipping.line1} onChange={e => setShipping(s => ({ ...s, line1: e.target.value }))}
                                            placeholder="Address line 1" className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-starforge-gold/40" />
                                        <input value={shipping.line2} onChange={e => setShipping(s => ({ ...s, line2: e.target.value }))}
                                            placeholder="Address line 2 (optional)" className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-starforge-gold/40" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <input value={shipping.city} onChange={e => setShipping(s => ({ ...s, city: e.target.value }))}
                                                placeholder="City" className="px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-starforge-gold/40" />
                                            <input value={shipping.state} onChange={e => setShipping(s => ({ ...s, state: e.target.value }))}
                                                placeholder="State" className="px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-starforge-gold/40" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <input value={shipping.postalCode} onChange={e => setShipping(s => ({ ...s, postalCode: e.target.value }))}
                                                placeholder="ZIP Code" className="px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-starforge-gold/40" />
                                            <input value={shipping.country} onChange={e => setShipping(s => ({ ...s, country: e.target.value }))}
                                                placeholder="Country" className="px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-starforge-gold/40" />
                                        </div>
                                    </div>
                                    <button onClick={() => setStep('payment')} disabled={!canProceedToPayment}
                                        className="mt-8 w-full py-3 bg-starforge-gold text-void-black text-sm font-semibold uppercase tracking-wider rounded-lg hover:bg-starforge-gold/90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                        Continue to Payment <ArrowRight className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            )}

                            {step === 'payment' && (
                                <motion.div key="payment" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                    <h2 className="text-xl font-display tracking-wide mb-6">Payment Details</h2>
                                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg mb-6 flex items-center gap-3">
                                        <ShieldCheck className="w-5 h-5 text-emerald-400 flex-none" />
                                        <p className="text-xs text-emerald-300">Your payment information is encrypted and secure. We never store card details on our servers.</p>
                                    </div>
                                    <div className="space-y-4">
                                        <input value={payment.nameOnCard} onChange={e => setPayment(p => ({ ...p, nameOnCard: e.target.value }))}
                                            placeholder="Name on card" className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-starforge-gold/40" />
                                        <div className="relative">
                                            <input value={payment.cardNumber} onChange={e => setPayment(p => ({ ...p, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16) }))}
                                                placeholder="Card number" className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-starforge-gold/40 pr-12"
                                                maxLength={16} />
                                            <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <input value={payment.expiry} onChange={e => {
                                                let val = e.target.value.replace(/\D/g, '');
                                                if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2, 4);
                                                setPayment(p => ({ ...p, expiry: val }));
                                            }}
                                                placeholder="MM/YY" className="px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-starforge-gold/40"
                                                maxLength={5} />
                                            <input value={payment.cvc} onChange={e => setPayment(p => ({ ...p, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                                                placeholder="CVC" className="px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-starforge-gold/40"
                                                maxLength={4} />
                                        </div>
                                    </div>
                                    <button onClick={handleCheckout} disabled={processing || !canSubmitPayment}
                                        className="mt-8 w-full py-4 bg-gradient-to-r from-starforge-gold to-amber-500 text-void-black text-sm font-semibold uppercase tracking-wider rounded-lg hover:shadow-lg hover:shadow-starforge-gold/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all">
                                        {processing ? (
                                            <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                                        ) : (
                                            <><Lock className="w-4 h-4" /> Pay {formatCurrency(orderTotals.total)}</>
                                        )}
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 p-6 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                            <h3 className="text-sm font-ui uppercase tracking-wider text-text-secondary mb-4">Order Summary</h3>
                            <div className="space-y-3 mb-4">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex justify-between text-xs">
                                        <span className="text-white/80 truncate flex-1 mr-4">{item.title} × {item.quantity}</span>
                                        <span className="text-white flex-none">{formatCurrency(item.price * item.quantity)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-white/[0.06] pt-3 space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-text-secondary">Subtotal</span>
                                    <span className="text-white">{formatCurrency(orderTotals.subtotal)}</span>
                                </div>
                                {orderTotals.discountAmount > 0 && (
                                    <div className="flex justify-between text-xs">
                                        <span className="text-emerald-400">Discount</span>
                                        <span className="text-emerald-400">-{formatCurrency(orderTotals.discountAmount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xs">
                                    <span className="text-text-secondary">Tax (8%)</span>
                                    <span className="text-white">{formatCurrency(orderTotals.tax)}</span>
                                </div>
                                {hasPhysical && (
                                    <div className="flex justify-between text-xs">
                                        <span className="text-text-secondary">Shipping</span>
                                        <span className="text-emerald-400">Free</span>
                                    </div>
                                )}
                            </div>
                            <div className="border-t border-white/[0.06] pt-3 mt-3 flex justify-between">
                                <span className="text-sm font-semibold text-white">Total</span>
                                <span className="text-lg font-display text-starforge-gold">{formatCurrency(orderTotals.total)}</span>
                            </div>

                            {/* Trust badges */}
                            <div className="mt-6 space-y-2">
                                {[
                                    { icon: ShieldCheck, text: '256-bit SSL encryption' },
                                    { icon: Lock, text: 'PCI-DSS compliant' },
                                    { icon: Truck, text: 'Free shipping on physical books' },
                                    { icon: Gift, text: 'DRM-free digital books' },
                                ].map(({ icon: Icon, text }) => (
                                    <div key={text} className="flex items-center gap-2 text-[10px] text-text-secondary">
                                        <Icon className="w-3 h-3 flex-none" />
                                        <span>{text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
