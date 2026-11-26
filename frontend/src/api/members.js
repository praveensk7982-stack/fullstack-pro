import { supabase } from '../lib/supabase.js';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const mapMember = (row, activeIssues = []) => {
  const now = new Date();
  const borrowedBooks = activeIssues.map((issue) => {
    const due = new Date(issue.due_date);
    const overdueDays = Math.max(0, Math.floor((now - due) / MS_PER_DAY));
    return {
      issueId: issue.id,
      bookId: issue.book_id,
      title: issue.books?.title || 'Unknown Book',
      isbn: issue.books?.isbn || '—',
      issueDate: issue.issue_date,
      dueDate: issue.due_date,
      status: overdueDays > 0 ? 'OVERDUE' : issue.status,
      overdueDays,
    };
  });

  return {
    id: row.id,
    name: row.name,
    registerNumber: row.register_number ?? '',
    department: row.department ?? '',
    email: row.email,
    phone: row.phone ?? '',
    status: row.status ?? 'ACTIVE',
    joinedAt: row.created_at,
    createdAt: row.created_at,
    borrowedBooks,
    borrowedCount: borrowedBooks.length,
  };
};

const formatUniqueMemberError = (error) => {
  if (error.code === '23505') {
    const detail = `${error.message || ''} ${error.details || ''}`.toLowerCase();
    if (detail.includes('register_number')) {
      return new Error('Register number already exists');
    }
    if (detail.includes('email')) {
      return new Error('Email already exists');
    }
  }
  return new Error(error.message);
};

export async function getMembers({
  search = '',
  department = 'ALL',
  status = 'ALL',
  page = 1,
  limit = 8,
} = {}) {
  const q = search.trim();
  const safePage = Math.max(1, page);
  const from = (safePage - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('members')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (q) {
    query = query.or(
      `name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%,register_number.ilike.%${q}%,department.ilike.%${q}%`
    );
  }

  if (department && department !== 'ALL') {
    query = query.eq('department', department);
  }

  if (status && status !== 'ALL') {
    query = query.eq('status', status);
  }

  const { data, count, error } = await query.range(from, to);
  if (error) throw new Error(error.message);

  const memberRows = data || [];
  const memberIds = memberRows.map((m) => m.id);

  let activeIssuesByMember = new Map();
  if (memberIds.length > 0) {
    const { data: issuesData, error: issuesError } = await supabase
      .from('issues')
      .select('*, books(title, isbn)')
      .in('member_id', memberIds)
      .eq('status', 'ISSUED');

    if (issuesError) throw new Error(issuesError.message);

    for (const issue of issuesData || []) {
      const list = activeIssuesByMember.get(issue.member_id) || [];
      list.push(issue);
      activeIssuesByMember.set(issue.member_id, list);
    }
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    items: memberRows.map((row) => mapMember(row, activeIssuesByMember.get(row.id) || [])),
    total,
    page: Math.min(safePage, totalPages),
    limit,
    totalPages,
  };
}

export async function getMemberById(id) {
  const [{ data, error }, { data: issuesData, error: issuesError }] = await Promise.all([
    supabase.from('members').select('*').eq('id', id).single(),
    supabase
      .from('issues')
      .select('*, books(title, isbn)')
      .eq('member_id', id)
      .eq('status', 'ISSUED'),
  ]);

  if (error) throw new Error(error.message);
  if (issuesError) throw new Error(issuesError.message);
  if (!data) throw new Error('Student not found');

  return mapMember(data, issuesData || []);
}

export async function createMember(payload) {
  const { data, error } = await supabase
    .from('members')
    .insert({
      name: payload.name.trim(),
      register_number: payload.registerNumber.trim(),
      department: payload.department.trim(),
      email: payload.email.trim().toLowerCase(),
      phone: payload.phone.trim(),
      status: payload.status || 'ACTIVE',
    })
    .select('*')
    .single();

  if (error) {
    throw formatUniqueMemberError(error);
  }

  return mapMember(data, []);
}

export async function updateMember(id, payload) {
  const { data, error } = await supabase
    .from('members')
    .update({
      name: payload.name.trim(),
      register_number: payload.registerNumber.trim(),
      department: payload.department.trim(),
      email: payload.email.trim().toLowerCase(),
      phone: payload.phone.trim(),
      status: payload.status || 'ACTIVE',
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw formatUniqueMemberError(error);
  }

  return mapMember(data, []);
}

export async function deleteMember(id) {
  const { error } = await supabase.rpc('delete_member', { p_member_id: id });
  if (error) throw new Error(error.message);
  return true;
}
