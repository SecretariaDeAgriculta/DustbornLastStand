
'use client';

import React from 'react';
import type { ProjectileData } from '@/game/types';
import { PLAYER_PROJECTILE_BASE_SIZE } from '@/game/constants/projectiles';
import { PLAYER_SIZE } from '@/game/constants/player';

const ProjectileComponent = (props: ProjectileData) => {
  const { x, y, size, projectileType, width: propWidth, height: propHeight, isBarrelOrDynamite, hasLanded } = props;
  
  let style: React.CSSProperties = {
    left: x,
    top: y,
    position: 'absolute',
    boxShadow: '0px 1px 2px rgba(0,0,0,0.3)',
    transition: 'background-color 0.1s linear, opacity 0.1s linear', 
  };

  let currentWidth = propWidth || size;
  let currentHeight = propHeight || size;

  switch (projectileType) {
    case 'bullet':
      style.backgroundColor = '#E5E7EB'; 
      style.width = size * 0.8;
      style.height = size * 0.8;
      style.borderRadius = '50%';
      style.border = '1px solid #9CA3AF'; 
      break;
    case 'shotgun_pellet':
      style.backgroundColor = '#FDBA74'; 
      style.width = size * 0.7;
      style.height = size * 0.7;
      style.borderRadius = '50%';
      style.border = '1px solid #F97316'; 
      break;
    case 'knife':
      currentWidth = PLAYER_SIZE * 0.5; 
      currentHeight = PLAYER_SIZE * 1.5; 
      style.backgroundColor = '#D1D5DB'; 
      style.width = currentWidth;
      style.height = currentHeight;
      style.borderRadius = '2px'; 
      style.border = '1px solid #6B7280'; 
      style.left = x - currentWidth / 2 + size / 2; 
      style.top = y - currentHeight / 2 + size / 2;
      break;
    case 'molotov_flask':
      style.backgroundColor = '#FCA5A5'; 
      style.width = size * 1.2;
      style.height = size * 1.2;
      style.borderRadius = '30% 30% 40% 40% / 40% 40% 30% 30%'; 
      style.border = '1px solid #EF4444'; 
      style.transform = 'rotate(45deg)'; 
      break;
    case 'enemy_bullet':
      style.backgroundColor = '#DC2626'; 
      style.width = size * 0.7;
      style.height = size * 0.7;
      style.borderRadius = '50%';
      style.border = '1px solid #7F1D1D'; 
      break;
    case 'barrel_explosive':
      style.backgroundColor = hasLanded ? '#A16207' : '#D97706'; 
      style.width = size;
      style.height = size;
      style.borderRadius = '15%'; 
      style.border = '2px solid #78350F'; 
      if (hasLanded) {
        style.animation = 'fusePulse 0.5s infinite alternate';
      }
      break;
    case 'dynamite_explosive':
      style.backgroundColor = hasLanded ? '#B91C1C' : '#F87171'; // Darker red when landed
      style.width = size * 0.6; // Stick-like
      style.height = size * 1.2;
      style.borderRadius = '3px';
      style.border = '1px solid #7F1D1D';
      if (hasLanded) {
        style.animation = 'fusePulse 0.5s infinite alternate';
      }
      break;
    default: 
      style.backgroundColor = '#FDE047'; 
      style.width = size;
      style.height = size;
      style.borderRadius = '50%';
      style.border = '1px solid #A0522D';
  }
  
  if (projectileType !== 'knife') { 
    style.left = x + (propWidth || size - Number(style.width || size)) / 2;
    style.top = y + (propHeight || size - Number(style.height || size)) / 2;
  }
  
  if (isBarrelOrDynamite) {
    style.left = x;
    style.top = y;
  }


  return (
    <>
      {(projectileType === 'barrel_explosive' || projectileType === 'dynamite_explosive') && hasLanded && (
        <style>{`
          @keyframes fusePulse {
            0% { opacity: 1; transform: scale(1); }
            100% { opacity: 0.7; transform: scale(1.05); }
          }
        `}</style>
      )}
      <div
        style={style}
        role="img"
        aria-label={`Projétil tipo ${projectileType}${hasLanded ? ' (no chão, ativado)' : ''}`}
      />
    </>
  );
}

const areEqual = (prevProps: ProjectileData, nextProps: ProjectileData) => {
    // Projectiles move every frame, so comparing x/y is key.
    // Also check for state changes in explosives.
    return (
        prevProps.x === nextProps.x &&
        prevProps.y === nextProps.y &&
        prevProps.hasLanded === nextProps.hasLanded &&
        prevProps.fuseTimer === nextProps.fuseTimer
    );
};

export const Projectile = React.memo(ProjectileComponent, areEqual);
    
