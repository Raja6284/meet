import { useState, useCallback, useRef, useEffect } from 'react';

export function useMediaStream() {
  const [localStream, setLocalStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const streamRef = useRef(null);

  const getMediaStream = useCallback(async (video = true, audio = true) => {
    try {
      setPermissionError(null);
      const constraints = {
        audio: audio ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } : false,
        video: video ? {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 30 },
          facingMode: 'user',
        } : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setLocalStream(stream);
      setHasPermission(true);
      return stream;
    } catch (err) {
      console.error('[Media] Error getting media stream:', err);
      setHasPermission(false);

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionError('Camera and microphone access was denied. Please allow access in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setPermissionError('No camera or microphone found. Please connect a device and try again.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setPermissionError('Your camera or microphone is already in use by another application.');
      } else if (err.name === 'OverconstrainedError') {
        setPermissionError('Could not find a camera that meets the requirements.');
      } else {
        setPermissionError('An unexpected error occurred while accessing your camera and microphone.');
      }

      // Try audio-only fallback if video fails
      if (video) {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          streamRef.current = audioStream;
          setLocalStream(audioStream);
          setIsCameraOff(true);
          setPermissionError('Camera unavailable — joined with audio only.');
          return audioStream;
        } catch {
          // Both failed
        }
      }

      return null;
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(prev => !prev);
      return !isMuted;
    }
    return isMuted;
  }, [isMuted]);

  const toggleCamera = useCallback(() => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsCameraOff(prev => !prev);
      return !isCameraOff;
    }
    return isCameraOff;
  }, [isCameraOff]);

  const stopAllTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setLocalStream(null);
    }
  }, []);

  const replaceVideoTrack = useCallback((newTrack) => {
    if (streamRef.current) {
      const oldVideoTrack = streamRef.current.getVideoTracks()[0];
      if (oldVideoTrack) {
        streamRef.current.removeTrack(oldVideoTrack);
      }
      streamRef.current.addTrack(newTrack);
      setLocalStream(new MediaStream(streamRef.current.getTracks()));
    }
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return {
    localStream,
    streamRef,
    isMuted,
    isCameraOff,
    permissionError,
    hasPermission,
    getMediaStream,
    toggleMute,
    toggleCamera,
    stopAllTracks,
    replaceVideoTrack,
    setIsMuted,
    setIsCameraOff,
  };
}
