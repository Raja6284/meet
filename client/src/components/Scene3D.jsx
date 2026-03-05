import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sparkles, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

/* ─── Central hero mesh ─── */
function HeroMesh() {
  const meshRef = useRef();
  const wireRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.06;
      meshRef.current.rotation.x = Math.sin(t * 0.04) * 0.12;
    }
    if (wireRef.current) {
      wireRef.current.rotation.y = t * 0.06;
      wireRef.current.rotation.x = Math.sin(t * 0.04) * 0.12;
    }
  });

  return (
    <Float speed={0.8} rotationIntensity={0.2} floatIntensity={0.5}>
      <group position={[0, 0, 0]} scale={0.9}>
        {/* Solid mesh */}
        <mesh ref={meshRef}>
          <torusKnotGeometry args={[1, 0.35, 100, 24]} />
          <MeshDistortMaterial
            color="#4c1d95"
            emissive="#5b21b6"
            emissiveIntensity={0.2}
            roughness={0.5}
            metalness={0.6}
            distort={0.3}
            speed={1.2}
            transparent
            opacity={0.35}
          />
        </mesh>
        {/* Wireframe overlay */}
        <mesh ref={wireRef}>
          <torusKnotGeometry args={[1, 0.35, 100, 24]} />
          <meshBasicMaterial
            color="#7c3aed"
            wireframe
            transparent
            opacity={0.025}
          />
        </mesh>
      </group>
    </Float>
  );
}

/* ─── Background floating shapes ─── */
function FloatingShape({ position, geometry, scale = 0.3, speed = 0.5 }) {
  const ref = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.x = t * speed * 0.2;
      ref.current.rotation.z = t * speed * 0.15;
      ref.current.position.y = position[1] + Math.sin(t * speed) * 0.25;
    }
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      {geometry === 'octahedron' && <octahedronGeometry args={[1, 0]} />}
      {geometry === 'sphere' && <sphereGeometry args={[1, 12, 12]} />}
      {geometry === 'icosahedron' && <icosahedronGeometry args={[1, 0]} />}
      {geometry === 'dodecahedron' && <dodecahedronGeometry args={[1, 0]} />}
      <meshStandardMaterial
        color="#4c1d95"
        emissive="#5b21b6"
        emissiveIntensity={0.1}
        transparent
        opacity={0.06}
        roughness={0.6}
        metalness={0.5}
      />
    </mesh>
  );
}

/* ─── Glow plane behind the main mesh ─── */
function GlowPlane() {
  const material = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, 'rgba(91, 33, 182, 0.08)');
    gradient.addColorStop(0.5, 'rgba(91, 33, 182, 0.03)');
    gradient.addColorStop(1, 'rgba(91, 33, 182, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(canvas);
    return new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
    });
  }, []);

  return (
    <mesh position={[0, 0, -2]} material={material}>
      <planeGeometry args={[10, 10]} />
    </mesh>
  );
}

/* ─── Scene content ─── */
function SceneContent({ subtle = false }) {
  return (
    <>
      <ambientLight intensity={0.08} />
      <pointLight position={[5, 5, 5]} intensity={0.25} color="#9b87f5" />
      <pointLight position={[-5, -3, 3]} intensity={0.1} color="#7c3aed" />
      <directionalLight position={[0, 5, 5]} intensity={0.08} color="#c4b5fd" />

      <GlowPlane />

      {!subtle && <HeroMesh />}
      {subtle && (
        <Float speed={0.6} rotationIntensity={0.08} floatIntensity={0.2}>
          <mesh scale={0.5}>
            <icosahedronGeometry args={[1, 1]} />
            <MeshDistortMaterial
              color="#7c3aed"
              emissive="#7c3aed"
              emissiveIntensity={0.15}
              roughness={0.5}
              metalness={0.6}
              distort={0.2}
              speed={0.8}
              transparent
              opacity={0.3}
            />
          </mesh>
        </Float>
      )}

      <Sparkles
        count={subtle ? 30 : 50}
        color="#c4b5fd"
        size={1}
        opacity={subtle ? 0.15 : 0.3}
        scale={[20, 20, 20]}
        speed={0.2}
      />

      {/* Floating shapes — fewer and more subtle */}
      <FloatingShape position={[-4, 2, -3]} geometry="octahedron" scale={0.2} speed={0.25} />
      <FloatingShape position={[4.5, -1.5, -4]} geometry="sphere" scale={0.3} speed={0.3} />
      <FloatingShape position={[-3, -2.5, -5]} geometry="icosahedron" scale={0.18} speed={0.28} />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
        autoRotate
        autoRotateSpeed={0.2}
      />
    </>
  );
}

/* ─── Main exported component ─── */
export default function Scene3D({ subtle = false, className = '' }) {
  return (
    <div className={`absolute inset-0 ${className}`} style={{ zIndex: 0 }}>
      {/* Dark radial vignette overlay for text readability */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse 70% 55% at 50% 40%, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.35) 45%, transparent 100%)',
        }}
      />
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        style={{ background: 'transparent' }}
        frameloop="always"
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <Suspense fallback={null}>
          <SceneContent subtle={subtle} />
        </Suspense>
      </Canvas>
    </div>
  );
}
