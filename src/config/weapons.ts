
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
  upgradedThisRound?: boolean; // Flag for shop UI
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
    penetrationCount: 1, 
    effectDescription: 'Penetra mais 1 inimigo.',
    icon: GitFork,
    xpCost: 70,
  },
];

// No uncommon weapons explicitly requested by user.
export const uncommonWeapons: Weapon[] = [];

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
  },
  {
    id: 'lanca_molotov',
    name: 'Lança-Molotov',
    rarity: 'Raro',
    damage: 10, 
    cooldown: 1500, 
    range: 200,    
    effectDescription: 'Impacto causa 10 de dano. Cria área em chamas (3 dano/s por 5s). (Efeito de área e DoT ainda não implementado).',
    icon: Flame,
    xpCost: 350,
  }
];

const allPurchasableWeapons: Weapon[] = [
  ...commonWeapons,
  ...uncommonWeapons, // Will be empty based on current user requests
  ...rareWeapons,
];

export function getPurchasableWeapons(): Weapon[] {
  // Return copies to prevent mutation of original definitions
  return allPurchasableWeapons.map(w => ({...w, upgradedThisRound: false }));
}

export function getWeaponById(id: string): Weapon | undefined {
  const foundWeapon = allPurchasableWeapons.find(weapon => weapon.id === id) || (id === initialWeapon.id ? initialWeapon : undefined);
  // Return a copy to prevent mutation of original definitions
  return foundWeapon ? {...foundWeapon, upgradedThisRound: false} : undefined;
}
