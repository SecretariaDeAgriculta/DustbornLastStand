
'use client';

import React from 'react';

interface XPOrbProps {
  x: number;
  y: number;
  size: number;
}

const XPOrbComponent = ({ x, y, size }: XPOrbProps) => {
  return (
    <div
      className="absolute bg-yellow-400 rounded-full shadow animate-pulse"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        opacity: 0.8,
      }}
      role="img"
      aria-label="Moeda"
    />
  );
};

const areEqual = (prevProps: XPOrbProps, nextProps: XPOrbProps) => {
    // Orbs are static until collected, so we only need to compare position.
    // Since they are removed on collection, an ID check isn't strictly necessary
    // if we assume keys are handled correctly by the parent.
    return prevProps.x === nextProps.x && prevProps.y === nextProps.y;
};

export const XPOrb = React.memo(XPOrbComponent, areEqual);
