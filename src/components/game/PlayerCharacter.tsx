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
        isTakingDamage ? 'bg-red-500 animate-pulse' : 'bg-yellow-400'
      )}
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
