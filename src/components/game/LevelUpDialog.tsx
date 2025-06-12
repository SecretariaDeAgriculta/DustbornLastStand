import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Shield, ArrowUpCircle, Gift } from 'lucide-react';

interface UpgradeOptionProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  onSelect: () => void;
}

const UpgradeOptionCard: React.FC<UpgradeOptionProps> = ({ name, description, icon, onSelect }) => (
  <Card className="hover:shadow-primary/50 hover:shadow-md transition-shadow cursor-pointer" onClick={onSelect}>
    <CardHeader className="p-4">
      <CardTitle className="font-headline text-xl flex items-center">
        {icon}
        <span className="ml-2">{name}</span>
      </CardTitle>
    </CardHeader>
    <CardContent className="p-4 text-sm">
      {description}
    </CardContent>
    <CardFooter className="p-4">
      <Button onClick={onSelect} className="w-full" variant="default">Choose Upgrade</Button>
    </CardFooter>
  </Card>
);

interface LevelUpDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onUpgradeSelected: (upgradeName: string) => void;
}

export function LevelUpDialog({ isOpen, onOpenChange, onUpgradeSelected }: LevelUpDialogProps) {
  // Placeholder for three random upgrades
  const upgrades = [
    { name: 'Quickdraw Reflexes', description: '+10% Attack Speed.', icon: <Zap className="text-yellow-400" /> },
    { name: 'Iron Will', description: '+15% Damage Resistance.', icon: <Shield className="text-blue-400" /> },
    { name: 'Lucky Charm', description: '+5% Chance to find extra scrap.', icon: <Gift className="text-green-400" /> },
  ];

  const handleSelectUpgrade = (upgradeName: string) => {
    onUpgradeSelected(upgradeName);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-background border-primary">
        <DialogHeader>
          <DialogTitle className="font-headline text-3xl text-primary flex items-center">
            <ArrowUpCircle className="w-8 h-8 mr-2" /> Level Up!
          </DialogTitle>
          <DialogDescription>
            You've grown stronger. Choose one of the following boons to aid your survival.
          </DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-3 gap-4 py-4">
          {upgrades.map((upgrade) => (
            <UpgradeOptionCard
              key={upgrade.name}
              name={upgrade.name}
              description={upgrade.description}
              icon={upgrade.icon}
              onSelect={() => handleSelectUpgrade(upgrade.name)}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
