import React, { createContext, useContext, useEffect, useState } from 'react';
import * as FileSystem from 'expo-file-system/legacy';

const PROGRESS_FILE = (FileSystem.documentDirectory ?? '') + 'progress.json';

type ProgressData = { [bookId: string]: number[] };

interface ProgressContextValue {
  isRead: (bookId: string, chapterNumber: number) => boolean;
  toggleRead: (bookId: string, chapterNumber: number) => void;
  getReadChapters: (bookId: string) => number[];
  getConsecutiveProgress: (bookId: string) => number;
  canMarkRead: (bookId: string, chapterNumber: number) => boolean;
  canMarkUnread: (bookId: string, chapterNumber: number) => boolean;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<ProgressData>({});

  useEffect(() => {
    FileSystem.readAsStringAsync(PROGRESS_FILE)
      .then((raw) => setData(JSON.parse(raw)))
      .catch(() => {});
  }, []);

  const persist = (next: ProgressData) => {
    setData(next);
    FileSystem.writeAsStringAsync(PROGRESS_FILE, JSON.stringify(next)).catch(() => {});
  };

  const isRead = (bookId: string, chapterNumber: number) =>
    (data[bookId] ?? []).includes(chapterNumber);

  // Returns the highest chapter N such that chapters 1..N are all read
  const getConsecutiveProgress = (bookId: string): number => {
    const readSet = new Set(data[bookId] ?? []);
    let n = 0;
    while (readSet.has(n + 1)) n++;
    return n;
  };

  // Can mark as read only if the previous chapter is already read (or this is ch 1)
  const canMarkRead = (bookId: string, chapterNumber: number): boolean => {
    if (chapterNumber === 1) return true;
    return isRead(bookId, chapterNumber - 1);
  };

  // Can mark as unread only if the next chapter is not yet read (no gaps)
  const canMarkUnread = (bookId: string, chapterNumber: number): boolean => {
    return !isRead(bookId, chapterNumber + 1);
  };

  const toggleRead = (bookId: string, chapterNumber: number) => {
    const current = data[bookId] ?? [];
    if (current.includes(chapterNumber)) {
      // Unmark: only if next chapter isn't read
      if (!canMarkUnread(bookId, chapterNumber)) return;
      persist({ ...data, [bookId]: current.filter((n) => n !== chapterNumber) });
    } else {
      // Mark: only if previous chapter is read
      if (!canMarkRead(bookId, chapterNumber)) return;
      persist({ ...data, [bookId]: [...current, chapterNumber] });
    }
  };

  const getReadChapters = (bookId: string) => data[bookId] ?? [];

  return (
    <ProgressContext.Provider value={{ isRead, toggleRead, getReadChapters, getConsecutiveProgress, canMarkRead, canMarkUnread }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
