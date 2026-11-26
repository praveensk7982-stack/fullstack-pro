import { useCallback, useEffect, useState } from 'react';
import {
  ArrowUpDown,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Edit3,
  History,
  Minus,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  addBookStock,
  createBook,
  deleteBook,
  getBookHistory,
  getBooks,
  reduceBookStock,
  updateBook,
} from '../api/books';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';

const emptyForm = {
  title: '',
  author: '',
  isbn: '',
  category: '',
  totalCopies: 1,
  availableCopies: 1,
  coverUrl: '',
};

const historyBadgeClass = (type) => {
  switch (type) {
    case 'ADD_STOCK':
    case 'RETURN':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'REDUCE_STOCK':
    case 'ISSUE':
      return 'bg-red-50 text-crimson border-red-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [stockModal, setStockModal] = useState(null); // { book, action: 'ADD' | 'REDUCE' }
  const [stockQty, setStockQty] = useState(1);
  const [stockNote, setStockNote] = useState('');
  const [adjustingStock, setAdjustingStock] = useState(false);

  const [historyModal, setHistoryModal] = useState(null); // { book, history }
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBooks({
        search,
        category,
        sortBy,
        sortOrder,
        page,
        limit: 6,
      });
      setBooks(data.items);
      setTotalPages(data.totalPages);
      setTotal(data.total);
      setCategories(data.categories);
    } catch (err) {
      toast.error(err.message || 'Failed to load books');
    } finally {
      setLoading(false);
    }
  }, [search, category, sortBy, sortOrder, page]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchBooks();
    }, 150);
    return () => window.clearTimeout(timer);
  }, [fetchBooks]);

  const validateForm = () => {
    const errors = {};
    if (!form.title.trim()) errors.title = 'Title is required';
    if (!form.author.trim()) errors.author = 'Author is required';
    if (!form.isbn.trim() || form.isbn.trim().length < 5) {
      errors.isbn = 'ISBN must be at least 5 characters';
    }
    if (!form.category.trim()) errors.category = 'Category is required';

    const totalNum = Number(form.totalCopies);
    const availNum = Number(form.availableCopies);
    if (!Number.isInteger(totalNum) || totalNum < 0) {
      errors.totalCopies = 'Total copies must be 0 or more';
    }
    if (!Number.isInteger(availNum) || availNum < 0) {
      errors.availableCopies = 'Available copies cannot be negative';
    } else if (availNum > totalNum) {
      errors.availableCopies = 'Available copies cannot exceed total copies';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openAddModal = () => {
    setEditingBook(null);
    setForm(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    setForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
      coverUrl: book.coverUrl || '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleSaveBook = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        author: form.author.trim(),
        isbn: form.isbn.trim(),
        category: form.category.trim(),
        totalCopies: Number(form.totalCopies),
        availableCopies: Number(form.availableCopies),
        coverUrl: form.coverUrl.trim(),
      };

      if (editingBook) {
        await updateBook(editingBook.id, payload);
        toast.success('Book updated successfully');
      } else {
        await createBook(payload);
        toast.success('Book added successfully');
      }

      setModalOpen(false);
      fetchBooks();
    } catch (err) {
      toast.error(err.message || 'Unable to save book');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteBook(deleteTarget.id);
      toast.success(`Deleted "${deleteTarget.title}"`);
      setDeleteTarget(null);
      fetchBooks();
    } catch (err) {
      toast.error(err.message || 'Unable to delete book');
    } finally {
      setDeleting(false);
    }
  };

  const openStockModal = (book, action) => {
    setStockModal({ book, action });
    setStockQty(1);
    setStockNote('');
  };

  const handleStockAdjust = async (e) => {
    e.preventDefault();
    if (!stockModal) return;

    setAdjustingStock(true);
    try {
      if (stockModal.action === 'ADD') {
        await addBookStock(stockModal.book.id, Number(stockQty), stockNote);
        toast.success(`Added ${stockQty} copy(ies) to "${stockModal.book.title}"`);
      } else {
        await reduceBookStock(stockModal.book.id, Number(stockQty), stockNote);
        toast.success(`Reduced ${stockQty} copy(ies) from "${stockModal.book.title}"`);
      }
      setStockModal(null);
      fetchBooks();
    } catch (err) {
      toast.error(err.message || 'Stock adjustment failed');
    } finally {
      setAdjustingStock(false);
    }
  };

  const openHistoryModal = async (book) => {
    setHistoryModal({ book, history: [] });
    setLoadingHistory(true);
    try {
      const data = await getBookHistory(book.id);
      setHistoryModal(data);
    } catch (err) {
      toast.error(err.message || 'Failed to load inventory history');
      setHistoryModal(null);
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Books Catalog</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage {total} book titles, adjust shelf stock, and inspect inventory history.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 self-start sm:self-auto px-5 py-2.5 rounded-xl bg-crimson hover:bg-crimson-dark text-white text-sm font-semibold shadow-md shadow-crimson/20 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Book</span>
        </button>
      </div>

      {/* Search, Category Filter & Sort Controls */}
      <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by title, author, ISBN, or category..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-crimson/20 focus:border-crimson"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-3">
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by category"
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-crimson/20 focus:border-crimson min-w-[170px]"
          >
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            aria-label="Sort books by"
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-crimson/20 focus:border-crimson"
          >
            <option value="newest">Sort: Newest</option>
            <option value="title">Sort: Title</option>
            <option value="author">Sort: Author</option>
            <option value="available">Sort: Available Stock</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
              setPage(1);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:border-crimson hover:text-crimson text-sm font-medium text-gray-700 transition-colors"
            title="Toggle sort direction"
          >
            <ArrowUpDown className="h-4 w-4" />
            <span className="uppercase text-xs font-bold">{sortOrder}</span>
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Spinner label="Loading books catalog..." />
      ) : books.length === 0 ? (
        <EmptyState
          title="No books found"
          description="Try clearing your search or category filter, or add a new book."
          action={
            <button
              type="button"
              onClick={openAddModal}
              className="px-4 py-2 rounded-xl bg-crimson text-white text-sm font-semibold"
            >
              Add New Book
            </button>
          }
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-100">
                  <th className="py-3.5 px-5">Title</th>
                  <th className="py-3.5 px-5">Author</th>
                  <th className="py-3.5 px-5">ISBN</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5 text-center">Total</th>
                  <th className="py-3.5 px-5 text-center">Available</th>
                  <th className="py-3.5 px-5 text-right">Stock & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {books.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-8 rounded-lg bg-crimson-light flex items-center justify-center shrink-0">
                          <BookOpen className="h-4 w-4 text-crimson" />
                        </div>
                        <span className="font-semibold text-gray-900">{book.title}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-gray-600">{book.author}</td>
                    <td className="py-3.5 px-5 font-mono text-xs text-gray-600">
                      {book.isbn}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {book.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-center font-semibold text-gray-800">
                      {book.totalCopies}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          book.availableCopies === 0
                            ? 'bg-red-50 text-crimson'
                            : book.availableCopies <= 2
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {book.availableCopies}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => openStockModal(book, 'ADD')}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                          title="Add Stock"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Add</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openStockModal(book, 'REDUCE')}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                          title="Reduce Stock"
                        >
                          <Minus className="h-3.5 w-3.5" />
                          <span>Reduce</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openHistoryModal(book)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-navy hover:text-white transition-colors"
                          title="View Inventory History"
                        >
                          <History className="h-3.5 w-3.5" />
                          <span>History</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(book)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-navy hover:bg-gray-100 transition-colors"
                          title="Edit Book"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(book)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-crimson hover:bg-crimson-light transition-colors"
                          title="Delete Book"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
            <span>
              Page <strong className="text-gray-900">{page}</strong> of{' '}
              <strong className="text-gray-900">{totalPages}</strong> ({total} books)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-crimson hover:text-crimson disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-crimson hover:text-crimson disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Book Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingBook ? 'Edit Book' : 'Add New Book'}
      >
        <form onSubmit={handleSaveBook} noValidate className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Clean Architecture"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-crimson/20 focus:border-crimson"
            />
            {formErrors.title && (
              <p className="text-xs text-crimson mt-1">{formErrors.title}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Author *
              </label>
              <input
                type="text"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                placeholder="e.g., Robert C. Martin"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-crimson/20 focus:border-crimson"
              />
              {formErrors.author && (
                <p className="text-xs text-crimson mt-1">{formErrors.author}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ISBN *
              </label>
              <input
                type="text"
                value={form.isbn}
                onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                placeholder="9780134494166"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-crimson/20 focus:border-crimson"
              />
              {formErrors.isbn && (
                <p className="text-xs text-crimson mt-1">{formErrors.isbn}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Computer Science"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-crimson/20 focus:border-crimson"
              />
              {formErrors.category && (
                <p className="text-xs text-crimson mt-1">{formErrors.category}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Copies *
              </label>
              <input
                type="number"
                min={0}
                value={form.totalCopies}
                onChange={(e) => {
                  const nextTotal = Number(e.target.value);
                  setForm((prev) => ({
                    ...prev,
                    totalCopies: nextTotal,
                    availableCopies: editingBook
                      ? prev.availableCopies
                      : nextTotal,
                  }));
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-crimson/20 focus:border-crimson"
              />
              {formErrors.totalCopies && (
                <p className="text-xs text-crimson mt-1">{formErrors.totalCopies}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Available Copies *
              </label>
              <input
                type="number"
                min={0}
                value={form.availableCopies}
                onChange={(e) =>
                  setForm({ ...form, availableCopies: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-crimson/20 focus:border-crimson"
              />
              {formErrors.availableCopies && (
                <p className="text-xs text-crimson mt-1">{formErrors.availableCopies}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-crimson hover:bg-crimson-dark transition-colors disabled:opacity-60"
            >
              {saving ? 'Saving...' : editingBook ? 'Update Book' : 'Add Book'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add / Reduce Stock Modal */}
      <Modal
        isOpen={Boolean(stockModal)}
        onClose={() => setStockModal(null)}
        title={
          stockModal?.action === 'ADD'
            ? `Add Stock — ${stockModal?.book?.title}`
            : `Reduce Stock — ${stockModal?.book?.title}`
        }
        maxWidth="max-w-md"
      >
        <form onSubmit={handleStockAdjust} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-600 flex justify-between">
            <span>
              Current Total: <strong>{stockModal?.book?.totalCopies}</strong>
            </span>
            <span>
              Available: <strong>{stockModal?.book?.availableCopies}</strong>
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity *
            </label>
            <input
              type="number"
              min={1}
              required
              value={stockQty}
              onChange={(e) => setStockQty(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-crimson/20 focus:border-crimson"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note / Reason
            </label>
            <input
              type="text"
              value={stockNote}
              onChange={(e) => setStockNote(e.target.value)}
              placeholder={
                stockModal?.action === 'ADD'
                  ? 'e.g., New publisher shipment'
                  : 'e.g., Damaged copy withdrawn'
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-crimson/20 focus:border-crimson"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStockModal(null)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={adjustingStock}
              className={`px-5 py-2 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-60 ${
                stockModal?.action === 'ADD'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-crimson hover:bg-crimson-dark'
              }`}
            >
              {adjustingStock
                ? 'Updating...'
                : stockModal?.action === 'ADD'
                  ? 'Confirm Add Stock'
                  : 'Confirm Reduce Stock'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Book Inventory History Modal */}
      <Modal
        isOpen={Boolean(historyModal)}
        onClose={() => setHistoryModal(null)}
        title={`Inventory History — ${historyModal?.book?.title || ''}`}
        maxWidth="max-w-2xl"
      >
        {loadingHistory ? (
          <Spinner label="Loading stock history..." />
        ) : !historyModal?.history?.length ? (
          <EmptyState
            icon={History}
            title="No history recorded"
            description="Stock changes for this book will appear here."
          />
        ) : (
          <div className="space-y-3">
            {historyModal.history.map((entry) => (
              <div
                key={entry.id}
                className="p-4 rounded-xl border border-gray-100 bg-gray-50/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${historyBadgeClass(
                        entry.type
                      )}`}
                    >
                      {entry.type.replace('_', ' ')}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {entry.quantityChange >= 0
                        ? `+${entry.quantityChange}`
                        : entry.quantityChange}{' '}
                      copy(ies)
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{entry.note}</p>
                </div>

                <div className="text-left sm:text-right text-xs text-gray-500 shrink-0">
                  <p className="font-medium text-gray-700">
                    Available: {entry.previousAvailable} → {entry.newAvailable} (Total:{' '}
                    {entry.newTotal})
                  </p>
                  <p>
                    {new Date(entry.createdAt).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Book"
        message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
      />
    </div>
  );
}
