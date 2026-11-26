

create table books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  isbn text not null unique,                       -- every book has a unique ISBN
  category text not null,
  total_stock int not null default 0 check (total_stock >= 0),
  available_stock int not null default 0 check (available_stock >= 0),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint available_lte_total check (available_stock <= total_stock)
);

create table members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text,
  department text not null,
  register_number text not null unique,            -- e.g. 961223202045
  status text not null default 'ACTIVE' check (status in ('ACTIVE','INACTIVE')),
  created_at timestamptz default now()
);

create table inventory_history (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references books(id) on delete cascade,
  type text not null check (type in ('INITIAL','ADD','REDUCE','ISSUE','RETURN')),
  quantity int not null,
  previous_available int not null,
  new_available int not null,
  previous_total int not null,
  new_total int not null,
  note text,
  created_at timestamptz default now()
);

create table issues (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references books(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  issue_date timestamptz not null default now(),
  due_date timestamptz not null,
  return_date timestamptz,
  status text not null default 'ISSUED' check (status in ('ISSUED','RETURNED'))
);

-- =====================================================================
-- 2. BUSINESS RULE FUNCTIONS (enforced in the database, not the frontend)
-- =====================================================================

-- Create a book (unique ISBN, no negative stock) and log INITIAL history
create or replace function create_book(p_title text, p_author text, p_isbn text, p_category text, p_total int)
returns books language plpgsql as $$
declare b books;
begin
  if p_total is null or p_total < 0 then raise exception 'Stock cannot be negative'; end if;
  if exists (select 1 from books where isbn = p_isbn) then raise exception 'ISBN already exists'; end if;
  insert into books(title, author, isbn, category, total_stock, available_stock)
  values (p_title, p_author, p_isbn, p_category, p_total, p_total) returning * into b;
  insert into inventory_history(book_id, type, quantity, previous_available, new_available, previous_total, new_total, note)
  values (b.id, 'INITIAL', p_total, 0, p_total, 0, p_total, 'Initial stock');
  return b;
end $$;

-- Stock addition (total and available both increase) + history
create or replace function add_stock(p_book_id uuid, p_qty int, p_note text default null)
returns books language plpgsql as $$
declare b books; pa int; pt int;
begin
  if p_qty is null or p_qty <= 0 then raise exception 'Quantity must be greater than 0'; end if;
  select * into b from books where id = p_book_id for update;
  if not found then raise exception 'Book not found'; end if;
  pa := b.available_stock; pt := b.total_stock;
  update books set total_stock = total_stock + p_qty, available_stock = available_stock + p_qty, updated_at = now()
  where id = p_book_id returning * into b;
  insert into inventory_history(book_id, type, quantity, previous_available, new_available, previous_total, new_total, note)
  values (p_book_id, 'ADD', p_qty, pa, b.available_stock, pt, b.total_stock, p_note);
  return b;
end $$;

-- Stock reduction (cannot go negative, cannot remove issued copies) + history
create or replace function reduce_stock(p_book_id uuid, p_qty int, p_note text default null)
returns books language plpgsql as $$
declare b books; pa int; pt int;
begin
  if p_qty is null or p_qty <= 0 then raise exception 'Quantity must be greater than 0'; end if;
  select * into b from books where id = p_book_id for update;
  if not found then raise exception 'Book not found'; end if;
  if p_qty > b.available_stock then
    raise exception 'Cannot reduce by %. Only % copies are available', p_qty, b.available_stock;
  end if;
  pa := b.available_stock; pt := b.total_stock;
  update books set total_stock = total_stock - p_qty, available_stock = available_stock - p_qty, updated_at = now()
  where id = p_book_id returning * into b;
  insert into inventory_history(book_id, type, quantity, previous_available, new_available, previous_total, new_total, note)
  values (p_book_id, 'REDUCE', p_qty, pa, b.available_stock, pt, b.total_stock, p_note);
  return b;
end $$;

-- Issue a book: active member, stock available, max 3 books, no duplicate, 14-day due date
create or replace function issue_book(p_book_id uuid, p_member_id uuid)
returns issues language plpgsql as $$
declare b books; m members; i issues; active_count int; pa int;
begin
  select * into m from members where id = p_member_id for update;
  if not found then raise exception 'Member not found'; end if;
  if m.status <> 'ACTIVE' then raise exception 'Member is not active'; end if;
  select * into b from books where id = p_book_id for update;
  if not found then raise exception 'Book not found'; end if;
  if b.available_stock <= 0 then raise exception 'Book is out of stock'; end if;
  if exists (select 1 from issues where member_id = p_member_id and book_id = p_book_id and status = 'ISSUED') then
    raise exception 'Member already has this book';
  end if;
  select count(*) into active_count from issues where member_id = p_member_id and status = 'ISSUED';
  if active_count >= 3 then raise exception 'Member already has 3 books issued (maximum allowed)'; end if;
  pa := b.available_stock;
  insert into issues(book_id, member_id, issue_date, due_date)
  values (p_book_id, p_member_id, now(), now() + interval '14 days') returning * into i;
  update books set available_stock = available_stock - 1, updated_at = now() where id = p_book_id;
  insert into inventory_history(book_id, type, quantity, previous_available, new_available, previous_total, new_total, note)
  values (p_book_id, 'ISSUE', 1, pa, pa - 1, b.total_stock, b.total_stock, 'Issued to ' || m.name);
  return i;
end $$;

-- Return a book: record must exist and be unreturned; available can never exceed total
create or replace function return_book(p_issue_id uuid)
returns issues language plpgsql as $$
declare i issues; b books; pa int;
begin
  select * into i from issues where id = p_issue_id for update;
  if not found then raise exception 'Issue record not found'; end if;
  if i.status <> 'ISSUED' then raise exception 'This book has already been returned'; end if;
  select * into b from books where id = i.book_id for update;
  if b.available_stock + 1 > b.total_stock then raise exception 'Available stock cannot exceed total stock'; end if;
  pa := b.available_stock;
  update issues set status = 'RETURNED', return_date = now() where id = p_issue_id returning * into i;
  update books set available_stock = available_stock + 1, updated_at = now() where id = b.id;
  insert into inventory_history(book_id, type, quantity, previous_available, new_available, previous_total, new_total, note)
  values (b.id, 'RETURN', 1, pa, pa + 1, b.total_stock, b.total_stock, 'Book returned');
  return i;
end $$;

-- Delete a book (blocked while copies are issued)
create or replace function delete_book(p_book_id uuid)
returns void language plpgsql as $$
begin
  if exists (select 1 from issues where book_id = p_book_id and status = 'ISSUED') then
    raise exception 'Cannot delete: this book has unreturned copies';
  end if;
  delete from books where id = p_book_id;
end $$;

-- Delete a member (blocked while they hold books)
create or replace function delete_member(p_member_id uuid)
returns void language plpgsql as $$
begin
  if exists (select 1 from issues where member_id = p_member_id and status = 'ISSUED') then
    raise exception 'Cannot delete: this member has unreturned books';
  end if;
  delete from members where id = p_member_id;
end $$;

-- =====================================================================
-- 3. PERMISSIONS (demo app has no login, so the anon key needs access)
-- =====================================================================

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;
grant execute on all functions in schema public to anon, authenticated;

alter default privileges in schema public grant select, insert, update, delete on tables to anon, authenticated;
alter default privileges in schema public grant execute on functions to anon, authenticated;

alter table books disable row level security;
alter table members disable row level security;
alter table inventory_history disable row level security;
alter table issues disable row level security;

-- =====================================================================
-- 4. SEED DATA (university subject books + engineering students)
-- =====================================================================

select create_book('Introduction to Algorithms', 'Thomas H. Cormen', '9780262033848', 'Computer Science', 5);
select create_book('Operating System Concepts', 'Abraham Silberschatz', '9781118063330', 'Computer Science', 4);
select create_book('Database System Concepts', 'Abraham Silberschatz', '9780078022159', 'Computer Science', 4);
select create_book('Computer Networks', 'Andrew S. Tanenbaum', '9780132126953', 'Computer Science', 3);
select create_book('Artificial Intelligence: A Modern Approach', 'Stuart Russell', '9780136042594', 'Computer Science', 3);
select create_book('Software Engineering', 'Roger S. Pressman', '9780078022128', 'Computer Science', 3);
select create_book('Introduction to the Theory of Computation', 'Michael Sipser', '9781133187790', 'Computer Science', 2);
select create_book('Discrete Mathematics and Its Applications', 'Kenneth H. Rosen', '9780073383095', 'Mathematics', 4);
select create_book('Higher Engineering Mathematics', 'B.S. Grewal', '9788174091955', 'Mathematics', 5);
select create_book('Digital Design', 'M. Morris Mano', '9780132774208', 'Electronics', 3);
select create_book('Signals and Systems', 'Alan V. Oppenheim', '9780138147570', 'Electronics', 2);
select create_book('Concepts of Physics', 'H.C. Verma', '9788177091878', 'Physics', 4);
select create_book('Engineering Chemistry', 'Jain and Jain', '9788187433177', 'Chemistry', 3);
select create_book('Engineering Thermodynamics', 'P.K. Nag', '9780070151314', 'Mechanical', 2);
select create_book('Principles of Management', 'Harold Koontz', '9780070075344', 'Management', 1);

insert into members(name, email, phone, department, register_number) values
('Arun Kumar',      'arun@example.com',     '9876543210', 'Computer Science and Engineering',          '961223202001'),
('Divya Lakshmi',   'divya@example.com',    '9876543211', 'Information Technology',                    '961223202002'),
('Karthik Raja',    'karthik@example.com',  '9876543212', 'Mechanical Engineering',                    '961223202003'),
('Meena Sundaram',  'meena@example.com',    '9876543213', 'Electronics and Communication Engineering', '961223202004'),
('Vignesh S',       'vignesh@example.com',  '9876543214', 'Electrical and Electronics Engineering',    '961223202005'),
('Priya Dharshini', 'priya@example.com',    '9876543215', 'Civil Engineering',                         '961223202006'),
('Suresh Babu',     'suresh@example.com',   '9876543216', 'Computer Science and Engineering',          '961223202007'),
('Nandhini Devi',   'nandhini@example.com', '9876543217', 'Information Technology',                    '961223202008');

-- Sample issues: Arun holds 3 books (3-book limit demo)
select issue_book((select id from books where isbn='9780262033848'), (select id from members where email='arun@example.com'));
select issue_book((select id from books where isbn='9781118063330'), (select id from members where email='arun@example.com'));
select issue_book((select id from books where isbn='9780078022159'), (select id from members where email='arun@example.com'));
select issue_book((select id from books where isbn='9780132126953'), (select id from members where email='divya@example.com'));

-- One overdue issue (also leaves "Principles of Management" with 0 copies available)
select issue_book((select id from books where isbn='9780070075344'), (select id from members where email='karthik@example.com'));
update issues
set issue_date = now() - interval '20 days', due_date = now() - interval '6 days'
where book_id = (select id from books where isbn='9780070075344') and status = 'ISSUED';