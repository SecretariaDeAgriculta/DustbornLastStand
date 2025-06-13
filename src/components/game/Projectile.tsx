
'use client';

import React from 'react';
import type { ProjectileType } from '@/config/weapons';

interface ProjectileProps {
  x: number;
  y: number;
  size: number; // Base size, can be overridden by specific types
  projectileType: ProjectileType;
  width?: number; // For non-square projectiles
  height?: number; // For non-square projectiles
}

export function Projectile({ x, y, size, projectileType, width: propWidth, height: propHeight }: ProjectileProps) {
  let style: React.CSSProperties = {
    left: x,
    top: y,
    position: 'absolute',
    boxShadow: '0px 1px 2px rgba(0,0,0,0.3)',
  };

  let currentWidth = propWidth || size;
  let currentHeight = propHeight || size;

  switch (projectileType) {
    case 'bullet':
      style.backgroundColor = '#E5E7EB'; // Light gray
      style.width = size * 0.8;
      style.height = size * 0.8;
      style.borderRadius = '50%';
      style.border = '1px solid #9CA3AF'; // Medium gray border
      break;
    case 'shotgun_pellet':
      style.backgroundColor = '#FDBA74'; // Orange
      style.width = size * 0.7;
      style.height = size * 0.7;
      style.borderRadius = '50%';
      style.border = '1px solid #F97316'; // Darker orange border
      break;
    case 'knife':
      currentWidth = size * 0.5; // Thinner
      currentHeight = size * 1.5; // Longer
      style.backgroundColor = '#D1D5DB'; // Silver/gray
      style.width = currentWidth;
      style.height = currentHeight;
      style.borderRadius = '2px'; // Slightly rounded edges for a blade appearance
      style.border = '1px solid #6B7280'; // Darker gray
      // Adjust position because default x,y is top-left of the bounding box
      style.left = x - currentWidth / 2 + size / 2; // Center based on original size reference
      style.top = y - currentHeight / 2 + size / 2;
      break;
    case 'molotov_flask':
      style.backgroundColor = '#FCA5A5'; // Light red
      style.width = size * 1.2;
      style.height = size * 1.2;
      style.borderRadius = '30% 30% 40% 40% / 40% 40% 30% 30%'; // Flask-like shape
      style.border = '1px solid #EF4444'; // Red border
      style.transform = 'rotate(45deg)'; // Optional: make it look tumbling
      break;
    default: // Fallback to a generic look
      style.backgroundColor = '#FDE047'; // Default yellow if type is unknown
      style.width = size;
      style.height = size;
      style.borderRadius = '50%';
      style.border = '1px solid #A0522D';
  }
  
  // Ensure position is centered if width/height changed from base size
  // The knife example handles its own centering. For others, this ensures they are centered if their size changed from 'size'.
  if (projectileType !== 'knife') {
    style.left = x + (size - Number(style.width || size)) / 2;
    style.top = y + (size - Number(style.height || size)) / 2;
  }


  return (
    <div
      style={style}
      role="img"
      aria-label={`Projectile type ${projectileType}`}
    />
  );
}
