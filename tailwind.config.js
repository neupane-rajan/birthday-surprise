/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cosmic: "#0D0D1A",
        accent: {
          magenta: "#FF3AF2",
          cyan: "#00F5D4",
          yellow: "#FFE600",
          orange: "#FF6B35",
          purple: "#7B2FFF"
        }
      },
      fontFamily: {
        heading: ["Outfit", "Unbounded", "system-ui", "sans-serif"],
        body: ["DM Sans", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

