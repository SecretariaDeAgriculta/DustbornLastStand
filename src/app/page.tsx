import { GameHeader } from '@/components/game/GameHeader';
import { PlayerStatus } from '@/components/game/PlayerStatus';
import { WeaponSlots } from '@/components/game/WeaponSlots';
import { GameArea } from '@/components/game/GameArea';
import { ActionsMenu } from '@/components/game/ActionsMenu';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center p-4 sm:p-6 md:p-8 selection:bg-primary selection:text-primary-foreground">
      <GameHeader />
      <main className="flex-grow w-full max-w-screen-2xl grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <div className="lg:col-span-8 xl:col-span-9 h-[60vh] lg:h-auto">
          <GameArea />
        </div>
        <aside className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
          <PlayerStatus />
          <WeaponSlots />
          <ActionsMenu />
        </aside>
      </main>
      <footer className="w-full max-w-screen-2xl text-center py-8 mt-8 text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} Dustborn: Last Stand. All rights reserved by the wasteland.</p>
      </footer>
    </div>
  );
}
