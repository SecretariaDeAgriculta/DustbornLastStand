
import type { ProjectileData, Player, Enemy } from '../types';
import type { Weapon } from '@/config/weapons';
import { PLAYER_PROJECTILE_BASE_SIZE } from '../constants/projectiles';
import { PLAYER_SIZE } from '../constants/player';

export const handleShooting = (
    now: number, 
    targetEnemy: Enemy | null, 
    player: Player, 
    playerWeapons: Weapon[], 
    lastPlayerShotTimestamp: Record<string, number>
) => {

    const newlySpawnedProjectiles: ProjectileData[] = [];
    const updatedTimestamps: Record<string, number> = { ...lastPlayerShotTimestamp };

    if (!targetEnemy || !playerWeapons || playerWeapons.length === 0) {
        return { newProjectiles: newlySpawnedProjectiles, updatedTimestamps };
    }
    
    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;
    const targetCenterX = targetEnemy.x + targetEnemy.width / 2;
    const targetCenterY = targetEnemy.y + targetEnemy.height / 2;
    const distSq = (playerCenterX - targetCenterX) ** 2 + (playerCenterY - targetCenterY) ** 2;


    playerWeapons.forEach(weapon => {
        const lastShotTime = updatedTimestamps[weapon.id] || 0;

        if (now - lastShotTime >= weapon.cooldown && distSq <= weapon.range ** 2) {
            
            const baseAngle = Math.atan2(targetCenterY - playerCenterY, targetCenterX - playerCenterX);
            
            let numProjectilesToFire = weapon.projectilesPerShot || 1;
            if (weapon.id === 'vibora_aco' && Math.random() < 0.25) {
                numProjectilesToFire = 2;
            }
            const spread = weapon.shotgunSpreadAngle ? weapon.shotgunSpreadAngle * (Math.PI / 180) : 0;

            for (let i = 0; i < numProjectilesToFire; i++) {
                let currentAngle = baseAngle;
                if (numProjectilesToFire > 1 && spread > 0) {
                    currentAngle += (i - (numProjectilesToFire - 1) / 2) * (spread / (numProjectilesToFire > 1 ? numProjectilesToFire - 1 : 1));
                }
                const projDx = Math.cos(currentAngle);
                const projDy = Math.sin(currentAngle);
                let damage = weapon.damage;
                let isCritical = false;
                if (weapon.criticalChance && Math.random() < weapon.criticalChance) {
                    damage = Math.round(damage * (weapon.criticalMultiplier || 1.5));
                    isCritical = true;
                }
                newlySpawnedProjectiles.push({
                    id: `proj_${now}_${Math.random()}_${i}`,
                    x: playerCenterX - (weapon.projectileType === 'knife' ? (PLAYER_SIZE * 0.5) / 2 : PLAYER_PROJECTILE_BASE_SIZE / 2) ,
                    y: playerCenterY - (weapon.projectileType === 'knife' ? (PLAYER_SIZE * 1.5) / 2 : PLAYER_PROJECTILE_BASE_SIZE / 2) ,
                    size: PLAYER_PROJECTILE_BASE_SIZE,
                    width: weapon.projectileType === 'knife' ? PLAYER_SIZE * 0.5 : undefined,
                    height: weapon.projectileType === 'knife' ? PLAYER_SIZE * 1.5 : undefined,
                    dx: projDx, dy: projDy, damage: damage, traveledDistance: 0, maxRange: weapon.range,
                    critical: isCritical, penetrationLeft: weapon.penetrationCount || 0,
                    hitEnemyIds: new Set<string>(), projectileType: weapon.projectileType,
                    originWeaponId: weapon.id, isEnemyProjectile: false,
                });
            }
            updatedTimestamps[weapon.id] = now;
        }
    });

    return { newProjectiles: newlySpawnedProjectiles, updatedTimestamps };
};
