'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function LightFeatureCard({
  icon: Icon,
  title,
  description,
  gradient = 'from-orange-400 to-pink-400',
  delay = 0
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
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -10, scale: 1.02 }}
      className="group relative h-full"
    >
      {/* White card with border */}
      <div className="relative bg-white rounded-3xl p-8 border-2 border-pink-200 shadow-xl overflow-hidden h-full hover-lift">
        {/* Gradient overlay on hover */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

        {/* Icon container with gradient */}
        <motion.div
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.6 }}
          className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} mb-6 shadow-lg`}
        >
          <Icon className="w-8 h-8 text-white" />
        </motion.div>

        {/* Content */}
        <h3 className="text-2xl font-black text-gray-800 mb-3 relative">
          {title}
        </h3>
        <p className="text-gray-600 leading-relaxed font-medium relative">
          {description}
        </p>

        {/* Decorative corner element */}
        <div className={`absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br ${gradient} rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity`} />
      </div>
    </motion.div>
  );
}
