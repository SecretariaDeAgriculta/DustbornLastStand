import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Users, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface FactionReputationProps {
  name: string;
  reputation: number; // -100 to 100
  icon: React.ReactNode; // Placeholder for faction-specific icon
}

const FactionReputationBar: React.FC<FactionReputationProps> = ({ name, reputation, icon }) => {
  const getReputationTier = (rep: number) => {
    if (rep <= -75) return { label: 'Hated', color: 'bg-red-700', icon: <TrendingDown className="text-red-400" /> };
    if (rep <= -25) return { label: 'Distrusted', color: 'bg-red-500', icon: <TrendingDown className="text-red-300" /> };
    if (rep < 25) return { label: 'Neutral', color: 'bg-gray-500', icon: <Minus className="text-gray-300" /> };
    if (rep < 75) return { label: 'Friendly', color: 'bg-green-500', icon: <TrendingUp className="text-green-300" /> };
    return { label: 'Allied', color: 'bg-green-700', icon: <TrendingUp className="text-green-400" /> };
  };

  const tier = getReputationTier(reputation);
  const progressValue = ((reputation + 100) / 200) * 100;

  return (
    <Card className="bg-card-foreground/5">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-headline text-lg text-primary flex items-center">
            {icon} <span className="ml-2">{name}</span>
          </h4>
          <div className="flex items-center text-sm font-semibold">
            {tier.icon} <span className="ml-1">{tier.label} ({reputation})</span>
          </div>
        </div>
        <Progress value={progressValue} className={`h-3 [&>div]:${tier.color}`} />
      </CardContent>
    </Card>
  );
};


interface FactionReputationDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function FactionReputationDialog({ isOpen, onOpenChange }: FactionReputationDialogProps) {
  // Placeholder data for factions
  const factions = [
    { name: 'The Settlers Union', reputation: 30, icon: <Users /> },
    { name: 'Dust Rider Nomads', reputation: -50, icon: <Users /> },
    { name: 'Ironclad Mining Co.', reputation: 70, icon: <Users /> },
    { name: 'Whispering Gulch Gang', reputation: -90, icon: <Users /> },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background border-primary">
        <DialogHeader>
          <DialogTitle className="font-headline text-3xl text-primary">Faction Standings</DialogTitle>
          <DialogDescription>
            Your actions echo through the wasteland. See how the local powers view you.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
          {factions.map((faction) => (
            <FactionReputationBar key={faction.name} {...faction} />
          ))}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
