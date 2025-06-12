
'use client';

import React from 'react';

interface XPOrbProps {
  x: number;
  y: number;
  size: number;
}

export function XPOrb({ x, y, size }: XPOrbProps) {
  return (
    <div
      className="absolute bg-yellow-400 rounded-full shadow animate-pulse"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        opacity: 0.8,
      }}
      role="img"
      aria-label="XP Orb"
    />
  );
}

    