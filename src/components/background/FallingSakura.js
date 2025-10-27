'use client';

import { useState, useEffect } from 'react';
import './FallingSakura.css';

export default function FallingSakura() {
  // Generate random leaves with different properties
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    // Generate leaves on client-side only to avoid hydration mismatch
    setLeaves(
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 20}s`,
        animationDuration: `${15 + Math.random() * 10}s`,
        size: 0.5 + Math.random() * 0.8,
      }))
    );
  }, []);

  return (
    <div className="sakura-container">
      {leaves.map((leaf) => (
        <div
          key={leaf.id}
          className="sakura-leaf"
          style={{
            left: leaf.left,
            animationDelay: leaf.animationDelay,
            animationDuration: leaf.animationDuration,
            transform: `scale(${leaf.size})`,
          }}
        />
      ))}
    </div>
  );
}
