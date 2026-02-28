import { useRef, useEffect, useState } from 'react';
// eslint-disable-next-line no-unused-vars -- motion is used via JSX member expressions
import { motion } from 'framer-motion';
import { MicOff, Pin, Maximize2 } from 'lucide-react';
import Avatar from './Avatar';

export default function VideoTile({
  stream,
  displayName,
  isMuted,
  isCameraOff,
  isLocal = false,
  isActiveSpeaker = false,
  isScreenShare = false,
  className = '',
}) {
  const videoRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const showVideo = stream && !isCameraOff;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative bg-[var(--color-surface-light)] rounded-2xl overflow-hidden
        border border-[var(--color-border)]
        transition-all duration-200
        ${isActiveSpeaker ? 'speaker-active' : ''}
        ${isHovered ? 'scale-[1.01]' : ''}
        ${className}
      `}
    >
      {/* Video */}
      {showVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={`w-full h-full object-cover ${isLocal && !isScreenShare ? 'scale-x-[-1]' : ''}`}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-[var(--color-surface-light)]">
          <Avatar name={displayName} size="xl" />
        </div>
      )}

      {/* Audio-only hidden video for remote streams */}
      {stream && isCameraOff && !isLocal && (
        <audio
          ref={el => { if (el) el.srcObject = stream; }}
          autoPlay
          className="hidden"
        />
      )}

      {/* Name label - bottom left */}
      <div className="absolute bottom-3 left-3 z-10">
        <div className="glass rounded-full px-3 py-1 flex items-center gap-2">
          <span className="text-xs font-medium text-[var(--color-text-primary)] truncate max-w-[150px]">
            {isLocal ? 'You' : displayName}
          </span>
        </div>
      </div>

      {/* Mute indicator - top right */}
      {isMuted && (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-[var(--color-danger)]/80 backdrop-blur-sm rounded-full p-1.5">
            <MicOff size={12} className="text-white" />
          </div>
        </div>
      )}

      {/* Screen share label */}
      {isScreenShare && (
        <div className="absolute top-3 left-3 z-10">
          <div className="glass rounded-full px-3 py-1 flex items-center gap-1.5">
            <Pin size={12} className="text-[var(--color-accent)]" />
            <span className="text-xs font-medium text-[var(--color-accent)]">
              {isLocal ? 'You are presenting' : `${displayName} is presenting`}
            </span>
          </div>
        </div>
      )}

      {/* Hover overlay */}
      {isHovered && !isScreenShare && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/20 flex items-center justify-center z-5"
        >
        </motion.div>
      )}
    </motion.div>
  );
}
