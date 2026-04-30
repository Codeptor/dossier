// Manual reading list — Goodreads doesn't expose a stable RSS feed for
// most shelves anymore, so this is hand-maintained. Newest first.
//
// Drop a new book by adding to the `current` or `recent` array.

export interface Book {
  title: string;
  author: string;
  status: "current" | "recent";
  // Optional rating out of 5
  rating?: number;
  // Optional ISBN or Goodreads link
  link?: string;
  // Optional one-line note on why it's here
  note?: string;
}

export const books: Book[] = [
  {
    title: "Breasts and Eggs",
    author: "Mieko Kawakami",
    status: "current",
    note: "Translated by Sam Bett & David Boyd.",
  },
];
