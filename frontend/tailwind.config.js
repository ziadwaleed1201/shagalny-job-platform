/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50:'#f0f4fa', 100:'#d8e2f1', 200:'#b1c6e3', 300:'#7e9fcc',
          400:'#4e76b3', 500:'#2d5594', 600:'#1f3f73', 700:'#162e57',
          800:'#0f203e', 900:'#0a1730',
        },
        success: { 50:'#ecfdf5', 100:'#d1fae5', 500:'#10b981', 600:'#059669', 700:'#047857' },
        accent:  { 50:'#fff7ed', 100:'#ffedd5', 400:'#fb923c', 500:'#f97316', 600:'#ea580c' },
      },
      fontFamily: { sans: ['Inter','system-ui','-apple-system','Segoe UI','Roboto','sans-serif'] },
      boxShadow: {
        soft: '0 4px 20px -4px rgba(15, 32, 62, 0.08)',
        card: '0 2px 10px -2px rgba(15, 32, 62, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(12px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
