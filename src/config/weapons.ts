
import type { Icon } from 'lucide-react';
import { Target, Zap, Gem, Aperture, TrendingUp, Waves, Shuffle, Umbrella, GitFork, HelpCircle, MinusCircle, Diamond } from 'lucide-react';

export interface Weapon {
  id: string;
  name: string;
  rarity: 'Comum' | 'Incomum' | 'Raro';
  damage: number;
  projectilesPerShot?: number;
  cooldown: number;
  range: number;
  effectDescription: string;
  criticalChance?: number;
  criticalMultiplier?: number;
  shotgunSpreadAngle?: number;
  penetrationCount?: number;
  icon?: Icon;
  xpCost: number; // XP cost to buy
}

export const initialWeapon: Weapon = {
  id: 'revolver_enferrujado',
  name: 'Revólver Enferrujado',
  rarity: 'Comum',
  damage: 4,
  cooldown: 1000,
  range: 300,
  effectDescription: 'Nenhum.',
  icon: HelpCircle,
  xpCost: 0, // Not buyable, recycle for fixed small amount
};

export const commonWeapons: Weapon[] = [
  {
    id: 'revolver_tambor',
    name: 'Revólver de Tambor',
    rarity: 'Comum',
    damage: 5,
    cooldown: 750,
    range: 300,
    criticalChance: 0.1,
    criticalMultiplier: 1.5,
    effectDescription: '10% de chance de tiro crítico (x1.5 dano).',
    icon: Target,
    xpCost: 50,
  },
  {
    id: 'espingarda_cano_curto',
    name: 'Espingarda de Cano Curto',
    rarity: 'Comum',
    damage: 3,
    projectilesPerShot: 3,
    cooldown: 1200,
    range: 150,
    shotgunSpreadAngle: 30,
    effectDescription: 'Dispara 3 projéteis em cone.',
    icon: Aperture,
    xpCost: 60,
  },
  {
    id: 'faca_arremesso',
    name: 'Faca de Arremesso',
    rarity: 'Comum',
    damage: 6,
    cooldown: 500,
    range: 400,
    penetrationCount: 1, // Hits first + 1 more = 2 total. Penetration is number of *additional* enemies.
    effectDescription: 'Penetra mais 1 inimigo.',
    icon: GitFork,
    xpCost: 70,
  },
];

export const uncommonWeapons: Weapon[] = [
  {
    id: 'peacemaker_polido',
    name: 'Peacemaker Polido',
    rarity: 'Incomum',
    damage: 8,
    cooldown: 650,
    range: 350,
    criticalChance: 0.15,
    criticalMultiplier: 1.7,
    effectDescription: 'Tiros mais precisos e potentes. Chance de crítico aumentada.',
    icon: Zap,
    xpCost: 120,
  },
  {
    id: 'rifle_repeticao',
    name: 'Rifle de Repetição',
    rarity: 'Incomum',
    damage: 10,
    cooldown: 800,
    range: 450,
    penetrationCount: 0,
    effectDescription: 'Disparos fortes com bom alcance.',
    icon: TrendingUp,
    xpCost: 150,
  }
];

export const rareWeapons: Weapon[] = [
  {
    id: 'winchester_trovejante',
    name: 'Winchester Trovejante',
    rarity: 'Raro',
    damage: 15,
    cooldown: 900,
    range: 500,
    penetrationCount: 2, // Hits first + 2 more = 3 total
    effectDescription: 'Disparos poderosos que atravessam múltiplos inimigos.',
    icon: Waves,
    xpCost: 250,
  },
  {
    id: 'colt_banhado_ouro',
    name: 'Colt Banhado a Ouro',
    rarity: 'Raro',
    damage: 12,
    cooldown: 550,
    range: 380,
    criticalChance: 0.25,
    criticalMultiplier: 2.0,
    effectDescription: 'Luxuoso e mortal. Alta chance de crítico com dano dobrado.',
    icon: Diamond,
    xpCost: 300,
  }
];

export const allWeapons: Weapon[] = [
  initialWeapon, // Keep initial weapon conceptually separate if it can't be re-bought
  ...commonWeapons,
  ...uncommonWeapons,
  ...rareWeapons,
];

// Function to get all purchasable weapons (excludes initial if desired)
export function getPurchasableWeapons(): Weapon[] {
  return [
    ...commonWeapons,
    ...uncommonWeapons,
    ...rareWeapons,
  ];
}

export function getWeaponById(id: string): Weapon | undefined {
  return allWeapons.find(weapon => weapon.id === id);
}
