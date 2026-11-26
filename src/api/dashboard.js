import { supabase } from '../lib/supabase.js';

export async function getDashboardStats() {
  const nowIso = new Date().toISOString();

  const [
    booksCountRes,
    membersCountRes,
    issuedCountRes,
    overdueCountRes,
    booksStockRes,
    recentRes,
  ] = await Promise.all([
    supabase.from('books').select('*', { count: 'exact', head: true }),
    supabase.from('members').select('*', { count: 'exact', head: true }),
    supabase
      .from('issues')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ISSUED'),
    supabase
      .from('issues')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ISSUED')
      .lt('due_date', nowIso),
    supabase.from('books').select('total_stock, available_stock'),
    supabase
      .from('issues')
      .select('*, books(title, isbn), members(name, email, register_number, department)')
      .order('issue_date', { ascending: false })
      .limit(5),
  ]);

  if (booksCountRes.error) throw new Error(booksCountRes.error.message);
  if (membersCountRes.error) throw new Error(membersCountRes.error.message);
  if (issuedCountRes.error) throw new Error(issuedCountRes.error.message);
  if (overdueCountRes.error) throw new Error(overdueCountRes.error.message);
  if (booksStockRes.error) throw new Error(booksStockRes.error.message);
  if (recentRes.error) throw new Error(recentRes.error.message);

  const stockRows = booksStockRes.data || [];
  const totalCopies = stockRows.reduce((sum, r) => sum + (r.total_stock ?? 0), 0);
  const availableCopies = stockRows.reduce((sum, r) => sum + (r.available_stock ?? 0), 0);
  const lowStockCount = stockRows.filter((r) => (r.available_stock ?? 0) <= 2).length;

  const now = new Date();
  const recentIssues = (recentRes.data || []).map((row) => {
    const isOverdue = row.status === 'ISSUED' && new Date(row.due_date) < now;
    return {
      id: row.id,
      bookId: row.book_id,
      memberId: row.member_id,
      issueDate: row.issue_date,
      dueDate: row.due_date,
      status: row.status === 'RETURNED' ? 'RETURNED' : isOverdue ? 'OVERDUE' : row.status,
      book: {
        title: row.books?.title || 'Unknown Book',
        author: row.books?.author || '',
        isbn: row.books?.isbn || '',
      },
      member: {
        name: row.members?.name || 'Unknown Student',
        email: row.members?.email || '',
        registerNumber: row.members?.register_number ?? '',
        department: row.members?.department ?? '',
      },
    };
  });

  return {
    totalBooks: booksCountRes.count ?? 0,
    totalCopies,
    availableCopies,
    totalMembers: membersCountRes.count ?? 0,
    activeMembers: membersCountRes.count ?? 0,
    booksIssued: issuedCountRes.count ?? 0,
    overdueBooks: overdueCountRes.count ?? 0,
    lowStockCount,
    recentIssues,
  };
}
