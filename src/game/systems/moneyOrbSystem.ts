
'use client';

import type { MoneyOrbData, Player } from '../types';
import { MONEY_COLLECTION_RADIUS_SQUARED } from '../constants/game';

export const updateMoneyOrbs = (player: Player, moneyOrbs: MoneyOrbData[]) => {
    
    if (!moneyOrbs || moneyOrbs.length === 0) {
        return { remainingOrbs: [], collectedValue: 0 };
    }

    const collectedOrbValues: number[] = [];
    const remainingOrbs = moneyOrbs.filter((orb) => {
      const distX = (player.x + player.width / 2) - (orb.x + orb.size / 2);
      const distY = (player.y + player.height / 2) - (orb.y + orb.size / 2);
      if (distX * distX + distY * distY < MONEY_COLLECTION_RADIUS_SQUARED) {
        collectedOrbValues.push(orb.value);
        return false;
      }
      return true;
    });
    
    const collectedValue = collectedOrbValues.reduce((s, v) => s + v, 0);

    return { remainingOrbs, collectedValue };
};
