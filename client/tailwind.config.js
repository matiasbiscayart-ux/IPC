/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        personal: '#6366f1',
        consultoria: '#0ea5e9',
        dashboard: '#10b981',
        fhc: '#f59e0b',
      },
    },
  },
  plugins: [],
};
