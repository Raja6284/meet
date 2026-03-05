// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, MicOff, Camera, CameraOff } from 'lucide-react';
import Avatar from './Avatar';

export default function ParticipantList({
  isOpen,
  onClose,
  participants,
  localSocketId,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 360, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 360, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="w-full sm:w-[340px] md:w-[360px] h-full flex flex-col overflow-hidden rounded-2xl"
          style={{
            background: 'rgba(12,12,20,0.85)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,58,237,0.06)',
          }}
        >
          {/* Top shine line */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] tracking-tight">
              Participants ({participants.length})
            </h3>
            <button
              onClick={onClose}
              className="control-btn p-1.5 text-[var(--color-text-secondary)] hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-2 min-h-0 custom-scrollbar">
            {participants.map((p, i) => {
              const isLocal = p.socketId === localSocketId;
              return (
                <motion.div
                  key={p.socketId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, type: 'spring', stiffness: 400, damping: 25 }}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200"
                  style={{ cursor: 'default' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(124,58,237,0.06)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(124,58,237,0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <Avatar name={p.displayName} size="sm" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                        {p.displayName}
                      </span>
                      {isLocal && (
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(99,102,241,0.15))',
                            color: '#a78bfa',
                            border: '1px solid rgba(124,58,237,0.15)',
                          }}
                        >
                          You
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {p.isMuted ? (
                      <MicOff size={14} className="text-[var(--color-danger)]" />
                    ) : (
                      <Mic size={14} className="text-[var(--color-text-muted)]" />
                    )}
                    {p.isCameraOff ? (
                      <CameraOff size={14} className="text-[var(--color-danger)]" />
                    ) : (
                      <Camera size={14} className="text-[var(--color-text-muted)]" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
