
import type { Icon } from 'lucide-react';
import { Target, Zap, Gem, Aperture, TrendingUp, Waves, Shuffle, Umbrella, GitFork, HelpCircle } from 'lucide-react'; // Example icons

export interface Weapon {
  id: string;
  name: string;
  rarity: 'Comum' | 'Incomum' | 'Raro';
  damage: number;
  projectilesPerShot?: number; // For shotguns, default is 1
  cooldown: number; // milliseconds
  range: number; // pixels
  
  // Effect related properties
  effectDescription: string;
  criticalChance?: number; // 0-1, e.g., 0.1 for 10%
  criticalMultiplier?: number; // e.g., 1.5 for 1.5x damage
  shotgunSpreadAngle?: number; // Degrees, e.g., 30 for a 30-degree cone
  penetrationCount?: number; // How many enemies it can pass through after the first hit

  // UI related
  icon?: Icon; // Lucide icon component
}

export const initialWeapon: Weapon = {
  id: 'revolver_enferrujado',
  name: 'Revólver Enferrujado',
  rarity: 'Comum',
  damage: 4,
  cooldown: 1000, // Lenta
  range: 300, // Médio
  effectDescription: 'Nenhum.',
  icon: HelpCircle,
};

export const commonWeapons: Weapon[] = [
  {
    id: 'revolver_tambor',
    name: 'Revólver de Tambor',
    rarity: 'Comum',
    damage: 5,
    cooldown: 750, // Média
    range: 300, // Médio
    criticalChance: 0.1,
    criticalMultiplier: 1.5,
    effectDescription: '10% de chance de tiro crítico (x1.5 dano).',
    icon: Target,
  },
  {
    id: 'espingarda_cano_curto',
    name: 'Espingarda de Cano Curto',
    rarity: 'Comum',
    damage: 3,
    projectilesPerShot: 3,
    cooldown: 1200, // Lenta
    range: 150, // Curto
    shotgunSpreadAngle: 30, // 30-degree cone
    effectDescription: 'Dispara 3 projéteis em cone.',
    icon: Aperture,
  },
  {
    id: 'faca_arremesso',
    name: 'Faca de Arremesso',
    rarity: 'Comum',
    damage: 6,
    cooldown: 500, // Alta
    range: 400, // Longo
    penetrationCount: 2, // Penetra até 2 inimigos (hits first + 2 more)
    effectDescription: 'Penetra até 2 inimigos.',
    icon: GitFork,
  },
];

// Placeholder for other rarities to prevent type errors if used elsewhere
export const uncommonWeapons: Weapon[] = [];
export const rareWeapons: Weapon[] = [];

export const allWeapons: Weapon[] = [
  initialWeapon,
  ...commonWeapons,
  ...uncommonWeapons,
  ...rareWeapons,
];

export function getWeaponById(id: string): Weapon | undefined {
  return allWeapons.find(weapon => weapon.id === id);
}
