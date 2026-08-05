/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#faf7f2",
        ivory: "#f6f1e7",
        linen: "#f2ece1",
        sand: "#e8dcc8",
        pebble: "#d8cfc0",
        taupe: "#b3a48d",
        sage: "#a8b39a",
        olive: "#6b6b4e",
        clay: "#c89f8a",
        claydeep: "#8f5b44",
        bark: "#7a5c44",
        ink: "#3d3529",
        soft: "#6f6555"
      },
      fontFamily: {
        serif: ["'Cormorant Garamond'", "Georgia", "serif"],
        sans: ["Jost", "system-ui", "sans-serif"]
      },
      transitionTimingFunction: { soft: "cubic-bezier(0.25, 0.6, 0.3, 1)" }
    }
  },
  plugins: []
};
