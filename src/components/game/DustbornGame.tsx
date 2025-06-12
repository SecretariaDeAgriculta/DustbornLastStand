
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PlayerCharacter } from './PlayerCharacter';
import { EnemyCharacter } from './EnemyCharacter';
import { GameHUD } from './GameHUD';
import { Card } from '@/components/ui/card';
import { XPOrb } from './XPOrb';
import { ShopDialog } from './ShopDialog';
import { Button } from '@/components/ui/button'; // Added for manual enemy defeat

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PLAYER_SIZE = 30;
const ENEMY_SIZE = 25;
const XP_ORB_SIZE = 10;
const PLAYER_SPEED = 5;
const WAVE_DURATION = 120; // 2 minutes in seconds
const ENEMY_SPAWN_INTERVAL_INITIAL = 3000; // milliseconds
const MAX_ENEMIES_INITIAL = 5;
const XP_COLLECTION_RADIUS_SQUARED = (PLAYER_SIZE / 2 + XP_ORB_SIZE / 2 + 15) ** 2; // Player radius + orb radius + buffer

const ENEMY_COLORS = ['#FF6347', '#32CD32', '#1E90FF', '#FFD700', '#BA55D3', '#FF8C00']; // Tomato, LimeGreen, DodgerBlue, Gold, MediumOrchid, DarkOrange

interface Entity {
  id: string;
  x: number;
  y: number;
  size: number;
}

interface Player extends Entity {
  health: number;
}

interface Enemy extends Entity {
  health: number;
  maxHealth: number;
  color: string;
  xpValue: number;
}

interface XPOrbData extends Entity {
  value: number;
}

interface Weapon {
  id: string;
  name: string;
}

export function DustbornGame() {
  const [player, setPlayer] = useState<Player>({
    id: 'player',
    x: GAME_WIDTH / 2 - PLAYER_SIZE / 2,
    y: GAME_HEIGHT / 2 - PLAYER_SIZE / 2,
    size: PLAYER_SIZE,
    health: 100,
  });
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [xpOrbs, setXpOrbs] = useState<XPOrbData[]>([]);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [waveTimer, setWaveTimer] = useState(WAVE_DURATION);
  const [isShopPhase, setIsShopPhase] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [playerXP, setPlayerXP] = useState(0);
  const [playerWeapons, setPlayerWeapons] = useState<Weapon[]>([{ id: 'w1', name: 'Pea Shooter' }]);
  
  const activeKeys = useRef<Set<string>>(new Set());
  const enemySpawnTimerId = useRef<NodeJS.Timeout | null>(null);
  const waveIntervalId = useRef<NodeJS.Timeout | null>(null);

  const resetGameState = useCallback(() => {
    setPlayer({
      id: 'player',
      x: GAME_WIDTH / 2 - PLAYER_SIZE / 2,
      y: GAME_HEIGHT / 2 - PLAYER_SIZE / 2,
      size: PLAYER_SIZE,
      health: 100,
    });
    setEnemies([]);
    setXpOrbs([]);
    setScore(0);
    setWave(1);
    setWaveTimer(WAVE_DURATION);
    setIsShopPhase(false);
    setIsGameOver(false);
    setPlayerXP(0);
    setPlayerWeapons([{ id: 'w1', name: 'Pea Shooter' }]);
    activeKeys.current.clear();
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
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isGameOver]);

  // Game Loop for player movement and XP collection
  useEffect(() => {
    if (isGameOver || isShopPhase) return;

    let animationFrameId: number;
    const gameUpdate = () => {
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
          x: Math.max(0, Math.min(p.x + moveX, GAME_WIDTH - p.size)),
          y: Math.max(0, Math.min(p.y + moveY, GAME_HEIGHT - p.size)),
        }));
      }

      // XP Orb Collection
      setXpOrbs((prevOrbs) =>
        prevOrbs.filter((orb) => {
          const distX = (player.x + player.size / 2) - (orb.x + orb.size / 2);
          const distY = (player.y + player.size / 2) - (orb.y + orb.size / 2);
          const distanceSquared = distX * distX + distY * distY;
          if (distanceSquared < XP_COLLECTION_RADIUS_SQUARED) {
            setPlayerXP((prevXP) => prevXP + orb.value);
            setScore((prevScore) => prevScore + orb.value * 10); // XP gives score
            return false; // Remove orb
          }
          return true; // Keep orb
        })
      );
      
      // Placeholder for enemy movement, collision, etc.
      // For now, simple check for game over if player health <= 0
      if (player.health <= 0) {
        setIsGameOver(true);
      }


      animationFrameId = requestAnimationFrame(gameUpdate);
    };
    animationFrameId = requestAnimationFrame(gameUpdate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isGameOver, isShopPhase, player.x, player.y, player.health, player.size]); // Added player dependencies for XP collection

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
          setEnemies([]); // Clear enemies at end of wave
          if(enemySpawnTimerId.current) clearTimeout(enemySpawnTimerId.current); // Clear spawn timer
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
    return () => {
      if (waveIntervalId.current) clearInterval(waveIntervalId.current);
    };
  }, [isGameOver, isShopPhase, wave]);

  // Enemy Spawning Logic
  const spawnEnemy = useCallback(() => {
    if (isShopPhase || isGameOver || enemies.length >= MAX_ENEMIES_INITIAL + wave * 2) return;

    const enemyHealth = 50 + wave * 25; // Enemies get stronger
    const xpValue = 10 + wave * 5;
    const size = ENEMY_SIZE;
    let newX, newY;
    let attempts = 0;
    const maxAttempts = 10;

    // Try to spawn away from player and screen edges
    do {
        const side = Math.floor(Math.random() * 4);
        if (side === 0) { // Top
            newX = Math.random() * (GAME_WIDTH - size);
            newY = -size; // Spawn just off-screen top
        } else if (side === 1) { // Bottom
            newX = Math.random() * (GAME_WIDTH - size);
            newY = GAME_HEIGHT; // Spawn just off-screen bottom
        } else if (side === 2) { // Left
            newX = -size; // Spawn just off-screen left
            newY = Math.random() * (GAME_HEIGHT - size);
        } else { // Right
            newX = GAME_WIDTH; // Spawn just off-screen right
            newY = Math.random() * (GAME_HEIGHT - size);
        }
        attempts++;
    } while (
        (Math.abs(newX - player.x) < PLAYER_SIZE * 3 && Math.abs(newY - player.y) < PLAYER_SIZE * 3) && attempts < maxAttempts // Avoid spawning too close to player
    );


    setEnemies((prevEnemies) => [
      ...prevEnemies,
      {
        id: `enemy_${Date.now()}_${Math.random()}`,
        x: newX,
        y: newY,
        size,
        health: enemyHealth,
        maxHealth: enemyHealth,
        color: ENEMY_COLORS[Math.floor(Math.random() * ENEMY_COLORS.length)],
        xpValue: xpValue,
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
      const nextSpawnTime = Math.max(500, ENEMY_SPAWN_INTERVAL_INITIAL - wave * 100); // Enemies spawn faster
      enemySpawnTimerId.current = setTimeout(spawnLoop, nextSpawnTime);
    };
    
    spawnLoop(); // Start first spawn
    
    return () => {
      if (enemySpawnTimerId.current) clearTimeout(enemySpawnTimerId.current);
    };
  }, [isShopPhase, isGameOver, spawnEnemy, wave]);


  // Placeholder: Manually "defeat" an enemy for testing XP drops
  const handleDefeatEnemy = (enemyId: string) => {
    const enemy = enemies.find(e => e.id === enemyId);
    if (enemy) {
      setXpOrbs(prev => [...prev, { 
        id: `xp_${Date.now()}`, 
        x: enemy.x + enemy.size / 2 - XP_ORB_SIZE / 2, 
        y: enemy.y + enemy.size / 2 - XP_ORB_SIZE / 2, 
        size: XP_ORB_SIZE, 
        value: enemy.xpValue 
      }]);
      setEnemies(prev => prev.filter(e => e.id !== enemyId));
      setScore(prevScore => prevScore + enemy.xpValue * 5); // Killing enemy gives score
    }
  };
  
  // Enemy movement towards player (simple)
  useEffect(() => {
    if (isShopPhase || isGameOver) return;

    const moveEnemies = () => {
      setEnemies(prevEnemies => 
        prevEnemies.map(enemy => {
          const enemySpeed = 0.5 + wave * 0.1; // Enemies get faster
          let newX = enemy.x;
          let newY = enemy.y;

          const dx = player.x - enemy.x;
          const dy = player.y - enemy.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > enemy.size / 2) { // Only move if not already on top of player
            newX += (dx / dist) * enemySpeed;
            newY += (dy / dist) * enemySpeed;
          }
          
          // Basic collision with player (placeholder for damage)
          const playerCenterX = player.x + player.size / 2;
          const playerCenterY = player.y + player.size / 2;
          const enemyCenterX = newX + enemy.size / 2;
          const enemyCenterY = newY + enemy.size / 2;
          const collisionDistX = playerCenterX - enemyCenterX;
          const collisionDistY = playerCenterY - enemyCenterY;
          const collisionDistance = Math.sqrt(collisionDistX*collisionDistX + collisionDistY*collisionDistY);

          if (collisionDistance < (player.size/2 + enemy.size/2)) {
             // console.log("Player hit by enemy!");
             // setPlayer(p => ({...p, health: Math.max(0, p.health - (1 + wave * 0.5)) })); // Player takes damage
             // This health reduction should be less frequent, e.g. on a timer, or one-off per collision
          }


          return { ...enemy, x: newX, y: newY };
        })
      );
    };

    const intervalId = setInterval(moveEnemies, 50); // Adjust for smoother/faster movement

    return () => clearInterval(intervalId);
  }, [player.x, player.y, player.size, isShopPhase, isGameOver, wave]);


  const startNextWave = () => {
    setIsShopPhase(false);
    setWave((prevWave) => prevWave + 1);
    setWaveTimer(WAVE_DURATION);
    // Player might heal a bit between waves, or full heal - TBD
    // setPlayer(p => ({ ...p, health: Math.min(100, p.health + 25) })); 
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
          className="relative bg-muted/30 overflow-hidden" // overflow-hidden to hide enemies spawning outside
          style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
          role="application"
          aria-label="Dustborn game area"
        >
          <PlayerCharacter x={player.x} y={player.y} size={player.size} />
          {enemies.map((enemy) => (
            <EnemyCharacter 
              key={enemy.id} 
              x={enemy.x} 
              y={enemy.y} 
              size={enemy.size} 
              color={enemy.color}
              health={enemy.health}
              maxHealth={enemy.maxHealth}
              // onClick={() => handleDefeatEnemy(enemy.id)} // TEMP: Click to defeat for testing
            />
          ))}
          {xpOrbs.map((orb) => (
            <XPOrb key={orb.id} x={orb.x} y={orb.y} size={orb.size} />
          ))}
        </div>
      </Card>
       <div className="mt-4 text-sm text-muted-foreground">
        Use Arrow Keys or WASD to move. Enemies get stronger each wave. Collect XP!
      </div>
      {/* Temp button to test enemy defeat and XP drop */}
      {enemies.length > 0 && (
        <Button onClick={() => handleDefeatEnemy(enemies[0].id)} variant="outline" className="mt-2">
          Defeat First Enemy (Test)
        </Button>
      )}
    </div>
  );
}

    