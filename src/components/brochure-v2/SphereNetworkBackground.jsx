'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo, useState } from 'react';
import * as THREE from 'three';

/**
 * Individual particle that travels along a connection path
 */
function TravelingParticle({ start, end, delay, color }) {
  const particleRef = useRef();
  const [progress, setProgress] = useState(0);

  useFrame((state) => {
    if (!particleRef.current) return;

    // Animate progress from 0 to 1 over time
    const time = state.clock.getElapsedTime();
    const speed = 0.3; // Adjust speed here
    const localProgress = ((time * speed + delay) % 1);
    setProgress(localProgress);

    // Interpolate position along the line
    const x = start.x + (end.x - start.x) * localProgress;
    const y = start.y + (end.y - start.y) * localProgress;
    const z = start.z + (end.z - start.z) * localProgress;

    particleRef.current.position.set(x, y, z);

    // Fade in/out at endpoints
    const fadeDistance = 0.2;
    let opacity = 1;
    if (localProgress < fadeDistance) {
      opacity = localProgress / fadeDistance;
    } else if (localProgress > 1 - fadeDistance) {
      opacity = (1 - localProgress) / fadeDistance;
    }

    particleRef.current.material.opacity = opacity * 0.6;
  });

  return (
    <mesh ref={particleRef}>
      <sphereGeometry args={[0.04, 8, 8]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.3}
      />
    </mesh>
  );
}

/**
 * Main network sphere with nodes, connections, and particles
 */
function NetworkSphere({ scrollProgress }) {
  const groupRef = useRef();
  const linesMaterialRef = useRef();

  // Generate evenly distributed points on sphere surface using Fibonacci sphere
  const { positions, connections } = useMemo(() => {
    const points = [];
    const sphereRadius = 2.8;
    const count = 60; // Reduced from 120 for fewer points and connections

    // Fibonacci sphere algorithm for even distribution
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    for (let i = 0; i < count; i++) {
      const theta = 2 * Math.PI * i / goldenRatio;
      const phi = Math.acos(1 - 2 * (i + 0.5) / count);

      points.push({
        x: sphereRadius * Math.cos(theta) * Math.sin(phi),
        y: sphereRadius * Math.sin(theta) * Math.sin(phi),
        z: sphereRadius * Math.cos(phi)
      });
    }

    // Calculate connections between nearby points
    const conns = [];
    const maxDistance = 1.5; // Reduced from 2.0 for fewer connections
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dx = points[i].x - points[j].x;
        const dy = points[i].y - points[j].y;
        const dz = points[i].z - points[j].z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < maxDistance) {
          conns.push([i, j, dist]); // Store indices and distance
        }
      }
    }

    return { positions: points, connections: conns };
  }, []);

  // Select a subset of connections for particles
  const particleConnections = useMemo(() => {
    // Use about 50% of connections for more traveling particles
    return connections.filter((_, idx) => idx % 2 === 0);
  }, [connections]);

  // Animation loop
  useFrame((state) => {
    if (!groupRef.current) return;

    // Gentle continuous rotation
    groupRef.current.rotation.y += 0.002;

    // Scroll-influenced rotation
    const scrollInfluence = scrollProgress * Math.PI * 2;
    groupRef.current.rotation.x = Math.sin(scrollInfluence * 0.5) * 0.3;
    groupRef.current.rotation.z = Math.cos(scrollInfluence * 0.3) * 0.15;

    // Pulse line opacity based on time
    if (linesMaterialRef.current) {
      const pulse = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1 + 0.25;
      linesMaterialRef.current.opacity = pulse;
    }
  });

  // Color palette matching LINE theme
  const colors = ['#22c55e', '#a855f7', '#6366f1'];

  return (
    <group ref={groupRef}>
      {/* Connection lines using mesh tubes for visibility */}
      {connections.map(([i, j, dist], idx) => {
        const start = positions[i];
        const end = positions[j];

        const direction = new THREE.Vector3(
          end.x - start.x,
          end.y - start.y,
          end.z - start.z
        );
        const length = direction.length();
        direction.normalize();

        const midpoint = new THREE.Vector3(
          (start.x + end.x) / 2,
          (start.y + end.y) / 2,
          (start.z + end.z) / 2
        );

        // Calculate rotation to align cylinder with direction
        const axis = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(axis, direction);
        const euler = new THREE.Euler().setFromQuaternion(quaternion);

        return (
          <mesh
            key={`line-${idx}`}
            position={[midpoint.x, midpoint.y, midpoint.z]}
            rotation={[euler.x, euler.y, euler.z]}
          >
            <cylinderGeometry args={[0.012, 0.012, length, 4]} />
            <meshBasicMaterial
              ref={idx === 0 ? linesMaterialRef : null}
              color="#22c55e"
              transparent
              opacity={0.25}
            />
          </mesh>
        );
      })}

      {/* Traveling particles */}
      {particleConnections.map(([i, j], idx) => {
        const start = positions[i];
        const end = positions[j];
        const color = colors[idx % colors.length];

        return (
          <TravelingParticle
            key={`particle-${idx}`}
            start={start}
            end={end}
            delay={idx * 0.5}
            color={color}
          />
        );
      })}

      {/* Network nodes */}
      {positions.map((pos, idx) => {
        const color = colors[idx % colors.length];
        const size = 0.02 + (idx % 3) * 0.005; // Even smaller node size

        return (
          <mesh key={`node-${idx}`} position={[pos.x, pos.y, pos.z]}>
            <sphereGeometry args={[size, 16, 16]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.05}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/**
 * Main component - integrates Three.js Canvas with scroll tracking
 */
export default function SphereNetworkBackground({ scrollProgress = 0 }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 60 }}
      gl={{ alpha: true, antialias: true }}
      style={{ background: 'transparent' }}
    >
      {/* Ambient light for overall illumination */}
      <ambientLight intensity={0.4} />

      {/* Point lights for node highlights */}
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#22c55e" />
      <pointLight position={[-5, -5, 5]} intensity={0.3} color="#a855f7" />

      {/* Main network sphere */}
      <NetworkSphere scrollProgress={scrollProgress} />
    </Canvas>
  );
}
