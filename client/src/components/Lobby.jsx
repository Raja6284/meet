import { useState, useRef, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars -- motion is used via JSX member expressions
import { motion } from 'framer-motion';
import { Camera, CameraOff, Mic, MicOff, Copy, Check, Users, ArrowRight, Video } from 'lucide-react';
import Avatar from '../components/Avatar';
import { getRoomUrl, copyToClipboard } from '../utils/roomUtils';

export default function Lobby({ roomId, displayName, onJoin, participantCount = 0 }) {
  const [cameraOn, setCameraOn] = useState(true);
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
        const s = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: true,
        });
        if (!cancelled) {
          streamRef.current = s;
          setStream(s);
        } else {
          s.getTracks().forEach(t => t.stop());
        }
      } catch {
        if (!cancelled) setPermError('Could not access camera/microphone');
      }
    })();
    return () => {
      cancelled = true;
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const toggleCamera = () => {
    if (stream) {
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
    // Stop preview stream before joining
    if (stream) stream.getTracks().forEach(t => t.stop());
    onJoin({ cameraOn, micOn });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center p-6"
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2.5 mb-12"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-light)] flex items-center justify-center">
          <Video size={18} className="text-white" />
        </div>
        <span className="text-xl font-semibold text-[var(--color-text-primary)] tracking-tight">
          NearMeet
        </span>
      </motion.div>

      <div className="flex flex-col lg:flex-row items-center gap-8 max-w-4xl w-full">
        {/* Video preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative w-full lg:w-[560px] aspect-video bg-[var(--color-surface-light)] rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-2xl shadow-black/30"
        >
          {stream && cameraOn ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Avatar name={displayName} size="2xl" />
            </div>
          )}

          {/* Name label */}
          <div className="absolute bottom-4 left-4 glass rounded-full px-3 py-1.5 flex items-center gap-2">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">{displayName}</span>
          </div>

          {/* Preview controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            <button
              onClick={toggleMic}
              className={`
                p-3 rounded-full transition-all duration-200
                ${micOn
                  ? 'bg-white/10 hover:bg-white/20 text-white'
                  : 'bg-[var(--color-danger)] hover:bg-red-600 text-white'
                }
              `}
              title={micOn ? 'Mute microphone' : 'Unmute microphone'}
            >
              {micOn ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
            <button
              onClick={toggleCamera}
              className={`
                p-3 rounded-full transition-all duration-200
                ${cameraOn
                  ? 'bg-white/10 hover:bg-white/20 text-white'
                  : 'bg-[var(--color-danger)] hover:bg-red-600 text-white'
                }
              `}
              title={cameraOn ? 'Turn off camera' : 'Turn on camera'}
            >
              {cameraOn ? <Camera size={20} /> : <CameraOff size={20} />}
            </button>
          </div>
        </motion.div>

        {/* Right side info & join */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center lg:items-start gap-6 w-full lg:w-auto"
        >
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
              Ready to join?
            </h2>
            <p className="text-[var(--color-text-secondary)] text-sm">
              Check your camera and microphone before joining
            </p>
          </div>

          {/* Room info */}
          <div className="glass rounded-xl p-4 w-full max-w-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Room ID</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-light)] transition-colors"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy link'}
              </button>
            </div>
            <p className="text-sm font-mono text-[var(--color-text-primary)]">{roomId}</p>

            {participantCount > 0 && (
              <div className="flex items-center gap-2 pt-2 border-t border-[var(--color-border)]">
                <Users size={14} className="text-[var(--color-accent)]" />
                <span className="text-xs text-[var(--color-text-secondary)]">
                  {participantCount} {participantCount === 1 ? 'person' : 'people'} already in this call
                </span>
              </div>
            )}
          </div>

          {permError && (
            <div className="glass rounded-xl p-4 w-full max-w-xs border-[var(--color-danger)]/30">
              <p className="text-xs text-[var(--color-danger)]">{permError}</p>
            </div>
          )}

          {/* Join button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleJoin}
            className="
              w-full max-w-xs gradient-btn text-white font-semibold
              py-3.5 rounded-xl
              flex items-center justify-center gap-2
              shadow-lg shadow-[var(--color-accent)]/25
              text-base
            "
          >
            Join Now
            <ArrowRight size={18} />
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}
