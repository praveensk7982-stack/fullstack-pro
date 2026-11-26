import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="bg-navy text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group focus:outline-none">
          <div className="h-9 w-9 rounded-xl bg-crimson/15 border border-crimson/40 flex items-center justify-center group-hover:bg-crimson transition-colors duration-200">
            <BookOpen className="h-5 w-5 text-crimson group-hover:text-white transition-colors duration-200" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Library-X</span>
        </Link>
      </div>
    </header>
  );
}
