// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, children, title, size = 'md' }) {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop — deep blur + vignette */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.8) 100%)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
            onClick={onClose}
          />

          {/* Modal content — glass + gradient border glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className={`relative w-full ${sizes[size]} max-h-[90vh] overflow-y-auto custom-scrollbar`}
          >
            {/* Animated gradient border */}
            <div
              className="absolute -inset-px rounded-2xl glow-spin opacity-60"
              style={{
                background: 'conic-gradient(from var(--glow-angle), #7c3aed, #6366f1, #8b5cf6, #a78bfa, #7c3aed)',
              }}
            />

            {/* Inner shell */}
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(12, 12, 20, 0.92)',
                boxShadow: '0 0 60px rgba(124,58,237,0.12), 0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
                backdropFilter: 'blur(24px)',
              }}
            >
              {/* Top shine line */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

              {/* Header */}
              {title && (
                <div className="flex items-center justify-between px-5 sm:px-6 pt-5 sm:pt-6 pb-0">
                  <h2 className="text-base sm:text-lg font-semibold text-[var(--color-text-primary)] tracking-tight">
                    {title}
                  </h2>
                  <button
                    onClick={onClose}
                    className="control-btn p-2 text-[var(--color-text-secondary)] hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}

              {/* Body */}
              <div className="p-5 sm:p-6">
                {children}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
