
'use client';

import React from 'react';

interface EnemyCharacterProps {
  x: number;
  y: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  color?: string; 
}

export function EnemyCharacter({ x, y, width, height, health, maxHealth, color = 'purple' }: EnemyCharacterProps) {
  const healthPercentage = (health / maxHealth) * 100;

  return (
    <div
      className="absolute shadow-md flex items-center justify-center"
      style={{
        left: x,
        top: y,
        width: width,
        height: height,
        backgroundColor: color,
      }}
      role="img"
      aria-label={`Enemy character`}
      title={`HP: ${health}/${maxHealth}`}
    >
      {/* Health Bar */}
      <div 
        className="absolute top-[-10px] left-0 w-full h-[6px] bg-muted rounded-sm overflow-hidden border border-background"
        style={{ width: `${width}px`}}
      >
        <div 
          className="h-full bg-red-500 transition-all duration-100 ease-linear"
          style={{ width: `${healthPercentage}%`}}
        />
      </div>
    </div>
  );
}
    

    