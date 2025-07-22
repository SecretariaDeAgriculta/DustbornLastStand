
import type { FirePatchData, Enemy } from '../types';
import { ENEMY_MOVE_INTERVAL } from '../constants/game';

export const updateFirePatches = (now: number, currentFirePatches: FirePatchData[], enemies: Enemy[]) => {
    const updatedPatches: FirePatchData[] = [];
    const damageToEnemies = new Map<string, { damage: number }>();

    for (const patch of currentFirePatches) {
        let newRemainingDuration = patch.remainingDuration - ENEMY_MOVE_INTERVAL;
        if (newRemainingDuration <= 0) continue;

        const updatedPatch = { ...patch, remainingDuration: newRemainingDuration, lastDamageTickToEnemies: { ...patch.lastDamageTickToEnemies} };

        for (const enemy of enemies) {
            if (enemy.health <= 0) continue;

            const distSq = (enemy.x + enemy.width / 2 - patch.x)**2 + (enemy.y + enemy.height / 2 - patch.y)**2;
            if (distSq < patch.radius**2) {
                const lastTick = updatedPatch.lastDamageTickToEnemies[enemy.id] || 0;
                if (now - lastTick >= patch.tickInterval) {
                    const existingDamage = damageToEnemies.get(enemy.id)?.damage || 0;
                    damageToEnemies.set(enemy.id, { damage: existingDamage + patch.damagePerTick });
                    updatedPatch.lastDamageTickToEnemies[enemy.id] = now;
                }
            }
        }
        updatedPatches.push(updatedPatch);
    }
    return { updatedPatches, damageToEnemies };
};
