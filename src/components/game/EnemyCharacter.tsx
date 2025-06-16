
'use client';

import React from 'react';

type EnemyType = 'ArruaceiroSaloon' | 'Cão de Fazenda';

interface EnemyCharacterProps {
  x: number;
  y: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  type: EnemyType;
}

export function EnemyCharacter({ x, y, width, height, health, maxHealth, type }: EnemyCharacterProps) {
  const healthPercentage = (health / maxHealth) * 100;

  const getEnemyEmoji = () => {
    switch (type) {
      case 'ArruaceiroSaloon':
        return '🕴🏻';
      case 'Cão de Fazenda':
        return '🐕';
      default:
        return '?'; // Fallback for unknown types
    }
  };

  return (
    <div
      className="absolute shadow-md flex items-center justify-center"
      style={{
        left: x,
        top: y,
        width: width,
        height: height,
        fontSize: `${Math.min(width, height) * 0.8}px`, // Scale emoji size with component size
        lineHeight: `${height}px`, // Center emoji vertically
      }}
      role="img"
      aria-label={`Enemy character: ${type}`}
      title={`HP: ${health}/${maxHealth}`}
    >
      {getEnemyEmoji()}
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
