
import type { Enemy, Player, EnemyType } from '../types';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/game';
import { PLAYER_SIZE } from '../constants/player';
import * as EnemyConstants from '../constants/enemies';

const bossPool: EnemyType[] = ['Boss_BigDoyle', 'Boss_CaptainMcGraw', 'Boss_DomGael', 'Boss_CalebHodge'];

export const createEnemyInstance = (
    type: EnemyType,
    currentWave: number,
    currentPlayer: Player
  ): Enemy | null => {
    let enemyBaseSize: number, enemyInitialHealth: number, enemyBaseSpeed: number,
        enemyDamageVal: number, enemyMoneyVal: number, enemyAtkRangeSq: number,
        enemyAtkCooldown: number, enemyIsDetonating = false, enemyDetonationTimer = 0,
        enemyIsAiming = false, enemyAimingTimer = 0, enemyIsBursting = false,
        enemyBurstShotsLeft = 0, enemyBurstTimer = 0,
        enemyAttackMode: 'pistol' | 'knife' | undefined = undefined;


    let finalHealth: number = 0, finalSpeed: number = 0, finalMoneyValue: number = 0;

    switch (type) {
        case 'ArruaceiroSaloon':
            enemyBaseSize = EnemyConstants.ENEMY_ARROCEIRO_SIZE; enemyInitialHealth = EnemyConstants.ENEMY_ARROCEIRO_INITIAL_HEALTH;
            enemyBaseSpeed = EnemyConstants.ENEMY_ARROCEIRO_BASE_SPEED; enemyDamageVal = EnemyConstants.ENEMY_ARROCEIRO_DAMAGE;
            enemyMoneyVal = EnemyConstants.ENEMY_ARROCEIRO_MONEY_VALUE; enemyAtkRangeSq = EnemyConstants.ENEMY_ARROCEIRO_ATTACK_RANGE_SQUARED;
            enemyAtkCooldown = EnemyConstants.ENEMY_ARROCEIRO_ATTACK_COOLDOWN; break;
        case 'Cão de Fazenda':
            enemyBaseSize = EnemyConstants.ENEMY_CAODEFAZENDA_SIZE; enemyInitialHealth = EnemyConstants.ENEMY_CAODEFAZENDA_INITIAL_HEALTH;
            enemyBaseSpeed = EnemyConstants.ENEMY_CAODEFAZENDA_BASE_SPEED; enemyDamageVal = EnemyConstants.ENEMY_CAODEFAZENDA_DAMAGE;
            enemyMoneyVal = EnemyConstants.ENEMY_CAODEFAZENDA_MONEY_VALUE; enemyAtkRangeSq = EnemyConstants.ENEMY_CAODEFAZENDA_ATTACK_RANGE_SQUARED;
            enemyAtkCooldown = EnemyConstants.ENEMY_CAODEFAZENDA_ATTACK_COOLDOWN; break;
        case 'PistoleiroVagabundo':
            enemyBaseSize = EnemyConstants.ENEMY_PISTOLEIRO_SIZE; enemyInitialHealth = EnemyConstants.ENEMY_PISTOLEIRO_INITIAL_HEALTH;
            enemyBaseSpeed = EnemyConstants.ENEMY_PISTOLEiro_BASE_SPEED; enemyDamageVal = EnemyConstants.ENEMY_PISTOLEIRO_DAMAGE;
            enemyMoneyVal = EnemyConstants.ENEMY_PISTOLEIRO_MONEY_VALUE; enemyAtkRangeSq = EnemyConstants.ENEMY_PISTOLEIRO_ATTACK_RANGE_SQUARED;
            enemyAtkCooldown = EnemyConstants.ENEMY_PISTOLEIRO_ATTACK_COOLDOWN; break;
        case 'MineradorRebelde':
            enemyBaseSize = EnemyConstants.ENEMY_MINERADOR_SIZE; enemyInitialHealth = EnemyConstants.ENEMY_MINERADOR_INITIAL_HEALTH;
            enemyBaseSpeed = EnemyConstants.ENEMY_MINERADOR_BASE_SPEED; enemyDamageVal = EnemyConstants.ENEMY_MINERADOR_DAMAGE;
            enemyMoneyVal = EnemyConstants.ENEMY_MINERADOR_MONEY_VALUE; enemyAtkRangeSq = EnemyConstants.ENEMY_MINERADOR_ATTACK_RANGE_SQUARED;
            enemyAtkCooldown = EnemyConstants.ENEMY_MINERADOR_ATTACK_COOLDOWN; break;
        case 'VigiaDaFerrovia':
            enemyBaseSize = EnemyConstants.ENEMY_VIGIA_SIZE; enemyInitialHealth = EnemyConstants.ENEMY_VIGIA_INITIAL_HEALTH;
            enemyBaseSpeed = EnemyConstants.ENEMY_VIGIA_BASE_SPEED; enemyDamageVal = EnemyConstants.ENEMY_VIGIA_DAMAGE;
            enemyMoneyVal = EnemyConstants.ENEMY_VIGIA_MONEY_VALUE; enemyAtkRangeSq = EnemyConstants.ENEMY_VIGIA_ATTACK_RANGE_SQUARED;
            enemyAtkCooldown = EnemyConstants.ENEMY_VIGIA_ATTACK_COOLDOWN; break;
        case 'BrutoBoyle':
            enemyBaseSize = EnemyConstants.ENEMY_BRUTOBOYLE_SIZE; enemyInitialHealth = EnemyConstants.ENEMY_BRUTOBOYLE_INITIAL_HEALTH;
            enemyBaseSpeed = EnemyConstants.ENEMY_BRUTOBOYLE_BASE_SPEED; enemyDamageVal = EnemyConstants.ENEMY_BRUTOBOYLE_DAMAGE;
            enemyMoneyVal = EnemyConstants.ENEMY_BRUTOBOYLE_MONEY_VALUE; enemyAtkRangeSq = EnemyConstants.ENEMY_BRUTOBOYLE_ATTACK_RANGE_SQUARED;
            enemyAtkCooldown = EnemyConstants.ENEMY_BRUTOBOYLE_ATTACK_COOLDOWN; break;
        case 'SabotadorDoCanyon':
            enemyBaseSize = EnemyConstants.ENEMY_SABOTADOR_SIZE; enemyInitialHealth = EnemyConstants.ENEMY_SABOTADOR_INITIAL_HEALTH;
            enemyBaseSpeed = EnemyConstants.ENEMY_SABOTADOR_BASE_SPEED; enemyDamageVal = EnemyConstants.ENEMY_SABOTADOR_DAMAGE;
            enemyMoneyVal = EnemyConstants.ENEMY_SABOTADOR_MONEY_VALUE; enemyAtkRangeSq = EnemyConstants.ENEMY_SABOTADOR_DETONATION_RANGE_SQUARED;
            enemyAtkCooldown = EnemyConstants.ENEMY_SABOTADOR_DETONATION_TIMER_DURATION; enemyIsDetonating = false; enemyDetonationTimer = 0; break;
        case 'AtiradorDeEliteMcGraw':
            enemyBaseSize = EnemyConstants.ENEMY_MCGRAW_SIZE; enemyInitialHealth = EnemyConstants.ENEMY_MCGRAW_INITIAL_HEALTH;
            enemyBaseSpeed = EnemyConstants.ENEMY_MCGRAW_BASE_SPEED; enemyDamageVal = EnemyConstants.ENEMY_MCGRAW_DAMAGE;
            enemyMoneyVal = EnemyConstants.ENEMY_MCGRAW_MONEY_VALUE; enemyAtkRangeSq = EnemyConstants.ENEMY_MCGRAW_ATTACK_RANGE_SQUARED;
            enemyAtkCooldown = EnemyConstants.ENEMY_MCGRAW_ATTACK_COOLDOWN; enemyIsAiming = false; enemyAimingTimer = 0; break;
        case 'DesertorGavilanes':
            enemyBaseSize = EnemyConstants.ENEMY_DESERTOR_SIZE; enemyInitialHealth = EnemyConstants.ENEMY_DESERTOR_INITIAL_HEALTH;
            enemyBaseSpeed = EnemyConstants.ENEMY_DESERTOR_BASE_SPEED; enemyDamageVal = EnemyConstants.ENEMY_DESERTOR_DAMAGE;
            enemyMoneyVal = EnemyConstants.ENEMY_DESERTOR_MONEY_VALUE; enemyAtkRangeSq = EnemyConstants.ENEMY_DESERTOR_ATTACK_RANGE_SQUARED;
            enemyAtkCooldown = EnemyConstants.ENEMY_DESERTOR_ATTACK_COOLDOWN; enemyIsBursting = false; enemyBurstShotsLeft = 0; enemyBurstTimer = 0; break;
        default: console.error("Tipo de inimigo desconhecido:", type); return null;
    }

    if (type.startsWith('Boss_')) {
        const bossAppearances = Math.floor(currentWave / 10);
        let healthMultiplier = 0.25;
        let moneyMultiplier = 0.5;
        if (type === 'Boss_CaptainMcGraw') { healthMultiplier = 0.20; moneyMultiplier = 0.40; }
        if (type === 'Boss_DomGael') { healthMultiplier = 0.22; moneyMultiplier = 0.45; }
        if (type === 'Boss_CalebHodge') { healthMultiplier = 0.28; moneyMultiplier = 0.55; }

        finalHealth = Math.round(enemyInitialHealth * (1 + bossAppearances * healthMultiplier));
        finalMoneyValue = Math.round(enemyMoneyVal * (1 + bossAppearances * moneyMultiplier));
        finalSpeed = enemyBaseSpeed;
    } else if (type !== 'PatrolDrone') {
        const waveMultiplier = (currentWave -1) * 0.15;
        finalHealth = Math.round(enemyInitialHealth * (1 + waveMultiplier * 1.2));
        finalSpeed = enemyBaseSpeed * (1 + waveMultiplier * 0.5);
        if (['ArruaceiroSaloon', 'Cão de Fazenda'].includes(type)) finalMoneyValue = enemyMoneyVal + Math.floor(currentWave / 2);
        else if (['PistoleiroVagabundo', 'MineradorRebelde', 'SabotadorDoCanyon'].includes(type)) finalMoneyValue = enemyMoneyVal + currentWave -1;
        else if (['VigiaDaFerrovia', 'BrutoBoyle', 'AtiradorDeEliteMcGraw', 'DesertorGavilanes'].includes(type)) finalMoneyValue = enemyMoneyVal + Math.floor((currentWave -1) * 1.5);
        else finalMoneyValue = enemyMoneyVal;
    }


    let newX, newY; let attempts = 0; const maxAttempts = 20;
    const minDistanceFromPlayerSquared = (type.startsWith('Boss_') ? PLAYER_SIZE * 3 : PLAYER_SIZE * 5) ** 2;
    const enemyWidth = enemyBaseSize, enemyHeight = enemyBaseSize, padding = type.startsWith('Boss_') ? 0 : 20;

    do {
        newX = padding + Math.random() * (GAME_WIDTH - enemyWidth - 2 * padding);
        newY = padding + Math.random() * (GAME_HEIGHT - enemyHeight - 2 * padding);
        attempts++;
        if (attempts >= maxAttempts ||
            ( (currentPlayer.x + currentPlayer.width / 2 - (newX + enemyWidth/2))**2 +
              (currentPlayer.y + currentPlayer.height / 2 - (newY + enemyHeight/2))**2 ) >= minDistanceFromPlayerSquared) break;
    } while (true);

    if (type.startsWith('Boss_')) {
        newX = GAME_WIDTH / 2 - enemyWidth / 2;
        newY = GAME_HEIGHT / 4 - enemyHeight / 2;
    }


    return {
        id: `enemy_${Date.now()}_${Math.random()}_${type}`, x: newX, y: newY,
        width: enemyWidth, height: enemyHeight, health: finalHealth, maxHealth: finalHealth,
        type: type, moneyValue: finalMoneyValue, attackCooldownTimer: Math.random() * enemyAtkCooldown,
        speed: finalSpeed, damage: enemyDamageVal, attackRangeSquared: enemyAtkRangeSq,
        attackCooldown: enemyAtkCooldown, isDetonating: enemyIsDetonating, detonationTimer: enemyDetonationTimer,
        isAiming: enemyIsAiming, aimingTimer: enemyAimingTimer, isBursting: enemyIsBursting,
        burstShotsLeft: enemyBurstShotsLeft, burstTimer: enemyBurstTimer,
        attackMode: type === 'Boss_DomGael' ? enemyAttackMode : undefined,
    };
  };

export const spawnEnemiesOnTick = (currentWave: number, currentPlayer: Player, currentEnemiesList: Enemy[]) => {
    const newEnemies: Enemy[] = [];
    let newBossId: string | null = null;
    let newIsBossWaveActive: boolean | undefined = undefined;

    const arruaceiroCount = currentEnemiesList.filter(e => e.type === 'ArruaceiroSaloon').length;
    const caoCount = currentEnemiesList.filter(e => e.type === 'Cão de Fazenda').length;
    const pistoleiroCount = currentEnemiesList.filter(e => e.type === 'PistoleiroVagabundo').length;
    const mineradorCount = currentEnemiesList.filter(e => e.type === 'MineradorRebelde').length;
    const vigiaCount = currentEnemiesList.filter(e => e.type === 'VigiaDaFerrovia').length;
    const brutoCount = currentEnemiesList.filter(e => e.type === 'BrutoBoyle').length;
    const sabotadorCount = currentEnemiesList.filter(e => e.type === 'SabotadorDoCanyon').length;
    const mcgrawCount = currentEnemiesList.filter(e => e.type === 'AtiradorDeEliteMcGraw').length;
    const desertorCount = currentEnemiesList.filter(e => e.type === 'DesertorGavilanes').length;

    const maxArroceirosForWave = EnemyConstants.MAX_ARROCEIROS_WAVE_BASE + currentWave;
    const maxCaesForWave = currentWave >= 2 ? EnemyConstants.MAX_CAES_WAVE_BASE + (currentWave - 2) * 1 : 0;
    const maxPistoleirosForWave = currentWave >= 3 ? EnemyConstants.MAX_PISTOLEIROS_WAVE_BASE + Math.floor((currentWave - 3) / 2) * EnemyConstants.PISTOLEIRO_SPAWN_BATCH_SIZE : 0;
    const maxMineradoresForWave = currentWave >= 4 ? EnemyConstants.MAX_MINERADORES_WAVE_BASE + Math.floor((currentWave - 4) / 2) * EnemyConstants.MINERADOR_SPAWN_BATCH_SIZE : 0;
    const maxVigiasForWave = currentWave >= 5 ? EnemyConstants.MAX_VIGIAS_WAVE_BASE + Math.floor((currentWave - 5) / 2) * EnemyConstants.VIGIA_SPAWN_BATCH_SIZE : 0;
    const maxBrutosForWave = currentWave >= 6 ? EnemyConstants.MAX_BRUTOS_WAVE_BASE + Math.floor((currentWave - 6) / 3) * EnemyConstants.BRUTO_SPAWN_BATCH_SIZE : 0;
    const maxSabotadoresForWave = currentWave >= 7 ? EnemyConstants.MAX_SABOTADORES_WAVE_BASE + Math.floor((currentWave - 7) / 2) * EnemyConstants.SABOTADOR_SPAWN_BATCH_SIZE : 0;
    const maxMcGrawForWave = currentWave >= 8 ? EnemyConstants.MAX_MCGRAW_WAVE_BASE + Math.floor((currentWave - 8) / 3) * EnemyConstants.MCGRAW_SPAWN_BATCH_SIZE : 0;
    const maxDesertorForWave = currentWave >= 9 ? EnemyConstants.MAX_DESERTOR_WAVE_BASE + Math.floor((currentWave - 9) / 2) * EnemyConstants.DESERTOR_SPAWN_BATCH_SIZE : 0;

    const newEnemiesBatch: Enemy[] = [];
    if (currentWave >= 1 && arruaceiroCount < maxArroceirosForWave) { const e = createEnemyInstance('ArruaceiroSaloon', currentWave, currentPlayer); if (e) newEnemiesBatch.push(e); }
    if (currentWave >= 2 && caoCount < maxCaesForWave) { for (let i=0; i < Math.min(EnemyConstants.CAO_SPAWN_BATCH_SIZE, maxCaesForWave - caoCount); i++) { const e = createEnemyInstance('Cão de Fazenda', currentWave, currentPlayer); if (e) newEnemiesBatch.push(e); } }
    if (currentWave >= 3 && pistoleiroCount < maxPistoleirosForWave) { for (let i=0; i < Math.min(EnemyConstants.PISTOLEIRO_SPAWN_BATCH_SIZE, maxPistoleirosForWave - pistoleiroCount); i++) { const e = createEnemyInstance('PistoleiroVagabundo', currentWave, currentPlayer); if (e) newEnemiesBatch.push(e); } }
    if (currentWave >= 4 && mineradorCount < maxMineradoresForWave) { for (let i=0; i < Math.min(EnemyConstants.MINERADOR_SPAWN_BATCH_SIZE, maxMineradoresForWave - mineradorCount); i++) { const e = createEnemyInstance('MineradorRebelde', currentWave, currentPlayer); if (e) newEnemiesBatch.push(e); } }
    if (currentWave >= 5 && vigiaCount < maxVigiasForWave) { for (let i=0; i < Math.min(EnemyConstants.VIGIA_SPAWN_BATCH_SIZE, maxVigiasForWave - vigiaCount); i++) { const e = createEnemyInstance('VigiaDaFerrovia', currentWave, currentPlayer); if (e) newEnemiesBatch.push(e); } }
    if (currentWave >= 6 && brutoCount < maxBrutosForWave) { for (let i=0; i < Math.min(EnemyConstants.BRUTO_SPAWN_BATCH_SIZE, maxBrutosForWave - brutoCount); i++) { const e = createEnemyInstance('BrutoBoyle', currentWave, currentPlayer); if (e) newEnemiesBatch.push(e); } }
    if (currentWave >= 7 && sabotadorCount < maxSabotadoresForWave) { for (let i=0; i < Math.min(EnemyConstants.SABOTADOR_SPAWN_BATCH_SIZE, maxSabotadoresForWave - sabotadorCount); i++) { const e = createEnemyInstance('SabotadorDoCanyon', currentWave, currentPlayer); if (e) newEnemiesBatch.push(e); } }
    if (currentWave >= 8 && mcgrawCount < maxMcGrawForWave) { for (let i=0; i < Math.min(EnemyConstants.MCGRAW_SPAWN_BATCH_SIZE, maxMcGrawForWave - mcgrawCount); i++) { const e = createEnemyInstance('AtiradorDeEliteMcGraw', currentWave, currentPlayer); if (e) newEnemiesBatch.push(e); } }
    if (currentWave >= 9 && desertorCount < maxDesertorForWave) { for (let i=0; i < Math.min(EnemyConstants.DESERTOR_SPAWN_BATCH_SIZE, maxDesertorForWave - desertorCount); i++) { const e = createEnemyInstance('DesertorGavilanes', currentWave, currentPlayer); if (e) newEnemiesBatch.push(e); } }
    
    newEnemies.push(...newEnemiesBatch);

    return { newEnemies, newBossId, newIsBossWaveActive };
};

    
