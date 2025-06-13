
import type { Icon } from 'lucide-react';
import { Target, Zap, Gem, Aperture, TrendingUp, Waves, Shuffle, Umbrella, GitFork, HelpCircle, MinusCircle, Diamond, Crosshair, Flame } from 'lucide-react';

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
  cooldown: 1000, // Cadência: Lenta
  range: 300, // Alcance: Médio
  effectDescription: 'Nenhum.',
  icon: HelpCircle,
  xpCost: 0,
};

export const commonWeapons: Weapon[] = [
  {
    id: 'revolver_tambor',
    name: 'Revólver de Tambor',
    rarity: 'Comum',
    damage: 5,
    cooldown: 750, // Cadência: Média
    range: 300, // Alcance: Médio
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
    cooldown: 1200, // Cadência: Lenta
    range: 150, // Alcance: Curto
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
    cooldown: 500, // Cadência: Alta
    range: 400, // Alcance: Longo
    penetrationCount: 1, // Penetra até 2 inimigos (hits first + 1 more)
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
  },
  {
    id: 'carabina_winchester',
    name: 'Carabina Winchester',
    rarity: 'Raro',
    damage: 8,
    cooldown: 400, // Cadência: Alta
    range: 500,   // Alcance: Longo
    penetrationCount: 1, // Tiros atravessam 1 inimigo
    effectDescription: 'Tiros rápidos e precisos que atravessam um inimigo.',
    icon: Crosshair,
    xpCost: 280,
  },
  {
    id: 'espingarda_caca',
    name: 'Espingarda de Caça',
    rarity: 'Raro',
    damage: 5,
    projectilesPerShot: 5,
    cooldown: 700, // Cadência: Média
    range: 250,   // Alcance: Médio
    shotgunSpreadAngle: 40,
    effectDescription: 'Dispara 5 projéteis em um cone largo, cobrindo uma grande área frontal.',
    icon: Aperture, // Re-using Aperture for shotguns
    xpCost: 320,
  },
  {
    id: 'lanca_molotov',
    name: 'Lança-Molotov',
    rarity: 'Raro',
    damage: 10, // Dano ao acertar
    cooldown: 1500, // Cadência: Lenta
    range: 200,    // Alcance: Médio
    effectDescription: 'Impacto causa 10 de dano. Cria área em chamas (3 dano/s por 5s). (Efeito de área e DoT ainda não implementado).',
    icon: Flame,
    xpCost: 350,
  }
];

export const allWeapons: Weapon[] = [
  initialWeapon,
  ...commonWeapons,
  ...uncommonWeapons,
  ...rareWeapons,
];

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
