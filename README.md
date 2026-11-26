# Library Management System

A full-stack Library Management System built with React (Vite), Tailwind CSS, Node.js, Express, TypeScript (strict mode), Prisma ORM, and JWT authentication.

## Features

- **Landing Page (`/`)**: Crimson red (`#C8102E`), white, and dark navy (`#111827`) theme with hero banner, feature cards, and wave footer.
- **Authentication (`/login`)**: JWT access token authentication with `bcrypt` password hashing and protected routes.
- **Dashboard (`/dashboard`)**: Live stats cards (total books, total members, books issued, overdue books), Recharts monthly issues vs returns bar chart, and recent transactions table.
- **Books Management (`/books`)**: Search, category filter, pagination, and add/edit/delete book modals.
- **Members Management (`/members`)**: Search and add/edit/delete member modals with status tracking.
- **Issue & Return (`/issue-return`)**: Issue available books to active members with due dates and process returns with automatic **₹5/day** overdue fine calculation.
- **Inventory & History (`/inventory`)**: Stock overview, low-stock alerts (`≤ 2` available copies), and full filterable transaction history.

---

## Folder Structure

```text
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── app.ts
│   │   └── index.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── public/images/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── .env.example
    ├── package.json
    └── tailwind.config.js
```

---

## Setup & Running Locally

### 1. Prerequisites
- Node.js v18+ (tested with Node v24)
- npm v9+

### 2. Backend Setup

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` (already pre-configured for SQLite local dev):

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET="library-management-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"
FINE_PER_DAY=5
```

> **Switching to PostgreSQL**: Update `provider = "postgresql"` in `backend/prisma/schema.prisma` and set `DATABASE_URL` in `backend/.env` to your PostgreSQL connection string.

Run Prisma migrations, generate the client, and seed the database:

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
```

Start the backend development server:

```bash
npm run dev
```

The API runs on `http://localhost:5000`.

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

Copy `.env.example` to `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the Vite dev server:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Default Seeded Accounts & Data

- **Admin Login**: `admin@library.com` / `Admin@123`
- **Librarian Login**: `librarian@library.com` / `Librarian@123`
- **Sample Data**: 15 books, 8 members, and 14 historical/active/overdue transactions.

---

## API Endpoints

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | Public | Authenticate user and return JWT |
| POST | `/api/auth/register` | Admin | Register a new Admin or Librarian |
| GET | `/api/auth/me` | Protected | Fetch current authenticated user |
| GET | `/api/dashboard/stats` | Protected | Dashboard metrics, chart & recent loans |
| GET/POST | `/api/books` | Protected | List (search/filter/page) & create books |
| GET/PUT/DELETE | `/api/books/:id` | Protected | Fetch, update, or delete a book |
| GET/POST | `/api/members` | Protected | List (search/filter) & register members |
| GET/PUT/DELETE | `/api/members/:id` | Protected | Fetch, update, or delete a member |
| GET | `/api/transactions` | Protected | List transaction history with filters |
| POST | `/api/transactions/issue` | Protected | Issue a book to an active member |
| POST | `/api/transactions/return` | Protected | Return a book & compute ₹5/day fine |
