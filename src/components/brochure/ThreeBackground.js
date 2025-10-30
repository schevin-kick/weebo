'use client';

import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

// Individual sakura petal with realistic shape and animation
function SakuraPetal({ position, rotation, scale, color, speed }) {
  const meshRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    // Natural falling and drifting motion
    meshRef.current.position.y -= speed * 0.01;
    meshRef.current.position.x += Math.sin(time * speed + position[2]) * 0.001;

    // Gentle tumbling rotation like real petals
    meshRef.current.rotation.x += speed * 0.02;
    meshRef.current.rotation.z += speed * 0.015;

    // Reset position when petal falls too low
    if (meshRef.current.position.y < -10) {
      meshRef.current.position.y = 10;
      meshRef.current.position.x = position[0];
      meshRef.current.position.z = position[2];
    }
  });

  // Create realistic sakura petal shape
  const shape = useMemo(() => {
    const petalShape = new THREE.Shape();

    // Create a teardrop/oval petal shape with slight notch at tip
    petalShape.moveTo(0, 0);
    petalShape.bezierCurveTo(0.15, 0.1, 0.25, 0.3, 0.25, 0.5);
    petalShape.bezierCurveTo(0.25, 0.7, 0.15, 0.85, 0, 1);
    petalShape.bezierCurveTo(-0.15, 0.85, -0.25, 0.7, -0.25, 0.5);
    petalShape.bezierCurveTo(-0.25, 0.3, -0.15, 0.1, 0, 0);

    return petalShape;
  }, []);

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
      <shapeGeometry args={[shape]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.1}
        side={THREE.DoubleSide}
        transparent
        opacity={0.85}
      />
    </mesh>
  );
}

// Collection of falling sakura petals
function SakuraLeaves() {
  const sakuraColors = [
    '#ffc0cb', // light pink
    '#ffb6c1', // pale pink
    '#ff69b4', // hot pink
    '#ffd1dc', // white-pink
    '#ffb7d5', // soft rose
    '#ffe4e1', // misty rose
  ];

  // Generate petals with random properties
  const petals = useMemo(() => {
    const petalArray = [];
    for (let i = 0; i < 35; i++) {
      petalArray.push({
        position: [
          (Math.random() - 0.5) * 12, // x: -6 to 6
          Math.random() * 12 - 3,     // y: -3 to 9
          Math.random() * -8 - 2,     // z: -2 to -10
        ],
        rotation: [
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI,
        ],
        scale: 0.2 + Math.random() * 0.25, // 0.2 to 0.45
        color: sakuraColors[Math.floor(Math.random() * sakuraColors.length)],
        speed: 0.3 + Math.random() * 0.7, // 0.3 to 1.0
      });
    }
    return petalArray;
  }, []);

  return (
    <>
      {petals.map((petal, index) => (
        <SakuraPetal
          key={index}
          position={petal.position}
          rotation={petal.rotation}
          scale={petal.scale}
          color={petal.color}
          speed={petal.speed}
        />
      ))}
    </>
  );
}

// Interactive particles with mouse interaction
function InteractiveParticles() {
  const particlesRef = useRef();
  const mouseRef = useRef({ x: 0, y: 0 });

  // Generate particles with brand colors
  const particles = useMemo(() => {
    const brandColors = ['#fb923c', '#fbbf24', '#f472b6', '#ff6b9d']; // orange, amber, pink
    const particleArray = [];

    for (let i = 0; i < 200; i++) {
      particleArray.push({
        position: [
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20,
          Math.random() * -15 - 5,
        ],
        color: brandColors[Math.floor(Math.random() * brandColors.length)],
        size: Math.random() * 0.05 + 0.02,
        speed: Math.random() * 0.3 + 0.1,
        offset: Math.random() * Math.PI * 2,
      });
    }
    return particleArray;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (particlesRef.current) {
      particlesRef.current.children.forEach((particle, i) => {
        const data = particles[i];

        // Floating animation
        particle.position.y += Math.sin(time * data.speed + data.offset) * 0.001;
        particle.position.x += Math.cos(time * data.speed * 0.5 + data.offset) * 0.001;

        // Mouse interaction - gentle repulsion
        const dx = particle.position.x - mouseRef.current.x;
        const dy = particle.position.y - mouseRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 2) {
          const force = (2 - distance) / 2;
          particle.position.x += (dx / distance) * force * 0.01;
          particle.position.y += (dy / distance) * force * 0.01;
        }

        // Gentle pulsing
        particle.scale.setScalar(1 + Math.sin(time * 2 + data.offset) * 0.2);
      });
    }
  });

  // Track mouse movement
  useFrame((state) => {
    mouseRef.current.x = (state.mouse.x * state.viewport.width) / 2;
    mouseRef.current.y = (state.mouse.y * state.viewport.height) / 2;
  });

  return (
    <group ref={particlesRef}>
      {particles.map((particle, i) => (
        <mesh key={i} position={particle.position}>
          <sphereGeometry args={[particle.size, 16, 16]} />
          <meshStandardMaterial
            color={particle.color}
            emissive={particle.color}
            emissiveIntensity={0.8}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}

// Main scene component
function Scene() {
  return (
    <>
      {/* Lighting - soft pink and ambient */}
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#ffb6c1" />
      <pointLight position={[-10, -10, -10]} intensity={0.4} color="#ffc0cb" />

      {/* Stars background */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* Interactive particles */}
      <InteractiveParticles />

      {/* Falling sakura petals */}
      <SakuraLeaves />
    </>
  );
}

// Loading Spinner Component
function LoadingSpinner() {
  return (
    <div className="fixed inset-0 -z-10 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e293b 100%)' }}>
      <div className="relative">
        {/* Outer spinning ring */}
        <div className="w-16 h-16 border-4 border-white/10 border-t-orange-400 rounded-full animate-spin" />
        {/* Inner pulsing circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// Main component
export default function ThreeBackground() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {isLoading && <LoadingSpinner />}
      <div className="fixed inset-0 -z-10">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 75 }}
          style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e293b 100%)' }}
          onCreated={() => {
            // Hide loading spinner once canvas is created
            setTimeout(() => setIsLoading(false), 100);
          }}
        >
          <Scene />
        </Canvas>
      </div>
    </>
  );
}
