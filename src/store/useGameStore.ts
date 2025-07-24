
import { create } from 'zustand';
import type { Player, Enemy, ProjectileData, MoneyOrbData, LaserSightLine, FissureTrapData, FirePatchData } from '@/game/types';
import type { Weapon } from '@/config/weapons';
import { initialWeapon } from '@/config/weapons';
import { GAME_WIDTH, GAME_HEIGHT, WAVE_DURATION } from '@/game/constants/game';
import { PLAYER_INITIAL_HEALTH, PLAYER_SIZE } from '@/game/constants/player';

type GameState = {
  player: Player;
  enemies: Enemy[];
  targetEnemy: Enemy | null;
  moneyOrbs: MoneyOrbData[];
  playerProjectiles: ProjectileData[];
  enemyProjectiles: ProjectileData[];
  laserSightLines: LaserSightLine[];
  fissureTraps: FissureTrapData[];
  firePatches: FirePatchData[];
  score: number;
  wave: number;
  waveTimer: number;
  isShopPhase: boolean;
  isGameOver: boolean;
  isPaused: boolean;
  playerDollars: number;
  playerWeapons: Weapon[];
  shopOfferings: Weapon[];
  scale: number;
  lastPlayerShotTimestamp: Record<string, number>;

  // Actions
  setPlayer: (player: Player) => void;
  setEnemies: (enemies: Enemy[]) => void;
  setTargetEnemy: (enemy: Enemy | null) => void;
  setMoneyOrbs: (orbs: MoneyOrbData[]) => void;
  setPlayerProjectiles: (projectiles: ProjectileData[]) => void;
  setEnemyProjectiles: (projectiles: ProjectileData[]) => void;
  setLaserSightLines: (lines: LaserSightLine[]) => void;
  setFissureTraps: (traps: FissureTrapData[]) => void;
  setFirePatches: (patches: FirePatchData[]) => void;
  setScore: (score: number) => void;
  setWave: (wave: number) => void;
  setWaveTimer: (time: number) => void;
  setIsShopPhase: (isShop: boolean) => void;
  setIsGameOver: (isOver: boolean) => void;
  setIsPaused: (paused: boolean) => void;
  setPlayerDollars: (dollars: number) => void;
  setPlayerWeapons: (weapons: Weapon[]) => void;
  setShopOfferings: (offerings: Weapon[]) => void;
  setLastPlayerShotTimestamp: (timestamps: Record<string, number>) => void;
  resetGame: () => void;
};

const getInitialState = () => ({
  player: {
    id: 'player',
    x: GAME_WIDTH / 2 - PLAYER_SIZE / 2,
    y: GAME_HEIGHT / 2 - PLAYER_SIZE / 2,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    health: PLAYER_INITIAL_HEALTH,
  },
  enemies: [],
  targetEnemy: null,
  moneyOrbs: [],
  playerProjectiles: [],
  enemyProjectiles: [],
  laserSightLines: [],
  fissureTraps: [],
  firePatches: [],
  score: 0,
  wave: 1,
  waveTimer: WAVE_DURATION,
  isShopPhase: false,
  isGameOver: false,
  isPaused: false,
  playerDollars: 0,
  playerWeapons: [{ ...initialWeapon, upgradedThisRound: false }],
  shopOfferings: [],
  scale: 1,
  lastPlayerShotTimestamp: {},
});

export const useGameStore = create<GameState>((set, get) => ({
  ...getInitialState(),
  setPlayer: (player) => set({ player }),
  setEnemies: (enemies) => set({ enemies }),
  setTargetEnemy: (enemy) => set({ targetEnemy: enemy }),
  setMoneyOrbs: (orbs) => set({ moneyOrbs: orbs }),
  setPlayerProjectiles: (projectiles) => set({ playerProjectiles: projectiles }),
  setEnemyProjectiles: (projectiles) => set({ enemyProjectiles: projectiles }),
  setLaserSightLines: (lines) => set({ laserSightLines: lines }),
  setFissureTraps: (traps) => set({ fissureTraps: traps }),
  setFirePatches: (patches) => set({ firePatches: patches }),
  setScore: (score) => set({ score }),
  setWave: (wave) => set({ wave }),
  setWaveTimer: (time) => set({ waveTimer: time }),
  setIsShopPhase: (isShop) => set({ isShopPhase: isShop }),
  setIsGameOver: (isOver) => set({ isGameOver: isOver }),
  setIsPaused: (paused) => set({ isPaused: paused }),
  setPlayerDollars: (dollars) => set({ playerDollars: dollars }),
  setPlayerWeapons: (weapons) => set({ playerWeapons: weapons }),
  setShopOfferings: (offerings) => set({ shopOfferings: offerings }),
  setLastPlayerShotTimestamp: (timestamps) => set({ lastPlayerShotTimestamp: timestamps }),
  resetGame: () => set(getInitialState()),
}));
