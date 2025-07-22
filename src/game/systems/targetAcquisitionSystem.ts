
import type { Player, Enemy } from '../types';
import { quadtree as d3Quadtree } from 'd3-quadtree';

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

    const validEnemies = enemies.filter(enemy => enemy.health > 0 && !enemy.isDetonating && !enemy.isAiming);
    
    if (validEnemies.length === 0) {
        return null;
    }

    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;

    const quadtree = d3Quadtree<Enemy>()
        .x(e => e.x + e.width / 2)
        .y(e => e.y + e.height / 2)
        .addAll(validEnemies);

    const closest = quadtree.find(playerCenterX, playerCenterY);
    
    return closest || null;
};
