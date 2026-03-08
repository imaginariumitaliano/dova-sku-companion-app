export interface BookImage {
  url: string;
  title?: string;
  description?: string;
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
