
import type { FissureTrapData, Player } from '../types';
import { ENEMY_MOVE_INTERVAL } from '../constants/game';
import { FISSURE_PLAYER_DAMAGE_COOLDOWN, FISSURE_TRAP_DAMAGE } from '../constants/enemies';

export const updateFissureTraps = (now: number, currentTraps: FissureTrapData[], player: Player) => {
    const updatedTraps: FissureTrapData[] = [];
    let playerDamage = 0;

    for (const trap of currentTraps) {
        const newRemainingDuration = trap.remainingDuration - ENEMY_MOVE_INTERVAL;
        if (newRemainingDuration <= 0) continue;

        let updatedTrap = { ...trap, remainingDuration: newRemainingDuration };

        const playerLeft = player.x;
        const playerRight = player.x + player.width;
        const playerTop = player.y;
        const playerBottom = player.y + player.height;

        const trapLeft = trap.x;
        const trapRight = trap.x + trap.width;
        const trapTop = trap.y;
        const trapBottom = trap.y + trap.height;

        const isColliding = playerLeft < trapRight && playerRight > trapLeft &&
                            playerTop < trapBottom && playerBottom > trapTop;

        if (isColliding && now - (trap.lastDamageTickPlayer || 0) > FISSURE_PLAYER_DAMAGE_COOLDOWN) {
            playerDamage += FISSURE_TRAP_DAMAGE;
            updatedTrap.lastDamageTickPlayer = now;
        }
        updatedTraps.push(updatedTrap);
    }
    return { updatedTraps, playerDamage };
};
