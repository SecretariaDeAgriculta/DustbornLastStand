
import type { Enemy, Player, FissureTrapData, ProjectileData, LaserSightLine } from '../types';
import { GAME_WIDTH, GAME_HEIGHT, ENEMY_MOVE_INTERVAL } from '../constants/game';
import * as EnemyConstants from '../constants/enemies';
import * as ProjectileConstants from '../constants/projectiles';
import { createEnemyInstance } from './enemySpawningSystem';


interface UpdateEnemiesProps {
    enemies: Enemy[];
    player: Player;
    fissureTraps: FissureTrapData[];
    timestamp: number;
    damageToApply: Map<string, { damage: number, originWeaponId?: string }>;
}

export const updateEnemies = (props: UpdateEnemiesProps) => {
    const { enemies, player, fissureTraps, damageToApply } = props;

    let playerDamageThisTick = 0;
    const newEnemyProjectiles: ProjectileData[] = [];
    const newFissureTraps: FissureTrapData[] = [];
    const newLaserSights: LaserSightLine[] = [];
    const killedEnemies: Enemy[] = [];
    let bossDefeated = false;
    let defeatedBossType: string | null = null;
    let targetKilled = false;

    // First pass: Apply damage and filter out killed enemies
    const aliveEnemies = enemies.map(enemy => {
        let currentEnemyData = { ...enemy };
        if (damageToApply.has(enemy.id)) {
            const hitData = damageToApply.get(enemy.id)!;
            const newHealth = currentEnemyData.health - hitData.damage;
            currentEnemyData.health = newHealth;

            if (newHealth <= 0 && enemy.health > 0) {
                killedEnemies.push(enemy);
                if (enemy.type.startsWith('Boss_')) {
                    bossDefeated = true;
                    defeatedBossType = enemy.type;
                }
            } else if (newHealth > 0 && hitData.originWeaponId === 'voz_trovao') {
                const vozDoTrovaoWeapon = player.weapons?.find(w => w.id === 'voz_trovao');
                if (vozDoTrovaoWeapon?.stunDuration) {
                    currentEnemyData.isStunned = true;
                    currentEnemyData.stunTimer = vozDoTrovaoWeapon.stunDuration;
                }
            }
        }
        return currentEnemyData;
    }).filter(enemy => enemy.health > 0);

    // Second pass: Update logic for alive enemies
    const updatedEnemies = aliveEnemies.map(enemy => {
        let updatedEnemy = {...enemy};

        if (updatedEnemy.isStunned && updatedEnemy.stunTimer && updatedEnemy.stunTimer > 0) {
            updatedEnemy.stunTimer -= ENEMY_MOVE_INTERVAL;
            if (updatedEnemy.stunTimer <= 0) {
            updatedEnemy.isStunned = false;
            updatedEnemy.stunTimer = 0;
            } else return updatedEnemy; // Skip movement/attack if stunned
        }

        const playerCenterX = player.x + player.width / 2;
        const playerCenterY = player.y + player.height / 2;
        const enemyCenterX = updatedEnemy.x + updatedEnemy.width / 2;
        const enemyCenterY = updatedEnemy.y + updatedEnemy.height / 2;
        const deltaPlayerX = playerCenterX - enemyCenterX;
        const deltaPlayerY = playerCenterY - enemyCenterY;
        const distToPlayerSquared = deltaPlayerX * deltaPlayerX + deltaPlayerY * deltaPlayerY;
        const distToPlayer = Math.sqrt(distToPlayerSquared);

        if (updatedEnemy.type === 'AtiradorDeEliteMcGraw') {
            if (updatedEnemy.isAiming) {
                updatedEnemy.aimingTimer! -= ENEMY_MOVE_INTERVAL;
                newLaserSights.push({ id: updatedEnemy.id, x1: enemyCenterX, y1: enemyCenterY, x2: playerCenterX, y2: playerCenterY });
                if (updatedEnemy.aimingTimer! <= 0) {
                    const angleToPlayer = Math.atan2(playerCenterY - enemyCenterY, playerCenterX - enemyCenterX);
                    newEnemyProjectiles.push({
                        id: `eproj_mcgraw_${Date.now()}_${Math.random()}`, x: enemyCenterX - ProjectileConstants.ENEMY_PROJECTILE_SIZE / 2, y: enemyCenterY - ProjectileConstants.ENEMY_PROJECTILE_SIZE / 2,
                        size: ProjectileConstants.ENEMY_PROJECTILE_SIZE, dx: Math.cos(angleToPlayer), dy: Math.sin(angleToPlayer), damage: updatedEnemy.damage,
                        traveledDistance: 0, maxRange: updatedEnemy.attackRangeSquared, projectileType: 'enemy_bullet',
                        hitEnemyIds: new Set(), penetrationLeft: 0, isEnemyProjectile: true,
                    });
                    updatedEnemy.isAiming = false; updatedEnemy.attackCooldownTimer = updatedEnemy.attackCooldown;
                }
            } else {
                updatedEnemy.attackCooldownTimer = Math.max(0, (updatedEnemy.attackCooldownTimer || 0) - ENEMY_MOVE_INTERVAL);
                if (distToPlayerSquared < updatedEnemy.attackRangeSquared && (updatedEnemy.attackCooldownTimer || 0) <= 0) {
                    updatedEnemy.isAiming = true; updatedEnemy.aimingTimer = EnemyConstants.ENEMY_MCGRAW_TELEGRAPH_DURATION;
                    newLaserSights.push({ id: updatedEnemy.id, x1: enemyCenterX, y1: enemyCenterY, x2: playerCenterX, y2: playerCenterY });
                } else {
                    if (distToPlayerSquared > updatedEnemy.attackRangeSquared * 0.9) {
                        if (distToPlayer > 0) { updatedEnemy.x += (deltaPlayerX / distToPlayer) * updatedEnemy.speed; updatedEnemy.y += (deltaPlayerY / distToPlayer) * updatedEnemy.speed; }
                    } else if (distToPlayerSquared < updatedEnemy.attackRangeSquared * 0.3) {
                        if (distToPlayer > 0) { updatedEnemy.x -= (deltaPlayerX / distToPlayer) * updatedEnemy.speed * 0.5; updatedEnemy.y -= (deltaPlayerY / distToPlayer) * updatedEnemy.speed * 0.5; }
                    }
                }
            }
        } else if (updatedEnemy.type === 'DesertorGavilanes') {
            if (updatedEnemy.isBursting) {
                updatedEnemy.burstTimer! -= ENEMY_MOVE_INTERVAL;
                if (updatedEnemy.burstTimer! <= 0 && updatedEnemy.burstShotsLeft! > 0) {
                    const angleToPlayer = Math.atan2(deltaPlayerY, deltaPlayerX);
                    newEnemyProjectiles.push({
                        id: `eproj_desertor_${Date.now()}_${Math.random()}`, x: enemyCenterX - ProjectileConstants.ENEMY_PROJECTILE_SIZE / 2, y: enemyCenterY - ProjectileConstants.ENEMY_PROJECTILE_SIZE / 2,
                        size: ProjectileConstants.ENEMY_PROJECTILE_SIZE, dx: Math.cos(angleToPlayer), dy: Math.sin(angleToPlayer), damage: updatedEnemy.damage,
                        traveledDistance: 0, maxRange: updatedEnemy.attackRangeSquared, projectileType: 'enemy_bullet',
                        hitEnemyIds: new Set(), penetrationLeft: 0, isEnemyProjectile: true,
                    });
                    updatedEnemy.burstShotsLeft!--; updatedEnemy.burstTimer = EnemyConstants.ENEMY_DESERTOR_BURST_DELAY;
                }
                if (updatedEnemy.burstShotsLeft === 0) { updatedEnemy.isBursting = false; updatedEnemy.attackCooldownTimer = updatedEnemy.attackCooldown; }
            } else {
                updatedEnemy.attackCooldownTimer = Math.max(0, (updatedEnemy.attackCooldownTimer || 0) - ENEMY_MOVE_INTERVAL);
                 if (distToPlayerSquared > updatedEnemy.attackRangeSquared * 0.7 || distToPlayerSquared < EnemyConstants.ENEMY_PISTOLEIRO_MELEE_RANGE_SQUARED * 0.8) {
                     if (distToPlayerSquared > (updatedEnemy.width / 2 + player.width / 2) ** 2) {
                        if (distToPlayer > 0) { updatedEnemy.x += (deltaPlayerX / distToPlayer) * updatedEnemy.speed; updatedEnemy.y += (deltaPlayerY / distToPlayer) * updatedEnemy.speed; } }
                }
                if (distToPlayerSquared < updatedEnemy.attackRangeSquared && (updatedEnemy.attackCooldownTimer || 0) <= 0) {
                    updatedEnemy.isBursting = true; updatedEnemy.burstShotsLeft = EnemyConstants.ENEMY_DESERTOR_SHOTS_IN_BURST; updatedEnemy.burstTimer = 0;
                }
            }
        } else if (updatedEnemy.type === 'SabotadorDoCanyon') {
            if (updatedEnemy.isDetonating) {
                updatedEnemy.detonationTimer! -= ENEMY_MOVE_INTERVAL;
                if (updatedEnemy.detonationTimer! <= 0) {
                    if (distToPlayerSquared < EnemyConstants.ENEMY_SABOTADOR_EXPLOSION_RADIUS_SQUARED) {
                        playerDamageThisTick += updatedEnemy.damage;
                    }
                    updatedEnemy.health = 0; // Will be filtered out on next main loop
                }
            } else {
                if (distToPlayerSquared < EnemyConstants.ENEMY_SABOTADOR_DETONATION_RANGE_SQUARED) {
                    updatedEnemy.isDetonating = true; updatedEnemy.detonationTimer = EnemyConstants.ENEMY_SABOTADOR_DETONATION_TIMER_DURATION;
                }
            }
            if (!updatedEnemy.isDetonating && updatedEnemy.health > 0) {
                 if (distToPlayer > (updatedEnemy.width / 2 + player.width / 2) / 2 && distToPlayer > 0) {
                    updatedEnemy.x += (deltaPlayerX / distToPlayer) * updatedEnemy.speed; updatedEnemy.y += (deltaPlayerY / distToPlayer) * updatedEnemy.speed; }
            }
        } else if (updatedEnemy.type === 'PistoleiroVagabundo') {
             updatedEnemy.attackCooldownTimer = Math.max(0, (updatedEnemy.attackCooldownTimer || 0) - ENEMY_MOVE_INTERVAL);
             if (distToPlayerSquared > updatedEnemy.attackRangeSquared * 0.7 || distToPlayerSquared < EnemyConstants.ENEMY_PISTOLEIRO_MELEE_RANGE_SQUARED * 0.8) {
                 if (distToPlayerSquared > (updatedEnemy.width / 2 + player.width / 2) ** 2) {
                    if (distToPlayer > 0) { updatedEnemy.x += (deltaPlayerX / distToPlayer) * updatedEnemy.speed; updatedEnemy.y += (deltaPlayerY / distToPlayer) * updatedEnemy.speed; } }
            }
            if ((updatedEnemy.attackCooldownTimer || 0) <= 0 && distToPlayerSquared < updatedEnemy.attackRangeSquared && distToPlayerSquared > EnemyConstants.ENEMY_PISTOLEIRO_MELEE_RANGE_SQUARED * 0.5 ) {
                const angleToPlayer = Math.atan2(deltaPlayerY, deltaPlayerX);
                newEnemyProjectiles.push({
                    id: `eproj_${Date.now()}_${Math.random()}`, x: enemyCenterX - ProjectileConstants.ENEMY_PROJECTILE_SIZE / 2, y: enemyCenterY - ProjectileConstants.ENEMY_PROJECTILE_SIZE / 2,
                    size: ProjectileConstants.ENEMY_PROJECTILE_SIZE, dx: Math.cos(angleToPlayer), dy: Math.sin(angleToPlayer), damage: updatedEnemy.damage,
                    traveledDistance: 0, maxRange: updatedEnemy.attackRangeSquared, projectileType: 'enemy_bullet',
                    hitEnemyIds: new Set(), penetrationLeft: 0, isEnemyProjectile: true,
                });
                updatedEnemy.attackCooldownTimer = updatedEnemy.attackCooldown;
            }
        } else if (updatedEnemy.type === 'VigiaDaFerrovia') {
            updatedEnemy.attackCooldownTimer = Math.max(0, (updatedEnemy.attackCooldownTimer || 0) - ENEMY_MOVE_INTERVAL);
             if (distToPlayerSquared < updatedEnemy.attackRangeSquared) {
                if ((updatedEnemy.attackCooldownTimer || 0) <= 0) {
                    const angleToPlayer = Math.atan2(deltaPlayerY, deltaPlayerX);
                    newEnemyProjectiles.push({
                        id: `eproj_vigia_${Date.now()}_${Math.random()}`, x: enemyCenterX - ProjectileConstants.ENEMY_PROJECTILE_SIZE / 2, y: enemyCenterY - ProjectileConstants.ENEMY_PROJECTILE_SIZE / 2,
                        size: ProjectileConstants.ENEMY_PROJECTILE_SIZE, dx: Math.cos(angleToPlayer), dy: Math.sin(angleToPlayer), damage: updatedEnemy.damage,
                        traveledDistance: 0, maxRange: updatedEnemy.attackRangeSquared, projectileType: 'enemy_bullet',
                         hitEnemyIds: new Set(), penetrationLeft: 0, isEnemyProjectile: true,
                    });
                    updatedEnemy.attackCooldownTimer = updatedEnemy.attackCooldown;
                }
            } else {
                if (distToPlayerSquared > (updatedEnemy.width / 2 + player.width / 2) ** 2) {
                    if (distToPlayer > 0) { updatedEnemy.x += (deltaPlayerX / distToPlayer) * updatedEnemy.speed; updatedEnemy.y += (deltaPlayerY / distToPlayer) * updatedEnemy.speed; } }
            }
        } else { // Melee enemies
             updatedEnemy.attackCooldownTimer = Math.max(0, (updatedEnemy.attackCooldownTimer || 0) - ENEMY_MOVE_INTERVAL);
             if ((updatedEnemy.attackCooldownTimer || 0) <= 0 && distToPlayerSquared < updatedEnemy.attackRangeSquared) {
                playerDamageThisTick += updatedEnemy.damage;
                updatedEnemy.attackCooldownTimer = updatedEnemy.attackCooldown;
            } else if (distToPlayerSquared > (updatedEnemy.width / 2 + player.width / 2) ** 2) {
                if (distToPlayer > 0) { updatedEnemy.x += (deltaPlayerX / distToPlayer) * updatedEnemy.speed; updatedEnemy.y += (deltaPlayerY / distToPlayer) * updatedEnemy.speed; } }
            }

        // Clamp position to game bounds
        updatedEnemy.x = Math.max(0, Math.min(updatedEnemy.x, GAME_WIDTH - updatedEnemy.width));
        updatedEnemy.y = Math.max(0, Math.min(updatedEnemy.y, GAME_HEIGHT - updatedEnemy.height));

        return updatedEnemy;
    });

    return {
        updatedEnemies: updatedEnemies.filter(e => e.health > 0),
        newEnemyProjectiles,
        newFissureTraps,
        newLaserSights,
        playerDamage: playerDamageThisTick,
        killedEnemies,
        bossDefeated,
        defeatedBossType,
        targetKilled
    };
};

    
