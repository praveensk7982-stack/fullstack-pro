import { useState } from 'react';
import {
  ArrowLeftRight,
  BookOpen,
  Boxes,
  Home,
  LayoutDashboard,
  Menu,
  Users,
  X,
} from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/books', label: 'Books', icon: BookOpen },
  { to: '/members', label: 'Students', icon: Users },
  { to: '/issue-return', label: 'Issue & Return', icon: ArrowLeftRight },
  { to: '/inventory', label: 'Inventory', icon: Boxes },
];

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderNavLinks = (onNavigate) => (
    <nav className="flex-1 px-3 py-5 space-y-1.5">
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-crimson text-white shadow-md shadow-crimson/25'
                : 'text-gray-300 hover:bg-white/10 hover:text-white'
            }`
          }
        >
          <Icon className="h-5 w-5 shrink-0" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-navy text-white shadow-xl z-30">
        <div className="h-16 px-5 flex items-center gap-3 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-crimson flex items-center justify-center shadow">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight block leading-none">
                Library
              </span>
              <span className="text-[11px] text-gray-400">Management System</span>
            </div>
          </Link>
        </div>

        {renderNavLinks(undefined)}

        <div className="p-4 border-t border-white/10">
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-200 bg-white/10 hover:bg-crimson hover:text-white transition-colors duration-200"
          >
            <Home className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-navy text-white transform transition-transform duration-200 lg:hidden flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 px-5 flex items-center justify-between border-b border-white/10">
          <Link
            to="/"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-2.5"
          >
            <div className="h-9 w-9 rounded-xl bg-crimson flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold">Library</span>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {renderNavLinks(() => setSidebarOpen(false))}
        <div className="p-4 border-t border-white/10">
          <Link
            to="/"
            onClick={() => setSidebarOpen(false)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-crimson hover:bg-crimson-dark transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <header className="h-16 bg-navy text-white lg:bg-white lg:text-gray-900 border-b border-gray-200 sticky top-0 z-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-gray-200 hover:bg-white/10"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="lg:hidden font-bold text-lg">Library</span>
            <span className="hidden lg:inline-block text-sm text-gray-500 font-medium">
              Library Management Portal
            </span>
          </div>

          <Link
            to="/"
            className="text-xs sm:text-sm font-medium px-3.5 py-1.5 rounded-xl border border-white/20 lg:border-gray-200 text-gray-100 lg:text-gray-700 hover:border-crimson hover:text-crimson transition-colors"
          >
            Public Home
          </Link>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
