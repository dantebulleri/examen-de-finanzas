import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border:     "var(--line-soft)",
        input:      "var(--line-soft)",
        ring:       "var(--accent)",
        background: "var(--bg-0)",
        foreground: "var(--fg-0)",
        primary: {
          DEFAULT:    "var(--accent)",
          foreground: "var(--accent-fg)",
        },
        secondary: {
          DEFAULT:    "var(--bg-2)",
          foreground: "var(--fg-1)",
        },
        destructive: {
          DEFAULT:    "var(--bad)",
          foreground: "var(--fg-0)",
        },
        muted: {
          DEFAULT:    "var(--bg-2)",
          foreground: "var(--fg-3)",
        },
        accent: {
          DEFAULT:    "var(--bg-2)",
          foreground: "var(--fg-0)",
        },
        popover: {
          DEFAULT:    "var(--bg-1)",
          foreground: "var(--fg-0)",
        },
        card: {
          DEFAULT:    "var(--bg-1)",
          foreground: "var(--fg-0)",
        },
      },
      borderRadius: {
        lg: "var(--r-lg)",
        md: "var(--r-md)",
        sm: "var(--r-sm)",
      },
    },
  },
  plugins: [],
};
export default config;
