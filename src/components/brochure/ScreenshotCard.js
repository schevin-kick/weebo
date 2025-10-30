'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Expand } from 'lucide-react';

export default function ScreenshotCard({
  src,
  alt,
  title,
  description,
  delay = 0,
  reverse = false,
  onClick
}) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, delay }}
      className={`grid md:grid-cols-2 gap-12 items-center ${reverse ? 'md:grid-flow-dense' : ''}`}
    >
      {/* Screenshot */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
        className={`relative ${reverse ? 'md:col-start-2' : ''}`}
      >
        <div
          className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 cursor-pointer group"
          onClick={onClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onClick();
            }
          }}
          aria-label={`Click to enlarge ${alt}`}
        >
          <img
            src={src}
            alt={alt}
            className="w-full h-auto"
            loading="lazy"
          />
          {/* Overlay gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Expand icon on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white/20 backdrop-blur-lg rounded-full p-4 border border-white/30">
              <Expand className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
        {/* Glow effect */}
        <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/10 via-pink-500/10 to-purple-500/10 blur-3xl -z-10" />
      </motion.div>

      {/* Content */}
      <div className={reverse ? 'md:col-start-1 md:row-start-1' : ''}>
        <motion.h3
          initial={{ opacity: 0, x: reverse ? 20 : -20 }}
          animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: reverse ? 20 : -20 }}
          transition={{ duration: 0.6, delay: delay + 0.2 }}
          className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent"
        >
          {title}
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, x: reverse ? 20 : -20 }}
          animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: reverse ? 20 : -20 }}
          transition={{ duration: 0.6, delay: delay + 0.3 }}
          className="text-lg text-slate-300 leading-relaxed"
        >
          {description}
        </motion.p>
      </div>
    </motion.div>
  );
}
