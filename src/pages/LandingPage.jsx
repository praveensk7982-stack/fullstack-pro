import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BOOKS = [
  {
    id: 1,
    title: 'Engineering Chemistry',
    isLight: false,
    spine: 'linear-gradient(180deg, #9E0B22 0%, #C8102E 50%, #8B0B20 100%)',
    cover: 'linear-gradient(135deg, #C8102E 0%, #8B0B20 100%)',
    accent: '#FDE8EC',
    band: '#111827',
    motif: 'circle',
  },
  {
    id: 2,
    title: 'Full Stack Development',
    isLight: false,
    spine: 'linear-gradient(180deg, #111827 0%, #1F2937 50%, #0B101B 100%)',
    cover: 'linear-gradient(135deg, #111827 0%, #1F2937 100%)',
    accent: '#C8102E',
    band: '#F9FAFB',
    motif: 'grid',
  },
  {
    id: 3,
    title: 'Data Structures',
    isLight: true,
    spine: 'linear-gradient(180deg, #F3F4F6 0%, #E5E7EB 50%, #D1D5DB 100%)',
    cover: 'linear-gradient(135deg, #FFFFFF 0%, #F3F4F6 100%)',
    accent: '#C8102E',
    band: '#111827',
    motif: 'triangle',
  },
  {
    id: 4,
    title: 'Operating Systems',
    isLight: false,
    spine: 'linear-gradient(180deg, #7F1D1D 0%, #991B1B 50%, #631212 100%)',
    cover: 'linear-gradient(135deg, #991B1B 0%, #450A0A 100%)',
    accent: '#FCA5A5',
    band: '#FFFFFF',
    motif: 'stripes',
  },
  {
    id: 5,
    title: 'Database Management Systems',
    isLight: false,
    spine: 'linear-gradient(180deg, #1E293B 0%, #334155 50%, #0F172A 100%)',
    cover: 'linear-gradient(135deg, #0F172A 0%, #334155 100%)',
    accent: '#FDE8EC',
    band: '#C8102E',
    motif: 'waves',
  },
  {
    id: 6,
    title: 'Computer Networks',
    isLight: false,
    spine: 'linear-gradient(180deg, #B91C1C 0%, #DC2626 50%, #991B1B 100%)',
    cover: 'linear-gradient(135deg, #DC2626 0%, #7F1D1D 100%)',
    accent: '#FFFFFF',
    band: '#111827',
    motif: 'rings',
  },
  {
    id: 7,
    title: 'Engineering Mathematics',
    isLight: true,
    spine: 'linear-gradient(180deg, #F8FAFC 0%, #E2E8F0 50%, #CBD5E1 100%)',
    cover: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
    accent: '#C8102E',
    band: '#111827',
    motif: 'arch',
  },
  {
    id: 8,
    title: 'Java Programming',
    isLight: false,
    spine: 'linear-gradient(180deg, #18181B 0%, #27272A 50%, #09090B 100%)',
    cover: 'linear-gradient(135deg, #18181B 0%, #3F3F46 100%)',
    accent: '#C8102E',
    band: '#FDE8EC',
    motif: 'diamond',
  },
  {
    id: 9,
    title: 'Python Programming',
    isLight: false,
    spine: 'linear-gradient(180deg, #881337 0%, #BE123C 50%, #4C0519 100%)',
    cover: 'linear-gradient(135deg, #BE123C 0%, #4C0519 100%)',
    accent: '#FFE4E6',
    band: '#111827',
    motif: 'bars',
  },
  {
    id: 10,
    title: 'Web Technologies',
    isLight: true,
    spine: 'linear-gradient(180deg, #F1F5F9 0%, #E2E8F0 50%, #CBD5E1 100%)',
    cover: 'linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 100%)',
    accent: '#C8102E',
    band: '#111827',
    motif: 'horizon',
  },
  {
    id: 11,
    title: 'Machine Learning',
    isLight: false,
    spine: 'linear-gradient(180deg, #0F172A 0%, #1E293B 50%, #020617 100%)',
    cover: 'linear-gradient(135deg, #111827 0%, #374151 100%)',
    accent: '#FDE8EC',
    band: '#C8102E',
    motif: 'hexagon',
  },
];

function CoverArtwork({ motif, accent, band }) {
  switch (motif) {
    case 'circle':
      return (
        <svg viewBox="0 0 160 120" className="w-full h-full" aria-hidden="true">
          <circle cx="80" cy="60" r="38" fill={accent} fillOpacity="0.18" />
          <circle cx="80" cy="60" r="24" stroke={accent} strokeWidth="2.5" fill="none" />
          <circle cx="80" cy="60" r="8" fill={band} fillOpacity="0.85" />
        </svg>
      );
    case 'grid':
      return (
        <svg viewBox="0 0 160 120" className="w-full h-full" aria-hidden="true">
          <rect x="44" y="22" width="32" height="32" rx="7" fill={accent} fillOpacity="0.9" />
          <rect x="84" y="22" width="32" height="32" rx="7" fill={band} fillOpacity="0.85" />
          <rect x="44" y="62" width="32" height="32" rx="7" fill={band} fillOpacity="0.2" />
          <rect x="84" y="62" width="32" height="32" rx="7" fill={accent} fillOpacity="0.28" />
        </svg>
      );
    case 'triangle':
      return (
        <svg viewBox="0 0 160 120" className="w-full h-full" aria-hidden="true">
          <polygon
            points="80,20 122,94 38,94"
            fill={accent}
            fillOpacity="0.18"
            stroke={accent}
            strokeWidth="2.5"
          />
          <polygon points="80,44 102,84 58,84" fill={band} fillOpacity="0.82" />
        </svg>
      );
    case 'stripes':
      return (
        <svg viewBox="0 0 160 120" className="w-full h-full" aria-hidden="true">
          <rect x="30" y="28" width="100" height="10" rx="5" fill={accent} fillOpacity="0.85" />
          <rect x="42" y="48" width="76" height="10" rx="5" fill={band} fillOpacity="0.85" />
          <rect x="30" y="68" width="100" height="10" rx="5" fill={accent} fillOpacity="0.45" />
          <rect x="54" y="88" width="52" height="8" rx="4" fill={band} fillOpacity="0.65" />
        </svg>
      );
    case 'waves':
      return (
        <svg viewBox="0 0 160 120" className="w-full h-full" aria-hidden="true">
          <path
            d="M26 42 Q53 22 80 42 T134 42"
            fill="none"
            stroke={accent}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M26 62 Q53 42 80 62 T134 62"
            fill="none"
            stroke={accent}
            strokeWidth="3"
            strokeOpacity="0.7"
            strokeLinecap="round"
          />
          <path
            d="M26 82 Q53 62 80 82 T134 82"
            fill="none"
            stroke={band}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'rings':
      return (
        <svg viewBox="0 0 160 120" className="w-full h-full" aria-hidden="true">
          <circle cx="64" cy="60" r="28" stroke={accent} strokeWidth="2.5" fill="none" />
          <circle cx="96" cy="60" r="28" stroke={band} strokeWidth="2.5" fill="none" />
          <circle cx="80" cy="60" r="8" fill={accent} fillOpacity="0.85" />
        </svg>
      );
    case 'arch':
      return (
        <svg viewBox="0 0 160 120" className="w-full h-full" aria-hidden="true">
          <path
            d="M44 96 V54 A36 36 0 0 1 116 54 V96 Z"
            fill={accent}
            fillOpacity="0.18"
            stroke={accent}
            strokeWidth="2.5"
          />
          <circle cx="80" cy="54" r="10" fill={band} fillOpacity="0.88" />
        </svg>
      );
    case 'diamond':
      return (
        <svg viewBox="0 0 160 120" className="w-full h-full" aria-hidden="true">
          <polygon
            points="80,18 118,60 80,102 42,60"
            fill={accent}
            fillOpacity="0.2"
            stroke={accent}
            strokeWidth="2.5"
          />
          <polygon points="80,38 98,60 80,82 62,60" fill={band} fillOpacity="0.88" />
        </svg>
      );
    case 'bars':
      return (
        <svg viewBox="0 0 160 120" className="w-full h-full" aria-hidden="true">
          <rect x="42" y="56" width="14" height="40" rx="4" fill={accent} fillOpacity="0.55" />
          <rect x="64" y="34" width="14" height="62" rx="4" fill={accent} fillOpacity="0.9" />
          <rect x="86" y="44" width="14" height="52" rx="4" fill={band} fillOpacity="0.85" />
          <rect x="108" y="24" width="14" height="72" rx="4" fill={accent} fillOpacity="0.7" />
        </svg>
      );
    case 'horizon':
      return (
        <svg viewBox="0 0 160 120" className="w-full h-full" aria-hidden="true">
          <circle cx="80" cy="64" r="28" fill={accent} fillOpacity="0.25" />
          <rect x="30" y="64" width="100" height="32" rx="4" fill={band} fillOpacity="0.15" />
          <line x1="30" y1="64" x2="130" y2="64" stroke={accent} strokeWidth="2.5" />
        </svg>
      );
    case 'hexagon':
    default:
      return (
        <svg viewBox="0 0 160 120" className="w-full h-full" aria-hidden="true">
          <polygon
            points="80,18 114,38 114,80 80,100 46,80 46,38"
            fill={accent}
            fillOpacity="0.16"
            stroke={accent}
            strokeWidth="2.5"
          />
          <circle cx="80" cy="59" r="14" fill={band} fillOpacity="0.9" />
        </svg>
      );
  }
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(5);
  const [pressingIndex, setPressingIndex] = useState(null);
  const [autoPlay, setAutoPlay] = useState(true);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  const stagePointerStartRef = useRef(null);
  const bookPointerStartRef = useRef(null);
  const wheelCooldownRef = useRef(0);
  const pressTimeoutRef = useRef(null);

  const stopAutoPlay = useCallback(() => {
    setAutoPlay(false);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!autoPlay) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % BOOKS.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, [autoPlay]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        stopAutoPlay();
        setActiveIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        stopAutoPlay();
        setActiveIndex((prev) => Math.min(BOOKS.length - 1, prev + 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stopAutoPlay]);

  useEffect(() => {
    return () => {
      if (pressTimeoutRef.current) {
        window.clearTimeout(pressTimeoutRef.current);
      }
    };
  }, []);

  const handleWheel = (e) => {
    const dominantDelta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(dominantDelta) < 8) return;

    const now = Date.now();
    if (now - wheelCooldownRef.current < 260) return;
    wheelCooldownRef.current = now;

    stopAutoPlay();
    if (dominantDelta > 0) {
      setActiveIndex((prev) => Math.min(BOOKS.length - 1, prev + 1));
    } else {
      setActiveIndex((prev) => Math.max(0, prev - 1));
    }
  };

  const handleStagePointerDown = (e) => {
    stagePointerStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleStagePointerUp = (e) => {
    const start = stagePointerStartRef.current;
    stagePointerStartRef.current = null;
    if (!start) return;

    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) > 36 && Math.abs(dx) > Math.abs(dy)) {
      stopAutoPlay();
      if (dx < 0) {
        setActiveIndex((prev) => Math.min(BOOKS.length - 1, prev + 1));
      } else {
        setActiveIndex((prev) => Math.max(0, prev - 1));
      }
    }
  };

  const handleBookPointerDown = (e) => {
    bookPointerStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleBookPointerUp = (index, e) => {
    const start = bookPointerStartRef.current;
    bookPointerStartRef.current = null;
    if (start) {
      const distance = Math.hypot(e.clientX - start.x, e.clientY - start.y);
      if (distance > 8) return;
    }

    stopAutoPlay();

    if (index === activeIndex) {
      setPressingIndex(index);
      if (pressTimeoutRef.current) window.clearTimeout(pressTimeoutRef.current);
      pressTimeoutRef.current = window.setTimeout(() => {
        setPressingIndex(null);
      }, 150);
      return;
    }

    setActiveIndex(index);
  };

  const bookWidth = isMobile ? 148 : 204;
  const bookHeight = isMobile ? 224 : 304;
  const bookDepth = isMobile ? 36 : 46;
  const spineGap = isMobile ? 10 : 14;
  const centerClearance = isMobile ? bookWidth * 0.58 + 18 : bookWidth * 0.6 + 32;

  return (
    <div className="relative h-[100dvh] min-h-[560px] w-full overflow-hidden bg-gradient-to-b from-gray-50 via-white to-rose-50/40 flex flex-col">
      <style>{`
        @media (hover: hover) and (pointer: fine) {
          .bookshelf-book-inactive:hover .bookshelf-book-inner {
            transform: translateY(-10px) rotateY(68deg) !important;
          }
        }
      `}</style>

      {/* Subtle ambient background glow */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden="true"
      >
        <div className="h-[340px] w-[340px] sm:h-[460px] sm:w-[460px] rounded-full bg-crimson/5 blur-3xl" />
      </div>

      {/* 3D Bookshelf Stage — leaves reserved bottom space so CTA never overlaps on mobile */}
      <div
        className="relative flex-1 w-full flex items-center justify-center pb-24 sm:pb-28 select-none touch-pan-y"
        style={{ perspective: isMobile ? '1100px' : '1500px' }}
        onWheel={handleWheel}
        onPointerDown={handleStagePointerDown}
        onPointerUp={handleStagePointerUp}
      >
        <div
          className="relative flex items-center justify-center w-full"
          style={{
            height: `${bookHeight + 60}px`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Shelf shadow */}
          <div
            className="pointer-events-none absolute rounded-full bg-navy/15 blur-xl"
            style={{
              width: isMobile ? '280px' : '580px',
              height: '24px',
              bottom: '12px',
            }}
            aria-hidden="true"
          />

          {BOOKS.map((book, index) => {
            const offset = index - activeIndex;
            const isActive = offset === 0;
            const isPressing = pressingIndex === index;
            const textColorClass = book.isLight ? 'text-[#111827]' : 'text-white';

            let translateX = 0;
            if (offset < 0) {
              translateX = -centerClearance + (offset + 1) * (bookDepth + spineGap);
            } else if (offset > 0) {
              translateX = centerClearance + (offset - 1) * (bookDepth + spineGap);
            }

            const translateZ = isActive ? (isMobile ? 75 : 115) : -Math.abs(offset) * 14;
            const rotateY = isActive ? 0 : offset < 0 ? 82 : 86;
            const zIndex = isActive ? 50 : 30 - Math.abs(offset);

            return (
              <div
                key={book.id}
                role="button"
                tabIndex={0}
                aria-label={book.title}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    stopAutoPlay();
                    if (index !== activeIndex) setActiveIndex(index);
                  }
                }}
                onPointerDown={handleBookPointerDown}
                onPointerUp={(e) => handleBookPointerUp(index, e)}
                className={`absolute cursor-pointer focus:outline-none ${
                  isActive ? '' : 'bookshelf-book-inactive'
                }`}
                style={{
                  width: `${bookWidth}px`,
                  height: `${bookHeight}px`,
                  zIndex,
                  transformStyle: 'preserve-3d',
                  transform: `translateX(${translateX}px) translateZ(${translateZ}px)`,
                  transition:
                    'transform 620ms cubic-bezier(0.22, 1, 0.36, 1), z-index 0s',
                }}
              >
                <div
                  className="bookshelf-book-inner relative w-full h-full"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: `rotateY(${rotateY}deg) scale(${isPressing ? 0.98 : 1})`,
                    transition: isPressing
                      ? 'transform 140ms ease-out'
                      : 'transform 620ms cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                >
                  {/* Front Cover */}
                  <div
                    className="absolute inset-0 rounded-r-xl rounded-l-sm overflow-hidden shadow-2xl border border-black/10 flex flex-col"
                    style={{
                      background: book.cover,
                      transform: `translateZ(${bookDepth / 2}px)`,
                      backfaceVisibility: 'hidden',
                    }}
                  >
                    <div
                      className="absolute inset-y-0 left-0 w-3 opacity-25 pointer-events-none"
                      style={{
                        background:
                          'linear-gradient(90deg, rgba(0,0,0,0.45) 0%, rgba(255,255,255,0.2) 55%, transparent 100%)',
                      }}
                    />

                    {/* Upper Cover Art */}
                    <div className="h-[54%] w-full px-3 pt-4 flex items-center justify-center shrink-0">
                      <CoverArtwork
                        motif={book.motif}
                        accent={book.accent}
                        band={book.band}
                      />
                    </div>

                    {/* Centered Bold Book Title Below Art */}
                    <div className="flex-1 px-4 pb-5 pt-1 flex items-center justify-center">
                      <h2
                        className={`font-sans font-bold text-center leading-tight line-clamp-3 ${textColorClass}`}
                        style={{ fontSize: isMobile ? '15px' : '19px' }}
                      >
                        {book.title}
                      </h2>
                    </div>
                  </div>

                  {/* Back Cover */}
                  <div
                    className="absolute inset-0 rounded-l-xl rounded-r-sm border border-black/10"
                    style={{
                      background: book.cover,
                      transform: `rotateY(180deg) translateZ(${bookDepth / 2}px)`,
                      backfaceVisibility: 'hidden',
                    }}
                  />

                  {/* Spine (Left Face) */}
                  <div
                    className="absolute top-0 rounded-l-sm overflow-hidden border-y border-l border-black/15 shadow-lg flex items-center justify-center py-7 px-1"
                    style={{
                      width: `${bookDepth}px`,
                      height: `${bookHeight}px`,
                      left: `${(bookWidth - bookDepth) / 2}px`,
                      background: book.spine,
                      transform: `rotateY(-90deg) translateZ(${bookWidth / 2}px)`,
                      backfaceVisibility: 'hidden',
                    }}
                  >
                    <div
                      className="absolute inset-x-0 top-3.5 h-1.5 opacity-85"
                      style={{ backgroundColor: book.accent }}
                    />
                    <span
                      className={`font-sans font-semibold uppercase whitespace-nowrap overflow-hidden text-ellipsis max-h-full select-none ${textColorClass}`}
                      style={{
                        writingMode: 'vertical-rl',
                        transform: 'rotate(180deg)',
                        letterSpacing: '0.08em',
                        fontSize: isMobile ? '12px' : '14px',
                      }}
                    >
                      {book.title}
                    </span>
                    <div
                      className="absolute inset-x-0 bottom-3.5 h-1.5 opacity-85"
                      style={{ backgroundColor: book.accent }}
                    />
                  </div>

                  {/* Right Page Edges */}
                  <div
                    className="absolute top-0 border-y border-r border-black/10"
                    style={{
                      width: `${bookDepth - 4}px`,
                      height: `${bookHeight - 6}px`,
                      left: `${(bookWidth - (bookDepth - 4)) / 2}px`,
                      top: '3px',
                      background:
                        'repeating-linear-gradient(90deg, #F9FAFB 0px, #F9FAFB 2px, #E5E7EB 2px, #E5E7EB 4px)',
                      transform: `rotateY(90deg) translateZ(${bookWidth / 2 - 2}px)`,
                      backfaceVisibility: 'hidden',
                    }}
                  />

                  {/* Top Page Edges */}
                  <div
                    className="absolute left-0"
                    style={{
                      width: `${bookWidth - 4}px`,
                      height: `${bookDepth - 4}px`,
                      top: `${(bookHeight - (bookDepth - 4)) / 2}px`,
                      background: '#F3F4F6',
                      transform: `rotateX(90deg) translateZ(${bookHeight / 2 - 2}px)`,
                      backfaceVisibility: 'hidden',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom-Centered Get Started Button (32px above bottom edge) */}
      <div className="absolute inset-x-0 bottom-8 z-50 flex justify-center px-4 pointer-events-none">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="pointer-events-auto inline-flex items-center gap-2.5 bg-[#C8102E] hover:bg-[#A60D26] hover:-translate-y-0.5 active:scale-95 text-white font-sans font-semibold rounded-full px-8 py-3 shadow-[0_10px_28px_rgba(200,16,46,0.35)] hover:shadow-[0_14px_34px_rgba(200,16,46,0.45)] transition-all duration-200"
        >
          <span>Get Started</span>
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
