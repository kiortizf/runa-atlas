import { motion } from 'framer-motion';
import { Compass, ArrowLeft, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="bg-void-black min-h-screen flex items-center justify-center px-4">
            <div className="text-center max-w-lg">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-starforge-gold/10 border border-starforge-gold/20 flex items-center justify-center">
                        <Compass className="w-12 h-12 text-starforge-gold/60 animate-spin" style={{ animationDuration: '8s' }} />
                    </div>
                    <h1 className="font-display text-6xl md:text-8xl text-text-primary uppercase tracking-widest mb-2">
                        4<span className="text-starforge-gold">0</span>4
                    </h1>
                    <p className="font-heading text-xl text-text-secondary mb-2">Lost in the Void</p>
                    <p className="font-body text-sm text-text-muted max-w-md mx-auto leading-relaxed">
                        This page doesn't exist in our constellation. The stars may have shifted, 
                        or the link you followed has faded into the void.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="flex flex-col sm:flex-row gap-3 justify-center"
                >
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-starforge-gold text-void-black font-ui text-sm uppercase tracking-wider rounded-sm hover:bg-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Return Home
                    </Link>
                    <Link
                        to="/catalog"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border text-text-primary font-ui text-sm uppercase tracking-wider rounded-sm hover:border-starforge-gold/50 hover:text-starforge-gold transition-colors"
                    >
                        <BookOpen className="w-4 h-4" /> Browse Catalog
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
