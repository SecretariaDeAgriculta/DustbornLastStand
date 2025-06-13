
'use client';

import React from 'react';
import type { Weapon } from '@/config/weapons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MinusCircle, HelpCircle } from 'lucide-react';

interface PlayerInventoryDisplayProps {
  weapons: Weapon[];
  onRecycleWeapon?: (weaponId: string) => void;
  canRecycle: boolean;
  className?: string;
}

export function PlayerInventoryDisplay({ weapons, onRecycleWeapon, canRecycle, className }: PlayerInventoryDisplayProps) {
  const getRarityColor = (rarity: Weapon['rarity']) => {
    switch (rarity) {
      case 'Comum': return 'text-gray-400';
      // case 'Incomum': return 'text-green-400'; // Not currently used
      case 'Raro': return 'text-blue-400';
      case 'Lendária': return 'text-purple-400'; // Color for Legendary
      default: return 'text-gray-200';
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="p-4">
        <CardTitle className="text-xl text-center text-primary">Seu Arsenal</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        {weapons.length === 0 && <p className="text-sm text-muted-foreground text-center">Nenhuma arma equipada.</p>}
        {weapons.map((weapon) => {
          const IconComponent = weapon.icon || HelpCircle;
          return (
            <div key={weapon.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
              <div className="flex items-center space-x-2">
                <IconComponent className={`h-6 w-6 ${getRarityColor(weapon.rarity)}`} />
                <div>
                  <p className={`font-semibold ${getRarityColor(weapon.rarity)}`}>{weapon.name}</p>
                  <p className="text-xs text-muted-foreground">Dano: {weapon.damage}{weapon.projectilesPerShot ? `x${weapon.projectilesPerShot}` : ''} | Cad: {weapon.cooldown}ms</p>
                </div>
              </div>
              {canRecycle && onRecycleWeapon && weapons.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-400"
                  onClick={() => onRecycleWeapon(weapon.id)}
                  aria-label={`Reciclar ${weapon.name}`}
                  title={`Reciclar ${weapon.name}`}
                >
                  <MinusCircle className="h-5 w-5" />
                </Button>
              )}
            </div>
          );
        })}
        {weapons.length > 0 && <p className="text-xs text-muted-foreground text-center pt-2">Slot de armas: {weapons.length}/5</p>}
      </CardContent>
    </Card>
  );
}
