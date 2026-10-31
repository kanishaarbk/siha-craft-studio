/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          pink: '#F8DDE0',
          peach: '#FFE8DF',
          cream: '#FFF9F3',
          lavender: '#EAE2F5',
          sage: '#DCE8D8',
          sand: '#F7EBE4',
        },
        brand: {
          burgundy: '#71313D',
          'burgundy-dark': '#56242E',
          'burgundy-light': '#8D4050',
          chocolate: '#55352E',
          'chocolate-dark': '#3F2620',
          terracotta: '#A65345',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        script: ['"Cormorant Garamond"', 'serif'],
        sans: ['"Outfit"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'float-reverse': 'floatReverse 7s ease-in-out infinite',
        'float-gentle': 'floatGentle 5s ease-in-out infinite',
        'spin-very-slow': 'spin 30s linear infinite',
        'yarn-sway': 'yarnSway 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-14px) rotate(3deg)' },
        },
        floatReverse: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(12px) rotate(-4deg)' },
        },
        floatGentle: {
          '0%, 100%': { transform: 'translate(0px, 0px)' },
          '50%': { transform: 'translate(6px, -8px)' },
        },
        yarnSway: {
          '0%, 100%': { transform: 'rotate(-4deg)' },
          '50%': { transform: 'rotate(5deg)' },
        }
      },
      boxShadow: {
        'pastel': '0 8px 30px rgba(113, 49, 61, 0.08)',
        'pastel-lg': '0 15px 40px rgba(113, 49, 61, 0.12)',
        'card': '0 4px 20px rgba(85, 53, 46, 0.06)',
      }
    },
  },
  plugins: [],
}
