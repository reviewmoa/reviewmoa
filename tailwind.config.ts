import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        ink: "var(--ink)",
        "ink-2": "var(--ink-2)",
        "ink-3": "var(--ink-3)",
        line: "var(--line)",
        "line-2": "var(--line-2)",
        accent: "var(--accent)",
        "accent-soft": "var(--accent-soft)",
        teal: "var(--teal)",
        "teal-soft": "var(--teal-soft)",
        blue: "var(--blue)",
        "blue-soft": "var(--blue-soft)",
        purple: "var(--purple)",
        "purple-soft": "var(--purple-soft)",
        amber: "var(--amber)",
        "amber-soft": "var(--amber-soft)",
        green: "var(--green)",
        "green-soft": "var(--green-soft)",
        red: "var(--red)",
        "red-soft": "var(--red-soft)"
      },
      fontFamily: {
        sans: ["var(--sans)"],
        serif: ["var(--serif)"],
        mono: ["var(--mono)"]
      },
      borderRadius: {
        card: "var(--radius)",
        chip: "var(--radius-sm)"
      },
      boxShadow: {
        card: "var(--shadow)",
        "card-lg": "var(--shadow-lg)"
      },
      keyframes: {
        fade: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" }
        }
      },
      animation: {
        fade: "fade 0.4s ease",
        "pulse-soft": "pulseSoft 1.4s ease infinite"
      }
    }
  },
  plugins: []
};

export default config;
