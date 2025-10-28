/**
 * Animated Kitsune Logo Loading Component
 * Cute fox animation for loading states
 */

'use client';

export default function KitsuneLogo({ size = 'large' }) {
  const sizeClasses = {
    small: 'w-12 h-12 text-4xl',
    medium: 'w-20 h-20 text-6xl',
    large: 'w-32 h-32 text-8xl',
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Animated Fox Container */}
      <div className={`${sizeClasses[size]} relative animate-bounce-slow`}>
        {/* Glowing Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full blur-xl opacity-30 animate-pulse"></div>

        {/* Fox Emoji */}
        <div className="relative flex items-center justify-center w-full h-full">
          <span className="animate-wiggle">🦊</span>
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

        @keyframes wiggle {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-10deg);
          }
          75% {
            transform: rotate(10deg);
          }
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .animate-wiggle {
          animation: wiggle 1s ease-in-out infinite;
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
