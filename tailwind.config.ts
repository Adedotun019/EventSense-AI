/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: 'media',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Roboto', 'sans-serif'],
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        'brand-primary': '#007bff',
        'brand-secondary': '#6c757d',
        'brand-accent': '#ff3366',
        'brand-success': '#10b981',
        'brand-warning': '#f59e0b',
        'brand-error': '#ef4444',
        'brand-info': '#3b82f6',
        dark: '#0d1117',
        light: '#f9f9f9',
        'dark-blue': '#0f172a',
        'deep-blue': '#1e293b',
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'tech-pattern': `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866...z' fill='rgba(255,255,255,0.05)' fill-rule='evenodd'/%3E%3C/svg%3E")`,
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-out both',
        'fade-in-down': 'fadeInDown 1s ease-out both',
        'bounce-fast': 'bounce 0.8s infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'shine': 'shine 3s linear infinite',
        'gradient': 'gradient 15s ease infinite',
        'scale': 'scale 2s ease-in-out infinite',
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
        float: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(-20px) translateX(10px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px 2px rgba(59,130,246,0.3)' },
          '50%': { boxShadow: '0 0 20px 10px rgba(59,130,246,0.5)' },
        },
        shine: {
          '0%': { transform: 'translateX(-100%) rotate(45deg)' },
          '20%, 100%': { transform: 'translateX(100%) rotate(45deg)' },
        },
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        scale: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};

export default config;
