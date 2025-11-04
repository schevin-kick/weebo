'use client';

import { motion } from 'framer-motion';

export default function HeroSvgAnimation() {
  // Message flow paths - representing chat messages flowing through the network
  const paths = [
    // Path 1: Customer to Business (left to right, gentle curve)
    "M 150 250 Q 400 200, 650 250 Q 900 300, 1050 250",
    // Path 2: Business to Customer (right to left, lower)
    "M 1050 550 Q 800 500, 550 550 Q 300 600, 150 550",
    // Path 3: Network broadcast (center radiating)
    "M 600 400 Q 500 300, 400 400 Q 300 500, 200 400",
    // Path 4: Another customer flow
    "M 200 350 Q 400 380, 600 350 Q 800 320, 1000 350",
    // Path 5: Confirmation flow
    "M 950 450 Q 750 420, 550 450 Q 350 480, 250 450"
  ];

  // Chat bubble messages - styled as message particles
  const messageCount = 12;
  const messages = Array.from({ length: messageCount }, (_, i) => ({
    id: i,
    pathIndex: i % paths.length,
    delay: i * 0.5,
    duration: 5 + (i % 2) * 2,
    type: i % 3 === 0 ? 'confirmation' : i % 3 === 1 ? 'reminder' : 'booking'
  }));

  // Connection nodes - representing businesses and customers
  const nodes = [
    { cx: 200, cy: 250, type: 'customer', label: 'Customer' },
    { cx: 600, cy: 400, type: 'line-hub', label: 'LINE' },
    { cx: 1000, cy: 350, type: 'business', label: 'Business' },
    { cx: 250, cy: 550, type: 'customer', label: 'Customer' },
    { cx: 950, cy: 500, type: 'business', label: 'Business' }
  ];

  return (
    <div className="w-full h-full relative overflow-visible">
      {/* Subtle background glow - doesn't feel contained */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/20 via-transparent to-emerald-50/10 pointer-events-none" />

      <svg
        viewBox="0 0 1200 800"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid slice"
        style={{ filter: 'drop-shadow(0 0 40px rgba(34, 197, 94, 0.1))' }}
      >
        <defs>
          {/* LINE Green Gradients - more vibrant */}
          <linearGradient id="lineGreen" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00C300" stopOpacity="0.75" />
            <stop offset="50%" stopColor="#22c55e" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.75" />
          </linearGradient>

          <linearGradient id="lineGreenReverse" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#22c55e" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#00C300" stopOpacity="0.7" />
          </linearGradient>

          {/* Confirmation message gradient (green) - vibrant */}
          <linearGradient id="confirmationGradient">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.9" />
          </linearGradient>

          {/* Reminder message gradient (orange) - vibrant */}
          <linearGradient id="reminderGradient">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.9" />
          </linearGradient>

          {/* Booking message gradient (pink) - vibrant */}
          <linearGradient id="bookingGradient">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#f472b6" stopOpacity="0.9" />
          </linearGradient>

          {/* LINE Hub glow - more intense */}
          <radialGradient id="lineHubGlow">
            <stop offset="0%" stopColor="#00C300" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#22c55e" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </radialGradient>

          {/* Glow filters - enhanced */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <filter id="strongGlow">
            <feGaussianBlur stdDeviation="10" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background pulsing glow from LINE hub - more vibrant */}
        <motion.circle
          cx="600"
          cy="400"
          r="0"
          fill="url(#lineHubGlow)"
          initial={{ r: 0, opacity: 0 }}
          animate={{
            r: [0, 400, 0],
            opacity: [0, 0.45, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Message flow paths with animated drawing - more vibrant */}
        {paths.map((d, index) => (
          <g key={`path-${index}`}>
            {/* Static background path - more visible */}
            <path
              d={d}
              stroke={index % 2 === 0 ? "url(#lineGreen)" : "url(#lineGreenReverse)"}
              strokeWidth="3"
              fill="none"
              opacity="0.25"
              strokeDasharray="8 4"
            />

            {/* Animated flowing path - more prominent */}
            <motion.path
              d={d}
              stroke={index % 2 === 0 ? "url(#lineGreen)" : "url(#lineGreenReverse)"}
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              filter="url(#glow)"
              initial={{
                pathLength: 0,
                opacity: 0
              }}
              animate={{
                pathLength: [0, 1, 0],
                opacity: [0, 0.9, 0]
              }}
              transition={{
                duration: 3.5 + index * 0.3,
                repeat: Infinity,
                delay: index * 0.4,
                ease: "easeInOut"
              }}
            />
          </g>
        ))}

        {/* Chat bubble messages flowing along paths */}
        {messages.map((msg) => {
          const gradientId = msg.type === 'confirmation' ? 'confirmationGradient' :
                            msg.type === 'reminder' ? 'reminderGradient' : 'bookingGradient';

          // Calculate positions along the path for each message
          const pathPositions = [
            // Path 1 positions (left to right)
            [
              { x: 150, y: 250 },
              { x: 300, y: 210 },
              { x: 500, y: 220 },
              { x: 700, y: 260 },
              { x: 900, y: 280 },
              { x: 1050, y: 250 }
            ],
            // Path 2 positions (right to left)
            [
              { x: 1050, y: 550 },
              { x: 900, y: 520 },
              { x: 700, y: 530 },
              { x: 500, y: 570 },
              { x: 300, y: 590 },
              { x: 150, y: 550 }
            ],
            // Path 3 positions (center radiating)
            [
              { x: 600, y: 400 },
              { x: 550, y: 350 },
              { x: 470, y: 370 },
              { x: 380, y: 420 },
              { x: 300, y: 470 },
              { x: 200, y: 400 }
            ],
            // Path 4 positions
            [
              { x: 200, y: 350 },
              { x: 350, y: 370 },
              { x: 500, y: 360 },
              { x: 700, y: 340 },
              { x: 850, y: 345 },
              { x: 1000, y: 350 }
            ],
            // Path 5 positions
            [
              { x: 950, y: 450 },
              { x: 800, y: 430 },
              { x: 650, y: 440 },
              { x: 500, y: 460 },
              { x: 350, y: 475 },
              { x: 250, y: 450 }
            ]
          ];

          const positions = pathPositions[msg.pathIndex];

          return (
            <g key={msg.id}>
              {/* Chat bubble shape */}
              <motion.g
                initial={{
                  x: positions[0].x,
                  y: positions[0].y,
                  scale: 0,
                  opacity: 0
                }}
                animate={{
                  x: positions.map(p => p.x),
                  y: positions.map(p => p.y),
                  scale: [0, 1, 1, 1, 1, 0],
                  opacity: [0, 1, 1, 1, 1, 0]
                }}
                transition={{
                  duration: msg.duration,
                  delay: msg.delay,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                {/* Bubble body - rounded rectangle */}
                <rect
                  x="-15"
                  y="-10"
                  width="30"
                  height="20"
                  rx="10"
                  ry="10"
                  fill={`url(#${gradientId})`}
                  filter="url(#glow)"
                />

                {/* Small tail for chat bubble */}
                <path
                  d="M -8 8 L -12 14 L -6 10"
                  fill={`url(#${gradientId})`}
                />

                {/* Checkmark for confirmation messages */}
                {msg.type === 'confirmation' && (
                  <g transform="translate(-5, -5)">
                    <path
                      d="M 0 5 L 3 8 L 10 0"
                      stroke="white"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                )}
              </motion.g>
            </g>
          );
        })}

        {/* Connection nodes - businesses and customers */}
        {nodes.map((node, idx) => {
          const isLineHub = node.type === 'line-hub';
          const isCustomer = node.type === 'customer';
          const nodeColor = isLineHub ? '#00C300' : isCustomer ? '#ec4899' : '#f97316';
          const nodeSize = isLineHub ? 20 : 12;

          return (
            <g key={`node-${idx}`}>
              {/* Pulsing outer ring - more vibrant */}
              <motion.circle
                cx={node.cx}
                cy={node.cy}
                r={nodeSize + 8}
                stroke={nodeColor}
                strokeWidth="3"
                fill="none"
                opacity="0"
                animate={{
                  scale: [1, 1.8, 1],
                  opacity: [0.8, 0, 0.8]
                }}
                transition={{
                  duration: 1.8 + idx * 0.2,
                  delay: idx * 0.3,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              />

              {/* Main node circle - more dynamic */}
              <motion.circle
                cx={node.cx}
                cy={node.cy}
                r={nodeSize}
                fill={nodeColor}
                filter={isLineHub ? "url(#strongGlow)" : "url(#glow)"}
                animate={{
                  scale: isLineHub ? [1, 1.15, 1] : [1, 1.25, 1],
                  opacity: [0.9, 1, 0.9]
                }}
                transition={{
                  duration: isLineHub ? 1.8 : 2.2,
                  delay: idx * 0.15,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Icon inside node for LINE hub */}
              {isLineHub && (
                <g>
                  {/* Simplified LINE logo - speech bubble */}
                  <motion.rect
                    x={node.cx - 8}
                    y={node.cy - 6}
                    width="16"
                    height="12"
                    rx="3"
                    fill="white"
                    animate={{
                      opacity: [0.9, 1, 0.9]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <path
                    d={`M ${node.cx} ${node.cy + 6} L ${node.cx - 3} ${node.cy + 10} L ${node.cx + 1} ${node.cy + 6}`}
                    fill="white"
                  />
                </g>
              )}
            </g>
          );
        })}

        {/* Floating booking icons - more vibrant */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 0.9, 0.5], y: [0, -18, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          filter="url(#glow)"
        >
          {/* Calendar icon */}
          <rect x="180" y="120" width="35" height="35" rx="4" fill="#22c55e" opacity="0.4" />
          <rect x="180" y="120" width="35" height="10" rx="4" fill="#22c55e" opacity="0.7" />
          <rect x="188" y="138" width="6" height="6" rx="1" fill="#22c55e" opacity="0.9" />
          <rect x="198" y="138" width="6" height="6" rx="1" fill="#22c55e" opacity="0.9" />
        </motion.g>

        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 0.9, 0.5], y: [0, 15, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 3.2, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
          filter="url(#glow)"
        >
          {/* Clock icon */}
          <circle cx="1020" cy="680" r="18" stroke="#f97316" strokeWidth="3" fill="none" opacity="0.4" />
          <path d="M 1020 665 L 1020 680 L 1030 680" stroke="#f97316" strokeWidth="3" fill="none" opacity="0.6" />
        </motion.g>

        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 0.9, 0.5], y: [0, -12, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 3.6, delay: 1, repeat: Infinity, ease: "easeInOut" }}
          filter="url(#glow)"
        >
          {/* Checkmark badge */}
          <circle cx="950" cy="150" r="16" fill="#22c55e" opacity="0.5" />
          <path d="M 942 150 L 948 156 L 958 144" stroke="white" strokeWidth="3" fill="none" opacity="0.85" />
        </motion.g>

        {/* Notification waves emanating from LINE hub - more vibrant */}
        {[80, 120, 160].map((radius, idx) => (
          <motion.circle
            key={`wave-${idx}`}
            cx="600"
            cy="400"
            r={radius}
            stroke="#22c55e"
            strokeWidth="3"
            fill="none"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              scale: [0.5, 1.8, 0.5],
              opacity: [0, 0.7, 0]
            }}
            transition={{
              duration: 3.5 + idx * 0.4,
              delay: idx * 0.3,
              repeat: Infinity,
              ease: "easeOut"
            }}
            filter="url(#glow)"
          />
        ))}

        {/* Message delivery indicators (double checkmarks) */}
        {[
          { x: 450, y: 280, delay: 0 },
          { x: 750, y: 520, delay: 0.8 },
          { x: 380, y: 450, delay: 1.6 }
        ].map((check, idx) => (
          <motion.g
            key={`check-${idx}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0, 1.2, 1, 0]
            }}
            transition={{
              duration: 3,
              delay: check.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Double checkmark (read receipt) */}
            <path
              d={`M ${check.x} ${check.y} L ${check.x + 4} ${check.y + 4} L ${check.x + 12} ${check.y - 4}`}
              stroke="#22c55e"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
            />
            <path
              d={`M ${check.x + 5} ${check.y} L ${check.x + 9} ${check.y + 4} L ${check.x + 17} ${check.y - 4}`}
              stroke="#22c55e"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
            />
          </motion.g>
        ))}

        {/* Abstract background shapes for depth - larger and more spread out */}
        <motion.ellipse
          cx="300"
          cy="650"
          rx="120"
          ry="60"
          fill="#22c55e"
          opacity="0.04"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.03, 0.06, 0.03]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <motion.ellipse
          cx="900"
          cy="180"
          rx="100"
          ry="80"
          fill="#f97316"
          opacity="0.04"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.03, 0.06, 0.03]
          }}
          transition={{
            duration: 5.5,
            delay: 0.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <motion.ellipse
          cx="1100"
          cy="500"
          rx="90"
          ry="70"
          fill="#ec4899"
          opacity="0.03"
          animate={{
            scale: [1, 1.18, 1],
            opacity: [0.02, 0.05, 0.02]
          }}
          transition={{
            duration: 5.8,
            delay: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <motion.ellipse
          cx="100"
          cy="400"
          rx="70"
          ry="60"
          fill="#10b981"
          opacity="0.03"
          animate={{
            scale: [1, 1.12, 1],
            opacity: [0.02, 0.05, 0.02]
          }}
          transition={{
            duration: 6.2,
            delay: 0.3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </svg>
    </div>
  );
}
