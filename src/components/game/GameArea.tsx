import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function GameArea() {
  // Placeholder for current environment
  const currentEnvironment = "Desolate Gulch - Saloon Ruins";

  return (
    <Card className="shadow-lg h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">{currentEnvironment}</CardTitle>
        <CardDescription>Procedurally generated. Enemies will approach. Aiming is automatic.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center bg-black/20 rounded-b-md relative overflow-hidden">
        <Image 
          src="https://placehold.co/800x600.png" 
          alt="Game Area Placeholder" 
          layout="fill" 
          objectFit="cover"
          className="opacity-30"
          data-ai-hint="western desert"
        />
        <div className="z-10 text-center p-8 rounded-lg bg-background/80 shadow-xl">
          <h3 className="font-headline text-3xl text-primary mb-4">Wave In Progress...</h3>
          <p className="text-muted-foreground">Player and enemies would be rendered here.</p>
          <p className="mt-2 text-sm">Combat is automatic, targeting the nearest enemy.</p>
          <div className="mt-6">
             {/* Placeholder for player character */}
            <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-2 flex items-center justify-center text-primary-foreground font-bold text-2xl shadow-md" data-ai-hint="cowboy character">P</div>
            {/* Placeholder for enemies */}
            <div className="flex justify-center gap-4 mt-4">
              <div className="w-10 h-10 bg-destructive rounded-md flex items-center justify-center text-destructive-foreground font-bold shadow-sm" data-ai-hint="bandit enemy">E</div>
              <div className="w-10 h-10 bg-destructive rounded-md flex items-center justify-center text-destructive-foreground font-bold shadow-sm" data-ai-hint="mutant enemy">E</div>
              <div className="w-10 h-10 bg-destructive rounded-md flex items-center justify-center text-destructive-foreground font-bold shadow-sm" data-ai-hint="creature enemy">E</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
