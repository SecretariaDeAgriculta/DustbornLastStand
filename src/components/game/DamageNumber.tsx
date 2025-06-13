
'use client';

import React from 'react';

interface DamageNumberProps {
  x: number;
  y: number; 
  amount: number;
  opacity: number; 
}

export function DamageNumber({ x, y, amount, opacity }: DamageNumberProps) {
  if (opacity <= 0) return null;

  return (
    <div
      className="absolute text-white font-bold pointer-events-none select-none"
      style={{
        left: x,
        top: y,
        transform: 'translateX(-50%)', 
        opacity: opacity,
        fontSize: '1.1rem',
        fontWeight: 'bold',
        color: '#FFF7E0', 
        textShadow: '1px 1px 0px rgba(0,0,0,0.7), -1px -1px 0px rgba(0,0,0,0.7), 1px -1px 0px rgba(0,0,0,0.7), -1px 1px 0px rgba(0,0,0,0.7), 2px 2px 3px rgba(0,0,0,0.5)',
        zIndex: 100, 
        transition: 'opacity 50ms linear', 
      }}
    >
      {amount}
    </div>
  );
}
