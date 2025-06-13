
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Weapon } from '@/config/weapons'; 
import { HelpCircle } from 'lucide-react'; // Default icon

interface ShopDialogProps {
  onStartNextWave: () => void;
  wave: number;
  score: number;
  playerXP: number;
  availableWeapons: Weapon[];
}

export function ShopDialog({ onStartNextWave, wave, score, playerXP, availableWeapons }: ShopDialogProps) {
  
  const getRarityColor = (rarity: Weapon['rarity']) => {
    switch (rarity) {
      case 'Comum':
        return 'text-gray-400';
      case 'Incomum':
        return 'text-green-400';
      case 'Raro':
        return 'text-blue-400';
      default:
        return 'text-gray-200';
    }
  };

  const getCadenceText = (cooldown: number): string => {
    if (cooldown <= 500) return "Alta";
    if (cooldown <= 800) return "Média";
    return "Lenta";
  };

  const getRangeText = (range: number): string => {
    if (range <= 150) return "Curto";
    if (range <= 300) return "Médio";
    return "Longo";
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl shadow-2xl flex flex-col" style={{maxHeight: '90vh'}}>
        <CardHeader className="flex-shrink-0">
          <CardTitle className="text-3xl text-center text-primary">Wave {wave} Cleared!</CardTitle>
          <CardDescription className="text-center">
            Prepare for the next onslaught. Spend your XP wisely!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 flex-grow overflow-hidden">
          <div className="text-center mb-6">
            <p className="text-lg">Current Score: <span className="font-bold text-primary">{score}</span></p>
            <p className="text-lg">Available XP: <span className="font-bold text-yellow-400">{playerXP}</span></p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-center text-accent mb-2">Attribute Upgrades</h3>
              <Button className="w-full text-lg py-6" disabled>
                Upgrade Attributes (Coming Soon)
              </Button>
            </div>
            
            <div className="space-y-2 flex flex-col h-full">
              <h3 className="text-xl font-semibold text-center text-accent mb-2 flex-shrink-0">Weapon Shop</h3>
              <ScrollArea className="flex-grow rounded-md border p-2 bg-muted/30">
                {availableWeapons.length === 0 && <p className="text-center text-muted-foreground p-4">No weapons available in this tier.</p>}
                <div className="space-y-3">
                {availableWeapons.map((weapon) => {
                  const IconComponent = weapon.icon || HelpCircle;
                  return (
                    <Card key={weapon.id} className="p-3 bg-card/80 hover:bg-card transition-colors">
                      <div className="flex items-start space-x-3">
                        <IconComponent className={`h-8 w-8 mt-1 flex-shrink-0 ${getRarityColor(weapon.rarity)}`} />
                        <div className="flex-grow">
                          <h4 className={`text-lg font-semibold ${getRarityColor(weapon.rarity)}`}>{weapon.name}</h4>
                          <p className="text-xs text-muted-foreground mb-1">Raridade: <span className={getRarityColor(weapon.rarity)}>{weapon.rarity}</span></p>
                          <p className="text-sm">
                            Dano: {weapon.damage} {weapon.projectilesPerShot && weapon.projectilesPerShot > 1 ? `x ${weapon.projectilesPerShot}` : ''}
                          </p>
                          <p className="text-sm">Cadência: {getCadenceText(weapon.cooldown)}</p>
                          <p className="text-sm">Alcance: {getRangeText(weapon.range)}</p>
                          <p className="text-sm">Efeito: <span className="italic text-accent-foreground/80">{weapon.effectDescription}</span></p>
                        </div>
                        <Button size="sm" variant="outline" className="self-center" disabled>
                          Buy (TODO)
                        </Button>
                      </div>
                    </Card>
                  );
                })}
                </div>
              </ScrollArea>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center flex-shrink-0 mt-4">
           <Button 
            onClick={onStartNextWave} 
            className="w-full md:w-1/2 text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Start Wave {wave + 1}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
