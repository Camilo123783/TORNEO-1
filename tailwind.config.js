/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        futsal: {
          dark: '#0B132B',
          navy: '#1C2541',
          blue: '#3A506B',
          teal: '#5BC0BE',
          neon: '#06D6A0',
          accent: '#FFD166',
          danger: '#EF476F',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
