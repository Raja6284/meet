import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars -- motion is used via JSX member expressions (motion.div, motion.button)
import { motion } from 'framer-motion';
import { Video, Users, ArrowRight, Hash, Camera, CameraOff, Mic, MicOff, Sparkles, Shield, Zap } from 'lucide-react';
import Modal from '../components/Modal';
import { generateRoomId } from '../utils/roomUtils';

export default function HomePage() {
  const navigate = useNavigate();
  const [showStartModal, setShowStartModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [previewStream, setPreviewStream] = useState(null);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const videoRef = useRef(null);

  const startPreview = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: true,
      });
      setPreviewStream(stream);
    } catch {
      console.log('Camera preview not available');
    }
  }, []);

  useEffect(() => {
    if (videoRef.current && previewStream) {
      videoRef.current.srcObject = previewStream;
    }
  }, [previewStream]);

  const stopPreview = () => {
    if (previewStream) {
      previewStream.getTracks().forEach(t => t.stop());
      setPreviewStream(null);
    }
  };

  const togglePreviewCamera = () => {
    if (previewStream) {
      previewStream.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
      setCameraOn(prev => !prev);
    }
  };

  const togglePreviewMic = () => {
    if (previewStream) {
      previewStream.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
      setMicOn(prev => !prev);
    }
  };

  const handleStartMeeting = () => {
    if (!displayName.trim()) return;
    stopPreview();
    const roomId = generateRoomId();
    navigate(`/room/${roomId}`, { state: { displayName: displayName.trim(), cameraOn, micOn } });
  };

  const handleJoinMeeting = () => {
    if (!displayName.trim() || !roomCode.trim()) return;
    stopPreview();
    const cleanCode = roomCode.trim().replace(/\s/g, '');
    navigate(`/room/${cleanCode}`, { state: { displayName: displayName.trim(), cameraOn, micOn } });
  };

  const handleCloseModal = () => {
    setShowStartModal(false);
    setShowJoinModal(false);
    setDisplayName('');
    setRoomCode('');
    stopPreview();
    setCameraOn(true);
    setMicOn(true);
  };

  const previewContent = (
    <div className="space-y-4">
      {/* Video preview */}
      <div className="relative w-full aspect-video bg-[var(--color-surface-light)] rounded-xl overflow-hidden border border-[var(--color-border)]">
        {previewStream && cameraOn ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-light)] flex items-center justify-center">
              <CameraOff size={32} className="text-white" />
            </div>
          </div>
        )}

        {/* Preview controls */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          <button
            onClick={togglePreviewMic}
            className={`
              p-2.5 rounded-full transition-all duration-200
              ${micOn 
                ? 'bg-white/10 hover:bg-white/20 text-white' 
                : 'bg-[var(--color-danger)] hover:bg-red-600 text-white'
              }
            `}
          >
            {micOn ? <Mic size={18} /> : <MicOff size={18} />}
          </button>
          <button
            onClick={togglePreviewCamera}
            className={`
              p-2.5 rounded-full transition-all duration-200
              ${cameraOn 
                ? 'bg-white/10 hover:bg-white/20 text-white' 
                : 'bg-[var(--color-danger)] hover:bg-red-600 text-white'
              }
            `}
          >
            {cameraOn ? <Camera size={18} /> : <CameraOff size={18} />}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-bg)] relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="animate-float absolute top-[10%] left-[15%] w-[500px] h-[500px] rounded-full bg-[var(--color-accent)]/5 blur-[120px]" />
        <div className="animate-float-delayed absolute bottom-[10%] right-[10%] w-[600px] h-[600px] rounded-full bg-[var(--color-accent-light)]/5 blur-[120px]" />
        <div className="animate-float-slow absolute top-[50%] left-[50%] w-[400px] h-[400px] rounded-full bg-blue-500/3 blur-[100px]" />
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-5">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2.5"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-light)] flex items-center justify-center shadow-lg shadow-[var(--color-accent)]/20">
            <Video size={18} className="text-white" />
          </div>
          <span className="text-xl font-semibold text-[var(--color-text-primary)] tracking-tight">
            NearMeet
          </span>
        </motion.div>
      </nav>

      {/* Hero section */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-20 lg:pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center max-w-3xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-8"
          >
            <Sparkles size={14} className="text-[var(--color-accent-light)]" />
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">
              Free • No downloads • End-to-end WebRTC
            </span>
          </motion.div>

          {/* Headline */}
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            <span className="text-[var(--color-text-primary)]">Crystal clear calls.</span>
            <br />
            <span className="gradient-text">Just you and them.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg lg:text-xl text-[var(--color-text-secondary)] max-w-xl mx-auto mb-12 leading-relaxed">
            Start a video call instantly with anyone, anywhere. No sign-ups, 
            no installs — just seamless, peer-to-peer conversations.
          </p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setShowStartModal(true); startPreview(); }}
              className="
                gradient-btn text-white font-semibold
                px-8 py-3.5 rounded-xl
                flex items-center gap-2.5
                text-base
                shadow-lg shadow-[var(--color-accent)]/25
              "
            >
              <Video size={20} />
              Start a Meeting
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setShowJoinModal(true); startPreview(); }}
              className="
                bg-transparent border border-[var(--color-border)]
                hover:bg-white/5 hover:border-white/20
                text-[var(--color-text-primary)] font-semibold
                px-8 py-3.5 rounded-xl
                flex items-center gap-2.5
                text-base
                transition-all duration-200
              "
            >
              <Hash size={20} />
              Join with Code
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Features row */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full"
        >
          {[
            { icon: <Zap size={22} />, title: 'Instant Connect', desc: 'Start a call in under 2 seconds. Share a link and go.' },
            { icon: <Shield size={22} />, title: 'Peer-to-Peer', desc: 'Your calls go directly between browsers. No middleman.' },
            { icon: <Users size={22} />, title: 'Up to 8 People', desc: 'Perfect for team standups, 1-on-1s, and small group calls.' },
          ].map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="glass rounded-2xl p-6 text-center hover:bg-white/[0.04] transition-colors duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--color-accent-light)]/20 flex items-center justify-center mx-auto mb-4 text-[var(--color-accent)]">
                {feat.icon}
              </div>
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">{feat.title}</h3>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Start Meeting Modal */}
      <Modal isOpen={showStartModal} onClose={handleCloseModal} title="Start a Meeting" size="lg">
        <div className="space-y-5">
          {previewContent}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              Your display name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStartMeeting()}
              placeholder="Enter your name"
              maxLength={30}
              autoFocus
              className="
                w-full px-4 py-3 rounded-xl
                bg-[var(--color-surface)] border border-[var(--color-border)]
                text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]
                focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-[var(--color-accent)]/50
                transition-all duration-200
                text-sm
              "
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStartMeeting}
            disabled={!displayName.trim()}
            className="
              w-full gradient-btn text-white font-semibold
              py-3 rounded-xl
              flex items-center justify-center gap-2
              disabled:opacity-40 disabled:cursor-not-allowed
              shadow-lg shadow-[var(--color-accent)]/20
            "
          >
            Start Meeting
            <ArrowRight size={18} />
          </motion.button>
        </div>
      </Modal>

      {/* Join Meeting Modal */}
      <Modal isOpen={showJoinModal} onClose={handleCloseModal} title="Join a Meeting" size="lg">
        <div className="space-y-5">
          {previewContent}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              Meeting code
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="Enter meeting code (e.g. abc-defg-hij)"
              autoFocus
              className="
                w-full px-4 py-3 rounded-xl
                bg-[var(--color-surface)] border border-[var(--color-border)]
                text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]
                focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-[var(--color-accent)]/50
                transition-all duration-200
                text-sm
              "
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              Your display name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoinMeeting()}
              placeholder="Enter your name"
              maxLength={30}
              className="
                w-full px-4 py-3 rounded-xl
                bg-[var(--color-surface)] border border-[var(--color-border)]
                text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]
                focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-[var(--color-accent)]/50
                transition-all duration-200
                text-sm
              "
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleJoinMeeting}
            disabled={!displayName.trim() || !roomCode.trim()}
            className="
              w-full gradient-btn text-white font-semibold
              py-3 rounded-xl
              flex items-center justify-center gap-2
              disabled:opacity-40 disabled:cursor-not-allowed
              shadow-lg shadow-[var(--color-accent)]/20
            "
          >
            Join Meeting
            <ArrowRight size={18} />
          </motion.button>
        </div>
      </Modal>
    </div>
  );
}
