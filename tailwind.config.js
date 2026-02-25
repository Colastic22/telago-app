/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // <--- BARIS INI KUNCI UTAMA AGAR TIDAK STUCK DI DARK MODE
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}