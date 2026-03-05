import { useRef, useCallback, useEffect } from 'react';

const DEFAULT_ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export function useWebRTC({ socketRef, localStreamRef, onRemoteStream, onPeerDisconnected, onConnectionStateChange, iceServers }) {
  const peerConnectionsRef = useRef({});
  const pendingCandidatesRef = useRef({});

  // Use provided ICE servers or default to STUN-only
  const ICE_SERVERS = iceServers || DEFAULT_ICE_SERVERS;

  const createPeerConnection = useCallback((peerId, peerInfo, isInitiator) => {
    if (peerConnectionsRef.current[peerId]) {
      console.log(`[WebRTC] PC already exists for ${peerId}`);
      return peerConnectionsRef.current[peerId];
    }

    console.log(`[WebRTC] Creating PC for ${peerId} (initiator: ${isInitiator})`);

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    peerConnectionsRef.current[peerId] = pc;

    // Add local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // ICE Candidate handling
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('ice-candidate', {
          to: peerId,
          candidate: event.candidate,
        });
      }
    };

    // Remote stream handling
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteStream && onRemoteStream) {
        onRemoteStream(peerId, remoteStream, peerInfo);
      }
    };

    // Connection state
    pc.onconnectionstatechange = () => {
      console.log(`[WebRTC] Connection state (${peerId}):`, pc.connectionState);
      if (onConnectionStateChange) {
        onConnectionStateChange(peerId, pc.connectionState);
      }

      if (pc.connectionState === 'failed') {
        // Try ICE restart
        console.log(`[WebRTC] Attempting ICE restart for ${peerId}`);
        pc.restartIce();
      }

      if (pc.connectionState === 'disconnected' || pc.connectionState === 'closed') {
        // Wait a bit before declaring disconnect (might reconnect)
        setTimeout(() => {
          if (pc.connectionState === 'disconnected' || pc.connectionState === 'closed') {
            if (onPeerDisconnected) {
              onPeerDisconnected(peerId);
            }
          }
        }, 5000);
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log(`[WebRTC] ICE state (${peerId}):`, pc.iceConnectionState);
      if (pc.iceConnectionState === 'failed') {
        pc.restartIce();
      }
    };

    // Process any pending ICE candidates
    if (pendingCandidatesRef.current[peerId]) {
      pendingCandidatesRef.current[peerId].forEach(candidate => {
        pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
      });
      delete pendingCandidatesRef.current[peerId];
    }

    return pc;
  }, [socketRef, localStreamRef, onRemoteStream, onPeerDisconnected, onConnectionStateChange, ICE_SERVERS]);

  const createOffer = useCallback(async (peerId, peerInfo) => {
    const pc = createPeerConnection(peerId, peerInfo, true);
    
    try {
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await pc.setLocalDescription(offer);

      if (socketRef.current) {
        socketRef.current.emit('offer', {
          to: peerId,
          offer: pc.localDescription,
        });
      }
    } catch (err) {
      console.error('[WebRTC] Error creating offer:', err);
    }
  }, [createPeerConnection, socketRef]);

  const handleOffer = useCallback(async (fromId, offer, peerInfo) => {
    const pc = createPeerConnection(fromId, peerInfo, false);

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      if (socketRef.current) {
        socketRef.current.emit('answer', {
          to: fromId,
          answer: pc.localDescription,
        });
      }
    } catch (err) {
      console.error('[WebRTC] Error handling offer:', err);
    }
  }, [createPeerConnection, socketRef]);

  const handleAnswer = useCallback(async (fromId, answer) => {
    const pc = peerConnectionsRef.current[fromId];
    if (pc) {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (err) {
        console.error('[WebRTC] Error handling answer:', err);
      }
    }
  }, []);

  const handleIceCandidate = useCallback(async (fromId, candidate) => {
    const pc = peerConnectionsRef.current[fromId];
    if (pc) {
      if (pc.remoteDescription) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error('[WebRTC] Error adding ICE candidate:', err);
        }
      } else {
        // Queue candidate if remote description not yet set
        if (!pendingCandidatesRef.current[fromId]) {
          pendingCandidatesRef.current[fromId] = [];
        }
        pendingCandidatesRef.current[fromId].push(candidate);
      }
    }
  }, []);

  const removePeerConnection = useCallback((peerId) => {
    const pc = peerConnectionsRef.current[peerId];
    if (pc) {
      pc.close();
      delete peerConnectionsRef.current[peerId];
    }
    delete pendingCandidatesRef.current[peerId];
  }, []);

  const replaceTrack = useCallback(async (oldTrack, newTrack) => {
    const promises = [];
    for (const [, pc] of Object.entries(peerConnectionsRef.current)) {
      const sender = pc.getSenders().find(s => s.track && s.track.kind === (oldTrack ? oldTrack.kind : newTrack.kind));
      if (sender) {
        promises.push(sender.replaceTrack(newTrack));
      }
    }
    await Promise.all(promises);
  }, []);

  const closeAllConnections = useCallback(() => {
    for (const [, pc] of Object.entries(peerConnectionsRef.current)) {
      pc.close();
    }
    peerConnectionsRef.current = {};
    pendingCandidatesRef.current = {};
  }, []);

  const getConnectionStats = useCallback(async (peerId) => {
    const pc = peerConnectionsRef.current[peerId];
    if (!pc) return null;

    try {
      const stats = await pc.getStats();
      let result = { bitrate: 0, packetsLost: 0, roundTripTime: 0 };

      stats.forEach(report => {
        if (report.type === 'candidate-pair' && report.state === 'succeeded') {
          result.roundTripTime = report.currentRoundTripTime || 0;
        }
        if (report.type === 'inbound-rtp' && report.kind === 'video') {
          result.packetsLost = report.packetsLost || 0;
        }
      });

      return result;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    return () => {
      closeAllConnections();
    };
  }, [closeAllConnections]);

  return {
    peerConnectionsRef,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    removePeerConnection,
    replaceTrack,
    closeAllConnections,
    getConnectionStats,
  };
}
