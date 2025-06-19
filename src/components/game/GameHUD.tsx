
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Shield, TrendingUp, Coins, Clock } from 'lucide-react'; // Changed Star to Coins

interface GameHUDProps {
  score: number;
  wave: number;
  playerHealth: number;
  waveTimer: number;
  playerMoney: number; // Changed from playerXP
}

export function GameHUD({ score, wave, playerHealth, waveTimer, playerMoney }: GameHUDProps) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <Card className="w-full max-w-2xl shadow-lg mb-4">
      <CardContent className="p-4 grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
        <div className="flex flex-col items-center">
          <div className="flex items-center text-md font-semibold text-primary">
            <Zap className="w-4 h-4 mr-1" />
            <span>Pontos</span>
          </div>
          <p className="text-xl font-bold">{score}</p>
        </div>
        <div className="flex flex-col items-center">
           <div className="flex items-center text-md font-semibold text-accent">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>Onda</span>
          </div>
          <p className="text-xl font-bold">{wave}</p>
        </div>
         <div className="flex flex-col items-center">
           <div className="flex items-center text-md font-semibold text-green-500">
            <Shield className="w-4 h-4 mr-1" />
            <span>Vida</span>
          </div>
          <p className="text-xl font-bold">{Math.round(playerHealth)}%</p>
        </div>
        <div className="flex flex-col items-center">
           <div className="flex items-center text-md font-semibold text-blue-400">
            <Clock className="w-4 h-4 mr-1" />
            <span>Tempo</span>
          </div>
          <p className="text-xl font-bold">{formatTime(waveTimer)}</p>
        </div>
        <div className="flex flex-col items-center">
           <div className="flex items-center text-md font-semibold text-yellow-400">
            <Coins className="w-4 h-4 mr-1" /> 
            <span>Dinheiro</span>
          </div>
          <p className="text-xl font-bold">${playerMoney}</p>
        </div>
      </CardContent>
    </Card>
  );
}
