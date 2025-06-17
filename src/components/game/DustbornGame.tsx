
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
import { DamageNumber } from './DamageNumber';
import { PlayerInventoryDisplay } from './PlayerInventoryDisplay';
import { PauseIcon, PlayIcon, HomeIcon, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import type { Weapon, ProjectileType } from '@/config/weapons';
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
const ENEMY_PISTOLEIRO_BASE_SPEED = 1.5;
const ENEMY_PISTOLEIRO_XP_VALUE = 4;
const ENEMY_PISTOLEIRO_ATTACK_RANGE_SQUARED = (350) ** 2;
const ENEMY_PISTOLEIRO_ATTACK_COOLDOWN = 2500;
const ENEMY_PISTOLEIRO_PROJECTILE_SPEED = 7;
const ENEMY_PISTOLEIRO_PROJECTILE_SIZE = 8;
const ENEMY_PISTOLEIRO_MELEE_RANGE_SQUARED = (PLAYER_SIZE / 2 + ENEMY_PISTOLEIRO_SIZE / 2 + 10) ** 2;


const PROJECTILE_SIZE = 8;
const PROJECTILE_SPEED = 10;

const XP_ORB_SIZE = 10;
const WAVE_DURATION = 120; // seconds


const MAX_ARROCEIROS_WAVE_BASE = 5;
const MAX_CAES_WAVE_BASE = 6;
const CAO_SPAWN_BATCH_SIZE = 3;
const MAX_PISTOLEIROS_WAVE_BASE = 2;
const PISTOLEIRO_SPAWN_BATCH_SIZE = 2;
const ENEMY_SPAWN_TICK_INTERVAL = 2000;


const XP_COLLECTION_RADIUS_SQUARED = (PLAYER_SIZE / 2 + XP_ORB_SIZE / 2 + 30) ** 2;
const ENEMY_MOVE_INTERVAL = 50;

const DAMAGE_NUMBER_LIFESPAN = 700;
const DAMAGE_NUMBER_FLOAT_SPEED = 0.8;

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

type EnemyType = 'ArruaceiroSaloon' | 'Cão de Fazenda' | 'PistoleiroVagabundo';

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
}

interface XPOrbData extends Entity {
  size: number;
  value: number;
}

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
  projectileType: ProjectileType;
  originWeaponId?: string;
  isEnemyProjectile?: boolean;
}


interface DamageNumberData extends Entity {
  amount: number;
  life: number;
  opacity: number;
  isCritical?: boolean;
}

interface DustbornGameProps {
  onExitToMenu?: () => void;
  deviceType: 'computer' | 'mobile';
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
  const [damageNumbers, setDamageNumbers] = useState<DamageNumberData[]>([]);
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
            
            setScale(Math.max(0.1, newScale)); // Prevent scale from being too small or zero
        }
      }
    };

    calculateScale(); 

    const resizeObserver = new ResizeObserver(calculateScale);
    if (gameWrapperRef.current) {
      resizeObserver.observe(gameWrapperRef.current);
    }

    return () => {
      if (gameWrapperRef.current) {
        resizeObserver.unobserve(gameWrapperRef.current);
      }
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
    setDamageNumbers([]);
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
    if (isPressed) {
      activeKeys.current.add(key);
    } else {
      activeKeys.current.delete(key);
    }
  };


  useEffect(() => {
    if (isGameOver || isShopPhase || isPaused) return;

    let animationFrameId: number;

    const gameTick = (timestamp: number) => {
      if (isPaused) {
        animationFrameId = requestAnimationFrame(gameTick);
        return;
      }

      let inputDx = 0;
      let inputDy = 0;

      if (activeKeys.current.has('arrowup') || activeKeys.current.has('w')) inputDy -= 1;
      if (activeKeys.current.has('arrowdown') || activeKeys.current.has('s')) inputDy += 1;
      if (activeKeys.current.has('arrowleft') || activeKeys.current.has('a')) inputDx -= 1;
      if (activeKeys.current.has('arrowright') || activeKeys.current.has('d')) inputDx += 1;


      if (inputDx !== 0 || inputDy !== 0) {
        let moveX: number;
        let moveY: number;

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
            if (weapon.id === 'vibora_aco' && Math.random() < 0.25) {
              numProjectilesToFire = 2;
            }

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
                x: playerCenterX - (weapon.projectileType === 'knife' ? (PLAYER_SIZE * 0.5) / 2 : PROJECTILE_SIZE / 2) ,
                y: playerCenterY - (weapon.projectileType === 'knife' ? (PLAYER_SIZE * 1.5) / 2 : PROJECTILE_SIZE / 2) ,
                size: PROJECTILE_SIZE,
                width: weapon.projectileType === 'knife' ? PLAYER_SIZE * 0.5 : undefined,
                height: weapon.projectileType === 'knife' ? PLAYER_SIZE * 1.5 : undefined,
                dx: projDx,
                dy: projDy,
                damage: damage,
                traveledDistance: 0,
                maxRange: weapon.range,
                critical: isCritical,
                penetrationLeft: weapon.penetrationCount || 0,
                hitEnemyIds: new Set<string>(),
                projectileType: weapon.projectileType,
                originWeaponId: weapon.id,
                isEnemyProjectile: false,
              });
            }
            setPlayerProjectiles(prev => [...prev, ...projectilesToSpawn.map(p => ({...p, id: `proj_${Date.now()}_${Math.random()}`}))]);
          }
        }
      });

      if (timestamp - lastLogicUpdateTimestampRef.current >= ENEMY_MOVE_INTERVAL) {
        lastLogicUpdateTimestampRef.current = timestamp;
        const newlyCreatedDamageNumbers: DamageNumberData[] = [];

        setPlayerProjectiles(prevPlayerProjectiles => {
          const updatedProjectiles = prevPlayerProjectiles.map(proj => ({
            ...proj,
            x: proj.x + proj.dx * PROJECTILE_SPEED,
            y: proj.y + proj.dy * PROJECTILE_SPEED,
            traveledDistance: proj.traveledDistance + PROJECTILE_SPEED,
          })).filter(proj =>
              proj.x > -(proj.width || proj.size) && proj.x < GAME_WIDTH &&
              proj.y > -(proj.height || proj.size) && proj.y < GAME_HEIGHT &&
              proj.traveledDistance < proj.maxRange
          );

          let newProjectilesAfterHits = [...updatedProjectiles];

          setEnemies(currentEnemies => {
            let newHitScore = 0;
            const newXpOrbsFromHits: XPOrbData[] = [];

            const nextEnemiesState = currentEnemies.map(enemy => {
              let currentEnemyState = {...enemy};

              for (let i = newProjectilesAfterHits.length - 1; i >= 0; i--) {
                const proj = newProjectilesAfterHits[i];
                if (proj.hitEnemyIds.has(enemy.id) && proj.penetrationLeft <= 0 && proj.originWeaponId !== 'justica_ferro') continue;

                const projWidth = proj.width || proj.size;
                const projHeight = proj.height || proj.size;
                const projCenterX = proj.x + projWidth / 2;
                const projCenterY = proj.y + projHeight / 2;
                const enemyCenterX = currentEnemyState.x + currentEnemyState.width / 2;
                const enemyCenterY = currentEnemyState.y + currentEnemyState.height / 2;

                if (Math.abs(projCenterX - enemyCenterX) < (projWidth / 2 + currentEnemyState.width / 2) &&
                    Math.abs(projCenterY - enemyCenterY) < (projHeight / 2 + currentEnemyState.height / 2)) {

                  if (proj.hitEnemyIds.has(enemy.id) && proj.originWeaponId !== 'justica_ferro') continue;

                  const damageDealt = proj.damage;
                  currentEnemyState.health -= damageDealt;
                  proj.hitEnemyIds.add(enemy.id);

                  if (proj.originWeaponId === 'voz_trovao') {
                    const vozDoTrovaoWeapon = getWeaponById('voz_trovao');
                    if (vozDoTrovaoWeapon && vozDoTrovaoWeapon.stunDuration) {
                       currentEnemyState.isStunned = true;
                       currentEnemyState.stunTimer = vozDoTrovaoWeapon.stunDuration;
                    }
                  }

                  newlyCreatedDamageNumbers.push({
                    id: `dmg_${Date.now()}_${Math.random()}`,
                    x: currentEnemyState.x + currentEnemyState.width / 2,
                    y: currentEnemyState.y,
                    amount: damageDealt,
                    life: DAMAGE_NUMBER_LIFESPAN,
                    opacity: 1,
                    isCritical: proj.critical,
                  });

                  if (currentEnemyState.health <= 0) {
                    newHitScore += currentEnemyState.xpValue * 5;
                    newXpOrbsFromHits.push({
                      id: `xp_${Date.now()}_${Math.random()}_${currentEnemyState.id}`,
                      x: currentEnemyState.x + currentEnemyState.width / 2 - XP_ORB_SIZE / 2,
                      y: currentEnemyState.y + currentEnemyState.height / 2 - XP_ORB_SIZE / 2,
                      size: XP_ORB_SIZE,
                      value: currentEnemyState.xpValue
                    });
                  }

                  if (proj.penetrationLeft > 0) {
                    proj.penetrationLeft--;
                  } else {
                    newProjectilesAfterHits.splice(i, 1);
                  }
                }
              }
              return currentEnemyState;
            }).filter(enemy => enemy.health > 0);

            if (newXpOrbsFromHits.length > 0) {
              setXpOrbs(prevOrbs => [...prevOrbs, ...newXpOrbsFromHits]);
            }
            if (newHitScore > 0) {
              setScore(prevScore => prevScore + newHitScore);
            }
            return nextEnemiesState;
          });
          return newProjectilesAfterHits;
        });

        setEnemyProjectiles(prevEnemyProjectiles => {
            const updatedEnemyProjectiles = prevEnemyProjectiles.map(proj => ({
                ...proj,
                x: proj.x + proj.dx * ENEMY_PISTOLEIRO_PROJECTILE_SPEED,
                y: proj.y + proj.dy * ENEMY_PISTOLEIRO_PROJECTILE_SPEED,
                traveledDistance: proj.traveledDistance + ENEMY_PISTOLEIRO_PROJECTILE_SPEED,
            })).filter(proj =>
                proj.x > -proj.size && proj.x < GAME_WIDTH &&
                proj.y > -proj.size && proj.y < GAME_HEIGHT &&
                proj.traveledDistance < proj.maxRange
            );

            const remainingEnemyProjectiles = [];
            for (const proj of updatedEnemyProjectiles) {
                const projCenterX = proj.x + proj.size / 2;
                const projCenterY = proj.y + proj.size / 2;
                const playerCenterX = playerRef.current.x + playerRef.current.width / 2;
                const playerCenterY = playerRef.current.y + playerRef.current.height / 2;

                if (Math.abs(projCenterX - playerCenterX) < (proj.size / 2 + playerRef.current.width / 2) &&
                    Math.abs(projCenterY - playerCenterY) < (proj.size / 2 + playerRef.current.height / 2)) {
                    
                    setPlayer(p => {
                        const newHealth = Math.max(0, p.health - proj.damage);
                        if (newHealth < p.health && !isPlayerTakingDamage) {
                            setIsPlayerTakingDamage(true);
                            setTimeout(() => setIsPlayerTakingDamage(false), 200);
                        }
                        if (newHealth <= 0 && !isGameOver) {
                            setIsGameOver(true);
                        }
                        return { ...p, health: newHealth };
                    });
                } else {
                    remainingEnemyProjectiles.push(proj);
                }
            }
            return remainingEnemyProjectiles;
        });


        if (newlyCreatedDamageNumbers.length > 0) {
          setDamageNumbers(prev => [...prev, ...newlyCreatedDamageNumbers]);
        }

        setEnemies(currentEnemies =>
          currentEnemies.map(enemy => {
            let updatedEnemy = {...enemy,
              attackCooldownTimer: Math.max(0, enemy.attackCooldownTimer - ENEMY_MOVE_INTERVAL)
            };

            if (updatedEnemy.isStunned && updatedEnemy.stunTimer && updatedEnemy.stunTimer > 0) {
              updatedEnemy.stunTimer -= ENEMY_MOVE_INTERVAL;
              if (updatedEnemy.stunTimer <= 0) {
                updatedEnemy.isStunned = false;
                updatedEnemy.stunTimer = 0;
              } else {
                return updatedEnemy;
              }
            }

            const playerCenterX = playerRef.current.x + playerRef.current.width / 2;
            const playerCenterY = playerRef.current.y + playerRef.current.height / 2;
            const enemyCenterX = updatedEnemy.x + updatedEnemy.width / 2;
            const enemyCenterY = updatedEnemy.y + updatedEnemy.height / 2;

            const deltaPlayerX = playerCenterX - enemyCenterX;
            const deltaPlayerY = playerCenterY - enemyCenterY;
            const distToPlayerSquared = deltaPlayerX * deltaPlayerX + deltaPlayerY * deltaPlayerY;

            if (enemy.type === 'PistoleiroVagabundo') {
                if (distToPlayerSquared > updatedEnemy.attackRangeSquared * 0.5 || distToPlayerSquared < ENEMY_PISTOLEIRO_MELEE_RANGE_SQUARED) {
                     if (distToPlayerSquared > (updatedEnemy.width / 4 + playerRef.current.width / 4) ** 2) {
                        const dist = Math.sqrt(distToPlayerSquared);
                        updatedEnemy.x += (deltaPlayerX / dist) * updatedEnemy.speed;
                        updatedEnemy.y += (deltaPlayerY / dist) * updatedEnemy.speed;
                    }
                }
            } else {
                 if (distToPlayerSquared > (updatedEnemy.width / 4 + playerRef.current.width / 4) ** 2) {
                    const dist = Math.sqrt(distToPlayerSquared);
                    updatedEnemy.x += (deltaPlayerX / dist) * updatedEnemy.speed;
                    updatedEnemy.y += (deltaPlayerY / dist) * updatedEnemy.speed;
                }
            }


            if (updatedEnemy.attackCooldownTimer <= 0) {
                if (enemy.type === 'PistoleiroVagabundo') {
                    if (distToPlayerSquared < updatedEnemy.attackRangeSquared) {
                        const angleToPlayer = Math.atan2(deltaPlayerY, deltaPlayerX);
                        setEnemyProjectiles(prev => [...prev, {
                            id: `eproj_${Date.now()}_${Math.random()}`,
                            x: enemyCenterX - ENEMY_PISTOLEIRO_PROJECTILE_SIZE / 2,
                            y: enemyCenterY - ENEMY_PISTOLEIRO_PROJECTILE_SIZE / 2,
                            size: ENEMY_PISTOLEIRO_PROJECTILE_SIZE,
                            dx: Math.cos(angleToPlayer),
                            dy: Math.sin(angleToPlayer),
                            damage: updatedEnemy.damage,
                            traveledDistance: 0,
                            maxRange: updatedEnemy.attackRangeSquared, 
                            projectileType: 'enemy_bullet',
                            hitEnemyIds: new Set(),
                            penetrationLeft: 0,
                            isEnemyProjectile: true,
                        }]);
                        updatedEnemy.attackCooldownTimer = updatedEnemy.attackCooldown;
                    }
                } else { 
                    if (distToPlayerSquared < updatedEnemy.attackRangeSquared) {
                       setPlayer(p => {
                         const newHealth = Math.max(0, p.health - updatedEnemy.damage);
                         if (newHealth < p.health && !isPlayerTakingDamage) {
                            setIsPlayerTakingDamage(true);
                            setTimeout(() => setIsPlayerTakingDamage(false), 200);
                         }
                         if (newHealth <= 0 && !isGameOver) {
                           setIsGameOver(true);
                         }
                         return {...p, health: newHealth };
                       });
                       updatedEnemy.attackCooldownTimer = updatedEnemy.attackCooldown;
                    }
                }
            }
            return updatedEnemy;
          })
        );

        setXpOrbs((currentOrbs) => {
          const collectedOrbValues: number[] = [];
          const remainingOrbs = currentOrbs.filter((orb) => {
            const distX = (playerRef.current.x + playerRef.current.width / 2) - (orb.x + orb.size / 2);
            const distY = (playerRef.current.y + playerRef.current.height / 2) - (orb.y + orb.size / 2);
            const distanceSquared = distX * distX + distY * distY;
            if (distanceSquared < XP_COLLECTION_RADIUS_SQUARED) {
              collectedOrbValues.push(orb.value);
              return false;
            }
            return true;
          });

          if (collectedOrbValues.length > 0) {
            const totalCollectedXP = collectedOrbValues.reduce((sum, val) => sum + val, 0);
            setPlayerXP((prevXP) => prevXP + totalCollectedXP);
          }
          return remainingOrbs;
        });

        setDamageNumbers(prevDamageNumbers =>
          prevDamageNumbers
            .map(dn => {
              const newLife = dn.life - ENEMY_MOVE_INTERVAL;
              return {
                ...dn,
                y: dn.y - DAMAGE_NUMBER_FLOAT_SPEED,
                life: newLife,
                opacity: Math.max(0, Math.min(1, newLife / (DAMAGE_NUMBER_LIFESPAN * 0.75))),
              };
            })
            .filter(dn => dn.life > 0 && dn.opacity > 0)
        );
      }

      if (playerRef.current.health <= 0 && !isGameOver) {
        setIsGameOver(true);
      }

      if (!isGameOver && !isShopPhase && !isPaused) {
        animationFrameId = requestAnimationFrame(gameTick);
      }
    };

    animationFrameId = requestAnimationFrame(gameTick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isGameOver, isShopPhase, isPaused, playerWeapons, toast, generateShopOfferings, isPlayerTakingDamage, playerProjectiles, enemyProjectiles]); 


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
            if (currentXpOrbs.length > 0) {
              const totalRemainingXp = currentXpOrbs.reduce((sum, orb) => sum + orb.value, 0);
              setPlayerXP(prevPlayerXP => prevPlayerXP + totalRemainingXp);
            }
            return [];
          });

          setIsShopPhase(true);
          generateShopOfferings();
          if(enemySpawnTimerId.current) clearInterval(enemySpawnTimerId.current);
          return WAVE_DURATION;
        }
        return prevTimer - 1;
      });
    }, 1000);
    return () => {
      if (waveIntervalId.current) clearInterval(waveIntervalId.current);
    };
  }, [isGameOver, isShopPhase, isPaused, generateShopOfferings]);


  const createEnemyInstance = useCallback((
    type: EnemyType,
    currentWave: number,
    currentPlayer: Player
  ): Enemy | null => {
    let enemyBaseSize: number,
        enemyInitialHealth: number,
        enemyBaseSpeed: number,
        enemyDamageVal: number,
        enemyXpVal: number,
        enemyAtkRangeSq: number,
        enemyAtkCooldown: number;

    switch (type) {
        case 'ArruaceiroSaloon':
            enemyBaseSize = ENEMY_ARROCEIRO_SIZE;
            enemyInitialHealth = ENEMY_ARROCEIRO_INITIAL_HEALTH;
            enemyBaseSpeed = ENEMY_ARROCEIRO_BASE_SPEED;
            enemyDamageVal = ENEMY_ARROCEIRO_DAMAGE;
            enemyXpVal = ENEMY_ARROCEIRO_XP_VALUE;
            enemyAtkRangeSq = ENEMY_ARROCEIRO_ATTACK_RANGE_SQUARED;
            enemyAtkCooldown = ENEMY_ARROCEIRO_ATTACK_COOLDOWN;
            break;
        case 'Cão de Fazenda':
            enemyBaseSize = ENEMY_CAODEFAZENDA_SIZE;
            enemyInitialHealth = ENEMY_CAODEFAZENDA_INITIAL_HEALTH;
            enemyBaseSpeed = ENEMY_CAODEFAZENDA_BASE_SPEED;
            enemyDamageVal = ENEMY_CAODEFAZENDA_DAMAGE;
            enemyXpVal = ENEMY_CAODEFAZENDA_XP_VALUE;
            enemyAtkRangeSq = ENEMY_CAODEFAZENDA_ATTACK_RANGE_SQUARED;
            enemyAtkCooldown = ENEMY_CAODEFAZENDA_ATTACK_COOLDOWN;
            break;
        case 'PistoleiroVagabundo':
            enemyBaseSize = ENEMY_PISTOLEIRO_SIZE;
            enemyInitialHealth = ENEMY_PISTOLEIRO_INITIAL_HEALTH;
            enemyBaseSpeed = ENEMY_PISTOLEIRO_BASE_SPEED; 
            enemyDamageVal = ENEMY_PISTOLEIRO_DAMAGE;
            enemyXpVal = ENEMY_PISTOLEIRO_XP_VALUE;
            enemyAtkRangeSq = ENEMY_PISTOLEIRO_ATTACK_RANGE_SQUARED;
            enemyAtkCooldown = ENEMY_PISTOLEIRO_ATTACK_COOLDOWN;
            break;
        default:
            console.error("Tipo de inimigo desconhecido em createEnemyInstance:", type);
            return null;
    }

    const enemyHealth = enemyInitialHealth + (currentWave - 1) * (type === 'ArruaceiroSaloon' ? 3 : type === 'Cão de Fazenda' ? 2 : 4);
    const enemySpeed = enemyBaseSpeed + (currentWave - 1) * 0.1;
    
    let finalXpValue = enemyXpVal;
    if (type === 'ArruaceiroSaloon') finalXpValue += currentWave;
    else if (type === 'Cão de Fazenda') finalXpValue += currentWave; 
    else if (type === 'PistoleiroVagabundo') finalXpValue += Math.floor((currentWave - 1) / 2);


    let newX, newY;
    let attempts = 0;
    const maxAttempts = 20;
    const minDistanceFromPlayerSquared = (PLAYER_SIZE * 5) ** 2; 
    const enemyWidth = enemyBaseSize;
    const enemyHeight = enemyBaseSize;
    const padding = 20; // Min distance from edge

    do {
        newX = padding + Math.random() * (GAME_WIDTH - enemyWidth - 2 * padding);
        newY = padding + Math.random() * (GAME_HEIGHT - enemyHeight - 2 * padding);
        attempts++;

        const playerCenterX = currentPlayer.x + currentPlayer.width / 2;
        const playerCenterY = currentPlayer.y + currentPlayer.height / 2;
        const spawnCenterX = newX + enemyWidth / 2;
        const spawnCenterY = newY + enemyHeight / 2;
        const distSq = (playerCenterX - spawnCenterX)**2 + (playerCenterY - spawnCenterY)**2;

        if (distSq >= minDistanceFromPlayerSquared) break;
        
    } while (attempts < maxAttempts);

    if (attempts >= maxAttempts) {
        const corners = [
            { x: padding, y: padding },
            { x: GAME_WIDTH - enemyWidth - padding, y: padding },
            { x: padding, y: GAME_HEIGHT - enemyHeight - padding },
            { x: GAME_WIDTH - enemyWidth - padding, y: GAME_HEIGHT - enemyHeight - padding },
        ];
        let bestCorner = corners[0];
        let maxDistSq = 0;
        const playerCenterX = currentPlayer.x + currentPlayer.width / 2;
        const playerCenterY = currentPlayer.y + currentPlayer.height / 2;

        for (const corner of corners) {
            const distSq = (playerCenterX - (corner.x + enemyWidth/2))**2 + (playerCenterY - (corner.y + enemyHeight/2))**2;
            if (distSq > maxDistSq) {
                maxDistSq = distSq;
                bestCorner = corner;
            }
        }
        newX = bestCorner.x;
        newY = bestCorner.y;
    }

    return {
        id: `enemy_${Date.now()}_${Math.random()}_${type}`,
        x: newX, y: newY,
        width: enemyWidth, height: enemyHeight,
        health: enemyHealth, maxHealth: enemyHealth,
        type: type,
        xpValue: finalXpValue,
        attackCooldownTimer: Math.random() * enemyAtkCooldown,
        speed: enemySpeed,
        damage: enemyDamageVal,
        attackRangeSquared: enemyAtkRangeSq,
        attackCooldown: enemyAtkCooldown,
    };
  }, []);


  const spawnEnemiesOnTick = useCallback(() => {
    if (isShopPhase || isGameOver || isPaused) return;

    const currentWave = waveRef.current;
    const currentPlayer = playerRef.current;
    const currentEnemiesList = enemiesRef.current;

    const arruaceiroCount = currentEnemiesList.filter(e => e.type === 'ArruaceiroSaloon').length;
    const caoCount = currentEnemiesList.filter(e => e.type === 'Cão de Fazenda').length;
    const pistoleiroCount = currentEnemiesList.filter(e => e.type === 'PistoleiroVagabundo').length;

    const maxArroceirosForWave = MAX_ARROCEIROS_WAVE_BASE + currentWave;
    const maxCaesForWave = currentWave >= 2 ? MAX_CAES_WAVE_BASE + (currentWave - 2) * 1 : 0;
    const maxPistoleirosForWave = currentWave >= 3 ? MAX_PISTOLEIROS_WAVE_BASE + Math.floor((currentWave - 3) / 2) * PISTOLEIRO_SPAWN_BATCH_SIZE : 0;
    
    const newEnemiesBatch: Enemy[] = [];

    if (currentWave >= 1 && arruaceiroCount < maxArroceirosForWave) {
        const enemy = createEnemyInstance('ArruaceiroSaloon', currentWave, currentPlayer);
        if (enemy) newEnemiesBatch.push(enemy);
    }

    if (currentWave >= 2 && caoCount < maxCaesForWave) {
        const canSpawnCount = Math.min(CAO_SPAWN_BATCH_SIZE, maxCaesForWave - caoCount);
        for (let i = 0; i < canSpawnCount; i++) {
            const enemy = createEnemyInstance('Cão de Fazenda', currentWave, currentPlayer);
            if (enemy) newEnemiesBatch.push(enemy);
        }
    }
    
    if (currentWave >= 3 && pistoleiroCount < maxPistoleirosForWave) {
        const canSpawnCount = Math.min(PISTOLEIRO_SPAWN_BATCH_SIZE, maxPistoleirosForWave - pistoleiroCount);
        for (let i = 0; i < canSpawnCount; i++) {
            const enemy = createEnemyInstance('PistoleiroVagabundo', currentWave, currentPlayer);
            if (enemy) newEnemiesBatch.push(enemy);
        }
    }

    if (newEnemiesBatch.length > 0) {
        setEnemies(prev => [...prev, ...newEnemiesBatch]);
    }
  }, [isShopPhase, isGameOver, isPaused, createEnemyInstance]);


  useEffect(() => {
    if (isShopPhase || isGameOver || isPaused) {
      if (enemySpawnTimerId.current) clearInterval(enemySpawnTimerId.current);
      return;
    }
    
    spawnEnemiesOnTick(); 
    enemySpawnTimerId.current = setInterval(spawnEnemiesOnTick, ENEMY_SPAWN_TICK_INTERVAL);

    return () => {
      if (enemySpawnTimerId.current) clearInterval(enemySpawnTimerId.current);
    };
  }, [isShopPhase, isGameOver, isPaused, spawnEnemiesOnTick]);


  const startNextWave = () => {
    setIsShopPhase(false);
    setWave((prevWave) => prevWave + 1);
    setWaveTimer(WAVE_DURATION);
    setEnemies([]); 
    setPlayerProjectiles([]);
    setEnemyProjectiles([]);
    setDamageNumbers([]);
    setPlayer(p => ({ ...p, health: PLAYER_INITIAL_HEALTH }));
    lastPlayerShotTimestampRef.current = {};
    lastLogicUpdateTimestampRef.current = 0; 
    setIsPaused(false);
     if (enemySpawnTimerId.current) clearInterval(enemySpawnTimerId.current); 
  };

  if (isGameOver) {
    return (
      <div className="text-center p-8">
        <h2 className="text-4xl font-bold text-destructive mb-4">Fim de Jogo!</h2>
        <p className="text-xl mb-2">Pontuação Final: {score}</p>
        <p className="text-lg mb-2">Onda Alcançada: {wave}</p>
        <p className="text-lg mb-4">Total XP Coletado: {playerXP}</p>
        <Button
          onClick={() => resetGameState()}
          className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 text-lg"
        >
          Jogar Novamente
        </Button>
         <Button
          onClick={() => resetGameState(true)}
          variant="outline"
          className="mt-4 ml-2 px-6 py-2 text-lg"
        >
          <HomeIcon className="mr-2 h-5 w-5" />
          Menu Principal
        </Button>
      </div>
    );
  }

  if (isShopPhase) {
    return <ShopDialog
              onStartNextWave={startNextWave}
              wave={wave}
              score={score}
              playerXP={playerXP}
              shopOfferings={shopOfferings}
              playerWeapons={playerWeapons}
              onBuyWeapon={handleBuyWeapon}
              onRecycleWeapon={handleRecycleWeapon}
              canAfford={(cost) => playerXP >= cost}
              inventoryFull={playerWeapons.length >= MAX_PLAYER_WEAPONS}
            />;
  }

  return (
    <div className="flex flex-col items-center p-1 sm:p-4 w-full h-full">
      <div className="w-full max-w-2xl flex justify-between items-start mb-1 sm:mb-2">
        <GameHUD score={score} wave={wave} playerHealth={player.health} waveTimer={waveTimer} playerXP={playerXP} />
        <Button
            onClick={() => setIsPaused(!isPaused)}
            variant="outline"
            size="icon"
            className="ml-2 sm:ml-4 mt-1 text-foreground hover:bg-accent hover:text-accent-foreground"
            aria-label={isPaused ? "Continuar jogo" : "Pausar jogo"}
        >
            {isPaused ? <PlayIcon className="h-5 w-5" /> : <PauseIcon className="h-5 w-5" />}
        </Button>
      </div>
      
      <div ref={gameWrapperRef} className="flex items-center justify-center flex-grow w-full overflow-hidden">
        <div 
          style={{ 
            transform: `scale(${scale})`, 
            transformOrigin: 'center center', 
          }}
        >
          <Card className="shadow-2xl overflow-hidden border-2 border-primary">
            <div
              ref={gameAreaRef}
              className="relative bg-muted/30 overflow-hidden"
              style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
              role="application"
              aria-label="Área de jogo Dustborn"
              tabIndex={-1}
            >
              {isPaused && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-50 p-4">
                  <h2 className="text-5xl font-bold text-primary-foreground animate-pulse mb-8">PAUSADO</h2>
                  <PlayerInventoryDisplay weapons={playerWeapons} canRecycle={false} className="w-full max-w-md bg-card/90 mb-6" />
                  <Button
                    onClick={() => resetGameState(true)}
                    variant="secondary"
                    className="text-lg py-3 px-6"
                  >
                    <HomeIcon className="mr-2 h-5 w-5" />
                    Voltar ao Menu Principal
                  </Button>
                </div>
              )}
              <PlayerCharacter x={player.x} y={player.y} width={player.width} height={player.height} isTakingDamage={isPlayerTakingDamage} />
              {enemies.map((enemy) => (
                <EnemyCharacter
                  key={enemy.id} x={enemy.x} y={enemy.y}
                  width={enemy.width} height={enemy.height}
                  health={enemy.health} maxHealth={enemy.maxHealth}
                  type={enemy.type}
                  isStunned={enemy.isStunned}
                />
              ))}
              {xpOrbs.map((orb) => (
                <XPOrb key={orb.id} x={orb.x} y={orb.y} size={orb.size} />
              ))}
              {playerProjectiles.map((proj) => (
                <Projectile
                  key={proj.id}
                  x={proj.x} y={proj.y}
                  size={proj.size}
                  projectileType={proj.projectileType}
                  width={proj.width}
                  height={proj.height}
                />
              ))}
              {enemyProjectiles.map((proj) => (
                <Projectile
                  key={proj.id}
                  x={proj.x} y={proj.y}
                  size={proj.size}
                  projectileType={proj.projectileType}
                />
              ))}
              {damageNumbers.map((dn) => (
                <DamageNumber
                  key={dn.id}
                  x={dn.x}
                  y={dn.y}
                  amount={dn.amount}
                  opacity={dn.opacity}
                  isCritical={dn.isCritical}
                />
              ))}
            </div>
          </Card>
        </div>
      </div>
      
      {deviceType === 'mobile' && !isPaused && !isShopPhase && !isGameOver && (
        <div className="fixed bottom-8 left-8 z-50 grid grid-cols-3 grid-rows-3 gap-2 w-36 h-36 sm:w-48 sm:h-48">
          <div />
          <Button
            variant="outline"
            className="col-start-2 row-start-1 bg-card/70 text-card-foreground hover:bg-accent hover:text-accent-foreground aspect-square p-0"
            onTouchStart={() => handleMobileControl('arrowup', true)}
            onTouchEnd={() => handleMobileControl('arrowup', false)}
            onMouseDown={() => handleMobileControl('arrowup', true)}
            onMouseUp={() => handleMobileControl('arrowup', false)}
            onMouseLeave={() => handleMobileControl('arrowup', false)}
            aria-label="Mover para Cima"
          >
            <ArrowUp className="w-6 h-6 sm:w-8 sm:h-8" />
          </Button>
          <div />

          <Button
            variant="outline"
            className="col-start-1 row-start-2 bg-card/70 text-card-foreground hover:bg-accent hover:text-accent-foreground aspect-square p-0"
            onTouchStart={() => handleMobileControl('arrowleft', true)}
            onTouchEnd={() => handleMobileControl('arrowleft', false)}
            onMouseDown={() => handleMobileControl('arrowleft', true)}
            onMouseUp={() => handleMobileControl('arrowleft', false)}
            onMouseLeave={() => handleMobileControl('arrowleft', false)}
            aria-label="Mover para Esquerda"
          >
            <ArrowLeft className="w-6 h-6 sm:w-8 sm:h-8" />
          </Button>
          <div />
          <Button
            variant="outline"
            className="col-start-3 row-start-2 bg-card/70 text-card-foreground hover:bg-accent hover:text-accent-foreground aspect-square p-0"
            onTouchStart={() => handleMobileControl('arrowright', true)}
            onTouchEnd={() => handleMobileControl('arrowright', false)}
            onMouseDown={() => handleMobileControl('arrowright', true)}
            onMouseUp={() => handleMobileControl('arrowright', false)}
            onMouseLeave={() => handleMobileControl('arrowright', false)}
            aria-label="Mover para Direita"
          >
            <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8" />
          </Button>

          <div />
          <Button
            variant="outline"
            className="col-start-2 row-start-3 bg-card/70 text-card-foreground hover:bg-accent hover:text-accent-foreground aspect-square p-0"
            onTouchStart={() => handleMobileControl('arrowdown', true)}
            onTouchEnd={() => handleMobileControl('arrowdown', false)}
            onMouseDown={() => handleMobileControl('arrowdown', true)}
            onMouseUp={() => handleMobileControl('arrowdown', false)}
            onMouseLeave={() => handleMobileControl('arrowdown', false)}
            aria-label="Mover para Baixo"
          >
            <ArrowDown className="w-6 h-6 sm:w-8 sm:h-8" />
          </Button>
          <div />
        </div>
      )}

      <div className={cn("mt-2 sm:mt-4 text-xs sm:text-sm text-muted-foreground text-center", deviceType === 'mobile' ? 'mb-20 sm:mb-4' : 'mb-4')}>
        {deviceType === 'computer' ? (
            "Use as Teclas de Seta ou WASD para mover. "
        ) : (
            "Use os botões na tela para mover. "
        )}
        A arma dispara automaticamente. Pressione 'P' (computador) ou clique no botão para pausar. Sobreviva!
      </div>
    </div>
  );
}
