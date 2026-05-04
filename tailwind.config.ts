import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Tio Patinhas Design System
        background: "#0F172A",
        surface: "#1E293B",
        primary: "#3B82F6",
        profit: "#F59E0B",     // Dourado para lucros
        loss: "#EF4444",       // Vermelho para perdas
        "text-primary": "#F8FAFC",
        "text-secondary": "#94A3B8",
        border: "#334155",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
