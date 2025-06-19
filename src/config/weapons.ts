
import type { Icon } from 'lucide-react';
import { Target, Aperture, GitFork, HelpCircle, Crosshair, Flame, Sparkles, Volume2, LocateFixed } from 'lucide-react';

export type ProjectileType = 'bullet' | 'shotgun_pellet' | 'knife' | 'molotov_flask' | 'enemy_bullet';

export interface Weapon {
  id: string;
  name: string;
  rarity: 'Comum' | 'Raro' | 'Lendária';
  damage: number;
  projectilesPerShot?: number;
  cooldown: number; // milliseconds
  range: number; // pixels
  effectDescription: string;
  criticalChance?: number;
  criticalMultiplier?: number;
  shotgunSpreadAngle?: number; // degrees
  penetrationCount?: number;
  icon?: Icon;
  moneyCost: number; // Changed from xpCost
  upgradedThisRound?: boolean;
  projectileType: ProjectileType;
  stunDuration?: number; // milliseconds
}

export const initialWeapon: Weapon = {
  id: 'revolver_enferrujado',
  name: 'Revólver Enferrujado',
  rarity: 'Comum',
  damage: 4,
  cooldown: 1000,
  range: 300,
  effectDescription: 'Uma relíquia enferrujada, mas ainda funciona.',
  icon: HelpCircle,
  moneyCost: 0, // Changed from xpCost
  projectileType: 'bullet',
  penetrationCount: 0,
  upgradedThisRound: false,
};

const commonWeapons: Weapon[] = [
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
    moneyCost: 50, // Changed from xpCost
    projectileType: 'bullet',
    penetrationCount: 0,
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
    moneyCost: 60, // Changed from xpCost
    projectileType: 'shotgun_pellet',
    penetrationCount: 0,
  },
  {
    id: 'faca_arremesso',
    name: 'Faca de Arremesso',
    rarity: 'Comum',
    damage: 6,
    cooldown: 500,
    range: 400,
    penetrationCount: 1, 
    effectDescription: 'Penetra mais 1 inimigo.',
    icon: GitFork,
    moneyCost: 70, // Changed from xpCost
    projectileType: 'knife',
  },
];

const rareWeapons: Weapon[] = [
  {
    id: 'carabina_winchester',
    name: 'Carabina Winchester',
    rarity: 'Raro',
    damage: 8,
    cooldown: 400,
    range: 500,
    penetrationCount: 1, 
    effectDescription: 'Tiros rápidos e precisos que atravessam um inimigo.',
    icon: Crosshair,
    moneyCost: 280, // Changed from xpCost
    projectileType: 'bullet',
  },
  {
    id: 'espingarda_caca',
    name: 'Espingarda de Caça',
    rarity: 'Raro',
    damage: 5,
    projectilesPerShot: 5,
    cooldown: 700,
    range: 250,
    shotgunSpreadAngle: 40,
    effectDescription: 'Dispara 5 projéteis em um cone largo, cobrindo uma grande área frontal.',
    icon: Aperture,
    moneyCost: 320, // Changed from xpCost
    projectileType: 'shotgun_pellet',
    penetrationCount: 0,
  },
  {
    id: 'lanca_molotov',
    name: 'Lança-Molotov',
    rarity: 'Raro',
    damage: 10, 
    cooldown: 1500,
    range: 200, 
    effectDescription: 'Impacto causa dano. (Efeito de área de fogo não implementado).',
    icon: Flame,
    moneyCost: 350, // Changed from xpCost
    projectileType: 'molotov_flask',
    penetrationCount: 0, 
  }
];

const legendaryWeapons: Weapon[] = [
  {
    id: 'vibora_aco',
    name: '“Víbora de Aço”',
    rarity: 'Lendária',
    damage: 15,
    projectilesPerShot: 1, 
    cooldown: 200, 
    range: 350, 
    effectDescription: 'Pistola personalizada. 25% de chance de disparar 2 tiros.',
    icon: Sparkles,
    moneyCost: 750, // Changed from xpCost
    projectileType: 'bullet',
    penetrationCount: 0,
  },
  {
    id: 'voz_trovao',
    name: '“A Voz do Trovão”',
    rarity: 'Lendária',
    damage: 10,
    projectilesPerShot: 6,
    cooldown: 800, 
    range: 200, 
    shotgunSpreadAngle: 35,
    effectDescription: 'Escopeta lendária. Atordoa inimigos no impacto por 1s.',
    icon: Volume2,
    moneyCost: 800, // Changed from xpCost
    projectileType: 'shotgun_pellet',
    penetrationCount: 0,
    stunDuration: 1000,
  },
  {
    id: 'justica_ferro',
    name: '“Justiça de Ferro”',
    rarity: 'Lendária',
    damage: 40,
    cooldown: 2000, 
    range: 700, 
    penetrationCount: 99, 
    effectDescription: 'Rifle de precisão. Tiros atravessam todos os inimigos em linha reta.',
    icon: LocateFixed,
    moneyCost: 900, // Changed from xpCost
    projectileType: 'bullet',
  }
];

const allPurchasableWeapons: Weapon[] = [
  ...commonWeapons,
  ...rareWeapons,
  ...legendaryWeapons,
].filter(weapon => weapon.id !== initialWeapon.id);


export function getPurchasableWeapons(): Weapon[] {
  return allPurchasableWeapons.map(w => ({...w, upgradedThisRound: false }));
}

export function getWeaponById(id: string): Weapon | undefined {
  const allGameWeapons = [initialWeapon, ...commonWeapons, ...rareWeapons, ...legendaryWeapons];
  const foundWeapon = allGameWeapons.find(weapon => weapon.id === id);
  return foundWeapon ? {...foundWeapon, upgradedThisRound: false} : undefined;
}
