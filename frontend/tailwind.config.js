/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Official SIHA CRAFT STUDIO Brand Palette
        sage: {
          DEFAULT: '#84977B',
          light: '#9BB092',
          deep: '#566B50',
          dark: '#566B50',
          50: '#F5F7F3',
          100: '#E9EFE7',
          200: '#D5DFD1',
        },
        dusty: {
          DEFAULT: '#D98FA5',
          dark: '#BF7289',
          light: '#F3DCE3',
        },
        pink: {
          dusty: '#D98FA5',
          soft: '#F3DCE3',
        },
        cream: {
          DEFAULT: '#FFFDF7',
          warm: '#FFFDF7',
          soft: '#FBF8F0',
        },
        brand: {
          sage: '#84977B',
          'deep-sage': '#566B50',
          'dusty-pink': '#D98FA5',
          'soft-pink': '#F3DCE3',
          cream: '#FFFDF7',
          text: '#45483F',
          // Brand semantic mappings
          burgundy: '#566B50',       // Main accent & button tone (Deep Sage)
          'burgundy-dark': '#41523D',
          'burgundy-light': '#84977B',
          chocolate: '#45483F',      // Main body text tone
          'chocolate-dark': '#32352D',
          terracotta: '#D98FA5',     // Accent highlight (Dusty Pink)
        },
        pastel: {
          pink: '#F3DCE3',
          peach: '#FFFDF7',
          cream: '#FFFDF7',
          lavender: '#EFEBF4',
          sage: '#DCE8D8',
          sand: '#F7F5EE',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        script: ['"Cormorant Garamond"', 'serif'],
        sans: ['"Outfit"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'pastel': '0 8px 24px rgba(86, 107, 80, 0.08)',
        'pastel-lg': '0 12px 32px rgba(86, 107, 80, 0.12)',
        'card': '0 2px 16px rgba(69, 72, 63, 0.05)',
      }
    },
  },
  plugins: [],
}
