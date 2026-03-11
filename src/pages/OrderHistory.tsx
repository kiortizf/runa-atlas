import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Package, CheckCircle, Clock, RefreshCw, CreditCard,
    ShoppingBag, ChevronDown, ChevronUp, BookOpen
} from 'lucide-react';
import {
    type Order,
    subscribeToOrders,
    formatCurrency
} from '../lib/stripe';

// ═══════════════════════════════════════════════════════════════
// ORDER HISTORY PAGE
// ═══════════════════════════════════════════════════════════════

export default function OrderHistory() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = subscribeToOrders((data) => {
            setOrders(data);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
        pending: { icon: Clock, color: 'text-amber-400 bg-amber-400/10', label: 'Pending' },
        paid: { icon: CheckCircle, color: 'text-emerald-400 bg-emerald-400/10', label: 'Paid' },
        fulfilled: { icon: Package, color: 'text-blue-400 bg-blue-400/10', label: 'Fulfilled' },
        refunded: { icon: RefreshCw, color: 'text-red-400 bg-red-400/10', label: 'Refunded' },
    };

    return (
        <div className="min-h-screen bg-void-black text-white">
            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 rounded-lg bg-starforge-gold/10 flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-starforge-gold" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-display tracking-wide">Order History</h1>
                        <p className="text-xs text-text-secondary">{orders.length} orders</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-16">
                        <div className="w-8 h-8 border-2 border-starforge-gold/30 border-t-starforge-gold rounded-full animate-spin mx-auto" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-16">
                        <ShoppingBag className="w-16 h-16 text-white/[0.1] mx-auto mb-6" />
                        <h2 className="text-xl font-display tracking-wide mb-3">No Orders Yet</h2>
                        <p className="text-text-secondary mb-8 text-sm">Your purchase history will appear here.</p>
                        <Link to="/catalog"
                            className="px-6 py-3 bg-starforge-gold text-void-black text-sm font-semibold uppercase tracking-wider rounded-lg hover:bg-starforge-gold/90">
                            Browse Catalog
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order, idx) => {
                            const isExpanded = expandedOrder === order.id;
                            const status = statusConfig[order.status] || statusConfig.pending;
                            const StatusIcon = status.icon;

                            return (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden"
                                >
                                    <button
                                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                        className="w-full p-5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors text-left"
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${status.color}`}>
                                            <StatusIcon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-semibold text-white">
                                                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                                </span>
                                                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${status.color}`}>
                                                    {status.label}
                                                </span>
                                            </div>
                                            <p className="text-xs text-text-secondary mt-1">
                                                {order.createdAt?.toDate
                                                    ? new Date(order.createdAt.toDate()).toLocaleDateString('en-US', {
                                                        year: 'numeric', month: 'long', day: 'numeric'
                                                    })
                                                    : 'Processing'
                                                }
                                            </p>
                                        </div>
                                        <span className="text-lg font-display text-starforge-gold">
                                            {formatCurrency(order.total)}
                                        </span>
                                        {isExpanded ? (
                                            <ChevronUp className="w-4 h-4 text-text-secondary" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4 text-text-secondary" />
                                        )}
                                    </button>

                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            className="px-5 pb-5 border-t border-white/[0.06]"
                                        >
                                            <div className="pt-4 space-y-3">
                                                {order.items.map((item, i) => (
                                                    <div key={i} className="flex items-center gap-3">
                                                        <div className="w-10 h-14 rounded bg-gradient-to-br from-white/[0.08] to-white/[0.02] flex items-center justify-center flex-none">
                                                            {item.cover ? (
                                                                <img src={item.cover} alt={item.title} className="w-full h-full object-cover rounded" />
                                                            ) : (
                                                                <BookOpen className="w-4 h-4 text-white/[0.2]" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs text-white truncate">{item.title}</p>
                                                            <p className="text-[10px] text-text-secondary">{item.author} · {item.format}</p>
                                                        </div>
                                                        <span className="text-xs text-white">{formatCurrency(item.price)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-4 pt-3 border-t border-white/[0.04] space-y-1 text-xs">
                                                <div className="flex justify-between">
                                                    <span className="text-text-secondary">Subtotal</span>
                                                    <span className="text-white">{formatCurrency(order.subtotal)}</span>
                                                </div>
                                                {order.discountAmount && order.discountAmount > 0 && (
                                                    <div className="flex justify-between">
                                                        <span className="text-emerald-400">Discount ({order.discountCode})</span>
                                                        <span className="text-emerald-400">-{formatCurrency(order.discountAmount)}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between">
                                                    <span className="text-text-secondary">Tax</span>
                                                    <span className="text-white">{formatCurrency(order.tax)}</span>
                                                </div>
                                                <div className="flex justify-between font-semibold pt-2 border-t border-white/[0.04]">
                                                    <span className="text-white">Total</span>
                                                    <span className="text-starforge-gold">{formatCurrency(order.total)}</span>
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-text-secondary mt-3 font-mono">
                                                Order ID: {order.id}
                                            </p>
                                        </motion.div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
