
import type { Player, Enemy } from '../types';
import { quadtree as d3Quadtree } from 'd3-quadtree';

let lastUpdateTime = 0;
const TARGET_UPDATE_INTERVAL = 200; // ms

export const acquireTarget = (
    player: Player,
    enemies: Enemy[]
): Enemy | null | undefined => { // Allow returning undefined to signify no update
    const now = performance.now();
    
    // Throttle the expensive target acquisition logic
    if (now - lastUpdateTime < TARGET_UPDATE_INTERVAL) {
        return undefined; // Indicate no change in target
    }
    lastUpdateTime = now;

    // Safety check to prevent crashes if enemies is undefined or null
    if (!enemies) {
        return null;
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

    // Find the closest enemy in the quadtree
    const closest = quadtree.find(playerCenterX, playerCenterY);
    
    return closest || null;
};
