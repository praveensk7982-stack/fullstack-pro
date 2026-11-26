import { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  BookCopy,
  Boxes,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  History,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getInventoryHistory, getInventoryOverview } from '../api/inventory';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';

const formatDateTime = (value) =>
  new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const typeBadgeClass = (type) => {
  switch (type) {
    case 'ADD':
    case 'RETURN':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'REDUCE':
    case 'ISSUE':
      return 'bg-red-50 text-crimson border-red-200';
    case 'INITIAL':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export default function InventoryPage() {
  const [overview, setOverview] = useState(null);
  const [historyData, setHistoryData] = useState({
    items: [],
    total: 0,
    page: 1,
    totalPages: 1,
  });
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [bookFilter, setBookFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [invOverview, invHistory] = await Promise.all([
        getInventoryOverview(),
        getInventoryHistory({
          type: typeFilter,
          bookId: bookFilter,
          page,
          limit: 8,
        }),
      ]);
      setOverview(invOverview);
      setHistoryData(invHistory);
    } catch (err) {
      toast.error(err.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, [typeFilter, bookFilter, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading && !overview) {
    return <Spinner label="Loading inventory history..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Inventory & Stock History
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Full audit log of every stock addition, reduction, book issue, and return.
        </p>
      </div>

      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Total Titles</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {overview.totalTitles}
              </p>
            </div>
            <div className="h-11 w-11 rounded-full bg-crimson-light flex items-center justify-center">
              <Boxes className="h-5 w-5 text-crimson" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Total Copies</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {overview.totalCopies}
              </p>
            </div>
            <div className="h-11 w-11 rounded-full bg-sky-50 flex items-center justify-center">
              <BookCopy className="h-5 w-5 text-sky-600" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Available</p>
              <p className="text-2xl font-bold text-emerald-700 mt-1">
                {overview.availableCopies}
              </p>
            </div>
            <div className="h-11 w-11 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">
                Low Stock Alerts
              </p>
              <p className="text-2xl font-bold text-crimson mt-1">
                {overview.lowStockBooks.length}
              </p>
            </div>
            <div className="h-11 w-11 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-crimson" />
            </div>
          </div>
        </div>
      )}

      {/* Full Inventory History Table */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-crimson-light flex items-center justify-center shrink-0">
              <History className="h-5 w-5 text-crimson" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Inventory History</h2>
              <p className="text-xs text-gray-500">
                Showing {historyData.total} stock change events
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={bookFilter}
              onChange={(e) => {
                setBookFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by book"
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-crimson/20 focus:border-crimson min-w-[200px]"
            >
              <option value="ALL">All Books</option>
              {(overview?.books || []).map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title}
                </option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by type"
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-crimson/20 focus:border-crimson min-w-[160px]"
            >
              <option value="ALL">All Types</option>
              <option value="ADD">ADD</option>
              <option value="REDUCE">REDUCE</option>
              <option value="ISSUE">ISSUE</option>
              <option value="RETURN">RETURN</option>
              <option value="INITIAL">INITIAL</option>
            </select>
          </div>
        </div>

        {loading ? (
          <Spinner label="Loading inventory history..." />
        ) : historyData.items.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={History}
              title="No matching history entries"
              description="Try changing the book or event type filter."
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-100">
                    <th className="py-3.5 px-6">Date</th>
                    <th className="py-3.5 px-6">Book</th>
                    <th className="py-3.5 px-6">Type</th>
                    <th className="py-3.5 px-6">Quantity</th>
                    <th className="py-3.5 px-6">Available Stock</th>
                    <th className="py-3.5 px-6">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {historyData.items.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-6 text-xs text-gray-500 whitespace-nowrap">
                        {formatDateTime(entry.createdAt)}
                      </td>
                      <td className="py-3.5 px-6">
                        <p className="font-semibold text-gray-900">{entry.bookTitle}</p>
                        <p className="text-xs text-gray-400">{entry.bookIsbn}</p>
                      </td>
                      <td className="py-3.5 px-6">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${typeBadgeClass(
                            entry.type
                          )}`}
                        >
                          {entry.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 font-bold">
                        <span
                          className={
                            entry.quantityChange >= 0 ? 'text-emerald-700' : 'text-crimson'
                          }
                        >
                          {entry.quantityChange >= 0
                            ? `+${entry.quantityChange}`
                            : entry.quantityChange}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-gray-700 whitespace-nowrap">
                        {entry.previousAvailable} → <strong>{entry.newAvailable}</strong>
                      </td>
                      <td className="py-3.5 px-6 text-gray-600">{entry.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
              <span>
                Page <strong className="text-gray-900">{historyData.page}</strong> of{' '}
                <strong className="text-gray-900">{historyData.totalPages}</strong> (
                {historyData.total} entries)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={historyData.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-crimson hover:text-crimson disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </button>
                <button
                  type="button"
                  disabled={historyData.page >= historyData.totalPages}
                  onClick={() =>
                    setPage((p) => Math.min(historyData.totalPages, p + 1))
                  }
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-crimson hover:text-crimson disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
