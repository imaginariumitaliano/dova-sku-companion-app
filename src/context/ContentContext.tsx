import React, { createContext, useContext, useEffect, useState } from 'react';
import { BooksContent, Book, FlatImage } from '../types';
import { CONTENT_URL, USE_LOCAL_CONTENT } from '../config';
import localContent from '../../content/books.json';

interface ContentContextValue {
  content: BooksContent | null;
  loading: boolean;
  error: string | null;
  getFlatImages: (bookId: string) => FlatImage[];
  getBook: (bookId: string) => Book | undefined;
  refresh: () => void;
}

const ContentContext = createContext<ContentContextValue | null>(null);

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<BooksContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = async () => {
    setLoading(true);
    setError(null);
    try {
      if (USE_LOCAL_CONTENT) {
        setContent(localContent as BooksContent);
      } else {
        const response = await fetch(`${CONTENT_URL}?t=${Date.now()}`, { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        setContent(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content');
      // Fall back to local content on network error
      setContent(localContent as BooksContent);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const getFlatImages = (bookId: string): FlatImage[] => {
    const book = content?.books.find((b) => b.id === bookId);
    if (!book) return [];

    let globalIndex = 0;
    return book.chapters.flatMap((chapter) =>
      chapter.images.map((image: { url: string; title?: string; description?: string }) => ({
        url: image.url,
        title: image.title,
        description: image.description,
        chapterNumber: chapter.number,
        chapterTitle: chapter.title,
        globalIndex: globalIndex++,
      }))
    );
  };

  const getBook = (bookId: string) =>
    content?.books.find((b) => b.id === bookId);

  return (
    <ContentContext.Provider
      value={{ content, loading, error, getFlatImages, getBook, refresh: fetchContent }}
    >
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent must be used within ContentProvider');
  return ctx;
}
