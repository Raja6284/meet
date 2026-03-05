import { useRef, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { MicOff, Mic } from 'lucide-react';
import Avatar from './Avatar';

/**
 * Audio-only participant tile — shows avatar + speaking indicator, no video.
 */
export default function AudioTile({
  stream,
  displayName,
  isMuted,
  isLocal = false,
  isActiveSpeaker = false,
  className = '',
}) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current && stream && !isLocal) {
      audioRef.current.srcObject = stream;
    }
  }, [stream, isLocal]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`audio-tile relative flex flex-col items-center justify-center gap-2 sm:gap-3 rounded-2xl overflow-hidden p-4 sm:p-6 ${
        isActiveSpeaker ? 'speaker-active' : ''
      } ${className}`}
      style={{
        background: 'rgba(12,12,20,0.7)',
        border: isActiveSpeaker
          ? '2px solid rgba(124,58,237,0.5)'
          : '1px solid rgba(255,255,255,0.06)',
        boxShadow: isActiveSpeaker
          ? '0 0 30px rgba(124,58,237,0.15), 0 10px 40px rgba(0,0,0,0.3)'
          : '0 10px 40px rgba(0,0,0,0.3)',
        minHeight: '140px',
      }}
    >
      {/* Hidden audio element for remote streams */}
      {stream && !isLocal && (
        <audio ref={audioRef} autoPlay className="hidden" />
      )}

      {/* Speaking ring animation */}
      <div className={`relative ${isActiveSpeaker ? 'speaking-pulse' : ''}`}>
        <Avatar name={displayName} size="xl" />
        {isActiveSpeaker && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.3, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full"
            style={{
              border: '2px solid rgba(124,58,237,0.5)',
              boxShadow: '0 0 20px rgba(124,58,237,0.25)',
            }}
          />
        )}
      </div>

      {/* Name */}
      <span className="text-sm font-medium text-[var(--color-text-primary)] truncate max-w-[120px]">
        {isLocal ? 'You' : displayName}
      </span>

      {/* Mic status */}
      <div
        className="rounded-full p-1.5"
        style={{
          background: isMuted ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.12)',
        }}
      >
        {isMuted ? (
          <MicOff size={14} className="text-[var(--color-danger)]" />
        ) : (
          <Mic size={14} className="text-[var(--color-success)]" />
        )}
      </div>
    </motion.div>
  );
}
