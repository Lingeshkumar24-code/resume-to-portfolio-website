/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // We will define styling tokens matching the user's generated themes
        // but we also have default base colors
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        darkBg: '#0f172a',
        darkCard: '#1e293b',
      },
    },
  },
  plugins: [],
}
