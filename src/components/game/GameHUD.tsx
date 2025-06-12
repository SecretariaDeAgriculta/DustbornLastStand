
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Shield, TrendingUp, Coins } from 'lucide-react'; // Zap for score/power, Shield for health, TrendingUp for wave

interface GameHUDProps {
  score: number;
  wave: number;
  playerHealth: number; // Assuming health is 0-100
}

export function GameHUD({ score, wave, playerHealth }: GameHUDProps) {
  return (
    <Card className="w-full max-w-md shadow-lg mb-4">
      <CardContent className="p-4 flex justify-around items-center text-center">
        <div className="flex flex-col items-center">
          <div className="flex items-center text-lg font-semibold text-primary">
            <Zap className="w-5 h-5 mr-1" />
            <span>Score</span>
          </div>
          <p className="text-2xl font-bold">{score}</p>
        </div>
        <div className="flex flex-col items-center">
           <div className="flex items-center text-lg font-semibold text-accent">
            <TrendingUp className="w-5 h-5 mr-1" />
            <span>Wave</span>
          </div>
          <p className="text-2xl font-bold">{wave}</p>
        </div>
         <div className="flex flex-col items-center">
           <div className="flex items-center text-lg font-semibold text-green-500">
            <Shield className="w-5 h-5 mr-1" />
            <span>Health</span>
          </div>
          <p className="text-2xl font-bold">{playerHealth}%</p>
        </div>
      </CardContent>
    </Card>
  );
}
