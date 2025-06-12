
'use client';

import React from 'react';

interface EnemyCharacterProps {
  x: number;
  y: number;
  size: number;
  color?: string;
  health: number;
  maxHealth: number;
  onClick?: () => void; // Optional: for testing defeat
}

export function EnemyCharacter({ x, y, size, color = 'red', health, maxHealth, onClick }: EnemyCharacterProps) {
  const healthPercentage = (health / maxHealth) * 100;

  return (
    <div
      className="absolute rounded-sm shadow-md"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        backgroundColor: color,
        cursor: onClick ? 'pointer' : 'default', // Indicate clickable for testing
      }}
      role="img"
      aria-label={`Enemy character, color ${color}`}
      onClick={onClick}
      title={`HP: ${health}/${maxHealth}`} // Tooltip for health
    >
      {/* Simple Health Bar */}
      <div className="absolute top-[-8px] left-0 w-full h-[5px] bg-muted rounded-full overflow-hidden border border-background">
        <div 
          className="h-full bg-red-500 transition-all duration-150 ease-linear"
          style={{ width: `${healthPercentage}%`}}
        />
      </div>
    </div>
  );
}

    