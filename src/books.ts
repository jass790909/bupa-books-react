export type Category = 'Adults' | 'Children';
export type Book = { id: string; title: string; type: string; category: Category };
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid API record.');
  return value as Record<string, unknown>;
}
/** Normalize both the live lowercase schema and the supplied uppercase sample. */
export function parseBooks(input: unknown): Book[] {
  if (!Array.isArray(input)) throw new Error('Expected an array of owners.');
  return input.flatMap((entry, ownerIndex) => {
    const owner = record(entry);
    const age = owner.age;
    if (typeof age !== 'number' || !Number.isInteger(age) || age < 0) throw new Error('Invalid owner age.');
    const books = owner.books ?? owner.BOOKS ?? [];
    if (!Array.isArray(books)) throw new Error('Invalid books list.');
    return books.map((entry, bookIndex) => {
      const book = record(entry);
      const title = book.name ?? book.NAME;
      if (typeof title !== 'string' || !title.trim()) throw new Error('Invalid book title.');
      if (book.type != null && typeof book.type !== 'string') throw new Error('Invalid book type.');
      return {id: `${ownerIndex}-${bookIndex}`,title:title.trim(),type: typeof book.type === 'string' ? book.type.trim() : '',category:age >= 18 ? 'Adults' : 'Children'} as Book;
    });
  });
}
const collator = new Intl.Collator('en', {sensitivity:'base',numeric:false});
export function selectBooks(books: Book[], category: Category, hardcover: boolean) {
  return books.filter(book => book.category === category && (!hardcover || book.type.toLowerCase() === 'hardcover')).sort((a,b) => collator.compare(a.title,b.title));
}
export async function fetchBooks(signal?: AbortSignal): Promise<Book[]> {
  const response = await fetch('/api/bookowners',{signal,headers:{Accept:'application/json'}});
  if (!response.ok) throw new Error('Books are temporarily unavailable. Please try again.');
  return parseBooks(await response.json());
}
