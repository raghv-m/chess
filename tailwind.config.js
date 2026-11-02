/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#15120F',
        bone: '#EDE4D0',
        walnut: '#2A211B',
        oxblood: '#5E1C1C',
        brass: '#B8893A',
        'brass-light': '#D4A658',
      },
    },
  },
  plugins: [],
};
