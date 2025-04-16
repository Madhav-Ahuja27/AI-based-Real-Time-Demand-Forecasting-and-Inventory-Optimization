
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        // Professional inventory management color palette
        primary: {
          DEFAULT: '#0284c7', // Strong blue
          foreground: '#FFFFFF',
          light: '#38bdf8',
          dark: '#0369a1'
        },
        secondary: {
          DEFAULT: '#6366f1', // Rich indigo
          foreground: '#FFFFFF',
          light: '#818cf8',
          dark: '#4f46e5'
        },
        accent: {
          DEFAULT: '#22d3ee', // Bright teal
          foreground: '#FFFFFF',
          light: '#67e8f9',
          dark: '#0891b2'
        },
        success: {
          DEFAULT: '#10b981', // Rich green
          foreground: '#FFFFFF',
          light: '#34d399',
          dark: '#059669'
        },
        warning: {
          DEFAULT: '#f59e0b', // Amber
          foreground: '#FFFFFF',
          light: '#fbbf24',
          dark: '#d97706'
        },
        background: {
          DEFAULT: '#f1f5f9', // Cool gray background
          dark: '#0f172a'
        },
        foreground: {
          DEFAULT: '#1e293b', // Deep gray text
          light: '#475569'
        },
        muted: {
          DEFAULT: '#e2e8f0', // Soft gray for muted elements
          foreground: '#64748b'
        },
        destructive: {
          DEFAULT: '#ef4444', // Soft red for destructive actions
          foreground: '#FFFFFF'
        },
        border: '#cbd5e1'
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      boxShadow: {
        // Enhanced shadow for depth
        DEFAULT: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        md: '0 6px 12px -2px rgba(0, 0, 0, 0.1), 0 3px 6px -3px rgba(0, 0, 0, 0.05)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      },
      scale: {
        '102': '1.02',
      },
      keyframes: {
        // Enhanced animations
        "accordion-down": {
          from: { height: "0", opacity: "0" },
          to: { height: "var(--radix-accordion-content-height)", opacity: "1" }
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)", opacity: "1" },
          to: { height: "0", opacity: "0" }
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "pulse-light": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" }
        },
        "inventory-alert": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "pulse-light": "pulse-light 2s ease-in-out infinite",
        "inventory-alert": "inventory-alert 2s ease-in-out infinite"
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
