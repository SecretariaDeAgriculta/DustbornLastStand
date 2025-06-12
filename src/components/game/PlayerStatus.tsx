import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Star, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function PlayerStatus() {
  // Placeholder data
  const playerHealth = 80;
  const playerMaxHealth = 100;
  const playerXP = 150;
  const xpToNextLevel = 300;
  const playerLevel = 5;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center justify-between">
          <span>Your Status</span>
          <span className="text-lg text-primary">Level: {playerLevel}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center text-sm">
              <Heart className="w-4 h-4 mr-2 text-red-500" />
              <span>Health</span>
            </div>
            <span className="text-sm">{playerHealth} / {playerMaxHealth}</span>
          </div>
          <Progress value={(playerHealth / playerMaxHealth) * 100} className="h-3" />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center text-sm">
              <Star className="w-4 h-4 mr-2 text-yellow-400" />
              <span>Experience</span>
            </div>
            <span className="text-sm">{playerXP} / {xpToNextLevel}</span>
          </div>
          <Progress value={(playerXP / xpToNextLevel) * 100} className="h-3" />
        </div>
        <div className="text-sm text-muted-foreground">
          <TrendingUp className="w-4 h-4 mr-2 inline-block text-green-500" />
          <span>Wave: 3</span> {/* Placeholder */}
        </div>
      </CardContent>
    </Card>
  );
}
