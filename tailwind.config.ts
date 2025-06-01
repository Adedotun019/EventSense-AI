const config = {
  darkMode: "class", // ✅ Corrected from "media"
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
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
        'brand-primary': '#007bff',
        'brand-secondary': '#6c757d',
      },
    },
  },
  plugins: [],
};

export default config;