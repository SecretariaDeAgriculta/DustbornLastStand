
'use client';
import React from 'react';
import { cn } from '@/lib/utils';
import { FISSURE_TRAP_DURATION } from '@/game/constants/enemies';

interface FissureTrapProps {
  x: number;
  y: number;
  width: number;
  height: number;
  remainingDuration: number;
  maxDuration: number;
}

const FissureTrapCharacterComponent = ({ x, y, width, height, remainingDuration, maxDuration = FISSURE_TRAP_DURATION }: FissureTrapProps) => {
  const opacity = Math.max(0.3, (remainingDuration / maxDuration) * 0.8); // Fades out, minimum 0.3 opacity

  return (
    <div
      className="absolute bg-yellow-700/60 border-2 border-yellow-900/80 rounded-sm shadow-inner"
      style={{
        left: x,
        top: y,
        width: width,
        height: height,
        opacity: opacity,
        transition: 'opacity 0.1s linear',
      }}
      role="region"
      aria-label="Ground Fissure Trap"
    />
  );
};

const areEqual = (prevProps: FissureTrapProps, nextProps: FissureTrapProps) => {
    return (
        prevProps.x === nextProps.x &&
        prevProps.y === nextProps.y &&
        prevProps.remainingDuration === nextProps.remainingDuration
    );
};

export const FissureTrapCharacter = React.memo(FissureTrapCharacterComponent, areEqual);

    
