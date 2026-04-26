/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3b82f6', // Bright Blue
          dark: '#2563eb',
          light: '#60a5fa'
        }
      }
    },
  },
  plugins: [],
}
