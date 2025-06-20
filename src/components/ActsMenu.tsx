
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getUnlockedLevel } from '@/lib/progress'; // Corrected import path
import { Lock, Play } from 'lucide-react';

interface ActsMenuProps {
  onSelectAct: (act: number) => void;
  onBack: () => void;
}

export function ActsMenu({ onSelectAct, onBack }: ActsMenuProps) {
  const unlockedLevel = getUnlockedLevel();
  // Corresponds to index: 0 = Prologue, 1 = Act 1, etc.
  const acts = [
    { title: 'Prólogo', index: 0 },
    { title: 'Ato 1: O Silêncio dos Boyle', index: 1 },
    { title: 'Ato 2: O Sussurro dos Gaviões', index: 2 },
    { title: 'Ato 3: O Eco do Canyon', index: 3 },
    { title: 'Ato 4: O Fim da Linha', index: 4 },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
       <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-8" style={{ fontFamily: "'PT Sans', sans-serif" }}>
        Capítulos da História
      </h1>
      <Card className="w-full max-w-md sm:max-w-lg bg-card/80 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-2xl text-card-foreground">
            Selecione um Ato
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          {acts.map((act) => {
            const isLocked = act.index > unlockedLevel;
            return (
              <Button
                key={act.title}
                variant="secondary"
                className="w-full py-2 sm:py-3 text-md sm:text-lg relative justify-between"
                disabled={isLocked}
                onClick={() => onSelectAct(act.index)}
                aria-disabled={isLocked}
                title={isLocked ? `${act.title} (Bloqueado)` : `Jogar ${act.title}`}
              >
                <span>{act.title}</span>
                {isLocked ? <Lock className="h-5 w-5 text-muted-foreground" /> : <Play className="h-5 w-5 text-accent" />}
              </Button>
            );
          })}
          <Button
            variant="outline"
            className="w-full py-2 sm:py-3 text-md sm:text-lg mt-4"
            onClick={onBack}
          >
            Voltar ao Menu Principal
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
