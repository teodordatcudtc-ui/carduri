import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      colors: {
        ink: {
          DEFAULT: "#1e1b18",
          muted: "#9e9a96",
          70: "#514d49",
          15: "#dddbd8",
          6: "#f2f1ef",
        },
        coral: {
          DEFAULT: "#f26545",
          light: "#fef0ec",
          dark: "#c03f22",
        },
        surface: "#f8f7f5",
        paper: "#fefefe",
        brand: {
          50: "#fef7f4",
          100: "#fde8e2",
          200: "#fac4b4",
          300: "#f6977f",
          400: "#f26545",
          500: "#f26545",
          600: "#db4f32",
          700: "#c03f22",
          800: "#9e3320",
          900: "#5c2418",
          950: "#2f110c",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
