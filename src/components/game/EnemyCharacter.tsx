
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type EnemyType = 'ArruaceiroSaloon' | 'Cão de Fazenda' | 'PistoleiroVagabundo' | 'MineradorRebelde' | 'VigiaDaFerrovia' | 'BrutoBoyle' | 'SabotadorDoCanyon';

interface EnemyCharacterProps {
  x: number;
  y: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  type: EnemyType;
  isStunned?: boolean;
  isDetonating?: boolean;
}

export function EnemyCharacter({ x, y, width, height, health, maxHealth, type, isStunned, isDetonating }: EnemyCharacterProps) {
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
      case 'SabotadorDoCanyon':
        return '💣';
      default:
        return '?'; 
    }
  };
  
  const emoji = getEnemyEmoji();
  const visualCueClasses: string[] = [];
  if (isStunned) {
    visualCueClasses.push('opacity-50');
  }
  if (isDetonating && type === 'SabotadorDoCanyon') {
    visualCueClasses.push('animate-pulse', 'bg-red-600/70', 'rounded-full');
  }


  return (
    <div
      className={cn(
        "absolute shadow-md flex items-center justify-center transition-all duration-100",
        visualCueClasses.join(' ')
        )}
      style={{
        left: x,
        top: y,
        width: width,
        height: height,
        fontSize: `${Math.min(width, height) * 0.8}px`,
        lineHeight: `${height}px`,
        // opacity: isStunned || (isDetonating && type === 'SabotadorDoCanyon') ? 0.6 : 1,
        // backgroundColor: isDetonating && type === 'SabotadorDoCanyon' ? 'rgba(255,0,0,0.3)' : undefined,
        // borderRadius: isDetonating && type === 'SabotadorDoCanyon' ? '50%' : undefined,
        // transform: isDetonating && type === 'SabotadorDoCanyon' ? 'scale(1.1)' : 'scale(1)',
      }}
      role="img"
      aria-label={`Inimigo: ${type}${isStunned ? ' (atordoado)' : ''}${isDetonating ? ' (detonando)' : ''}`}
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

