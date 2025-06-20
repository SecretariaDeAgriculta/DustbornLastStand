
// src/lib/progress.ts
const PROGRESS_KEY = 'dustborn_progress';

export const getUnlockedLevel = (): number => {
  if (typeof window === 'undefined') {
    return 0; // Não pode acessar localStorage no servidor
  }
  const saved = localStorage.getItem(PROGRESS_KEY);
  return saved ? parseInt(saved, 10) : 0;
};

export const unlockNextLevel = (completedLevel: number) => {
  if (typeof window === 'undefined') {
    return;
  }
  const current = getUnlockedLevel();
  if (completedLevel + 1 > current) {
    localStorage.setItem(PROGRESS_KEY, (completedLevel + 1).toString());
  }
};

export const resetProgress = () => {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(PROGRESS_KEY);
};
