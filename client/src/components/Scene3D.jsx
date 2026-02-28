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
      meshRef.current.rotation.y = t * 0.08;
      meshRef.current.rotation.x = Math.sin(t * 0.05) * 0.15;
    }
    if (wireRef.current) {
      wireRef.current.rotation.y = t * 0.08;
      wireRef.current.rotation.x = Math.sin(t * 0.05) * 0.15;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.8}>
      <group>
        {/* Solid mesh */}
        <mesh ref={meshRef}>
          <torusKnotGeometry args={[1, 0.35, 128, 32]} />
          <MeshDistortMaterial
            color="#7c3aed"
            emissive="#7c3aed"
            emissiveIntensity={0.4}
            roughness={0.3}
            metalness={0.8}
            distort={0.4}
            speed={1.5}
          />
        </mesh>
        {/* Wireframe overlay */}
        <mesh ref={wireRef}>
          <torusKnotGeometry args={[1, 0.35, 128, 32]} />
          <meshBasicMaterial
            color="#a78bfa"
            wireframe
            transparent
            opacity={0.08}
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
      ref.current.rotation.x = t * speed * 0.3;
      ref.current.rotation.z = t * speed * 0.2;
      ref.current.position.y = position[1] + Math.sin(t * speed) * 0.3;
    }
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      {geometry === 'octahedron' && <octahedronGeometry args={[1, 0]} />}
      {geometry === 'sphere' && <sphereGeometry args={[1, 16, 16]} />}
      {geometry === 'icosahedron' && <icosahedronGeometry args={[1, 0]} />}
      {geometry === 'dodecahedron' && <dodecahedronGeometry args={[1, 0]} />}
      <meshStandardMaterial
        color="#7c3aed"
        emissive="#6d28d9"
        emissiveIntensity={0.3}
        transparent
        opacity={0.15}
        roughness={0.5}
        metalness={0.6}
      />
    </mesh>
  );
}

/* ─── Glow plane behind the main mesh ─── */
function GlowPlane() {
  const material = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    gradient.addColorStop(0, 'rgba(124, 58, 237, 0.25)');
    gradient.addColorStop(0.5, 'rgba(124, 58, 237, 0.08)');
    gradient.addColorStop(1, 'rgba(124, 58, 237, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
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
      <ambientLight intensity={0.15} />
      <pointLight position={[5, 5, 5]} intensity={0.6} color="#a78bfa" />
      <pointLight position={[-5, -3, 3]} intensity={0.3} color="#6366f1" />
      <directionalLight position={[0, 5, 5]} intensity={0.2} color="#ddd6fe" />

      <GlowPlane />

      {!subtle && <HeroMesh />}
      {subtle && (
        <Float speed={0.8} rotationIntensity={0.1} floatIntensity={0.3}>
          <mesh scale={0.6}>
            <icosahedronGeometry args={[1, 1]} />
            <MeshDistortMaterial
              color="#7c3aed"
              emissive="#7c3aed"
              emissiveIntensity={0.2}
              roughness={0.4}
              metalness={0.7}
              distort={0.25}
              speed={1}
              transparent
              opacity={0.4}
            />
          </mesh>
        </Float>
      )}

      <Sparkles
        count={subtle ? 60 : 120}
        color="#a78bfa"
        size={1.5}
        opacity={subtle ? 0.3 : 0.6}
        scale={[20, 20, 20]}
        speed={0.4}
      />

      {/* Floating shapes */}
      <FloatingShape position={[-4, 2, -3]} geometry="octahedron" scale={0.25} speed={0.3} />
      <FloatingShape position={[4.5, -1.5, -4]} geometry="sphere" scale={0.35} speed={0.4} />
      <FloatingShape position={[-3, -2.5, -5]} geometry="icosahedron" scale={0.2} speed={0.35} />
      <FloatingShape position={[3, 3, -6]} geometry="dodecahedron" scale={0.3} speed={0.25} />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
        autoRotate
        autoRotateSpeed={0.3}
      />
    </>
  );
}

/* ─── Main exported component ─── */
export default function Scene3D({ subtle = false, className = '' }) {
  return (
    <div className={`absolute inset-0 ${className}`} style={{ zIndex: 0 }}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
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
