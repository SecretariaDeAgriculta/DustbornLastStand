
import type { Enemy, Player, FissureTrapData, ProjectileData, LaserSightLine } from '../types';
import { GAME_WIDTH, GAME_HEIGHT, ENEMY_MOVE_INTERVAL } from '../constants/game';
import * as EnemyConstants from '../constants/enemies';
import * as ProjectileConstants from '../constants/projectiles';
import { createEnemyInstance } from './enemySpawningSystem';


interface UpdateEnemiesProps {
    enemies: Enemy[];
    player: Player;
    isPlayerTakingDamage: boolean;
    isGameOver: boolean;
    fissureTraps: FissureTrapData[];
    timestamp: number;
    damageToApply: Map<string, { damage: number, originWeaponId?: string }>;
}

export const updateEnemies = (props: UpdateEnemiesProps) => {
    const { enemies, player, isGameOver, fissureTraps, damageToApply } = props;

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

        // --- BOSS LOGIC ---
        if (updatedEnemy.type === 'Boss_CalebHodge') {
                updatedEnemy.dynamiteThrowCooldownTimer = Math.max(0, (updatedEnemy.dynamiteThrowCooldownTimer || 0) - ENEMY_MOVE_INTERVAL);
                updatedEnemy.fissureCreateCooldownTimer = Math.max(0, (updatedEnemy.fissureCreateCooldownTimer || 0) - ENEMY_MOVE_INTERVAL);

                const activeFissures = fissureTraps.length;
                if ((updatedEnemy.fissureCreateCooldownTimer || 0) <= 0 && activeFissures < EnemyConstants.ENEMY_CALEBHODGE_MAX_ACTIVE_FISSURES) {
                    let fissureX, fissureY, attempts = 0;
                    const maxAttempts = 10;
                    do {
                        const angle = Math.random() * 2 * Math.PI;
                        const radius = 80 + Math.random() * 100;
                        fissureX = enemyCenterX + Math.cos(angle) * radius - EnemyConstants.FISSURE_TRAP_WIDTH / 2;
                        fissureY = enemyCenterY + Math.sin(angle) * radius - EnemyConstants.FISSURE_TRAP_HEIGHT / 2;
                        attempts++;
                    } while (
                        (fissureX < 0 || fissureX + EnemyConstants.FISSURE_TRAP_WIDTH > GAME_WIDTH ||
                         fissureY < 0 || fissureY + EnemyConstants.FISSURE_TRAP_HEIGHT > GAME_HEIGHT) && attempts < maxAttempts
                    );

                    if (attempts < maxAttempts) {
                         newFissureTraps.push({
                            id: `fissure_${Date.now()}_${Math.random()}`, x: fissureX, y: fissureY,
                            width: EnemyConstants.FISSURE_TRAP_WIDTH, height: EnemyConstants.FISSURE_TRAP_HEIGHT,
                            remainingDuration: EnemyConstants.FISSURE_TRAP_DURATION, lastDamageTickPlayer: 0,
                            maxDuration: EnemyConstants.FISSURE_TRAP_DURATION,
                        });
                    }
                    updatedEnemy.fissureCreateCooldownTimer = EnemyConstants.ENEMY_CALEBHODGE_FISSURE_CREATE_COOLDOWN + (Math.random() * 1000 - 500);
                }
                else if ((updatedEnemy.dynamiteThrowCooldownTimer || 0) <= 0 && distToPlayerSquared < updatedEnemy.attackRangeSquared) {
                    const angleToPlayer = Math.atan2(deltaPlayerY, deltaPlayerX);
                    newEnemyProjectiles.push({
                        id: `eproj_dynamite_${Date.now()}_${Math.random()}`, x: enemyCenterX - ProjectileConstants.DYNAMITE_PROJECTILE_SIZE / 2,
                        y: enemyCenterY - ProjectileConstants.DYNAMITE_PROJECTILE_SIZE / 2, size: ProjectileConstants.DYNAMITE_PROJECTILE_SIZE,
                        dx: Math.cos(angleToPlayer), dy: Math.sin(angleToPlayer), damage: EnemyConstants.ENEMY_CALEBHODGE_DYNAMITE_DAMAGE,
                        traveledDistance: 0, maxRange: ProjectileConstants.DYNAMITE_MAX_TRAVEL_DISTANCE, projectileType: 'dynamite_explosive',
                        isBarrelOrDynamite: true, hasLanded: false, fuseTimer: ProjectileConstants.DYNAMITE_FUSE_TIME,
                        explosionRadiusSquared: ProjectileConstants.DYNAMITE_EXPLOSION_RADIUS_SQUARED, hitEnemyIds: new Set(), penetrationLeft: 0, isEnemyProjectile: true,
                    });
                    updatedEnemy.dynamiteThrowCooldownTimer = EnemyConstants.ENEMY_CALEBHODGE_DYNAMITE_THROW_COOLDOWN + (Math.random() * 1000 - 500);
                }

                const idealDistSq = updatedEnemy.attackRangeSquared * 0.5;
                if (distToPlayerSquared < idealDistSq * 0.8) {
                     if (distToPlayer > 0) {
                        updatedEnemy.x -= (deltaPlayerX / distToPlayer) * updatedEnemy.speed * 0.7;
                        updatedEnemy.y -= (deltaPlayerY / distToPlayer) * updatedEnemy.speed * 0.7;
                    }
                } else if (distToPlayerSquared > idealDistSq * 1.2) {
                    if (distToPlayer > 0) {
                        updatedEnemy.x += (deltaPlayerX / distToPlayer) * updatedEnemy.speed;
                        updatedEnemy.y += (deltaPlayerY / distToPlayer) * updatedEnemy.speed;
                    }
                }
        }
        else if (updatedEnemy.type === 'Boss_DomGael') {
            updatedEnemy.attackCooldownTimer = Math.max(0, (updatedEnemy.attackCooldownTimer || 0) - ENEMY_MOVE_INTERVAL);
            updatedEnemy.dashCooldownTimer = Math.max(0, (updatedEnemy.dashCooldownTimer || 0) - ENEMY_MOVE_INTERVAL);
            updatedEnemy.allySpawnCooldownTimer = Math.max(0, (updatedEnemy.allySpawnCooldownTimer || 0) - ENEMY_MOVE_INTERVAL);
            updatedEnemy.modeSwitchCooldownTimer = Math.max(0, (updatedEnemy.modeSwitchCooldownTimer || 0) - ENEMY_MOVE_INTERVAL);

            if (updatedEnemy.isDashing && updatedEnemy.dashTimer && updatedEnemy.dashTimer > 0) {
                updatedEnemy.dashTimer -= ENEMY_MOVE_INTERVAL;
                const currentDashSpeed = updatedEnemy.speed * EnemyConstants.ENEMY_DOMGAEL_DASH_SPEED_MULTIPLIER;
                updatedEnemy.x += (updatedEnemy.dashDx || 0) * currentDashSpeed;
                updatedEnemy.y += (updatedEnemy.dashDy || 0) * currentDashSpeed;

                if (updatedEnemy.dashTimer <= 0) updatedEnemy.isDashing = false;
            } else {
                const activeAllies = enemies.filter(e => e.type === 'DesertorGavilanes' || e.type === 'PistoleiroVagabundo').length;
                if ((updatedEnemy.allySpawnCooldownTimer || 0) <= 0 && activeAllies < EnemyConstants.ENEMY_DOMGAEL_MAX_ACTIVE_ALLIES) {
                    const allyTypeToSpawn = Math.random() < 0.6 ? 'DesertorGavilanes' : 'PistoleiroVagabundo';
                    const ally = createEnemyInstance(allyTypeToSpawn, 10, player);
                    if (ally) {
                        ally.x = updatedEnemy.x + (Math.random() * 60 - 30);
                        ally.y = updatedEnemy.y + (Math.random() * 60 - 30);
                        // This part is tricky. The system shouldn't directly set state.
                        // It should return the new ally to be added in the main component.
                        // For now, let's assume this requires refactoring later.
                    }
                    updatedEnemy.allySpawnCooldownTimer = EnemyConstants.ENEMY_DOMGAEL_ALLY_SPAWN_COOLDOWN;
                }
                else if ((updatedEnemy.dashCooldownTimer || 0) <= 0) {
                    updatedEnemy.isDashing = true;
                    updatedEnemy.dashTimer = EnemyConstants.ENEMY_DOMGAEL_DASH_DURATION;
                    let dashAngle = Math.atan2(deltaPlayerY, deltaPlayerX) + (Math.PI / 2) * (Math.random() < 0.5 ? 1 : -1);
                    if (Math.random() < 0.3) dashAngle += Math.PI;
                    updatedEnemy.dashDx = Math.cos(dashAngle);
                    updatedEnemy.dashDy = Math.sin(dashAngle);
                    updatedEnemy.dashCooldownTimer = EnemyConstants.ENEMY_DOMGAEL_DASH_COOLDOWN;
                }
                else if ((updatedEnemy.modeSwitchCooldownTimer || 0) <= 0) {
                    let switchedMode = false;
                    if (distToPlayerSquared > EnemyConstants.ENEMY_DOMGAEL_PISTOL_ATTACK_RANGE_SQUARED * 0.8 && updatedEnemy.attackMode !== 'pistol') {
                        updatedEnemy.attackMode = 'pistol';
                        updatedEnemy.attackRangeSquared = EnemyConstants.ENEMY_DOMGAEL_PISTOL_ATTACK_RANGE_SQUARED;
                        updatedEnemy.attackCooldown = EnemyConstants.ENEMY_DOMGAEL_PISTOL_COOLDOWN;
                        updatedEnemy.damage = EnemyConstants.ENEMY_DOMGAEL_PISTOL_DAMAGE;
                        switchedMode = true;
                    } else if (distToPlayerSquared < EnemyConstants.ENEMY_DOMGAEL_KNIFE_ATTACK_RANGE_SQUARED * 1.2 && updatedEnemy.attackMode !== 'knife') {
                        updatedEnemy.attackMode = 'knife';
                        updatedEnemy.attackRangeSquared = EnemyConstants.ENEMY_DOMGAEL_KNIFE_ATTACK_RANGE_SQUARED;
                        updatedEnemy.attackCooldown = EnemyConstants.ENEMY_DOMGAEL_KNIFE_COOLDOWN;
                        updatedEnemy.damage = EnemyConstants.ENEMY_DOMGAEL_KNIFE_DAMAGE;
                        switchedMode = true;
                    }
                    if (switchedMode) {
                        updatedEnemy.modeSwitchCooldownTimer = EnemyConstants.ENEMY_DOMGAEL_MODE_SWITCH_COOLDOWN;
                        updatedEnemy.attackCooldownTimer = updatedEnemy.attackCooldown * 0.5;
                    }
                }

                if (!updatedEnemy.isDashing && (updatedEnemy.attackCooldownTimer || 0) <= 0 && distToPlayerSquared < updatedEnemy.attackRangeSquared) {
                    if (updatedEnemy.attackMode === 'pistol') {
                        const angleToPlayer = Math.atan2(deltaPlayerY, deltaPlayerX);
                        newEnemyProjectiles.push({
                            id: `eproj_domgael_${Date.now()}_${Math.random()}`, x: enemyCenterX - ProjectileConstants.ENEMY_PROJECTILE_SIZE / 2, y: enemyCenterY - ProjectileConstants.ENEMY_PROJECTILE_SIZE / 2,
                            size: ProjectileConstants.ENEMY_PROJECTILE_SIZE, dx: Math.cos(angleToPlayer), dy: Math.sin(angleToPlayer), damage: updatedEnemy.damage,
                            traveledDistance: 0, maxRange: updatedEnemy.attackRangeSquared, projectileType: 'enemy_bullet',
                            hitEnemyIds: new Set(), penetrationLeft: 0, isEnemyProjectile: true,
                        });
                    } else {
                        playerDamageThisTick += updatedEnemy.damage;
                    }
                    updatedEnemy.attackCooldownTimer = updatedEnemy.attackCooldown;
                }
                else if (!updatedEnemy.isDashing) {
                    let targetX = playerCenterX;
                    let targetY = playerCenterY;
                    let currentSpeed = updatedEnemy.speed;

                    if (updatedEnemy.attackMode === 'pistol') {
                        const idealDist = Math.sqrt(updatedEnemy.attackRangeSquared) * 0.7;
                        if (distToPlayer < idealDist * 0.8) {
                            targetX = enemyCenterX - deltaPlayerX; targetY = enemyCenterY - deltaPlayerY;
                        } else if (distToPlayer < idealDist * 0.5) {
                            currentSpeed *= 1.5;
                            targetX = enemyCenterX - deltaPlayerX; targetY = enemyCenterY - deltaPlayerY;
                        }
                    }
                    const moveDx = targetX - enemyCenterX;
                    const moveDy = targetY - enemyCenterY;
                    const moveDist = Math.sqrt(moveDx*moveDx + moveDy*moveDy);
                    if (moveDist > (updatedEnemy.attackMode === 'knife' ? 5 : Math.sqrt(updatedEnemy.attackRangeSquared) * 0.1) ) {
                         if (moveDist > 0) {
                            updatedEnemy.x += (moveDx / moveDist) * currentSpeed;
                            updatedEnemy.y += (moveDy / moveDist) * currentSpeed;
                        }
                    }
                }
            }
        }
        else if (updatedEnemy.type === 'Boss_BigDoyle') {
                updatedEnemy.attackCooldownTimer = Math.max(0, (updatedEnemy.attackCooldownTimer || 0) - ENEMY_MOVE_INTERVAL);
                updatedEnemy.barrelThrowCooldownTimer = Math.max(0, (updatedEnemy.barrelThrowCooldownTimer || 0) - ENEMY_MOVE_INTERVAL);

                if ((updatedEnemy.barrelThrowCooldownTimer || 0) <= 0 && distToPlayerSquared < EnemyConstants.ENEMY_BIGDOYLE_BARREL_THROW_RANGE_SQUARED) {
                    const barrelTargetX = playerCenterX;
                    const barrelTargetY = playerCenterY;
                    const angleToTarget = Math.atan2(barrelTargetY - enemyCenterY, barrelTargetX - enemyCenterX);

                    newEnemyProjectiles.push({
                        id: `eproj_barrel_${Date.now()}_${Math.random()}`, x: enemyCenterX - ProjectileConstants.BARREL_PROJECTILE_SIZE / 2,
                        y: enemyCenterY - ProjectileConstants.BARREL_PROJECTILE_SIZE / 2, size: ProjectileConstants.BARREL_PROJECTILE_SIZE,
                        dx: Math.cos(angleToTarget), dy: Math.sin(angleToTarget), damage: EnemyConstants.ENEMY_BIGDOYLE_BARREL_DAMAGE,
                        traveledDistance: 0, maxRange: ProjectileConstants.BARREL_MAX_TRAVEL_DISTANCE, projectileType: 'barrel_explosive',
                        isBarrelOrDynamite: true, hasLanded: false, fuseTimer: ProjectileConstants.BARREL_FUSE_TIME,
                        targetX_special: barrelTargetX, targetY_special: barrelTargetY, explosionRadiusSquared: ProjectileConstants.BARREL_EXPLOSION_RADIUS_SQUARED,
                        hitEnemyIds: new Set(), penetrationLeft: 0, isEnemyProjectile: true,
                    });
                    updatedEnemy.barrelThrowCooldownTimer = EnemyConstants.ENEMY_BIGDOYLE_BARREL_THROW_COOLDOWN + (Math.random() * 1000 - 500);
                }
                else if ((updatedEnemy.attackCooldownTimer || 0) <= 0 && distToPlayerSquared < updatedEnemy.attackRangeSquared) {
                    playerDamageThisTick += updatedEnemy.damage;
                    updatedEnemy.attackCooldownTimer = updatedEnemy.attackCooldown;
                }

                if (distToPlayerSquared > (updatedEnemy.width / 2 + player.width / 2 + 5)**2) {
                    if (distToPlayer > 0) {
                        updatedEnemy.x += (deltaPlayerX / distToPlayer) * updatedEnemy.speed;
                        updatedEnemy.y += (deltaPlayerY / distToPlayer) * updatedEnemy.speed;
                    }
                }
        }
        else if (updatedEnemy.type === 'Boss_CaptainMcGraw') {
                updatedEnemy.attackCooldownTimer = Math.max(0, (updatedEnemy.attackCooldownTimer || 0) - ENEMY_MOVE_INTERVAL);
                updatedEnemy.droneSpawnCooldownTimer = Math.max(0, (updatedEnemy.droneSpawnCooldownTimer || 0) - ENEMY_MOVE_INTERVAL);

                if (updatedEnemy.isAiming) {
                    updatedEnemy.aimingTimer! -= ENEMY_MOVE_INTERVAL;
                    newLaserSights.push({ id: updatedEnemy.id, x1: enemyCenterX, y1: enemyCenterY, x2: playerCenterX, y2: playerCenterY });
                    if (updatedEnemy.aimingTimer! <= 0) {
                        const angleToPlayer = Math.atan2(playerCenterY - enemyCenterY, playerCenterX - enemyCenterX);
                        newEnemyProjectiles.push({
                            id: `eproj_captmcgraw_${Date.now()}_${Math.random()}`, x: enemyCenterX - ProjectileConstants.ENEMY_PROJECTILE_SIZE / 2, y: enemyCenterY - ProjectileConstants.ENEMY_PROJECTILE_SIZE / 2,
                            size: ProjectileConstants.ENEMY_PROJECTILE_SIZE, dx: Math.cos(angleToPlayer), dy: Math.sin(angleToPlayer), damage: updatedEnemy.damage,
                            traveledDistance: 0, maxRange: updatedEnemy.attackRangeSquared, projectileType: 'enemy_bullet',
                            hitEnemyIds: new Set(), penetrationLeft: 0, isEnemyProjectile: true,
                        });
                        updatedEnemy.isAiming = false;
                        updatedEnemy.attackCooldownTimer = EnemyConstants.ENEMY_CAPTAINMCGRAW_RIFLE_ATTACK_COOLDOWN;
                    }
                } else {
                    const currentDrones = enemies.filter(e => e.type === 'PatrolDrone').length;
                    if ((updatedEnemy.droneSpawnCooldownTimer || 0) <= 0 && currentDrones < EnemyConstants.ENEMY_CAPTAINMCGRAW_MAX_ACTIVE_DRONES) {
                        const drone = createEnemyInstance('PatrolDrone', 10, player);
                        if (drone) {
                            drone.x = updatedEnemy.x + (Math.random() * updatedEnemy.width - updatedEnemy.width / 2);
                            drone.y = updatedEnemy.y + (Math.random() * updatedEnemy.height - updatedEnemy.height / 2);
                            // Should return this drone to be added
                        }
                        updatedEnemy.droneSpawnCooldownTimer = EnemyConstants.ENEMY_CAPTAINMCGRAW_DRONE_SPAWN_COOLDOWN;
                    }
                    else if ((updatedEnemy.attackCooldownTimer || 0) <= 0 && distToPlayerSquared < updatedEnemy.attackRangeSquared) {
                        updatedEnemy.isAiming = true;
                        updatedEnemy.aimingTimer = EnemyConstants.ENEMY_CAPTAINMCGRAW_RIFLE_TELEGRAPH_DURATION;
                        newLaserSights.push({ id: updatedEnemy.id, x1: enemyCenterX, y1: enemyCenterY, x2: playerCenterX, y2: playerCenterY });
                    }
                }
                const idealDistSq = updatedEnemy.attackRangeSquared * 0.8;
                if (distToPlayerSquared < idealDistSq * 0.7) {
                    if (distToPlayer > 0) {
                        updatedEnemy.x -= (deltaPlayerX / distToPlayer) * updatedEnemy.speed;
                        updatedEnemy.y -= (deltaPlayerY / distToPlayer) * updatedEnemy.speed;
                    }
                } else if (distToPlayerSquared > idealDistSq * 1.3 && !updatedEnemy.isAiming) {
                     if (distToPlayer > 0) {
                        updatedEnemy.x += (deltaPlayerX / distToPlayer) * updatedEnemy.speed * 0.5;
                        updatedEnemy.y += (deltaPlayerY / distToPlayer) * updatedEnemy.speed * 0.5;
                    }
                }
        }
        // --- REGULAR ENEMY LOGIC ---
        else if (updatedEnemy.type === 'AtiradorDeEliteMcGraw') {
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
