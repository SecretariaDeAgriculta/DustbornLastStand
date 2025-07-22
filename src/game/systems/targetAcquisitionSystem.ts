
import type { Player, Enemy } from '../types';

const TARGET_UPDATE_INTERVAL = 200; // ms

export const acquireTarget = (
    now: number,
    lastTargetUpdate: number,
    player: Player,
    enemies: Enemy[]
): Enemy | null | undefined => {

    if (now - lastTargetUpdate < TARGET_UPDATE_INTERVAL) {
        return undefined; // Indicate no update needed
    }

    if (enemies.length === 0) {
        return null;
    }

    let closest: Enemy | null = null;
    let minDistanceSquared = Infinity;
    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;

    for (const enemy of enemies) {
        if (enemy.health <= 0 || enemy.isDetonating || enemy.isAiming) continue;
        
        const enemyCenterX = enemy.x + enemy.width / 2;
        const enemyCenterY = enemy.y + enemy.height / 2;
        const distSq = (playerCenterX - enemyCenterX) ** 2 + (playerCenterY - enemyCenterY) ** 2;

        if (distSq < minDistanceSquared) {
            minDistanceSquared = distSq;
            closest = enemy;
        }
    }
    
    return closest;
};

    