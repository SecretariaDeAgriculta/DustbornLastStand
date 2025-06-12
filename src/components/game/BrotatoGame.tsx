
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PlayerCharacter } from './PlayerCharacter';
import { EnemyCharacter } from './EnemyCharacter';
import { GameHUD } from './GameHUD';
import { Card } from '@/components/ui/card';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PLAYER_SIZE = 30;
const ENEMY_SIZE = 25;
const PLAYER_SPEED = 10; // Adjusted for better discrete movement

interface Entity {
  id: string;
  x: number;
  y: number;
  size: number;
}

interface Player extends Entity {}
interface Enemy extends Entity {}

export function BrotatoGame() {
  const [player, setPlayer] = useState<Player>({
    id: 'player',
    x: GAME_WIDTH / 2 - PLAYER_SIZE / 2,
    y: GAME_HEIGHT / 2 - PLAYER_SIZE / 2,
    size: PLAYER_SIZE,
  });
  const [enemies, setEnemies] = useState<Enemy[]>([
    // Initial placeholder enemy
    { id: 'enemy1', x: 100, y: 100, size: ENEMY_SIZE },
  ]);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);

  const movePlayer = useCallback((dx: number, dy: number) => {
    if (isGameOver) return;
    setPlayer((prev) => ({
      ...prev,
      x: Math.max(0, Math.min(prev.x + dx, GAME_WIDTH - prev.size)),
      y: Math.max(0, Math.min(prev.y + dy, GAME_HEIGHT - prev.size)),
    }));
  }, [isGameOver]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isGameOver) return;
      switch (event.key) {
        case 'ArrowUp':
        case 'w':
          movePlayer(0, -PLAYER_SPEED);
          break;
        case 'ArrowDown':
        case 's':
          movePlayer(0, PLAYER_SPEED);
          break;
        case 'ArrowLeft':
        case 'a':
          movePlayer(-PLAYER_SPEED, 0);
          break;
        case 'ArrowRight':
        case 'd':
          movePlayer(PLAYER_SPEED, 0);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [movePlayer, isGameOver]);

  // Basic game loop (simplified for now)
  useEffect(() => {
    if (isGameOver) return;

    const gameLoop = setInterval(() => {
      // Enemy movement (placeholder)
      // Collision detection (placeholder)
      // Update score/wave (placeholder)
    }, 100); // Update roughly 10 times per second

    return () => clearInterval(gameLoop);
  }, [isGameOver]);
  
  if (isGameOver) {
    return (
      <div className="text-center">
        <h2 className="text-4xl font-bold text-destructive mb-4">Game Over!</h2>
        <p className="text-xl mb-2">Final Score: {score}</p>
        <p className="text-lg">Wave Reached: {wave}</p>
        <button 
          onClick={() => { /* Reset game logic here */ 
            setIsGameOver(false); 
            setScore(0); 
            setWave(1);
            setPlayer({
              id: 'player',
              x: GAME_WIDTH / 2 - PLAYER_SIZE / 2,
              y: GAME_HEIGHT / 2 - PLAYER_SIZE / 2,
              size: PLAYER_SIZE,
            });
          }}
          className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <GameHUD score={score} wave={wave} playerHealth={100} />
      <Card className="mt-4 shadow-2xl overflow-hidden border-2 border-primary">
        <div
          className="relative bg-muted/30"
          style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
          role="application" // For accessibility, indicating it's an interactive app
          aria-label="Brotato game area"
        >
          <PlayerCharacter x={player.x} y={player.y} size={player.size} />
          {enemies.map((enemy) => (
            <EnemyCharacter key={enemy.id} x={enemy.x} y={enemy.y} size={enemy.size} />
          ))}
        </div>
      </Card>
       <div className="mt-4 text-sm text-muted-foreground">
        Use Arrow Keys or WASD to move.
      </div>
    </div>
  );
}
