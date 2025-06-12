
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

interface ShopDialogProps {
  onStartNextWave: () => void;
  wave: number;
  score: number;
  playerXP: number;
}

export function ShopDialog({ onStartNextWave, wave, score, playerXP }: ShopDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader>
          <CardTitle className="text-3xl text-center text-primary">Wave {wave} Cleared!</CardTitle>
          <CardDescription className="text-center">
            Prepare for the next onslaught. Spend your XP wisely!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-lg">Current Score: <span className="font-bold text-primary">{score}</span></p>
            <p className="text-lg">Available XP: <span className="font-bold text-yellow-400">{playerXP}</span></p>
          </div>
          
          <div className="space-y-4">
            <Button className="w-full text-lg py-6" disabled>
              Upgrade Attributes (Coming Soon)
            </Button>
            <Button className="w-full text-lg py-6" disabled>
              Buy Weapons (Coming Soon)
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
           <Button 
            onClick={onStartNextWave} 
            className="w-1/2 text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Start Wave {wave + 1}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

    