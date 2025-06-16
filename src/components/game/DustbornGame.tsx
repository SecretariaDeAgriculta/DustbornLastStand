
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { PauseIcon, PlayIcon } from 'lucide-react';
import type { Weapon, ProjectileType } from '@/config/weapons';
import { initialWeapon, getPurchasableWeapons, getWeaponById } from '@/config/weapons';
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from '@/hooks/use-mobile';
import { VirtualJoystick } from './VirtualJoystick';


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
const ENEMY_ARROCEIRO_XP_VALUE = 15;

const ENEMY_CAODEFAZENDA_SIZE = PLAYER_SIZE * 0.8;
const ENEMY_CAODEFAZENDA_INITIAL_HEALTH = 12;
const ENEMY_CAODEFAZENDA_DAMAGE = 4;
const ENEMY_CAODEFAZENDA_BASE_SPEED = 2.5; // Faster than Arruaceiro
const ENEMY_CAODEFAZENDA_ATTACK_RANGE_SQUARED = (PLAYER_SIZE / 2 + ENEMY_CAODEFAZENDA_SIZE / 2 + 5) ** 2;
const ENEMY_CAODEFAZENDA_ATTACK_COOLDOWN = 700; // Slightly faster attack
const ENEMY_CAODEFAZENDA_XP_VALUE = 20;


const PROJECTILE_SIZE = 8;
const PROJECTILE_SPEED = 10;

const XP_ORB_SIZE = 10;
const WAVE_DURATION = 120;
const ENEMY_SPAWN_INTERVAL_INITIAL = 2500;
const MAX_ENEMIES_BASE = 3;
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

type EnemyType = 'ArruaceiroSaloon' | 'Cão de Fazenda';

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
}


interface DamageNumberData extends Entity {
  amount: number;
  life: number;
  opacity: number;
  isCritical?: boolean;
}


export function DustbornGame() {
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
  const [projectiles, setProjectiles] = useState<ProjectileData[]>([]);
  const [damageNumbers, setDamageNumbers] = useState<DamageNumberData[]>([]);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [waveTimer, setWaveTimer] = useState(WAVE_DURATION);
  const [isShopPhase, setIsShopPhase] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playerXP, setPlayerXP] = useState(0);

  const [playerWeapons, setPlayerWeapons] = useState<Weapon[]>([{...initialWeapon, upgradedThisRound: false}]);
  const [shopOfferings, setShopOfferings] = useState<Weapon[]>([]);

  const activeKeys = useRef<Set<string>>(new Set());
  const enemySpawnTimerId = useRef<NodeJS.Timeout | null>(null);
  const waveIntervalId = useRef<NodeJS.Timeout | null>(null);
  const lastLogicUpdateTimestampRef = useRef(0);
  const lastPlayerShotTimestampRef = useRef<Record<string, number>>({});
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const isMobile = useIsMobile();
  const [joystickInput, setJoystickInput] = useState({ dx: 0, dy: 0 });

  const handleJoystickMove = useCallback((dx: number, dy: number) => {
    setJoystickInput({ dx, dy });
  }, []);

  const resetGameState = useCallback(() => {
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
    setProjectiles([]);
    setDamageNumbers([]);
    setScore(0);
    setWave(1);
    setWaveTimer(WAVE_DURATION);
    setIsShopPhase(false);
    setIsGameOver(false);
    setIsPaused(false);
    setPlayerXP(0);
    setPlayerWeapons([{...initialWeapon, upgradedThisRound: false}]);
    setShopOfferings([]);
    activeKeys.current.clear();
    setJoystickInput({ dx: 0, dy: 0});
    lastLogicUpdateTimestampRef.current = 0;
    lastPlayerShotTimestampRef.current = {};
  }, []);

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
             currentOfferings.push({...weapon, upgradedThisRound: false});
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
            return {
              ...weapon,
              damage: weapon.damage + 1,
              cooldown: Math.max(100, weapon.cooldown - 50),
            };
          }
          return weapon;
        })
      );
      setPlayerXP(prevXP => prevXP - weaponToBuyOrUpgrade.xpCost);
      toast({ title: "Arma Aprimorada!", description: `${weaponToBuyOrUpgrade.name} teve seus atributos melhorados.` });

      setShopOfferings(prevOfferings =>
        prevOfferings.map((offering, index) =>
          index === shopOfferingIndex ? { ...offering, upgradedThisRound: true } : offering
        )
      );

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

        setShopOfferings(prevOfferings =>
          prevOfferings.map((offering, index) =>
            index === shopOfferingIndex ? { ...offering, upgradedThisRound: true } : offering
          )
        );
      } else {
        toast({ title: "Erro na Loja", description: `Não foi possível encontrar a definição da arma ${weaponToBuyOrUpgrade.name}.`, variant: "destructive" });
      }
    }
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
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isGameOver) return;
      if (event.key.toLowerCase() === 'p') {
        setIsPaused(prev => !prev);
        return;
      }
      if (isPaused || isShopPhase || isMobile) return;
      activeKeys.current.add(event.key.toLowerCase());
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (isGameOver || isPaused || isShopPhase || isMobile) return;
      activeKeys.current.delete(event.key.toLowerCase());
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isGameOver, isPaused, isShopPhase, isMobile]);

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
      let usingJoystick = false;

      if (isMobile === true) {
          if (joystickInput.dx !== 0 || joystickInput.dy !== 0) {
            inputDx = joystickInput.dx;
            inputDy = joystickInput.dy;
            usingJoystick = true;
          }
      } else if (isMobile === false) {
        if (activeKeys.current.has('arrowup') || activeKeys.current.has('w')) inputDy -= 1;
        if (activeKeys.current.has('arrowdown') || activeKeys.current.has('s')) inputDy += 1;
        if (activeKeys.current.has('arrowleft') || activeKeys.current.has('a')) inputDx -= 1;
        if (activeKeys.current.has('arrowright') || activeKeys.current.has('d')) inputDx += 1;
      }

      if (inputDx !== 0 || inputDy !== 0) {
        let moveX: number;
        let moveY: number;

        if (usingJoystick) {
            moveX = inputDx * PLAYER_SPEED;
            moveY = inputDy * PLAYER_SPEED;
        } else {
            if (inputDx !== 0 && inputDy !== 0) {
                const length = Math.sqrt(inputDx * inputDx + inputDy * inputDy);
                moveX = (inputDx / length) * PLAYER_SPEED;
                moveY = (inputDy / length) * PLAYER_SPEED;
            } else {
                moveX = inputDx * PLAYER_SPEED;
                moveY = inputDy * PLAYER_SPEED;
            }
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
        if (enemies.length > 0 && now - lastShotTime >= weapon.cooldown) {
          let closestEnemy: Enemy | null = null;
          let minDistanceSquared = weapon.range ** 2;

          const playerCenterX = player.x + player.width / 2;
          const playerCenterY = player.y + player.height / 2;

          for (const enemy of enemies) {
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

            const numProjectiles = weapon.projectilesPerShot || 1;
            const spread = weapon.shotgunSpreadAngle ? weapon.shotgunSpreadAngle * (Math.PI / 180) : 0;

            for (let i = 0; i < numProjectiles; i++) {
              let currentAngle = baseAngle;
              if (numProjectiles > 1 && spread > 0) {
                currentAngle += (i - (numProjectiles - 1) / 2) * (spread / (numProjectiles > 1 ? numProjectiles -1 : 1));
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
                x: playerCenterX - (weapon.projectileType === 'knife' ? (PLAYER_SIZE * 0.5) / 2 : PROJECTILE_SIZE / 2) , // Adjust for knife width
                y: playerCenterY - (weapon.projectileType === 'knife' ? (PLAYER_SIZE * 1.5) / 2 : PROJECTILE_SIZE / 2) , // Adjust for knife height
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
              });
            }
            setProjectiles(prev => [...prev, ...projectilesToSpawn.map(p => ({...p, id: `proj_${Date.now()}_${Math.random()}`}))]);
          }
        }
      });

      if (timestamp - lastLogicUpdateTimestampRef.current >= ENEMY_MOVE_INTERVAL) {
        lastLogicUpdateTimestampRef.current = timestamp;
        const newlyCreatedDamageNumbers: DamageNumberData[] = [];

        setProjectiles(prevProjectiles => {
          const updatedProjectiles = prevProjectiles.map(proj => ({
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
                if (proj.hitEnemyIds.has(enemy.id)) continue;

                const projWidth = proj.width || proj.size;
                const projHeight = proj.height || proj.size;
                const projCenterX = proj.x + projWidth / 2;
                const projCenterY = proj.y + projHeight / 2;
                const enemyCenterX = currentEnemyState.x + currentEnemyState.width / 2;
                const enemyCenterY = currentEnemyState.y + currentEnemyState.height / 2;

                if (Math.abs(projCenterX - enemyCenterX) < (projWidth / 2 + currentEnemyState.width / 2) &&
                    Math.abs(projCenterY - enemyCenterY) < (projHeight / 2 + currentEnemyState.height / 2)) {

                  const damageDealt = proj.damage;
                  currentEnemyState.health -= damageDealt;
                  proj.hitEnemyIds.add(enemy.id);

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

        if (newlyCreatedDamageNumbers.length > 0) {
          setDamageNumbers(prev => [...prev, ...newlyCreatedDamageNumbers]);
        }

        setEnemies(currentEnemies =>
          currentEnemies.map(enemy => {
            let newX = enemy.x;
            let newY = enemy.y;
            let updatedEnemy = {...enemy, attackCooldownTimer: Math.max(0, enemy.attackCooldownTimer - ENEMY_MOVE_INTERVAL) };

            const deltaPlayerX = (player.x + player.width / 2) - (updatedEnemy.x + updatedEnemy.width / 2);
            const deltaPlayerY = (player.y + player.height / 2) - (updatedEnemy.y + updatedEnemy.height / 2);
            const distToPlayerSquared = deltaPlayerX * deltaPlayerX + deltaPlayerY * deltaPlayerY;

            if (distToPlayerSquared > (updatedEnemy.width / 4 + player.width / 4) ** 2) { // Prevents enemies from overlapping too much with player
              const dist = Math.sqrt(distToPlayerSquared);
              newX += (deltaPlayerX / dist) * updatedEnemy.speed;
              newY += (deltaPlayerY / dist) * updatedEnemy.speed;
            }

            if (distToPlayerSquared < updatedEnemy.attackRangeSquared && updatedEnemy.attackCooldownTimer <= 0) {
               setPlayer(p => {
                 const newHealth = Math.max(0, p.health - updatedEnemy.damage);
                 if (newHealth <= 0 && !isGameOver) {
                   setIsGameOver(true);
                 }
                 return {...p, health: newHealth };
               });
               updatedEnemy.attackCooldownTimer = updatedEnemy.attackCooldown;
            }
            return { ...updatedEnemy, x: newX, y: newY };
          })
        );

        setXpOrbs((currentOrbs) => {
          const collectedOrbValues: number[] = [];
          const remainingOrbs = currentOrbs.filter((orb) => {
            const distX = (player.x + player.width / 2) - (orb.x + orb.size / 2);
            const distY = (player.y + player.height / 2) - (orb.y + orb.size / 2);
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

      if (player.health <= 0 && !isGameOver) {
        setIsGameOver(true);
      }

      if (!isGameOver && !isShopPhase && !isPaused) {
        animationFrameId = requestAnimationFrame(gameTick);
      }
    };

    animationFrameId = requestAnimationFrame(gameTick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isGameOver, isShopPhase, isPaused, player, enemies, playerWeapons, wave, score, playerXP, toast, generateShopOfferings, isMobile, joystickInput]);

  useEffect(() => {
    if (isGameOver || isShopPhase || isPaused) {
      if (waveIntervalId.current) clearInterval(waveIntervalId.current);
      return;
    }
    waveIntervalId.current = setInterval(() => {
      setWaveTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(waveIntervalId.current!);
          setIsShopPhase(true);
          generateShopOfferings();
          if(enemySpawnTimerId.current) clearTimeout(enemySpawnTimerId.current);
          setJoystickInput({ dx: 0, dy: 0});
          return WAVE_DURATION;
        }
        return prevTimer - 1;
      });
    }, 1000);
    return () => {
      if (waveIntervalId.current) clearInterval(waveIntervalId.current);
    };
  }, [isGameOver, isShopPhase, isPaused, wave, generateShopOfferings]);


  const spawnEnemy = useCallback(() => {
    const maxEnemiesForWave = MAX_ENEMIES_BASE + wave * 2;
    if (isShopPhase || isGameOver || isPaused || enemies.length >= maxEnemiesForWave) {
        return;
    }

    let newX, newY;
    let attempts = 0;
    const maxAttempts = 10;

    const currentPlayerX = player.x;
    const currentPlayerY = player.y;

    do {
        const side = Math.floor(Math.random() * 4);
        const margin = 50;

        if (side === 0) { // Top
            newX = Math.random() * GAME_WIDTH; newY = -ENEMY_ARROCEIRO_SIZE - margin;
        } else if (side === 1) { // Bottom
            newX = Math.random() * GAME_WIDTH; newY = GAME_HEIGHT + margin;
        } else if (side === 2) { // Left
            newX = -ENEMY_ARROCEIRO_SIZE - margin; newY = Math.random() * GAME_HEIGHT;
        } else { // Right
            newX = GAME_WIDTH + margin; newY = Math.random() * GAME_HEIGHT;
        }
        attempts++;
    } while (
        (Math.abs(newX - currentPlayerX) < PLAYER_SIZE * 5 && Math.abs(newY - currentPlayerY) < PLAYER_SIZE * 5) && attempts < maxAttempts
    );

    let enemyToSpawn: Enemy;
    const spawnDogChance = 0.35;

    if (wave >= 2 && Math.random() < spawnDogChance) {
        const dogHealth = ENEMY_CAODEFAZENDA_INITIAL_HEALTH + (wave - 2) * 2;
        const dogSpeed = ENEMY_CAODEFAZENDA_BASE_SPEED + (wave - 2) * 0.15;
        enemyToSpawn = {
            id: `enemy_${Date.now()}_${Math.random()}`, x: newX, y: newY,
            width: ENEMY_CAODEFAZENDA_SIZE,
            height: ENEMY_CAODEFAZENDA_SIZE,
            health: dogHealth, maxHealth: dogHealth,
            type: 'Cão de Fazenda',
            xpValue: ENEMY_CAODEFAZENDA_XP_VALUE + wave,
            attackCooldownTimer: Math.random() * ENEMY_CAODEFAZENDA_ATTACK_COOLDOWN,
            speed: dogSpeed,
            damage: ENEMY_CAODEFAZENDA_DAMAGE,
            attackRangeSquared: ENEMY_CAODEFAZENDA_ATTACK_RANGE_SQUARED,
            attackCooldown: ENEMY_CAODEFAZENDA_ATTACK_COOLDOWN,
        };
    } else {
        const arruaceiroHealth = ENEMY_ARROCEIRO_INITIAL_HEALTH + (wave - 1) * 3;
        const arruaceiroSpeed = ENEMY_ARROCEIRO_BASE_SPEED + (wave - 1) * 0.1;
        enemyToSpawn = {
            id: `enemy_${Date.now()}_${Math.random()}`, x: newX, y: newY,
            width: ENEMY_ARROCEIRO_SIZE,
            height: ENEMY_ARROCEIRO_SIZE,
            health: arruaceiroHealth, maxHealth: arruaceiroHealth,
            type: 'ArruaceiroSaloon',
            xpValue: ENEMY_ARROCEIRO_XP_VALUE + wave,
            attackCooldownTimer: Math.random() * ENEMY_ARROCEIRO_ATTACK_COOLDOWN,
            speed: arruaceiroSpeed,
            damage: ENEMY_ARROCEIRO_DAMAGE,
            attackRangeSquared: ENEMY_ARROCEIRO_ATTACK_RANGE_SQUARED,
            attackCooldown: ENEMY_ARROCEIRO_ATTACK_COOLDOWN,
        };
    }

    setEnemies((prevEnemies) => [...prevEnemies, enemyToSpawn]);

  }, [wave, player.x, player.y, enemies.length, isShopPhase, isGameOver, isPaused]);

  useEffect(() => {
    if (isShopPhase || isGameOver || isPaused) {
      if (enemySpawnTimerId.current) clearTimeout(enemySpawnTimerId.current);
      return;
    }

    const spawnLoop = () => {
      spawnEnemy();
      const nextSpawnTime = Math.max(300, ENEMY_SPAWN_INTERVAL_INITIAL - wave * 100);
      enemySpawnTimerId.current = setTimeout(spawnLoop, nextSpawnTime);
    };

    spawnLoop();

    return () => {
      if (enemySpawnTimerId.current) clearTimeout(enemySpawnTimerId.current);
    };
  }, [isShopPhase, isGameOver, isPaused, spawnEnemy, wave]);

  const startNextWave = () => {
    setIsShopPhase(false);
    setWave((prevWave) => prevWave + 1);
    setWaveTimer(WAVE_DURATION);
    setEnemies([]);
    setProjectiles([]);
    setDamageNumbers([]);
    setXpOrbs([]);
    setPlayer(p => ({ ...p, health: PLAYER_INITIAL_HEALTH }));
    lastPlayerShotTimestampRef.current = {};
    lastLogicUpdateTimestampRef.current = 0;
    setIsPaused(false);
    setJoystickInput({ dx: 0, dy: 0});
  };

  if (isGameOver) {
    return (
      <div className="text-center p-8">
        <h2 className="text-4xl font-bold text-destructive mb-4">Fim de Jogo!</h2>
        <p className="text-xl mb-2">Pontuação Final: {score}</p>
        <p className="text-lg mb-2">Wave Alcançada: {wave}</p>
        <p className="text-lg mb-4">Total XP Coletado: {playerXP}</p>
        <Button
          onClick={resetGameState}
          className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 text-lg"
        >
          Jogar Novamente
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
    <div className="flex flex-col items-center p-4">
      <div className="w-full max-w-2xl flex justify-between items-start mb-2">
        <GameHUD score={score} wave={wave} playerHealth={player.health} waveTimer={waveTimer} playerXP={playerXP} />
        <Button
            onClick={() => setIsPaused(!isPaused)}
            variant="outline"
            size="icon"
            className="ml-4 mt-1 text-foreground hover:bg-accent hover:text-accent-foreground"
            aria-label={isPaused ? "Continuar jogo" : "Pausar jogo"}
        >
            {isPaused ? <PlayIcon className="h-5 w-5" /> : <PauseIcon className="h-5 w-5" />}
        </Button>
      </div>
      <Card className="mt-0 shadow-2xl overflow-hidden border-2 border-primary">
        <div
          ref={gameAreaRef}
          className="relative bg-muted/30 overflow-hidden"
          style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
          role="application"
          aria-label="Dustborn game area"
          tabIndex={-1}
        >
          {isPaused && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-50 p-4">
              <h2 className="text-5xl font-bold text-primary-foreground animate-pulse mb-8">PAUSADO</h2>
              <PlayerInventoryDisplay weapons={playerWeapons} canRecycle={false} className="w-full max-w-md bg-card/90" />
            </div>
          )}
          <PlayerCharacter x={player.x} y={player.y} width={player.width} height={player.height} />
          {enemies.map((enemy) => (
            <EnemyCharacter
              key={enemy.id} x={enemy.x} y={enemy.y}
              width={enemy.width} height={enemy.height}
              health={enemy.health} maxHealth={enemy.maxHealth}
              type={enemy.type}
            />
          ))}
          {xpOrbs.map((orb) => (
            <XPOrb key={orb.id} x={orb.x} y={orb.y} size={orb.size} />
          ))}
          {projectiles.map((proj) => (
            <Projectile
              key={proj.id}
              x={proj.x} y={proj.y}
              size={proj.size}
              projectileType={proj.projectileType}
              width={proj.width}
              height={proj.height}
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
       <div className="mt-4 text-sm text-muted-foreground text-center">
        {isMobile === true ? "Use o joystick virtual para mover." : "Use as Teclas de Seta ou WASD para mover."}
        A arma dispara automaticamente. Pressione 'P' ou clique no botão para pausar. Sobreviva!
      </div>
      {isMobile === true && !isShopPhase && !isGameOver && !isPaused && (
         <VirtualJoystick onMove={handleJoystickMove} />
      )}
    </div>
  );
}
