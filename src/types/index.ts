export interface Chapter {
  number: number;
  title: string;
  images: string[];
}

export interface Book {
  id: string;
  title: string;
  subtitle?: string;
  coverImage?: string;
  chapters: Chapter[];
}

export interface BooksContent {
  books: Book[];
}

export interface FlatImage {
  url: string;
  chapterNumber: number;
  chapterTitle: string;
  globalIndex: number;
}
