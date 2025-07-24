
import type { Player } from '../types';
import { PLAYER_SPEED } from '../constants/player';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/game';

export const updatePlayerMovement = (activeKeys: Set<string>, currentPlayer: Player): Partial<Player> => {
    
    let inputDx = 0, inputDy = 0;
    if (activeKeys.has('arrowup') || activeKeys.has('w')) inputDy -= 1;
    if (activeKeys.has('arrowdown') || activeKeys.has('s')) inputDy += 1;
    if (activeKeys.has('arrowleft') || activeKeys.has('a')) inputDx -= 1;
    if (activeKeys.has('arrowright') || activeKeys.has('d')) inputDx += 1;
  
    if (inputDx !== 0 || inputDy !== 0) {
      let moveX, moveY;
      if (inputDx !== 0 && inputDy !== 0) {
          const length = Math.sqrt(inputDx * inputDx + inputDy * inputDy);
          moveX = (inputDx / length) * PLAYER_SPEED;
          moveY = (inputDy / length) * PLAYER_SPEED;
      } else {
          moveX = inputDx * PLAYER_SPEED;
          moveY = inputDy * PLAYER_SPEED;
      }
      return {
        x: Math.max(0, Math.min(currentPlayer.x + moveX, GAME_WIDTH - currentPlayer.width)),
        y: Math.max(0, Math.min(currentPlayer.y + moveY, GAME_HEIGHT - currentPlayer.height)),
      };
    }
    return {};
};
