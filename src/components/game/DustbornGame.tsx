
'use client';

import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { PlayerCharacter } from './PlayerCharacter';
import { EnemyCharacter } from './EnemyCharacter';
import { GameHUD } from './GameHUD';
import { Card } from '@/components/ui/card';
import { XPOrb } from './XPOrb';
import { ShopDialog } from './ShopDialog';
import { Button } from '@/components/ui/button';
import { Projectile } from './Projectile';
import { PlayerInventoryDisplay } from './PlayerInventoryDisplay';
import { FissureTrapCharacter } from './FissureTrapCharacter';
import { PauseIcon, PlayIcon, HomeIcon, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import type { Weapon, ProjectileType as PlayerProjectileType } from '@/config/weapons';
import { initialWeapon, getPurchasableWeapons, getWeaponById } from '@/config/weapons';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';


const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

const PLAYER_SIZE = 30;
const PLAYER_SPEED = 3.5;
const PLAYER_INITIAL_HEALTH = 100;
const MAX_PLAYER_WEAPONS = 5;
const RECYCLE_XP_PERCENTAGE = 0.3;
const INITIAL_WEAPON_RECYCLE_XP = 5;


const ENEMY_ARROCEIRO_SIZE = PLAYER_SIZE;
const ENEMY_ARROCEIRO_INITIAL_HEALTH = 10;
const ENEMY_ARROCEIRO_DAMAGE = 2;
const ENEMY_ARROCEIRO_BASE_SPEED = 1.8;
const ENEMY_ARROCEIRO_ATTACK_RANGE_SQUARED = (PLAYER_SIZE / 2 + ENEMY_ARROCEIRO_SIZE / 2 + 5) ** 2;
const ENEMY_ARROCEIRO_ATTACK_COOLDOWN = 800;
const ENEMY_ARROCEIRO_XP_VALUE = 2;

const ENEMY_CAODEFAZENDA_SIZE = PLAYER_SIZE * 0.8;
const ENEMY_CAODEFAZENDA_INITIAL_HEALTH = 12;
const ENEMY_CAODEFAZENDA_DAMAGE = 4;
const ENEMY_CAODEFAZENDA_BASE_SPEED = 2.5;
const ENEMY_CAODEFAZENDA_ATTACK_RANGE_SQUARED = (PLAYER_SIZE / 2 + ENEMY_CAODEFAZENDA_SIZE / 2 + 5) ** 2;
const ENEMY_CAODEFAZENDA_ATTACK_COOLDOWN = 700;
const ENEMY_CAODEFAZENDA_XP_VALUE = 1;

const ENEMY_PISTOLEIRO_SIZE = PLAYER_SIZE;
const ENEMY_PISTOLEIRO_INITIAL_HEALTH = 15;
const ENEMY_PISTOLEIRO_DAMAGE = 5;
const ENEMY_PISTOLEiro_BASE_SPEED = 1.5;
const ENEMY_PISTOLEIRO_XP_VALUE = 4;
const ENEMY_PISTOLEIRO_ATTACK_RANGE_SQUARED = (350) ** 2;
const ENEMY_PISTOLEIRO_ATTACK_COOLDOWN = 2500;
const ENEMY_PROJECTILE_SPEED = 7;
const ENEMY_PROJECTILE_SIZE = 8;
const ENEMY_PISTOLEIRO_MELEE_RANGE_SQUARED = (PLAYER_SIZE / 2 + ENEMY_PISTOLEIRO_SIZE / 2 + 10) ** 2;

const ENEMY_MINERADOR_SIZE = PLAYER_SIZE * 1.1;
const ENEMY_MINERADOR_INITIAL_HEALTH = 18;
const ENEMY_MINERADOR_DAMAGE = 7;
const ENEMY_MINERADOR_BASE_SPEED = 1.2;
const ENEMY_MINERADOR_XP_VALUE = 5;
const ENEMY_MINERADOR_ATTACK_RANGE_SQUARED = (PLAYER_SIZE / 2 + ENEMY_MINERADOR_SIZE / 2 + 8) ** 2;
const ENEMY_MINERADOR_ATTACK_COOLDOWN = 1200;

const ENEMY_VIGIA_SIZE = PLAYER_SIZE;
const ENEMY_VIGIA_INITIAL_HEALTH = 25;
const ENEMY_VIGIA_DAMAGE = 6;
const ENEMY_VIGIA_BASE_SPEED = 1.6;
const ENEMY_VIGIA_XP_VALUE = 6;
const ENEMY_VIGIA_ATTACK_RANGE_SQUARED = (400 * 400);
const ENEMY_VIGIA_ATTACK_COOLDOWN = 3000;

const ENEMY_BRUTOBOYLE_SIZE = PLAYER_SIZE * 1.2;
const ENEMY_BRUTOBOYLE_INITIAL_HEALTH = 40;
const ENEMY_BRUTOBOYLE_DAMAGE = 10;
const ENEMY_BRUTOBOYLE_BASE_SPEED = 1.0;
const ENEMY_BRUTOBOYLE_XP_VALUE = 8;
const ENEMY_BRUTOBOYLE_ATTACK_RANGE_SQUARED = (PLAYER_SIZE / 2 + ENEMY_BRUTOBOYLE_SIZE / 2 + 10) ** 2;
const ENEMY_BRUTOBOYLE_ATTACK_COOLDOWN = 1500;

const ENEMY_SABOTADOR_SIZE = PLAYER_SIZE * 0.9;
const ENEMY_SABOTADOR_INITIAL_HEALTH = 20;
const ENEMY_SABOTADOR_DAMAGE = 15;
const ENEMY_SABOTADOR_BASE_SPEED = 2.8;
const ENEMY_SABOTADOR_XP_VALUE = 7;
const ENEMY_SABOTADOR_DETONATION_RANGE_SQUARED = (PLAYER_SIZE * 1.2) ** 2;
const ENEMY_SABOTADOR_EXPLOSION_RADIUS_SQUARED = (PLAYER_SIZE * 2.5) ** 2;
const ENEMY_SABOTADOR_DETONATION_TIMER_DURATION = 700;

const ENEMY_MCGRAW_SIZE = PLAYER_SIZE;
const ENEMY_MCGRAW_INITIAL_HEALTH = 30;
const ENEMY_MCGRAW_DAMAGE = 12;
const ENEMY_MCGRAW_BASE_SPEED = 1.1;
const ENEMY_MCGRAW_XP_VALUE = 10;
const ENEMY_MCGRAW_ATTACK_RANGE_SQUARED = (550 * 550);
const ENEMY_MCGRAW_ATTACK_COOLDOWN = 4000;
const ENEMY_MCGRAW_TELEGRAPH_DURATION = 1500;

const ENEMY_DESERTOR_SIZE = PLAYER_SIZE;
const ENEMY_DESERTOR_INITIAL_HEALTH = 35;
const ENEMY_DESERTOR_DAMAGE = 8;
const ENEMY_DESERTOR_BASE_SPEED = 2.2;
const ENEMY_DESERTOR_XP_VALUE = 9;
const ENEMY_DESERTOR_ATTACK_RANGE_SQUARED = (300 * 300);
const ENEMY_DESERTOR_ATTACK_COOLDOWN = 1800;
const ENEMY_DESERTOR_SHOTS_IN_BURST = 2;
const ENEMY_DESERTOR_BURST_DELAY = 150;

const ENEMY_DRONE_SIZE = PLAYER_SIZE * 0.6;
const ENEMY_DRONE_INITIAL_HEALTH = 15;
const ENEMY_DRONE_DAMAGE = 3;
const ENEMY_DRONE_BASE_SPEED = 2.8;
const ENEMY_DRONE_XP_VALUE = 0;
const ENEMY_DRONE_ATTACK_RANGE_SQUARED = (PLAYER_SIZE / 2 + ENEMY_DRONE_SIZE / 2 + 3) ** 2;
const ENEMY_DRONE_ATTACK_COOLDOWN = 1000;

const ENEMY_CAPTAINMCGRAW_SIZE = PLAYER_SIZE * 1.1;
const ENEMY_CAPTAINMCGRAW_INITIAL_HEALTH = 180;
const ENEMY_CAPTAINMCGRAW_RIFLE_DAMAGE = 20;
const ENEMY_CAPTAINMCGRAW_BASE_SPEED = 0.9;
const ENEMY_CAPTAINMCGRAW_XP_VALUE = 100;
const ENEMY_CAPTAINMCGRAW_RIFLE_ATTACK_RANGE_SQUARED = (650 * 650);
const ENEMY_CAPTAINMCGRAW_RIFLE_ATTACK_COOLDOWN = 5000;
const ENEMY_CAPTAINMCGRAW_RIFLE_TELEGRAPH_DURATION = 2000;
const ENEMY_CAPTAINMCGRAW_DRONE_SPAWN_COOLDOWN = 8000;
const ENEMY_CAPTAINMCGRAW_MAX_ACTIVE_DRONES = 3;

const ENEMY_BIGDOYLE_SIZE = PLAYER_SIZE * 1.6;
const ENEMY_BIGDOYLE_INITIAL_HEALTH = 200;
const ENEMY_BIGDOYLE_MELEE_DAMAGE = 15;
const ENEMY_BIGDOYLE_BARREL_DAMAGE = 25;
const ENEMY_BIGDOYLE_BASE_SPEED = 0.7;
const ENEMY_BIGDOYLE_XP_VALUE = 75;
const ENEMY_BIGDOYLE_MELEE_ATTACK_RANGE_SQUARED = (PLAYER_SIZE / 2 + ENEMY_BIGDOYLE_SIZE / 2 + 15) ** 2;
const ENEMY_BIGDOYLE_MELEE_ATTACK_COOLDOWN = 2500;
const ENEMY_BIGDOYLE_BARREL_THROW_COOLDOWN = 6000;
const ENEMY_BIGDOYLE_BARREL_THROW_RANGE_SQUARED = (450 * 450);
const BARREL_PROJECTILE_SIZE = PLAYER_SIZE * 0.9;
const BARREL_PROJECTILE_SPEED = 4;
const BARREL_EXPLOSION_RADIUS_SQUARED = (PLAYER_SIZE * 3.5) ** 2;
const BARREL_FUSE_TIME = 2000;
const BARREL_MAX_TRAVEL_DISTANCE = 500;

const ENEMY_DOMGAEL_SIZE = PLAYER_SIZE * 1.05;
const ENEMY_DOMGAEL_INITIAL_HEALTH = 160;
const ENEMY_DOMGAEL_PISTOL_DAMAGE = 12;
const ENEMY_DOMGAEL_KNIFE_DAMAGE = 18;
const ENEMY_DOMGAEL_BASE_SPEED = 2.5;
const ENEMY_DOMGAEL_XP_VALUE = 120;
const ENEMY_DOMGAEL_PISTOL_ATTACK_RANGE_SQUARED = (400 * 400);
const ENEMY_DOMGAEL_KNIFE_ATTACK_RANGE_SQUARED = (PLAYER_SIZE * 1.8) ** 2;
const ENEMY_DOMGAEL_PISTOL_COOLDOWN = 1500;
const ENEMY_DOMGAEL_KNIFE_COOLDOWN = 800;
const ENEMY_DOMGAEL_ALLY_SPAWN_COOLDOWN = 12000;
const ENEMY_DOMGAEL_MAX_ACTIVE_ALLIES = 2;
const ENEMY_DOMGAEL_DASH_COOLDOWN = 6000;
const ENEMY_DOMGAEL_DASH_DURATION = 250;
const ENEMY_DOMGAEL_DASH_SPEED_MULTIPLIER = 2.0;
const ENEMY_DOMGAEL_MODE_SWITCH_COOLDOWN = 3000;

const ENEMY_CALEBHODGE_SIZE = PLAYER_SIZE * 1.1;
const ENEMY_CALEBHODGE_INITIAL_HEALTH = 220;
const ENEMY_CALEBHODGE_DYNAMITE_DAMAGE = 18;
const ENEMY_CALEBHODGE_BASE_SPEED = 0.9;
const ENEMY_CALEBHODGE_XP_VALUE = 150;
const ENEMY_CALEBHODGE_DYNAMITE_THROW_COOLDOWN = 5000;
const ENEMY_CALEBHODGE_DYNAMITE_THROW_RANGE_SQUARED = (400 * 400);
const ENEMY_CALEBHODGE_FISSURE_CREATE_COOLDOWN = 8000;
const ENEMY_CALEBHODGE_MAX_ACTIVE_FISSURES = 3;
const DYNAMITE_PROJECTILE_SIZE = PLAYER_SIZE * 0.6;
const DYNAMITE_PROJECTILE_SPEED = 5;
const DYNAMITE_FUSE_TIME = 2500;
const DYNAMITE_EXPLOSION_RADIUS_SQUARED = (PLAYER_SIZE * 3) ** 2;
const DYNAMITE_MAX_TRAVEL_DISTANCE = 450;
const FISSURE_TRAP_WIDTH = PLAYER_SIZE * 4;
const FISSURE_TRAP_HEIGHT = PLAYER_SIZE * 1.5;
const FISSURE_TRAP_DURATION = 10000;
const FISSURE_TRAP_DAMAGE = 15;
const FISSURE_PLAYER_DAMAGE_COOLDOWN = 1000;


const PLAYER_PROJECTILE_BASE_SIZE = 8;
const XP_ORB_SIZE = 10;
const WAVE_DURATION = 90;


const MAX_ARROCEIROS_WAVE_BASE = 5;
const MAX_CAES_WAVE_BASE = 6;
const CAO_SPAWN_BATCH_SIZE = 3;
const MAX_PISTOLEIROS_WAVE_BASE = 2;
const PISTOLEIRO_SPAWN_BATCH_SIZE = 2;
const MAX_MINERADORES_WAVE_BASE = 1;
const MINERADOR_SPAWN_BATCH_SIZE = 1;
const MAX_VIGIAS_WAVE_BASE = 1;
const VIGIA_SPAWN_BATCH_SIZE = 1;
const MAX_BRUTOS_WAVE_BASE = 1;
const BRUTO_SPAWN_BATCH_SIZE = 1;
const MAX_SABOTADORES_WAVE_BASE = 1;
const SABOTADOR_SPAWN_BATCH_SIZE = 1;
const MAX_MCGRAW_WAVE_BASE = 1;
const MCGRAW_SPAWN_BATCH_SIZE = 1;
const MAX_DESERTOR_WAVE_BASE = 1;
const DESERTOR_SPAWN_BATCH_SIZE = 1;


const ENEMY_SPAWN_TICK_INTERVAL = 2000;


const XP_COLLECTION_RADIUS_SQUARED = (PLAYER_SIZE / 2 + XP_ORB_SIZE / 2 + 30) ** 2;
const ENEMY_MOVE_INTERVAL = 50;

interface Entity {
  id: string;
  x: number;
  y: number;
}

interface Player extends Entity {
  width: number;
  height: number;
  health: number;
}

type EnemyType =
  | 'ArruaceiroSaloon'
  | 'Cão de Fazenda'
  | 'PistoleiroVagabundo'
  | 'MineradorRebelde'
  | 'VigiaDaFerrovia'
  | 'BrutoBoyle'
  | 'SabotadorDoCanyon'
  | 'AtiradorDeEliteMcGraw'
  | 'DesertorGavilanes'
  | 'Boss_BigDoyle'
  | 'Boss_CaptainMcGraw'
  | 'Boss_DomGael'
  | 'Boss_CalebHodge'
  | 'PatrolDrone';

const bossPool: EnemyType[] = ['Boss_BigDoyle', 'Boss_CaptainMcGraw', 'Boss_DomGael', 'Boss_CalebHodge'];

interface Enemy extends Entity {
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  type: EnemyType;
  xpValue: number;
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

  barrelThrowCooldownTimer?: number;
  dynamiteThrowCooldownTimer?: number;
  fissureCreateCooldownTimer?: number;
  droneSpawnCooldownTimer?: number;

  attackMode?: 'pistol' | 'knife';
  isDashing?: boolean;
  dashTimer?: number;
  dashDx?: number;
  dashDy?: number;
  dashCooldownTimer?: number;
  allySpawnCooldownTimer?: number;
  modeSwitchCooldownTimer?: number;
}

interface XPOrbData extends Entity {
  size: number;
  value: number;
}

type GameProjectileType = PlayerProjectileType | 'enemy_bullet' | 'barrel_explosive' | 'dynamite_explosive';

interface ProjectileData extends Entity {
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

interface FissureTrapData extends Entity {
  width: number;
  height: number;
  remainingDuration: number;
  lastDamageTickPlayer: number;
}

interface DustbornGameProps {
  onExitToMenu?: () => void;
  deviceType: 'computer' | 'mobile';
}

interface LaserSightLine {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}


export function DustbornGame({ onExitToMenu, deviceType }: DustbornGameProps) {
  const [player, setPlayer] = useState<Player>({
    id: 'player',
    x: GAME_WIDTH / 2 - PLAYER_SIZE / 2,
    y: GAME_HEIGHT / 2 - PLAYER_SIZE / 2,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    health: PLAYER_INITIAL_HEALTH,
  });
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [xpOrbs, setXpOrbs] = useState<XPOrbData[]>([]);
  const [playerProjectiles, setPlayerProjectiles] = useState<ProjectileData[]>([]);
  const [enemyProjectiles, setEnemyProjectiles] = useState<ProjectileData[]>([]);
  const [laserSightLines, setLaserSightLines] = useState<LaserSightLine[]>([]);
  const [fissureTraps, setFissureTraps] = useState<FissureTrapData[]>([]);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [waveTimer, setWaveTimer] = useState(WAVE_DURATION);
  const [isShopPhase, setIsShopPhase] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playerXP, setPlayerXP] = useState(0);
  const [isPlayerTakingDamage, setIsPlayerTakingDamage] = useState(false);

  const [playerWeapons, setPlayerWeapons] = useState<Weapon[]>([{...initialWeapon, upgradedThisRound: false}]);
  const [shopOfferings, setShopOfferings] = useState<Weapon[]>([]);

  const [scale, setScale] = useState(1);
  const gameWrapperRef = useRef<HTMLDivElement>(null);

  const activeKeys = useRef<Set<string>>(new Set());
  const enemySpawnTimerId = useRef<NodeJS.Timer | null>(null);
  const waveIntervalId = useRef<NodeJS.Timeout | null>(null);
  const lastLogicUpdateTimestampRef = useRef(0);
  const lastPlayerShotTimestampRef = useRef<Record<string, number>>({});
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const playerRef = useRef(player);
  const waveRef = useRef(wave);
  const enemiesRef = useRef(enemies);
  const isBossWaveActive = useRef(false);
  const currentBossId = useRef<string | null>(null);


  useEffect(() => { playerRef.current = player; }, [player]);
  useEffect(() => { waveRef.current = wave; }, [wave]);
  useEffect(() => { enemiesRef.current = enemies; }, [enemies]);


  useLayoutEffect(() => {
    const calculateScale = () => {
      if (gameWrapperRef.current) {
        const availableWidth = gameWrapperRef.current.clientWidth;
        const availableHeight = gameWrapperRef.current.clientHeight;

        if (availableWidth > 0 && availableHeight > 0) {
            const scaleX = availableWidth / GAME_WIDTH;
            const scaleY = availableHeight / GAME_HEIGHT;
            const newScale = Math.min(scaleX, scaleY);
            setScale(Math.max(0.1, newScale));
        }
      }
    };
    calculateScale();
    const resizeObserver = new ResizeObserver(calculateScale);
    if (gameWrapperRef.current) resizeObserver.observe(gameWrapperRef.current);
    return () => {
      if (gameWrapperRef.current) resizeObserver.unobserve(gameWrapperRef.current);
      resizeObserver.disconnect();
    };
  }, []);


  const resetGameState = useCallback((exitToMenu = false) => {
    setPlayer({
      id: 'player',
      x: GAME_WIDTH / 2 - PLAYER_SIZE / 2,
      y: GAME_HEIGHT / 2 - PLAYER_SIZE / 2,
      width: PLAYER_SIZE,
      height: PLAYER_SIZE,
      health: PLAYER_INITIAL_HEALTH,
    });
    setEnemies([]);
    setXpOrbs([]);
    setPlayerProjectiles([]);
    setEnemyProjectiles([]);
    setLaserSightLines([]);
    setFissureTraps([]);
    setScore(0);
    setWave(1);
    setWaveTimer(WAVE_DURATION);
    setIsShopPhase(false);
    setIsGameOver(false);
    setIsPaused(false);
    setPlayerXP(0);
    setIsPlayerTakingDamage(false);
    setPlayerWeapons([{...initialWeapon, upgradedThisRound: false}]);
    setShopOfferings([]);
    activeKeys.current.clear();
    lastLogicUpdateTimestampRef.current = 0;
    lastPlayerShotTimestampRef.current = {};
    isBossWaveActive.current = false;
    currentBossId.current = null;
    if (enemySpawnTimerId.current) clearInterval(enemySpawnTimerId.current);
    enemySpawnTimerId.current = null;

    if (exitToMenu && onExitToMenu) {
      onExitToMenu();
    }
  }, [onExitToMenu]);

  const generateShopOfferings = useCallback(() => {
    const purchasable = getPurchasableWeapons().filter(
      (shopWeapon) => shopWeapon.id !== initialWeapon.id
    );
    const weightedList: Weapon[] = [];
    purchasable.forEach(weapon => {
        let copies = 1;
        if (weapon.rarity === 'Comum') copies = 5;
        else if (weapon.rarity === 'Raro') copies = 2;
        else if (weapon.rarity === 'Lendária') copies = 1;
        for (let i = 0; i < copies; i++) weightedList.push(weapon);
    });
    const shuffled = weightedList.sort(() => 0.5 - Math.random());
    const uniqueWeaponIds = new Set<string>();
    const currentOfferings: Weapon[] = [];
    for (const weapon of shuffled) {
        if (currentOfferings.length < 3 && !uniqueWeaponIds.has(weapon.id) ) {
             uniqueWeaponIds.add(weapon.id);
             const freshShopWeapon = getWeaponById(weapon.id);
             if (freshShopWeapon) {
                currentOfferings.push({...freshShopWeapon, upgradedThisRound: false});
             }
        }
        if (currentOfferings.length >= 3) break;
    }
    setShopOfferings(currentOfferings);
  }, []);


  const handleBuyWeapon = (weaponToBuyOrUpgrade: Weapon) => {
    const existingWeaponIndex = playerWeapons.findIndex(pw => pw.id === weaponToBuyOrUpgrade.id);
    const isUpgrade = existingWeaponIndex !== -1;
    const shopOfferingIndex = shopOfferings.findIndex(so => so.id === weaponToBuyOrUpgrade.id);
    if (shopOfferingIndex === -1) return;
    const currentShopOffering = shopOfferings[shopOfferingIndex];
    if (currentShopOffering.upgradedThisRound) {
      toast({ title: "Já Interagido", description: "Você já comprou ou aprimorou esta oferta nesta rodada.", variant: "destructive" });
      return;
    }
    if (playerXP < weaponToBuyOrUpgrade.xpCost) {
      toast({ title: "XP Insuficiente", description: `Você precisa de ${weaponToBuyOrUpgrade.xpCost} XP.`, variant: "destructive" });
      return;
    }
    if (isUpgrade) {
      setPlayerWeapons(prevWeapons =>
        prevWeapons.map((weapon, index) => {
          if (index === existingWeaponIndex) {
            const upgradedWeapon = getWeaponById(weapon.id);
            if (!upgradedWeapon) return weapon;
            return {
              ...weapon,
              damage: Math.round(weapon.damage + (upgradedWeapon.damage * 0.2)),
              cooldown: Math.max(100, weapon.cooldown - (upgradedWeapon.cooldown * 0.05)),
            };
          }
          return weapon;
        })
      );
      setPlayerXP(prevXP => prevXP - weaponToBuyOrUpgrade.xpCost);
      toast({ title: "Arma Aprimorada!", description: `${weaponToBuyOrUpgrade.name} teve seus atributos melhorados.` });
    } else {
      if (playerWeapons.length >= MAX_PLAYER_WEAPONS) {
        toast({ title: "Inventário Cheio", description: "Você já possui o máximo de 5 armas.", variant: "destructive" });
        return;
      }
      setPlayerXP(prevXP => prevXP - weaponToBuyOrUpgrade.xpCost);
      const freshWeaponDefinition = getWeaponById(weaponToBuyOrUpgrade.id);
      if (freshWeaponDefinition) {
        setPlayerWeapons(prevWeapons => [...prevWeapons, {...freshWeaponDefinition, upgradedThisRound: false}]);
        toast({ title: "Arma Comprada!", description: `${freshWeaponDefinition.name} adicionada ao seu arsenal.` });
      } else {
        toast({ title: "Erro na Loja", description: `Não foi possível encontrar a definição da arma ${weaponToBuyOrUpgrade.name}.`, variant: "destructive" });
      }
    }
    setShopOfferings(prevOfferings =>
      prevOfferings.map((offering, index) =>
        index === shopOfferingIndex ? { ...offering, upgradedThisRound: true } : offering
      )
    );
  };

  const handleRecycleWeapon = (weaponIdToRecycle: string) => {
    if (playerWeapons.length <= 1) {
      toast({ title: "Não Pode Reciclar", description: "Você não pode reciclar sua última arma.", variant: "destructive" });
      return;
    }
    const weaponToRecycle = playerWeapons.find(w => w.id === weaponIdToRecycle);
    if (weaponToRecycle) {
      let xpGained = 0;
      if (weaponToRecycle.id === initialWeapon.id) {
        xpGained = INITIAL_WEAPON_RECYCLE_XP;
      } else {
        const baseWeapon = getWeaponById(weaponIdToRecycle);
        xpGained = Math.floor((baseWeapon?.xpCost || 0) * RECYCLE_XP_PERCENTAGE);
      }
      setPlayerXP(prevXP => prevXP + xpGained);
      setPlayerWeapons(prevWeapons => prevWeapons.filter(w => w.id !== weaponIdToRecycle));
      toast({ title: "Arma Reciclada!", description: `${weaponToRecycle.name} removida. +${xpGained} XP.` });
    }
  };

  useEffect(() => {
    if (deviceType === 'mobile') return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isGameOver) return;
      if (event.key.toLowerCase() === 'p') {
        setIsPaused(prev => !prev);
        return;
      }
      if (isPaused || isShopPhase) return;
      activeKeys.current.add(event.key.toLowerCase());
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (isGameOver || isPaused || isShopPhase) return;
      activeKeys.current.delete(event.key.toLowerCase());
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isGameOver, isPaused, isShopPhase, deviceType]);

  const handleMobileControl = (key: string, isPressed: boolean) => {
    if (isGameOver || isPaused || isShopPhase) return;
    if (isPressed) activeKeys.current.add(key);
    else activeKeys.current.delete(key);
  };

  useEffect(() => {
    if (isGameOver || isShopPhase || isPaused) return;
    let animationFrameId: number;
    const gameTick = (timestamp: number) => {
      if (isPaused) {
        animationFrameId = requestAnimationFrame(gameTick);
        return;
      }
      let inputDx = 0, inputDy = 0;
      if (activeKeys.current.has('arrowup') || activeKeys.current.has('w')) inputDy -= 1;
      if (activeKeys.current.has('arrowdown') || activeKeys.current.has('s')) inputDy += 1;
      if (activeKeys.current.has('arrowleft') || activeKeys.current.has('a')) inputDx -= 1;
      if (activeKeys.current.has('arrowright') || activeKeys.current.has('d')) inputDx += 1;

      if (inputDx !== 0 || inputDy !== 0) {
        let moveX, moveY;
        if (inputDx !== 0 && inputDy !== 0) {
            const length = Math.sqrt(inputDx * inputDx + inputDy * inputDy);
            moveX = (inputDx / length) * PLAYER_SPEED;
            moveY = (inputDy / length) * PLAYER_SPEED;
        } else {
            moveX = inputDx * PLAYER_SPEED;
            moveY = inputDy * PLAYER_SPEED;
        }
        setPlayer((p) => ({
          ...p,
          x: Math.max(0, Math.min(p.x + moveX, GAME_WIDTH - p.width)),
          y: Math.max(0, Math.min(p.y + moveY, GAME_HEIGHT - p.height)),
        }));
      }

      const now = Date.now();
      playerWeapons.forEach(weapon => {
        const lastShotTime = lastPlayerShotTimestampRef.current[weapon.id] || 0;
        if (enemiesRef.current.length > 0 && now - lastShotTime >= weapon.cooldown) {
          let closestEnemy: Enemy | null = null;
          let minDistanceSquared = weapon.range ** 2;
          const playerCenterX = playerRef.current.x + playerRef.current.width / 2;
          const playerCenterY = playerRef.current.y + playerRef.current.height / 2;

          for (const enemy of enemiesRef.current) {
            if (enemy.isDetonating || enemy.isAiming) continue;
            const enemyCenterX = enemy.x + enemy.width / 2;
            const enemyCenterY = enemy.y + enemy.height / 2;
            const distSq = (playerCenterX - enemyCenterX) ** 2 + (playerCenterY - enemyCenterY) ** 2;
            if (distSq < minDistanceSquared) {
              minDistanceSquared = distSq;
              closestEnemy = enemy;
            }
          }
          if (closestEnemy) {
            lastPlayerShotTimestampRef.current = { ...lastPlayerShotTimestampRef.current, [weapon.id]: now };
            const targetX = closestEnemy.x + closestEnemy.width / 2;
            const targetY = closestEnemy.y + closestEnemy.height / 2;
            const baseAngle = Math.atan2(targetY - playerCenterY, targetX - playerCenterX);
            const projectilesToSpawn: Omit<ProjectileData, 'id'>[] = [];
            let numProjectilesToFire = weapon.projectilesPerShot || 1;
            if (weapon.id === 'vibora_aco' && Math.random() < 0.25) numProjectilesToFire = 2;
            const spread = weapon.shotgunSpreadAngle ? weapon.shotgunSpreadAngle * (Math.PI / 180) : 0;

            for (let i = 0; i < numProjectilesToFire; i++) {
              let currentAngle = baseAngle;
              if (numProjectilesToFire > 1 && spread > 0) {
                currentAngle += (i - (numProjectilesToFire - 1) / 2) * (spread / (numProjectilesToFire > 1 ? numProjectilesToFire -1 : 1));
              }
              const projDx = Math.cos(currentAngle);
              const projDy = Math.sin(currentAngle);
              let damage = weapon.damage;
              let isCritical = false;
              if (weapon.criticalChance && Math.random() < weapon.criticalChance) {
                damage = Math.round(damage * (weapon.criticalMultiplier || 1.5));
                isCritical = true;
              }
              projectilesToSpawn.push({
                x: playerCenterX - (weapon.projectileType === 'knife' ? (PLAYER_SIZE * 0.5) / 2 : PLAYER_PROJECTILE_BASE_SIZE / 2) ,
                y: playerCenterY - (weapon.projectileType === 'knife' ? (PLAYER_SIZE * 1.5) / 2 : PLAYER_PROJECTILE_BASE_SIZE / 2) ,
                size: PLAYER_PROJECTILE_BASE_SIZE,
                width: weapon.projectileType === 'knife' ? PLAYER_SIZE * 0.5 : undefined,
                height: weapon.projectileType === 'knife' ? PLAYER_SIZE * 1.5 : undefined,
                dx: projDx, dy: projDy, damage: damage, traveledDistance: 0, maxRange: weapon.range,
                critical: isCritical, penetrationLeft: weapon.penetrationCount || 0,
                hitEnemyIds: new Set<string>(), projectileType: weapon.projectileType,
                originWeaponId: weapon.id, isEnemyProjectile: false,
              });
            }
            setPlayerProjectiles(prev => [...prev, ...projectilesToSpawn.map(p => ({...p, id: `proj_${Date.now()}_${Math.random()}`}))]);
          }
        }
      });

      if (timestamp - lastLogicUpdateTimestampRef.current >= ENEMY_MOVE_INTERVAL) {
        lastLogicUpdateTimestampRef.current = timestamp;
        let newPlayerProjectilesAfterHits: ProjectileData[] = [];
        const enemiesHitThisFrame = new Map<string, { damage: number, originWeaponId?: string }>();
        const xpOrbsFromKills: XPOrbData[] = [];
        let scoreFromKills = 0;

        setPlayerProjectiles(prevPlayerProjectiles => {
            newPlayerProjectilesAfterHits = prevPlayerProjectiles.map(proj => ({
                ...proj,
                x: proj.x + proj.dx * (proj.projectileType === 'knife' ? PLAYER_SPEED * 1.8 : ENEMY_PROJECTILE_SPEED),
                y: proj.y + proj.dy * (proj.projectileType === 'knife' ? PLAYER_SPEED * 1.8 : ENEMY_PROJECTILE_SPEED),
                traveledDistance: proj.traveledDistance + (proj.projectileType === 'knife' ? PLAYER_SPEED * 1.8 : ENEMY_PROJECTILE_SPEED),
            }));
            for (let i = newPlayerProjectilesAfterHits.length - 1; i >= 0; i--) {
                const proj = newPlayerProjectilesAfterHits[i];
                if (proj.x < -(proj.width || proj.size) || proj.x > GAME_WIDTH ||
                    proj.y < -(proj.height || proj.size) || proj.y > GAME_HEIGHT ||
                    proj.traveledDistance >= proj.maxRange) {
                    newPlayerProjectilesAfterHits.splice(i, 1);
                    continue;
                }
                for (let j = 0; j < enemiesRef.current.length; j++) {
                    const enemy = enemiesRef.current[j];
                    if (enemy.health <= 0 || (proj.hitEnemyIds.has(enemy.id) && proj.originWeaponId !== 'justica_ferro')) continue;
                    const projWidth = proj.width || proj.size;
                    const projHeight = proj.height || proj.size;
                    const projCenterX = proj.x + projWidth / 2;
                    const projCenterY = proj.y + projHeight / 2;
                    const enemyCenterX = enemy.x + enemy.width / 2;
                    const enemyCenterY = enemy.y + enemy.height / 2;

                    if (Math.abs(projCenterX - enemyCenterX) < (projWidth / 2 + enemy.width / 2) &&
                        Math.abs(projCenterY - enemyCenterY) < (projHeight / 2 + enemy.height / 2)) {
                        const existingHit = enemiesHitThisFrame.get(enemy.id) || { damage: 0 };
                        enemiesHitThisFrame.set(enemy.id, {
                            damage: existingHit.damage + proj.damage,
                            originWeaponId: proj.originWeaponId
                        });
                        proj.hitEnemyIds.add(enemy.id);
                        if (proj.penetrationLeft > 0) {
                            proj.penetrationLeft--;
                        } else {
                           newPlayerProjectilesAfterHits.splice(i, 1);
                           break;
                        }
                    }
                }
            }
            return newPlayerProjectilesAfterHits;
        });

        if (enemiesHitThisFrame.size > 0) {
            setEnemies(currentEnemies =>
                currentEnemies.map(enemy => {
                    if (enemiesHitThisFrame.has(enemy.id)) {
                        const hitData = enemiesHitThisFrame.get(enemy.id)!;
                        const damageTaken = hitData.damage;
                        const newHealth = enemy.health - damageTaken;

                        if (newHealth <= 0 && enemy.health > 0) {
                            if (enemy.xpValue > 0) {
                                xpOrbsFromKills.push({
                                    id: `xp_${Date.now()}_${Math.random()}_${enemy.id}`,
                                    x: enemy.x + enemy.width / 2 - XP_ORB_SIZE / 2,
                                    y: enemy.y + enemy.height / 2 - XP_ORB_SIZE / 2,
                                    size: XP_ORB_SIZE, value: enemy.xpValue
                                });
                            }
                            scoreFromKills += enemy.xpValue * (enemy.type.startsWith('Boss_') ? 20 : 5);

                            if (['AtiradorDeEliteMcGraw', 'Boss_CaptainMcGraw', 'Boss_DomGael', 'Boss_CalebHodge'].includes(enemy.type)) {
                                setLaserSightLines(prev => prev.filter(l => l.id !== enemy.id));
                            }
                            if (enemy.id === currentBossId.current) {
                                currentBossId.current = null;
                                isBossWaveActive.current = false;
                                toast({ title: `${enemy.type.replace('Boss_', '')} Derrotado!`, description: "A onda continua..."});
                            }
                        }
                        const vozDoTrovaoWeapon = playerWeapons.find(w => w.id === 'voz_trovao');
                        if (hitData.originWeaponId === 'voz_trovao' && vozDoTrovaoWeapon?.stunDuration) {
                           enemy.isStunned = true;
                           enemy.stunTimer = vozDoTrovaoWeapon.stunDuration;
                        }
                        return { ...enemy, health: newHealth };
                    }
                    return enemy;
                }).filter(enemy => enemy.health > 0)
            );
        }
        if (xpOrbsFromKills.length > 0) setXpOrbs(prevOrbs => [...prevOrbs, ...xpOrbsFromKills]);
        if (scoreFromKills > 0) setScore(prevScore => prevScore + scoreFromKills);

        setEnemyProjectiles(prevEnemyProjectiles => {
            const updatedProjectiles = prevEnemyProjectiles.map(proj => {
                if (proj.isBarrelOrDynamite && proj.hasLanded) {
                    return { ...proj, fuseTimer: (proj.fuseTimer || 0) - ENEMY_MOVE_INTERVAL };
                }
                let speed = ENEMY_PROJECTILE_SPEED;
                if (proj.projectileType === 'barrel_explosive') speed = BARREL_PROJECTILE_SPEED;
                else if (proj.projectileType === 'dynamite_explosive') speed = DYNAMITE_PROJECTILE_SPEED;

                const newX = proj.x + proj.dx * speed;
                const newY = proj.y + proj.dy * speed;
                let newTraveledDistance = proj.traveledDistance + speed;
                let landedThisTick = false;

                if (proj.isBarrelOrDynamite && !proj.hasLanded) {
                    if (proj.projectileType === 'barrel_explosive') {
                        const distToTargetSq = (newX - (proj.targetX_special || 0))**2 + (newY - (proj.targetY_special || 0))**2;
                        if (newTraveledDistance >= BARREL_MAX_TRAVEL_DISTANCE || distToTargetSq < (speed*speed) ) {
                           landedThisTick = true;
                        }
                    } else if (proj.projectileType === 'dynamite_explosive') {
                        if (newTraveledDistance >= DYNAMITE_MAX_TRAVEL_DISTANCE) {
                           landedThisTick = true;
                        }
                    }
                }

                return {
                    ...proj,
                    x: newX, y: newY, traveledDistance: newTraveledDistance,
                    hasLanded: proj.hasLanded || landedThisTick,
                    dx: landedThisTick ? 0 : proj.dx,
                    dy: landedThisTick ? 0 : proj.dy,
                    fuseTimer: landedThisTick ? (proj.projectileType === 'barrel_explosive' ? BARREL_FUSE_TIME : DYNAMITE_FUSE_TIME) : (proj.fuseTimer || 0),
                };
            });

            const remainingProjectiles: ProjectileData[] = [];
            for (const proj of updatedProjectiles) {
                let projectileConsumed = false;

                if (proj.isBarrelOrDynamite && proj.hasLanded && (proj.fuseTimer || 0) <= 0) {
                    projectileConsumed = true;
                    const playerCenterX = playerRef.current.x + playerRef.current.width / 2;
                    const playerCenterY = playerRef.current.y + playerRef.current.height / 2;
                    const explosiveCenterX = proj.x + proj.size / 2;
                    const explosiveCenterY = proj.y + proj.size / 2;
                    const distToPlayerSq = (playerCenterX - explosiveCenterX)**2 + (playerCenterY - explosiveCenterY)**2;
                    const explosionRadiusSq = proj.explosionRadiusSquared || (proj.projectileType === 'barrel_explosive' ? BARREL_EXPLOSION_RADIUS_SQUARED : DYNAMITE_EXPLOSION_RADIUS_SQUARED);

                    if (distToPlayerSq < explosionRadiusSq) {
                        setPlayer(p => {
                            const newHealth = Math.max(0, p.health - proj.damage);
                            if (newHealth < p.health && !isPlayerTakingDamage) {
                                setIsPlayerTakingDamage(true);
                                setTimeout(() => setIsPlayerTakingDamage(false), 200);
                            }
                            if (newHealth <= 0 && !isGameOver) setIsGameOver(true);
                            return { ...p, health: newHealth };
                        });
                    }
                }
                else if (!proj.isBarrelOrDynamite) { // Standard bullet
                    const projCenterX = proj.x + proj.size / 2;
                    const projCenterY = proj.y + proj.size / 2;
                    const playerCenterX = playerRef.current.x + playerRef.current.width / 2;
                    const playerCenterY = playerRef.current.y + playerRef.current.height / 2;
                    if (Math.abs(projCenterX - playerCenterX) < (proj.size / 2 + playerRef.current.width / 2) &&
                        Math.abs(projCenterY - playerCenterY) < (proj.size / 2 + playerRef.current.height / 2)) {
                        projectileConsumed = true;
                        setPlayer(p => {
                            const newHealth = Math.max(0, p.health - proj.damage);
                            if (newHealth < p.health && !isPlayerTakingDamage) {
                                setIsPlayerTakingDamage(true);
                                setTimeout(() => setIsPlayerTakingDamage(false), 200);
                            }
                            if (newHealth <= 0 && !isGameOver) setIsGameOver(true);
                            return { ...p, health: newHealth };
                        });
                    }
                }


                if (!projectileConsumed &&
                    proj.x > -proj.size && proj.x < GAME_WIDTH &&
                    proj.y > -proj.size && proj.y < GAME_HEIGHT &&
                    proj.traveledDistance < proj.maxRange) {
                    remainingProjectiles.push(proj);
                }
            }
            return remainingProjectiles;
        });

        setFissureTraps(currentTraps => {
            const updatedTraps: FissureTrapData[] = [];
            for (const trap of currentTraps) {
                const newRemainingDuration = trap.remainingDuration - ENEMY_MOVE_INTERVAL;
                if (newRemainingDuration <= 0) continue; // Skip if expired

                let updatedTrap = { ...trap, remainingDuration: newRemainingDuration };

                const playerLeft = playerRef.current.x;
                const playerRight = playerRef.current.x + playerRef.current.width;
                const playerTop = playerRef.current.y;
                const playerBottom = playerRef.current.y + playerRef.current.height;

                const trapLeft = trap.x;
                const trapRight = trap.x + trap.width;
                const trapTop = trap.y;
                const trapBottom = trap.y + trap.height;

                const isColliding = playerLeft < trapRight && playerRight > trapLeft &&
                                    playerTop < trapBottom && playerBottom > trapTop;

                if (isColliding && Date.now() - trap.lastDamageTickPlayer > FISSURE_PLAYER_DAMAGE_COOLDOWN) {
                    setPlayer(p => {
                        const newHealth = Math.max(0, p.health - FISSURE_TRAP_DAMAGE);
                        if (newHealth < p.health && !isPlayerTakingDamage) {
                            setIsPlayerTakingDamage(true);
                            setTimeout(() => setIsPlayerTakingDamage(false), 200);
                        }
                        if (newHealth <= 0 && !isGameOver) setIsGameOver(true);
                        return { ...p, health: newHealth };
                    });
                    updatedTrap.lastDamageTickPlayer = Date.now();
                }
                updatedTraps.push(updatedTrap);
            }
            return updatedTraps;
        });


        setEnemies(currentEnemies =>
          currentEnemies.map(enemy => {
            let updatedEnemy = {...enemy};
            if (updatedEnemy.isStunned && updatedEnemy.stunTimer && updatedEnemy.stunTimer > 0) {
              updatedEnemy.stunTimer -= ENEMY_MOVE_INTERVAL;
              if (updatedEnemy.stunTimer <= 0) {
                updatedEnemy.isStunned = false;
                updatedEnemy.stunTimer = 0;
              } else return updatedEnemy;
            }

            const playerCenterX = playerRef.current.x + playerRef.current.width / 2;
            const playerCenterY = playerRef.current.y + playerRef.current.height / 2;
            const enemyCenterX = updatedEnemy.x + updatedEnemy.width / 2;
            const enemyCenterY = updatedEnemy.y + updatedEnemy.height / 2;
            const deltaPlayerX = playerCenterX - enemyCenterX;
            const deltaPlayerY = playerCenterY - enemyCenterY;
            const distToPlayerSquared = deltaPlayerX * deltaPlayerX + deltaPlayerY * deltaPlayerY;
            const distToPlayer = Math.sqrt(distToPlayerSquared);


            if (updatedEnemy.type === 'Boss_CalebHodge') {
                updatedEnemy.dynamiteThrowCooldownTimer = Math.max(0, (updatedEnemy.dynamiteThrowCooldownTimer || 0) - ENEMY_MOVE_INTERVAL);
                updatedEnemy.fissureCreateCooldownTimer = Math.max(0, (updatedEnemy.fissureCreateCooldownTimer || 0) - ENEMY_MOVE_INTERVAL);

                const activeFissures = fissureTraps.length;
                if ((updatedEnemy.fissureCreateCooldownTimer || 0) <= 0 && activeFissures < ENEMY_CALEBHODGE_MAX_ACTIVE_FISSURES) {
                    let fissureX, fissureY, attempts = 0;
                    const maxAttempts = 10;
                    do {
                        // Spawn fissure somewhat near Caleb, but not on top. Random offset.
                        const angle = Math.random() * 2 * Math.PI;
                        const radius = 80 + Math.random() * 100; // 80 to 180px away
                        fissureX = enemyCenterX + Math.cos(angle) * radius - FISSURE_TRAP_WIDTH / 2;
                        fissureY = enemyCenterY + Math.sin(angle) * radius - FISSURE_TRAP_HEIGHT / 2;
                        attempts++;
                    } while (
                        (fissureX < 0 || fissureX + FISSURE_TRAP_WIDTH > GAME_WIDTH ||
                         fissureY < 0 || fissureY + FISSURE_TRAP_HEIGHT > GAME_HEIGHT) && attempts < maxAttempts
                    );

                    if (attempts < maxAttempts) { // Valid position found
                         setFissureTraps(prev => [...prev, {
                            id: `fissure_${Date.now()}_${Math.random()}`,
                            x: fissureX, y: fissureY,
                            width: FISSURE_TRAP_WIDTH, height: FISSURE_TRAP_HEIGHT,
                            remainingDuration: FISSURE_TRAP_DURATION,
                            lastDamageTickPlayer: 0
                        }]);
                    }
                    updatedEnemy.fissureCreateCooldownTimer = ENEMY_CALEBHODGE_FISSURE_CREATE_COOLDOWN + (Math.random() * 1000 - 500);
                }
                else if ((updatedEnemy.dynamiteThrowCooldownTimer || 0) <= 0 && distToPlayerSquared < updatedEnemy.attackRangeSquared) {
                    const angleToPlayer = Math.atan2(deltaPlayerY, deltaPlayerX);
                    setEnemyProjectiles(prev => [...prev, {
                        id: `eproj_dynamite_${Date.now()}_${Math.random()}`,
                        x: enemyCenterX - DYNAMITE_PROJECTILE_SIZE / 2,
                        y: enemyCenterY - DYNAMITE_PROJECTILE_SIZE / 2,
                        size: DYNAMITE_PROJECTILE_SIZE,
                        dx: Math.cos(angleToPlayer), dy: Math.sin(angleToPlayer),
                        damage: ENEMY_CALEBHODGE_DYNAMITE_DAMAGE,
                        traveledDistance: 0, maxRange: DYNAMITE_MAX_TRAVEL_DISTANCE,
                        projectileType: 'dynamite_explosive',
                        isBarrelOrDynamite: true, hasLanded: false, fuseTimer: DYNAMITE_FUSE_TIME,
                        explosionRadiusSquared: DYNAMITE_EXPLOSION_RADIUS_SQUARED,
                        hitEnemyIds: new Set(), penetrationLeft: 0, isEnemyProjectile: true,
                    }]);
                    updatedEnemy.dynamiteThrowCooldownTimer = ENEMY_CALEBHODGE_DYNAMITE_THROW_COOLDOWN + (Math.random() * 1000 - 500);
                }

                // Movement: try to keep a medium distance
                const idealDistSq = updatedEnemy.attackRangeSquared * 0.5;
                if (distToPlayerSquared < idealDistSq * 0.8) { // Too close, move away
                     if (distToPlayer > 0) {
                        updatedEnemy.x -= (deltaPlayerX / distToPlayer) * updatedEnemy.speed * 0.7;
                        updatedEnemy.y -= (deltaPlayerY / distToPlayer) * updatedEnemy.speed * 0.7;
                    }
                } else if (distToPlayerSquared > idealDistSq * 1.2) { // Too far, move closer
                    if (distToPlayer > 0) {
                        updatedEnemy.x += (deltaPlayerX / distToPlayer) * updatedEnemy.speed;
                        updatedEnemy.y += (deltaPlayerY / distToPlayer) * updatedEnemy.speed;
                    }
                }
                 updatedEnemy.x = Math.max(0, Math.min(updatedEnemy.x, GAME_WIDTH - updatedEnemy.width));
                 updatedEnemy.y = Math.max(0, Math.min(updatedEnemy.y, GAME_HEIGHT - updatedEnemy.height));
            }
            else if (updatedEnemy.type === 'Boss_DomGael') {
                updatedEnemy.attackCooldownTimer = Math.max(0, (updatedEnemy.attackCooldownTimer || 0) - ENEMY_MOVE_INTERVAL);
                updatedEnemy.dashCooldownTimer = Math.max(0, (updatedEnemy.dashCooldownTimer || 0) - ENEMY_MOVE_INTERVAL);
                updatedEnemy.allySpawnCooldownTimer = Math.max(0, (updatedEnemy.allySpawnCooldownTimer || 0) - ENEMY_MOVE_INTERVAL);
                updatedEnemy.modeSwitchCooldownTimer = Math.max(0, (updatedEnemy.modeSwitchCooldownTimer || 0) - ENEMY_MOVE_INTERVAL);

                if (updatedEnemy.isDashing && updatedEnemy.dashTimer && updatedEnemy.dashTimer > 0) {
                    updatedEnemy.dashTimer -= ENEMY_MOVE_INTERVAL;
                    const currentDashSpeed = updatedEnemy.speed * ENEMY_DOMGAEL_DASH_SPEED_MULTIPLIER;
                    updatedEnemy.x += (updatedEnemy.dashDx || 0) * currentDashSpeed;
                    updatedEnemy.y += (updatedEnemy.dashDy || 0) * currentDashSpeed;

                    updatedEnemy.x = Math.max(0, Math.min(updatedEnemy.x, GAME_WIDTH - updatedEnemy.width));
                    updatedEnemy.y = Math.max(0, Math.min(updatedEnemy.y, GAME_HEIGHT - updatedEnemy.height));

                    if (updatedEnemy.dashTimer <= 0) {
                        updatedEnemy.isDashing = false;
                    }
                } else { 
                    const activeAllies = enemiesRef.current.filter(e => e.type === 'DesertorGavilanes' || e.type === 'PistoleiroVagabundo').length;
                    if ((updatedEnemy.allySpawnCooldownTimer || 0) <= 0 && activeAllies < ENEMY_DOMGAEL_MAX_ACTIVE_ALLIES) {
                        const allyTypeToSpawn = Math.random() < 0.6 ? 'DesertorGavilanes' : 'PistoleiroVagabundo';
                        const ally = createEnemyInstance(allyTypeToSpawn, waveRef.current, playerRef.current);
                        if (ally) {
                            ally.x = updatedEnemy.x + (Math.random() * 60 - 30);
                            ally.y = updatedEnemy.y + (Math.random() * 60 - 30);
                            setEnemies(prev => [...prev, ally]);
                        }
                        updatedEnemy.allySpawnCooldownTimer = ENEMY_DOMGAEL_ALLY_SPAWN_COOLDOWN;
                    }
                    else if ((updatedEnemy.dashCooldownTimer || 0) <= 0) {
                        updatedEnemy.isDashing = true;
                        updatedEnemy.dashTimer = ENEMY_DOMGAEL_DASH_DURATION;
                        let dashAngle = Math.atan2(deltaPlayerY, deltaPlayerX) + (Math.PI / 2) * (Math.random() < 0.5 ? 1 : -1);
                        if (Math.random() < 0.3) dashAngle += Math.PI;
                        updatedEnemy.dashDx = Math.cos(dashAngle);
                        updatedEnemy.dashDy = Math.sin(dashAngle);
                        updatedEnemy.dashCooldownTimer = ENEMY_DOMGAEL_DASH_COOLDOWN;
                    }
                    else if ((updatedEnemy.modeSwitchCooldownTimer || 0) <= 0) {
                        let switchedMode = false;
                        if (distToPlayerSquared > ENEMY_DOMGAEL_PISTOL_ATTACK_RANGE_SQUARED * 0.8 && updatedEnemy.attackMode !== 'pistol') {
                            updatedEnemy.attackMode = 'pistol';
                            updatedEnemy.attackRangeSquared = ENEMY_DOMGAEL_PISTOL_ATTACK_RANGE_SQUARED;
                            updatedEnemy.attackCooldown = ENEMY_DOMGAEL_PISTOL_COOLDOWN;
                            updatedEnemy.damage = ENEMY_DOMGAEL_PISTOL_DAMAGE;
                            switchedMode = true;
                        } else if (distToPlayerSquared < ENEMY_DOMGAEL_KNIFE_ATTACK_RANGE_SQUARED * 1.2 && updatedEnemy.attackMode !== 'knife') {
                            updatedEnemy.attackMode = 'knife';
                            updatedEnemy.attackRangeSquared = ENEMY_DOMGAEL_KNIFE_ATTACK_RANGE_SQUARED;
                            updatedEnemy.attackCooldown = ENEMY_DOMGAEL_KNIFE_COOLDOWN;
                            updatedEnemy.damage = ENEMY_DOMGAEL_KNIFE_DAMAGE;
                            switchedMode = true;
                        }
                        if (switchedMode) {
                            updatedEnemy.modeSwitchCooldownTimer = ENEMY_DOMGAEL_MODE_SWITCH_COOLDOWN;
                            updatedEnemy.attackCooldownTimer = updatedEnemy.attackCooldown * 0.5;
                        }
                    }

                    if (!updatedEnemy.isDashing && (updatedEnemy.attackCooldownTimer || 0) <= 0 && distToPlayerSquared < updatedEnemy.attackRangeSquared) {
                        if (updatedEnemy.attackMode === 'pistol') {
                            const angleToPlayer = Math.atan2(deltaPlayerY, deltaPlayerX);
                            setEnemyProjectiles(prev => [...prev, {
                                id: `eproj_domgael_${Date.now()}_${Math.random()}`, x: enemyCenterX - ENEMY_PROJECTILE_SIZE / 2, y: enemyCenterY - ENEMY_PROJECTILE_SIZE / 2,
                                size: ENEMY_PROJECTILE_SIZE, dx: Math.cos(angleToPlayer), dy: Math.sin(angleToPlayer), damage: updatedEnemy.damage,
                                traveledDistance: 0, maxRange: updatedEnemy.attackRangeSquared, projectileType: 'enemy_bullet',
                                hitEnemyIds: new Set(), penetrationLeft: 0, isEnemyProjectile: true,
                            }]);
                        } else { 
                            setPlayer(p => {
                                const newHealth = Math.max(0, p.health - updatedEnemy.damage);
                                if (newHealth < p.health && !isPlayerTakingDamage) { setIsPlayerTakingDamage(true); setTimeout(() => setIsPlayerTakingDamage(false), 200); }
                                if (newHealth <= 0 && !isGameOver) setIsGameOver(true);
                                return { ...p, health: newHealth };
                            });
                        }
                        updatedEnemy.attackCooldownTimer = updatedEnemy.attackCooldown;
                    }
                    else if (!updatedEnemy.isDashing) { 
                        let targetX = playerCenterX;
                        let targetY = playerCenterY;
                        let currentSpeed = updatedEnemy.speed;

                        if (updatedEnemy.attackMode === 'pistol') {
                            const idealDist = Math.sqrt(updatedEnemy.attackRangeSquared) * 0.7;
                            if (distToPlayer < idealDist * 0.8) { 
                                targetX = enemyCenterX - deltaPlayerX; targetY = enemyCenterY - deltaPlayerY;
                            } else if (distToPlayer < idealDist * 0.5) { 
                                currentSpeed *= 1.5;
                                targetX = enemyCenterX - deltaPlayerX; targetY = enemyCenterY - deltaPlayerY;
                            }
                        }
                        const moveDx = targetX - enemyCenterX;
                        const moveDy = targetY - enemyCenterY;
                        const moveDist = Math.sqrt(moveDx*moveDx + moveDy*moveDy);
                        if (moveDist > (updatedEnemy.attackMode === 'knife' ? 5 : Math.sqrt(updatedEnemy.attackRangeSquared) * 0.1) ) { 
                             if (moveDist > 0) {
                                updatedEnemy.x += (moveDx / moveDist) * currentSpeed;
                                updatedEnemy.y += (moveDy / moveDist) * currentSpeed;
                            }
                        }
                    }
                }
                updatedEnemy.x = Math.max(0, Math.min(updatedEnemy.x, GAME_WIDTH - updatedEnemy.width));
                updatedEnemy.y = Math.max(0, Math.min(updatedEnemy.y, GAME_HEIGHT - updatedEnemy.height));
            }
            else if (updatedEnemy.type === 'Boss_BigDoyle') {
                updatedEnemy.attackCooldownTimer = Math.max(0, (updatedEnemy.attackCooldownTimer || 0) - ENEMY_MOVE_INTERVAL);
                updatedEnemy.barrelThrowCooldownTimer = Math.max(0, (updatedEnemy.barrelThrowCooldownTimer || 0) - ENEMY_MOVE_INTERVAL);

                if ((updatedEnemy.barrelThrowCooldownTimer || 0) <= 0 && distToPlayerSquared < ENEMY_BIGDOYLE_BARREL_THROW_RANGE_SQUARED) {
                    const barrelTargetX = playerCenterX;
                    const barrelTargetY = playerCenterY;
                    const angleToTarget = Math.atan2(barrelTargetY - enemyCenterY, barrelTargetX - enemyCenterX);

                    setEnemyProjectiles(prev => [...prev, {
                        id: `eproj_barrel_${Date.now()}_${Math.random()}`,
                        x: enemyCenterX - BARREL_PROJECTILE_SIZE / 2,
                        y: enemyCenterY - BARREL_PROJECTILE_SIZE / 2,
                        size: BARREL_PROJECTILE_SIZE,
                        dx: Math.cos(angleToTarget),
                        dy: Math.sin(angleToTarget),
                        damage: ENEMY_BIGDOYLE_BARREL_DAMAGE,
                        traveledDistance: 0,
                        maxRange: BARREL_MAX_TRAVEL_DISTANCE,
                        projectileType: 'barrel_explosive',
                        isBarrelOrDynamite: true,
                        hasLanded: false,
                        fuseTimer: BARREL_FUSE_TIME,
                        targetX_special: barrelTargetX,
                        targetY_special: barrelTargetY,
                        explosionRadiusSquared: BARREL_EXPLOSION_RADIUS_SQUARED,
                        hitEnemyIds: new Set(), penetrationLeft: 0, isEnemyProjectile: true,
                    }]);
                    updatedEnemy.barrelThrowCooldownTimer = ENEMY_BIGDOYLE_BARREL_THROW_COOLDOWN + (Math.random() * 1000 - 500);
                }
                else if ((updatedEnemy.attackCooldownTimer || 0) <= 0 && distToPlayerSquared < updatedEnemy.attackRangeSquared) {
                     setPlayer(p => {
                        const newHealth = Math.max(0, p.health - updatedEnemy.damage);
                        if (newHealth < p.health && !isPlayerTakingDamage) {
                            setIsPlayerTakingDamage(true);
                            setTimeout(() => setIsPlayerTakingDamage(false), 200);
                        }
                        if (newHealth <= 0 && !isGameOver) setIsGameOver(true);
                        return {...p, health: newHealth };
                    });
                    updatedEnemy.attackCooldownTimer = updatedEnemy.attackCooldown;
                }

                if (distToPlayerSquared > (updatedEnemy.width / 2 + playerRef.current.width / 2 + 5)**2) {
                    const dist = Math.sqrt(distToPlayerSquared);
                    if (dist > 0) {
                        updatedEnemy.x += (deltaPlayerX / dist) * updatedEnemy.speed;
                        updatedEnemy.y += (deltaPlayerY / dist) * updatedEnemy.speed;
                    }
                }
            } else if (updatedEnemy.type === 'Boss_CaptainMcGraw') {
                updatedEnemy.attackCooldownTimer = Math.max(0, (updatedEnemy.attackCooldownTimer || 0) - ENEMY_MOVE_INTERVAL);
                updatedEnemy.droneSpawnCooldownTimer = Math.max(0, (updatedEnemy.droneSpawnCooldownTimer || 0) - ENEMY_MOVE_INTERVAL);

                if (updatedEnemy.isAiming) {
                    updatedEnemy.aimingTimer! -= ENEMY_MOVE_INTERVAL;
                    setLaserSightLines(prev => prev.map(l => l.id === updatedEnemy.id ? { ...l, x2: playerCenterX, y2: playerCenterY } : l));
                    if (updatedEnemy.aimingTimer! <= 0) {
                        const angleToPlayer = Math.atan2(playerCenterY - enemyCenterY, playerCenterX - enemyCenterX);
                        setEnemyProjectiles(prev => [...prev, {
                            id: `eproj_captmcgraw_${Date.now()}_${Math.random()}`, x: enemyCenterX - ENEMY_PROJECTILE_SIZE / 2, y: enemyCenterY - ENEMY_PROJECTILE_SIZE / 2,
                            size: ENEMY_PROJECTILE_SIZE, dx: Math.cos(angleToPlayer), dy: Math.sin(angleToPlayer), damage: updatedEnemy.damage,
                            traveledDistance: 0, maxRange: updatedEnemy.attackRangeSquared, projectileType: 'enemy_bullet',
                            hitEnemyIds: new Set(), penetrationLeft: 0, isEnemyProjectile: true,
                        }]);
                        updatedEnemy.isAiming = false;
                        updatedEnemy.attackCooldownTimer = ENEMY_CAPTAINMCGRAW_RIFLE_ATTACK_COOLDOWN;
                        setLaserSightLines(prev => prev.filter(l => l.id !== updatedEnemy.id));
                    }
                } else {
                    const currentDrones = enemiesRef.current.filter(e => e.type === 'PatrolDrone').length;
                    if ((updatedEnemy.droneSpawnCooldownTimer || 0) <= 0 && currentDrones < ENEMY_CAPTAINMCGRAW_MAX_ACTIVE_DRONES) {
                        const drone = createEnemyInstance('PatrolDrone', waveRef.current, playerRef.current);
                        if (drone) {
                            drone.x = updatedEnemy.x + (Math.random() * updatedEnemy.width - updatedEnemy.width / 2);
                            drone.y = updatedEnemy.y + (Math.random() * updatedEnemy.height - updatedEnemy.height / 2);
                            setEnemies(prev => [...prev, drone]);
                        }
                        updatedEnemy.droneSpawnCooldownTimer = ENEMY_CAPTAINMCGRAW_DRONE_SPAWN_COOLDOWN;
                    }
                    else if ((updatedEnemy.attackCooldownTimer || 0) <= 0 && distToPlayerSquared < updatedEnemy.attackRangeSquared) {
                        updatedEnemy.isAiming = true;
                        updatedEnemy.aimingTimer = ENEMY_CAPTAINMCGRAW_RIFLE_TELEGRAPH_DURATION;
                        setLaserSightLines(prev => [...prev.filter(l => l.id !== updatedEnemy.id), { id: updatedEnemy.id, x1: enemyCenterX, y1: enemyCenterY, x2: playerCenterX, y2: playerCenterY }]);
                    }
                }
                const idealDistSq = updatedEnemy.attackRangeSquared * 0.8;
                if (distToPlayerSquared < idealDistSq * 0.7) {
                    const dist = Math.sqrt(distToPlayerSquared);
                    if (dist > 0) {
                        updatedEnemy.x -= (deltaPlayerX / dist) * updatedEnemy.speed;
                        updatedEnemy.y -= (deltaPlayerY / dist) * updatedEnemy.speed;
                    }
                } else if (distToPlayerSquared > idealDistSq * 1.3 && !updatedEnemy.isAiming) {
                    const dist = Math.sqrt(distToPlayerSquared);
                     if (dist > 0) {
                        updatedEnemy.x += (deltaPlayerX / dist) * updatedEnemy.speed * 0.5;
                        updatedEnemy.y += (deltaPlayerY / dist) * updatedEnemy.speed * 0.5;
                    }
                }
            }
            else if (updatedEnemy.type === 'AtiradorDeEliteMcGraw') {
                if (updatedEnemy.isAiming) {
                    updatedEnemy.aimingTimer! -= ENEMY_MOVE_INTERVAL;
                    setLaserSightLines(prev => prev.map(l => l.id === updatedEnemy.id ? { ...l, x2: playerCenterX, y2: playerCenterY } : l));
                    if (updatedEnemy.aimingTimer! <= 0) {
                        const angleToPlayer = Math.atan2(playerCenterY - enemyCenterY, playerCenterX - enemyCenterX);
                        setEnemyProjectiles(prev => [...prev, {
                            id: `eproj_mcgraw_${Date.now()}_${Math.random()}`, x: enemyCenterX - ENEMY_PROJECTILE_SIZE / 2, y: enemyCenterY - ENEMY_PROJECTILE_SIZE / 2,
                            size: ENEMY_PROJECTILE_SIZE, dx: Math.cos(angleToPlayer), dy: Math.sin(angleToPlayer), damage: updatedEnemy.damage,
                            traveledDistance: 0, maxRange: updatedEnemy.attackRangeSquared, projectileType: 'enemy_bullet',
                            hitEnemyIds: new Set(), penetrationLeft: 0, isEnemyProjectile: true,
                        }]);
                        updatedEnemy.isAiming = false; updatedEnemy.attackCooldownTimer = updatedEnemy.attackCooldown;
                        setLaserSightLines(prev => prev.filter(l => l.id !== updatedEnemy.id));
                    }
                } else {
                    updatedEnemy.attackCooldownTimer = Math.max(0, (updatedEnemy.attackCooldownTimer || 0) - ENEMY_MOVE_INTERVAL);
                    if (distToPlayerSquared < updatedEnemy.attackRangeSquared && (updatedEnemy.attackCooldownTimer || 0) <= 0) {
                        updatedEnemy.isAiming = true; updatedEnemy.aimingTimer = ENEMY_MCGRAW_TELEGRAPH_DURATION;
                        setLaserSightLines(prev => [...prev.filter(l => l.id !== updatedEnemy.id), { id: updatedEnemy.id, x1: enemyCenterX, y1: enemyCenterY, x2: playerCenterX, y2: playerCenterY }]);
                    } else {
                        if (distToPlayerSquared > updatedEnemy.attackRangeSquared * 0.9) {
                            const dist = Math.sqrt(distToPlayerSquared); if (dist > 0) { updatedEnemy.x += (deltaPlayerX / dist) * updatedEnemy.speed; updatedEnemy.y += (deltaPlayerY / dist) * updatedEnemy.speed; }
                        } else if (distToPlayerSquared < updatedEnemy.attackRangeSquared * 0.3) {
                            const dist = Math.sqrt(distToPlayerSquared); if (dist > 0) { updatedEnemy.x -= (deltaPlayerX / dist) * updatedEnemy.speed * 0.5; updatedEnemy.y -= (deltaPlayerY / dist) * updatedEnemy.speed * 0.5; }
                        }
                    }
                }
            } else if (updatedEnemy.type === 'DesertorGavilanes') {
                if (updatedEnemy.isBursting) {
                    updatedEnemy.burstTimer! -= ENEMY_MOVE_INTERVAL;
                    if (updatedEnemy.burstTimer! <= 0 && updatedEnemy.burstShotsLeft! > 0) {
                        const angleToPlayer = Math.atan2(deltaPlayerY, deltaPlayerX);
                        setEnemyProjectiles(prev => [...prev, {
                            id: `eproj_desertor_${Date.now()}_${Math.random()}`, x: enemyCenterX - ENEMY_PROJECTILE_SIZE / 2, y: enemyCenterY - ENEMY_PROJECTILE_SIZE / 2,
                            size: ENEMY_PROJECTILE_SIZE, dx: Math.cos(angleToPlayer), dy: Math.sin(angleToPlayer), damage: updatedEnemy.damage,
                            traveledDistance: 0, maxRange: updatedEnemy.attackRangeSquared, projectileType: 'enemy_bullet',
                            hitEnemyIds: new Set(), penetrationLeft: 0, isEnemyProjectile: true,
                        }]);
                        updatedEnemy.burstShotsLeft!--; updatedEnemy.burstTimer = ENEMY_DESERTOR_BURST_DELAY;
                    }
                    if (updatedEnemy.burstShotsLeft === 0) { updatedEnemy.isBursting = false; updatedEnemy.attackCooldownTimer = updatedEnemy.attackCooldown; }
                } else {
                    updatedEnemy.attackCooldownTimer = Math.max(0, (updatedEnemy.attackCooldownTimer || 0) - ENEMY_MOVE_INTERVAL);
                     if (distToPlayerSquared > updatedEnemy.attackRangeSquared * 0.7 || distToPlayerSquared < ENEMY_PISTOLEIRO_MELEE_RANGE_SQUARED * 0.8) {
                         if (distToPlayerSquared > (updatedEnemy.width / 2 + playerRef.current.width / 2) ** 2) {
                            const dist = Math.sqrt(distToPlayerSquared); if (dist > 0) { updatedEnemy.x += (deltaPlayerX / dist) * updatedEnemy.speed; updatedEnemy.y += (deltaPlayerY / dist) * updatedEnemy.speed; } }
                    }
                    if (distToPlayerSquared < updatedEnemy.attackRangeSquared && (updatedEnemy.attackCooldownTimer || 0) <= 0) {
                        updatedEnemy.isBursting = true; updatedEnemy.burstShotsLeft = ENEMY_DESERTOR_SHOTS_IN_BURST; updatedEnemy.burstTimer = 0;
                    }
                }
            } else if (updatedEnemy.type === 'SabotadorDoCanyon') {
                if (updatedEnemy.isDetonating) {
                    updatedEnemy.detonationTimer! -= ENEMY_MOVE_INTERVAL;
                    if (updatedEnemy.detonationTimer! <= 0) {
                        if (distToPlayerSquared < ENEMY_SABOTADOR_EXPLOSION_RADIUS_SQUARED) {
                            setPlayer(p => {
                                const newHealth = Math.max(0, p.health - updatedEnemy.damage);
                                if (newHealth < p.health && !isPlayerTakingDamage) { setIsPlayerTakingDamage(true); setTimeout(() => setIsPlayerTakingDamage(false), 200); }
                                if (newHealth <= 0 && !isGameOver) setIsGameOver(true);
                                return { ...p, health: newHealth };
                            });
                        }
                        updatedEnemy.health = 0;
                    }
                } else {
                    if (distToPlayerSquared < ENEMY_SABOTADOR_DETONATION_RANGE_SQUARED) {
                        updatedEnemy.isDetonating = true; updatedEnemy.detonationTimer = ENEMY_SABOTADOR_DETONATION_TIMER_DURATION;
                    }
                }
                if (!updatedEnemy.isDetonating && updatedEnemy.health > 0) {
                     const dist = Math.sqrt(distToPlayerSquared);
                     if (dist > (updatedEnemy.width / 2 + playerRef.current.width / 2) / 2 && dist > 0) {
                        updatedEnemy.x += (deltaPlayerX / dist) * updatedEnemy.speed; updatedEnemy.y += (deltaPlayerY / dist) * updatedEnemy.speed; }
                }
            } else if (updatedEnemy.type === 'PistoleiroVagabundo') {
                 updatedEnemy.attackCooldownTimer = Math.max(0, (updatedEnemy.attackCooldownTimer || 0) - ENEMY_MOVE_INTERVAL);
                 if (distToPlayerSquared > updatedEnemy.attackRangeSquared * 0.7 || distToPlayerSquared < ENEMY_PISTOLEIRO_MELEE_RANGE_SQUARED * 0.8) {
                     if (distToPlayerSquared > (updatedEnemy.width / 2 + playerRef.current.width / 2) ** 2) {
                        const dist = Math.sqrt(distToPlayerSquared); if (dist > 0) { updatedEnemy.x += (deltaPlayerX / dist) * updatedEnemy.speed; updatedEnemy.y += (deltaPlayerY / dist) * updatedEnemy.speed; } }
                }
                if ((updatedEnemy.attackCooldownTimer || 0) <= 0 && distToPlayerSquared < updatedEnemy.attackRangeSquared && distToPlayerSquared > ENEMY_PISTOLEIRO_MELEE_RANGE_SQUARED * 0.5 ) {
                    const angleToPlayer = Math.atan2(deltaPlayerY, deltaPlayerX);
                    setEnemyProjectiles(prev => [...prev, {
                        id: `eproj_${Date.now()}_${Math.random()}`, x: enemyCenterX - ENEMY_PROJECTILE_SIZE / 2, y: enemyCenterY - ENEMY_PROJECTILE_SIZE / 2,
                        size: ENEMY_PROJECTILE_SIZE, dx: Math.cos(angleToPlayer), dy: Math.sin(angleToPlayer), damage: updatedEnemy.damage,
                        traveledDistance: 0, maxRange: updatedEnemy.attackRangeSquared, projectileType: 'enemy_bullet',
                        hitEnemyIds: new Set(), penetrationLeft: 0, isEnemyProjectile: true,
                    }]);
                    updatedEnemy.attackCooldownTimer = updatedEnemy.attackCooldown;
                }
            } else if (updatedEnemy.type === 'VigiaDaFerrovia') {
                updatedEnemy.attackCooldownTimer = Math.max(0, (updatedEnemy.attackCooldownTimer || 0) - ENEMY_MOVE_INTERVAL);
                 if (distToPlayerSquared < updatedEnemy.attackRangeSquared) {
                    if ((updatedEnemy.attackCooldownTimer || 0) <= 0) {
                        const angleToPlayer = Math.atan2(deltaPlayerY, deltaPlayerX);
                        setEnemyProjectiles(prev => [...prev, {
                            id: `eproj_vigia_${Date.now()}_${Math.random()}`, x: enemyCenterX - ENEMY_PROJECTILE_SIZE / 2, y: enemyCenterY - ENEMY_PROJECTILE_SIZE / 2,
                            size: ENEMY_PROJECTILE_SIZE, dx: Math.cos(angleToPlayer), dy: Math.sin(angleToPlayer), damage: updatedEnemy.damage,
                            traveledDistance: 0, maxRange: updatedEnemy.attackRangeSquared, projectileType: 'enemy_bullet',
                             hitEnemyIds: new Set(), penetrationLeft: 0, isEnemyProjectile: true,
                        }]);
                        updatedEnemy.attackCooldownTimer = updatedEnemy.attackCooldown;
                    }
                } else {
                    if (distToPlayerSquared > (updatedEnemy.width / 2 + playerRef.current.width / 2) ** 2) {
                        const dist = Math.sqrt(distToPlayerSquared); if (dist > 0) { updatedEnemy.x += (deltaPlayerX / dist) * updatedEnemy.speed; updatedEnemy.y += (deltaPlayerY / dist) * updatedEnemy.speed; } }
                }
            } else { 
                 updatedEnemy.attackCooldownTimer = Math.max(0, (updatedEnemy.attackCooldownTimer || 0) - ENEMY_MOVE_INTERVAL);
                 if ((updatedEnemy.attackCooldownTimer || 0) <= 0 && distToPlayerSquared < updatedEnemy.attackRangeSquared) {
                   setPlayer(p => {
                     const newHealth = Math.max(0, p.health - updatedEnemy.damage);
                     if (newHealth < p.health && !isPlayerTakingDamage) { setIsPlayerTakingDamage(true); setTimeout(() => setIsPlayerTakingDamage(false), 200); }
                     if (newHealth <= 0 && !isGameOver) setIsGameOver(true);
                     return {...p, health: newHealth };
                   });
                   updatedEnemy.attackCooldownTimer = updatedEnemy.attackCooldown;
                } else if (distToPlayerSquared > (updatedEnemy.width / 2 + playerRef.current.width / 2) ** 2) {
                    const dist = Math.sqrt(distToPlayerSquared); if (dist > 0) { updatedEnemy.x += (deltaPlayerX / dist) * updatedEnemy.speed; updatedEnemy.y += (deltaPlayerY / dist) * updatedEnemy.speed; } }
                }
            return updatedEnemy;
          }).filter(enemy => enemy.health > 0)
        );

        setXpOrbs((currentOrbs) => {
          const collectedOrbValues: number[] = [];
          const remainingOrbs = currentOrbs.filter((orb) => {
            const distX = (playerRef.current.x + playerRef.current.width / 2) - (orb.x + orb.size / 2);
            const distY = (playerRef.current.y + playerRef.current.height / 2) - (orb.y + orb.size / 2);
            if (distX * distX + distY * distY < XP_COLLECTION_RADIUS_SQUARED) {
              collectedOrbValues.push(orb.value); return false;
            } return true;
          });
          if (collectedOrbValues.length > 0) setPlayerXP((prevXP) => prevXP + collectedOrbValues.reduce((s, v) => s + v, 0));
          return remainingOrbs;
        });
      }

      if (playerRef.current.health <= 0 && !isGameOver) setIsGameOver(true);
      if (!isGameOver && !isShopPhase && !isPaused) animationFrameId = requestAnimationFrame(gameTick);
    };
    animationFrameId = requestAnimationFrame(gameTick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isGameOver, isShopPhase, isPaused, playerWeapons, toast, generateShopOfferings, isPlayerTakingDamage, createEnemyInstance, fissureTraps]);


  useEffect(() => {
    if (isGameOver || isShopPhase || isPaused) {
      if (waveIntervalId.current) clearInterval(waveIntervalId.current);
      return;
    }
    waveIntervalId.current = setInterval(() => {
      setWaveTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(waveIntervalId.current!);
          setXpOrbs(currentXpOrbs => {
            if (currentXpOrbs.length > 0) setPlayerXP(pXP => pXP + currentXpOrbs.reduce((s, o) => s + o.value, 0));
            return [];
          });
          setIsShopPhase(true);
          generateShopOfferings();
          if(enemySpawnTimerId.current) clearInterval(enemySpawnTimerId.current);
          enemySpawnTimerId.current = null;
          setFissureTraps([]); // Clear fissures at end of wave
          return WAVE_DURATION;
        }
        return prevTimer - 1;
      });
    }, 1000);
    return () => { if (waveIntervalId.current) clearInterval(waveIntervalId.current); };
  }, [isGameOver, isShopPhase, isPaused, generateShopOfferings]);


  const createEnemyInstance = useCallback((
    type: EnemyType,
    currentWave: number,
    currentPlayer: Player
  ): Enemy | null => {
    let enemyBaseSize: number, enemyInitialHealth: number, enemyBaseSpeed: number,
        enemyDamageVal: number, enemyXpVal: number, enemyAtkRangeSq: number,
        enemyAtkCooldown: number, enemyIsDetonating = false, enemyDetonationTimer = 0,
        enemyIsAiming = false, enemyAimingTimer = 0, enemyIsBursting = false,
        enemyBurstShotsLeft = 0, enemyBurstTimer = 0, enemyBarrelThrowCooldownTimer = 0,
        enemyDroneSpawnCooldownTimer = 0, enemyAttackMode: 'pistol' | 'knife' | undefined = undefined,
        enemyDashCooldownTimer = 0, enemyAllySpawnCooldownTimer = 0, enemyModeSwitchCooldownTimer = 0,
        enemyDynamiteThrowCooldownTimer = 0, enemyFissureCreateCooldownTimer = 0;

    let finalHealth: number, finalSpeed: number, finalXpValue: number;


    switch (type) {
        case 'ArruaceiroSaloon':
            enemyBaseSize = ENEMY_ARROCEIRO_SIZE; enemyInitialHealth = ENEMY_ARROCEIRO_INITIAL_HEALTH;
            enemyBaseSpeed = ENEMY_ARROCEIRO_BASE_SPEED; enemyDamageVal = ENEMY_ARROCEIRO_DAMAGE;
            enemyXpVal = ENEMY_ARROCEIRO_XP_VALUE; enemyAtkRangeSq = ENEMY_ARROCEIRO_ATTACK_RANGE_SQUARED;
            enemyAtkCooldown = ENEMY_ARROCEIRO_ATTACK_COOLDOWN; break;
        case 'Cão de Fazenda':
            enemyBaseSize = ENEMY_CAODEFAZENDA_SIZE; enemyInitialHealth = ENEMY_CAODEFAZENDA_INITIAL_HEALTH;
            enemyBaseSpeed = ENEMY_CAODEFAZENDA_BASE_SPEED; enemyDamageVal = ENEMY_CAODEFAZENDA_DAMAGE;
            enemyXpVal = ENEMY_CAODEFAZENDA_XP_VALUE; enemyAtkRangeSq = ENEMY_CAODEFAZENDA_ATTACK_RANGE_SQUARED;
            enemyAtkCooldown = ENEMY_CAODEFAZENDA_ATTACK_COOLDOWN; break;
        case 'PistoleiroVagabundo':
            enemyBaseSize = ENEMY_PISTOLEIRO_SIZE; enemyInitialHealth = ENEMY_PISTOLEIRO_INITIAL_HEALTH;
            enemyBaseSpeed = ENEMY_PISTOLEiro_BASE_SPEED; enemyDamageVal = ENEMY_PISTOLEIRO_DAMAGE;
            enemyXpVal = ENEMY_PISTOLEIRO_XP_VALUE; enemyAtkRangeSq = ENEMY_PISTOLEIRO_ATTACK_RANGE_SQUARED;
            enemyAtkCooldown = ENEMY_PISTOLEIRO_ATTACK_COOLDOWN; break;
        case 'MineradorRebelde':
            enemyBaseSize = ENEMY_MINERADOR_SIZE; enemyInitialHealth = ENEMY_MINERADOR_INITIAL_HEALTH;
            enemyBaseSpeed = ENEMY_MINERADOR_BASE_SPEED; enemyDamageVal = ENEMY_MINERADOR_DAMAGE;
            enemyXpVal = ENEMY_MINERADOR_XP_VALUE; enemyAtkRangeSq = ENEMY_MINERADOR_ATTACK_RANGE_SQUARED;
            enemyAtkCooldown = ENEMY_MINERADOR_ATTACK_COOLDOWN; break;
        case 'VigiaDaFerrovia':
            enemyBaseSize = ENEMY_VIGIA_SIZE; enemyInitialHealth = ENEMY_VIGIA_INITIAL_HEALTH;
            enemyBaseSpeed = ENEMY_VIGIA_BASE_SPEED; enemyDamageVal = ENEMY_VIGIA_DAMAGE;
            enemyXpVal = ENEMY_VIGIA_XP_VALUE; enemyAtkRangeSq = ENEMY_VIGIA_ATTACK_RANGE_SQUARED;
            enemyAtkCooldown = ENEMY_VIGIA_ATTACK_COOLDOWN; break;
        case 'BrutoBoyle':
            enemyBaseSize = ENEMY_BRUTOBOYLE_SIZE; enemyInitialHealth = ENEMY_BRUTOBOYLE_INITIAL_HEALTH;
            enemyBaseSpeed = ENEMY_BRUTOBOYLE_BASE_SPEED; enemyDamageVal = ENEMY_BRUTOBOYLE_DAMAGE;
            enemyXpVal = ENEMY_BRUTOBOYLE_XP_VALUE; enemyAtkRangeSq = ENEMY_BRUTOBOYLE_ATTACK_RANGE_SQUARED;
            enemyAtkCooldown = ENEMY_BRUTOBOYLE_ATTACK_COOLDOWN; break;
        case 'SabotadorDoCanyon':
            enemyBaseSize = ENEMY_SABOTADOR_SIZE; enemyInitialHealth = ENEMY_SABOTADOR_INITIAL_HEALTH;
            enemyBaseSpeed = ENEMY_SABOTADOR_BASE_SPEED; enemyDamageVal = ENEMY_SABOTADOR_DAMAGE;
            enemyXpVal = ENEMY_SABOTADOR_XP_VALUE; enemyAtkRangeSq = ENEMY_SABOTADOR_DETONATION_RANGE_SQUARED;
            enemyAtkCooldown = ENEMY_SABOTADOR_DETONATION_TIMER_DURATION; enemyIsDetonating = false; enemyDetonationTimer = 0; break;
        case 'AtiradorDeEliteMcGraw':
            enemyBaseSize = ENEMY_MCGRAW_SIZE; enemyInitialHealth = ENEMY_MCGRAW_INITIAL_HEALTH;
            enemyBaseSpeed = ENEMY_MCGRAW_BASE_SPEED; enemyDamageVal = ENEMY_MCGRAW_DAMAGE;
            enemyXpVal = ENEMY_MCGRAW_XP_VALUE; enemyAtkRangeSq = ENEMY_MCGRAW_ATTACK_RANGE_SQUARED;
            enemyAtkCooldown = ENEMY_MCGRAW_ATTACK_COOLDOWN; enemyIsAiming = false; enemyAimingTimer = 0; break;
        case 'DesertorGavilanes':
            enemyBaseSize = ENEMY_DESERTOR_SIZE; enemyInitialHealth = ENEMY_DESERTOR_INITIAL_HEALTH;
            enemyBaseSpeed = ENEMY_DESERTOR_BASE_SPEED; enemyDamageVal = ENEMY_DESERTOR_DAMAGE;
            enemyXpVal = ENEMY_DESERTOR_XP_VALUE; enemyAtkRangeSq = ENEMY_DESERTOR_ATTACK_RANGE_SQUARED;
            enemyAtkCooldown = ENEMY_DESERTOR_ATTACK_COOLDOWN; enemyIsBursting = false; enemyBurstShotsLeft = 0; enemyBurstTimer = 0; break;
        case 'Boss_BigDoyle':
            enemyBaseSize = ENEMY_BIGDOYLE_SIZE; enemyInitialHealth = ENEMY_BIGDOYLE_INITIAL_HEALTH;
            enemyBaseSpeed = ENEMY_BIGDOYLE_BASE_SPEED; enemyDamageVal = ENEMY_BIGDOYLE_MELEE_DAMAGE;
            enemyXpVal = ENEMY_BIGDOYLE_XP_VALUE; enemyAtkRangeSq = ENEMY_BIGDOYLE_MELEE_ATTACK_RANGE_SQUARED;
            enemyAtkCooldown = ENEMY_BIGDOYLE_MELEE_ATTACK_COOLDOWN;
            enemyBarrelThrowCooldownTimer = ENEMY_BIGDOYLE_BARREL_THROW_COOLDOWN * (0.5 + Math.random() * 0.5);
            break;
        case 'Boss_CaptainMcGraw':
            enemyBaseSize = ENEMY_CAPTAINMCGRAW_SIZE; enemyInitialHealth = ENEMY_CAPTAINMCGRAW_INITIAL_HEALTH;
            enemyBaseSpeed = ENEMY_CAPTAINMCGRAW_BASE_SPEED; enemyDamageVal = ENEMY_CAPTAINMCGRAW_RIFLE_DAMAGE;
            enemyXpVal = ENEMY_CAPTAINMCGRAW_XP_VALUE; enemyAtkRangeSq = ENEMY_CAPTAINMCGRAW_RIFLE_ATTACK_RANGE_SQUARED;
            enemyAtkCooldown = ENEMY_CAPTAINMCGRAW_RIFLE_ATTACK_COOLDOWN;
            enemyIsAiming = false; enemyAimingTimer = 0;
            enemyDroneSpawnCooldownTimer = ENEMY_CAPTAINMCGRAW_DRONE_SPAWN_COOLDOWN * (0.3 + Math.random() * 0.4);
            break;
        case 'Boss_DomGael':
            enemyBaseSize = ENEMY_DOMGAEL_SIZE; enemyInitialHealth = ENEMY_DOMGAEL_INITIAL_HEALTH;
            enemyBaseSpeed = ENEMY_DOMGAEL_BASE_SPEED; enemyDamageVal = ENEMY_DOMGAEL_PISTOL_DAMAGE; 
            enemyXpVal = ENEMY_DOMGAEL_XP_VALUE; enemyAtkRangeSq = ENEMY_DOMGAEL_PISTOL_ATTACK_RANGE_SQUARED; 
            enemyAtkCooldown = ENEMY_DOMGAEL_PISTOL_COOLDOWN; 
            enemyAttackMode = 'pistol';
            enemyDashCooldownTimer = ENEMY_DOMGAEL_DASH_COOLDOWN * (0.2 + Math.random() * 0.8);
            enemyAllySpawnCooldownTimer = ENEMY_DOMGAEL_ALLY_SPAWN_COOLDOWN * (0.5 + Math.random() * 0.5);
            enemyModeSwitchCooldownTimer = 0;
            break;
        case 'Boss_CalebHodge':
            enemyBaseSize = ENEMY_CALEBHODGE_SIZE; enemyInitialHealth = ENEMY_CALEBHODGE_INITIAL_HEALTH;
            enemyBaseSpeed = ENEMY_CALEBHODGE_BASE_SPEED; enemyDamageVal = ENEMY_CALEBHODGE_DYNAMITE_DAMAGE; // Dynamite damage, fissure separate
            enemyXpVal = ENEMY_CALEBHODGE_XP_VALUE; enemyAtkRangeSq = ENEMY_CALEBHODGE_DYNAMITE_THROW_RANGE_SQUARED;
            enemyAtkCooldown = ENEMY_CALEBHODGE_DYNAMITE_THROW_COOLDOWN; // This is for dynamite. Fissure has its own.
            enemyDynamiteThrowCooldownTimer = ENEMY_CALEBHODGE_DYNAMITE_THROW_COOLDOWN * (0.5 + Math.random() * 0.5);
            enemyFissureCreateCooldownTimer = ENEMY_CALEBHODGE_FISSURE_CREATE_COOLDOWN * (0.3 + Math.random() * 0.7);
            break;
        case 'PatrolDrone':
            enemyBaseSize = ENEMY_DRONE_SIZE; enemyInitialHealth = ENEMY_DRONE_INITIAL_HEALTH;
            enemyBaseSpeed = ENEMY_DRONE_BASE_SPEED; enemyDamageVal = ENEMY_DRONE_DAMAGE;
            enemyXpVal = ENEMY_DRONE_XP_VALUE; enemyAtkRangeSq = ENEMY_DRONE_ATTACK_RANGE_SQUARED;
            enemyAtkCooldown = ENEMY_DRONE_ATTACK_COOLDOWN;

            finalHealth = enemyInitialHealth; finalSpeed = enemyBaseSpeed; finalXpValue = enemyXpVal;
             let droneX, droneY; const droneSpawnPadding = 50;
            droneX = Math.random() * (GAME_WIDTH - enemyBaseSize - 2 * droneSpawnPadding) + droneSpawnPadding;
            droneY = Math.random() * (GAME_HEIGHT - enemyBaseSize - 2 * droneSpawnPadding) + droneSpawnPadding;

            return {
                id: `enemy_${Date.now()}_${Math.random()}_${type}`, x: droneX, y: droneY,
                width: enemyBaseSize, height: enemyBaseSize, health: finalHealth, maxHealth: finalHealth,
                type: type, xpValue: finalXpValue, attackCooldownTimer: Math.random() * enemyAtkCooldown,
                speed: finalSpeed, damage: enemyDamageVal, attackRangeSquared: enemyAtkRangeSq,
                attackCooldown: enemyAtkCooldown,
            };
        default: console.error("Tipo de inimigo desconhecido:", type); return null;
    }

    if (type.startsWith('Boss_')) {
        const bossAppearances = Math.floor(currentWave / 10); 
        let healthMultiplier = 0.25; 
        let xpMultiplier = 0.5;
        if (type === 'Boss_CaptainMcGraw') { healthMultiplier = 0.20; xpMultiplier = 0.40; }
        if (type === 'Boss_DomGael') { healthMultiplier = 0.22; xpMultiplier = 0.45; }
        if (type === 'Boss_CalebHodge') { healthMultiplier = 0.28; xpMultiplier = 0.55; }

        finalHealth = Math.round(enemyInitialHealth * (1 + bossAppearances * healthMultiplier));
        finalXpValue = Math.round(enemyXpVal * (1 + bossAppearances * xpMultiplier));
        finalSpeed = enemyBaseSpeed; 
    } else if (type !== 'PatrolDrone') {
        const waveMultiplier = (currentWave -1) * 0.15;
        finalHealth = Math.round(enemyInitialHealth * (1 + waveMultiplier * 1.2));
        finalSpeed = enemyBaseSpeed * (1 + waveMultiplier * 0.5);
        if (['ArruaceiroSaloon', 'Cão de Fazenda'].includes(type)) finalXpValue += Math.floor(currentWave / 2);
        else if (['PistoleiroVagabundo', 'MineradorRebelde', 'SabotadorDoCanyon'].includes(type)) finalXpValue += currentWave -1;
        else if (['VigiaDaFerrovia', 'BrutoBoyle', 'AtiradorDeEliteMcGraw', 'DesertorGavilanes'].includes(type)) finalXpValue += Math.floor((currentWave -1) * 1.5);
    }


    let newX, newY; let attempts = 0; const maxAttempts = 20;
    const minDistanceFromPlayerSquared = (type.startsWith('Boss_') ? PLAYER_SIZE * 3 : PLAYER_SIZE * 5) ** 2;
    const enemyWidth = enemyBaseSize, enemyHeight = enemyBaseSize, padding = type.startsWith('Boss_') ? 0 : 20;

    do {
        newX = padding + Math.random() * (GAME_WIDTH - enemyWidth - 2 * padding);
        newY = padding + Math.random() * (GAME_HEIGHT - enemyHeight - 2 * padding);
        attempts++;
        if (attempts >= maxAttempts ||
            ( (currentPlayer.x + currentPlayer.width / 2 - (newX + enemyWidth/2))**2 +
              (currentPlayer.y + currentPlayer.height / 2 - (newY + enemyHeight/2))**2 ) >= minDistanceFromPlayerSquared) break;
    } while (true);

    if (type.startsWith('Boss_')) {
        newX = GAME_WIDTH / 2 - enemyWidth / 2;
        newY = GAME_HEIGHT / 4 - enemyHeight / 2;
    }


    return {
        id: `enemy_${Date.now()}_${Math.random()}_${type}`, x: newX, y: newY,
        width: enemyWidth, height: enemyHeight, health: finalHealth, maxHealth: finalHealth,
        type: type, xpValue: finalXpValue, attackCooldownTimer: Math.random() * enemyAtkCooldown,
        speed: finalSpeed, damage: enemyDamageVal, attackRangeSquared: enemyAtkRangeSq,
        attackCooldown: enemyAtkCooldown, isDetonating: enemyIsDetonating, detonationTimer: enemyDetonationTimer,
        isAiming: enemyIsAiming, aimingTimer: enemyAimingTimer, isBursting: enemyIsBursting,
        burstShotsLeft: enemyBurstShotsLeft, burstTimer: enemyBurstTimer,
        barrelThrowCooldownTimer: type === 'Boss_BigDoyle' ? enemyBarrelThrowCooldownTimer : undefined,
        dynamiteThrowCooldownTimer: type === 'Boss_CalebHodge' ? enemyDynamiteThrowCooldownTimer : undefined,
        fissureCreateCooldownTimer: type === 'Boss_CalebHodge' ? enemyFissureCreateCooldownTimer : undefined,
        droneSpawnCooldownTimer: type === 'Boss_CaptainMcGraw' ? enemyDroneSpawnCooldownTimer : undefined,
        attackMode: type === 'Boss_DomGael' ? enemyAttackMode : undefined,
        isDashing: type === 'Boss_DomGael' ? false : undefined,
        dashTimer: type === 'Boss_DomGael' ? 0 : undefined,
        dashCooldownTimer: type === 'Boss_DomGael' ? enemyDashCooldownTimer : undefined,
        allySpawnCooldownTimer: type === 'Boss_DomGael' ? enemyAllySpawnCooldownTimer : undefined,
        modeSwitchCooldownTimer: type === 'Boss_DomGael' ? enemyModeSwitchCooldownTimer : undefined,
    };
  }, []);


  const spawnEnemiesOnTick = useCallback(() => {
    if (isShopPhase || isGameOver || isPaused || isBossWaveActive.current) return;

    const currentWave = waveRef.current;
    const currentPlayer = playerRef.current;
    const currentEnemiesList = enemiesRef.current;

    const arruaceiroCount = currentEnemiesList.filter(e => e.type === 'ArruaceiroSaloon').length;
    const caoCount = currentEnemiesList.filter(e => e.type === 'Cão de Fazenda').length;
    const pistoleiroCount = currentEnemiesList.filter(e => e.type === 'PistoleiroVagabundo').length;
    const mineradorCount = currentEnemiesList.filter(e => e.type === 'MineradorRebelde').length;
    const vigiaCount = currentEnemiesList.filter(e => e.type === 'VigiaDaFerrovia').length;
    const brutoCount = currentEnemiesList.filter(e => e.type === 'BrutoBoyle').length;
    const sabotadorCount = currentEnemiesList.filter(e => e.type === 'SabotadorDoCanyon').length;
    const mcgrawCount = currentEnemiesList.filter(e => e.type === 'AtiradorDeEliteMcGraw').length;
    const desertorCount = currentEnemiesList.filter(e => e.type === 'DesertorGavilanes').length;

    const maxArroceirosForWave = MAX_ARROCEIROS_WAVE_BASE + currentWave;
    const maxCaesForWave = currentWave >= 2 ? MAX_CAES_WAVE_BASE + (currentWave - 2) * 1 : 0;
    const maxPistoleirosForWave = currentWave >= 3 ? MAX_PISTOLEIROS_WAVE_BASE + Math.floor((currentWave - 3) / 2) * PISTOLEIRO_SPAWN_BATCH_SIZE : 0;
    const maxMineradoresForWave = currentWave >= 4 ? MAX_MINERADORES_WAVE_BASE + Math.floor((currentWave - 4) / 2) * MINERADOR_SPAWN_BATCH_SIZE : 0;
    const maxVigiasForWave = currentWave >= 5 ? MAX_VIGIAS_WAVE_BASE + Math.floor((currentWave - 5) / 2) * VIGIA_SPAWN_BATCH_SIZE : 0;
    const maxBrutosForWave = currentWave >= 6 ? MAX_BRUTOS_WAVE_BASE + Math.floor((currentWave - 6) / 3) * BRUTO_SPAWN_BATCH_SIZE : 0;
    const maxSabotadoresForWave = currentWave >= 7 ? MAX_SABOTADORES_WAVE_BASE + Math.floor((currentWave - 7) / 2) * SABOTADOR_SPAWN_BATCH_SIZE : 0;
    const maxMcGrawForWave = currentWave >= 8 ? MAX_MCGRAW_WAVE_BASE + Math.floor((currentWave - 8) / 3) * MCGRAW_SPAWN_BATCH_SIZE : 0;
    const maxDesertorForWave = currentWave >= 9 ? MAX_DESERTOR_WAVE_BASE + Math.floor((currentWave - 9) / 2) * DESERTOR_SPAWN_BATCH_SIZE : 0;

    const newEnemiesBatch: Enemy[] = [];
    if (currentWave >= 1 && arruaceiroCount < maxArroceirosForWave) { const e = createEnemyInstance('ArruaceiroSaloon', currentWave, currentPlayer); if (e) newEnemiesBatch.push(e); }
    if (currentWave >= 2 && caoCount < maxCaesForWave) { for (let i=0; i < Math.min(CAO_SPAWN_BATCH_SIZE, maxCaesForWave - caoCount); i++) { const e = createEnemyInstance('Cão de Fazenda', currentWave, currentPlayer); if (e) newEnemiesBatch.push(e); } }
    if (currentWave >= 3 && pistoleiroCount < maxPistoleirosForWave) { for (let i=0; i < Math.min(PISTOLEIRO_SPAWN_BATCH_SIZE, maxPistoleirosForWave - pistoleiroCount); i++) { const e = createEnemyInstance('PistoleiroVagabundo', currentWave, currentPlayer); if (e) newEnemiesBatch.push(e); } }
    if (currentWave >= 4 && mineradorCount < maxMineradoresForWave) { for (let i=0; i < Math.min(MINERADOR_SPAWN_BATCH_SIZE, maxMineradoresForWave - mineradorCount); i++) { const e = createEnemyInstance('MineradorRebelde', currentWave, currentPlayer); if (e) newEnemiesBatch.push(e); } }
    if (currentWave >= 5 && vigiaCount < maxVigiasForWave) { for (let i=0; i < Math.min(VIGIA_SPAWN_BATCH_SIZE, maxVigiasForWave - vigiaCount); i++) { const e = createEnemyInstance('VigiaDaFerrovia', currentWave, currentPlayer); if (e) newEnemiesBatch.push(e); } }
    if (currentWave >= 6 && brutoCount < maxBrutosForWave) { for (let i=0; i < Math.min(BRUTO_SPAWN_BATCH_SIZE, maxBrutosForWave - brutoCount); i++) { const e = createEnemyInstance('BrutoBoyle', currentWave, currentPlayer); if (e) newEnemiesBatch.push(e); } }
    if (currentWave >= 7 && sabotadorCount < maxSabotadoresForWave) { for (let i=0; i < Math.min(SABOTADOR_SPAWN_BATCH_SIZE, maxSabotadoresForWave - sabotadorCount); i++) { const e = createEnemyInstance('SabotadorDoCanyon', currentWave, currentPlayer); if (e) newEnemiesBatch.push(e); } }
    if (currentWave >= 8 && mcgrawCount < maxMcGrawForWave) { for (let i=0; i < Math.min(MCGRAW_SPAWN_BATCH_SIZE, maxMcGrawForWave - mcgrawCount); i++) { const e = createEnemyInstance('AtiradorDeEliteMcGraw', currentWave, currentPlayer); if (e) newEnemiesBatch.push(e); } }
    if (currentWave >= 9 && desertorCount < maxDesertorForWave) { for (let i=0; i < Math.min(DESERTOR_SPAWN_BATCH_SIZE, maxDesertorForWave - desertorCount); i++) { const e = createEnemyInstance('DesertorGavilanes', currentWave, currentPlayer); if (e) newEnemiesBatch.push(e); } }
    if (newEnemiesBatch.length > 0) setEnemies(prev => [...prev, ...newEnemiesBatch]);
  }, [isShopPhase, isGameOver, isPaused, createEnemyInstance]);


  useEffect(() => {
    if (isShopPhase || isGameOver || isPaused || isBossWaveActive.current) {
      if (enemySpawnTimerId.current) clearInterval(enemySpawnTimerId.current);
      enemySpawnTimerId.current = null;
      return;
    }
    if (!enemySpawnTimerId.current) {
        spawnEnemiesOnTick();
        enemySpawnTimerId.current = setInterval(spawnEnemiesOnTick, ENEMY_SPAWN_TICK_INTERVAL);
    }
    return () => {  };
  }, [isShopPhase, isGameOver, isPaused, spawnEnemiesOnTick, isBossWaveActive.current]);


  const handleStartWaveLogic = (currentWaveNumber: number) => {
    const newWave = currentWaveNumber + 1;
    setFissureTraps([]); // Clear fissures at the start of any wave logic
    if ((newWave % 10 === 0)) {
        isBossWaveActive.current = true;
        currentBossId.current = null;
        setEnemies([]);
        setPlayerProjectiles([]);
        setEnemyProjectiles([]);
        setLaserSightLines([]);
        setXpOrbs([]);
        if (enemySpawnTimerId.current) {
            clearInterval(enemySpawnTimerId.current);
            enemySpawnTimerId.current = null;
        }
        const randomBossType = bossPool[Math.floor(Math.random() * bossPool.length)];
        const bossEnemy = createEnemyInstance(randomBossType, newWave, playerRef.current);
        if (bossEnemy) {
            setEnemies([bossEnemy]);
            currentBossId.current = bossEnemy.id;
            toast({ title: `Chefe se Aproxima: ${bossEnemy.type.replace('Boss_', '')}!`, description: "Prepare-se para a batalha!" });
        }
    } else {
        isBossWaveActive.current = false;
        currentBossId.current = null;
        setEnemies([]);
        if (!enemySpawnTimerId.current && !isPaused && !isShopPhase && !isGameOver) {
            spawnEnemiesOnTick();
            enemySpawnTimerId.current = setInterval(spawnEnemiesOnTick, ENEMY_SPAWN_TICK_INTERVAL);
        }
    }
  };

  const startNextWave = () => {
    setIsShopPhase(false);
    const nextWaveNumber = wave + 1;
    setWave(nextWaveNumber);
    setWaveTimer(WAVE_DURATION);

    setPlayer(p => ({ ...p, health: PLAYER_INITIAL_HEALTH }));
    lastPlayerShotTimestampRef.current = {};
    lastLogicUpdateTimestampRef.current = 0;
    setIsPaused(false);

    handleStartWaveLogic(wave);
  };


  if (isGameOver) {
    return (
      <div className="text-center p-8">
        <h2 className="text-4xl font-bold text-destructive mb-4">Fim de Jogo!</h2>
        <p className="text-xl mb-2">Pontuação Final: {score}</p>
        <p className="text-lg mb-2">Onda Alcançada: {wave}</p>
        <p className="text-lg mb-4">Total XP Coletado: {playerXP}</p>
        <Button onClick={() => resetGameState()} className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 text-lg">
          Jogar Novamente
        </Button>
         <Button onClick={() => resetGameState(true)} variant="outline" className="mt-4 ml-2 px-6 py-2 text-lg">
          <HomeIcon className="mr-2 h-5 w-5" /> Menu Principal
        </Button>
      </div>
    );
  }

  if (isShopPhase) {
    return <ShopDialog
              onStartNextWave={startNextWave} wave={wave} score={score} playerXP={playerXP}
              shopOfferings={shopOfferings} playerWeapons={playerWeapons}
              onBuyWeapon={handleBuyWeapon} onRecycleWeapon={handleRecycleWeapon}
              canAfford={(cost) => playerXP >= cost} inventoryFull={playerWeapons.length >= MAX_PLAYER_WEAPONS}
            />;
  }

  return (
    <div className="flex flex-col items-center p-1 sm:p-4 w-full h-full">
      <div className="w-full max-w-2xl flex justify-between items-start mb-1 sm:mb-2">
        <GameHUD score={score} wave={wave} playerHealth={player.health} waveTimer={waveTimer} playerXP={playerXP} />
        <Button onClick={() => setIsPaused(!isPaused)} variant="outline" size="icon" className="ml-2 sm:ml-4 mt-1 text-foreground hover:bg-accent hover:text-accent-foreground" aria-label={isPaused ? "Continuar" : "Pausar"}>
            {isPaused ? <PlayIcon className="h-5 w-5" /> : <PauseIcon className="h-5 w-5" />}
        </Button>
      </div>

      <div ref={gameWrapperRef} className="flex items-center justify-center flex-grow w-full overflow-hidden">
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
          <Card className="shadow-2xl overflow-hidden border-2 border-primary">
            <div ref={gameAreaRef} className="relative bg-muted/30 overflow-hidden" style={{ width: GAME_WIDTH, height: GAME_HEIGHT }} role="application" aria-label="Área de jogo Dustborn" tabIndex={-1}>
              {isPaused && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-50 p-4">
                  <h2 className="text-5xl font-bold text-primary-foreground animate-pulse mb-8">PAUSADO</h2>
                  <PlayerInventoryDisplay weapons={playerWeapons} canRecycle={false} className="w-full max-w-md bg-card/90 mb-6" />
                  <Button onClick={() => resetGameState(true)} variant="secondary" className="text-lg py-3 px-6">
                    <HomeIcon className="mr-2 h-5 w-5" /> Voltar ao Menu Principal
                  </Button>
                </div>
              )}
              <PlayerCharacter x={player.x} y={player.y} width={player.width} height={player.height} isTakingDamage={isPlayerTakingDamage} />
              {fissureTraps.map((trap) => (
                <FissureTrapCharacter 
                    key={trap.id} 
                    x={trap.x} y={trap.y} 
                    width={trap.width} height={trap.height} 
                    remainingDuration={trap.remainingDuration} 
                    maxDuration={FISSURE_TRAP_DURATION} 
                />
              ))}
              {enemies.map((enemy) => (
                <EnemyCharacter key={enemy.id} x={enemy.x} y={enemy.y}
                  width={enemy.width} height={enemy.height} health={enemy.health} maxHealth={enemy.maxHealth}
                  type={enemy.type} isStunned={enemy.isStunned} isDetonating={enemy.isDetonating}
                />
              ))}
              {xpOrbs.map((orb) => (<XPOrb key={orb.id} x={orb.x} y={orb.y} size={orb.size} /> ))}
              {playerProjectiles.map((proj) => ( <Projectile key={proj.id} x={proj.x} y={proj.y} size={proj.size} projectileType={proj.projectileType} width={proj.width} height={proj.height} /> ))}
              {enemyProjectiles.map((proj) => ( <Projectile key={proj.id} x={proj.x} y={proj.y} size={proj.size} projectileType={proj.projectileType} width={proj.width} height={proj.height} isBarrelOrDynamite={proj.isBarrelOrDynamite} hasLanded={proj.hasLanded} /> ))}
              {laserSightLines.map(line => {
                  const angle = Math.atan2(line.y2 - line.y1, line.x2 - line.x1) * (180 / Math.PI);
                  const length = Math.sqrt((line.x2 - line.x1)**2 + (line.y2 - line.y1)**2);
                  return (<div key={`laser_${line.id}`} className="absolute h-[2px] bg-red-500/70 origin-left" style={{ left: line.x1, top: line.y1, width: length, transform: `rotate(${angle}deg)`, zIndex: 5 }} role="presentation" aria-label="Mira laser"/> );
              })}
            </div>
          </Card>
        </div>
      </div>

      {deviceType === 'mobile' && !isPaused && !isShopPhase && !isGameOver && (
        <div className="fixed bottom-8 left-8 z-50 grid grid-cols-3 grid-rows-3 gap-2 w-36 h-36 sm:w-48 sm:h-48">
          <div />
          <Button variant="outline" className="col-start-2 row-start-1 bg-card/70 text-card-foreground hover:bg-accent hover:text-accent-foreground aspect-square p-0" onTouchStart={() => handleMobileControl('arrowup', true)} onTouchEnd={() => handleMobileControl('arrowup', false)} onMouseDown={() => handleMobileControl('arrowup', true)} onMouseUp={() => handleMobileControl('arrowup', false)} onMouseLeave={() => handleMobileControl('arrowup', false)} aria-label="Mover Cima"> <ArrowUp className="w-6 h-6 sm:w-8 sm:h-8" /> </Button>
          <div />
          <Button variant="outline" className="col-start-1 row-start-2 bg-card/70 text-card-foreground hover:bg-accent hover:text-accent-foreground aspect-square p-0" onTouchStart={() => handleMobileControl('arrowleft', true)} onTouchEnd={() => handleMobileControl('arrowleft', false)} onMouseDown={() => handleMobileControl('arrowleft', true)} onMouseUp={() => handleMobileControl('arrowleft', false)} onMouseLeave={() => handleMobileControl('arrowleft', false)} aria-label="Mover Esquerda"> <ArrowLeft className="w-6 h-6 sm:w-8 sm:h-8" /> </Button>
          <div />
          <Button variant="outline" className="col-start-3 row-start-2 bg-card/70 text-card-foreground hover:bg-accent hover:text-accent-foreground aspect-square p-0" onTouchStart={() => handleMobileControl('arrowright', true)} onTouchEnd={() => handleMobileControl('arrowright', false)} onMouseDown={() => handleMobileControl('arrowright', true)} onMouseUp={() => handleMobileControl('arrowright', false)} onMouseLeave={() => handleMobileControl('arrowright', false)} aria-label="Mover Direita"> <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8" /> </Button>
          <div />
          <Button variant="outline" className="col-start-2 row-start-3 bg-card/70 text-card-foreground hover:bg-accent hover:text-accent-foreground aspect-square p-0" onTouchStart={() => handleMobileControl('arrowdown', true)} onTouchEnd={() => handleMobileControl('arrowdown', false)} onMouseDown={() => handleMobileControl('arrowdown', true)} onMouseUp={() => handleMobileControl('arrowdown', false)} onMouseLeave={() => handleMobileControl('arrowdown', false)} aria-label="Mover Baixo"> <ArrowDown className="w-6 h-6 sm:w-8 sm:h-8" /> </Button>
          <div />
        </div>
      )}
      <div className={cn("mt-2 sm:mt-4 text-xs sm:text-sm text-muted-foreground text-center", deviceType === 'mobile' ? 'mb-20 sm:mb-4' : 'mb-4')}>
        {deviceType === 'computer' ? "Use as Teclas de Seta ou WASD para mover. " : "Use os botões na tela para mover. "}
        A arma dispara automaticamente. Pressione 'P' (computador) ou clique no botão para pausar. Sobreviva!
      </div>
    </div>
  );
}

