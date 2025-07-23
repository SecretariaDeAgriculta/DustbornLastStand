
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

const PlayerCharacterComponent = ({ x, y, width, height, isTakingDamage }: PlayerCharacterProps) => {
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
};

const areEqual = (prevProps: PlayerCharacterProps, nextProps: PlayerCharacterProps) => {
    return (
        prevProps.x === nextProps.x &&
        prevProps.y === nextProps.y &&
        prevProps.isTakingDamage === nextProps.isTakingDamage
    );
};

export const PlayerCharacter = React.memo(PlayerCharacterComponent, areEqual);
