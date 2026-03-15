import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Check, Sparkles, Crown, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { createSubscription, cancelSubscription, type UserSubscription, type SubscriptionPlan } from '../lib/stripe';

interface MembershipTier {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
  order?: number;
}

const ICON_MAP: Record<number, any> = { 0: Star, 1: Sparkles, 2: Crown };
const COLOR_MAP: Record<number, { color: string; bg: string; border: string; button: string }> = {
  0: { color: 'text-aurora-teal', bg: 'bg-aurora-teal/10', border: 'border-aurora-teal/30', button: 'bg-aurora-teal text-void-black hover:bg-white' },
  1: { color: 'text-starforge-gold', bg: 'bg-starforge-gold/10', border: 'border-starforge-gold', button: 'bg-starforge-gold text-void-black hover:bg-white' },
  2: { color: 'text-queer-purple', bg: 'bg-queer-purple/10', border: 'border-queer-purple/30', button: 'bg-queer-purple text-white hover:bg-white hover:text-void-black' },
};

export default function Membership() {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [currentSub, setCurrentSub] = useState<UserSubscription | null>(null);
  const [processingTier, setProcessingTier] = useState<string | null>(null);
  const [successTier, setSuccessTier] = useState<string | null>(null);

  // Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Load tiers from Firestore
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'membership_tiers'),
      (snap) => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as MembershipTier));
        setTiers(data.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
        setLoading(false);
      },
      (err) => { handleFirestoreError(err, OperationType.LIST, 'membership_tiers'); setLoading(false); }
    );
    return () => unsub();
  }, []);

  // Load current subscription
  useEffect(() => {
    if (!user) { setCurrentSub(null); return; }
    const unsub = onSnapshot(
      query(
        collection(db, 'subscriptions'),
        where('userId', '==', user.uid),
        where('status', 'in', ['active', 'trialing'])
      ),
      (snap) => {
        if (snap.docs.length > 0) {
          setCurrentSub({ id: snap.docs[0].id, ...snap.docs[0].data() } as UserSubscription);
        } else {
          setCurrentSub(null);
        }
      },
      () => setCurrentSub(null)
    );
    return () => unsub();
  }, [user]);

  const handleSubscribe = async (tier: MembershipTier) => {
    if (!user) { navigate('/portal'); return; }
    if (currentSub?.planId === tier.id) return;

    setProcessingTier(tier.id);
    try {
      const plan: SubscriptionPlan = {
        id: tier.id,
        name: tier.name,
        price: billingCycle === 'annual' ? Math.round(tier.price * 12 * 0.8) : tier.price,
        interval: billingCycle === 'annual' ? 'year' : 'month',
        features: tier.features,
      };
      await createSubscription(plan);
      setSuccessTier(tier.id);
      setTimeout(() => setSuccessTier(null), 3000);
    } catch (err) {
      console.error('Subscription error:', err);
      alert('Subscription failed. Please try again.');
    } finally {
      setProcessingTier(null);
    }
  };

  const handleCancel = async () => {
    if (!currentSub) return;
    if (!window.confirm('Are you sure you want to cancel your subscription?')) return;
    try {
      await cancelSubscription(currentSub.id);
    } catch (err) {
      console.error('Cancel error:', err);
    }
  };

  if (loading) {
    return (
      <div className="bg-void-black min-h-screen py-16 flex items-center justify-center">
        <div className="text-starforge-gold font-ui text-xl uppercase tracking-widest animate-pulse">Loading Membership...</div>
      </div>
    );
  }

  return (
    <div className="bg-void-black min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="font-display text-4xl md:text-6xl text-text-primary uppercase tracking-widest mb-4">
            Join the <span className="text-starforge-gold italic font-heading normal-case">Constellation</span>
          </h1>
          <p className="font-ui text-text-secondary tracking-widest uppercase text-sm max-w-2xl mx-auto leading-relaxed">
            Support marginalized voices and gain exclusive access to the forge. Your patronage directly funds our authors and artists.
          </p>
        </div>

        {/* Current Subscription Banner */}
        {currentSub && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-10 p-5 bg-starforge-gold/5 border border-starforge-gold/20 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-starforge-gold" />
              <div>
                <p className="text-sm font-semibold text-white">You're a <span className="text-starforge-gold">{currentSub.planName}</span> member</p>
                <p className="text-[10px] text-text-secondary uppercase tracking-wider">Active subscription</p>
              </div>
            </div>
            <button onClick={handleCancel}
              className="px-4 py-2 bg-white/[0.06] text-text-secondary text-xs font-ui uppercase tracking-wider rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors">
              Cancel Plan
            </button>
          </motion.div>
        )}

        {/* Billing Toggle */}
        <div className="flex justify-center mb-16">
          <div className="bg-surface border border-border p-1 rounded-full inline-flex items-center">
            <button 
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full font-ui text-sm uppercase tracking-wider transition-colors ${billingCycle === 'monthly' ? 'bg-starforge-gold text-void-black font-semibold' : 'text-text-secondary hover:text-text-primary'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-full font-ui text-sm uppercase tracking-wider transition-colors flex items-center gap-2 ${billingCycle === 'annual' ? 'bg-starforge-gold text-void-black font-semibold' : 'text-text-secondary hover:text-text-primary'}`}
            >
              Annual <span className="bg-forge-red text-white text-[10px] px-2 py-0.5 rounded-full">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 max-w-6xl mx-auto">
          {tiers.map((tier, idx) => {
            const colorIdx = Math.min(idx, 2);
            const Icon = ICON_MAP[colorIdx] || Star;
            const colors = COLOR_MAP[colorIdx] || COLOR_MAP[0];
            const monthlyPrice = tier.price;
            const price = billingCycle === 'annual' ? `$${Math.round(monthlyPrice * 12 * 0.8)}` : `$${monthlyPrice}`;
            const period = billingCycle === 'annual' ? '/year' : '/month';
            const isCurrentPlan = currentSub?.planId === tier.id;
            const isProcessing = processingTier === tier.id;
            const isSuccess = successTier === tier.id;

            return (
              <motion.div 
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`relative bg-surface border rounded-sm p-8 flex flex-col ${colors.border} ${tier.popular ? 'shadow-2xl shadow-starforge-gold/10 scale-105 z-10' : ''}`}
              >
                {tier.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-starforge-gold text-void-black px-4 py-1 rounded-full font-ui text-[10px] uppercase tracking-widest font-semibold flex items-center gap-1">
                    <Star className="w-3 h-3" /> Most Popular
                  </div>
                )}
                
                <div className={`w-12 h-12 rounded-full ${colors.bg} flex items-center justify-center mb-6`}>
                  <Icon className={`w-6 h-6 ${colors.color}`} />
                </div>
                
                <h3 className="font-heading text-2xl text-text-primary mb-2">{tier.name}</h3>
                <p className="font-body text-sm text-text-secondary mb-6 h-10">{tier.description}</p>
                
                <div className="mb-8 flex items-baseline gap-1">
                  <span className="font-display text-4xl text-text-primary">{price}</span>
                  <span className="font-ui text-sm text-text-muted">{period}</span>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 shrink-0 ${colors.color}`} />
                      <span className="font-ui text-sm text-text-secondary leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => handleSubscribe(tier)}
                  disabled={isCurrentPlan || isProcessing}
                  className={`w-full py-3 rounded-sm font-ui text-sm uppercase tracking-wider font-semibold transition-all mt-auto
                    flex items-center justify-center gap-2
                    ${isCurrentPlan
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default'
                      : isSuccess
                        ? 'bg-emerald-500 text-white'
                        : isProcessing
                          ? 'opacity-60 cursor-wait ' + colors.button
                          : colors.button
                    }`}
                >
                  {isCurrentPlan ? (
                    <><CheckCircle className="w-4 h-4" /> Current Plan</>
                  ) : isSuccess ? (
                    <><CheckCircle className="w-4 h-4" /> Subscribed!</>
                  ) : isProcessing ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                  ) : !user ? (
                    <>Sign in to Subscribe</>
                  ) : (
                    <>Choose {tier.name}</>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto text-center border-t border-border pt-16">
          <h3 className="font-heading text-2xl text-text-primary mb-4">Why become a member?</h3>
          <p className="font-body text-lg text-text-secondary leading-relaxed mb-8">
            Traditional publishing often leaves marginalized authors behind. By subscribing directly to Rüna Atlas, you bypass the algorithms and gatekeepers, ensuring that 70% of your membership fee goes directly to our authors and editorial staff. You are not just buying books; you are funding a movement.
          </p>
          <button onClick={() => alert('Our transparency report is being compiled and will be published soon!')} className="inline-flex items-center gap-2 font-ui text-sm text-starforge-gold hover:text-white transition-colors uppercase tracking-wider pb-1 border-b border-starforge-gold/50">
            Read our Transparency Report <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
