// eslint-disable-next-line no-unused-vars -- motion is used via JSX member expressions
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, MicOff, Camera, CameraOff, Crown } from 'lucide-react';
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
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="
            w-[360px] h-full
            glass-heavy rounded-2xl
            flex flex-col
            shadow-2xl shadow-black/40
            overflow-hidden
          "
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Participants ({participants.length})
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={16} className="text-[var(--color-text-secondary)]" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-2 min-h-0">
            {participants.map((p) => {
              const isLocal = p.socketId === localSocketId;
              return (
                <motion.div
                  key={p.socketId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="
                    flex items-center gap-3 px-3 py-3
                    rounded-xl hover:bg-white/5
                    transition-colors duration-200
                  "
                >
                  <Avatar name={p.displayName} size="sm" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                        {p.displayName}
                      </span>
                      {isLocal && (
                        <span className="text-[10px] font-medium text-[var(--color-accent)] bg-[var(--color-accent)]/10 px-1.5 py-0.5 rounded-full">
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
