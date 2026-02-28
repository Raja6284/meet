import { useRef, useEffect, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { MicOff, Pin } from 'lucide-react';
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
      className={`video-tile relative overflow-hidden ${isActiveSpeaker ? 'speaker-active' : ''} ${className}`}
      style={{
        ...(isHovered && !isScreenShare
          ? { transform: 'translateY(-3px)', boxShadow: '0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(124,58,237,0.15)' }
          : {}),
      }}
    >
      {/* Top shine line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent z-10" />

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
        <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(12,12,20,0.95)' }}>
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

      {/* Name label - bottom left — glass pill */}
      <div className="absolute bottom-3 left-3 z-10">
        <div
          className="rounded-full px-3 py-1 flex items-center gap-2"
          style={{
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <span className="text-xs font-medium text-white truncate max-w-[150px]">
            {isLocal ? 'You' : displayName}
          </span>
        </div>
      </div>

      {/* Mute indicator — top right with glow */}
      {isMuted && (
        <div className="absolute top-3 right-3 z-10">
          <div
            className="rounded-full p-1.5"
            style={{
              background: 'rgba(239,68,68,0.85)',
              boxShadow: '0 0 12px rgba(239,68,68,0.4)',
            }}
          >
            <MicOff size={12} className="text-white" />
          </div>
        </div>
      )}

      {/* Screen share label */}
      {isScreenShare && (
        <div className="absolute top-3 left-3 z-10">
          <div
            className="rounded-full px-3 py-1 flex items-center gap-1.5"
            style={{
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(124,58,237,0.3)',
            }}
          >
            <Pin size={12} className="text-purple-400" />
            <span className="text-xs font-medium text-purple-300">
              {isLocal ? 'You are presenting' : `${displayName} is presenting`}
            </span>
          </div>
        </div>
      )}

      {/* Hover overlay — subtle vignette */}
      {isHovered && !isScreenShare && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-5 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.2) 100%)' }}
        />
      )}
    </motion.div>
  );
}
