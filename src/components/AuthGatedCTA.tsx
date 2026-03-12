import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface AuthGatedCTAProps {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    subtitle: string;
    ctaText?: string;
    ctaLink?: string;
    accentColor?: string; // e.g. 'violet', 'emerald', 'aurora-teal', 'rose', 'starforge-gold'
    children?: React.ReactNode; // optional extra content below subtitle
}

const ACCENT_MAP: Record<string, { text: string; bg: string; border: string; glow: string }> = {
    violet: { text: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', glow: 'from-violet-500/[0.06]' },
    emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', glow: 'from-emerald-500/[0.06]' },
    'aurora-teal': { text: 'text-aurora-teal', bg: 'bg-aurora-teal/10', border: 'border-aurora-teal/20', glow: 'from-aurora-teal/[0.06]' },
    rose: { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', glow: 'from-rose-500/[0.06]' },
    'starforge-gold': { text: 'text-starforge-gold', bg: 'bg-starforge-gold/10', border: 'border-starforge-gold/20', glow: 'from-starforge-gold/[0.06]' },
    amber: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', glow: 'from-amber-500/[0.06]' },
};

export default function AuthGatedCTA({
    icon: Icon,
    title,
    subtitle,
    ctaText = 'Sign In to Get Started',
    ctaLink = '/portal',
    accentColor = 'violet',
    children,
}: AuthGatedCTAProps) {
    const accent = ACCENT_MAP[accentColor] || ACCENT_MAP.violet;

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className={`max-w-lg w-full text-center p-10 bg-gradient-to-br ${accent.glow} to-transparent border ${accent.border} rounded-2xl`}
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 12, delay: 0.2 }}
                    className={`w-20 h-20 rounded-2xl ${accent.bg} flex items-center justify-center mx-auto mb-6`}
                >
                    <Icon className={`w-10 h-10 ${accent.text}`} />
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-2xl font-display text-white tracking-wide mb-3"
                >
                    {title}
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-sm text-text-secondary leading-relaxed mb-8"
                >
                    {subtitle}
                </motion.p>

                {children && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mb-8"
                    >
                        {children}
                    </motion.div>
                )}

                <motion.a
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    href={ctaLink}
                    className={`inline-flex items-center gap-2 px-8 py-3 ${accent.bg} ${accent.text} text-sm font-semibold uppercase tracking-wider border ${accent.border} rounded-lg hover:brightness-125 transition-all`}
                >
                    {ctaText}
                    <ArrowRight className="w-4 h-4" />
                </motion.a>
            </motion.div>
        </div>
    );
}
