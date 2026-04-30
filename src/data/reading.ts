// Manual reading list — Goodreads doesn't expose a stable RSS feed for
// most shelves anymore, so this is hand-maintained. Newest first.
//
// Drop a new book by adding to the `current` or `recent` array.

export interface Book {
  title: string;
  author: string;
  year?: string;
  status: "current" | "recent";
  rating?: number;
  link?: string;
  note?: string;
}

export const books: Book[] = [
  {
    title: "Breasts and Eggs",
    author: "Mieko Kawakami",
    year: "2008 / 2019 expanded",
    status: "current",
    note: "Translated by Sam Bett & David Boyd.",
  },

  // Fiction
  { title: "Henry & June", author: "Anaïs Nin", year: "1986", status: "recent" },
  { title: "Delta of Venus", author: "Anaïs Nin", year: "1977", status: "recent", note: "Posthumous." },
  { title: "White Nights", author: "Fyodor Dostoevsky", year: "1848", status: "recent" },
  { title: "The Brothers Karamazov", author: "Fyodor Dostoevsky", year: "1880", status: "recent" },
  { title: "Notes from Underground", author: "Fyodor Dostoevsky", year: "1864", status: "recent" },
  { title: "Nana", author: "Émile Zola", year: "1880", status: "recent" },
  { title: "The Stranger", author: "Albert Camus", year: "1942", status: "recent" },
  { title: "Mansfield Park", author: "Jane Austen", year: "1814", status: "recent" },
  { title: "Norwegian Wood", author: "Haruki Murakami", year: "1987", status: "recent" },
  { title: "Men Without Women", author: "Haruki Murakami", year: "2014", status: "recent" },
  { title: "Lapvona", author: "Ottessa Moshfegh", year: "2022", status: "recent" },
  { title: "Gone Girl", author: "Gillian Flynn", year: "2012", status: "recent" },
  { title: "Intermezzo", author: "Sally Rooney", year: "2024", status: "recent" },
  { title: "The Piano Teacher", author: "Elfriede Jelinek", year: "1983", status: "recent" },

  // Philosophy / theory
  { title: "Critique of Pure Reason", author: "Immanuel Kant", year: "1781", status: "recent" },
  { title: "Fear and Trembling", author: "Søren Kierkegaard", year: "1843", status: "recent" },
  { title: "The Rebel", author: "Albert Camus", year: "1951", status: "recent" },
  { title: "Being and Nothingness", author: "Jean-Paul Sartre", year: "1943", status: "recent" },
  { title: "Existentialism Is a Humanism", author: "Jean-Paul Sartre", year: "1946", status: "recent" },
  { title: "Negative Dialectics", author: "Theodor W. Adorno", year: "1966", status: "recent" },
  { title: "Difference and Repetition", author: "Gilles Deleuze", year: "1968", status: "recent" },
  { title: "The Divided Self", author: "R. D. Laing", year: "1960", status: "recent" },

  // Journals · Letters · Poems
  { title: "The Diaries of Franz Kafka", author: "Franz Kafka", year: "1910–1923", status: "recent", note: "Ross Benjamin translation, 2023." },
  { title: "The Journals of Sylvia Plath", author: "Sylvia Plath", year: "1982", status: "recent", note: "Abridged edition, edited by Ted Hughes." },
  { title: "The Complete Poems", author: "Anne Sexton", year: "1981", status: "recent" },
  { title: "A Writer's Diary", author: "Virginia Woolf", year: "1953", status: "recent", note: "Edited by Leonard Woolf." },
  { title: "Reborn: Journals & Notebooks 1947–1963", author: "Susan Sontag", year: "2008", status: "recent" },
  { title: "Selected Letters, 1940–1977", author: "Vladimir Nabokov", year: "1989", status: "recent" },

  // Object
  {
    title: "Sentimental Obsessions and How to Maintain Illusions",
    author: "Dazzling Inner",
    year: "2020",
    status: "recent",
    note: "Self-reflection journal. On the shelf for the title alone.",
  },
];
