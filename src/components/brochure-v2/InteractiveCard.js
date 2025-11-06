'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';

export default function InteractiveCard({
  children,
  className = '',
  hoverScale = 1.02,
  tiltIntensity = 10
}) {
  const ref = useRef(null);
  const isMobile = useIsMobile();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [`${tiltIntensity}deg`, `-${tiltIntensity}deg`]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [`-${tiltIntensity}deg`, `${tiltIntensity}deg`]);

  const handleMouseMove = (e) => {
    if (!ref.current || isMobile) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Disable tilt effect on mobile, keep hover scale
  const style = isMobile
    ? {}
    : {
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={style}
      whileHover={{ scale: hoverScale }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`${className}`}
    >
      {children}
    </motion.div>
  );
}
