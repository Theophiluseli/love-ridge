import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#0A5C28', // Exact Loveridge Green
          900: '#064E24',
          950: '#032C14',
          dark: '#062914',
          gold: '#D4AF37',
        },
        loveridge: {
          green: '#0A5C28',
          darkgreen: '#064E24',
          lightgreen: '#E8F5EC',
          accent: '#15803d',
        }
      },
    },
  },
  plugins: [],
};
export default config;
