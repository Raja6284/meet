import { useRef, useCallback } from 'react';

/**
 * A 3D tilt card that follows the mouse with perspective transforms.
 * Renders a glass panel with mouse-following radial light sweep.
 */
export default function TiltCard({ children, className = '' }) {
  const cardRef = useRef(null);
  const glowRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

    if (glowRef.current) {
      glowRef.current.style.opacity = '1';
      glowRef.current.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(124,58,237,0.15) 0%, transparent 60%)`;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (card) {
      card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    }
    if (glowRef.current) {
      glowRef.current.style.opacity = '0';
    }
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative transition-transform duration-200 ease-out ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Mouse-following glow */}
      <div
        ref={glowRef}
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 transition-opacity duration-300"
        style={{ zIndex: 1 }}
      />
      {/* Content */}
      <div className="relative" style={{ zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
}
