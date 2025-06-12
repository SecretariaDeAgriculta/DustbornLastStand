
'use client';

import React from 'react';

interface EnemyCharacterProps {
  x: number;
  y: number;
  size: number;
}

export function EnemyCharacter({ x, y, size }: EnemyCharacterProps) {
  return (
    <div
      className="absolute bg-destructive rounded-sm shadow"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
      }}
      role="img"
      aria-label="Enemy character"
    />
  );
}
