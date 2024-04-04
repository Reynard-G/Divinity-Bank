const { nextui } = require('@nextui-org/react');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {},
  darkMode: 'class',
  plugins: [
    nextui({
      themes: {
        dark: {
          colors: {
            primary: {
              DEFAULT: '#F4F4F4',
              foreground: '#0B0B0B',
            },
            secondary: {
              DEFAULT: '#1F1F1F',
              foreground: '#F4F4F4',
            },
            success: {
              DEFAULT: '#30D158',
              foreground: '#F4F4F4',
            },
            warning: {
              DEFAULT: '#FF9F0A',
              foreground: '#F4F4F4',
            },
            danger: {
              DEFAULT: '#C9372C',
              foreground: '#F4F4F4',
            },
          },
        },
      },
    }),
  ],
};
