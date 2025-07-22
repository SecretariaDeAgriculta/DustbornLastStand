
import type { Weapon } from '@/config/weapons';

// --- Base and Entity Interfaces ---
export interface Entity {
  id: string;
  x: number;
  y: number;
}

export interface Player extends Entity {
  width: number;
  height: number;
  health: number;
  weapons?: Weapon[]; // Optional, for systems that don't need it
}

export type EnemyType =
  | 'ArruaceiroSaloon' | 'Cão de Fazenda' | 'PistoleiroVagabundo'
  | 'MineradorRebelde' | 'VigiaDaFerrovia' | 'BrutoBoyle'
  | 'SabotadorDoCanyon' | 'AtiradorDeEliteMcGraw' | 'DesertorGavilanes'
  | 'Boss_BigDoyle' | 'Boss_CaptainMcGraw' | 'Boss_DomGael' | 'Boss_CalebHodge'
  | 'PatrolDrone';

export interface Enemy extends Entity {
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  type: EnemyType;
  moneyValue: number;
  attackCooldownTimer: number;
  speed: number;
  damage: number;
  attackRangeSquared: number;
  attackCooldown: number;
  isStunned?: boolean;
  stunTimer?: number;
  isDetonating?: boolean;
  detonationTimer?: number;
  isAiming?: boolean;
  aimingTimer?: number;
  isBursting?: boolean;
  burstShotsLeft?: number;
  burstTimer?: number;
  barrelThrowCooldownTimer?: boolean;
  dynamiteThrowCooldownTimer?: boolean;
  fissureCreateCooldownTimer?: boolean;
  droneSpawnCooldownTimer?: boolean;
  attackMode?: 'pistol' | 'knife';
  isDashing?: boolean;
  dashTimer?: number;
  dashDx?: number;
  dashDy?: number;
  dashCooldownTimer?: number;
  allySpawnCooldownTimer?: number;
  modeSwitchCooldownTimer?: number;
}

export interface MoneyOrbData extends Entity {
  size: number;
  value: number;
}

// --- Projectiles and Area Effects ---
export type GameProjectileType = 'bullet' | 'shotgun_pellet' | 'knife' | 'molotov_flask' | 'enemy_bullet' | 'barrel_explosive' | 'dynamite_explosive';

export interface ProjectileData extends Entity {
  size: number;
  width?: number;
  height?: number;
  dx: number;
  dy: number;
  damage: number;
  traveledDistance: number;
  maxRange: number;
  critical?: boolean;
  penetrationLeft: number;
  hitEnemyIds: Set<string>;
  projectileType: GameProjectileType;
  originWeaponId?: string;
  isEnemyProjectile?: boolean;
  isBarrelOrDynamite?: boolean;
  hasLanded?: boolean;
  fuseTimer?: number;
  targetX_special?: number;
  targetY_special?: number;
  explosionRadiusSquared?: number;
}

export interface FissureTrapData extends Entity {
  width: number;
  height: number;
  remainingDuration: number;
  maxDuration: number;
  lastDamageTickPlayer: number;
}

export interface FirePatchData extends Entity {
  radius: number;
  remainingDuration: number;
  maxDuration: number;
  damagePerTick: number;
  tickInterval: number;
  lastDamageTickToEnemies: Record<string, number>; // Enemy ID to timestamp
}

export interface LaserSightLine {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

    