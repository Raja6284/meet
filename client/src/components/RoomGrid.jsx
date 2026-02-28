import { useMemo } from 'react';
// eslint-disable-next-line no-unused-vars -- motion is used via JSX member expressions
import { AnimatePresence, motion } from 'framer-motion';
import VideoTile from './VideoTile';
import { Copy, Check, Link2, Users } from 'lucide-react';
import { useState } from 'react';
import { getRoomUrl, copyToClipboard } from '../utils/roomUtils';

export default function RoomGrid({
  localStream,
  remoteStreams,
  localDisplayName,
  localIsMuted,
  localIsCameraOff,
  activeSpeakerId,
  screenShareStream,
  screenSharePeerId,
  peerInfoMap,
  roomId,
}) {
  const [copied, setCopied] = useState(false);

  const totalParticipants = 1 + Object.keys(remoteStreams).length;
  const isAlone = totalParticipants === 1;
  const hasScreenShare = !!screenShareStream;

  const handleCopy = async () => {
    await copyToClipboard(getRoomUrl(roomId));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Compute grid classes based on participant count
  const gridClasses = useMemo(() => {
    if (hasScreenShare) return '';

    switch (totalParticipants) {
      case 1: return 'flex items-center justify-center';
      case 2: return 'grid grid-cols-2 gap-3';
      case 3: return 'grid grid-cols-2 gap-3';
      case 4: return 'grid grid-cols-2 grid-rows-2 gap-3';
      case 5:
      case 6: return 'grid grid-cols-3 grid-rows-2 gap-3';
      case 7:
      case 8: return 'grid grid-cols-4 grid-rows-2 gap-3';
      default: return 'grid grid-cols-3 gap-3';
    }
  }, [totalParticipants, hasScreenShare]);

  // Screen share layout
  if (hasScreenShare) {
    const isLocalScreenShare = screenSharePeerId === 'local';
    const presenterName = isLocalScreenShare
      ? localDisplayName
      : (peerInfoMap[screenSharePeerId]?.displayName || 'Someone');

    return (
      <div className="flex-1 flex gap-3 p-3 h-full overflow-hidden">
        {/* Main screen share */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <div
            className="rounded-full px-4 py-1.5 self-start flex items-center gap-2"
            style={{
              background: 'rgba(12,12,20,0.7)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(124,58,237,0.15)',
            }}
          >
            <div className="w-2 h-2 rounded-full bg-[var(--color-success)] pulse-ring" />
            <span className="text-xs font-medium text-[var(--color-text-primary)]">
              {presenterName} is presenting
            </span>
          </div>
          <VideoTile
            stream={screenShareStream}
            displayName={presenterName}
            isMuted={false}
            isCameraOff={false}
            isScreenShare={true}
            isLocal={isLocalScreenShare}
            className="flex-1 min-h-0"
          />
        </div>

        {/* Side strip */}
        <div className="w-48 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
          <VideoTile
            stream={localStream}
            displayName={localDisplayName}
            isMuted={localIsMuted}
            isCameraOff={localIsCameraOff}
            isLocal={true}
            isActiveSpeaker={activeSpeakerId === 'local'}
            className="aspect-video shrink-0"
          />
          {Object.entries(remoteStreams).map(([peerId, stream]) => (
            <VideoTile
              key={peerId}
              stream={stream}
              displayName={peerInfoMap[peerId]?.displayName || 'Participant'}
              isMuted={peerInfoMap[peerId]?.isMuted || false}
              isCameraOff={peerInfoMap[peerId]?.isCameraOff || false}
              isActiveSpeaker={activeSpeakerId === peerId}
              className="aspect-video shrink-0"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 p-3 h-full overflow-hidden ${gridClasses}`}>
      <AnimatePresence mode="popLayout">
        {/* Local video */}
        <VideoTile
          key="local"
          stream={localStream}
          displayName={localDisplayName}
          isMuted={localIsMuted}
          isCameraOff={localIsCameraOff}
          isLocal={true}
          isActiveSpeaker={activeSpeakerId === 'local'}
          className={isAlone ? 'w-full max-w-[960px] aspect-video' : 'w-full h-full min-h-0'}
        />

        {/* Remote videos */}
        {Object.entries(remoteStreams).map(([peerId, stream]) => (
          <VideoTile
            key={peerId}
            stream={stream}
            displayName={peerInfoMap[peerId]?.displayName || 'Participant'}
            isMuted={peerInfoMap[peerId]?.isMuted || false}
            isCameraOff={peerInfoMap[peerId]?.isCameraOff || false}
            isActiveSpeaker={activeSpeakerId === peerId}
            className="w-full h-full min-h-0"
          />
        ))}
      </AnimatePresence>

      {/* Alone state overlay */}
      {isAlone && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <div
            className="rounded-2xl p-6 text-center max-w-sm breathe-glow"
            style={{
              background: 'rgba(12,12,20,0.85)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(124,58,237,0.15)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.4), 0 0 40px rgba(124,58,237,0.06)',
            }}
          >
            {/* Top shine */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <Users size={28} className="text-purple-400 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1 tracking-tight">
              Waiting for others to join
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] mb-4">
              Share this link to invite people
            </p>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 mx-auto rounded-xl px-4 py-2.5 transition-all duration-200 text-xs font-medium text-[var(--color-text-primary)]"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(124,58,237,0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
            >
              {copied ? <Check size={14} className="text-[var(--color-success)]" /> : <Link2 size={14} className="text-purple-400" />}
              {copied ? 'Link copied!' : getRoomUrl(roomId)}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
