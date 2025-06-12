
'use client';

import React from 'react';

interface PlayerCharacterProps {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function PlayerCharacter({ x, y, width, height }: PlayerCharacterProps) {
  return (
    <div
      className="absolute bg-primary rounded-sm shadow-md" // Player remains a square for now
      style={{
        left: x,
        top: y,
        width: width,
        height: height,
      }}
      role="img"
      aria-label="Player character"
    />
  );
}
