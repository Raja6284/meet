// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X, UserPlus, UserMinus, Monitor } from 'lucide-react';

const toastConfig = {
  success: { icon: CheckCircle, color: '#22c55e', glowClass: 'toast-success' },
  error:   { icon: AlertCircle, color: '#ef4444', glowClass: 'toast-error' },
  join:    { icon: UserPlus,    color: '#7c3aed', glowClass: 'toast-join' },
  leave:   { icon: UserMinus,   color: '#94a3b8', glowClass: 'toast-leave' },
  screen:  { icon: Monitor,     color: '#8b5cf6', glowClass: 'toast-screen' },
  info:    { icon: Info,        color: '#6366f1', glowClass: 'toast-info' },
};

function Toast({ toast, onRemove }) {
  const cfg = toastConfig[toast.type] || toastConfig.info;
  const Icon = cfg.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`rounded-xl px-4 py-3 flex items-center gap-3 min-w-[280px] max-w-[380px] cursor-pointer ${cfg.glowClass}`}
      style={{
        background: 'rgba(12,12,20,0.9)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${cfg.color}10`,
      }}
      onClick={() => onRemove(toast.id)}
    >
      {/* Left accent bar */}
      <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full" style={{ background: cfg.color }} />

      <Icon size={18} style={{ color: cfg.color, flexShrink: 0 }} />
      <span className="text-sm text-[var(--color-text-primary)] font-medium flex-1">
        {toast.message}
      </span>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(toast.id); }}
        className="p-0.5 hover:bg-white/10 rounded transition-colors flex-shrink-0"
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
