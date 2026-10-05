/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FAF7F2',
        ink: '#1F1A17',
        muted: '#7A6F66',
        wine: '#8B2C4C',
        wineDark: '#6D1F3A',
        line: '#E8E1D8',
        success: '#3A7D5C',
        danger: '#B23B3B',
      },
      fontFamily: {
        heading: ['"Cormorant Garamond"', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
};
