import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // 90s retro neon palette
        neon: {
          pink: "#ff2d95",
          cyan: "#00f0ff",
          green: "#39ff14",
          yellow: "#fff01f",
          purple: "#b026ff",
          orange: "#ff6e27",
          blue: "#4d4dff",
        },
        retro: {
          dark: "#0a0a1a",
          darker: "#050510",
          grid: "#1a1a3e",
          card: "#12122b",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 6px)",
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", "monospace"],
        pixel: ["var(--font-press-start)", "monospace"],
        retro: ["var(--font-vt323)", "monospace"],
      },
      boxShadow: {
        glow: "0 24px 80px -32px rgba(6, 78, 59, 0.35)",
        "glow-lg": "0 32px 100px -28px rgba(6, 78, 59, 0.4)",
        "glow-accent": "0 24px 80px -32px rgba(251, 146, 60, 0.25)",
        "neon-pink": "0 0 10px rgba(255, 45, 149, 0.25), 0 0 30px rgba(255, 45, 149, 0.1)",
        "neon-cyan": "0 0 10px rgba(0, 240, 255, 0.25), 0 0 30px rgba(0, 240, 255, 0.1)",
        "neon-green": "0 0 10px rgba(57, 255, 20, 0.25), 0 0 30px rgba(57, 255, 20, 0.1)",
        "neon-purple": "0 0 10px rgba(176, 38, 255, 0.25), 0 0 30px rgba(176, 38, 255, 0.1)",
      },
      animation: {
        "fade-in": "fade-in 0.6s ease forwards",
        "slide-up": "slide-up 0.6s ease forwards",
        "scale-in": "scale-in 0.5s ease forwards",
        "blink": "blink 1s step-end infinite",
        "scanline": "scanline 8s linear infinite",
        "glitch": "glitch 0.3s ease infinite",
        "float": "float 6s ease-in-out infinite",
        "rainbow": "rainbow 3s linear infinite",
        "marquee": "marquee 20s linear infinite",
        "star-field": "star-field 60s linear infinite",
        "crt-flicker": "crt-flicker 0.15s infinite",
        "rotate-slow": "rotate-slow 20s linear infinite",
        "pulse-neon": "pulse-neon 2s ease-in-out infinite",
        "typing": "typing 3.5s steps(40, end), blink-caret 0.75s step-end infinite",
        "vhs-track": "vhs-track 4s ease-in-out infinite",
        "pixel-in": "pixel-in 0.5s steps(8) forwards",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "blink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "scanline": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        "glitch": {
          "0%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 2px)" },
          "40%": { transform: "translate(-2px, -2px)" },
          "60%": { transform: "translate(2px, 2px)" },
          "80%": { transform: "translate(2px, -2px)" },
          "100%": { transform: "translate(0)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "rainbow": {
          "0%": { filter: "hue-rotate(0deg)" },
          "100%": { filter: "hue-rotate(360deg)" },
        },
        "marquee": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        "star-field": {
          "0%": { transform: "translateZ(0)" },
          "100%": { transform: "translateZ(200px)" },
        },
        "crt-flicker": {
          "0%": { opacity: "0.97" },
          "50%": { opacity: "1" },
          "100%": { opacity: "0.98" },
        },
        "rotate-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "pulse-neon": {
          "0%, 100%": { opacity: "1", textShadow: "0 0 20px currentColor, 0 0 40px currentColor" },
          "50%": { opacity: "0.8", textShadow: "0 0 10px currentColor, 0 0 20px currentColor" },
        },
        "typing": {
          from: { width: "0" },
          to: { width: "100%" },
        },
        "blink-caret": {
          "from, to": { borderColor: "transparent" },
          "50%": { borderColor: "#00f0ff" },
        },
        "vhs-track": {
          "0%, 100%": { transform: "translateX(0)", opacity: "1" },
          "10%": { transform: "translateX(-2px)", opacity: "0.95" },
          "20%": { transform: "translateX(0)", opacity: "1" },
          "50%": { transform: "translateX(1px)", opacity: "0.97" },
        },
        "pixel-in": {
          "0%": { opacity: "0", transform: "scale(0.5)", filter: "blur(4px)" },
          "100%": { opacity: "1", transform: "scale(1)", filter: "blur(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
