import { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeftRight,
  Calendar,
  CheckCircle2,
  Clock,
  Search,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getBooks } from '../api/books';
import { getIssues, issueBook, returnBook } from '../api/issues';
import { getMembers } from '../api/members';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';

const computeAutoDueDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d;
};

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export default function IssueReturnPage() {
  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentQuery, setStudentQuery] = useState('');
  const [activeLoans, setActiveLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('');
  const [issuing, setIssuing] = useState(false);
  const [returningId, setReturningId] = useState(null);

  const autoDueDate = computeAutoDueDate();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [booksData, membersData, allIssues] = await Promise.all([
        getBooks({ limit: 100 }),
        getMembers({ status: 'ACTIVE', limit: 100 }),
        getIssues(),
      ]);

      setBooks(booksData.items);
      setStudents(membersData.items);
      setActiveLoans(
        allIssues
          .filter((i) => i.status !== 'RETURNED')
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      );
    } catch (err) {
      toast.error(err.message || 'Failed to load circulation data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredStudents = students.filter((s) => {
    const q = studentQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      (s.registerNumber || '').toLowerCase().includes(q)
    );
  });

  const handleIssue = async (e) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedBookId) {
      toast.error('Please select both a student and a book');
      return;
    }

    setIssuing(true);
    try {
      await issueBook({
        memberId: selectedStudentId,
        bookId: selectedBookId,
      });
      toast.success('Book issued successfully (14-day due date)');
      setSelectedBookId('');
      setSelectedStudentId('');
      setStudentQuery('');
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Unable to issue book');
    } finally {
      setIssuing(false);
    }
  };

  const handleReturn = async (loan) => {
    setReturningId(loan.id);
    try {
      const returned = await returnBook(loan.id);
      if (returned?.fine > 0) {
        toast.success(`Book returned! Overdue fine: ₹${returned.fine}`);
      } else {
        toast.success('Book returned successfully');
      }
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Unable to return book');
    } finally {
      setReturningId(null);
    }
  };

  if (loading) {
    return <Spinner label="Loading issue & return desk..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Issue & Return</h1>
        <p className="text-sm text-gray-500 mt-1">
          Issue books to active students (max 3 per student, automatic 14-day due date) and process returns.
        </p>
      </div>

      {/* Issue Form */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-full bg-crimson-light flex items-center justify-center">
            <ArrowLeftRight className="h-5 w-5 text-crimson" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Issue a Book</h2>
            <p className="text-xs text-gray-500">
              Search and select a student and a book. Due date is automatically set to 14 days from today.
            </p>
          </div>
        </div>

        <form onSubmit={handleIssue} className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Student *
            </label>
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={studentQuery}
                onChange={(e) => setStudentQuery(e.target.value)}
                placeholder="Search by name or register no..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-crimson/20 focus:border-crimson"
              />
            </div>
            <select
              required
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              aria-label="Select Student"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-crimson/20 focus:border-crimson"
            >
              <option value="">-- Select Student ({filteredStudents.length}) --</option>
              {filteredStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} - {s.registerNumber || 'N/A'} ({s.department || '—'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Book *
            </label>
            <select
              required
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-crimson/20 focus:border-crimson"
            >
              <option value="">-- Select Book --</option>
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} ({b.availableCopies === 0 ? 'Out of Stock' : `${b.availableCopies} available`})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Due Date (Today + 14 Days)
            </label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-700">
              <Calendar className="h-4 w-4 text-crimson shrink-0" />
              <span>{formatDate(autoDueDate)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={issuing}
            className="w-full py-2.5 px-5 rounded-xl bg-crimson hover:bg-crimson-dark text-white text-sm font-semibold shadow-md shadow-crimson/20 transition-all disabled:opacity-60"
          >
            {issuing ? 'Issuing...' : 'Issue'}
          </button>
        </form>
      </div>

      {/* Active Issues Table */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Active Issues ({activeLoans.length})
            </h2>
            <p className="text-xs text-gray-500">
              Click Return when a student brings a book back to restore shelf availability.
            </p>
          </div>
        </div>

        {activeLoans.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={CheckCircle2}
              title="No active issues"
              description="All issued books have been returned."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-100">
                  <th className="py-3.5 px-6">Student</th>
                  <th className="py-3.5 px-6">Book</th>
                  <th className="py-3.5 px-6">Issue Date</th>
                  <th className="py-3.5 px-6">Due Date</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {activeLoans.map((loan) => {
                  const isOverdue = loan.status === 'OVERDUE' || loan.overdueDays > 0;
                  return (
                    <tr key={loan.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-6">
                        <p className="font-medium text-gray-900">{loan.member.name}</p>
                        <p className="text-xs font-mono text-gray-500">
                          {loan.member.registerNumber || loan.member.email}
                        </p>
                      </td>
                      <td className="py-3.5 px-6">
                        <p className="font-semibold text-gray-900">{loan.book.title}</p>
                        <p className="text-xs text-gray-400">ISBN: {loan.book.isbn}</p>
                      </td>
                      <td className="py-3.5 px-6 text-gray-600">{formatDate(loan.issueDate)}</td>
                      <td className="py-3.5 px-6 text-gray-600">{formatDate(loan.dueDate)}</td>
                      <td className="py-3.5 px-6">
                        {isOverdue ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-crimson border border-red-200">
                            <Clock className="h-3 w-3" />
                            Overdue ({loan.overdueDays}d)
                          </span>
                        ) : (
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Issued
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <button
                          type="button"
                          disabled={returningId === loan.id}
                          onClick={() => handleReturn(loan)}
                          className="px-4 py-2 rounded-xl bg-navy hover:bg-crimson text-white text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          {returningId === loan.id ? 'Returning...' : 'Return'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
