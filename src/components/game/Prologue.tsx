
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { playerSprite, prologuePlaceholders, prologueSounds } from '@/data/prologueAssets';
import { SubtitleBox } from './SubtitleBox';
import { Button } from '@/components/ui/button'; // For potential future use

const PROLOGUE_WIDTH = 800;
const PROLOGUE_HEIGHT = 600;
const PLAYER_SIZE = 40;
const PLAYER_SPEED = 4;
const GOON_SIZE = 45;
const FATHER_SIZE = 50;
const REVOLVER_SIZE = 25;

type PrologueStage =
  | 'intro_scene'
  | 'run_for_cover'
  | 'find_weapon'
  | 'scripted_combat'
  | 'final_escape';

interface PrologueProps {
  onComplete: () => void;
}

export function Prologue({ onComplete }: PrologueProps) {
  const [stage, setStage] = useState<PrologueStage>('intro_scene');
  const [playerPosition, setPlayerPosition] = useState({ x: PROLOGUE_WIDTH / 2 - PLAYER_SIZE / 2, y: PROLOGUE_HEIGHT * 0.7 });
  const [subtitle, setSubtitle] = useState<string | null>(null);
  const [showFather, setShowFather] = useState(true);
  const [fatherSpriteUrl, setFatherSpriteUrl] = useState(prologuePlaceholders.fatherStanding);
  const [goons, setGoons] = useState<{ x: number; y: number; visible: boolean }[]>([
    { x: PROLOGUE_WIDTH * 0.6, y: PROLOGUE_HEIGHT * 0.65, visible: true },
    { x: PROLOGUE_WIDTH * 0.4, y: PROLOGUE_HEIGHT * 0.65, visible: true },
  ]);
  const [revolverPosition, setRevolverPosition] = useState({ x: 100, y: PROLOGUE_HEIGHT - 80 });
  const [showRevolver, setShowRevolver] = useState(false);
  const [playerHasWeapon, setPlayerHasWeapon] = useState(false);
  const [isPlayerControlEnabled, setIsPlayerControlEnabled] = useState(false);
  const [showFlash, setShowFlash] = useState(false);

  const activeKeys = useRef<Set<string>>(new Set());
  const stageTimer = useRef<NodeJS.Timeout | null>(null);

  const fireLoopAudioRef = useRef<HTMLAudioElement>(null);
  const musicAudioRef = useRef<HTMLAudioElement>(null);
  const sfxAudioRef = useRef<HTMLAudioElement>(null);

  const playSfx = (soundSrc: string) => {
    if (sfxAudioRef.current) {
      sfxAudioRef.current.src = soundSrc;
      sfxAudioRef.current.play().catch(e => console.warn("Audio play failed:", e));
    }
  };

  useEffect(() => {
    if (fireLoopAudioRef.current) fireLoopAudioRef.current.volume = 0.3;
    if (musicAudioRef.current) musicAudioRef.current.volume = 0.4;
    if (sfxAudioRef.current) sfxAudioRef.current.volume = 0.7;

    fireLoopAudioRef.current?.play().catch(e => console.warn("Fire loop play failed:", e));
    musicAudioRef.current?.play().catch(e => console.warn("Music play failed:", e));

    return () => {
      fireLoopAudioRef.current?.pause();
      musicAudioRef.current?.pause();
      if (stageTimer.current) clearTimeout(stageTimer.current);
    };
  }, []);


  // Stage Logic
  useEffect(() => {
    if (stageTimer.current) clearTimeout(stageTimer.current);
    activeKeys.current.clear(); // Clear keys on stage change

    switch (stage) {
      case 'intro_scene':
        setIsPlayerControlEnabled(false);
        setSubtitle(null);
        setShowFather(true);
        setFatherSpriteUrl(prologuePlaceholders.fatherStanding);
        setGoons(prev => prev.map(g => ({ ...g, visible: true })));
        
        stageTimer.current = setTimeout(() => {
          setSubtitle("SAIAM DA MINHA CASA! SUAS BESTAS!");
          playSfx(prologueSounds.fatherShout1);
        }, 500);

        stageTimer.current = setTimeout(() => {
          setFatherSpriteUrl(prologuePlaceholders.fatherFallen);
        }, 2500);
        
        stageTimer.current = setTimeout(() => {
          setSubtitle("Silas! CORRA! FUJA DAQUI!");
          playSfx(prologueSounds.fatherShout2);
        }, 3000);

        stageTimer.current = setTimeout(() => {
          setStage('run_for_cover');
        }, 5500);
        break;

      case 'run_for_cover':
        setIsPlayerControlEnabled(true);
        setSubtitle("Corra para se proteger!");
        // Target zone: x < 150, y > 400 (example)
        break;

      case 'find_weapon':
        setIsPlayerControlEnabled(false);
        setShowRevolver(true);
        setSubtitle("[E] Pegar Revólver");
        break;

      case 'scripted_combat':
        setIsPlayerControlEnabled(false);
        setSubtitle(null);
        // Make the first goon visible and move in front of player
        setGoons(prev => [
          { x: playerPosition.x + 60, y: playerPosition.y - 10, visible: true },
          { ...prev[1], visible: false }
        ]);
        
        stageTimer.current = setTimeout(() => {
          setSubtitle("Achei você, moleque.");
          playSfx(prologueSounds.goonLine1);
        }, 500);

        stageTimer.current = setTimeout(() => {
          playSfx(prologueSounds.gunshot);
          setShowFlash(true);
          setGoons(prev => [{ ...prev[0], visible: false }, prev[1]]);
          setTimeout(() => setShowFlash(false), 100); // Flash duration
        }, 2500);

        stageTimer.current = setTimeout(() => {
          setStage('final_escape');
        }, 3500);
        break;

      case 'final_escape':
        setIsPlayerControlEnabled(true);
        setSubtitle("Fuja para a floresta!");
        break;
    }
  }, [stage, playerPosition.x, playerPosition.y]); // Added playerPosition for scripted_combat goon positioning

  // Player Movement and Interaction Logic
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isPlayerControlEnabled) {
        activeKeys.current.add(event.key.toLowerCase());
      }
      if (stage === 'find_weapon' && event.key.toLowerCase() === 'e') {
        setShowRevolver(false);
        setPlayerHasWeapon(true);
        setSubtitle("Você pegou o revólver!");
        playSfx(prologueSounds.gunshot); // Placeholder for "pickup" sound
        setTimeout(() => setStage('scripted_combat'), 1000);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (isPlayerControlEnabled) {
        activeKeys.current.delete(event.key.toLowerCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let animationFrameId: number;
    if (isPlayerControlEnabled) {
      const gameLoop = () => {
        setPlayerPosition(prev => {
          let newX = prev.x;
          let newY = prev.y;
          if (activeKeys.current.has('w') || activeKeys.current.has('arrowup')) newY -= PLAYER_SPEED;
          if (activeKeys.current.has('s') || activeKeys.current.has('arrowdown')) newY += PLAYER_SPEED;
          if (activeKeys.current.has('a') || activeKeys.current.has('arrowleft')) newX -= PLAYER_SPEED;
          if (activeKeys.current.has('d') || activeKeys.current.has('arrowright')) newX += PLAYER_SPEED;

          newX = Math.max(0, Math.min(newX, PROLOGUE_WIDTH - PLAYER_SIZE));
          newY = Math.max(0, Math.min(newY, PROLOGUE_HEIGHT - PLAYER_SIZE));
          
          // Check stage-specific conditions
          if (stage === 'run_for_cover' && newX < 150 && newY > PROLOGUE_HEIGHT - 150) { // Example cover zone
            setStage('find_weapon');
          }
          if (stage === 'final_escape' && newX > PROLOGUE_WIDTH * 0.90) {
            onComplete();
          }
          return { x: newX, y: newY };
        });
        animationFrameId = requestAnimationFrame(gameLoop);
      };
      animationFrameId = requestAnimationFrame(gameLoop);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isPlayerControlEnabled, stage, onComplete]);


  return (
    <div style={{
      position: 'relative',
      width: PROLOGUE_WIDTH,
      height: PROLOGUE_HEIGHT,
      backgroundColor: 'black',
      overflow: 'hidden',
      margin: 'auto', // Center on page
      border: '2px solid #C0B283' // Dusty Gold border
    }}>
      <Image
        src={prologuePlaceholders.burningFarmhouse}
        alt="Burning Farmhouse Background"
        layout="fill"
        objectFit="cover"
        priority
        data-ai-hint="burning farmhouse night"
      />

      {/* Player */}
      <Image
        src={playerSprite.youngSilas}
        alt="Young Silas"
        width={PLAYER_SIZE}
        height={PLAYER_SIZE}
        style={{
          position: 'absolute',
          left: playerPosition.x,
          top: playerPosition.y,
          zIndex: 10,
          transition: 'left 0.05s linear, top 0.05s linear',
        }}
        data-ai-hint="young boy terrified"
      />

      {/* Father */}
      {showFather && (
        <Image
          src={fatherSpriteUrl}
          alt="Father"
          width={FATHER_SIZE}
          height={FATHER_SIZE}
          style={{
            position: 'absolute',
            left: PROLOGUE_WIDTH / 2 - FATHER_SIZE / 2,
            top: PROLOGUE_HEIGHT * 0.55,
            zIndex: 5,
            filter: fatherSpriteUrl === prologuePlaceholders.fatherFallen ? 'grayscale(80%) rotate(-15deg)' : 'none',
            transition: 'filter 0.5s ease, transform 0.5s ease'
          }}
          data-ai-hint="old farmer dying"
        />
      )}
      
      {/* Goons */}
      {goons.map((goon, index) => goon.visible && (
        <Image
          key={`goon-${index}`}
          src={prologuePlaceholders.goon}
          alt={`Goon ${index + 1}`}
          width={GOON_SIZE}
          height={GOON_SIZE}
          style={{
            position: 'absolute',
            left: goon.x,
            top: goon.y,
            zIndex: 6,
          }}
          data-ai-hint="western outlaw menacing"
        />
      ))}

      {/* Revolver */}
      {showRevolver && (
         <Image
          src={prologuePlaceholders.revolverOnGround}
          alt="Revolver on ground"
          width={REVOLVER_SIZE}
          height={REVOLVER_SIZE}
          style={{
            position: 'absolute',
            left: revolverPosition.x,
            top: revolverPosition.y,
            zIndex: 7,
            animation: 'glow 1.5s infinite alternate',
          }}
          data-ai-hint="old revolver shiny"
        />
      )}
      
      {/* Screen Flash for Gunshot */}
      {showFlash && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(255, 255, 200, 0.8)',
          zIndex: 50,
        }} />
      )}

      <SubtitleBox text={subtitle} />

      {/* Audio Elements */}
      <audio ref={fireLoopAudioRef} src={prologueSounds.fireLoop} loop />
      <audio ref={musicAudioRef} src={prologueSounds.music} loop />
      <audio ref={sfxAudioRef} />

      <style jsx global>{`
        @keyframes glow {
          from { box-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #C0B283; }
          to { box-shadow: 0 0 10px #fff, 0 0 20px #C0B283, 0 0 25px #C0B283; }
        }
      `}</style>
    </div>
  );
}
