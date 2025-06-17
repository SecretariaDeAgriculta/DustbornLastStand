
'use client';

import React from 'react';

type EnemyType = 'ArruaceiroSaloon' | 'Cão de Fazenda' | 'PistoleiroVagabundo' | 'MineradorRebelde' | 'VigiaDaFerrovia' | 'BrutoBoyle';

interface EnemyCharacterProps {
  x: number;
  y: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  type: EnemyType;
  isStunned?: boolean;
}

export function EnemyCharacter({ x, y, width, height, health, maxHealth, type, isStunned }: EnemyCharacterProps) {
  const healthPercentage = (health / maxHealth) * 100;

  const getEnemyEmoji = () => {
    switch (type) {
      case 'ArruaceiroSaloon':
        return '🕴🏻';
      case 'Cão de Fazenda':
        return '🐕';
      case 'PistoleiroVagabundo':
        return '🤠';
      case 'MineradorRebelde':
        return '⛏️';
      case 'VigiaDaFerrovia':
        return '💂';
      case 'BrutoBoyle':
        return '🪓';
      default:
        return '?'; 
    }
  };
  
  const emoji = getEnemyEmoji();

  return (
    <div
      className="absolute shadow-md flex items-center justify-center"
      style={{
        left: x,
        top: y,
        width: width,
        height: height,
        fontSize: `${Math.min(width, height) * 0.8}px`,
        lineHeight: `${height}px`,
        opacity: isStunned ? 0.5 : 1,
        transition: 'opacity 0.15s linear',
      }}
      role="img"
      aria-label={`Inimigo: ${type}${isStunned ? ' (atordoado)' : ''}`}
      title={`HP: ${health}/${maxHealth}`}
    >
      {emoji}
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
