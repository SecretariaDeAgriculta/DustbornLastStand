
'use client';

import React from 'react';

interface PlayerCharacterProps {
  x: number;
  y: number;
  size: number;
}

export function PlayerCharacter({ x, y, size }: PlayerCharacterProps) {
  return (
    <div
      className="absolute bg-primary rounded shadow-md"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
      }}
      role="img"
      aria-label="Player character"
    />
  );
}
