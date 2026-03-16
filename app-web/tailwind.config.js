/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#9DC183',
        'primary-dark': '#7BA366',
        'primary-light': '#B8D4A3',
        'text-primary': '#2C3E50',
        'text-secondary': '#5D6D7E',
        'text-muted': '#95A5A6',
        surface: {
          50: '#F8F9FA',
          100: '#F1F3F4',
          200: '#E5E8EB',
          300: '#CED4DA',
          400: '#95A5A6',
          500: '#7F8C8D',
          600: '#5D6D7E',
          700: '#34495E',
          800: '#2C3E50',
        },
      }
    },
  },
  plugins: [],
}
