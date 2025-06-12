
'use client';

import React from 'react';
import Image from 'next/image';

interface EnemyCharacterProps {
  x: number;
  y: number;
  width: number;
  height: number;
  spriteUrl?: string;
  health: number;
  maxHealth: number;
  color?: string; // Fallback if no sprite
}

export function EnemyCharacter({ x, y, width, height, spriteUrl, health, maxHealth, color = 'purple' }: EnemyCharacterProps) {
  const healthPercentage = (health / maxHealth) * 100;

  return (
    <div
      className="absolute shadow-md flex items-center justify-center"
      style={{
        left: x,
        top: y,
        width: width,
        height: height,
        backgroundColor: spriteUrl ? 'transparent' : color,
      }}
      role="img"
      aria-label={`Enemy character`}
      title={`HP: ${health}/${maxHealth}`}
    >
      {spriteUrl && (
        <Image 
          src={spriteUrl} 
          alt="Enemy Sprite" 
          width={width} 
          height={height} 
          className="object-contain"
          data-ai-hint="brawler enemy" 
        />
      )}
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
