
'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { characterSprites } from '@/data/assets';

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
        "absolute rounded-sm shadow-md overflow-hidden",
        isTakingDamage ? 'ring-2 ring-inset ring-red-500 animate-pulse' : ''
      )}
      style={{
        left: x,
        top: y,
        width: width,
        height: height,
      }}
      role="img"
      aria-label="Player character"
    >
      <Image
        src={characterSprites.adultSilas}
        alt="Silas Kane, o Pistoleiro"
        width={width}
        height={height}
        className="object-cover"
        data-ai-hint="cowboy hero protagonist"
        priority
      />
    </div>
  );
}
