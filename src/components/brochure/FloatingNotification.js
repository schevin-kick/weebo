'use client';

import { motion } from 'framer-motion';

export default function FloatingNotification({
  icon: Icon,
  title,
  message,
  position = 'top-left',
  gradient = 'from-orange-500 to-amber-500',
  delay = 0
}) {
  // Position classes based on prop
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'middle-left': 'top-1/2 -translate-y-1/2 left-4',
    'middle-right': 'top-1/2 -translate-y-1/2 right-4'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
      transition={{ duration: 0.5, delay }}
      className={`absolute ${positionClasses[position]} z-10`}
    >
      <motion.div
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative bg-white/95 backdrop-blur-lg rounded-xl p-4 shadow-2xl border border-white/20 max-w-xs"
      >
        {/* Gradient accent bar */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} rounded-t-xl`} />

        <div className="flex items-start gap-3 mt-1">
          {/* Icon with gradient background */}
          <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
            <Icon className="w-5 h-5 text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 mb-1">
              {title}
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Glow effect */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 rounded-xl pointer-events-none`} />
      </motion.div>
    </motion.div>
  );
}
