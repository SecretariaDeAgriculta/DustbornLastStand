
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { Enemy } from '@/game/types';

type EnemyType =
  | 'ArruaceiroSaloon'
  | 'Cão de Fazenda'
  | 'PistoleiroVagabundo'
  | 'MineradorRebelde'
  | 'VigiaDaFerrovia'
  | 'BrutoBoyle'
  | 'SabotadorDoCanyon'
  | 'AtiradorDeEliteMcGraw'
  | 'DesertorGavilanes'
  | 'Boss_BigDoyle'
  | 'Boss_CaptainMcGraw'
  | 'Boss_DomGael'
  | 'Boss_CalebHodge'
  | 'PatrolDrone';

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

const EnemyCharacterComponent = ({ x, y, width, height, health, maxHealth, type, isStunned, isDetonating }: EnemyCharacterProps) => {
  const healthPercentage = (health / maxHealth) * 100;

  const getEnemyEmoji = () => {
    switch (type) {
        case 'ArruaceiroSaloon': return '😠';
        case 'Cão de Fazenda': return '🐶';
        case 'PistoleiroVagabundo': return '🤠';
        case 'MineradorRebelde': return '⛏️';
        case 'VigiaDaFerrovia': return '👮';
        case 'BrutoBoyle': return '💪';
        case 'SabotadorDoCanyon': return '💣';
        case 'AtiradorDeEliteMcGraw': return '🎯';
        case 'DesertorGavilanes': return '🦅';
        case 'Boss_BigDoyle': return '🦍';
        case 'Boss_CaptainMcGraw': return '👨‍✈️';
        case 'Boss_DomGael': return '🤺';
        case 'Boss_CalebHodge': return '🧨';
        case 'PatrolDrone': return '🛸';
        default: return '❓';
    }
  };

  const visualCueClasses: string[] = [];
  if (isStunned) visualCueClasses.push('opacity-50');
  if (isDetonating && type === 'SabotadorDoCanyon') visualCueClasses.push('animate-pulse ring-2 ring-red-500');

  const isBoss = type.startsWith('Boss_');

  return (
    <div
      className={cn(
        "absolute shadow-md flex flex-col items-center justify-center transition-all duration-100",
        visualCueClasses.join(' ')
      )}
      style={{
        left: x,
        top: y,
        width: width,
        height: height,
      }}
      role="img"
      aria-label={`Inimigo: ${type}${isStunned ? ' (atordoado)' : ''}${isDetonating ? ' (detonando)' : ''}`}
      title={`HP: ${Math.max(0, Math.round(health))}/${maxHealth}`}
    >
        <div style={{ fontSize: `${width * 0.8}px`, lineHeight: 1 }}>
            {getEnemyEmoji()}
        </div>
      <div
        className={cn(
            "absolute left-0 w-full bg-muted rounded-sm overflow-hidden border border-background",
            isBoss ? "top-[-12px] h-[8px]" : "top-[-10px] h-[6px]"
        )}
        style={{ width: `${width}px`}}
      >
        <div
          className={cn(
              "h-full transition-all duration-100 ease-linear",
              healthPercentage > 50 ? 'bg-green-500' : healthPercentage > 20 ? 'bg-yellow-500' : 'bg-red-600'
            )}
          style={{ width: `${Math.max(0,healthPercentage)}%`}}
        />
      </div>
    </div>
  );
};

const areEqual = (prevProps: EnemyCharacterProps, nextProps: EnemyCharacterProps) => {
    return (
        prevProps.x === nextProps.x &&
        prevProps.y === nextProps.y &&
        prevProps.health === nextProps.health &&
        prevProps.isStunned === nextProps.isStunned &&
        prevProps.isDetonating === nextProps.isDetonating &&
        prevProps.type === nextProps.type
    );
};

export const EnemyCharacter = React.memo(EnemyCharacterComponent, areEqual);
