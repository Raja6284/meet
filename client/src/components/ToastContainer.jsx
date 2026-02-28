// eslint-disable-next-line no-unused-vars -- motion is used via JSX member expressions
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X, UserPlus, UserMinus, Monitor } from 'lucide-react';

function getToastIcon(type) {
  switch (type) {
    case 'success': return <CheckCircle size={18} className="text-[var(--color-success)]" />;
    case 'error': return <AlertCircle size={18} className="text-[var(--color-danger)]" />;
    case 'join': return <UserPlus size={18} className="text-[var(--color-accent)]" />;
    case 'leave': return <UserMinus size={18} className="text-[var(--color-text-secondary)]" />;
    case 'screen': return <Monitor size={18} className="text-[var(--color-accent-light)]" />;
    default: return <Info size={18} className="text-[var(--color-accent)]" />;
  }
}

function Toast({ toast, onRemove }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="
        glass-heavy rounded-xl px-4 py-3 
        flex items-center gap-3 min-w-[280px] max-w-[380px]
        shadow-xl shadow-black/30
        cursor-pointer
      "
      onClick={() => onRemove(toast.id)}
    >
      {getToastIcon(toast.type)}
      <span className="text-sm text-[var(--color-text-primary)] font-medium flex-1">
        {toast.message}
      </span>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(toast.id); }}
        className="p-0.5 hover:bg-white/10 rounded transition-colors"
      >
        <X size={14} className="text-[var(--color-text-muted)]" />
      </button>
    </motion.div>
  );
}

export default function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
