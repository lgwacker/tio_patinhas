/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Tio Patinhas design system
        background: '#0F172A',
        primary: '#3B82F6',
        gold: '#F59E0B',
        danger: '#EF4444',
        'text-primary': '#F8FAFC',
        'text-secondary': '#94A3B8',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
