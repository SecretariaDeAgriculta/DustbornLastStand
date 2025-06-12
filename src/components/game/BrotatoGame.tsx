
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
const PLAYER_SPEED = 5; // Adjusted for continuous movement

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
    { id: 'enemy1', x: 100, y: 100, size: ENEMY_SIZE },
  ]);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isGameOver) return;
      setActiveKeys((prevKeys) => new Set(prevKeys).add(event.key.toLowerCase()));
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (isGameOver) return;
      setActiveKeys((prevKeys) => {
        const newKeys = new Set(prevKeys);
        newKeys.delete(event.key.toLowerCase());
        return newKeys;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isGameOver]);

  useEffect(() => {
    if (isGameOver) return;

    let animationFrameId: number;

    const gameUpdate = () => {
      let dx = 0;
      let dy = 0;

      if (activeKeys.has('arrowup') || activeKeys.has('w')) dy -= 1;
      if (activeKeys.has('arrowdown') || activeKeys.has('s')) dy += 1;
      if (activeKeys.has('arrowleft') || activeKeys.has('a')) dx -= 1;
      if (activeKeys.has('arrowright') || activeKeys.has('d')) dx += 1;

      if (dx !== 0 || dy !== 0) {
        let moveX = dx * PLAYER_SPEED;
        let moveY = dy * PLAYER_SPEED;

        if (dx !== 0 && dy !== 0) { // Normalize diagonal speed
          const length = Math.sqrt(dx * dx + dy * dy); // sqrt(1*1 + 1*1) = sqrt(2)
          moveX = (dx / length) * PLAYER_SPEED;
          moveY = (dy / length) * PLAYER_SPEED;
        }

        setPlayer((prevPlayer) => ({
          ...prevPlayer,
          x: Math.max(0, Math.min(prevPlayer.x + moveX, GAME_WIDTH - prevPlayer.size)),
          y: Math.max(0, Math.min(prevPlayer.y + moveY, GAME_HEIGHT - prevPlayer.size)),
        }));
      }
      
      // Enemy movement (placeholder)
      // Collision detection (placeholder)
      // Update score/wave (placeholder)

      animationFrameId = requestAnimationFrame(gameUpdate);
    };

    animationFrameId = requestAnimationFrame(gameUpdate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isGameOver, activeKeys]); // Effect reruns if isGameOver or activeKeys change
  
  if (isGameOver) {
    return (
      <div className="text-center">
        <h2 className="text-4xl font-bold text-destructive mb-4">Game Over!</h2>
        <p className="text-xl mb-2">Final Score: {score}</p>
        <p className="text-lg">Wave Reached: {wave}</p>
        <button 
          onClick={() => { 
            setIsGameOver(false); 
            setScore(0); 
            setWave(1);
            setPlayer({
              id: 'player',
              x: GAME_WIDTH / 2 - PLAYER_SIZE / 2,
              y: GAME_HEIGHT / 2 - PLAYER_SIZE / 2,
              size: PLAYER_SIZE,
            });
            setEnemies([{ id: 'enemy1', x: 100, y: 100, size: ENEMY_SIZE }]);
            setActiveKeys(new Set());
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
          role="application"
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
