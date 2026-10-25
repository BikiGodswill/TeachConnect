/** Mirrors design/tokens.json — keep both in sync. */
module.exports = {
  // lib/ is scanned too: it holds class names (e.g. status badge colors in lib/format.js)
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}', './lib/**/*.js'],
  theme: {
    extend: {
      colors: {
        navy: { 900: '#0B1437', 800: '#12204F', 700: '#1B2D6B' },
        teal: { 600: '#168F7D', 500: '#1FA891', 100: '#DDF5F0' },
        brandyellow: { 500: '#FFC53D', 400: '#FFD166', 100: '#FFF4D6' },
        lavender: { 100: '#EFEAFF', 50: '#F7F4FF' },
        sky: { 100: '#E8F2FF', 50: '#F3F8FF' },
        peach: { 100: '#FFF0E8' },
        ink: { 900: '#1A2033', 600: '#5B6478', 400: '#98A1B3', 200: '#E3E7EF', 100: '#F2F4F8' },
        success: '#1FA86B', warning: '#F59E0B', danger: '#E5484D', info: '#2F7BFF',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      borderRadius: { sm: '8px', md: '12px', lg: '20px', xl: '28px' },
      boxShadow: {
        card: '0 8px 24px rgba(18,32,79,0.08)',
        cardHover: '0 14px 32px rgba(18,32,79,0.14)',
        float: '0 16px 40px rgba(18,32,79,0.16)',
        glow: '0 10px 30px rgba(31,168,145,0.35)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #1FA891 0%, #2F7BFF 100%)',
        'navy-gradient': 'linear-gradient(135deg, #0B1437 0%, #1B2D6B 100%)',
        'warm-gradient': 'linear-gradient(135deg, #FFC53D 0%, #FF8A5B 100%)',
        'hero-gradient': 'linear-gradient(135deg, #F7F4FF 0%, #FFFFFF 45%, #E8F2FF 100%)',
      },
      keyframes: {
        'fade-up': { '0%': { opacity: 0, transform: 'translateY(16px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        shimmer: { '0%': { backgroundPosition: '-400px 0' }, '100%': { backgroundPosition: '400px 0' } },
        blob: { '0%,100%': { transform: 'translate(0,0) scale(1)' }, '50%': { transform: 'translate(20px,-20px) scale(1.08)' } },
        'pop': { '0%': { transform: 'scale(0.6)', opacity: 0 }, '70%': { transform: 'scale(1.1)' }, '100%': { transform: 'scale(1)', opacity: 1 } },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        float: 'float 5s ease-in-out infinite',
        shimmer: 'shimmer 1.4s linear infinite',
        blob: 'blob 9s ease-in-out infinite',
        pop: 'pop 0.35s ease-out both',
      },
    },
  },
  plugins: [],
};
