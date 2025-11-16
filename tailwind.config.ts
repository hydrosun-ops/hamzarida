import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
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
        wedding: {
          emerald: "hsl(var(--wedding-emerald))",
          ruby: "hsl(var(--wedding-ruby))",
          gold: "hsl(var(--wedding-gold))",
          cream: "hsl(var(--wedding-cream))",
          sage: "hsl(var(--wedding-sage))",
        },
        truck: {
          pink: "hsl(var(--truck-pink))",
          blue: "hsl(var(--truck-blue))",
          yellow: "hsl(var(--truck-yellow))",
          green: "hsl(var(--truck-green))",
          purple: "hsl(var(--truck-purple))",
          orange: "hsl(var(--truck-orange))",
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "spin-slow": {
          from: {
            transform: "rotate(0deg)",
          },
          to: {
            transform: "rotate(360deg)",
          },
        },
        "truck-drive": {
          "0%": {
            transform: "translateX(-100%) scale(0.8)",
            opacity: "0",
          },
          "50%": {
            opacity: "1",
          },
          "100%": {
            transform: "translateX(100vw) scale(0.8)",
            opacity: "0",
          },
        },
        "float": {
          "0%, 100%": {
            transform: "translateY(0px) rotate(0deg)",
          },
          "50%": {
            transform: "translateY(-20px) rotate(5deg)",
          },
        },
        "flower-bloom": {
          "0%": {
            transform: "scale(0) rotate(0deg)",
            opacity: "0",
          },
          "50%": {
            transform: "scale(1.2) rotate(180deg)",
            opacity: "1",
          },
          "100%": {
            transform: "scale(1) rotate(360deg)",
            opacity: "1",
          },
        },
        "shimmer": {
          "0%": {
            backgroundPosition: "-200% 0",
          },
          "100%": {
            backgroundPosition: "200% 0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "spin-slow": "spin-slow 8s linear infinite",
        "truck-drive": "truck-drive 8s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "flower-bloom": "flower-bloom 1s ease-out forwards",
        "shimmer": "shimmer 3s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
