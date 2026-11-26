import { supabase } from '../lib/supabase.js';

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const FINE_PER_DAY = 5;

const mapIssue = (row) => {
  const now = new Date();
  const dueDate = new Date(row.due_date);
  const issueDate = row.issue_date;
  const isOverdue = row.status === 'ISSUED' && dueDate < now;
  const reference = row.return_date ?? now;
  const overdueDays = Math.max(
    0,
    Math.floor((new Date(reference) - dueDate) / MS_PER_DAY)
  );
  const status = row.status === 'RETURNED' ? 'RETURNED' : isOverdue ? 'OVERDUE' : row.status;
  const fine = 0;
  const estimatedFine = status === 'RETURNED' ? fine : overdueDays * FINE_PER_DAY;

  return {
    id: row.id,
    bookId: row.book_id,
    memberId: row.member_id,
    issueDate,
    dueDate: row.due_date,
    returnDate: row.return_date ?? null,
    status,
    isOverdue,
    overdueDays,
    fine,
    estimatedFine,
    book: {
      id: row.book_id,
      title: row.books?.title || 'Unknown Book',
      isbn: row.books?.isbn || '—',
    },
    member: {
      id: row.member_id,
      name: row.members?.name || 'Unknown Student',
      email: row.members?.email || '—',
      registerNumber: row.members?.register_number ?? '',
      department: row.members?.department ?? '',
    },
  };
};

export async function getIssues({ status = 'ALL', search = '', memberId, bookId } = {}) {
  let query = supabase
    .from('issues')
    .select('*, books(title, isbn), members(name, email, register_number, department)')
    .order('issue_date', { ascending: false });

  if (status === 'ISSUED') {
    query = query.eq('status', 'ISSUED');
  } else if (status === 'RETURNED') {
    query = query.eq('status', 'RETURNED');
  } else if (status === 'OVERDUE') {
    query = query.eq('status', 'ISSUED').lt('due_date', new Date().toISOString());
  }

  if (memberId) query = query.eq('member_id', memberId);
  if (bookId) query = query.eq('book_id', bookId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  let mapped = (data || []).map(mapIssue);

  const q = search.trim().toLowerCase();
  if (q) {
    mapped = mapped.filter(
      (item) =>
        item.book.title.toLowerCase().includes(q) ||
        item.book.isbn.toLowerCase().includes(q) ||
        item.member.name.toLowerCase().includes(q) ||
        item.member.email.toLowerCase().includes(q)
    );
  }

  return mapped;
}

export async function issueBook({ bookId, memberId }) {
  const { data, error } = await supabase.rpc('issue_book', {
    p_book_id: bookId,
    p_member_id: memberId,
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function returnBook(issueId) {
  const { data, error } = await supabase.rpc('return_book', {
    p_issue_id: issueId,
  });

  if (error) throw new Error(error.message);
  return data;
}
