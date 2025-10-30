/**
 * Animated Kitsune Logo Loading Component
 * Cute fox animation for loading states
 */

'use client';

export default function KitsuneLogo({ size = 'large' }) {
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

        {/* Kitsune Animated Video */}
        <div className="relative flex items-center justify-center h-full rounded-3xl overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="h-full object-contain rounded-3xl"
          >
            <source src="/kitsune-animated.webm" type="video/webm" />
            <source src="/kitsune-animated.mp4" type="video/mp4" />
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

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .animate-bounce-delay-0 {
          animation: bounce 1s ease-in-out infinite;
        }

        .animate-bounce-delay-1 {
          animation: bounce 1s ease-in-out 0.2s infinite;
        }

        .animate-bounce-delay-2 {
          animation: bounce 1s ease-in-out 0.4s infinite;
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
}
