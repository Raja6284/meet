import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Video, Copy, Check, Clock } from 'lucide-react';
// eslint-disable-next-line no-unused-vars -- motion is used via JSX member expressions (motion.div)
import { motion } from 'framer-motion';
import { useSocket } from '../hooks/useSocket';
import { useMediaStream } from '../hooks/useMediaStream';
import { useWebRTC } from '../hooks/useWebRTC';
import { useActiveSpeaker } from '../hooks/useActiveSpeaker';
import { useToast } from '../hooks/useToast';
import RoomGrid from '../components/RoomGrid';
import ControlsBar from '../components/ControlsBar';
import ChatPanel from '../components/ChatPanel';
import ParticipantList from '../components/ParticipantList';
import ConnectionStatus from '../components/ConnectionStatus';
import ToastContainer from '../components/ToastContainer';
import Lobby from '../components/Lobby';
import { copyToClipboard, getRoomUrl } from '../utils/roomUtils';
import { formatDuration } from '../utils/formatTime';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

export default function RoomPage() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const displayNameFromState = location.state?.displayName;
  const initialCameraRef = useRef(location.state?.cameraOn ?? true);
  const initialMicRef = useRef(location.state?.micOn ?? true);

  // State
  const [displayName, setDisplayName] = useState(displayNameFromState || '');
  const [hasJoined, setHasJoined] = useState(false);
  const [inLobby, setInLobby] = useState(!displayNameFromState);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [peerInfoMap, setPeerInfoMap] = useState({});
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenShareStream, setScreenShareStream] = useState(null);
  const [screenSharePeerId, setScreenSharePeerId] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [copied, setCopied] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  // socketId from useSocket is already reactive state

  const screenStreamRef = useRef(null);
  const callTimerRef = useRef(null);
  const isChatOpenRef = useRef(false);
  const screenSharePeerIdRef = useRef(null);

  // Keep refs in sync with state
  useEffect(() => { isChatOpenRef.current = isChatOpen; }, [isChatOpen]);
  useEffect(() => { screenSharePeerIdRef.current = screenSharePeerId; }, [screenSharePeerId]);

  // Hooks
  const { socketRef, socketId, connectionState } = useSocket();
  const {
    localStream, streamRef, isMuted, isCameraOff,
    permissionError, getMediaStream, toggleMute, toggleCamera,
    stopAllTracks, setIsMuted, setIsCameraOff,
  } = useMediaStream();
  const { toasts, addToast, removeToast } = useToast();
  const { activeSpeakerId, setupAnalyser, removeAnalyser } = useActiveSpeaker();

  // WebRTC callbacks
  const onRemoteStream = useCallback((peerId, stream) => {
    setRemoteStreams(prev => ({ ...prev, [peerId]: stream }));
    setupAnalyser(peerId, stream);
  }, [setupAnalyser]);

  const onPeerDisconnected = useCallback(() => {
    // Handled by socket user-left event
  }, []);

  const onConnectionStateChange = useCallback((peerId, state) => {
    if (state === 'connected') {
      setPeerInfoMap(prev => ({
        ...prev,
        [peerId]: { ...prev[peerId], connectionQuality: 'good' },
      }));
    }
  }, []);

  const {
    createOffer, handleOffer, handleAnswer,
    handleIceCandidate, removePeerConnection, replaceTrack,
    closeAllConnections,
  } = useWebRTC({
    socketRef,
    localStreamRef: streamRef,
    onRemoteStream,
    onPeerDisconnected,
    onConnectionStateChange,
  });

  // Fetch initial participant count
  useEffect(() => {
    fetch(`${SERVER_URL}/api/room/${roomId}`)
      .then(r => r.json())
      .then(data => setParticipantCount(data.participantCount))
      .catch(() => {});
  }, [roomId]);

  // Join room flow
  const joinRoom = useCallback(async (lobbySettings) => {
    const cam = lobbySettings?.cameraOn ?? initialCameraRef.current;
    const mic = lobbySettings?.micOn ?? initialMicRef.current;

    const stream = await getMediaStream(true, true);
    if (!stream) return;

    // Apply initial camera/mic settings
    if (!cam) {
      stream.getVideoTracks().forEach(t => { t.enabled = false; });
      setIsCameraOff(true);
    }
    if (!mic) {
      stream.getAudioTracks().forEach(t => { t.enabled = false; });
      setIsMuted(true);
    }

    // Setup local active speaker detection
    setupAnalyser('local', stream);

    // Wait for socket
    await new Promise((resolve) => {
      const check = () => {
        if (socketRef.current?.connected) resolve();
        else setTimeout(check, 100);
      };
      check();
    });

    socketRef.current.emit('join-room', { roomId, displayName });
    setHasJoined(true);
    setInLobby(false);

    // Start call timer
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  }, [roomId, displayName, getMediaStream, setupAnalyser, socketRef, setIsCameraOff, setIsMuted]);

  // Socket event handlers — use refs for values that change frequently
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleRoomPeers = ({ peers }) => {
      peers.forEach(peer => {
        setPeerInfoMap(prev => ({
          ...prev,
          [peer.socketId]: {
            displayName: peer.displayName,
            isMuted: peer.isMuted,
            isCameraOff: peer.isCameraOff,
          },
        }));
        createOffer(peer.socketId, peer);
      });
    };

    const handleUserJoined = ({ socketId: sid, displayName: name, isMuted: muted, isCameraOff: camOff }) => {
      setPeerInfoMap(prev => ({
        ...prev,
        [sid]: { displayName: name, isMuted: muted, isCameraOff: camOff },
      }));
      addToast(`${name} joined the call`, 'join');
    };

    const handleUserLeft = ({ socketId: sid, displayName: name }) => {
      setRemoteStreams(prev => {
        const next = { ...prev };
        delete next[sid];
        return next;
      });
      setPeerInfoMap(prev => {
        const next = { ...prev };
        delete next[sid];
        return next;
      });
      removePeerConnection(sid);
      removeAnalyser(sid);
      addToast(`${name} left the call`, 'leave');

      if (screenSharePeerIdRef.current === sid) {
        setScreenShareStream(null);
        setScreenSharePeerId(null);
      }
    };

    const handleOfferEvent = async ({ from, offer }) => {
      await handleOffer(from, offer, {});
    };

    const handleAnswerEvent = async ({ from, answer }) => {
      await handleAnswer(from, answer);
    };

    const handleIceCandidateEvent = async ({ from, candidate }) => {
      await handleIceCandidate(from, candidate);
    };

    const handleToggleMuteEvt = ({ socketId: sid, isMuted: muted }) => {
      setPeerInfoMap(prev => ({
        ...prev,
        [sid]: { ...prev[sid], isMuted: muted },
      }));
    };

    const handleToggleCameraEvt = ({ socketId: sid, isCameraOff: camOff }) => {
      setPeerInfoMap(prev => ({
        ...prev,
        [sid]: { ...prev[sid], isCameraOff: camOff },
      }));
    };

    const handleScreenShareStarted = ({ socketId: sid, displayName: name }) => {
      setPeerInfoMap(prev => ({
        ...prev,
        [sid]: { ...prev[sid], isScreenSharing: true },
      }));
      setScreenSharePeerId(sid);
      addToast(`${name} is sharing their screen`, 'screen');
    };

    const handleScreenShareStopped = ({ socketId: sid }) => {
      setPeerInfoMap(prev => ({
        ...prev,
        [sid]: { ...prev[sid], isScreenSharing: false },
      }));
      if (screenSharePeerIdRef.current === sid) {
        setScreenShareStream(null);
        setScreenSharePeerId(null);
      }
    };

    const handleChatMessage = (msg) => {
      setMessages(prev => [...prev, msg]);
      if (!isChatOpenRef.current && msg.senderId !== socket.id) {
        setUnreadCount(prev => prev + 1);
      }
    };

    const handleUserUpdated = ({ socketId: sid, displayName: name }) => {
      setPeerInfoMap(prev => ({
        ...prev,
        [sid]: { ...prev[sid], displayName: name },
      }));
    };

    const handleRoomFull = ({ reason }) => {
      addToast(reason, 'error');
      navigate('/');
    };

    socket.on('room-peers', handleRoomPeers);
    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);
    socket.on('offer', handleOfferEvent);
    socket.on('answer', handleAnswerEvent);
    socket.on('ice-candidate', handleIceCandidateEvent);
    socket.on('user-toggle-mute', handleToggleMuteEvt);
    socket.on('user-toggle-camera', handleToggleCameraEvt);
    socket.on('screen-share-started', handleScreenShareStarted);
    socket.on('screen-share-stopped', handleScreenShareStopped);
    socket.on('chat-message', handleChatMessage);
    socket.on('user-updated', handleUserUpdated);
    socket.on('room-full', handleRoomFull);

    return () => {
      socket.off('room-peers', handleRoomPeers);
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);
      socket.off('offer', handleOfferEvent);
      socket.off('answer', handleAnswerEvent);
      socket.off('ice-candidate', handleIceCandidateEvent);
      socket.off('user-toggle-mute', handleToggleMuteEvt);
      socket.off('user-toggle-camera', handleToggleCameraEvt);
      socket.off('screen-share-started', handleScreenShareStarted);
      socket.off('screen-share-stopped', handleScreenShareStopped);
      socket.off('chat-message', handleChatMessage);
      socket.off('user-updated', handleUserUpdated);
      socket.off('room-full', handleRoomFull);
    };
  }, [socketId, addToast, createOffer, handleAnswer, handleIceCandidate, handleOffer, navigate, removeAnalyser, removePeerConnection, socketRef]);

  // Auto-join if display name was provided via navigation state
  useEffect(() => {
    if (displayNameFromState && !hasJoined && !inLobby) {
      joinRoom({ cameraOn: initialCameraRef.current, micOn: initialMicRef.current });
    }
  }, [displayNameFromState, hasJoined, inLobby, joinRoom]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      closeAllConnections();
      stopAllTracks();
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [closeAllConnections, stopAllTracks]);

  // Handle toggle mute
  const handleToggleMute = () => {
    const newMuted = toggleMute();
    socketRef.current?.emit('user-toggle-mute', { roomId, isMuted: newMuted });
  };

  // Handle toggle camera
  const handleToggleCamera = () => {
    const newCamOff = toggleCamera();
    socketRef.current?.emit('user-toggle-camera', { roomId, isCameraOff: newCamOff });
  };

  // Handle screen share
  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
      }

      if (streamRef.current) {
        const cameraTrack = streamRef.current.getVideoTracks()[0];
        if (cameraTrack) {
          await replaceTrack(null, cameraTrack);
        }
      }

      screenStreamRef.current = null;
      setIsScreenSharing(false);
      setScreenShareStream(null);
      setScreenSharePeerId(null);
      socketRef.current?.emit('screen-share-stopped', { roomId });
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' },
          audio: false,
        });

        const screenTrack = screenStream.getVideoTracks()[0];
        screenStreamRef.current = screenStream;

        const currentVideoTrack = streamRef.current?.getVideoTracks()[0];
        await replaceTrack(currentVideoTrack, screenTrack);

        setIsScreenSharing(true);
        setScreenShareStream(screenStream);
        setScreenSharePeerId('local');
        socketRef.current?.emit('screen-share-started', { roomId });

        screenTrack.onended = async () => {
          try {
            const newStream = await navigator.mediaDevices.getUserMedia({
              video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
            });
            const newCameraTrack = newStream.getVideoTracks()[0];
            await replaceTrack(screenTrack, newCameraTrack);
          } catch {
            await replaceTrack(screenTrack, null);
          }

          screenStreamRef.current = null;
          setIsScreenSharing(false);
          setScreenShareStream(null);
          setScreenSharePeerId(null);
          socketRef.current?.emit('screen-share-stopped', { roomId });
        };
      } catch {
        console.log('Screen share cancelled or failed');
      }
    }
  };

  // Handle chat
  const handleSendMessage = (message) => {
    socketRef.current?.emit('chat-message', { roomId, message });
  };

  const handleToggleChat = () => {
    setIsChatOpen(prev => {
      if (!prev) {
        setUnreadCount(0);
        setIsParticipantsOpen(false);
      }
      return !prev;
    });
  };

  const handleToggleParticipants = () => {
    setIsParticipantsOpen(prev => {
      if (!prev) setIsChatOpen(false);
      return !prev;
    });
  };

  // End call
  const handleEndCall = () => {
    closeAllConnections();
    stopAllTracks();
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
    }
    navigate('/');
  };

  // Copy room link
  const handleCopyLink = async () => {
    await copyToClipboard(getRoomUrl(roomId));
    setCopied(true);
    addToast('Link copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  // Build participants list using state-based socketId
  const allParticipants = useMemo(() => [
    {
      socketId: socketId || 'local',
      displayName: displayName || 'You',
      isMuted,
      isCameraOff,
    },
    ...Object.entries(peerInfoMap).map(([sid, info]) => ({
      socketId: sid,
      displayName: info.displayName || 'Participant',
      isMuted: info.isMuted || false,
      isCameraOff: info.isCameraOff || false,
    })),
  ], [socketId, displayName, isMuted, isCameraOff, peerInfoMap]);

  // Show lobby if no display name
  if (inLobby) {
    return (
      <Lobby
        roomId={roomId}
        displayName={displayName || 'Guest'}
        onJoin={(settings) => {
          if (!displayName) setDisplayName('Guest');
          joinRoom(settings);
        }}
        participantCount={participantCount}
      />
    );
  }

  // Permission error screen
  if (permissionError && !localStream) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-heavy rounded-2xl p-8 max-w-md text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-danger)]/10 flex items-center justify-center mx-auto mb-4">
            <Video size={28} className="text-[var(--color-danger)]" />
          </div>
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
            Camera Access Required
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">
            {permissionError}
          </p>
          <button
            onClick={() => navigate('/')}
            className="gradient-btn text-white font-medium px-6 py-2.5 rounded-xl text-sm"
          >
            Go Back Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[var(--color-bg)] flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 z-20">
        {/* Left: Logo + Connection */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-light)] flex items-center justify-center">
              <Video size={14} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-[var(--color-text-primary)] hidden sm:inline">
              NearMeet
            </span>
          </div>
          <ConnectionStatus state={connectionState} />
        </div>

        {/* Center: Room ID */}
        <button
          onClick={handleCopyLink}
          className="glass rounded-full px-4 py-1.5 flex items-center gap-2 hover:bg-white/10 transition-colors"
        >
          <span className="text-xs font-mono text-[var(--color-text-secondary)]">{roomId}</span>
          {copied ? (
            <Check size={12} className="text-[var(--color-success)]" />
          ) : (
            <Copy size={12} className="text-[var(--color-text-muted)]" />
          )}
        </button>

        {/* Right: Duration */}
        <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
          <Clock size={14} />
          <span className="text-xs font-mono">{formatDuration(callDuration)}</span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Video grid */}
        <RoomGrid
          localStream={localStream}
          remoteStreams={remoteStreams}
          localDisplayName={displayName}
          localIsMuted={isMuted}
          localIsCameraOff={isCameraOff}
          activeSpeakerId={activeSpeakerId}
          screenShareStream={screenShareStream}
          screenSharePeerId={screenSharePeerId}
          peerInfoMap={peerInfoMap}
          roomId={roomId}
        />

        {/* Side panels */}
        <div className="flex-shrink-0 h-full py-3 pr-3">
          <ChatPanel
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            messages={messages}
            onSend={handleSendMessage}
            localSocketId={socketId}
          />
          <ParticipantList
            isOpen={isParticipantsOpen}
            onClose={() => setIsParticipantsOpen(false)}
            participants={allParticipants}
            localSocketId={socketId}
          />
        </div>
      </div>

      {/* Controls bar */}
      <div className="py-4 px-4 flex justify-center">
        <ControlsBar
          isMuted={isMuted}
          isCameraOff={isCameraOff}
          isScreenSharing={isScreenSharing}
          unreadCount={unreadCount}
          participantCount={allParticipants.length}
          onToggleMute={handleToggleMute}
          onToggleCamera={handleToggleCamera}
          onToggleScreenShare={handleToggleScreenShare}
          onToggleChat={handleToggleChat}
          onToggleParticipants={handleToggleParticipants}
          onEndCall={handleEndCall}
          isChatOpen={isChatOpen}
          isParticipantsOpen={isParticipantsOpen}
        />
      </div>

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
