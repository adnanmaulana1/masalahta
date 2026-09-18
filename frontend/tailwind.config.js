/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: "#0e76f1",
          50: "#eef6ff",
          100: "#d9ecff",
          200: "#bcddff",
          300: "#8ec8ff",
          400: "#59a8ff",
          500: "#1f84fb",
          600: "#0e76f1",
          700: "#0b5fd0",
          800: "#0f4da6",
          900: "#123c82",
        },
        ink: "#1c2430",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,.04), 0 1px 3px rgba(16,24,40,.06)",
        lift: "0 8px 24px rgba(16,24,40,.12)",
        glow: "0 0 0 4px rgba(14,118,241,.12)",
      },
      borderRadius: { "2xl": "1rem", "3xl": "1.25rem" },
    },
  },
  plugins: [],
}

