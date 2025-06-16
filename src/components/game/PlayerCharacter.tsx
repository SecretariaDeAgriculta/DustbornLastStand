
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface PlayerCharacterProps {
  x: number;
  y: number;
  width: number;
  height: number;
  isTakingDamage?: boolean;
}

export function PlayerCharacter({ x, y, width, height, isTakingDamage }: PlayerCharacterProps) {
  return (
    <div
      className={cn(
        "absolute rounded-sm shadow-md",
        isTakingDamage ? 'bg-red-600' : 'bg-primary'
      )}
      style={{
        left: x,
        top: y,
        width: width,
        height: height,
        transition: 'background-color 0.1s linear',
      }}
      role="img"
      aria-label="Player character"
    />
  );
}
