
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DustbornGame } from '@/components/game/DustbornGame';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  const [gameMode, setGameMode] = useState<'menu' | 'freeMode'>('menu');

  if (gameMode === 'freeMode') {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 selection:bg-primary selection:text-primary-foreground">
        <main className="w-full max-w-screen-lg flex-grow flex flex-col items-center justify-center">
          <DustbornGame onExitToMenu={() => setGameMode('menu')} />
        </main>
        <footer className="w-full max-w-screen-lg text-center py-4 mt-4 text-muted-foreground text-xs">
          <p>&copy; {new Date().getFullYear()} Dustborn: Last Stand. Construído no Firebase Studio.</p>
        </footer>
      </div>
    );
  }

  // Menu Mode
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 selection:bg-primary selection:text-primary-foreground">
      <div className="z-10 flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-primary mb-4" style={{ fontFamily: "'PT Sans', sans-serif" }}>
          Dustborn: <span className="text-accent">Last Stand</span>
        </h1>
        <p className="text-md sm:text-lg text-muted-foreground mb-10 sm:mb-12 max-w-md">
          No coração poeirento do velho oeste, cada dia é uma luta pela sobrevivência. Enfrente hordas e prove seu valor.
        </p>

        <Card className="w-full max-w-xs sm:max-w-sm bg-card/80 backdrop-blur-sm shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-xl sm:text-2xl text-primary-foreground">Escolha o Modo de Jogo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <Button
              variant="secondary"
              className="w-full py-2 sm:py-3 text-md sm:text-lg relative"
              disabled
              aria-disabled="true"
            >
              Modo História
              <span className="absolute top-1 right-1 sm:top-1.5 sm:right-2 text-xs bg-muted text-muted-foreground px-1.5 sm:px-2 py-0.5 rounded-full">Em Breve</span>
            </Button>
            <Button
              variant="default"
              className="w-full py-2 sm:py-3 text-md sm:text-lg bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={() => setGameMode('freeMode')}
            >
              Modo Livre
            </Button>
          </CardContent>
        </Card>
      </div>

      <footer className="absolute bottom-0 w-full text-center py-3 sm:py-4 text-muted-foreground/80 text-xs z-10">
        <p>&copy; {new Date().getFullYear()} Dustborn: Last Stand. Construído no Firebase Studio.</p>
      </footer>
    </div>
  );
}
