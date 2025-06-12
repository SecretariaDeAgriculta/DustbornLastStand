
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PlayerCharacter } from './PlayerCharacter';
import { EnemyCharacter } from './EnemyCharacter';
import { GameHUD } from './GameHUD';
import { Card } from '@/components/ui/card';
import { XPOrb } from './XPOrb';
import { ShopDialog } from './ShopDialog';
import { Button } from '@/components/ui/button';
import { Projectile } from './Projectile'; // New component for projectiles

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

// Player Stats
const PLAYER_SIZE = 30; // Collision box size
const PLAYER_SPEED = 5;
const PLAYER_INITIAL_HEALTH = 100;

// Enemy: Arruaceiro de Saloon (Saloon Brawler)
const ENEMY_ARROCEIRO_SPRITE_WIDTH = 50;
const ENEMY_ARROCEIRO_SPRITE_HEIGHT = 70;
const ENEMY_ARROCEIRO_INITIAL_HEALTH = 10;
const ENEMY_ARROCEIRO_DAMAGE = 2;
const ENEMY_ARROCEIRO_BASE_SPEED = 1.8; // "High" speed
const ENEMY_ARROCEIRO_ATTACK_RANGE_SQUARED = (PLAYER_SIZE / 2 + ENEMY_ARROCEIRO_SPRITE_WIDTH / 2) ** 2; // Melee
const ENEMY_ARROCEIRO_ATTACK_COOLDOWN = 800; // ms, "fast punches"
const ENEMY_ARROCEIRO_XP_VALUE = 15;

// Player Weapon: Revólver Enferrujado
const PLAYER_WEAPON_DAMAGE = 4;
const PLAYER_WEAPON_COOLDOWN = 1000; // ms, "slow cadence"
const PLAYER_WEAPON_RANGE = 300; // "medium range" - projectile max travel distance

// Projectile Stats
const PROJECTILE_SIZE = 8;
const PROJECTILE_SPEED = 8;

const XP_ORB_SIZE = 10;
const WAVE_DURATION = 120; // 2 minutes in seconds
const ENEMY_SPAWN_INTERVAL_INITIAL = 2500; // milliseconds
const MAX_ENEMIES_INITIAL = 3;
const XP_COLLECTION_RADIUS_SQUARED = (PLAYER_SIZE / 2 + XP_ORB_SIZE / 2 + 20) ** 2;
const ENEMY_MOVE_INTERVAL = 50; // ms

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
  type: 'ArruaceiroSaloon'; // For now, only one type
  spriteUrl?: string;
  xpValue: number;
  attackCooldownTimer: number;
  speed: number;
}

interface XPOrbData extends Entity {
  size: number;
  value: number;
}

interface ProjectileData extends Entity {
  size: number;
  dx: number;
  dy: number;
  traveledDistance: number;
  maxRange: number;
}

interface Weapon {
  id: string;
  name: string;
  damage: number;
  cooldown: number;
  range: number;
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
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [waveTimer, setWaveTimer] = useState(WAVE_DURATION);
  const [isShopPhase, setIsShopPhase] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [playerXP, setPlayerXP] = useState(0);
  const [playerWeapons, setPlayerWeapons] = useState<Weapon[]>([
    { id: 'w1', name: 'Revólver Enferrujado', damage: PLAYER_WEAPON_DAMAGE, cooldown: PLAYER_WEAPON_COOLDOWN, range: PLAYER_WEAPON_RANGE },
  ]);
  
  const activeKeys = useRef<Set<string>>(new Set());
  const enemySpawnTimerId = useRef<NodeJS.Timeout | null>(null);
  const waveIntervalId = useRef<NodeJS.Timeout | null>(null);
  const lastEnemyMoveTimestampRef = useRef(0);
  const lastPlayerShotTimestampRef = useRef(0);
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
    setScore(0);
    setWave(1);
    setWaveTimer(WAVE_DURATION);
    setIsShopPhase(false);
    setIsGameOver(false);
    setPlayerXP(0);
    setPlayerWeapons([{ id: 'w1', name: 'Revólver Enferrujado', damage: PLAYER_WEAPON_DAMAGE, cooldown: PLAYER_WEAPON_COOLDOWN, range: PLAYER_WEAPON_RANGE }]);
    activeKeys.current.clear();
    lastEnemyMoveTimestampRef.current = 0;
    lastPlayerShotTimestampRef.current = 0;
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isGameOver) return;
      activeKeys.current.add(event.key.toLowerCase());
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (isGameOver) return;
      activeKeys.current.delete(event.key.toLowerCase());
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    const handleMouseDown = (event: MouseEvent) => {
      if (isGameOver || isShopPhase || !gameAreaRef.current) return;
      if (event.button === 0) { // Left click
        const now = Date.now();
        const currentWeapon = playerWeapons[0]; // Assuming first weapon is active
        if (now - lastPlayerShotTimestampRef.current >= currentWeapon.cooldown) {
          lastPlayerShotTimestampRef.current = now;
          
          const gameAreaRect = gameAreaRef.current.getBoundingClientRect();
          const mouseX = event.clientX - gameAreaRect.left;
          const mouseY = event.clientY - gameAreaRect.top;

          const playerCenterX = player.x + player.width / 2;
          const playerCenterY = player.y + player.height / 2;

          const angle = Math.atan2(mouseY - playerCenterY, mouseX - playerCenterX);
          const dx = Math.cos(angle);
          const dy = Math.sin(angle);

          setProjectiles(prev => [...prev, {
            id: `proj_${Date.now()}`,
            x: playerCenterX - PROJECTILE_SIZE / 2,
            y: playerCenterY - PROJECTILE_SIZE / 2,
            size: PROJECTILE_SIZE,
            dx,
            dy,
            traveledDistance: 0,
            maxRange: currentWeapon.range,
          }]);
        }
      }
    };
    gameAreaRef.current?.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      gameAreaRef.current?.removeEventListener('mousedown', handleMouseDown);
    };
  }, [isGameOver, isShopPhase, player.x, player.y, player.width, player.height, playerWeapons]);

  // Unified Game Loop
  useEffect(() => {
    if (isGameOver || isShopPhase) return;

    let animationFrameId: number;

    const gameTick = (timestamp: number) => {
      // Player Movement
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

      // Projectile Movement & Collision
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

        const newEnemies: Enemy[] = [];
        let newScore = score;
        const newXpOrbs: XPOrbData[] = [];

        for (const enemy of enemies) {
          let currentEnemy = {...enemy};
          let enemyHitThisFrame = false;
          
          for (const proj of updatedProjectiles) {
            // Simple AABB collision for projectile vs enemy
            const projCenterX = proj.x + proj.size / 2;
            const projCenterY = proj.y + proj.size / 2;
            const enemyCenterX = currentEnemy.x + currentEnemy.width / 2;
            const enemyCenterY = currentEnemy.y + currentEnemy.height / 2;

            if (Math.abs(projCenterX - enemyCenterX) < (proj.size / 2 + currentEnemy.width / 2) &&
                Math.abs(projCenterY - enemyCenterY) < (proj.size / 2 + currentEnemy.height / 2)) {
              
              currentEnemy.health -= playerWeapons[0].damage;
              // Mark projectile for removal by filtering it out later
              updatedProjectiles.splice(updatedProjectiles.indexOf(proj), 1); 
              enemyHitThisFrame = true; 
              break; 
            }
          }

          if (currentEnemy.health <= 0) {
            newScore += currentEnemy.xpValue * 5;
            newXpOrbs.push({ 
              id: `xp_${Date.now()}_${Math.random()}`, 
              x: currentEnemy.x + currentEnemy.width / 2 - XP_ORB_SIZE / 2, 
              y: currentEnemy.y + currentEnemy.height / 2 - XP_ORB_SIZE / 2, 
              size: XP_ORB_SIZE, 
              value: currentEnemy.xpValue 
            });
          } else {
            newEnemies.push(currentEnemy);
          }
        }
        if (newXpOrbs.length > 0) setXpOrbs(prev => [...prev, ...newXpOrbs]);
        if (newScore !== score) setScore(newScore);
        setEnemies(newEnemies);
        return updatedProjectiles;
      });


      // Enemy Movement & Attack
      if (timestamp - lastEnemyMoveTimestampRef.current >= ENEMY_MOVE_INTERVAL) {
        setEnemies(currentEnemies =>
          currentEnemies.map(enemy => {
            let newX = enemy.x;
            let newY = enemy.y;
            let updatedEnemy = {...enemy, attackCooldownTimer: Math.max(0, enemy.attackCooldownTimer - ENEMY_MOVE_INTERVAL) };

            const deltaPlayerX = (player.x + player.width / 2) - (enemy.x + enemy.width / 2);
            const deltaPlayerY = (player.y + player.height / 2) - (enemy.y + enemy.height / 2);
            const distToPlayerSquared = deltaPlayerX * deltaPlayerX + deltaPlayerY * deltaPlayerY;

            if (distToPlayerSquared > (enemy.width / 2) ** 2) { 
              const dist = Math.sqrt(distToPlayerSquared);
              newX += (deltaPlayerX / dist) * updatedEnemy.speed;
              newY += (deltaPlayerY / dist) * updatedEnemy.speed;
            }
            
            if (distToPlayerSquared < ENEMY_ARROCEIRO_ATTACK_RANGE_SQUARED && updatedEnemy.attackCooldownTimer <= 0) {
               setPlayer(p => ({...p, health: Math.max(0, p.health - ENEMY_ARROCEIRO_DAMAGE) }));
               updatedEnemy.attackCooldownTimer = ENEMY_ARROCEIRO_ATTACK_COOLDOWN;
            }
            return { ...updatedEnemy, x: newX, y: newY };
          })
        );
        lastEnemyMoveTimestampRef.current = timestamp;
      }

      // XP Orb Collection
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
          // Score is now updated when enemy is defeated
        }
        return remainingOrbs;
      });
      
      if (player.health <= 0) {
        setIsGameOver(true);
        return; 
      }

      animationFrameId = requestAnimationFrame(gameTick);
    };

    animationFrameId = requestAnimationFrame(gameTick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isGameOver, isShopPhase, player, wave, enemies, score, playerWeapons]); 

  // Wave Timer Logic
  useEffect(() => {
    if (isGameOver || isShopPhase) {
      if (waveIntervalId.current) clearInterval(waveIntervalId.current);
      return;
    }
    waveIntervalId.current = setInterval(() => {
      setWaveTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(waveIntervalId.current!);
          setIsShopPhase(true);
          // Do not clear enemies here, let them persist until shop is exited or new wave logic handles it.
          if(enemySpawnTimerId.current) clearTimeout(enemySpawnTimerId.current);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
    return () => {
      if (waveIntervalId.current) clearInterval(waveIntervalId.current);
    };
  }, [isGameOver, isShopPhase, wave]);

  const spawnEnemy = useCallback(() => {
    if (isShopPhase || isGameOver || enemies.length >= MAX_ENEMIES_INITIAL + wave * 3) return;

    const enemyHealth = ENEMY_ARROCEIRO_INITIAL_HEALTH + wave * 5; // Scales health
    const enemySpeed = ENEMY_ARROCEIRO_BASE_SPEED + wave * 0.15;
    let newX, newY;
    let attempts = 0;
    const maxAttempts = 10;

    do {
        const side = Math.floor(Math.random() * 4);
        if (side === 0) { 
            newX = Math.random() * (GAME_WIDTH - ENEMY_ARROCEIRO_SPRITE_WIDTH); newY = -ENEMY_ARROCEIRO_SPRITE_HEIGHT;
        } else if (side === 1) {
            newX = Math.random() * (GAME_WIDTH - ENEMY_ARROCEIRO_SPRITE_WIDTH); newY = GAME_HEIGHT;
        } else if (side === 2) {
            newX = -ENEMY_ARROCEIRO_SPRITE_WIDTH; newY = Math.random() * (GAME_HEIGHT - ENEMY_ARROCEIRO_SPRITE_HEIGHT);
        } else { 
            newX = GAME_WIDTH; newY = Math.random() * (GAME_HEIGHT - ENEMY_ARROCEIRO_SPRITE_HEIGHT);
        }
        attempts++;
    } while (
        (Math.abs(newX - player.x) < PLAYER_SIZE * 4 && Math.abs(newY - player.y) < PLAYER_SIZE * 4) && attempts < maxAttempts
    );

    setEnemies((prevEnemies) => [
      ...prevEnemies,
      {
        id: `enemy_${Date.now()}_${Math.random()}`, x: newX, y: newY, 
        width: ENEMY_ARROCEIRO_SPRITE_WIDTH, 
        height: ENEMY_ARROCEIRO_SPRITE_HEIGHT,
        health: enemyHealth, maxHealth: enemyHealth,
        type: 'ArruaceiroSaloon',
        spriteUrl: '/assets/enemy_arruaceiro_saloon.png',
        xpValue: ENEMY_ARROCEIRO_XP_VALUE + wave * 2,
        attackCooldownTimer: 0,
        speed: enemySpeed,
      },
    ]);
  }, [wave, player.x, player.y, enemies.length, isShopPhase, isGameOver]);

  useEffect(() => {
    if (isShopPhase || isGameOver) {
      if (enemySpawnTimerId.current) clearTimeout(enemySpawnTimerId.current);
      return;
    }
    
    const spawnLoop = () => {
      spawnEnemy();
      const nextSpawnTime = Math.max(500, ENEMY_SPAWN_INTERVAL_INITIAL - wave * 150);
      enemySpawnTimerId.current = setTimeout(spawnLoop, nextSpawnTime);
    };
    
    spawnLoop();
    
    return () => {
      if (enemySpawnTimerId.current) clearTimeout(enemySpawnTimerId.current);
    };
  }, [isShopPhase, isGameOver, spawnEnemy, wave]);
  
  const startNextWave = () => {
    setIsShopPhase(false);
    setWave((prevWave) => prevWave + 1);
    setWaveTimer(WAVE_DURATION);
    setEnemies([]); // Clear remaining enemies from previous wave
    setProjectiles([]); // Clear remaining projectiles
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
    return <ShopDialog onStartNextWave={startNextWave} wave={wave} score={score} playerXP={playerXP} />;
  }

  return (
    <div className="flex flex-col items-center p-4">
      <GameHUD score={score} wave={wave} playerHealth={player.health} waveTimer={waveTimer} playerXP={playerXP} />
      <Card className="mt-4 shadow-2xl overflow-hidden border-2 border-primary">
        <div
          ref={gameAreaRef}
          className="relative bg-muted/30 overflow-hidden cursor-crosshair"
          style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
          role="application"
          aria-label="Dustborn game area"
          tabIndex={0} // Make it focusable for mouse events if needed outside typical inputs
        >
          <PlayerCharacter x={player.x} y={player.y} width={player.width} height={player.height} />
          {enemies.map((enemy) => (
            <EnemyCharacter 
              key={enemy.id} x={enemy.x} y={enemy.y} 
              width={enemy.width} height={enemy.height}
              spriteUrl={enemy.spriteUrl}
              health={enemy.health} maxHealth={enemy.maxHealth}
            />
          ))}
          {xpOrbs.map((orb) => (
            <XPOrb key={orb.id} x={orb.x} y={orb.y} size={orb.size} />
          ))}
          {projectiles.map((proj) => (
            <Projectile key={proj.id} x={proj.x} y={proj.y} size={proj.size} />
          ))}
        </div>
      </Card>
       <div className="mt-4 text-sm text-muted-foreground">
        Use Arrow Keys or WASD to move. Left-click to shoot. Survive the onslaught!
      </div>
    </div>
  );
}
