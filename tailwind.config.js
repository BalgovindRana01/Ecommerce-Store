/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7C6FE9',
        success: '#34D399',
        background: '#0f0f0f',
        surface: 'rgba(255, 255, 255, 0.1)',
        'surface-hover': 'rgba(255, 255, 255, 0.2)',
      },
    },
  },
  plugins: [],
}