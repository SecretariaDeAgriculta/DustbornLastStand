
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DustbornGame } from '@/components/game/DustbornGame';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Settings, Laptop, Smartphone, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { CutscenePlayer } from '@/components/CutscenePlayer';
import { openingCutsceneData } from '@/data/openingCutscene';
import { Prologue } from '@/components/game/Prologue'; // New Import

type ViewMode = 'opening_cutscene' | 'prologue_gameplay' | 'mainMenu' | 'storyChapterSelect' | 'freeMode';

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('opening_cutscene');
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

  const handleCutsceneComplete = () => {
    setViewMode('prologue_gameplay'); // Transition to prologue after cutscene
  };

  const handlePrologueComplete = () => {
    setViewMode('mainMenu'); // Transition to main menu after prologue
  };

  if (viewMode === 'opening_cutscene') {
    return <CutscenePlayer slides={openingCutsceneData} onComplete={handleCutsceneComplete} />;
  }

  if (viewMode === 'prologue_gameplay') {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-0 selection:bg-primary selection:text-primary-foreground">
        <Prologue onComplete={handlePrologueComplete} />
      </div>
    );
  }

  if (viewMode === 'freeMode') {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-0 sm:p-4 selection:bg-primary selection:text-primary-foreground">
        <main className="w-full h-full sm:max-w-screen-lg flex-grow flex flex-col items-center justify-center">
          <DustbornGame
            onExitToMenu={() => setViewMode('mainMenu')}
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
  }

  const storyChapters = [
    { title: 'Prólogo' }, // This will be clickable later to replay prologue
    { title: 'Ato 1: O Silêncio dos Boyle' },
    { title: 'Ato 2: O Sussurro dos Gaviões' },
    { title: 'Ato 3: O Eco do Canyon' },
    { title: 'Ato 4: O Fim da Linha' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 selection:bg-primary selection:text-primary-foreground relative">
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" className="absolute top-4 right-4 text-primary hover:text-accent-foreground hover:bg-accent">
            <Settings className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle className="text-primary">Configurações de Controle</DialogTitle>
            <DialogDescription>
              Escolha seu modo de controle preferido ou deixe o jogo detectar automaticamente.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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

      <div className="z-10 flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-primary mb-4" style={{ fontFamily: "'PT Sans', sans-serif" }}>
          Dustborn: <span className="text-accent">Last Stand</span>
        </h1>
        <p className="text-md sm:text-lg text-muted-foreground mb-10 sm:mb-12 max-w-md">
          No coração poeirento do velho oeste, cada dia é uma luta pela sobrevivência. Enfrente hordas e prove seu valor.
        </p>

        <Card className="w-full max-w-xs sm:max-w-sm bg-card/80 backdrop-blur-sm shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-xl sm:text-2xl text-card-foreground">
              {viewMode === 'mainMenu' ? 'Escolha o Modo de Jogo' : 'Capítulos da História'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {viewMode === 'mainMenu' && (
              <>
                <Button
                  variant="secondary"
                  className="w-full py-2 sm:py-3 text-md sm:text-lg relative"
                  onClick={() => setViewMode('storyChapterSelect')}
                >
                  Modo História
                </Button>
                <Button
                  variant="default"
                  className="w-full py-2 sm:py-3 text-md sm:text-lg bg-accent hover:bg-accent/90 text-accent-foreground"
                  onClick={() => setViewMode('freeMode')}
                >
                  Modo Livre
                </Button>
              </>
            )}
            {viewMode === 'storyChapterSelect' && (
              <>
                {storyChapters.map((chapter, index) => (
                  <Button
                    key={index}
                    variant="secondary"
                    className="w-full py-2 sm:py-3 text-md sm:text-lg relative"
                    disabled={chapter.title !== 'Prólogo'} // Enable prologue later for replay
                    aria-disabled={chapter.title !== 'Prólogo'}
                    onClick={() => {
                      if (chapter.title === 'Prólogo') {
                        // Potentially reset prologue state here if needed for replay
                        setViewMode('prologue_gameplay'); 
                      }
                    }}
                  >
                    {chapter.title}
                    {chapter.title !== 'Prólogo' && (
                        <span className="absolute top-1 right-1 sm:top-1.5 sm:right-2 text-xs bg-muted text-muted-foreground px-1.5 sm:px-2 py-0.5 rounded-full">Em Breve</span>
                    )}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  className="w-full py-2 sm:py-3 text-md sm:text-lg mt-4"
                  onClick={() => setViewMode('mainMenu')}
                >
                  Voltar
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <footer className="absolute bottom-0 w-full text-center py-3 sm:py-4 text-muted-foreground/80 text-xs z-10">
        <p>&copy; {new Date().getFullYear()} Dustborn: Last Stand. Construído no Firebase Studio.</p>
      </footer>
    </div>
  );
}
