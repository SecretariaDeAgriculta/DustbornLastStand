
'use client';

import React from 'react';

interface ProjectileProps {
  x: number;
  y: number;
  size: number;
}

export function Projectile({ x, y, size }: ProjectileProps) {
  return (
    <div
      className="absolute bg-yellow-300 rounded-full shadow-sm"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        // Simple bullet appearance
        border: '1px solid #A0522D', // Brownish border
      }}
      role="img"
      aria-label="Projectile"
    />
  );
}
