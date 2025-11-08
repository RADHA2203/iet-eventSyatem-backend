/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0f172a',
        'dark-card': '#1e293b',
        'dark-border': '#334155',
        'vibrant-cyan': '#06b6d4',
        'vibrant-purple': '#a855f7',
        'vibrant-pink': '#ec4899',
        'vibrant-blue': '#3b82f6',
        'vibrant-green': '#10b981',
      },
    },
  },
  plugins: [],
}
