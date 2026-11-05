export interface BookImage {
  url: string;
  title?: string;
  description?: string;
  // Only ever set on a chapter's first image -- the one ChapterListScreen
  // shows outside the full viewer. A small (~300px) recompressed variant,
  // so the chapter list doesn't load full-resolution images just to render
  // an 80x80 thumbnail.
  thumbnailUrl?: string;
}

export interface Chapter {
  number: number;
  title: string;
  images: BookImage[];
}

export interface Book {
  id: string;
  title: string;
  subtitle?: string;
  coverImage?: string;
  locked?: boolean;
  chapters: Chapter[];
}

export interface BooksContent {
  books: Book[];
}

export interface FlatImage {
  url: string;
  title?: string;
  description?: string;
  chapterNumber: number;
  chapterTitle: string;
  globalIndex: number;
}
