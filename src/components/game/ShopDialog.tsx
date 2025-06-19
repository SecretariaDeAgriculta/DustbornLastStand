
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Weapon } from '@/config/weapons';
import { HelpCircle } from 'lucide-react';
import { PlayerInventoryDisplay } from './PlayerInventoryDisplay';

interface ShopDialogProps {
  onStartNextWave: () => void;
  wave: number;
  score: number;
  playerMoney: number; // Changed from playerXP
  shopOfferings: Weapon[];
  playerWeapons: Weapon[];
  onBuyWeapon: (weapon: Weapon) => void;
  onRecycleWeapon: (weaponId: string) => void;
  canAfford: (cost: number) => boolean;
  inventoryFull: boolean;
}

export function ShopDialog({
  onStartNextWave,
  wave,
  score,
  playerMoney, // Changed from playerXP
  shopOfferings,
  playerWeapons,
  onBuyWeapon,
  onRecycleWeapon,
  canAfford,
  inventoryFull
}: ShopDialogProps) {

  const getRarityColor = (rarity: Weapon['rarity']) => {
    switch (rarity) {
      case 'Comum': return 'text-gray-400';
      case 'Raro': return 'text-blue-400';
      case 'Lendária': return 'text-purple-400';
      default: return 'text-gray-200';
    }
  };

  const getCadenceText = (cooldown: number): string => {
    if (cooldown <= 300) return "Muito Alta";
    if (cooldown <= 600) return "Alta";
    if (cooldown <= 1000) return "Média";
    return "Lenta";
  };

  const getRangeText = (range: number): string => {
    if (range <= 150) return "Curto";
    if (range <= 400) return "Médio";
    if (range <= 600) return "Longo";
    return "Muito Longo";
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-2 sm:p-4 z-50">
      <Card className="w-full max-w-4xl shadow-2xl flex flex-col" style={{maxHeight: '95vh'}}>
        <CardHeader className="flex-shrink-0 p-3 sm:p-4">
          <CardTitle className="text-xl sm:text-2xl text-center text-primary">Onda {wave} Concluída!</CardTitle>
          <CardDescription className="text-center text-xs sm:text-sm">
            Prepare-se para a próxima horda. Gaste seu dinheiro com sabedoria!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-4 flex-grow overflow-hidden p-2 sm:p-4">
          <div className="text-center mb-1 sm:mb-2">
            <p className="text-sm sm:text-md">Pontuação: <span className="font-bold text-primary">{score}</span></p>
            <p className="text-sm sm:text-md">Dinheiro: <span className="font-bold text-yellow-400">${playerMoney}</span></p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4 h-full">
            <PlayerInventoryDisplay
              weapons={playerWeapons}
              onRecycleWeapon={onRecycleWeapon}
              canRecycle={true}
              className="md:col-span-1"
            />

            <div className="space-y-1 flex flex-col h-full md:col-span-2 min-h-0">
              <h3 className="text-md sm:text-lg font-semibold text-center text-accent mb-1 flex-shrink-0">Loja de Armas</h3>
              <ScrollArea className="flex-grow rounded-md border p-1 bg-muted/30">
                {shopOfferings.length === 0 && <p className="text-center text-muted-foreground p-4">Nenhuma arma nova disponível nesta rodada.</p>}
                <div className="space-y-1">
                {shopOfferings.map((weapon) => {
                  const IconComponent = weapon.icon || HelpCircle;
                  const isOwned = playerWeapons.some(pw => pw.id === weapon.id);
                  const affordable = canAfford(weapon.moneyCost); // Changed from weapon.xpCost
                  const actionText = isOwned ? "Aprimorar" : "Comprar";

                  const isDisabled = weapon.upgradedThisRound || !affordable || (inventoryFull && !isOwned);

                  let titleText = `${actionText} ${weapon.name}`;
                  if (weapon.upgradedThisRound) titleText = "Já interagido nesta rodada";
                  else if (!affordable) titleText = "Dinheiro insuficiente";
                  else if (inventoryFull && !isOwned) titleText = "Inventário cheio (Máx 5)";

                  return (
                    <Card key={weapon.id} className="p-1 bg-card/80 hover:bg-card transition-colors">
                      <div className="flex items-start space-x-1">
                        <IconComponent className={`h-5 w-5 mt-0.5 flex-shrink-0 ${getRarityColor(weapon.rarity)}`} />
                        <div className="flex-grow">
                          <h4 className={`text-xs font-semibold ${getRarityColor(weapon.rarity)}`}>{weapon.name} {isOwned && !weapon.upgradedThisRound && !isDisabled ? "(Aprimorar)" : ""}</h4>
                          <p className="text-xs text-muted-foreground -mt-0.5">Raridade: <span className={getRarityColor(weapon.rarity)}>{weapon.rarity}</span></p>
                          <p className="text-xs -mt-0.5">
                            Dano: {weapon.damage} {weapon.projectilesPerShot && weapon.projectilesPerShot > 1 ? `x ${weapon.projectilesPerShot}` : ''}
                          </p>
                          <p className="text-xs -mt-0.5">Cad: {getCadenceText(weapon.cooldown)} | Alc: {getRangeText(weapon.range)}</p>
                          <p className="text-xs -mt-0.5">Custo: <span className="font-semibold text-yellow-400">${weapon.moneyCost}</span></p>
                          <p className="text-xs mt-0 italic text-accent-foreground/70">{weapon.effectDescription}</p>
                        </div>
                        <Button
                          size="sm"
                          variant={isDisabled ? "outline" : "default"}
                          className="self-center px-1.5 py-0.5 text-xs h-auto"
                          onClick={() => onBuyWeapon(weapon)}
                          disabled={isDisabled}
                          title={titleText}
                        >
                          {actionText}
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
        <CardFooter className="flex justify-center flex-shrink-0 mt-1 sm:mt-2 p-2 sm:p-4">
           <Button
            onClick={onStartNextWave}
            className="w-full md:w-1/2 text-sm sm:text-md py-2 sm:py-3 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Começar Onda {wave + 1}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
