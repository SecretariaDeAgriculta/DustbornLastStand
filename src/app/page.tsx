'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DustbornGame } from '@/components/game/DustbornGame';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Settings, Laptop, Smartphone, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { MainMenu } from '@/components/MainMenu';

type ViewMode = 'main_menu' | 'gameplay';

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('main_menu');
  const [deviceSetting, setDeviceSetting] = useState<'auto' | 'computer' | 'mobile'>('auto');
  const [currentDeviceMode, setCurrentDeviceMode] = useState<'computer' | 'mobile'>('computer');
  const { toast } = useToast();
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);

  useEffect(() => {
    let modeToUse: 'computer' | 'mobile';
    let showToast = false;

    if (deviceSetting === 'auto') {
      const isLikelyMobile = window.matchMedia('(pointer: coarse)').matches || /Mobi|Android/i.test(navigator.userAgent);
      modeToUse = isLikelyMobile ? 'mobile' : 'computer';
      showToast = true;
    } else {
      modeToUse = deviceSetting;
    }

    if (currentDeviceMode !== modeToUse && showToast && deviceSetting === 'auto') {
       toast({
        title: "Detecção Automática de Controles",
        description: `Modo ${modeToUse === 'mobile' ? 'Móvel (Toque)' : 'Computador (Teclado)'} ativado. Ajuste nas Configurações se necessário.`,
      });
    }
    setCurrentDeviceMode(modeToUse);

  }, [deviceSetting, toast, currentDeviceMode]);

  const handleSetDevice = (mode: 'auto' | 'computer' | 'mobile') => {
    setDeviceSetting(mode);
    if (mode !== 'auto') {
        setCurrentDeviceMode(mode);
        toast({
            title: "Configuração Salva",
            description: `Modo de controle definido para ${mode === 'mobile' ? 'Móvel (Toque)' : 'Computador (Teclado)'}.`,
        });
    }
    setIsSettingsDialogOpen(false);
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'main_menu':
        return (
          <MainMenu 
            onPlay={() => setViewMode('gameplay')}
          />
        );

      case 'gameplay':
        return (
          <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-0 sm:p-4 selection:bg-primary selection:text-primary-foreground">
            <main className="w-full h-full sm:max-w-screen-lg flex-grow flex flex-col items-center justify-center">
              <DustbornGame
                onExitToMenu={() => setViewMode('main_menu')}
                deviceType={currentDeviceMode}
              />
            </main>
            {currentDeviceMode === 'computer' && (
              <footer className="w-full max-w-screen-lg text-center py-2 sm:py-4 mt-2 sm:mt-4 text-muted-foreground text-xs">
                <p>&copy; {new Date().getFullYear()} Dustborn: Last Stand. Construído no Firebase Studio.</p>
              </footer>
            )}
          </div>
        );
      default:
        return (
            <div className="text-center">
                <h1 className="text-2xl text-destructive">Estado de Jogo Desconhecido</h1>
                <p>Retornando ao menu principal...</p>
                {useEffect(() => {
                    setTimeout(() => setViewMode('main_menu'), 2000);
                }, [])}
            </div>
        );
    }
  };
  
  const showSettingsButton = viewMode !== 'gameplay';


  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-0 selection:bg-primary selection:text-primary-foreground relative">
      {showSettingsButton && (
         <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
         <DialogTrigger asChild>
           <Button variant="outline" size="icon" className="absolute top-4 right-4 text-primary hover:text-accent-foreground hover:bg-accent z-50">
             <Settings className="h-6 w-6" />
           </Button>
         </DialogTrigger>
         <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground">
           <DialogHeader>
             <DialogTitle className="text-primary">Configurações</DialogTitle>
           </DialogHeader>
           <div className="grid gap-4 py-4">
             <p className="text-sm font-medium text-card-foreground mb-1">Modo de Controle:</p>
             <Button
               variant={deviceSetting === 'auto' ? 'default' : 'secondary'}
               onClick={() => handleSetDevice('auto')}
               className="w-full justify-start"
             >
               <RefreshCw className="mr-2 h-5 w-5" />
               Detecção Automática
             </Button>
             <Button
               variant={deviceSetting === 'computer' ? 'default' : 'secondary'}
               onClick={() => handleSetDevice('computer')}
               className="w-full justify-start"
             >
               <Laptop className="mr-2 h-5 w-5" />
               Computador (Teclado)
             </Button>
             <Button
               variant={deviceSetting === 'mobile' ? 'default' : 'secondary'}
               onClick={() => handleSetDevice('mobile')}
               className="w-full justify-start"
             >
               <Smartphone className="mr-2 h-5 w-5" />
               Móvel (Toque)
             </Button>
           </div>
           <DialogFooter>
             <Button variant="outline" onClick={() => setIsSettingsDialogOpen(false)}>Fechar</Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
      )}
      {renderContent()}
      { viewMode === 'main_menu' &&
        <footer className="absolute bottom-0 w-full text-center py-3 sm:py-4 text-muted-foreground/80 text-xs z-10">
          <p>&copy; {new Date().getFullYear()} Dustborn: Last Stand. Construído no Firebase Studio.</p>
        </footer>
      }
    </div>
  );
}
