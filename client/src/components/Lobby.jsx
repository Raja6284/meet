import { useState, useRef, useEffect, lazy, Suspense } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Camera, CameraOff, Mic, MicOff, Copy, Check, Users, ArrowRight, Video, Phone } from 'lucide-react';
import Avatar from '../components/Avatar';
import GlowButton from '../components/GlowButton';
import { getRoomUrl, copyToClipboard } from '../utils/roomUtils';

const Scene3D = lazy(() => import('../components/Scene3D'));

export default function Lobby({ roomId, displayName, onJoin, participantCount = 0, callMode = 'video' }) {
  const isAudioMode = callMode === 'audio';
  const [cameraOn, setCameraOn] = useState(!isAudioMode);
  const [micOn, setMicOn] = useState(true);
  const [stream, setStream] = useState(null);
  const [copied, setCopied] = useState(false);
  const [permError, setPermError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    let cancelled = false;
    (async () => {
      try {
        const constraints = isAudioMode
          ? { audio: true, video: false }
          : {
              video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
              audio: true,
            };
        const s = await navigator.mediaDevices.getUserMedia(constraints);
        if (!cancelled) {
          streamRef.current = s;
          setStream(s);
        } else {
          s.getTracks().forEach(t => t.stop());
        }
      } catch {
        if (!cancelled) setPermError(isAudioMode ? 'Could not access microphone' : 'Could not access camera/microphone');
      }
    })();
    return () => {
      cancelled = true;
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, [isAudioMode]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const toggleCamera = () => {
    if (stream && !isAudioMode) {
      stream.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
      setCameraOn(prev => !prev);
    }
  };

  const toggleMic = () => {
    if (stream) {
      stream.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
      setMicOn(prev => !prev);
    }
  };

  const handleCopy = async () => {
    await copyToClipboard(getRoomUrl(roomId));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    onJoin({ cameraOn: isAudioMode ? false : cameraOn, micOn, callMode });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center p-6 relative overflow-hidden"
    >
      {/* Subtle 3D background */}
      <Suspense fallback={null}>
        <Scene3D subtle />
      </Suspense>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex items-center gap-2.5 mb-12"
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center breathe-glow"
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
            boxShadow: '0 0 20px rgba(124,58,237,0.4)',
          }}
        >
          <Video size={18} className="text-white" />
        </div>
        <span
          className="text-xl font-semibold text-[var(--color-text-primary)] tracking-tight"
          style={{ filter: 'drop-shadow(0 0 12px rgba(124,58,237,0.3))' }}
        >
          NearMeet
        </span>
      </motion.div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6 sm:gap-8 max-w-4xl w-full px-2">
        {/* Video/Audio preview — pulsing gradient border */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative w-full lg:w-[560px]"
        >
          {/* Animated border glow */}
          <div
            className="absolute -inset-px rounded-2xl glow-spin opacity-50"
            style={{
              background: 'conic-gradient(from var(--glow-angle), #7c3aed, #6366f1, #8b5cf6, #a78bfa, #7c3aed)',
            }}
          />

          <div
            className={`relative ${isAudioMode ? 'aspect-[16/10]' : 'aspect-video'} rounded-2xl overflow-hidden`}
            style={{
              background: 'rgba(12,12,20,0.9)',
              boxShadow: '0 0 60px rgba(124,58,237,0.1), 0 25px 50px rgba(0,0,0,0.4), inset 0 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            {/* Top shine line */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent z-10" />

            {!isAudioMode && stream && cameraOn ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                <Avatar name={displayName} size="2xl" />
                {isAudioMode && (
                  <div className="flex items-center gap-2 mt-2">
                    <Phone size={14} className="text-purple-400" />
                    <span className="text-xs text-[var(--color-text-secondary)]">Audio call mode</span>
                  </div>
                )}
              </div>
            )}

            {/* Name label */}
            <div className="absolute bottom-4 left-4 glass-card rounded-full px-3 py-1.5 flex items-center gap-2 z-10">
              <span className="text-sm font-medium text-[var(--color-text-primary)]">{displayName}</span>
            </div>

            {/* Preview controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              <button
                onClick={toggleMic}
                className={`control-btn p-3 ${micOn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-[var(--color-danger)] text-white'}`}
                title={micOn ? 'Mute microphone' : 'Unmute microphone'}
              >
                {micOn ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
              {!isAudioMode && (
                <button
                  onClick={toggleCamera}
                  className={`control-btn p-3 ${cameraOn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-[var(--color-danger)] text-white'}`}
                  title={cameraOn ? 'Turn off camera' : 'Turn on camera'}
                >
                  {cameraOn ? <Camera size={20} /> : <CameraOff size={20} />}
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right side info & join */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center lg:items-start gap-5 sm:gap-6 w-full lg:w-auto"
        >
          <div className="text-center lg:text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] mb-2 tracking-tight">
              Ready to join?
            </h2>
            <p className="text-[var(--color-text-secondary)] text-sm">
              {isAudioMode ? 'Check your microphone before joining' : 'Check your camera and microphone before joining'}
            </p>
          </div>

          {/* Room info */}
          <div
            className="glass-card rounded-2xl p-4 w-full max-w-xs space-y-3"
            style={{ boxShadow: '0 0 40px rgba(124,58,237,0.06), inset 0 1px 0 rgba(255,255,255,0.05)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Room ID</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy link'}
              </button>
            </div>
            <p className="text-sm font-mono text-[var(--color-text-primary)]">{roomId}</p>

            {participantCount > 0 && (
              <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                <Users size={14} className="text-purple-400" />
                <span className="text-xs text-[var(--color-text-secondary)]">
                  {participantCount} {participantCount === 1 ? 'person' : 'people'} already in this call
                </span>
              </div>
            )}
          </div>

          {permError && (
            <div className="glass-card rounded-2xl p-4 w-full max-w-xs border border-[var(--color-danger)]/30">
              <p className="text-xs text-[var(--color-danger)]">{permError}</p>
            </div>
          )}

          <GlowButton variant="primary" fullWidth onClick={handleJoin}>
            {isAudioMode ? 'Join Audio Call' : 'Join Now'}
            <ArrowRight size={18} />
          </GlowButton>
        </motion.div>
      </div>
    </motion.div>
  );
}
