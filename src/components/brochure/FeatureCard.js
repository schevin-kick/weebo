'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  gradient = 'from-orange-500 to-amber-500',
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
      className="group relative"
    >
      {/* Glass morphism card */}
      <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl overflow-hidden h-full">
        {/* Gradient overlay on hover */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

        {/* Icon container with gradient */}
        <motion.div
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.6 }}
          className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${gradient} mb-6 shadow-lg`}
        >
          <Icon className="w-8 h-8 text-white" />
        </motion.div>

        {/* Content */}
        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-amber-200 transition-all">
          {title}
        </h3>
        <p className="text-slate-300 leading-relaxed">
          {description}
        </p>

        {/* Decorative corner element */}
        <div className={`absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br ${gradient} rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity`} />
      </div>
    </motion.div>
  );
}
