
'use client';
import React from 'react';
import { cn } from '@/lib/utils';

interface FissureTrapProps {
  x: number;
  y: number;
  width: number;
  height: number;
  remainingDuration: number;
  maxDuration: number;
}

export function FissureTrapCharacter({ x, y, width, height, remainingDuration, maxDuration }: FissureTrapProps) {
  const opacity = Math.max(0.3, (remainingDuration / maxDuration) * 0.8); // Fades out, minimum 0.3 opacity

  return (
    <div
      className="absolute bg-yellow-700/60 border-2 border-yellow-900/80 rounded-sm shadow-inner"
      style={{
        left: x,
        top: y,
        width: width,
        height: height,
        opacity: opacity,
        // A simple visual representation, can be enhanced with pseudo-elements for jagged edges
        // or a background image if more detail is needed.
        // Example: a subtle repeating noise pattern for texture.
        // backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'10\' height=\'10\' viewBox=\'0 0 10 10\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'10\' height=\'10\' fill=\'rgba(0,0,0,0.03)\'/%3E%3C/svg%3E")',
        transition: 'opacity 0.1s linear',
      }}
      role="region"
      aria-label="Ground Fissure Trap"
    />
  );
}
