/**
 * Animated Weebo Logo Loading Component
 * Robot animation for loading states
 */

'use client';

import './weebo-logo.css';

export default function WeeboLogo({ size = 'large' }) {
  const sizeClasses = {
    small: 'w-24 h-24',
    medium: 'w-40 h-40',
    large: 'w-64 h-64',
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Animated Fox Container */}
      <div className={`${sizeClasses[size]} relative animate-bounce-slow`}>
        {/* Glowing Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full blur-xl opacity-30 animate-pulse"></div>

        {/* Waving Robot Animated Video */}
        <div className="relative flex items-center justify-center h-full rounded-3xl overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="h-full object-contain rounded-3xl"
          >
            <source src="/waving-robot.webm" type="video/webm" />
            <source src="/waving-robot.mp4" type="video/mp4" />
          </video>
        </div>
      </div>

      {/* Loading Dots */}
      <div className="flex gap-2 mt-6">
        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce-delay-0"></div>
        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce-delay-1"></div>
        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce-delay-2"></div>
      </div>

      {/* Loading Text */}
      <p className="mt-4 text-slate-600 font-medium animate-pulse">
        Loading...
      </p>
    </div>
  );
}
