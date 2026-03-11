import { doc, setDoc, getDoc, collection, addDoc, serverTimestamp, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';

// ═══════════════════════════════════════════════════════════════
// STRIPE PAYMENT INTEGRATION
// ═══════════════════════════════════════════════════════════════
// This module handles Stripe Checkout Sessions via Firestore.
// Pattern: Client writes to `checkout_sessions` → Extension triggers
// Stripe → Webhook writes result back to Firestore.
// For standalone use without Firebase Extensions, replace with
// direct Stripe.js calls + Cloud Functions.
// ═══════════════════════════════════════════════════════════════

export interface CartItem {
    id: string;
    title: string;
    author: string;
    price: number;
    cover: string;
    quantity: number;
    format: string;
}

export interface CheckoutSession {
    id: string;
    userId: string;
    items: CartItem[];
    subtotal: number;
    tax: number;
    total: number;
    discountCode?: string;
    discountAmount?: number;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    stripeSessionId?: string;
    stripePaymentIntentId?: string;
    createdAt: any;
    completedAt?: any;
}

export interface Order {
    id: string;
    userId: string;
    items: CartItem[];
    subtotal: number;
    tax: number;
    total: number;
    discountCode?: string;
    discountAmount?: number;
    status: 'pending' | 'paid' | 'fulfilled' | 'refunded';
    stripeSessionId?: string;
    stripePaymentIntentId?: string;
    shippingAddress?: {
        name: string;
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    createdAt: any;
    updatedAt?: any;
}

export interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    interval: 'month' | 'year';
    features: string[];
    stripePriceId?: string;
}

export interface UserSubscription {
    id: string;
    userId: string;
    planId: string;
    planName: string;
    status: 'active' | 'cancelled' | 'past_due' | 'trialing';
    currentPeriodStart: any;
    currentPeriodEnd: any;
    stripeSubscriptionId?: string;
    stripeCustomerId?: string;
    createdAt: any;
}

// ═══════════════════════════════════════════════════════════════
// CHECKOUT FLOW
// ═══════════════════════════════════════════════════════════════

const TAX_RATE = 0.08; // 8% tax

export async function calculateOrderTotal(items: CartItem[], discountCode?: string) {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    let discountAmount = 0;
    if (discountCode) {
        try {
            const discountSnap = await getDoc(doc(db, 'discount_codes', discountCode.toUpperCase()));
            if (discountSnap.exists()) {
                const discount = discountSnap.data();
                if (discount.active && (!discount.expiresAt || discount.expiresAt.toDate() > new Date())) {
                    if (discount.type === 'percentage') {
                        discountAmount = subtotal * (discount.value / 100);
                    } else if (discount.type === 'fixed') {
                        discountAmount = Math.min(discount.value, subtotal);
                    }
                }
            }
        } catch (e) {
            console.warn('Failed to validate discount code:', e);
        }
    }

    const discountedSubtotal = subtotal - discountAmount;
    const tax = Math.round(discountedSubtotal * TAX_RATE * 100) / 100;
    const total = Math.round((discountedSubtotal + tax) * 100) / 100;

    return {
        subtotal: Math.round(subtotal * 100) / 100,
        discountAmount: Math.round(discountAmount * 100) / 100,
        tax,
        total,
    };
}

export async function createCheckoutSession(
    items: CartItem[],
    discountCode?: string,
    shippingAddress?: Order['shippingAddress']
): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error('Must be signed in to checkout');

    const totals = await calculateOrderTotal(items, discountCode);

    // Create order in Firestore
    const orderRef = await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        userEmail: user.email,
        items: items.map(i => ({
            id: i.id,
            title: i.title,
            author: i.author,
            price: i.price,
            quantity: i.quantity,
            format: i.format,
            cover: i.cover,
        })),
        subtotal: totals.subtotal,
        tax: totals.tax,
        total: totals.total,
        discountCode: discountCode || null,
        discountAmount: totals.discountAmount,
        shippingAddress: shippingAddress || null,
        status: 'pending',
        createdAt: serverTimestamp(),
    });

    return orderRef.id;
}

export async function completeOrder(orderId: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Must be signed in');

    const orderSnap = await getDoc(doc(db, 'orders', orderId));
    if (!orderSnap.exists()) throw new Error('Order not found');

    const order = orderSnap.data();
    if (order.userId !== user.uid) throw new Error('Unauthorized');

    await setDoc(doc(db, 'orders', orderId), {
        ...order,
        status: 'paid',
        updatedAt: serverTimestamp(),
    });

    // Add books to user's library
    for (const item of order.items) {
        await addDoc(collection(db, 'user_libraries'), {
            userId: user.uid,
            bookId: item.id,
            title: item.title,
            author: item.author,
            cover: item.cover,
            format: item.format,
            purchasedAt: serverTimestamp(),
            orderId: orderId,
        });
    }

    // Clear user's cart
    const cartQuery = query(collection(db, 'user_carts'), where('userId', '==', user.uid));
    const cartSnap = await getDoc(doc(db, 'user_carts', `${user.uid}_cart`));
    if (cartSnap.exists()) {
        await setDoc(doc(db, 'user_carts', `${user.uid}_cart`), { userId: user.uid, items: [], updatedAt: serverTimestamp() });
    }
}

// ═══════════════════════════════════════════════════════════════
// SUBSCRIPTION FLOW
// ═══════════════════════════════════════════════════════════════

export async function createSubscription(plan: SubscriptionPlan): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error('Must be signed in to subscribe');

    const subRef = await addDoc(collection(db, 'subscriptions'), {
        userId: user.uid,
        userEmail: user.email,
        planId: plan.id,
        planName: plan.name,
        price: plan.price,
        interval: plan.interval,
        status: 'active',
        currentPeriodStart: serverTimestamp(),
        currentPeriodEnd: null, // Set by webhook
        createdAt: serverTimestamp(),
    });

    // Update user document with membership tier
    await setDoc(doc(db, 'users', user.uid), {
        membershipTier: plan.id,
        membershipName: plan.name,
        membershipStatus: 'active',
    }, { merge: true });

    return subRef.id;
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Must be signed in');

    await setDoc(doc(db, 'subscriptions', subscriptionId), {
        status: 'cancelled',
        cancelledAt: serverTimestamp(),
    }, { merge: true });

    await setDoc(doc(db, 'users', user.uid), {
        membershipStatus: 'cancelled',
    }, { merge: true });
}

// ═══════════════════════════════════════════════════════════════
// ORDER HISTORY
// ═══════════════════════════════════════════════════════════════

export function subscribeToOrders(
    callback: (orders: Order[]) => void
): () => void {
    const user = auth.currentUser;
    if (!user) {
        callback([]);
        return () => {};
    }

    return onSnapshot(
        query(
            collection(db, 'orders'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
        ),
        (snap) => {
            const orders = snap.docs.map(d => ({
                id: d.id,
                ...d.data(),
            } as Order));
            callback(orders);
        },
        () => callback([])
    );
}

export function subscribeToSubscription(
    callback: (sub: UserSubscription | null) => void
): () => void {
    const user = auth.currentUser;
    if (!user) {
        callback(null);
        return () => {};
    }

    return onSnapshot(
        query(
            collection(db, 'subscriptions'),
            where('userId', '==', user.uid),
            where('status', 'in', ['active', 'trialing']),
            orderBy('createdAt', 'desc')
        ),
        (snap) => {
            if (snap.docs.length > 0) {
                callback({ id: snap.docs[0].id, ...snap.docs[0].data() } as UserSubscription);
            } else {
                callback(null);
            }
        },
        () => callback(null)
    );
}

// ═══════════════════════════════════════════════════════════════
// PAYMENT SETTINGS (Admin)
// ═══════════════════════════════════════════════════════════════

export interface PaymentSettings {
    stripePublishableKey: string;
    stripeSecretKey: string;
    currency: string;
    taxRate: number;
    enableCoupons: boolean;
    enableShipping: boolean;
    shippingFee: number;
    freeShippingThreshold: number;
}

export async function getPaymentSettings(): Promise<PaymentSettings | null> {
    try {
        const snap = await getDoc(doc(db, 'payment_settings', 'config'));
        if (snap.exists()) return snap.data() as PaymentSettings;
        return null;
    } catch {
        return null;
    }
}

export async function updatePaymentSettings(settings: Partial<PaymentSettings>): Promise<void> {
    await setDoc(doc(db, 'payment_settings', 'config'), settings, { merge: true });
}

// Format currency
export function formatCurrency(amount: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount);
}
