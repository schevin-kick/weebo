'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

/**
 * Client-side animation wrapper for scroll-triggered animations
 * Wraps server-rendered content with Framer Motion animations
 */
export function ScrollReveal({ children, delay = 0, className = '' }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Simple fade-in animation for hero content
 */
export function FadeIn({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Conditional fade-in based on a trigger state
 */
export function ConditionalFadeIn({ children, show, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: show ? 1 : 0 }}
      transition={{ duration: 1, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Scale animation for stat cards
 */
export function ScaleIn({ children, delay = 0, className = '' }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Slide-in animation from the side
 */
export function SlideIn({ children, delay = 0, direction = 'left', className = '' }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const x = direction === 'left' ? -50 : 50;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.8, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Hover scale effect for interactive elements
 */
export function HoverScale({ children, scale = 1.05, className = '' }) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.95 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Stagger children animations
 */
export function StaggeredList({ children, className = '' }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggeredItem({ children, className = '' }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
