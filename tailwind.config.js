/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Manrope",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      colors: {
        ink: {
          950: "#171417",
          900: "#211C21",
          800: "#332B33",
          700: "#4A404A",
        },
        marigold: {
          50: "#FFF6E8",
          100: "#FFEBC7",
          300: "#F6C777",
          500: "#E8A33D",
          600: "#CE8A26",
          700: "#A66E1D",
        },
        leaf: {
          50: "#EEF7F0",
          100: "#D7ECDC",
          400: "#5EA575",
          500: "#3F7D58",
          600: "#316446",
        },
        clay: {
          500: "#C2593F",
          600: "#A44531",
        },
        paper: "#FFFDF9",
        sand: "#F4EFE6",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(23,20,23,0.06), 0 8px 24px -12px rgba(23,20,23,0.18)",
      },
    },
  },
  plugins: [],
};
