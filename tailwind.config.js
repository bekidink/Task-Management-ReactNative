/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#0051A8',
        // secondary: "#0270FB",
        secondary: '#FF8F12',
        tertiary: '#1051A4',
        button: '#3E6DB5',
        accent: '#004360',
        dark: '#333333',
        light: '#F2F2F2',
        card: '#E3E4E5',
      },
    },
  },
  plugins: [],
};
