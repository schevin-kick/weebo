'use client';

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// Separate component for each particle to handle its own state
function ParticleFollower({ connection, delay, scrollYProgress, connections }) {
  const { from, to } = connection;
  const [progress, setProgress] = React.useState(0);

  // Calculate curve control point (matching the line curve logic)
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const perpX = -dy / length;
  const perpY = dx / length;

  // Get the curve intensity pattern for this particle's connection
  const connIndex = connections.findIndex(c => c.from === from && c.to === to);
  const curvePattern = connIndex % 4 === 0 ? [0, 25, -25, 25, -25, 0] :
                       connIndex % 4 === 1 ? [0, -25, 25, -25, 25, 0] :
                       connIndex % 4 === 2 ? [0, 20, -20, 20, -20, 0] :
                       [0, -20, 20, -20, 20, 0];

  // Get current curve intensity from scroll
  const currentIntensity = useTransform(scrollYProgress, [0, 0.2, 0.4, 0.6, 0.8, 1], curvePattern);

  // Animate progress along the path
  React.useEffect(() => {
    let startTime = Date.now() - delay * 1000;
    let animationFrame;

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const cycle = (elapsed % 4) / 4;
      const t = cycle < 0.5 ? cycle * 2 : 2 - cycle * 2;
      setProgress(t);
      animationFrame = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [delay]);

  // Get current intensity value
  const [intensity, setIntensity] = React.useState(0);

  React.useEffect(() => {
    const unsubscribe = currentIntensity.on('change', (latest) => {
      setIntensity(latest);
    });
    // Set initial value
    setIntensity(currentIntensity.get());
    return unsubscribe;
  }, [currentIntensity]);

  // Calculate position on curve
  const ctrlX = midX + perpX * intensity;
  const ctrlY = midY + perpY * intensity;

  const x = Math.pow(1 - progress, 2) * from.x +
           2 * (1 - progress) * progress * ctrlX +
           Math.pow(progress, 2) * to.x;

  const y = Math.pow(1 - progress, 2) * from.y +
           2 * (1 - progress) * progress * ctrlY +
           Math.pow(progress, 2) * to.y;

  const opacity = progress < 0.1 ? progress / 0.1 :
                 progress > 0.9 ? (1 - progress) / 0.1 :
                 1;

  return (
    <circle
      r="3"
      cx={x}
      cy={y}
      fill="#22c55e"
      filter="url(#particleGlow)"
      opacity={opacity}
    />
  );
}

export default function LineBackgroundSvg() {
  // Track page scroll for oscillating animations
  const { scrollYProgress } = useScroll();

  // Create oscillating transforms based on scroll
  const orb1X = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [0, 50, 0, -50, 0]);
  const orb2X = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [0, -40, 0, 40, 0]);
  const orb3Y = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [0, 30, -30, 30, 0]);

  // Grid oscillation
  const gridRotate = useTransform(scrollYProgress, [0, 0.5, 1], [0, 2, 0]);

  // Nodes oscillation (will apply different speeds to different nodes)
  const nodesOffset = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [0, 20, -20, 20, 0]);
  // Network nodes positions (scattered across canvas)
  const nodes = [
    { x: 100, y: 80, r: 4, speed: 0.3 },
    { x: 250, y: 120, r: 5, speed: 0.5 },
    { x: 400, y: 60, r: 6, speed: 0.2 },
    { x: 550, y: 140, r: 4, speed: 0.4 },
    { x: 700, y: 90, r: 5, speed: 0.6 },
    { x: 850, y: 110, r: 4, speed: 0.3 },
    { x: 950, y: 70, r: 6, speed: 0.5 },
    { x: 150, y: 250, r: 5, speed: 0.4 },
    { x: 320, y: 280, r: 4, speed: 0.3 },
    { x: 480, y: 240, r: 6, speed: 0.7 },
    { x: 650, y: 290, r: 5, speed: 0.2 },
    { x: 800, y: 260, r: 4, speed: 0.5 },
    { x: 920, y: 270, r: 5, speed: 0.4 },
    { x: 80, y: 420, r: 4, speed: 0.6 },
    { x: 200, y: 450, r: 5, speed: 0.3 },
    { x: 380, y: 410, r: 6, speed: 0.5 },
    { x: 540, y: 460, r: 4, speed: 0.4 },
    { x: 720, y: 430, r: 5, speed: 0.2 },
    { x: 880, y: 440, r: 6, speed: 0.6 },
    { x: 180, y: 580, r: 4, speed: 0.4 },
    { x: 350, y: 560, r: 5, speed: 0.3 },
    { x: 520, y: 590, r: 4, speed: 0.7 },
    { x: 680, y: 570, r: 6, speed: 0.5 },
    { x: 840, y: 600, r: 5, speed: 0.3 },
  ];

  // Calculate connections (connect nodes within range)
  const connections = [];
  const connectionRange = 180;

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[j].x - nodes[i].x;
      const dy = nodes[j].y - nodes[i].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < connectionRange) {
        connections.push({
          from: nodes[i],
          to: nodes[j],
          opacity: Math.max(0.3, 0.6 - (distance / connectionRange) * 0.3)
        });
      }
    }
  }

  // Particle paths (select some connections for particles)
  const particlePaths = [
    { connection: connections[2], id: 1, delay: 0 },
    { connection: connections[5], id: 2, delay: 0.3 },
    { connection: connections[8], id: 3, delay: 0.6 },
    { connection: connections[12], id: 4, delay: 0.9 },
    { connection: connections[15], id: 5, delay: 1.2 },
    { connection: connections[18], id: 6, delay: 1.5 },
  ].filter(p => p.connection);

  return (
    <svg
      viewBox="0 0 1000 700"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        {/* Gradients */}
        <linearGradient id="lineGreenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00C300" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>

        <linearGradient id="purplePinkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="50%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>

        <radialGradient id="orbGradient1">
          <stop offset="0%" stopColor="#00C300" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#00C300" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="orbGradient2">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="orbGradient3">
          <stop offset="0%" stopColor="#ec4899" stopOpacity="0.07" />
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
        </radialGradient>

        {/* Glow filter */}
        <filter id="nodeGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="particleGlow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background Orbs */}
      <motion.circle
        cx="200"
        cy="150"
        r="300"
        fill="url(#orbGradient1)"
        style={{ x: orb1X }}
        animate={{ y: [0, -30, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.circle
        cx="800"
        cy="550"
        r="400"
        fill="url(#orbGradient2)"
        style={{ x: orb2X }}
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.circle
        cx="500"
        cy="350"
        r="350"
        fill="url(#orbGradient3)"
        style={{ y: orb3Y }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Grid Pattern */}
      <motion.g opacity="0.15" style={{ rotate: gridRotate }}>
        {/* Vertical lines */}
        {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((x) => (
          <line
            key={`v-${x}`}
            x1={x}
            y1="0"
            x2={x}
            y2="700"
            stroke="#6366f1"
            strokeWidth="0.5"
            opacity="0.15"
          />
        ))}
        {/* Horizontal lines */}
        {[100, 200, 300, 400, 500, 600].map((y) => (
          <line
            key={`h-${y}`}
            x1="0"
            y1={y}
            x2="1000"
            y2={y}
            stroke="#6366f1"
            strokeWidth="0.5"
            opacity="0.15"
          />
        ))}
      </motion.g>

      {/* Connection Lines - More Apparent */}
      <g>
        {connections.map((conn, i) => {
          // Create oscillating dash offset based on scroll (flowing pattern)
          const dashOffset = useTransform(
            scrollYProgress,
            [0, 1],
            [0, i % 2 === 0 ? 200 : -200]
          );

          // Calculate midpoint and perpendicular direction for curve control
          const midX = (conn.from.x + conn.to.x) / 2;
          const midY = (conn.from.y + conn.to.y) / 2;

          // Calculate perpendicular vector
          const dx = conn.to.x - conn.from.x;
          const dy = conn.to.y - conn.from.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          const perpX = -dy / length;
          const perpY = dx / length;

          // Create oscillating curve intensity based on scroll
          const curveIntensity = useTransform(
            scrollYProgress,
            [0, 0.2, 0.4, 0.6, 0.8, 1],
            i % 4 === 0 ? [0, 25, -25, 25, -25, 0] :
            i % 4 === 1 ? [0, -25, 25, -25, 25, 0] :
            i % 4 === 2 ? [0, 20, -20, 20, -20, 0] :
            [0, -20, 20, -20, 20, 0]
          );

          // Opacity oscillation for pulsing effect
          const pulseOpacity = useTransform(
            scrollYProgress,
            [0, 0.25, 0.5, 0.75, 1],
            [conn.opacity, conn.opacity * 1.3, conn.opacity, conn.opacity * 1.3, conn.opacity]
          );

          // Create the path with animated control point
          const pathD = useTransform(curveIntensity, (intensity) => {
            const ctrlX = midX + perpX * intensity;
            const ctrlY = midY + perpY * intensity;
            return `M ${conn.from.x} ${conn.from.y} Q ${ctrlX} ${ctrlY} ${conn.to.x} ${conn.to.y}`;
          });

          return (
            <motion.path
              key={`conn-${i}`}
              d={pathD}
              stroke="url(#lineGreenGradient)"
              strokeWidth="2"
              fill="none"
              style={{
                strokeDasharray: "8 4",
                strokeDashoffset: dashOffset,
                opacity: pulseOpacity
              }}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: i * 0.05 }}
            />
          );
        })}
      </g>

      {/* Network Nodes */}
      <g>
        {nodes.map((node, i) => {
          return (
            <motion.g key={`node-${i}`}>
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={node.r}
                fill={i % 3 === 0 ? '#22c55e' : i % 3 === 1 ? '#a855f7' : '#6366f1'}
                opacity={0.5}
                filter="url(#nodeGlow)"
                animate={{
                  scale: [1, 1.8, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 3 + (i % 3),
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut"
                }}
              />
            </motion.g>
          );
        })}
      </g>

      {/* Flowing Particles */}
      <g>
        {particlePaths.map((path) => {
          if (!path.connection) return null;

          return (
            <ParticleFollower
              key={`particle-${path.id}`}
              connection={path.connection}
              delay={path.delay}
              scrollYProgress={scrollYProgress}
              connections={connections}
            />
          );
        })}
      </g>
    </svg>
  );
}
