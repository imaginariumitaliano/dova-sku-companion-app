import { useProgress } from '../context/ProgressContext';
import { useSpoiler } from '../context/SpoilerContext';

export type UnlockCondition = { book: string; chapter: number } | null | undefined;

export function useUnlock() {
  const { getConsecutiveProgress } = useProgress();
  const { spoilerMode } = useSpoiler();

  const isUnlocked = (unlockAfter: UnlockCondition): boolean => {
    if (spoilerMode) return true;
    if (unlockAfter === null || unlockAfter === undefined) return true;
    const progress = getConsecutiveProgress(unlockAfter.book);
    return progress >= unlockAfter.chapter;
  };

  return { isUnlocked };
}
