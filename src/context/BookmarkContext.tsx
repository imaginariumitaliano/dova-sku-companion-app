import React, { createContext, useContext, useEffect, useState } from 'react';
import * as FileSystem from 'expo-file-system/legacy';

const BOOKMARKS_FILE = (FileSystem.documentDirectory ?? '') + 'bookmarks.json';

export type Bookmark = {
  id: string;
  bookId: string;
  bookTitle: string;
  chapterNumber: number;
  chapterTitle: string;
  imageUrl: string;
  imageDescription?: string;
  globalIndex: number;
  savedAt: number;
};

interface BookmarkContextValue {
  bookmarks: Bookmark[];
  addBookmark: (b: Bookmark) => void;
  removeBookmark: (id: string) => void;
  isBookmarked: (id: string) => boolean;
}

const BookmarkContext = createContext<BookmarkContextValue | null>(null);

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    FileSystem.readAsStringAsync(BOOKMARKS_FILE)
      .then((raw) => setBookmarks(JSON.parse(raw)))
      .catch(() => {});
  }, []);

  const persist = (next: Bookmark[]) => {
    setBookmarks(next);
    FileSystem.writeAsStringAsync(BOOKMARKS_FILE, JSON.stringify(next)).catch(() => {});
  };

  const addBookmark = (b: Bookmark) => {
    persist([b, ...bookmarks.filter((x) => x.id !== b.id)]);
  };

  const removeBookmark = (id: string) => {
    persist(bookmarks.filter((b) => b.id !== id));
  };

  const isBookmarked = (id: string) => bookmarks.some((b) => b.id === id);

  return (
    <BookmarkContext.Provider value={{ bookmarks, addBookmark, removeBookmark, isBookmarked }}>
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  const ctx = useContext(BookmarkContext);
  if (!ctx) throw new Error('useBookmarks must be used within BookmarkProvider');
  return ctx;
}
