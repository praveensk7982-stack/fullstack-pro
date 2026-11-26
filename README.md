# Library Management System

A modern, responsive university Library Management System built with **React (Vite)**, **Tailwind CSS**, and **Supabase (PostgreSQL + Postgres RPC functions)**. There is no separate Express server, no Prisma layer, and no login/authentication flow—the frontend connects directly to Supabase for data persistence and server-side business rule enforcement.

---

## 1. Tech Stack

- **Frontend**: React JS (Vite), React Router, Tailwind CSS, `lucide-react` icons, `react-hot-toast`
- **Backend / Database**: Supabase (PostgreSQL tables, constraints, and PL/pgSQL RPC functions via `@supabase/supabase-js`)

---

## 2. Prerequisites

- **Node.js 18+** and **npm**
- A free **[Supabase](https://supabase.com)** account

---

## 3. Setup Steps

1. **Create a Supabase Project**
   - Sign in to Supabase and create a new project.
2. **Initialize the Database Schema**
   - Open the **SQL Editor** in your Supabase dashboard.
   - Paste and run the full `schema.sql` from the repository root (it creates the tables, business-rule Postgres functions, `anon` permissions, and sample seed data).
   - **Important**: Run `schema.sql` on a fresh Supabase project only.
3. **Get Your API Credentials**
   - Go to **Project Settings > API Keys** in Supabase and copy your **Project URL** and **publishable (or `anon`) key**.
4. **Configure Frontend Environment Variables**
   ```bash
   cd frontend
   cp .env.example .env
   ```
   Fill in `frontend/.env`:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_or_publishable_key
   ```
5. **Install Dependencies & Run**
   ```bash
   npm install
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 4. Features

- **Landing Page (`/`)**: Crimson red (`#C8102E`), white, and dark navy (`#111827`) theme with hero banner, feature overview cards, and wave footer.
- **Dashboard (`/dashboard`)**: 4 summary cards (**Total Books**, **Total Students**, **Currently Issued**, **Overdue**), quick-navigation shortcuts, and the **5 most recent issues** table showing student name and register number.
- **Books (`/books`)**: Catalog table (`Title`, `Author`, `ISBN`, `Category`, `Total`, `Available`) with search, category filter, sorting (`title`, `author`, `available`, `newest` in `asc`/`desc`), pagination, Add/Edit modal, Delete confirmation, per-row **Add Stock** / **Reduce Stock** modal (quantity + note), and per-book **History** modal.
- **Students (`/members`)**: University student directory (`Student`, `Register No`, `Department`, `Phone`, `Status`, `Actions`) with search by name/register number/department/email/phone, department filter dropdown, pagination, Add/Edit modal (12-digit numeric register number validation and 6 engineering departments), Delete confirmation, and per-student **Borrowed Books** modal (`N/3`).
- **Issue & Return (`/issue-return`)**: Searchable student selector (`Name - RegisterNumber (Department)`), book selector, automatic read-only **Today + 14 Days** due date preview, active issues table with **Overdue** badges, and one-click **Return** action.
- **Inventory (`/inventory`)**: Stock overview cards, low-stock alerts (`≤ 2` available), and full paginated **Inventory History** table (`Date`, `Book`, `Type`, `Quantity`, `Available Stock` previous → new, `Note`) filterable by book and event type (`ADD`, `REDUCE`, `ISSUE`, `RETURN`, `INITIAL`).

---

## 5. Business Rules & Enforcement

All core business rules live in PostgreSQL constraints and Postgres RPC functions (`supabase.rpc(...)`):

| Business Rule | Where Enforced |
| --- | --- |
| **Unique ISBN** | `UNIQUE` constraint on `books.isbn` + `create_book` RPC (and `23505` handling on book edit) |
| **Unique Student Register Number & Email** | `UNIQUE` constraints on `members.register_number` and `members.email` (plus 12-digit validation on the student form) |
| **Non-negative stock & `available_stock <= total_stock`** | `CHECK` constraints on `books` + `create_book`, `add_stock`, and `reduce_stock` RPCs |
| **Max 3 borrowed books per student** | `issue_book` RPC |
| **14-day due date on issue** | `issue_book` RPC (`issue_date + 14 days`) |
| **Duplicate active issue prevention** | `issue_book` RPC prevents issuing the same book twice to the same student while unreturned |
| **Atomic stock updates on issue/return** | `issue_book` and `return_book` RPCs |
| **Audit log for every stock change** | `create_book`, `add_stock`, `reduce_stock`, `issue_book`, and `return_book` RPCs insert into `inventory_history` |
| **Safe deletions** | `delete_book` and `delete_member` RPCs reject deletion when unreturned issues exist |

---

## 6. How to Test the Business Rules

1. **Duplicate ISBN**: On `/books`, click **Add New Book** and enter an existing ISBN (e.g., `9780132350884`) → fails with *"ISBN already exists"*.
2. **Over-reduce Stock**: On `/books`, click **Reduce** on a book and enter a quantity greater than its **Available** count → fails with an insufficient-stock error.
3. **Student Register Number Validation & Uniqueness**: On `/members`, try adding a student with an 11-digit register number → blocked by inline validation; try an existing 12-digit register number → fails with *"Register number already exists"*.
4. **Max 3 Books per Student**: On `/issue-return`, try issuing a 4th book to a student who already has `3/3` borrowed (e.g., Arun Kumar) → fails with the 3-book limit error.
5. **Out-of-Stock Issue**: On `/issue-return`, select a book marked `(Out of Stock)` and click **Issue** → fails with *"Book is out of stock"*.
6. **Issue, Return & History**: Issue an available book to a student with fewer than 3 books, confirm `available_stock` decreases by 1 and an `ISSUE` entry appears in `/inventory`, then click **Return** and confirm stock restores and a `RETURN` entry is logged.
7. **Delete Protection**: Attempt to delete a book or student that currently has an active unreturned issue → fails with a clear error toast.

---

## 7. Known Limitations

- **No Authentication**: There is no login, role-based access control, or user session management; anyone with access to the app can manage books, students, and issues.
- **RLS Disabled / Open `anon` Access**: Row Level Security is disabled (or granted openly to `anon`) for demo purposes—enable authentication and strict RLS policies before deploying to production.
- **Repository Notes**: `schema.sql` is expected to be run manually in the Supabase SQL Editor and is not committed at the repository root in this workspace. Also, if an empty `backend/` directory remains on Windows due to a locked OS handle, it contains no files and is unused.
