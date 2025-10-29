'use client';

import { useState, useEffect } from 'react';

export default function TypewriterText({
  text,
  speed = 50,
  delay = 0,
  className = '',
  onComplete
}) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDelaying, setIsDelaying] = useState(delay > 0);

  useEffect(() => {
    if (isDelaying) {
      const delayTimer = setTimeout(() => {
        setIsDelaying(false);
      }, delay);
      return () => clearTimeout(delayTimer);
    }

    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (currentIndex === text.length && onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, delay, isDelaying, onComplete]);

  return (
    <span className={className}>
      {displayedText}
      {currentIndex < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  );
}
