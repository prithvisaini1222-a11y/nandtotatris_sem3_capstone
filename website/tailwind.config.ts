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
        olive: {
          dark: "#3F4B25",
          DEFAULT: "#596B35",
          light: "#78894F",
        },
        cream: {
          DEFAULT: "#F3EED8",
          dark: "#E8E2C8",
          light: "#F9F6EA",
        },
        ivory: {
          DEFAULT: "#FFFDF4",
          soft: "#FAF8EE",
        },
        gold: {
          DEFAULT: "#C6AD68",
          light: "#DFC98C",
          dark: "#A38B48",
        },
        sage: {
          DEFAULT: "#A7B28A",
          light: "#C0C9AA",
          dark: "#8D9A6F",
        },
        forest: {
          DEFAULT: "#29321F",
          text: "#29321F",
          muted: "#4A5738",
        },
        border: {
          DEFAULT: "#D9D1B7",
          dark: "#B8AF92",
          light: "#EAE4D2",
        },
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Playfair Display", "Georgia", "serif"],
        sans: ["Plus Jakarta Sans", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "Courier New", "monospace"],
      },
      borderRadius: {
        'editorial': '1.25rem',
        'pill': '9999px',
      },
      boxShadow: {
        'editorial': '0 4px 20px -2px rgba(63, 75, 37, 0.08)',
        'card': '0 2px 12px rgba(63, 75, 37, 0.06)',
        'lifted': '0 12px 32px -4px rgba(41, 50, 31, 0.16)',
      },
    },
  },
  plugins: [],
};
export default config;
