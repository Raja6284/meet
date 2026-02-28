import { useEffect, useRef, useState, useCallback } from 'react';

export function useActiveSpeaker() {
  const [activeSpeakerId, setActiveSpeakerId] = useState(null);
  const audioContextRef = useRef(null);
  const analysersRef = useRef({});
  const rafRef = useRef(null);

  const setupAnalyser = useCallback((peerId, stream) => {
    if (!stream || analysersRef.current[peerId]) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      const ctx = audioContextRef.current;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.5;
      source.connect(analyser);

      analysersRef.current[peerId] = { analyser, source };
    } catch (err) {
      console.warn('[ActiveSpeaker] Error setting up analyser:', err);
    }
  }, []);

  const removeAnalyser = useCallback((peerId) => {
    if (analysersRef.current[peerId]) {
      try {
        analysersRef.current[peerId].source.disconnect();
      } catch { /* source already disconnected */ }
      delete analysersRef.current[peerId];
    }
  }, []);

  useEffect(() => {
    const detect = () => {
      let maxVolume = 0;
      let loudestPeer = null;
      const threshold = 15; // volume threshold

      for (const [peerId, { analyser }] of Object.entries(analysersRef.current)) {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);

        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          sum += data[i];
        }
        const average = sum / data.length;

        if (average > threshold && average > maxVolume) {
          maxVolume = average;
          loudestPeer = peerId;
        }
      }

      setActiveSpeakerId(prev => {
        if (loudestPeer !== prev) return loudestPeer;
        return prev;
      });

      rafRef.current = requestAnimationFrame(detect);
    };

    rafRef.current = requestAnimationFrame(detect);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return {
    activeSpeakerId,
    setupAnalyser,
    removeAnalyser,
  };
}
