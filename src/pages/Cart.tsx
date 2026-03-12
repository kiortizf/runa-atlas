import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Trash2, ArrowRight, CreditCard, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

interface CartItem {
  id: string;
  title: string;
  author: string;
  cover: string;
  format: string;
  price: number;
  quantity: number;
  editionType: string;
}

export default function Cart() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const auth = getAuth();
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) return;
      const unsubCart = onSnapshot(
        query(collection(db, 'user_carts'), where('userId', '==', user.uid)),
        (snap) => {
          setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as CartItem)));
        },
        () => { }
      );
      return () => unsubCart();
    });
    return () => unsubAuth();
  }, []);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setItems(items.map(item => item.id === id ? { ...item, quantity: newQuantity } : item));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 5.00; // Flat rate for physical items
  const total = subtotal + shipping;

  return (
    <div className="bg-void-black min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-12 flex items-center gap-4">
          <ShoppingCart className="w-8 h-8 text-starforge-gold" />
          <h1 className="font-display text-4xl text-text-primary uppercase tracking-widest">
            Your <span className="text-starforge-gold italic font-heading normal-case">Cart</span>
          </h1>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Items List */}
            <div className="lg:col-span-2 space-y-6">
              {items.map((item) => (
                <motion.div 
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col sm:flex-row gap-6 bg-surface border border-border p-6 rounded-sm"
                >
                  <div className="w-24 shrink-0">
                    <img src={item.cover} alt={item.title} className="w-full rounded-sm border border-border" referrerPolicy="no-referrer" />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-heading text-xl text-text-primary">{item.title}</h3>
                        <p className="font-mono text-lg text-starforge-gold">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <p className="font-ui text-sm text-text-secondary mb-2">{item.author}</p>
                      <div className="flex items-center gap-2">
                        {item.editionType !== 'Standard' && (
                          <span className="font-ui text-[10px] uppercase tracking-wider bg-starforge-gold/20 text-starforge-gold px-2 py-1 rounded-sm">
                            {item.editionType}
                          </span>
                        )}
                        <span className="font-ui text-[10px] uppercase tracking-wider bg-surface-elevated text-text-muted px-2 py-1 rounded-sm">
                          {item.format}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-6">
                      <div className="flex items-center border border-border rounded-sm bg-deep-space">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-1 text-text-secondary hover:text-white transition-colors"
                        >
                          -
                        </button>
                        <span className="font-mono text-sm px-3 border-x border-border">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-1 text-text-secondary hover:text-white transition-colors"
                        >
                          +
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-text-muted hover:text-forge-red transition-colors flex items-center gap-2 font-ui text-xs uppercase tracking-wider"
                      >
                        <Trash2 className="w-4 h-4" /> Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-surface border border-border p-6 rounded-sm sticky top-24">
                <h3 className="font-heading text-2xl text-text-primary mb-6 border-b border-border pb-4">Order Summary</h3>
                
                <div className="space-y-4 font-ui text-sm mb-6">
                  <div className="flex justify-between text-text-secondary">
                    <span>Subtotal ({items.length} items)</span>
                    <span className="font-mono text-text-primary">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Shipping</span>
                    <span className="font-mono text-text-primary">${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Taxes</span>
                    <span className="font-mono text-text-primary">Calculated at checkout</span>
                  </div>
                </div>
                
                <div className="border-t border-border pt-4 mb-8">
                  <div className="flex justify-between items-end">
                    <span className="font-ui text-sm uppercase tracking-wider text-text-primary">Total</span>
                    <span className="font-display text-3xl text-starforge-gold">${total.toFixed(2)}</span>
                  </div>
                </div>
                
                <button className="w-full py-4 bg-starforge-gold text-void-black font-ui font-semibold uppercase tracking-wider rounded-sm hover:bg-white transition-colors flex items-center justify-center gap-2 mb-4">
                  <Lock className="w-4 h-4" /> Secure Checkout
                </button>
                
                <div className="flex items-center justify-center gap-2 text-text-muted font-ui text-xs">
                  <CreditCard className="w-4 h-4" />
                  <span>Powered by Stripe</span>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="text-center py-32 bg-surface border border-border rounded-sm">
            <ShoppingCart className="w-16 h-16 text-text-muted mx-auto mb-6" />
            <h3 className="font-heading text-3xl text-text-primary mb-4">Your cart is empty</h3>
            <p className="font-body text-text-secondary mb-8">Looks like you haven't added any starpoints to your cart yet.</p>
            <Link to="/catalog" className="inline-flex items-center gap-2 px-8 py-3 bg-starforge-gold text-void-black font-ui font-semibold uppercase tracking-wider rounded-sm hover:bg-white transition-colors">
              Explore Catalog <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
