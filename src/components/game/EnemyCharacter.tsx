
'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { characterSprites } from '@/data/assets';

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

export function EnemyCharacter({ x, y, width, height, health, maxHealth, type, isStunned, isDetonating }: EnemyCharacterProps) {
  const healthPercentage = (health / maxHealth) * 100;

  const getEnemySprite = () => {
    switch (type) {
      case 'ArruaceiroSaloon': return { src: characterSprites.railroadHenchman, alt: "Arruaceiro do Saloon", hint: "saloon brawler" };
      case 'Cão de Fazenda': return { src: `https://placehold.co/${Math.round(width)}x${Math.round(height)}.png`, alt: "Cão de Fazenda", hint: "farm dog" };
      case 'PistoleiroVagabundo': return { src: characterSprites.railroadHenchman, alt: "Pistoleiro Vagabundo", hint: "wandering gunman" };
      case 'MineradorRebelde': return { src: characterSprites.railroadHenchman, alt: "Minerador Rebelde", hint: "rebel miner" };
      case 'VigiaDaFerrovia': return { src: characterSprites.railroadHenchman, alt: "Vigia da Ferrovia", hint: "railroad guard" };
      case 'BrutoBoyle': return { src: characterSprites.railroadHenchman, alt: "Bruto Boyle", hint: "large brute" }; // Assuming generic brute for now
      case 'SabotadorDoCanyon': return { src: characterSprites.railroadHenchman, alt: "Sabotador do Canyon", hint: "canyon saboteur" };
      case 'AtiradorDeEliteMcGraw': return { src: characterSprites.railroadHenchman, alt: "Atirador de Elite McGraw", hint: "elite sniper" }; // Generic sniper
      case 'DesertorGavilanes': return { src: characterSprites.railroadHenchman, alt: "Desertor Gavilanes", hint: "hawk clan deserter" };
      case 'Boss_BigDoyle': return { src: characterSprites.bigDoyle, alt: "Chefe Big Doyle", hint: "boss big doyle" };
      case 'Boss_CaptainMcGraw': return { src: characterSprites.captainMcGraw, alt: "Chefe Capitão McGraw", hint: "boss captain mcgraw" };
      case 'Boss_DomGael': return { src: characterSprites.domGael, alt: "Chefe Dom Gael", hint: "boss dom gael" };
      case 'Boss_CalebHodge': return { src: characterSprites.calebHodge, alt: "Chefe Caleb Hodge", hint: "boss caleb hodge" };
      case 'PatrolDrone': return { src: `https://placehold.co/${Math.round(width)}x${Math.round(height)}.png`, alt: "Patrol Drone", hint: "patrol drone" };
      default: return { src: `https://placehold.co/${Math.round(width)}x${Math.round(height)}.png`, alt: "Inimigo Desconhecido", hint: "unknown enemy" };
    }
  };

  const { src: spriteSrc, alt: spriteAlt, hint: spriteHint } = getEnemySprite();
  const visualCueClasses: string[] = [];
  if (isStunned) visualCueClasses.push('opacity-50');
  if (isDetonating && type === 'SabotadorDoCanyon') visualCueClasses.push('animate-pulse ring-2 ring-red-500');

  const isBoss = type.startsWith('Boss_');

  return (
    <div
      className={cn(
        "absolute shadow-md flex flex-col items-center justify-end transition-all duration-100", // Changed to flex-col and justify-end
        visualCueClasses.join(' ')
      )}
      style={{
        left: x,
        top: y,
        width: width,
        height: height,
      }}
      role="img"
      aria-label={`Inimigo: ${spriteAlt}${isStunned ? ' (atordoado)' : ''}${isDetonating ? ' (detonando)' : ''}`}
      title={`HP: ${Math.max(0, Math.round(health))}/${maxHealth}`}
    >
      <Image
        src={spriteSrc}
        alt={spriteAlt}
        width={Math.round(width * (isBoss ? 0.9 : 1))} // Slightly smaller image for bosses to not overlap border too much
        height={Math.round(height * (isBoss ? 0.9 : 1))}
        className={cn("object-contain", isBoss ? 'border-2 border-yellow-400 rounded-sm' : '')}
        data-ai-hint={spriteHint}
      />
      <div
        className={cn(
            "absolute left-0 w-full bg-muted rounded-sm overflow-hidden border border-background",
            isBoss ? "top-[-12px] h-[8px]" : "top-[-10px] h-[6px]" // Position health bar above the character div
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
}
