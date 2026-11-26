import { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeftRight,
  BookOpen,
  Boxes,
  RefreshCw,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../api/dashboard';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const statusBadge = (status) => {
  switch (status) {
    case 'RETURNED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'OVERDUE':
      return 'bg-red-50 text-crimson border-red-200';
    default:
      return 'bg-amber-50 text-amber-700 border-amber-200';
  }
};

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      toast.error(err.message || 'Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return <Spinner label="Loading dashboard overview..." />;
  }

  if (!stats) {
    return (
      <EmptyState
        title="Unable to load dashboard"
        description="Please retry to load the latest library metrics."
        action={
          <button
            type="button"
            onClick={fetchStats}
            className="px-4 py-2 rounded-xl bg-crimson text-white text-sm font-semibold"
          >
            Retry
          </button>
        }
      />
    );
  }

  const statCards = [
    {
      label: 'Total Books',
      value: stats.totalBooks,
      sub: `${stats.availableCopies} of ${stats.totalCopies} copies available`,
      icon: BookOpen,
      accent: 'bg-crimson-light text-crimson',
    },
    {
      label: 'Total Students',
      value: stats.totalMembers,
      sub: `${stats.activeMembers} active students`,
      icon: Users,
      accent: 'bg-sky-50 text-sky-600',
    },
    {
      label: 'Currently Issued',
      value: stats.booksIssued,
      sub: 'Active checkouts',
      icon: ArrowLeftRight,
      accent: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Overdue',
      value: stats.overdueBooks,
      sub: `${stats.lowStockCount} low-stock titles`,
      icon: AlertTriangle,
      accent: 'bg-red-50 text-crimson',
    },
  ];

  return (
    <div className="space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview of catalog totals, active memberships, issued books, and overdue alerts.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchStats}
          className="inline-flex items-center gap-2 self-start sm:self-auto px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:border-crimson hover:text-crimson transition-colors shadow-sm"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-2xl p-6 shadow-card border border-gray-100 hover:shadow-card-hover transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                  <p className="text-xs text-gray-500 mt-1.5">{card.sub}</p>
                </div>
                <div
                  className={`h-12 w-12 rounded-2xl flex items-center justify-center ${card.accent}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/books"
          className="bg-white rounded-2xl p-5 shadow-card border border-gray-100 hover:border-crimson/30 hover:-translate-y-0.5 transition-all flex items-center gap-4"
        >
          <div className="h-11 w-11 rounded-full bg-crimson-light flex items-center justify-center shrink-0">
            <BookOpen className="h-5 w-5 text-crimson" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Manage Books</p>
            <p className="text-xs text-gray-500">Catalog & stock</p>
          </div>
        </Link>

        <Link
          to="/members"
          className="bg-white rounded-2xl p-5 shadow-card border border-gray-100 hover:border-crimson/30 hover:-translate-y-0.5 transition-all flex items-center gap-4"
        >
          <div className="h-11 w-11 rounded-full bg-crimson-light flex items-center justify-center shrink-0">
            <Users className="h-5 w-5 text-crimson" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Manage Students</p>
            <p className="text-xs text-gray-500">Students & loans</p>
          </div>
        </Link>

        <Link
          to="/issue-return"
          className="bg-white rounded-2xl p-5 shadow-card border border-gray-100 hover:border-crimson/30 hover:-translate-y-0.5 transition-all flex items-center gap-4"
        >
          <div className="h-11 w-11 rounded-full bg-crimson-light flex items-center justify-center shrink-0">
            <ArrowLeftRight className="h-5 w-5 text-crimson" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Issue & Return</p>
            <p className="text-xs text-gray-500">14-day circulation</p>
          </div>
        </Link>

        <Link
          to="/inventory"
          className="bg-white rounded-2xl p-5 shadow-card border border-gray-100 hover:border-crimson/30 hover:-translate-y-0.5 transition-all flex items-center gap-4"
        >
          <div className="h-11 w-11 rounded-full bg-crimson-light flex items-center justify-center shrink-0">
            <Boxes className="h-5 w-5 text-crimson" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Track Inventory</p>
            <p className="text-xs text-gray-500">Stock & history</p>
          </div>
        </Link>
      </div>

      {/* Recent Issues Table */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Recent Issues</h2>
            <p className="text-xs text-gray-500 mt-0.5">Latest book issues and returns</p>
          </div>
          <Link
            to="/issue-return"
            className="text-sm font-semibold text-crimson hover:text-crimson-dark transition-colors"
          >
            Go to Issue & Return →
          </Link>
        </div>

        {stats.recentIssues.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No issues recorded yet"
              description="Issue a book from Issue & Return to see recent activity here."
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {stats.recentIssues.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-6 text-gray-900 font-medium">
                      {tx.member.name}
                      <span className="block text-xs font-mono text-gray-500 font-normal">
                        {tx.member.registerNumber || tx.member.email}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-medium text-gray-900">
                      {tx.book.title}
                      <span className="block text-xs text-gray-400 font-normal">
                        {tx.book.author}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-gray-600">{formatDate(tx.issueDate)}</td>
                    <td className="py-3.5 px-6 text-gray-600">{formatDate(tx.dueDate)}</td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBadge(
                          tx.status
                        )}`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
