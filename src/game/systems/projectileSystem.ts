
import type { ProjectileData, Enemy, FirePatchData } from '../types';
import type { Weapon } from '@/config/weapons';
import { GAME_WIDTH, GAME_HEIGHT, FIRE_PATCH_DURATION, FIRE_PATCH_RADIUS, FIRE_PATCH_DAMAGE_PER_TICK, FIRE_PATCH_TICK_INTERVAL } from '../constants/game';
import { PLAYER_KNIFE_PROJECTILE_SPEED_MULTIPLIER, PLAYER_REGULAR_PROJECTILE_SPEED, BARREL_MAX_TRAVEL_DISTANCE, BARREL_FUSE_TIME, BARREL_PROJECTILE_SPEED, DYNAMITE_MAX_TRAVEL_DISTANCE, DYNAMITE_FUSE_TIME, DYNAMITE_PROJECTILE_SPEED } from '../constants/projectiles';


export const updateProjectiles = (
    playerProjectiles: ProjectileData[],
    enemyProjectiles: ProjectileData[],
    enemies: Enemy[],
    playerWeapons: Weapon[]
) => {
    const damageToEnemies = new Map<string, { damage: number, originWeaponId?: string }>();
    const newPlayerProjectilesList: ProjectileData[] = [];
    const firePatchesToCreate: Omit<FirePatchData, 'id' | 'maxDuration'>[] = [];
    let playerDamage = 0;

    // --- Player Projectiles ---
    playerProjectiles.forEach(proj => {
        const speed = proj.projectileType === 'knife' ? PLAYER_REGULAR_PROJECTILE_SPEED * PLAYER_KNIFE_PROJECTILE_SPEED_MULTIPLIER : PLAYER_REGULAR_PROJECTILE_SPEED;
        let currentProj = { ...proj };
        currentProj.x += currentProj.dx * speed;
        currentProj.y += currentProj.dy * speed;
        currentProj.traveledDistance += speed;

        let projectileShouldBeRemoved = false;
        const weaponDef = playerWeapons.find(w => w.id === proj.originWeaponId);

        if (currentProj.x < -(currentProj.width || currentProj.size) || currentProj.x > GAME_WIDTH ||
            currentProj.y < -(currentProj.height || currentProj.size) || currentProj.y > GAME_HEIGHT ||
            currentProj.traveledDistance >= currentProj.maxRange) {
            projectileShouldBeRemoved = true;
            if (weaponDef?.createsFirePatch) {
                firePatchesToCreate.push({
                    x: currentProj.x, y: currentProj.y, radius: FIRE_PATCH_RADIUS,
                    remainingDuration: FIRE_PATCH_DURATION, damagePerTick: FIRE_PATCH_DAMAGE_PER_TICK,
                    tickInterval: FIRE_PATCH_TICK_INTERVAL, lastDamageTickToEnemies: {}
                });
            }
        }

        if (!projectileShouldBeRemoved) {
            for (const enemy of enemies) {
                if (enemy.health <= 0 || (currentProj.hitEnemyIds.has(enemy.id) && currentProj.originWeaponId !== 'justica_ferro')) {
                    continue;
                }
                const projWidth = currentProj.width || currentProj.size;
                const projHeight = currentProj.height || currentProj.size;
                const projCenterX = currentProj.x + projWidth / 2;
                const projCenterY = currentProj.y + projHeight / 2;
                const enemyCenterX = enemy.x + enemy.width / 2;
                const enemyCenterY = enemy.y + enemy.height / 2;

                if (Math.abs(projCenterX - enemyCenterX) < (projWidth / 2 + enemy.width / 2) &&
                    Math.abs(projCenterY - enemyCenterY) < (projHeight / 2 + enemy.height / 2)) {

                    const existingDamageEntry = damageToEnemies.get(enemy.id) || { damage: 0, originWeaponId: currentProj.originWeaponId };
                    damageToEnemies.set(enemy.id, {
                        damage: existingDamageEntry.damage + currentProj.damage,
                        originWeaponId: currentProj.originWeaponId
                    });

                    if (weaponDef?.createsFirePatch) {
                        firePatchesToCreate.push({
                            x: currentProj.x, y: currentProj.y, radius: FIRE_PATCH_RADIUS,
                            remainingDuration: FIRE_PATCH_DURATION, damagePerTick: FIRE_PATCH_DAMAGE_PER_TICK,
                            tickInterval: FIRE_PATCH_TICK_INTERVAL, lastDamageTickToEnemies: {}
                        });
                        projectileShouldBeRemoved = true; // Molotov explodes on first hit
                        break;
                    }

                    currentProj.hitEnemyIds.add(enemy.id);

                    if (currentProj.penetrationLeft > 0) {
                        currentProj.penetrationLeft--;
                    } else {
                        projectileShouldBeRemoved = true;
                        break;
                    }
                }
            }
        }
        if (!projectileShouldBeRemoved) {
            newPlayerProjectilesList.push(currentProj);
        }
    });

    // --- Enemy Projectiles ---
    const updatedEnemyProjectiles = enemyProjectiles.map(proj => {
        if (proj.isBarrelOrDynamite && proj.hasLanded) {
            return { ...proj, fuseTimer: (proj.fuseTimer || 0) - 50 }; // Assuming 50ms interval
        }
        let speed = PLAYER_REGULAR_PROJECTILE_SPEED;
        if (proj.projectileType === 'barrel_explosive') speed = BARREL_PROJECTILE_SPEED;
        else if (proj.projectileType === 'dynamite_explosive') speed = DYNAMITE_PROJECTILE_SPEED;

        const newX = proj.x + proj.dx * speed;
        const newY = proj.y + proj.dy * speed;
        let newTraveledDistance = proj.traveledDistance + speed;
        let landedThisTick = false;

        if (proj.isBarrelOrDynamite && !proj.hasLanded) {
            if (proj.projectileType === 'barrel_explosive' && (newTraveledDistance >= BARREL_MAX_TRAVEL_DISTANCE || ((newX - (proj.targetX_special || 0))**2 + (newY - (proj.targetY_special || 0))**2) < (speed*speed))) {
               landedThisTick = true;
            } else if (proj.projectileType === 'dynamite_explosive' && newTraveledDistance >= DYNAMITE_MAX_TRAVEL_DISTANCE) {
               landedThisTick = true;
            }
        }
        return {
            ...proj, x: newX, y: newY, traveledDistance: newTraveledDistance,
            hasLanded: proj.hasLanded || landedThisTick, dx: landedThisTick ? 0 : proj.dx, dy: landedThisTick ? 0 : proj.dy,
            fuseTimer: landedThisTick ? (proj.projectileType === 'barrel_explosive' ? BARREL_FUSE_TIME : DYNAMITE_FUSE_TIME) : (proj.fuseTimer || 0),
        };
    });

    const remainingEnemyProjectiles: ProjectileData[] = [];
    for (const proj of updatedEnemyProjectiles) {
        let projectileConsumed = false;

        // Simple collision check with player
        // A more robust check would consider player's actual shape and position
        const playerCenterX = 30 / 2 + 400; // Assuming player is at a fixed position for simplicity
        const playerCenterY = 30 / 2 + 300;
        const distToPlayerSq = (proj.x - playerCenterX)**2 + (proj.y - playerCenterY)**2;
        
        if(distToPlayerSq < (proj.size/2 + 30/2)**2){
            playerDamage += proj.damage;
            projectileConsumed = true;
        }

        if (proj.isBarrelOrDynamite && proj.hasLanded && (proj.fuseTimer || 0) <= 0) {
            // EXPLODE!
            const explosionRadiusSq = proj.explosionRadiusSquared || 0;
            const distToPlayerFromExplosionSq = (proj.x - playerCenterX)**2 + (proj.y - playerCenterY)**2;
            if (distToPlayerFromExplosionSq < explosionRadiusSq) {
                 playerDamage += proj.damage;
            }
            projectileConsumed = true;
        }


        // Filter out old or consumed projectiles
        if (!projectileConsumed && proj.x > -proj.size && proj.x < GAME_WIDTH && proj.y > -proj.size && proj.y < GAME_HEIGHT && proj.traveledDistance < proj.maxRange) {
            remainingEnemyProjectiles.push(proj);
        }
    }

    return {
        newPlayerProjectiles: newPlayerProjectilesList,
        newEnemyProjectiles: remainingEnemyProjectiles,
        damageToEnemies,
        firePatchesToCreate,
        playerDamage,
    };
};
