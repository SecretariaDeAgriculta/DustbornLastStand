
'use client';

import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
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
import { FirePatchCharacter } from './FirePatchCharacter';
import { PauseIcon, PlayIcon, HomeIcon, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import type { Weapon } from '@/config/weapons';
import { initialWeapon, getPurchasableWeapons, getWeaponById } from '@/config/weapons';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { useGameStore } from '@/store/useGameStore';

// Importando Tipos e Constantes
import { GAME_WIDTH, GAME_HEIGHT, WAVE_DURATION, ENEMY_SPAWN_TICK_INTERVAL, MAX_PLAYER_WEAPONS, RECYCLE_MONEY_PERCENTAGE, INITIAL_WEAPON_RECYCLE_MONEY } from '@/game/constants/game';
import { PLAYER_INITIAL_HEALTH, PLAYER_SIZE } from '@/game/constants/player';

// Importando Sistemas de Lógica do Jogo
import { updatePlayerMovement } from '@/game/systems/playerMovementSystem';
import { acquireTarget } from '@/game/systems/targetAcquisitionSystem';
import { handleShooting } from '@/game/systems/shootingSystem';
import { updateProjectiles } from '@/game/systems/projectileSystem';
import { updateEnemies } from '@/game/systems/enemySystem';
import { updateMoneyOrbs } from '@/game/systems/moneyOrbSystem';
import { spawnEnemiesOnTick } from '@/game/systems/enemySpawningSystem';
import { updateFissureTraps } from '@/game/systems/fissureTrapSystem';
import { updateFirePatches } from '@/game/systems/firePatchSystem';


interface DustbornGameProps {
  onExitToMenu?: () => void;
  deviceType: 'computer' | 'mobile';
}

export function DustbornGame({ onExitToMenu, deviceType }: DustbornGameProps) {
    const {
        player, enemies, targetEnemy, moneyOrbs, playerProjectiles, enemyProjectiles,
        laserSightLines, fissureTraps, firePatches, score, wave, waveTimer, isShopPhase,
        isGameOver, isPaused, playerDollars, playerWeapons, shopOfferings,
        setPlayer, setEnemies, setTargetEnemy, setMoneyOrbs, setPlayerProjectiles,
        setEnemyProjectiles, setLaserSightLines, setFissureTraps, setFirePatches,
        setScore, setWave, setWaveTimer, setIsShopPhase, setIsGameOver, setIsPaused,
        setPlayerDollars, setPlayerWeapons, setShopOfferings, resetGame
    } = useGameStore();
    
    const [isPlayerTakingDamage, setIsPlayerTakingDamage] = useState(false);
    const [fps, setFps] = useState(0);

    const [scale, setScale] = useState(1);
    const gameWrapperRef = useRef<HTMLDivElement>(null);
    const activeKeys = useRef<Set<string>>(new Set());
    const enemySpawnTimerId = useRef<NodeJS.Timer | null>(null);
    const waveIntervalId = useRef<NodeJS.Timeout | null>(null);
    const lastTargetUpdateRef = useRef(0);
    const lastPlayerShotTimestampRef = useRef<Record<string, number>>({});
    const gameAreaRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const frameCountRef = useRef(0);
    const lastFpsUpdateRef = useRef(performance.now());
    const fpsCounterRef = useRef<number | null>(null);

    // Contador de FPS
    useEffect(() => {
        const countFps = (now: number) => {
        frameCountRef.current++;
        if (now - lastFpsUpdateRef.current > 1000) {
            setFps(frameCountRef.current);
            frameCountRef.current = 0;
            lastFpsUpdateRef.current = now;
        }
        fpsCounterRef.current = requestAnimationFrame(countFps);
        };
        fpsCounterRef.current = requestAnimationFrame(countFps);
        return () => { if (fpsCounterRef.current) cancelAnimationFrame(fpsCounterRef.current); };
    }, []);

    // Responsividade do Canvas do Jogo
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

    const resetGameStateAndExit = useCallback(() => {
        resetGame();
        activeKeys.current.clear();
        lastTargetUpdateRef.current = 0;
        lastPlayerShotTimestampRef.current = {};
        if (enemySpawnTimerId.current) clearInterval(enemySpawnTimerId.current);
        enemySpawnTimerId.current = null;
        if (onExitToMenu) onExitToMenu();
    }, [onExitToMenu, resetGame]);

    const handleReset = useCallback(() => {
        resetGame();
        activeKeys.current.clear();
        lastTargetUpdateRef.current = 0;
        lastPlayerShotTimestampRef.current = {};
        if (enemySpawnTimerId.current) clearInterval(enemySpawnTimerId.current);
        enemySpawnTimerId.current = null;
    }, [resetGame]);

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
    }, [setShopOfferings]);

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
        if (playerDollars < weaponToBuyOrUpgrade.moneyCost) {
        toast({ title: "Dinheiro Insuficiente", description: `Você precisa de $${weaponToBuyOrUpgrade.moneyCost}.`, variant: "destructive" });
        return;
        }
        if (isUpgrade) {
        setPlayerWeapons(
            playerWeapons.map((weapon, index) => {
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
        setPlayerDollars(playerDollars - weaponToBuyOrUpgrade.moneyCost);
        toast({ title: "Arma Aprimorada!", description: `${weaponToBuyOrUpgrade.name} teve seus atributos melhorados.` });
        } else {
        if (playerWeapons.length >= MAX_PLAYER_WEAPONS) {
            toast({ title: "Inventário Cheio", description: "Você já possui o máximo de 5 armas.", variant: "destructive" });
            return;
        }
        setPlayerDollars(playerDollars - weaponToBuyOrUpgrade.moneyCost);
        const freshWeaponDefinition = getWeaponById(weaponToBuyOrUpgrade.id);
        if (freshWeaponDefinition) {
            setPlayerWeapons([...playerWeapons, {...freshWeaponDefinition, upgradedThisRound: false}]);
            toast({ title: "Arma Comprada!", description: `${freshWeaponDefinition.name} adicionada ao seu arsenal.` });
        } else {
            toast({ title: "Erro na Loja", description: `Não foi possível encontrar a definição da arma ${weaponToBuyOrUpgrade.name}.`, variant: "destructive" });
        }
        }
        setShopOfferings(
        shopOfferings.map((offering, index) =>
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
        let moneyGained = 0;
        if (weaponToRecycle.id === initialWeapon.id) {
            moneyGained = INITIAL_WEAPON_RECYCLE_MONEY;
        } else {
            const baseWeapon = getWeaponById(weaponIdToRecycle);
            moneyGained = Math.floor((baseWeapon?.moneyCost || 0) * RECYCLE_MONEY_PERCENTAGE);
        }
        setPlayerDollars(playerDollars + moneyGained);
        setPlayerWeapons(playerWeapons.filter(w => w.id !== weaponIdToRecycle));
        toast({ title: "Arma Reciclada!", description: `${weaponToRecycle.name} removida. +$${moneyGained}.` });
        }
    };

    // --- Handlers de Input ---
    useEffect(() => {
        if (deviceType === 'mobile') return;
        const handleKeyDown = (event: KeyboardEvent) => {
        if (isGameOver) return;
        if (event.key.toLowerCase() === 'p') {
            setIsPaused(!isPaused);
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
    }, [isGameOver, isPaused, isShopPhase, deviceType, setIsPaused]);

    const handleMobileControl = (key: string, isPressed: boolean) => {
        if (isGameOver || isPaused || isShopPhase) return;
        if (isPressed) activeKeys.current.add(key);
        else activeKeys.current.delete(key);
    };

    // --- O Loop Principal do Jogo (Game Loop) ---
    useEffect(() => {
        if (isGameOver || isShopPhase || isPaused) return;

        let animationFrameId: number;
        const gameTick = (timestamp: number) => {
            const now = Date.now();
            let state = useGameStore.getState();

            // --- Aquisição de Alvo (Otimizado) ---
            const newTarget = acquireTarget(now, lastTargetUpdateRef.current, state.player, state.enemies);
            if (newTarget !== undefined) {
                // `acquireTarget` now sets the state internally if a change occurred.
                // We re-fetch state in case it changed.
                state = useGameStore.getState(); 
            }
            if (newTarget) lastTargetUpdateRef.current = now;

            // --- Movimento do Jogador ---
            updatePlayerMovement(activeKeys.current);
            state = useGameStore.getState();

            // --- Disparos do Jogador ---
            if (state.targetEnemy) {
                const { projectiles, updatedTimestamps } = handleShooting(now, state.targetEnemy, state.player, state.playerWeapons, lastPlayerShotTimestampRef.current);
                if (projectiles.length > 0) {
                    setPlayerProjectiles([...state.playerProjectiles, ...projectiles]);
                }
                if (Object.keys(updatedTimestamps).length > 0) {
                    lastPlayerShotTimestampRef.current = updatedTimestamps;
                }
                state = useGameStore.getState();
            }

            // --- Atualização de Projéteis ---
            const projectileState = updateProjectiles(state.playerProjectiles, state.enemyProjectiles, state.enemies, state.playerWeapons);
            setPlayerProjectiles(projectileState.newPlayerProjectiles);
            setEnemyProjectiles(projectileState.newEnemyProjectiles);
            if (projectileState.firePatchesToCreate.length > 0) {
                setFirePatches([...state.firePatches, ...projectileState.firePatchesToCreate]);
            }
            if (projectileState.playerDamage > 0) {
                const newHealth = Math.max(0, state.player.health - projectileState.playerDamage);
                if (newHealth < state.player.health && !isPlayerTakingDamage) {
                    setIsPlayerTakingDamage(true);
                    setTimeout(() => setIsPlayerTakingDamage(false), 200);
                }
                if (newHealth <= 0) setIsGameOver(true);
                setPlayer({ ...state.player, health: newHealth });
            }
            state = useGameStore.getState();
            
            // --- Atualização de Efeitos de Área ---
            const firePatchUpdate = updateFirePatches(now, state.firePatches, state.enemies);
            setFirePatches(firePatchUpdate.updatedPatches);
            
            const fissureTrapUpdate = updateFissureTraps(now, state.fissureTraps, state.player);
            setFissureTraps(fissureTrapUpdate.updatedTraps);
            if (fissureTrapUpdate.playerDamage > 0) {
                const newHealth = Math.max(0, state.player.health - fissureTrapUpdate.playerDamage);
                if (newHealth < state.player.health && !isPlayerTakingDamage) {
                    setIsPlayerTakingDamage(true);
                    setTimeout(() => setIsPlayerTakingDamage(false), 200);
                }
                if (newHealth <= 0) setIsGameOver(true);
                setPlayer({ ...state.player, health: newHealth });
            }
            state = useGameStore.getState();

            // --- Atualização de Inimigos ---
            const enemyState = updateEnemies({
                enemies: state.enemies,
                player: state.player,
                fissureTraps: state.fissureTraps,
                timestamp: timestamp,
                damageToApply: new Map([...projectileState.damageToEnemies, ...firePatchUpdate.damageToEnemies]),
            });
            setEnemies(enemyState.updatedEnemies);
            if(enemyState.newEnemyProjectiles.length > 0) setEnemyProjectiles([...state.enemyProjectiles, ...enemyState.newEnemyProjectiles]);
            if(enemyState.newFissureTraps.length > 0) setFissureTraps([...state.fissureTraps, ...enemyState.newFissureTraps]);
            setLaserSightLines(enemyState.newLaserSights);
            if (enemyState.playerDamage > 0) {
                const newHealth = Math.max(0, state.player.health - enemyState.playerDamage);
                if (newHealth < state.player.health && !isPlayerTakingDamage) {
                    setIsPlayerTakingDamage(true);
                    setTimeout(() => setIsPlayerTakingDamage(false), 200);
                }
                if (newHealth <= 0) setIsGameOver(true);
                setPlayer({ ...state.player, health: newHealth });
            }
            if (enemyState.killedEnemies.length > 0) {
                const moneyFromKills = enemyState.killedEnemies
                    .filter(e => e.moneyValue > 0)
                    .map(e => ({
                        id: `money_${now}_${Math.random()}_${e.id}`,
                        x: e.x + e.width / 2 - 5, y: e.y + e.height / 2 - 5,
                        size: 10, value: e.moneyValue
                    }));
                if (moneyFromKills.length > 0) setMoneyOrbs([...state.moneyOrbs, ...moneyFromKills]);
                
                const scoreFromKills = enemyState.killedEnemies.reduce((acc, e) => acc + e.moneyValue * (e.type.startsWith('Boss_') ? 20 : 5), 0);
                if(scoreFromKills > 0) setScore(state.score + scoreFromKills);
            }
            if (enemyState.bossDefeated) {
                toast({ title: `${enemyState.defeatedBossType?.replace('Boss_', '')} Derrotado!`, description: "A onda continua..."});
            }
            if (enemyState.targetKilled) {
                setTargetEnemy(null);
            }
            state = useGameStore.getState();

            // --- Coleta de Orbs de Dinheiro ---
            updateMoneyOrbs();
        
            if (useGameStore.getState().player.health <= 0) setIsGameOver(true);
            animationFrameId = requestAnimationFrame(gameTick);
        };

        animationFrameId = requestAnimationFrame(gameTick);
        return () => cancelAnimationFrame(animationFrameId);
    }, [isGameOver, isShopPhase, isPaused, toast, isPlayerTakingDamage]);

    // --- Controle de Ondas (Waves) ---
    useEffect(() => {
        if (isGameOver || isShopPhase || isPaused) {
        if (waveIntervalId.current) clearInterval(waveIntervalId.current);
        return;
        }
        waveIntervalId.current = setInterval(() => {
        setWaveTimer(useGameStore.getState().waveTimer - 1);
        }, 1000);
        return () => { if (waveIntervalId.current) clearInterval(waveIntervalId.current); };
    }, [isGameOver, isShopPhase, isPaused, setWaveTimer]);

    useEffect(() => {
        if(waveTimer <= 0) {
             if (waveIntervalId.current) clearInterval(waveIntervalId.current);
              setMoneyOrbs(currentMoneyOrbs => {
                if (currentMoneyOrbs.length > 0) setPlayerDollars(useGameStore.getState().playerDollars + currentMoneyOrbs.reduce((s, o) => s + o.value, 0));
                return [];
              });
              setIsShopPhase(true);
              generateShopOfferings();
              if(enemySpawnTimerId.current) clearInterval(enemySpawnTimerId.current);
              enemySpawnTimerId.current = null;
              setFissureTraps([]);
              setFirePatches([]);
              setWaveTimer(WAVE_DURATION);
        }
    }, [waveTimer, generateShopOfferings]);

    const doSpawnEnemies = useCallback(() => {
        const { isShopPhase, isGameOver, isPaused, wave, player, enemies } = useGameStore.getState();
        if (isShopPhase || isGameOver || isPaused) return;

        const { newEnemies } = spawnEnemiesOnTick(wave, player, enemies);
        if (newEnemies.length > 0) {
            setEnemies([...enemies, ...newEnemies]);
        }
    }, [setEnemies]);

    useEffect(() => {
        if (isShopPhase || isGameOver || isPaused) {
        if (enemySpawnTimerId.current) clearInterval(enemySpawnTimerId.current);
        enemySpawnTimerId.current = null;
        return;
        }
        if (!enemySpawnTimerId.current) {
            doSpawnEnemies();
            enemySpawnTimerId.current = setInterval(doSpawnEnemies, ENEMY_SPAWN_TICK_INTERVAL);
        }
    }, [isShopPhase, isGameOver, isPaused, doSpawnEnemies]);

    const startNextWave = () => {
        setIsShopPhase(false);
        setWave(wave + 1);
        setWaveTimer(WAVE_DURATION);
        setPlayer({ ...player, health: PLAYER_INITIAL_HEALTH });
        lastPlayerShotTimestampRef.current = {};
        lastTargetUpdateRef.current = 0;
        setIsPaused(false);
        setFissureTraps([]);
        setFirePatches([]);

        doSpawnEnemies();
        if (!enemySpawnTimerId.current) {
            enemySpawnTimerId.current = setInterval(doSpawnEnemies, ENEMY_SPAWN_TICK_INTERVAL);
        }
    };

  // --- Renderização do Jogo ---

  if (isGameOver) {
    return (
      <div className="text-center p-8">
        <h2 className="text-4xl font-bold text-destructive mb-4">Fim de Jogo!</h2>
        <p className="text-xl mb-2">Pontuação Final: {score}</p>
        <p className="text-lg mb-2">Onda Alcançada: {wave}</p>
        <p className="text-lg mb-4">Total Dinheiro Coletado: ${playerDollars}</p>
        <Button onClick={handleReset} className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 text-lg">
          Jogar Novamente
        </Button>
         <Button onClick={resetGameStateAndExit} variant="outline" className="mt-4 ml-2 px-6 py-2 text-lg">
          <HomeIcon className="mr-2 h-5 w-5" /> Menu Principal
        </Button>
      </div>
    );
  }

  if (isShopPhase) {
    return <ShopDialog
              onStartNextWave={startNextWave} wave={wave} score={score} playerMoney={playerDollars}
              shopOfferings={shopOfferings} playerWeapons={playerWeapons}
              onBuyWeapon={handleBuyWeapon} onRecycleWeapon={handleRecycleWeapon}
              canAfford={(cost) => playerDollars >= cost} inventoryFull={playerWeapons.length >= MAX_PLAYER_WEAPONS}
            />;
  }

  return (
    <div className="flex flex-col items-center p-1 sm:p-4 w-full h-full">
      <div className="w-full max-w-2xl flex justify-between items-start mb-1 sm:mb-2">
        <GameHUD score={score} wave={wave} playerHealth={player.health} waveTimer={waveTimer} playerMoney={playerDollars} />
        <Button onClick={() => setIsPaused(!isPaused)} variant="outline" size="icon" className="ml-2 sm:ml-4 mt-1 text-foreground hover:bg-accent hover:text-accent-foreground" aria-label={isPaused ? "Continuar" : "Pausar"}>
            {isPaused ? <PlayIcon className="h-5 w-5" /> : <PauseIcon className="h-5 w-5" />}
        </Button>
      </div>

      <div ref={gameWrapperRef} className="flex items-center justify-center flex-grow w-full overflow-hidden">
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
          <Card className="shadow-2xl overflow-hidden border-2 border-primary">
            <div ref={gameAreaRef} className="relative bg-muted/30 overflow-hidden" style={{ width: GAME_WIDTH, height: GAME_HEIGHT }} role="application" aria-label="Área de jogo Dustborn" tabIndex={-1}>
              <div className="absolute top-1 left-1 bg-black/50 text-white text-xs px-2 py-1 rounded z-50 font-mono">
                FPS: {fps}
              </div>
              {isPaused && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-50 p-4">
                  <h2 className="text-5xl font-bold text-primary-foreground animate-pulse mb-8">PAUSADO</h2>
                  <PlayerInventoryDisplay weapons={playerWeapons} canRecycle={false} className="w-full max-w-md bg-card/90 mb-6" />
                  <Button onClick={resetGameStateAndExit} variant="secondary" className="text-lg py-3 px-6">
                    <HomeIcon className="mr-2 h-5 w-5" /> Voltar ao Menu Principal
                  </Button>
                </div>
              )}
              <PlayerCharacter x={player.x} y={player.y} width={player.width} height={player.height} isTakingDamage={isPlayerTakingDamage} />
              {firePatches.map((patch) => (
                <FirePatchCharacter
                  key={patch.id}
                  x={patch.x} y={patch.y}
                  radius={patch.radius}
                  remainingDuration={patch.remainingDuration}
                  maxDuration={patch.maxDuration}
                />
              ))}
              {fissureTraps.map((trap) => (
                <FissureTrapCharacter
                    key={trap.id}
                    x={trap.x} y={trap.y}
                    width={trap.width} height={trap.height}
                    remainingDuration={trap.remainingDuration}
                    maxDuration={trap.maxDuration}
                />
              ))}
              {enemies.map((enemy) => (
                <EnemyCharacter key={enemy.id} x={enemy.x} y={enemy.y}
                  width={enemy.width} height={enemy.height} health={enemy.health} maxHealth={enemy.maxHealth}
                  type={enemy.type} isStunned={enemy.isStunned} isDetonating={enemy.isDetonating}
                />
              ))}
              {moneyOrbs.map((orb) => (<XPOrb key={orb.id} x={orb.x} y={orb.y} size={orb.size} /> ))}
              {playerProjectiles.map((proj) => ( <Projectile key={proj.id} {...proj} /> ))}
              {enemyProjectiles.map((proj) => ( <Projectile key={proj.id} {...proj} /> ))}
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
          <Button variant="outline" className="col-start-2 row-start-1 bg-card/70 text-card-foreground hover:bg-accent hover:text-accent-foreground aspect-square p-0" onTouchStart={() => handleMobileControl('w', true)} onTouchEnd={() => handleMobileControl('w', false)} onMouseDown={() => handleMobileControl('w', true)} onMouseUp={() => handleMobileControl('w', false)} onMouseLeave={() => handleMobileControl('w', false)} aria-label="Mover Cima"> <ArrowUp className="w-6 h-6 sm:w-8 sm:h-8" /> </Button>
          <div />
          <Button variant="outline" className="col-start-1 row-start-2 bg-card/70 text-card-foreground hover:bg-accent hover:text-accent-foreground aspect-square p-0" onTouchStart={() => handleMobileControl('a', true)} onTouchEnd={() => handleMobileControl('a', false)} onMouseDown={() => handleMobileControl('a', true)} onMouseUp={() => handleMobileControl('a', false)} onMouseLeave={() => handleMobileControl('a', false)} aria-label="Mover Esquerda"> <ArrowLeft className="w-6 h-6 sm:w-8 sm:h-8" /> </Button>
          <div />
          <Button variant="outline" className="col-start-3 row-start-2 bg-card/70 text-card-foreground hover:bg-accent hover:text-accent-foreground aspect-square p-0" onTouchStart={() => handleMobileControl('d', true)} onTouchEnd={() => handleMobileControl('d', false)} onMouseDown={() => handleMobileControl('d', true)} onMouseUp={() => handleMobileControl('d', false)} onMouseLeave={() => handleMobileControl('d', false)} aria-label="Mover Direita"> <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8" /> </Button>
          <div />
          <Button variant="outline" className="col-start-2 row-start-3 bg-card/70 text-card-foreground hover:bg-accent hover:text-accent-foreground aspect-square p-0" onTouchStart={() => handleMobileControl('s', true)} onTouchEnd={() => handleMobileControl('s', false)} onMouseDown={() => handleMobileControl('s', true)} onMouseUp={() => handleMobileControl('s', false)} onMouseLeave={() => handleMobileControl('s', false)} aria-label="Mover Baixo"> <ArrowDown className="w-6 h-6 sm:w-8 sm:h-8" /> </Button>
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
