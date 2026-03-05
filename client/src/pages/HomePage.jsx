import { useState, useRef, useEffect, useCallback, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Phone, Users, ArrowRight, Hash, Camera, CameraOff, Mic, MicOff, Sparkles as SparkleIcon, Shield, Zap } from 'lucide-react';
import Modal from '../components/Modal';
import TiltCard from '../components/TiltCard';
import GlowButton from '../components/GlowButton';
import { generateRoomId } from '../utils/roomUtils';

const Scene3D = lazy(() => import('../components/Scene3D'));

/* ─── Word-by-word stagger animation ─── */
const wordVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.3 + i * 0.08, duration: 0.5, ease: 'easeOut' },
  }),
};

function AnimatedWords({ text, className = '' }) {
  const words = text.split(' ');
  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          custom={i}
          variants={wordVariants}
          initial="hidden"
          animate="visible"
          className="inline-block mr-[0.3em]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [showStartModal, setShowStartModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [previewStream, setPreviewStream] = useState(null);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [callMode, setCallMode] = useState('video'); // 'video' | 'audio'
  const videoRef = useRef(null);

  const startPreview = useCallback(async (mode = 'video') => {
    try {
      if (mode === 'audio') {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        setPreviewStream(stream);
        setCameraOn(false);
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: true,
        });
        setPreviewStream(stream);
        setCameraOn(true);
      }
    } catch {
      console.log('Preview not available');
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
    if (previewStream && callMode === 'video') {
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
    navigate(`/room/${roomId}`, {
      state: {
        displayName: displayName.trim(),
        cameraOn: callMode === 'video' ? cameraOn : false,
        micOn,
        callMode,
      },
    });
  };

  const handleJoinMeeting = () => {
    if (!displayName.trim() || !roomCode.trim()) return;
    stopPreview();
    const cleanCode = roomCode.trim().replace(/\s/g, '');
    navigate(`/room/${cleanCode}`, {
      state: {
        displayName: displayName.trim(),
        cameraOn: callMode === 'video' ? cameraOn : false,
        micOn,
        callMode,
      },
    });
  };

  const handleCloseModal = () => {
    setShowStartModal(false);
    setShowJoinModal(false);
    setDisplayName('');
    setRoomCode('');
    stopPreview();
    setCameraOn(true);
    setMicOn(true);
    setCallMode('video');
  };

  /* ─── Camera preview block (shared between modals) ─── */
  const previewContent = (
    <div className="space-y-4">
      {/* Call mode selector */}
      <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={() => {
            setCallMode('video');
            stopPreview();
            startPreview('video');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            callMode === 'video'
              ? 'text-white'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
          }`}
          style={callMode === 'video' ? {
            background: 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(99,102,241,0.15))',
            border: '1px solid rgba(124,58,237,0.3)',
            boxShadow: '0 0 16px rgba(124,58,237,0.15)',
          } : { border: '1px solid transparent' }}
        >
          <Video size={16} />
          Video Call
        </button>
        <button
          onClick={() => {
            setCallMode('audio');
            stopPreview();
            startPreview('audio');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            callMode === 'audio'
              ? 'text-white'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
          }`}
          style={callMode === 'audio' ? {
            background: 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(99,102,241,0.15))',
            border: '1px solid rgba(124,58,237,0.3)',
            boxShadow: '0 0 16px rgba(124,58,237,0.15)',
          } : { border: '1px solid transparent' }}
        >
          <Phone size={16} />
          Audio Call
        </button>
      </div>

      <div className="relative w-full aspect-video rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(12,12,20,0.9)',
          boxShadow: '0 0 0 1px rgba(124,58,237,0.2), 0 0 30px rgba(124,58,237,0.08), inset 0 2px 4px rgba(0,0,0,0.3)',
        }}
      >
        {/* Shine line at top */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {callMode === 'video' && previewStream && cameraOn ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <div className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                boxShadow: '0 0 40px rgba(124,58,237,0.3)',
              }}
            >
              {callMode === 'audio' ? <Phone size={32} className="text-white" /> : <CameraOff size={32} className="text-white" />}
            </div>
            {callMode === 'audio' && (
              <p className="text-xs text-[var(--color-text-secondary)]">Audio-only mode — no camera needed</p>
            )}
          </div>
        )}

        {/* Preview controls */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          <button
            onClick={togglePreviewMic}
            className={`control-btn p-2.5 ${micOn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-[var(--color-danger)] text-white'}`}
          >
            {micOn ? <Mic size={18} /> : <MicOff size={18} />}
          </button>
          {callMode === 'video' && (
            <button
              onClick={togglePreviewCamera}
              className={`control-btn p-2.5 ${cameraOn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-[var(--color-danger)] text-white'}`}
            >
              {cameraOn ? <Camera size={18} /> : <CameraOff size={18} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  /* ─── Feature data ─── */
  const features = [
    { icon: <Zap size={22} />, title: 'Instant Connect', desc: 'Start a call in under 2 seconds. Share a link and go.' },
    { icon: <Shield size={22} />, title: 'Peer-to-Peer', desc: 'Your calls go directly between browsers. No middleman.' },
    { icon: <Users size={22} />, title: 'Up to 8 People', desc: 'Perfect for team standups, 1-on-1s, and small group calls.' },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)] relative overflow-hidden">
      {/* ─── 3D Background Canvas ─── */}
      <Suspense fallback={null}>
        <Scene3D />
      </Suspense>

      {/* ─── Navigation ─── */}
      <nav className="relative z-10 flex items-center justify-between px-4 sm:px-6 lg:px-12 py-4 sm:py-5">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2.5"
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
      </nav>

      {/* ─── Hero Section ─── */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4 sm:px-6 pt-12 sm:pt-16 lg:pt-24 pb-16 sm:pb-20">
        <div className="text-center max-w-3xl mx-auto">

          {/* ─── Shimmer badge ─── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 glass shimmer-badge rounded-full px-4 py-1.5 mb-6 sm:mb-8"
          >
            <SparkleIcon size={14} className="text-purple-400 breathe-glow" />
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">
              Free &bull; No downloads &bull; End-to-end WebRTC
            </span>
          </motion.div>

          {/* ─── Headline with word-by-word stagger ─── */}
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-5 sm:mb-6" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>
            <AnimatedWords text="Crystal clear calls." className="text-white block" />
            <br />
            <span className="text-3xl sm:text-5xl lg:text-7xl font-bold" style={{ color: '#9b87f5' }}>
              <AnimatedWords text="Just you and them." />
            </span>
          </h1>

          {/* ─── Subtitle ─── */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-base sm:text-lg lg:text-xl text-[var(--color-text-secondary)] max-w-xl mx-auto mb-8 sm:mb-12 leading-relaxed px-2"
            style={{ textShadow: '0 2px 16px rgba(0,0,0,0.6)' }}
          >
            Start a video or audio call instantly with anyone, anywhere. No sign-ups,
            no installs — just seamless, peer-to-peer conversations.
          </motion.p>

          {/* ─── CTA Buttons ─── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
          >
            <GlowButton variant="primary" onClick={() => { setShowStartModal(true); startPreview('video'); }}>
              <Video size={20} />
              Start a Meeting
            </GlowButton>

            <GlowButton variant="secondary" onClick={() => { setShowJoinModal(true); startPreview('video'); }}>
              <Hash size={20} />
              Join with Code
            </GlowButton>
          </motion.div>
        </div>

        {/* ─── Feature Cards with 3D tilt ─── */}
        <div className="mt-20 sm:mt-28 lg:mt-36 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl w-full px-2">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + i * 0.12, duration: 0.5 }}
            >
              <TiltCard>
                <div className="glass-card rounded-2xl text-center p-6 sm:p-8" style={{ borderColor: 'rgba(124, 58, 237, 0.15)' }}>
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-4"
                    style={{
                      background: 'rgba(124,58,237,0.12)',
                      boxShadow: '0 0 20px rgba(124,58,237,0.1)',
                      color: '#7c3aed',
                    }}
                  >
                    {feat.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">{feat.title}</h3>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{feat.desc}</p>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </main>

      {/* ─── Start Meeting Modal ─── */}
      <Modal isOpen={showStartModal} onClose={handleCloseModal} title="Start a Meeting" size="lg">
        <div className="space-y-5">
          {previewContent}

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-2 uppercase tracking-wider">
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
              className="w-full px-4 py-3 rounded-xl input-sunken text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none text-sm"
            />
          </div>

          <GlowButton variant="primary" fullWidth onClick={handleStartMeeting} disabled={!displayName.trim()}>
            {callMode === 'audio' ? 'Start Audio Call' : 'Start Meeting'}
            <ArrowRight size={18} />
          </GlowButton>
        </div>
      </Modal>

      {/* ─── Join Meeting Modal ─── */}
      <Modal isOpen={showJoinModal} onClose={handleCloseModal} title="Join a Meeting" size="lg">
        <div className="space-y-5">
          {previewContent}

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-2 uppercase tracking-wider">
              Meeting code
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="Enter meeting code (e.g. abc-defg-hij)"
              autoFocus
              className="w-full px-4 py-3 rounded-xl input-sunken text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-2 uppercase tracking-wider">
              Your display name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoinMeeting()}
              placeholder="Enter your name"
              maxLength={30}
              className="w-full px-4 py-3 rounded-xl input-sunken text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none text-sm"
            />
          </div>

          <GlowButton variant="primary" fullWidth onClick={handleJoinMeeting} disabled={!displayName.trim() || !roomCode.trim()}>
            {callMode === 'audio' ? 'Join Audio Call' : 'Join Meeting'}
            <ArrowRight size={18} />
          </GlowButton>
        </div>
      </Modal>
    </div>
  );
}
