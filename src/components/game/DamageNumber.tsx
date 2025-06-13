
'use client';

import React from 'react';

interface DamageNumberProps {
  x: number;
  y: number; 
  amount: number;
  opacity: number; 
  isCritical?: boolean;
}

export function DamageNumber({ x, y, amount, opacity, isCritical }: DamageNumberProps) {
  if (opacity <= 0) return null;

  const color = isCritical ? '#FFD700' : '#FFF7E0'; // Gold for critical, light warm off-white for normal
  const fontSize = isCritical ? '1.4rem' : '1.1rem';
  const fontWeight = isCritical ? 'bold' : 'bold'; // Both bold, critical just larger

  return (
    <div
      className="absolute pointer-events-none select-none"
      style={{
        left: x,
        top: y,
        transform: 'translateX(-50%)', 
        opacity: opacity,
        fontSize: fontSize,
        fontWeight: fontWeight,
        color: color, 
        textShadow: isCritical 
          ? '1px 1px 0px rgba(0,0,0,0.7), -1px -1px 0px rgba(0,0,0,0.7), 1px -1px 0px rgba(0,0,0,0.7), -1px 1px 0px rgba(0,0,0,0.7), 2px 2px 3px #c4302b, -2px -2px 3px #c4302b' // Stronger shadow for critical
          : '1px 1px 0px rgba(0,0,0,0.7), -1px -1px 0px rgba(0,0,0,0.7), 1px -1px 0px rgba(0,0,0,0.7), -1px 1px 0px rgba(0,0,0,0.7), 2px 2px 3px rgba(0,0,0,0.5)',
        zIndex: 100, 
        transition: 'opacity 50ms linear, transform 50ms linear', 
      }}
    >
      {amount}{isCritical ? '!' : ''}
    </div>
  );
}
