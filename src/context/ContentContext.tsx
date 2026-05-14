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

let _cachedContent: BooksContent | null = null;
let _lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000;

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<BooksContent | null>(_cachedContent);
  const [loading, setLoading] = useState(_cachedContent === null);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = async () => {
    const now = Date.now();

    if (_cachedContent) {
      setContent(_cachedContent);
      setLoading(false);
      if (now - _lastFetchTime < CACHE_TTL) return;
    } else {
      setLoading(true);
    }

    setError(null);
    try {
      if (USE_LOCAL_CONTENT) {
        _cachedContent = localContent as BooksContent;
        _lastFetchTime = now;
        setContent(_cachedContent);
      } else {
        const response = await fetch(CONTENT_URL, { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        _cachedContent = data;
        _lastFetchTime = now;
        setContent(data);
      }
    } catch (err) {
      if (!_cachedContent) {
        setError(err instanceof Error ? err.message : 'Failed to load content');
        setContent(localContent as BooksContent);
      }
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
