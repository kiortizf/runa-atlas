import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Check, Sparkles, Crown, ArrowRight } from 'lucide-react';

const TIERS = [
  {
    id: 'stargazer',
    name: 'Stargazer',
    price: '$5',
    period: '/month',
    description: 'Support our mission and get early access to news.',
    features: [
      'Monthly newsletter with exclusive updates',
      'Early access to new release announcements',
      'Vote on community polls (anthology themes)',
      '10% discount on all ebooks'
    ],
    icon: Star,
    color: 'text-aurora-teal',
    bg: 'bg-aurora-teal/10',
    border: 'border-aurora-teal/30',
    button: 'bg-aurora-teal text-void-black hover:bg-white'
  },
  {
    id: 'navigator',
    name: 'Navigator',
    price: '$15',
    period: '/month',
    description: 'Dive deeper into the Runeweave with serialized content.',
    features: [
      'Everything in Stargazer',
      'Full access to all Serialized Releases',
      'Behind-the-scenes author diaries',
      'Join Reader Circles (Beta reading)',
      '15% discount on all physical books'
    ],
    icon: Sparkles,
    color: 'text-starforge-gold',
    bg: 'bg-starforge-gold/10',
    border: 'border-starforge-gold',
    button: 'bg-starforge-gold text-void-black hover:bg-white',
    popular: true
  },
  {
    id: 'architect',
    name: 'Architect',
    price: '$50',
    period: '/month',
    description: 'The ultimate collector\'s tier for true patrons of the forge.',
    features: [
      'Everything in Navigator',
      'One signed hardcover sent quarterly',
      'Exclusive collector\'s editions access',
      'Direct Q&A sessions with authors',
      'Name in the acknowledgments of anthologies'
    ],
    icon: Crown,
    color: 'text-queer-purple',
    bg: 'bg-queer-purple/10',
    border: 'border-queer-purple/30',
    button: 'bg-queer-purple text-white hover:bg-white hover:text-void-black'
  }
];

export default function Membership() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

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
          {TIERS.map((tier, idx) => {
            const Icon = tier.icon;
            const price = billingCycle === 'annual' 
              ? `$${parseInt(tier.price.replace('$', '')) * 12 * 0.8}` 
              : tier.price;
            const period = billingCycle === 'annual' ? '/year' : '/month';

            return (
              <motion.div 
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`relative bg-surface border rounded-sm p-8 flex flex-col ${tier.border} ${tier.popular ? 'shadow-2xl shadow-starforge-gold/10 scale-105 z-10' : ''}`}
              >
                {tier.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-starforge-gold text-void-black px-4 py-1 rounded-full font-ui text-[10px] uppercase tracking-widest font-semibold flex items-center gap-1">
                    <Star className="w-3 h-3" /> Most Popular
                  </div>
                )}
                
                <div className={`w-12 h-12 rounded-full ${tier.bg} flex items-center justify-center mb-6`}>
                  <Icon className={`w-6 h-6 ${tier.color}`} />
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
                      <Check className={`w-5 h-5 shrink-0 ${tier.color}`} />
                      <span className="font-ui text-sm text-text-secondary leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button className={`w-full py-3 rounded-sm font-ui text-sm uppercase tracking-wider font-semibold transition-colors mt-auto ${tier.button}`}>
                  Choose {tier.name}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ or Additional Info */}
        <div className="max-w-3xl mx-auto text-center border-t border-border pt-16">
          <h3 className="font-heading text-2xl text-text-primary mb-4">Why become a member?</h3>
          <p className="font-body text-lg text-text-secondary leading-relaxed mb-8">
            Traditional publishing often leaves marginalized authors behind. By subscribing directly to Rüna Atlas, you bypass the algorithms and gatekeepers, ensuring that 70% of your membership fee goes directly to our authors and editorial staff. You are not just buying books; you are funding a movement.
          </p>
          <button className="inline-flex items-center gap-2 font-ui text-sm text-starforge-gold hover:text-white transition-colors uppercase tracking-wider pb-1 border-b border-starforge-gold/50">
            Read our Transparency Report <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
