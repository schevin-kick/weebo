'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';

export default function FeatureShowcase({
  imageSrc,
  title,
  description,
  gradient = 'from-orange-500 to-amber-500',
  delay = 0,
  imagePosition = 'left' // 'left' or 'right'
}) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const imageVariants = {
    hidden: { opacity: 0, x: imagePosition === 'left' ? -50 : 50 },
    visible: { opacity: 1, x: 0 }
  };

  const contentVariants = {
    hidden: { opacity: 0, x: imagePosition === 'left' ? 50 : -50 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{ duration: 0.8, delay }}
      className={`grid md:grid-cols-2 gap-8 lg:gap-12 items-center ${
        imagePosition === 'right' ? 'md:grid-flow-dense' : ''
      }`}
    >
      {/* Image Container */}
      <motion.div
        variants={imageVariants}
        transition={{ duration: 0.8, delay: delay + 0.2 }}
        className={`relative group ${imagePosition === 'right' ? 'md:col-start-2' : ''}`}
      >
        <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-2xl overflow-hidden">
          {/* Gradient overlay on hover */}
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

          {/* Optimized Image with Next.js */}
          <div className="relative rounded-xl overflow-hidden shadow-lg aspect-square">
            <Image
              src={imageSrc}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              quality={85}
              className="object-contain transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>

          {/* Decorative corner element */}
          <div className={`absolute -bottom-2 -right-2 w-24 h-24 bg-gradient-to-br ${gradient} rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity`} />
        </div>
      </motion.div>

      {/* Content Container */}
      <motion.div
        variants={contentVariants}
        transition={{ duration: 0.8, delay: delay + 0.4 }}
        className={imagePosition === 'right' ? 'md:col-start-1 md:row-start-1' : ''}
      >
        <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 lg:p-10 border border-white/20 shadow-2xl">
          {/* Gradient accent bar */}
          <div className={`w-20 h-1.5 bg-gradient-to-r ${gradient} rounded-full mb-6`} />

          <h3 className={`text-3xl lg:text-4xl font-bold text-transparent bg-gradient-to-r ${gradient} bg-clip-text mb-4`}>
            {title}
          </h3>

          <p className="text-slate-200 text-lg leading-relaxed">
            {description}
          </p>

          {/* Decorative blur element */}
          <div className={`absolute -top-4 -left-4 w-32 h-32 bg-gradient-to-br ${gradient} rounded-full blur-3xl opacity-10`} />
        </div>
      </motion.div>
    </motion.div>
  );
}
