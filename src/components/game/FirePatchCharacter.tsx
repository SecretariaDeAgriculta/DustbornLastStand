
'use client';
import React from 'react';
import { cn } from '@/lib/utils';
import { FIRE_PATCH_DURATION } from '@/game/constants/game';

interface FirePatchProps {
  x: number; // Center X
  y: number; // Center Y
  radius: number;
  remainingDuration: number;
  maxDuration: number;
}

const FirePatchCharacterComponent = ({ x, y, radius, remainingDuration, maxDuration = FIRE_PATCH_DURATION }: FirePatchProps) => {
  const opacity = Math.max(0.2, (remainingDuration / maxDuration) * 0.7); // Fades out
  const scale = Math.min(1, 0.8 + (1 - remainingDuration / maxDuration) * 0.4); // Subtle flicker/growth

  return (
    <div
      className="absolute rounded-full bg-orange-500/70 border-2 border-red-600/80 shadow-inner pointer-events-none"
      style={{
        left: x - radius,
        top: y - radius,
        width: radius * 2,
        height: radius * 2,
        opacity: opacity,
        transform: `scale(${scale})`,
        animation: 'flickerAnimation 0.3s infinite alternate',
        zIndex: 1, // Ensure it's above ground but below most other things
      }}
      role="region"
      aria-label="Fire Patch"
    >
      <style jsx global>{`
        @keyframes flickerAnimation {
          0% {
            box-shadow: 0 0 5px 2px rgba(255, 100, 0, 0.5), inset 0 0 3px rgba(255, 50, 0, 0.4);
          }
          100% {
            box-shadow: 0 0 10px 4px rgba(255, 150, 50, 0.6), inset 0 0 5px rgba(255, 80, 30, 0.5);
          }
        }
      `}</style>
    </div>
  );
};

const areEqual = (prevProps: FirePatchProps, nextProps: FirePatchProps) => {
    return (
        prevProps.x === nextProps.x &&
        prevProps.y === nextProps.y &&
        prevProps.remainingDuration === nextProps.remainingDuration
    );
};

export const FirePatchCharacter = React.memo(FirePatchCharacterComponent, areEqual);
    
