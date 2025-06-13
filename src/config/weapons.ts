
import type { Icon } from 'lucide-react';
import { Target, Aperture, GitFork, HelpCircle, Crosshair, Flame, Zap, Volume2, LocateFixed, Sparkles } from 'lucide-react';

export type ProjectileType = 'bullet' | 'shotgun_pellet' | 'knife' | 'molotov_flask';

export interface Weapon {
  id: string;
  name: string;
  rarity: 'Comum' | 'Raro' | 'Lendária'; // Removed 'Incomum' as it's not used
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
  xpCost: number;
  upgradedThisRound?: boolean;
  projectileType: ProjectileType;
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
  xpCost: 0,
  projectileType: 'bullet',
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
    projectileType: 'bullet',
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
    projectileType: 'shotgun_pellet',
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
    xpCost: 70,
    projectileType: 'knife',
  },
];

export const rareWeapons: Weapon[] = [
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
    xpCost: 280,
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
    xpCost: 320,
    projectileType: 'shotgun_pellet',
  },
  {
    id: 'lanca_molotov',
    name: 'Lança-Molotov',
    rarity: 'Raro',
    damage: 10,
    cooldown: 1500,
    range: 200,
    effectDescription: 'Impacto causa 10 de dano. Cria área em chamas (Efeito de área não implementado).',
    icon: Flame,
    xpCost: 350,
    projectileType: 'molotov_flask',
  }
];

export const legendaryWeapons: Weapon[] = [
  {
    id: 'vibora_aco',
    name: '“Víbora de Aço”',
    rarity: 'Lendária',
    damage: 15,
    cooldown: 200, // Muito alta
    range: 350,   // Médio
    effectDescription: 'Pistola personalizada. 25% de chance de disparar 2 tiros em vez de 1 (Efeito de chance não implementado).',
    icon: Sparkles, // Using Sparkles to denote legendary/special
    xpCost: 750,
    projectileType: 'bullet',
  },
  {
    id: 'voz_trovao',
    name: '“A Voz do Trovão”',
    rarity: 'Lendária',
    damage: 10,
    projectilesPerShot: 6,
    cooldown: 800, // Média
    range: 200,   // Médio
    shotgunSpreadAngle: 35,
    effectDescription: 'Escopeta lendária. Atordoa inimigos no impacto (Efeito de atordoar não implementado).',
    icon: Volume2,
    xpCost: 800,
    projectileType: 'shotgun_pellet',
  },
  {
    id: 'justica_ferro',
    name: '“Justiça de Ferro”',
    rarity: 'Lendária',
    damage: 40,
    cooldown: 2000, // Muito lenta
    range: 700,    // Muito longo
    penetrationCount: 99, // Atravessa "todos" os inimigos
    effectDescription: 'Rifle de precisão. Tiros atravessam todos os inimigos em linha reta.',
    icon: LocateFixed,
    xpCost: 900,
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
