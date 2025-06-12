'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, ArrowUpCircle, Users, Brain } from 'lucide-react';
import { ShopDialog } from './ShopDialog';
import { LevelUpDialog } from './LevelUpDialog';
import { FactionReputationDialog } from './FactionReputationDialog';
import { AdaptiveBalancerDialog } from './AdaptiveBalancerDialog';
import { useToast } from '@/hooks/use-toast';

export function ActionsMenu() {
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isLevelUpOpen, setIsLevelUpOpen] = useState(false);
  const [isFactionsOpen, setIsFactionsOpen] = useState(false);
  const [isBalancerOpen, setIsBalancerOpen] = useState(false);
  const { toast } = useToast();

  const handleLevelUpSelection = (upgradeName: string) => {
    toast({
      title: "Upgrade Chosen!",
      description: `You selected: ${upgradeName}.`,
    });
    // Actual game logic for applying upgrade would go here
  };
  
  // Example: Simulate level up availability
  const canLevelUp = true; 

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <Button onClick={() => setIsShopOpen(true)} variant="outline" className="w-full">
            <ShoppingBag className="w-4 h-4 mr-2" /> Shop
          </Button>
          <Button onClick={() => setIsLevelUpOpen(true)} disabled={!canLevelUp} variant="outline" className="w-full">
            <ArrowUpCircle className="w-4 h-4 mr-2" /> Level Up
          </Button>
          <Button onClick={() => setIsFactionsOpen(true)} variant="outline" className="w-full">
            <Users className="w-4 h-4 mr-2" /> Factions
          </Button>
          <Button onClick={() => setIsBalancerOpen(true)} variant="outline" className="w-full">
            <Brain className="w-4 h-4 mr-2" /> AI Balancer
          </Button>
        </CardContent>
      </Card>

      <ShopDialog isOpen={isShopOpen} onOpenChange={setIsShopOpen} />
      <LevelUpDialog isOpen={isLevelUpOpen} onOpenChange={setIsLevelUpOpen} onUpgradeSelected={handleLevelUpSelection} />
      <FactionReputationDialog isOpen={isFactionsOpen} onOpenChange={setIsFactionsOpen} />
      <AdaptiveBalancerDialog isOpen={isBalancerOpen} onOpenChange={setIsBalancerOpen} />
    </>
  );
}
