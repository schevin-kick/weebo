'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Animated fox/kitsune particle
function FoxParticle({ position, scale }) {
  const meshRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.position.y = position[1] + Math.sin(time * 0.5 + position[0]) * 0.5;
    meshRef.current.rotation.y = time * 0.3;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position} scale={scale}>
        {/* Fox head - simplified geometric shape */}
        <coneGeometry args={[0.5, 1, 3]} />
        <meshStandardMaterial color="#fb923c" emissive="#f97316" emissiveIntensity={0.3} />
      </mesh>
    </Float>
  );
}

// Floating particle system
function ParticleField() {
  const particlesRef = useRef();

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 100; i++) {
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 20;
      temp.push(x, y, z);
    }
    return new Float32Array(temp);
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    particlesRef.current.rotation.y = time * 0.05;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#fbbf24"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// Rotating geometric shapes
function GeometricShapes() {
  const groupRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    groupRef.current.rotation.x = time * 0.1;
    groupRef.current.rotation.y = time * 0.15;
  });

  return (
    <group ref={groupRef}>
      {/* Torus */}
      <mesh position={[3, 2, -5]}>
        <torusGeometry args={[1, 0.3, 16, 100]} />
        <meshStandardMaterial color="#ec4899" wireframe />
      </mesh>

      {/* Octahedron */}
      <mesh position={[-3, -1, -3]}>
        <octahedronGeometry args={[1]} />
        <meshStandardMaterial color="#8b5cf6" wireframe />
      </mesh>

      {/* Dodecahedron */}
      <mesh position={[0, -2, -8]}>
        <dodecahedronGeometry args={[0.8]} />
        <meshStandardMaterial color="#06b6d4" wireframe />
      </mesh>
    </group>
  );
}

// Main scene component
function Scene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#fbbf24" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ec4899" />

      {/* Stars background */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* Fox particles */}
      <FoxParticle position={[2, 1, -5]} scale={0.3} />
      <FoxParticle position={[-3, -1, -7]} scale={0.4} />
      <FoxParticle position={[1, -2, -4]} scale={0.35} />
      <FoxParticle position={[-2, 2, -6]} scale={0.3} />

      {/* Particle field */}
      <ParticleField />

      {/* Geometric shapes */}
      <GeometricShapes />
    </>
  );
}

// Main component
export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e293b 100%)' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
