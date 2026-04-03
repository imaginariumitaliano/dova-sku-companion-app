import React, { createContext, useContext, useEffect, useState } from 'react';
import * as FileSystem from 'expo-file-system/legacy';

const SPOILER_FILE = (FileSystem.documentDirectory ?? '') + 'spoiler.json';

interface SpoilerContextValue {
  spoilerMode: boolean;
  enableSpoilerMode: () => void;
  disableSpoilerMode: () => void;
}

const SpoilerContext = createContext<SpoilerContextValue | null>(null);

export function SpoilerProvider({ children }: { children: React.ReactNode }) {
  const [spoilerMode, setSpoilerMode] = useState(false);

  useEffect(() => {
    FileSystem.readAsStringAsync(SPOILER_FILE)
      .then((raw) => {
        const parsed = JSON.parse(raw);
        setSpoilerMode(parsed.enabled === true);
      })
      .catch(() => {});
  }, []);

  const persist = (enabled: boolean) => {
    setSpoilerMode(enabled);
    FileSystem.writeAsStringAsync(SPOILER_FILE, JSON.stringify({ enabled })).catch(() => {});
  };

  return (
    <SpoilerContext.Provider value={{
      spoilerMode,
      enableSpoilerMode: () => persist(true),
      disableSpoilerMode: () => persist(false),
    }}>
      {children}
    </SpoilerContext.Provider>
  );
}

export function useSpoiler() {
  const ctx = useContext(SpoilerContext);
  if (!ctx) throw new Error('useSpoiler must be used within SpoilerProvider');
  return ctx;
}
