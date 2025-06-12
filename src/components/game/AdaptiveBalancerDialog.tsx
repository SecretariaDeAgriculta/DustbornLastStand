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
import { AdaptiveBalancerForm } from './AdaptiveBalancerForm';
import { Brain } from 'lucide-react';

interface AdaptiveBalancerDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function AdaptiveBalancerDialog({ isOpen, onOpenChange }: AdaptiveBalancerDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-background border-primary max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline text-3xl text-primary flex items-center">
            <Brain className="w-8 h-8 mr-2" /> Adaptive Wave Balancer
          </DialogTitle>
          <DialogDescription>
            Configure parameters to let the AI generate balanced wave settings based on player performance and game state.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 overflow-y-auto flex-grow pr-2">
          <AdaptiveBalancerForm />
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
