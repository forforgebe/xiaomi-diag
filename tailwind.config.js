/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        xiaomi: {
          orange: '#FF6900',
          dark: '#1a1a2e',
          card: '#16213e',
          accent: '#0f3460',
          text: '#e8e8e8',
          muted: '#8892b0',
          green: '#00c853',
          red: '#ff1744',
          yellow: '#ffd600',
        }
      }
    },
  },
  plugins: [],
};
