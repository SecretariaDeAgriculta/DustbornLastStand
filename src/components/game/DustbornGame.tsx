
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
import { PauseIcon, PlayIcon } from 'lucide-react';
import type { Weapon } from '@/config/weapons';
import { initialWeapon, commonWeapons } from '@/config/weapons';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

// Player Stats
const PLAYER_SIZE = 30;
const PLAYER_SPEED = 5;
const PLAYER_INITIAL_HEALTH = 100;

// Enemy: Arruaceiro de Saloon (Saloon Brawler)
const ENEMY_ARROCEIRO_SIZE = PLAYER_SIZE;
const ENEMY_ARROCEIRO_INITIAL_HEALTH = 10;
const ENEMY_ARROCEIRO_DAMAGE = 2;
const ENEMY_ARROCEIRO_BASE_SPEED = 1.8;
const ENEMY_ARROCEIRO_ATTACK_RANGE_SQUARED = (PLAYER_SIZE / 2 + ENEMY_ARROCEIRO_SIZE / 2 + 5) ** 2; 
const ENEMY_ARROCEIRO_ATTACK_COOLDOWN = 800; // ms
const ENEMY_ARROCEIRO_XP_VALUE = 15;
const ENEMY_ARROCEIRO_COLOR = '#60a5fa'; // Lighter blue

// Projectile Stats (base, can be overridden by weapon)
const PROJECTILE_SIZE = 8;
const PROJECTILE_SPEED = 10;

const XP_ORB_SIZE = 10;
const WAVE_DURATION = 120; // 2 minutes in seconds
const ENEMY_SPAWN_INTERVAL_INITIAL = 2500; // milliseconds
const MAX_ENEMIES_BASE = 3; 
const XP_COLLECTION_RADIUS_SQUARED = (PLAYER_SIZE / 2 + XP_ORB_SIZE / 2 + 30) ** 2;
const ENEMY_MOVE_INTERVAL = 50; // ms 

// Damage Number constants
const DAMAGE_NUMBER_LIFESPAN = 700; // ms
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

interface Enemy extends Entity {
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  type: 'ArruaceiroSaloon';
  xpValue: number;
  attackCooldownTimer: number;
  speed: number;
  color: string;
}

interface XPOrbData extends Entity {
  size: number;
  value: number;
}

interface ProjectileData extends Entity {
  size: number;
  dx: number;
  dy: number;
  damage: number;
  traveledDistance: number;
  maxRange: number;
  critical?: boolean;
  penetrationLeft?: number;
  hitEnemyIds: Set<string>; 
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
  
  const [playerWeapons, setPlayerWeapons] = useState<Weapon[]>([initialWeapon]);
  
  const activeKeys = useRef<Set<string>>(new Set());
  const enemySpawnTimerId = useRef<NodeJS.Timeout | null>(null);
  const waveIntervalId = useRef<NodeJS.Timeout | null>(null);
  const lastLogicUpdateTimestampRef = useRef(0);
  const lastPlayerShotTimestampRef = useRef<Record<string, number>>({}); 
  const gameAreaRef = useRef<HTMLDivElement>(null);

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
    setPlayerWeapons([initialWeapon]);
    activeKeys.current.clear();
    lastLogicUpdateTimestampRef.current = 0;
    lastPlayerShotTimestampRef.current = {};
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isGameOver) return;
      if (event.key.toLowerCase() === 'p') {
        setIsPaused(prev => !prev);
        return;
      }
      if (isPaused) return;
      activeKeys.current.add(event.key.toLowerCase());
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (isGameOver || isPaused) return;
      activeKeys.current.delete(event.key.toLowerCase());
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isGameOver, isPaused]);

  useEffect(() => {
    if (isGameOver || isShopPhase || isPaused) return;

    let animationFrameId: number;

    const gameTick = (timestamp: number) => {
      if (isPaused) { 
        animationFrameId = requestAnimationFrame(gameTick);
        return;
      }

      let dx = 0;
      let dy = 0;
      if (activeKeys.current.has('arrowup') || activeKeys.current.has('w')) dy -= 1;
      if (activeKeys.current.has('arrowdown') || activeKeys.current.has('s')) dy += 1;
      if (activeKeys.current.has('arrowleft') || activeKeys.current.has('a')) dx -= 1;
      if (activeKeys.current.has('arrowright') || activeKeys.current.has('d')) dx += 1;

      if (dx !== 0 || dy !== 0) {
        let moveX = dx * PLAYER_SPEED;
        let moveY = dy * PLAYER_SPEED;
        if (dx !== 0 && dy !== 0) {
          const length = Math.sqrt(dx * dx + dy * dy);
          moveX = (dx / length) * PLAYER_SPEED;
          moveY = (dy / length) * PLAYER_SPEED;
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
                x: playerCenterX - PROJECTILE_SIZE / 2,
                y: playerCenterY - PROJECTILE_SIZE / 2,
                size: PROJECTILE_SIZE,
                dx: projDx,
                dy: projDy,
                damage: damage,
                traveledDistance: 0,
                maxRange: weapon.range,
                critical: isCritical,
                penetrationLeft: weapon.penetrationCount || 0,
                hitEnemyIds: new Set<string>(),
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
              proj.x > -proj.size && proj.x < GAME_WIDTH && 
              proj.y > -proj.size && proj.y < GAME_HEIGHT &&
              proj.traveledDistance < proj.maxRange
          );

          const newProjectilesAfterHits = [...updatedProjectiles];
          
          setEnemies(currentEnemies => {
            let newHitScore = 0;
            const newXpOrbsFromHits: XPOrbData[] = [];
            
            const nextEnemiesState = currentEnemies.map(enemy => {
              let currentEnemyState = {...enemy};

              for (let i = newProjectilesAfterHits.length - 1; i >= 0; i--) {
                const proj = newProjectilesAfterHits[i];
                if (proj.hitEnemyIds.has(enemy.id)) continue;

                const projCenterX = proj.x + proj.size / 2;
                const projCenterY = proj.y + proj.size / 2;
                const enemyCenterX = currentEnemyState.x + currentEnemyState.width / 2;
                const enemyCenterY = currentEnemyState.y + currentEnemyState.height / 2;

                if (Math.abs(projCenterX - enemyCenterX) < (proj.size / 2 + currentEnemyState.width / 2) &&
                    Math.abs(projCenterY - enemyCenterY) < (proj.size / 2 + currentEnemyState.height / 2)) {
                  
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

                  if (proj.penetrationLeft !== undefined && proj.penetrationLeft > 0) {
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

            if (distToPlayerSquared > (updatedEnemy.width / 4 + player.width / 4) ** 2) { 
              const dist = Math.sqrt(distToPlayerSquared);
              newX += (deltaPlayerX / dist) * updatedEnemy.speed;
              newY += (deltaPlayerY / dist) * updatedEnemy.speed;
            }
            
            if (distToPlayerSquared < ENEMY_ARROCEIRO_ATTACK_RANGE_SQUARED && updatedEnemy.attackCooldownTimer <= 0) {
               setPlayer(p => {
                 const newHealth = Math.max(0, p.health - ENEMY_ARROCEIRO_DAMAGE);
                 if (newHealth <= 0 && !isGameOver) {
                   setIsGameOver(true);
                 }
                 return {...p, health: newHealth };
               });
               updatedEnemy.attackCooldownTimer = ENEMY_ARROCEIRO_ATTACK_COOLDOWN;
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
  }, [isGameOver, isShopPhase, isPaused, player, enemies, playerWeapons, wave, score]); 

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
          if(enemySpawnTimerId.current) clearTimeout(enemySpawnTimerId.current);
          return WAVE_DURATION; 
        }
        return prevTimer - 1;
      });
    }, 1000);
    return () => {
      if (waveIntervalId.current) clearInterval(waveIntervalId.current);
    };
  }, [isGameOver, isShopPhase, isPaused, wave]);


  const spawnEnemy = useCallback(() => {
    const maxEnemiesForWave = MAX_ENEMIES_BASE + wave * 2; 
    if (isShopPhase || isGameOver || isPaused || enemies.length >= maxEnemiesForWave) {
        return;
    }

    const enemyHealth = ENEMY_ARROCEIRO_INITIAL_HEALTH + (wave - 1) * 3; // Health scales from Wave 2 onwards
    const enemySpeed = ENEMY_ARROCEIRO_BASE_SPEED + (wave -1) * 0.1; // Speed scales from Wave 2 onwards
    let newX, newY;
    let attempts = 0;
    const maxAttempts = 10; 
    
    const currentPlayerX = player.x;
    const currentPlayerY = player.y;

    do {
        const side = Math.floor(Math.random() * 4); 
        const margin = 50; 

        if (side === 0) { 
            newX = Math.random() * GAME_WIDTH; newY = -ENEMY_ARROCEIRO_SIZE - margin;
        } else if (side === 1) { 
            newX = Math.random() * GAME_WIDTH; newY = GAME_HEIGHT + margin;
        } else if (side === 2) { 
            newX = -ENEMY_ARROCEIRO_SIZE - margin; newY = Math.random() * GAME_HEIGHT;
        } else { 
            newX = GAME_WIDTH + margin; newY = Math.random() * GAME_HEIGHT;
        }
        attempts++;
    } while (
        (Math.abs(newX - currentPlayerX) < PLAYER_SIZE * 5 && Math.abs(newY - currentPlayerY) < PLAYER_SIZE * 5) && attempts < maxAttempts
    );
    
    setEnemies((prevEnemies) => [
      ...prevEnemies,
      {
        id: `enemy_${Date.now()}_${Math.random()}`, x: newX, y: newY, 
        width: ENEMY_ARROCEIRO_SIZE, 
        height: ENEMY_ARROCEIRO_SIZE,
        health: enemyHealth, maxHealth: enemyHealth,
        type: 'ArruaceiroSaloon',
        color: ENEMY_ARROCEIRO_COLOR,
        xpValue: ENEMY_ARROCEIRO_XP_VALUE + wave, 
        attackCooldownTimer: Math.random() * ENEMY_ARROCEIRO_ATTACK_COOLDOWN, 
        speed: enemySpeed,
      },
    ]);
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
  };

  if (isGameOver) {
    return (
      <div className="text-center p-8">
        <h2 className="text-4xl font-bold text-destructive mb-4">Game Over!</h2>
        <p className="text-xl mb-2">Final Score: {score}</p>
        <p className="text-lg mb-2">Wave Reached: {wave}</p>
        <p className="text-lg mb-4">Total XP Collected: {playerXP}</p>
        <Button 
          onClick={resetGameState}
          className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 text-lg"
        >
          Play Again
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
              availableWeapons={commonWeapons} 
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
            aria-label={isPaused ? "Resume game" : "Pause game"}
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
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
              <h2 className="text-5xl font-bold text-primary-foreground animate-pulse">PAUSED</h2>
            </div>
          )}
          <PlayerCharacter x={player.x} y={player.y} width={player.width} height={player.height} />
          {enemies.map((enemy) => (
            <EnemyCharacter 
              key={enemy.id} x={enemy.x} y={enemy.y} 
              width={enemy.width} height={enemy.height}
              health={enemy.health} maxHealth={enemy.maxHealth}
              color={enemy.color}
            />
          ))}
          {xpOrbs.map((orb) => (
            <XPOrb key={orb.id} x={orb.x} y={orb.y} size={orb.size} />
          ))}
          {projectiles.map((proj) => (
            <Projectile key={proj.id} x={proj.x} y={proj.y} size={proj.size} />
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
       <div className="mt-4 text-sm text-muted-foreground">
        Use Arrow Keys or WASD to move. Weapon fires automatically. Press 'P' or click the button to pause. Survive!
      </div>
    </div>
  );
}
