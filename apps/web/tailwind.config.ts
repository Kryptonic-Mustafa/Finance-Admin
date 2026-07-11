import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(0 0% 100%)",
        foreground: "hsl(240 10% 3.9%)",
        card: {
          DEFAULT: "hsl(0 0% 100%)",
          foreground: "hsl(240 10% 3.9%)",
        },
        popover: {
          DEFAULT: "hsl(0 0% 100%)",
          foreground: "hsl(240 10% 3.9%)",
        },
        primary: {
          DEFAULT: "hsl(240 5.9% 10%)",
          foreground: "hsl(0 0% 98%)",
        },
        secondary: {
          DEFAULT: "hsl(240 4.8% 95.9%)",
          foreground: "hsl(240 5.9% 10%)",
        },
        muted: {
          DEFAULT: "hsl(240 4.8% 95.9%)",
          foreground: "hsl(240 3.8% 46.1%)",
        },
        accent: {
          DEFAULT: "hsl(240 4.8% 95.9%)",
          foreground: "hsl(240 5.9% 10%)",
        },
        border: "hsl(240 5.9% 90%)",
        input: "hsl(240 5.9% 90%)",
        ring: "hsl(240 10% 3.9%)",
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
      boxShadow: {
        'premium': '0 1px 2px 0 rgba(0, 0, 0, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.02)',
        'premium-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
};
export default config;
