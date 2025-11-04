'use client';

import { motion } from 'framer-motion';

export default function LineIntegrationSvg() {
  return (
    <div className="w-full h-full relative bg-gradient-to-br from-green-50/30 via-white to-emerald-50/20">
      <motion.svg
        viewBox="0 0 1000 600"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <defs>
          {/* LINE Green Gradient */}
          <linearGradient id="lineGreen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00C300" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>

          <linearGradient id="dashboardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>

          <linearGradient id="customerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#f472b6" />
          </linearGradient>

          {/* Glow effect */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background Shapes */}
        <motion.circle
          cx="500"
          cy="300"
          r="0"
          fill="url(#lineGreen)"
          opacity="0.1"
          initial={{ r: 0 }}
          whileInView={{ r: 200 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: 0.3 }}
        />

        {/* Dashboard Panel (Left) */}
        <motion.g
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Dashboard Container */}
          <rect
            x="60"
            y="180"
            width="180"
            height="240"
            rx="16"
            fill="url(#dashboardGradient)"
            opacity="0.15"
            stroke="url(#dashboardGradient)"
            strokeWidth="2"
          />

          {/* Dashboard Header */}
          <rect
            x="60"
            y="180"
            width="180"
            height="50"
            rx="16"
            fill="url(#dashboardGradient)"
            opacity="0.3"
          />

          {/* Calendar Grid Icon */}
          <g transform="translate(90, 250)">
            {[0, 1, 2].map((row) =>
              [0, 1, 2].map((col) => (
                <motion.rect
                  key={`${row}-${col}`}
                  x={col * 40}
                  y={row * 40}
                  width="32"
                  height="32"
                  rx="6"
                  fill="#6366f1"
                  opacity="0.2"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.3,
                    delay: 0.3 + (row * 3 + col) * 0.05
                  }}
                />
              ))
            )}

            {/* Booking Highlight */}
            <motion.rect
              x="40"
              y="40"
              width="32"
              height="32"
              rx="6"
              fill="#22c55e"
              opacity="0.8"
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 0.8 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.8 }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1
              }}
            />

            {/* Checkmark in booking */}
            <motion.path
              d="M 48 56 L 54 62 L 66 48"
              stroke="white"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 1 }}
            />
          </g>

          {/* Dashboard Text Lines */}
          <rect x="80" y="195" width="60" height="8" rx="4" fill="#6366f1" opacity="0.3" />
          <rect x="145" y="195" width="80" height="8" rx="4" fill="#6366f1" opacity="0.2" />
        </motion.g>

        {/* Connection Path 1: Dashboard to LINE */}
        <motion.path
          d="M 240 280 Q 350 250, 420 280"
          stroke="url(#lineGreen)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="8 4"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.6 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
        />

        {/* Message Bubble 1: Flowing from Dashboard to LINE */}
        <motion.g
          initial={{ x: 240, y: 280, opacity: 0 }}
          animate={{
            x: [240, 300, 370, 420],
            y: [280, 268, 268, 280],
            opacity: [0, 1, 1, 0]
          }}
          transition={{
            duration: 3,
            delay: 1.2,
            repeat: Infinity,
            repeatDelay: 2,
            ease: "easeInOut"
          }}
        >
          <rect x="-20" y="-12" width="40" height="24" rx="12" fill="#22c55e" opacity="0.9" filter="url(#glow)" />
          <path d="M -12 10 L -16 16 L -8 12" fill="#22c55e" />
        </motion.g>

        {/* LINE Hub (Center) */}
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {/* Outer Ring - Pulsing */}
          <motion.circle
            cx="500"
            cy="300"
            r="70"
            stroke="#22c55e"
            strokeWidth="3"
            fill="none"
            opacity="0.3"
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Main Circle */}
          <circle
            cx="500"
            cy="300"
            r="55"
            fill="url(#lineGreen)"
            filter="url(#glow)"
          />

          {/* LINE Logo - Speech Bubble */}
          <rect
            x="475"
            y="285"
            width="50"
            height="30"
            rx="8"
            fill="white"
            opacity="0.95"
          />
          <path
            d="M 490 315 L 485 322 L 495 315"
            fill="white"
            opacity="0.95"
          />

          {/* Message dots inside bubble */}
          <circle cx="487" cy="298" r="3" fill="#22c55e" />
          <circle cx="500" cy="298" r="3" fill="#22c55e" />
          <circle cx="513" cy="298" r="3" fill="#22c55e" />
        </motion.g>

        {/* Notification Waves from LINE */}
        {[85, 110, 135].map((radius, idx) => (
          <motion.circle
            key={`wave-${idx}`}
            cx="500"
            cy="300"
            r={radius}
            stroke="#22c55e"
            strokeWidth="2"
            fill="none"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: [0.8, 1.3, 0.8],
              opacity: [0, 0.4, 0]
            }}
            transition={{
              duration: 3,
              delay: 1.5 + idx * 0.4,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        ))}

        {/* Connection Path 2: LINE to Customers */}
        <motion.path
          d="M 555 280 Q 650 250, 720 280"
          stroke="url(#customerGradient)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="8 4"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.6 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.7 }}
        />

        {/* Connection Path 3: LINE to Customer (lower) */}
        <motion.path
          d="M 555 320 Q 650 350, 720 320"
          stroke="url(#customerGradient)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="8 4"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.6 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.8 }}
        />

        {/* Message Bubbles: Flowing to Customers */}
        <motion.g
          initial={{ x: 555, y: 280, opacity: 0 }}
          animate={{
            x: [555, 615, 675, 720],
            y: [280, 268, 268, 280],
            opacity: [0, 1, 1, 0]
          }}
          transition={{
            duration: 3,
            delay: 2,
            repeat: Infinity,
            repeatDelay: 2,
            ease: "easeInOut"
          }}
        >
          <rect x="-20" y="-12" width="40" height="24" rx="12" fill="#ec4899" opacity="0.9" filter="url(#glow)" />
          <path d="M -12 10 L -16 16 L -8 12" fill="#ec4899" />
          {/* Confirmation icon */}
          <path d="M -8 -3 L -4 1 L 4 -7" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
        </motion.g>

        {/* Customer Nodes (Right) */}
        {[
          { cx: 780, cy: 240, delay: 0.9 },
          { cx: 820, cy: 300, delay: 1.0 },
          { cx: 780, cy: 360, delay: 1.1 }
        ].map((customer, idx) => (
          <motion.g
            key={`customer-${idx}`}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: customer.delay }}
          >
            {/* Device outline */}
            <rect
              x={customer.cx - 20}
              y={customer.cy - 30}
              width="40"
              height="60"
              rx="8"
              fill="url(#customerGradient)"
              opacity="0.2"
              stroke="url(#customerGradient)"
              strokeWidth="2"
            />

            {/* Screen */}
            <rect
              x={customer.cx - 16}
              y={customer.cy - 24}
              width="32"
              height="48"
              rx="4"
              fill="#ec4899"
              opacity="0.1"
            />

            {/* Notification dot */}
            <motion.circle
              cx={customer.cx + 12}
              cy={customer.cy - 22}
              r="4"
              fill="#22c55e"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{
                duration: 1.5,
                delay: customer.delay + 1,
                repeat: Infinity,
                repeatDelay: 3
              }}
            />

            {/* Checkmark on device */}
            <motion.path
              d={`M ${customer.cx - 8} ${customer.cy} L ${customer.cx - 3} ${customer.cy + 5} L ${customer.cx + 8} ${customer.cy - 6}`}
              stroke="#22c55e"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.8 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: customer.delay + 0.3 }}
            />
          </motion.g>
        ))}

        {/* Floating Icons */}
        {/* Calendar Icon */}
        <motion.g
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: [0.3, 0.5, 0.3],
            y: [10, -5, 10]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <rect x="300" y="140" width="40" height="40" rx="6" fill="#6366f1" opacity="0.2" />
          <rect x="300" y="140" width="40" height="12" rx="6" fill="#6366f1" opacity="0.3" />
        </motion.g>

        {/* Bell Icon (Reminder) */}
        <motion.g
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: [0.3, 0.5, 0.3],
            y: [10, -5, 10]
          }}
          transition={{
            duration: 3.5,
            delay: 0.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <path
            d="M 670 420 Q 670 405, 685 405 Q 700 405, 700 420 L 700 440 Q 700 450, 690 455 L 680 455 Q 670 450, 670 440 Z"
            fill="#f97316"
            opacity="0.3"
          />
          <circle cx="685" cy="460" r="4" fill="#f97316" opacity="0.4" />
        </motion.g>

        {/* Sparkles */}
        {[
          { x: 450, y: 180, delay: 0 },
          { x: 550, y: 180, delay: 0.5 },
          { x: 620, y: 420, delay: 1 }
        ].map((sparkle, idx) => (
          <motion.g
            key={`sparkle-${idx}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 2,
              delay: sparkle.delay + 1.5,
              repeat: Infinity,
              repeatDelay: 4
            }}
          >
            <path
              d={`M ${sparkle.x} ${sparkle.y - 6} L ${sparkle.x} ${sparkle.y + 6} M ${sparkle.x - 6} ${sparkle.y} L ${sparkle.x + 6} ${sparkle.y}`}
              stroke="#fbbf24"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </motion.g>
        ))}

      </motion.svg>
    </div>
  );
}
