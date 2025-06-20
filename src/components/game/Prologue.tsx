
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { characterSprites, itemSprites, environmentSprites, prologueSounds } from '@/data/assets';
import { SubtitleBox } from './SubtitleBox';
// import { Button } from '@/components/ui/button'; // Not used in this version

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
  const [fatherSpriteUrl, setFatherSpriteUrl] = useState(characterSprites.father); // Use the direct sprite
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
  const animationFrameIdRef = useRef<number | null>(null);

  const fireLoopAudioRef = useRef<HTMLAudioElement | null>(null);
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  const sfxAudioRef = useRef<HTMLAudioElement | null>(null);

  const playSfx = useCallback((soundSrc: string) => {
    if (sfxAudioRef.current) {
      sfxAudioRef.current.src = soundSrc;
      sfxAudioRef.current.play().catch(e => console.warn("Audio play failed:", e));
    }
  }, []);

  useEffect(() => {
    // Initialize audio elements on mount
    fireLoopAudioRef.current = new Audio(prologueSounds.fireLoop);
    musicAudioRef.current = new Audio(prologueSounds.music);
    sfxAudioRef.current = new Audio(); // For one-shot SFX

    if (fireLoopAudioRef.current) {
        fireLoopAudioRef.current.loop = true;
        fireLoopAudioRef.current.volume = 0.3;
        fireLoopAudioRef.current.play().catch(e => console.warn("Fire loop play failed:", e));
    }
    if (musicAudioRef.current) {
        musicAudioRef.current.loop = true;
        musicAudioRef.current.volume = 0.4;
        musicAudioRef.current.play().catch(e => console.warn("Music play failed:", e));
    }
     if (sfxAudioRef.current) sfxAudioRef.current.volume = 0.7;


    return () => {
      fireLoopAudioRef.current?.pause();
      musicAudioRef.current?.pause();
      if (stageTimer.current) clearTimeout(stageTimer.current);
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, []);


  // Stage Logic
  useEffect(() => {
    if (stageTimer.current) clearTimeout(stageTimer.current);
    activeKeys.current.clear(); 

    switch (stage) {
      case 'intro_scene':
        setIsPlayerControlEnabled(false);
        setSubtitle(null);
        setShowFather(true);
        setFatherSpriteUrl(characterSprites.father); // Ensure it's set initially
        setGoons(prev => prev.map(g => ({ ...g, x: g.x, y: g.y, visible: true }))); 
        
        stageTimer.current = setTimeout(() => {
          setSubtitle("SAIAM DA MINHA CASA! SUAS BESTAS!");
          playSfx(prologueSounds.fatherShout1);
        }, 500);

        // The "fallen" effect is handled by CSS based on stage (filter),
        // so we don't need to change fatherSpriteUrl if it's the same base image.
        
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
        setSubtitle("Corra para se proteger! (Mova-se para o canto inferior esquerdo)");
        break;

      case 'find_weapon':
        setIsPlayerControlEnabled(false); 
        setSubtitle("[E] Pegar Revólver");
        setShowRevolver(true); 
        break;

      case 'scripted_combat':
        setIsPlayerControlEnabled(false);
        setSubtitle(null);
        setGoons(prev => [
          { x: playerPosition.x + (playerPosition.x < PROLOGUE_WIDTH / 2 ? 60 : -60) , y: playerPosition.y -10, visible: true },
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
          setTimeout(() => setShowFlash(false), 100); 
        }, 2500);

        stageTimer.current = setTimeout(() => {
          setStage('final_escape');
        }, 3500);
        break;

      case 'final_escape':
        setIsPlayerControlEnabled(true);
        setSubtitle("Fuja para a floresta! (Mova-se para a borda direita)");
        break;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, playSfx]); // Removed playerPosition from deps as it could cause rapid refiring of this effect

  // Player Movement and Interaction Logic
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isPlayerControlEnabled) {
        activeKeys.current.add(event.key.toLowerCase());
      }
      if (stage === 'find_weapon' && event.key.toLowerCase() === 'e') {
        if (showRevolver) { 
            setShowRevolver(false);
            setPlayerHasWeapon(true);
            setSubtitle("Você pegou o revólver!");
            playSfx(prologueSounds.gunshot); 
            if (stageTimer.current) clearTimeout(stageTimer.current); 
            stageTimer.current = setTimeout(() => setStage('scripted_combat'), 1000);
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (isPlayerControlEnabled) {
        activeKeys.current.delete(event.key.toLowerCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

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
          
          if (stage === 'run_for_cover' && newX < 100 && newY > PROLOGUE_HEIGHT - (PLAYER_SIZE + 50) ) { 
             if (stageTimer.current) clearTimeout(stageTimer.current);
            setStage('find_weapon');
          }
          if (stage === 'final_escape' && newX > PROLOGUE_WIDTH * 0.90) {
            if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
            onComplete();
          }
          return { x: newX, y: newY };
        });
        animationFrameIdRef.current = requestAnimationFrame(gameLoop);
      };
      animationFrameIdRef.current = requestAnimationFrame(gameLoop);
    } else {
        if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [isPlayerControlEnabled, stage, onComplete, playSfx, showRevolver, playerHasWeapon]);


  return (
    <div style={{
      position: 'relative',
      width: PROLOGUE_WIDTH,
      height: PROLOGUE_HEIGHT,
      backgroundImage: `url(${environmentSprites.prologueFloor})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      overflow: 'hidden',
      margin: 'auto', 
      border: '2px solid var(--primary)'
    }}>

      <Image
        src={characterSprites.youngSilas}
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
        priority
      />

      {showFather && fatherSpriteUrl && (
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
            filter: stage !== 'intro_scene' && stage !== 'run_for_cover' ? 'grayscale(80%) rotate(-15deg)' : 'none',
            transition: 'filter 0.5s ease, transform 0.5s ease'
          }}
          data-ai-hint="old farmer dying"
        />
      )}
      
      {goons.map((goon, index) => goon.visible && (
        <Image
          key={`goon-${index}`}
          src={characterSprites.railroadHenchman}
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

      {showRevolver && (
         <Image
          src={itemSprites.rustyRevolver}
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
      
      {showFlash && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(255, 255, 200, 0.8)',
          zIndex: 50,
        }} />
      )}

      {/* Cover Object Example (can be enabled based on stage if needed) */}
      { 
      stage === 'run_for_cover' && (
        <Image
          src={environmentSprites.coverObjectPlaceholder}
          alt="Cover Object"
          width={60} 
          height={60}
          style={{
            position: 'absolute',
            left: 50, 
            bottom: 50, 
            zIndex: 4,
          }}
          data-ai-hint="wooden crate cover"
        />
      )
      }

      <SubtitleBox text={subtitle} />
      
      <style jsx global>{`
        @keyframes glow {
          from { box-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #C0B283; }
          to { box-shadow: 0 0 10px #fff, 0 0 20px #C0B283, 0 0 25px #C0B283; }
        }
      `}</style>
    </div>
  );
}
