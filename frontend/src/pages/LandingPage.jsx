import {
  ArrowLeftRight,
  ArrowRight,
  BookOpen,
  Boxes,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const features = [
  {
    title: 'Manage Books',
    description: 'Add, view and organize books',
    icon: BookOpen,
    to: '/books',
  },
  {
    title: 'Manage Members',
    description: 'Register and handle members',
    icon: Users,
    to: '/members',
  },
  {
    title: 'Issue & Return',
    description: 'Borrow and return books',
    icon: ArrowLeftRight,
    to: '/issue-return',
  },
  {
    title: 'Track Inventory',
    description: 'Monitor stock and history',
    icon: Boxes,
    to: '/inventory',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-rose-50/20 to-gray-50">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 lg:pt-14 lg:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-crimson-light text-crimson text-xs sm:text-sm font-semibold shadow-sm">
                <BookOpen className="h-4 w-4" />
                <span>Library Management System</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold tracking-tight text-gray-950 leading-[1.12]">
                  Welcome to{' '}
                  <span className="relative inline-block text-crimson">
                    Library
                    <svg
                      viewBox="0 0 220 22"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="absolute -bottom-2 left-0 w-full h-4 text-crimson"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M3 16C58 4 148 2 217 14"
                        stroke="currentColor"
                        strokeWidth="5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </h1>

                <p className="text-lg sm:text-xl font-semibold text-gray-700 pt-1">
                  Discover. Read. Learn.
                </p>

                <p className="text-base text-gray-500 max-w-lg leading-relaxed">
                  Your digital library for a smarter tomorrow.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-3 px-7 py-3.5 rounded-2xl bg-crimson hover:bg-crimson-dark text-white font-semibold text-base shadow-lg shadow-crimson/25 hover:shadow-xl hover:shadow-crimson/30 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <BookOpen className="h-5 w-5" />
                  <span>Go to Dashboard</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white border border-gray-100 aspect-[16/10]">
                <img
                  src="/images/hero-library.jpg"
                  alt="Open hardcover book on wooden desk with red and black books, desk lamp, pencil cup, and bookshelves"
                  className="w-full h-full object-cover"
                />

                <svg
                  viewBox="0 0 180 400"
                  preserveAspectRatio="none"
                  className="absolute inset-y-0 left-0 h-full w-24 sm:w-32 pointer-events-none"
                  aria-hidden="true"
                >
                  <path
                    d="M0,0 L125,0 C72,120 148,260 64,400 L0,400 Z"
                    fill="#C8102E"
                    fillOpacity="0.92"
                  />
                  <path
                    d="M0,0 L98,0 C46,120 120,260 40,400 L0,400 Z"
                    fill="#FFFFFF"
                  />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Four Feature Cards */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.title}
                  to={feature.to}
                  className="group bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover border border-gray-100 hover:border-crimson/20 transition-all duration-300 hover:-translate-y-1 flex flex-col items-start"
                >
                  <div className="h-14 w-14 rounded-full bg-crimson-light flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-6 w-6 text-crimson" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 group-hover:text-crimson transition-colors">
                    {feature.title}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                    {feature.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      {/* Red Wave Footer */}
      <footer className="relative mt-auto">
        <div className="w-full overflow-hidden leading-none">
          <svg
            viewBox="0 0 1440 90"
            preserveAspectRatio="none"
            className="w-full h-12 sm:h-16 block"
            aria-hidden="true"
          >
            <path
              d="M0,48 C240,95 480,0 720,42 C960,84 1200,15 1440,52 L1440,90 L0,90 Z"
              fill="#C8102E"
              fillOpacity="0.25"
            />
            <path
              d="M0,58 C300,10 600,90 920,38 C1150,4 1320,45 1440,62 L1440,90 L0,90 Z"
              fill="#9E0B22"
            />
          </svg>
        </div>
        <div className="bg-[#9E0B22] text-white py-5 px-4 text-center">
          <p className="text-sm sm:text-base font-medium tracking-wide">
            Library Management System | Build a Better Learning Experience
          </p>
        </div>
      </footer>
    </div>
  );
}
