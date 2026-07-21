import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#DC3D46",
          dark: "#C2232C",
          light: "#FBEAEB",
        },
        charcoal: {
          DEFAULT: "#2F3540",
          light: "#4C515A",
        },
        wwgGrey: "#94979C",
        wwgBorder: "#E5E7EB",
        wwgSurface: "#F3F4F6",
        wwgOrange: "#DC6C10",
        wwgGreen: "#1E7E4F",
        // Back-compat aliases mapped onto the Workwear Group palette
        workwear: {
          orange: "#DC3D46",
          "orange-dark": "#C2232C",
          "orange-light": "#FBEAEB",
          ink: "#2F3540",
        },
      },
      fontFamily: {
        sans: [
          "Barlow",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },
      keyframes: {
        "slide-fade-in": {
          "0%": { opacity: "0", transform: "translateY(-12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
      },
      animation: {
        "slide-fade-in": "slide-fade-in 0.4s ease-out",
        "pulse-dot": "pulse-dot 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
