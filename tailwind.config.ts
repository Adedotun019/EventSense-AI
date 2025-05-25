import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "media",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // tailwind.config.ts
theme: {
  extend: {
    fontFamily: {
      sans: ['var(--font-geist-sans)', 'Roboto', 'sans-serif'],
    },
    animation: {
      'fade-in': 'fadeIn 1.2s ease-out both',
      'fade-in-down': 'fadeInDown 1.2s ease-out both',
    },
    keyframes: {
      fadeIn: {
        '0%': { opacity: 0 },
        '100%': { opacity: 1 },
      },
      fadeInDown: {
        '0%': { opacity: 0, transform: 'translateY(-10px)' },
        '100%': { opacity: 1, transform: 'translateY(0)' },
      },
    },
    colors: {
      background: 'var(--background)',
      foreground: 'var(--foreground)',
    },
  },
},
  plugins: [],
};

export default config;
