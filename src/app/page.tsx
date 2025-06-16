
import { DustbornGame } from '@/components/game/DustbornGame';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 selection:bg-primary selection:text-primary-foreground">
      <main className="w-full max-w-screen-lg flex-grow flex flex-col items-center justify-center">
        <DustbornGame />
      </main>
      <footer className="w-full max-w-screen-lg text-center py-4 mt-4 text-muted-foreground text-xs">
        <p>&copy; {new Date().getFullYear()} Dustborn: Última Resistência. Construído no Firebase Studio.</p>
      </footer>
    </div>
  );
}
