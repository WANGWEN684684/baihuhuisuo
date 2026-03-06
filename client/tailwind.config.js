/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B6B', // Warm pinkish/red for dating
        secondary: '#4ECDC4', // Soft teal
      }
    },
  },
  plugins: [],
}
