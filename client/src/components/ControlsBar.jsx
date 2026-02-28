import { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Camera, CameraOff, Monitor, MonitorOff,
  MessageSquare, Users, MoreVertical, PhoneOff,
  UserCog, Volume2, AlertCircle,
} from 'lucide-react';

function Tooltip({ text, children }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 z-50"
          >
            <div
              className="px-3 py-1.5 rounded-lg whitespace-nowrap"
              style={{
                background: 'rgba(12,12,20,0.92)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              }}
            >
              <span className="text-[11px] font-medium text-white">{text}</span>
            </div>
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
      className="px-5 py-3 flex items-center justify-center gap-2 mx-auto rounded-2xl"
      style={{
        background: 'rgba(12,12,20,0.8)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(124,58,237,0.15)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 -4px 40px rgba(0,0,0,0.3), 0 0 60px rgba(124,58,237,0.05), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      {/* Mic */}
      <Tooltip text={isMuted ? 'Unmute' : 'Mute'}>
        <button
          onClick={onToggleMute}
          className={`control-btn p-3 ${isMuted ? 'bg-[var(--color-danger)] hover:bg-red-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
        >
          {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
      </Tooltip>

      {/* Camera */}
      <Tooltip text={isCameraOff ? 'Turn on camera' : 'Turn off camera'}>
        <button
          onClick={onToggleCamera}
          className={`control-btn p-3 ${isCameraOff ? 'bg-[var(--color-danger)] hover:bg-red-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
        >
          {isCameraOff ? <CameraOff size={20} /> : <Camera size={20} />}
        </button>
      </Tooltip>

      {/* Screen Share */}
      <Tooltip text={isScreenSharing ? 'Stop presenting' : 'Share screen'}>
        <button
          onClick={onToggleScreenShare}
          className={`control-btn p-3 ${isScreenSharing
            ? 'bg-purple-600 hover:bg-purple-500 text-white'
            : 'bg-white/10 hover:bg-white/20 text-white'
          }`}
          style={isScreenSharing ? { boxShadow: '0 0 16px rgba(124,58,237,0.4)' } : {}}
        >
          {isScreenSharing ? <MonitorOff size={20} /> : <Monitor size={20} />}
        </button>
      </Tooltip>

      {/* Divider */}
      <div className="w-px h-8 mx-1" style={{ background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.1), transparent)' }} />

      {/* Chat */}
      <Tooltip text="Chat">
        <button
          onClick={onToggleChat}
          className={`control-btn relative p-3 ${isChatOpen
            ? 'bg-purple-600/25 text-purple-400'
            : 'bg-white/10 hover:bg-white/20 text-white'
          }`}
        >
          <MessageSquare size={20} />
          {unreadCount > 0 && !isChatOpen && (
            <span
              className="absolute -top-1 -right-1 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center number-pop"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                boxShadow: '0 0 10px rgba(124,58,237,0.5)',
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </Tooltip>

      {/* Participants */}
      <Tooltip text="Participants">
        <button
          onClick={onToggleParticipants}
          className={`control-btn relative p-3 ${isParticipantsOpen
            ? 'bg-purple-600/25 text-purple-400'
            : 'bg-white/10 hover:bg-white/20 text-white'
          }`}
        >
          <Users size={20} />
          {participantCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-white/15 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {participantCount}
            </span>
          )}
        </button>
      </Tooltip>

      {/* More */}
      <div className="relative">
        <Tooltip text="More options">
          <button
            onClick={() => setShowMore(prev => !prev)}
            className="control-btn p-3 bg-white/10 hover:bg-white/20 text-white"
          >
            <MoreVertical size={20} />
          </button>
        </Tooltip>

        <AnimatePresence>
          {showMore && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="absolute bottom-full mb-2 right-0 rounded-xl py-2 min-w-[200px] z-50"
              style={{
                background: 'rgba(12,12,20,0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,58,237,0.08)',
              }}
            >
              {/* Shine line */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-sm text-[var(--color-text-primary)]"
                onClick={() => setShowMore(false)}
              >
                <UserCog size={16} className="text-purple-400" />
                Change display name
              </button>
              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-sm text-[var(--color-text-primary)]"
                onClick={() => setShowMore(false)}
              >
                <Volume2 size={16} className="text-purple-400" />
                Noise suppression
              </button>
              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-sm text-[var(--color-text-primary)]"
                onClick={() => setShowMore(false)}
              >
                <AlertCircle size={16} className="text-purple-400" />
                Report a problem
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Divider */}
      <div className="w-px h-8 mx-1" style={{ background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.1), transparent)' }} />

      {/* End Call */}
      <Tooltip text="Leave call">
        <button
          onClick={onEndCall}
          className="control-btn px-6 py-3 bg-[var(--color-danger)] hover:bg-red-500 text-white font-medium text-sm flex items-center gap-2"
          style={{ boxShadow: '0 0 20px rgba(239,68,68,0.25)' }}
        >
          <PhoneOff size={18} />
          <span className="hidden sm:inline">Leave</span>
        </button>
      </Tooltip>
    </motion.div>
  );
}
