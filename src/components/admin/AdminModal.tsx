import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function AdminModal({ isOpen, onClose, title, children }: AdminModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-void-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-surface border border-border/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between p-6 border-b border-starforge-gold/20">
              <h2 className="font-heading text-2xl text-starforge-gold uppercase tracking-widest">{title}</h2>
              <button
                onClick={onClose}
                className="text-text-muted hover:text-white transition-colors p-2 rounded-full hover:bg-surface-elevated"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function FormSection({ title, children }: { title: string, children: ReactNode }) {
  return (
    <div className="mb-8 last:mb-0">
      <h3 className="font-ui text-sm text-starforge-gold uppercase tracking-widest mb-4 pb-2 border-b border-border/50">{title}</h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

export function FormField({ label, children }: { label: string, children: ReactNode }) {
  return (
    <div>
      <label className="block font-ui text-xs text-text-secondary uppercase tracking-wider mb-2">{label}</label>
      {children}
    </div>
  );
}
