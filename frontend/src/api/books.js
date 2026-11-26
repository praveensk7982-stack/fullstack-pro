import { supabase } from '../lib/supabase.js';

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
  coverUrl: row.cover_url ?? '',
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
    type: normalizedType,
    quantityChange:
      normalizedType === 'REDUCE' || normalizedType === 'ISSUE'
        ? -Math.abs(rawQty)
        : rawQty,
    previousAvailable: prevAvail,
    newAvailable: newAvail,
    newTotal: row.new_total ?? newAvail,
    note: row.note ?? '',
    createdAt: row.created_at,
  };
};

export async function getBooks({
  search = '',
  category = 'ALL',
  sortBy = 'newest',
  sortOrder = 'desc',
  page = 1,
  limit = 8,
} = {}) {
  const q = search.trim();
  const ascending = sortOrder === 'asc';
  const safePage = Math.max(1, page);
  const from = (safePage - 1) * limit;
  const to = from + limit - 1;

  let query = supabase.from('books').select('*', { count: 'exact' });

  if (q) {
    query = query.or(`title.ilike.%${q}%,author.ilike.%${q}%,isbn.ilike.%${q}%`);
  }

  if (category && category !== 'ALL') {
    query = query.eq('category', category);
  }

  switch (sortBy) {
    case 'title':
      query = query.order('title', { ascending });
      break;
    case 'author':
      query = query.order('author', { ascending });
      break;
    case 'available':
      query = query.order('available_stock', { ascending });
      break;
    case 'newest':
    default:
      query = query.order('created_at', { ascending });
      break;
  }

  query = query.range(from, to);

  const [{ data, count, error }, { data: categoryRows, error: catError }] = await Promise.all([
    query,
    supabase.from('books').select('category'),
  ]);

  if (error) throw new Error(error.message);
  if (catError) throw new Error(catError.message);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const categories = Array.from(
    new Set((categoryRows || []).map((row) => row.category).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  return {
    items: (data || []).map(mapBook),
    total,
    page: Math.min(safePage, totalPages),
    limit,
    totalPages,
    categories,
  };
}

export async function getBookById(id) {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('Book not found');
  return mapBook(data);
}

export async function createBook(payload) {
  const { data, error } = await supabase.rpc('create_book', {
    p_title: payload.title.trim(),
    p_author: payload.author.trim(),
    p_isbn: payload.isbn.trim(),
    p_category: payload.category.trim(),
    p_total: Number(payload.totalCopies ?? payload.totalStock ?? 1),
  });

  if (error) {
    if (error.code === '23505') throw new Error('ISBN already exists');
    throw new Error(error.message);
  }

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return mapBook(data);
  }
  return data;
}

export async function updateBook(id, payload) {
  const { data, error } = await supabase
    .from('books')
    .update({
      title: payload.title.trim(),
      author: payload.author.trim(),
      isbn: payload.isbn.trim(),
      category: payload.category.trim(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') throw new Error('ISBN already exists');
    throw new Error(error.message);
  }

  return mapBook(data);
}

export async function deleteBook(id) {
  const { error } = await supabase.rpc('delete_book', { p_book_id: id });
  if (error) throw new Error(error.message);
  return true;
}

export async function addBookStock(bookId, quantity, note) {
  const { data, error } = await supabase.rpc('add_stock', {
    p_book_id: bookId,
    p_qty: Number(quantity),
    p_note: note?.trim() || '',
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function reduceBookStock(bookId, quantity, note) {
  const { data, error } = await supabase.rpc('reduce_stock', {
    p_book_id: bookId,
    p_qty: Number(quantity),
    p_note: note?.trim() || '',
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function getBookHistory(bookId) {
  const [book, historyRes] = await Promise.all([
    getBookById(bookId),
    supabase
      .from('inventory_history')
      .select('*')
      .eq('book_id', bookId)
      .order('created_at', { ascending: false }),
  ]);

  if (historyRes.error) throw new Error(historyRes.error.message);

  return {
    book,
    history: (historyRes.data || []).map(mapHistoryEntry),
  };
}
