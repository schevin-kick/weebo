'use client';

import { motion, useScroll, useTransform } from 'framer-motion';

export default function QRCodeMagicSvg({ containerRef }) {
  // Track scroll progress of the section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 70%', 'end 30%']
  });

  // Progressive animation stages
  const outlineProgress = useTransform(scrollYProgress, [0, 0.3], [0, 1]);
  const moduleProgress = useTransform(scrollYProgress, [0.25, 0.65], [0, 1]);
  const scanProgress = useTransform(scrollYProgress, [0.6, 1], [0, 1]);
  const glowIntensity = useTransform(scrollYProgress, [0.4, 0.7, 1], [0, 1, 0.6]);

  // Generate QR code pattern (21x21 grid - standard size)
  const generateQRPattern = () => {
    const grid = Array(21).fill(null).map(() => Array(21).fill(false));

    // Position detection patterns (corners)
    const addFinderPattern = (startRow, startCol) => {
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
          if (
            (i === 0 || i === 6 || j === 0 || j === 6) ||
            (i >= 2 && i <= 4 && j >= 2 && j <= 4)
          ) {
            grid[startRow + i][startCol + j] = true;
          }
        }
      }
    };

    // Add finder patterns in corners
    addFinderPattern(0, 0);     // Top-left
    addFinderPattern(0, 14);    // Top-right
    addFinderPattern(14, 0);    // Bottom-left

    // Add timing patterns
    for (let i = 8; i < 13; i++) {
      grid[6][i] = i % 2 === 0;
      grid[i][6] = i % 2 === 0;
    }

    // Add data pattern (more realistic QR-like pattern)
    for (let i = 0; i < 21; i++) {
      for (let j = 0; j < 21; j++) {
        if (!grid[i][j]) {
          // Create more varied pattern using multiple pseudo-random sources
          const hash = (i * 31 + j * 17 + (i ^ j) * 23) % 100;
          grid[i][j] = hash < 48; // ~48% fill rate for realistic look
        }
      }
    }

    return grid;
  };

  const qrPattern = generateQRPattern();
  const moduleSize = 14;
  const totalSize = 21 * moduleSize;

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <motion.svg
        viewBox="0 0 600 600"
        className="w-full h-full max-w-[500px]"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Orange to Pink Gradient - Main theme */}
          <linearGradient id="qrMainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="50%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>

          {/* Animated gradient for scan effect */}
          <linearGradient id="scanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0" />
            <stop offset="50%" stopColor="#f97316" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="qrGlow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Intense glow for scanning */}
          <filter id="intensGlow">
            <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Clip path for QR code */}
          <clipPath id="qrClip">
            <rect x="0" y="0" width={totalSize} height={totalSize} rx="24" ry="24" />
          </clipPath>
        </defs>

        {/* Center the QR code */}
        <g transform={`translate(${(600 - totalSize) / 2}, ${(600 - totalSize) / 2})`}>

          {/* Background glow effect */}
          <motion.rect
            x="-20"
            y="-20"
            width={totalSize + 40}
            height={totalSize + 40}
            rx="40"
            fill="url(#qrMainGradient)"
            opacity={glowIntensity}
            style={{ opacity: useTransform(glowIntensity, v => v * 0.15) }}
            filter="url(#intensGlow)"
          />

          {/* Main QR container outline - draws in first */}
          <motion.rect
            x="-8"
            y="-8"
            width={totalSize + 16}
            height={totalSize + 16}
            rx="28"
            stroke="url(#qrMainGradient)"
            strokeWidth="3"
            fill="none"
            strokeDasharray={totalSize * 4 + 64}
            style={{
              pathLength: outlineProgress
            }}
            filter="url(#qrGlow)"
          />

          {/* Corner brackets - appear with outline */}
          <motion.g
            style={{
              opacity: useTransform(outlineProgress, [0.5, 0.8], [0, 0.6])
            }}
          >
            {/* Top-left bracket */}
            <path d="M -20 60 L -20 -20 L 60 -20" stroke="url(#qrMainGradient)" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Top-right bracket */}
            <path d={`M ${totalSize - 60} -20 L ${totalSize + 20} -20 L ${totalSize + 20} 60`} stroke="url(#qrMainGradient)" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Bottom-left bracket */}
            <path d={`M -20 ${totalSize - 60} L -20 ${totalSize + 20} L 60 ${totalSize + 20}`} stroke="url(#qrMainGradient)" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Bottom-right bracket */}
            <path d={`M ${totalSize - 60} ${totalSize + 20} L ${totalSize + 20} ${totalSize + 20} L ${totalSize + 20} ${totalSize - 60}`} stroke="url(#qrMainGradient)" strokeWidth="2" fill="none" strokeLinecap="round" />
          </motion.g>

          {/* QR Code Modules */}
          <g clipPath="url(#qrClip)">
            {qrPattern.map((row, i) =>
              row.map((isActive, j) => {
                if (!isActive) return null;

                // Calculate animation timing based on distance from center
                const centerDist = Math.sqrt(
                  Math.pow(i - 10, 2) + Math.pow(j - 10, 2)
                );
                const normalizedDist = centerDist / 14; // Max distance ~14
                const delay = normalizedDist * 0.5;

                // Determine if this is a finder pattern (corner)
                const isFinder =
                  (i < 7 && j < 7) ||
                  (i < 7 && j >= 14) ||
                  (i >= 14 && j < 7);

                const baseOpacity = useTransform(
                  moduleProgress,
                  [delay, delay + 0.15],
                  [0, 1]
                );

                return (
                  <motion.rect
                    key={`module-${i}-${j}`}
                    x={j * moduleSize}
                    y={i * moduleSize}
                    width={moduleSize - 2}
                    height={moduleSize - 2}
                    rx="2"
                    fill="#1f2937"
                    initial={{ opacity: 0, scale: 0 }}
                    style={{
                      opacity: baseOpacity,
                      scale: useTransform(
                        moduleProgress,
                        [delay, delay + 0.08, delay + 0.15],
                        [0, 1.15, 1]
                      )
                    }}
                    animate={isFinder && delay <= 0.15 ? {
                      scale: [1, 1.05, 1],
                      opacity: [1, 0.8, 1]
                    } : undefined}
                    transition={isFinder && delay <= 0.15 ? {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: (i < 7 && j < 7) ? 2 : (i < 7 && j >= 14) ? 2.3 : 2.6
                    } : undefined}
                  />
                );
              })
            )}
          </g>

          {/* Scanning line effect */}
          <motion.rect
            x="-8"
            y={0}
            width={totalSize + 16}
            height="40"
            fill="url(#scanGradient)"
            style={{
              y: useTransform(scanProgress, [0, 1], [-40, totalSize + 40]),
              opacity: useTransform(scanProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0])
            }}
            filter="url(#intensGlow)"
          />

          {/* Horizontal scan lines (subtle) */}
          {[0, 1, 2, 3].map((idx) => (
            <motion.line
              key={`scan-line-${idx}`}
              x1="-8"
              x2={totalSize + 8}
              y1={0}
              y2={0}
              stroke="#fb923c"
              strokeWidth="1"
              opacity="0.4"
              style={{
                y: useTransform(
                  scanProgress,
                  [0, 1],
                  [-20 + idx * 15, totalSize + 20 + idx * 15]
                )
              }}
            />
          ))}
        </g>

        {/* Orbiting particles around the QR code */}
        {[0, 1, 2, 3, 4, 5].map((idx) => {
          const angle = (idx / 6) * Math.PI * 2;
          const radius = totalSize / 2 + 60;
          const centerX = 300;
          const centerY = 300;

          return (
            <motion.circle
              key={`orbit-${idx}`}
              cx={centerX + Math.cos(angle) * radius}
              cy={centerY + Math.sin(angle) * radius}
              r="4"
              fill={idx % 3 === 0 ? "#fb923c" : idx % 3 === 1 ? "#f97316" : "#ec4899"}
              style={{
                opacity: useTransform(scrollYProgress, [0.3, 0.6], [0, 0.6]),
                scale: useTransform(
                  scrollYProgress,
                  [0.3 + idx * 0.05, 0.6 + idx * 0.05],
                  [0, 1]
                )
              }}
              animate={{
                r: [4, 6, 4],
                opacity: [0.4, 0.8, 0.4]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: idx * 0.3
              }}
            />
          );
        })}

        {/* Floating sparkles */}
        {[0, 1, 2, 3].map((idx) => {
          const positions = [
            { x: 120, y: 150 },
            { x: 480, y: 180 },
            { x: 140, y: 450 },
            { x: 460, y: 420 }
          ];
          const pos = positions[idx];

          return (
            <motion.g
              key={`sparkle-${idx}`}
              transform={`translate(${pos.x}, ${pos.y})`}
              style={{
                opacity: useTransform(scrollYProgress, [0.5, 0.8], [0, 0.6]),
                scale: useTransform(scrollYProgress, [0.5, 0.8], [0, 1]),
                rotate: useTransform(scrollYProgress, [0.5, 1], [0, 180])
              }}
            >
              <path
                d="M 0 -10 L 0 10 M -10 0 L 10 0"
                stroke="#fbbf24"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <motion.circle
                cx="0"
                cy="0"
                r="3"
                fill="#fbbf24"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: idx * 0.4
                }}
              />
            </motion.g>
          );
        })}

        {/* Decorative arcs in background */}
        <motion.path
          d="M 50 100 A 200 200 0 0 1 250 -100"
          stroke="rgba(6, 182, 212, 0.15)"
          strokeWidth="40"
          fill="none"
          strokeLinecap="round"
          style={{
            rotate: useTransform(scrollYProgress, [0, 1], [-10, 10]),
            scale: useTransform(scrollYProgress, [0, 1], [1, 1.05])
          }}
        />

        <motion.path
          d="M 550 500 A 180 180 0 0 0 350 680"
          stroke="rgba(59, 130, 246, 0.15)"
          strokeWidth="35"
          fill="none"
          strokeLinecap="round"
          style={{
            rotate: useTransform(scrollYProgress, [0, 1], [10, -10]),
            scale: useTransform(scrollYProgress, [0, 1], [1, 1.08])
          }}
        />

        {/* Prominent rotating rings */}
        <motion.circle
          cx="300"
          cy="300"
          r={totalSize / 2 + 90}
          stroke="rgba(251, 146, 60, 0.5)"
          strokeWidth="3"
          fill="none"
          strokeDasharray="20 15"
          strokeLinecap="round"
          style={{
            rotate: useTransform(scrollYProgress, [0, 1], [0, 360])
          }}
        />

        <motion.circle
          cx="300"
          cy="300"
          r={totalSize / 2 + 110}
          stroke="rgba(236, 72, 153, 0.4)"
          strokeWidth="3"
          fill="none"
          strokeDasharray="15 20"
          strokeLinecap="round"
          style={{
            rotate: useTransform(scrollYProgress, [0, 1], [0, -270])
          }}
        />

        {/* Additional inner ring for depth */}
        <motion.circle
          cx="300"
          cy="300"
          r={totalSize / 2 + 70}
          stroke="rgba(249, 115, 22, 0.35)"
          strokeWidth="2.5"
          fill="none"
          strokeDasharray="12 18"
          strokeLinecap="round"
          style={{
            rotate: useTransform(scrollYProgress, [0, 1], [0, 180])
          }}
        />
      </motion.svg>
    </div>
  );
}
