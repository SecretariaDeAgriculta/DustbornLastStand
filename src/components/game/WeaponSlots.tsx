import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Zap } from 'lucide-react'; // Using Target as a generic weapon icon

const WeaponCard = ({ name, damage, speed, imageUrl, imageHint }: { name: string; damage: number; speed: string; imageUrl: string; imageHint: string }) => (
  <div className="border border-input p-3 rounded-md bg-card-foreground/5">
    <h4 className="font-headline text-lg text-primary mb-2">{name}</h4>
    <div className="flex items-center gap-3">
      <Image src={imageUrl} alt={name} width={64} height={64} className="rounded object-cover aspect-square bg-muted" data-ai-hint={imageHint}/>
      <div className="text-sm space-y-1">
        <p className="flex items-center"><Target className="w-4 h-4 mr-2 text-accent" /> Damage: {damage}</p>
        <p className="flex items-center"><Zap className="w-4 h-4 mr-2 text-accent" /> Speed: {speed}</p>
      </div>
    </div>
  </div>
);

export function WeaponSlots() {
  // Placeholder data for two weapons
  const weapon1 = {
    name: 'Ol\' Reliable Revolver',
    damage: 25,
    speed: 'Medium',
    imageUrl: 'https://placehold.co/128x128.png',
    imageHint: 'revolver pistol'
  };
  const weapon2 = {
    name: 'Dust Devil Shotgun',
    damage: 60,
    speed: 'Slow',
    imageUrl: 'https://placehold.co/128x128.png',
    imageHint: 'shotgun weapon'
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Armory</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <WeaponCard {...weapon1} />
        <WeaponCard {...weapon2} />
      </CardContent>
    </Card>
  );
}
