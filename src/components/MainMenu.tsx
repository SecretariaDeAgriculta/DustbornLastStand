'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MainMenuProps {
  onPlay: () => void;
}

export function MainMenu({ onPlay }: MainMenuProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="z-10 flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-primary mb-4" style={{ fontFamily: "'PT Sans', sans-serif" }}>
          Dustborn: <span className="text-accent">Last Stand</span>
        </h1>
        <p className="text-md sm:text-lg text-muted-foreground mb-10 sm:mb-12 max-w-md">
          No coração poeirento do velho oeste, cada dia é uma luta pela sobrevivência. Enfrente hordas e prove seu valor.
        </p>

        <Card className="w-full max-w-xs sm:max-w-sm bg-card/80 backdrop-blur-sm shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-xl sm:text-2xl text-card-foreground">
              Menu Principal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <Button
              variant="default"
              className="w-full py-2 sm:py-3 text-md sm:text-lg bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={onPlay}
            >
              Jogar
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
