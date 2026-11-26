/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        crimson: {
          DEFAULT: '#C8102E',
          dark: '#A00D25',
          deeper: '#8B0B20',
          light: '#FDE8EC',
        },
        navy: {
          DEFAULT: '#111827',
          light: '#1F2937',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 8px 30px rgba(17, 24, 39, 0.06)',
        'card-hover': '0 14px 36px rgba(200, 16, 46, 0.12)',
      },
    },
  },
  plugins: [],
};
