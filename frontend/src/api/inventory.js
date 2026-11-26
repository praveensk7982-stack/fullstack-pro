import { supabase } from '../lib/supabase.js';
import { addBookStock, reduceBookStock } from './books.js';

const mapBook = (row) => ({
  id: row.id,
  title: row.title,
  author: row.author,
  isbn: row.isbn,
  category: row.category,
  totalCopies: row.total_stock ?? row.total_copies ?? 0,
  availableCopies: row.available_stock ?? row.available_copies ?? 0,
  totalStock: row.total_stock ?? row.total_copies ?? 0,
  availableStock: row.available_stock ?? row.available_copies ?? 0,
  createdAt: row.created_at,
});

const mapHistoryEntry = (row) => {
  const prevAvail = row.previous_available ?? row.prev_available ?? 0;
  const newAvail = row.new_available ?? 0;
  const rawQty = row.quantity ?? row.qty ?? row.quantity_change ?? newAvail - prevAvail;
  const rawType = row.type ?? row.change_type ?? 'ADJUSTMENT';
  const normalizedType =
    rawType === 'ADD_STOCK' ? 'ADD' : rawType === 'REDUCE_STOCK' ? 'REDUCE' : rawType;

  return {
    id: row.id,
    bookId: row.book_id,
    bookTitle: row.books?.title || 'Unknown Book',
    bookIsbn: row.books?.isbn || '—',
    type: normalizedType,
    quantityChange:
      normalizedType === 'REDUCE' || normalizedType === 'ISSUE'
        ? -Math.abs(rawQty)
        : rawQty,
    previousAvailable: prevAvail,
    newAvailable: newAvail,
    note: row.note ?? '',
    createdAt: row.created_at,
  };
};

export async function getInventoryOverview() {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('title', { ascending: true });

  if (error) throw new Error(error.message);

  const books = (data || []).map(mapBook);
  const totalTitles = books.length;
  const totalCopies = books.reduce((sum, b) => sum + b.totalCopies, 0);
  const availableCopies = books.reduce((sum, b) => sum + b.availableCopies, 0);
  const borrowedCopies = totalCopies - availableCopies;
  const lowStockBooks = books.filter((b) => b.availableCopies <= 2);

  return {
    totalTitles,
    totalCopies,
    availableCopies,
    borrowedCopies,
    lowStockBooks,
    books,
  };
}

export async function getInventoryHistory({
  bookId = 'ALL',
  type = 'ALL',
  page = 1,
  limit = 10,
} = {}) {
  const safePage = Math.max(1, page);
  const from = (safePage - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('inventory_history')
    .select('*, books(title)', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (bookId && bookId !== 'ALL') {
    query = query.eq('book_id', bookId);
  }

  if (type && type !== 'ALL') {
    query = query.eq('type', type);
  }

  const { data, count, error } = await query.range(from, to);
  if (error) throw new Error(error.message);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    items: (data || []).map(mapHistoryEntry),
    total,
    page: Math.min(safePage, totalPages),
    limit,
    totalPages,
  };
}

export async function adjustBookStock({ bookId, action, quantity, note }) {
  if (action === 'ADD') {
    return addBookStock(bookId, quantity, note);
  }
  if (action === 'REDUCE') {
    return reduceBookStock(bookId, quantity, note);
  }
  throw new Error('Invalid stock adjustment action');
}
