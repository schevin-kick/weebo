import { useState, useEffect } from 'react';

/**
 * Hook to detect if the user is on a mobile device
 * @param {number} breakpoint - Width in pixels to consider as mobile (default: 768)
 * @returns {boolean} - True if viewport width is less than breakpoint
 */
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Initial check
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Check on mount
    checkMobile();

    // Add resize listener
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return isMobile;
}
