import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, ShoppingCart, Zap, Shield } from 'lucide-react';

interface ShopItemProps {
  name: string;
  description: string;
  price: number;
  icon: React.ReactNode;
  imageUrl?: string;
  imageHint?: string;
  onPurchase: () => void;
}

const ShopItemCard: React.FC<ShopItemProps> = ({ name, description, price, icon, imageUrl, imageHint, onPurchase }) => (
  <Card className="overflow-hidden">
    <CardHeader className="p-4">
      {imageUrl && <Image src={imageUrl} alt={name} width={100} height={100} className="w-full h-32 object-cover rounded-md mb-2 bg-muted" data-ai-hint={imageHint || 'item object'}/>}
      <CardTitle className="font-headline text-xl flex items-center">
        {icon}
        <span className="ml-2">{name}</span>
      </CardTitle>
    </CardHeader>
    <CardContent className="p-4 text-sm">
      <p>{description}</p>
    </CardContent>
    <CardFooter className="p-4 bg-card-foreground/5 flex justify-between items-center">
      <div className="flex items-center text-primary font-bold">
        <Coins className="w-4 h-4 mr-1" /> {price}
      </div>
      <Button onClick={onPurchase} size="sm" variant="outline">
        <ShoppingCart className="w-4 h-4 mr-2" /> Buy
      </Button>
    </CardFooter>
  </Card>
);


interface ShopDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function ShopDialog({ isOpen, onOpenChange }: ShopDialogProps) {
  const handlePurchase = (itemName: string) => {
    console.log(`Purchased ${itemName}`);
    // Add logic for purchasing item
  };

  const weapons = [
    { name: 'Peacemaker Pistol', description: 'A reliable sidearm for any gunslinger.', price: 100, imageUrl: 'https://placehold.co/200x150.png', imageHint: 'old pistol', icon: <Zap /> },
    { name: 'Ranger Rifle', description: 'Long-range accuracy, packs a punch.', price: 250, imageUrl: 'https://placehold.co/200x150.png', imageHint: 'old rifle', icon: <Zap /> },
  ];

  const upgrades = [
    { name: 'Tough Hide Jerky', description: '+20 Max Health.', price: 75, icon: <Shield /> },
    { name: 'Eagle Eye Scope', description: '+10% Critical Chance.', price: 120, icon: <Zap /> },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-background border-primary max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline text-3xl text-primary">The Wandering Emporium</DialogTitle>
          <DialogDescription>Spend your hard-earned scrap on weapons and upgrades. Fortune favors the prepared.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4 overflow-y-auto flex-grow pr-2">
          <div>
            <h3 className="font-headline text-xl text-accent mb-2">Weapons for Hire</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {weapons.map(item => <ShopItemCard key={item.name} {...item} onPurchase={() => handlePurchase(item.name)} />)}
            </div>
          </div>
          <div>
            <h3 className="font-headline text-xl text-accent mb-2">Enhancements & Trinkets</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upgrades.map(item => <ShopItemCard key={item.name} {...item} onPurchase={() => handlePurchase(item.name)} />)}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">Close Shop</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
