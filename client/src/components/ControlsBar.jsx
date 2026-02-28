import { useState } from 'react';
// eslint-disable-next-line no-unused-vars -- motion is used via JSX member expressions
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Camera, CameraOff, Monitor, MonitorOff,
  MessageSquare, Users, MoreVertical, PhoneOff, Hand,
  UserCog, Volume2, AlertCircle, X,
} from 'lucide-react';

function Tooltip({ text, children }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 glass-heavy rounded-lg whitespace-nowrap z-50"
          >
            <span className="text-[11px] font-medium text-[var(--color-text-primary)]">{text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ControlsBar({
  isMuted,
  isCameraOff,
  isScreenSharing,
  unreadCount = 0,
  participantCount = 0,
  onToggleMute,
  onToggleCamera,
  onToggleScreenShare,
  onToggleChat,
  onToggleParticipants,
  onEndCall,
  isChatOpen,
  isParticipantsOpen,
}) {
  const [showMore, setShowMore] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="
        glass-heavy rounded-2xl
        px-4 py-3
        flex items-center justify-center gap-2
        mx-auto
        shadow-2xl shadow-black/40
      "
    >
      {/* Mic */}
      <Tooltip text={isMuted ? 'Unmute' : 'Mute'}>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onToggleMute}
          className={`
            p-3 rounded-full transition-all duration-200
            ${isMuted
              ? 'bg-[var(--color-danger)] hover:bg-red-600 text-white'
              : 'bg-white/10 hover:bg-white/20 text-white'
            }
          `}
        >
          {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </motion.button>
      </Tooltip>

      {/* Camera */}
      <Tooltip text={isCameraOff ? 'Turn on camera' : 'Turn off camera'}>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onToggleCamera}
          className={`
            p-3 rounded-full transition-all duration-200
            ${isCameraOff
              ? 'bg-[var(--color-danger)] hover:bg-red-600 text-white'
              : 'bg-white/10 hover:bg-white/20 text-white'
            }
          `}
        >
          {isCameraOff ? <CameraOff size={20} /> : <Camera size={20} />}
        </motion.button>
      </Tooltip>

      {/* Screen Share */}
      <Tooltip text={isScreenSharing ? 'Stop presenting' : 'Share screen'}>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onToggleScreenShare}
          className={`
            p-3 rounded-full transition-all duration-200
            ${isScreenSharing
              ? 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-light)] text-white'
              : 'bg-white/10 hover:bg-white/20 text-white'
            }
          `}
        >
          {isScreenSharing ? <MonitorOff size={20} /> : <Monitor size={20} />}
        </motion.button>
      </Tooltip>

      {/* Divider */}
      <div className="w-px h-8 bg-white/10 mx-1" />

      {/* Chat */}
      <Tooltip text="Chat">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onToggleChat}
          className={`
            relative p-3 rounded-full transition-all duration-200
            ${isChatOpen
              ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]'
              : 'bg-white/10 hover:bg-white/20 text-white'
            }
          `}
        >
          <MessageSquare size={20} />
          {unreadCount > 0 && !isChatOpen && (
            <span className="absolute -top-1 -right-1 bg-[var(--color-accent)] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </motion.button>
      </Tooltip>

      {/* Participants */}
      <Tooltip text="Participants">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onToggleParticipants}
          className={`
            relative p-3 rounded-full transition-all duration-200
            ${isParticipantsOpen
              ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]'
              : 'bg-white/10 hover:bg-white/20 text-white'
            }
          `}
        >
          <Users size={20} />
          {participantCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-white/20 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {participantCount}
            </span>
          )}
        </motion.button>
      </Tooltip>

      {/* More */}
      <div className="relative">
        <Tooltip text="More options">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setShowMore(prev => !prev)}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200"
          >
            <MoreVertical size={20} />
          </motion.button>
        </Tooltip>

        <AnimatePresence>
          {showMore && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-full mb-2 right-0 glass-heavy rounded-xl py-2 min-w-[200px] shadow-xl z-50"
            >
              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-sm text-[var(--color-text-primary)]"
                onClick={() => setShowMore(false)}
              >
                <UserCog size={16} className="text-[var(--color-text-secondary)]" />
                Change display name
              </button>
              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-sm text-[var(--color-text-primary)]"
                onClick={() => setShowMore(false)}
              >
                <Volume2 size={16} className="text-[var(--color-text-secondary)]" />
                Noise suppression
              </button>
              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-sm text-[var(--color-text-primary)]"
                onClick={() => setShowMore(false)}
              >
                <AlertCircle size={16} className="text-[var(--color-text-secondary)]" />
                Report a problem
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-white/10 mx-1" />

      {/* End Call */}
      <Tooltip text="Leave call">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onEndCall}
          className="
            px-6 py-3 rounded-full
            bg-[var(--color-danger)] hover:bg-red-600
            text-white font-medium text-sm
            transition-all duration-200
            flex items-center gap-2
            shadow-lg shadow-red-500/20
          "
        >
          <PhoneOff size={18} />
          <span className="hidden sm:inline">Leave</span>
        </motion.button>
      </Tooltip>
    </motion.div>
  );
}
