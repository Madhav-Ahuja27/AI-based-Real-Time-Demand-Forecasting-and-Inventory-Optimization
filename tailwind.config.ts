
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
        // Enhanced color palette with more vibrant and modern colors
        primary: {
          DEFAULT: '#4A6CF7', // Vibrant blue
          foreground: '#FFFFFF',
          light: '#7B9CFF',
          dark: '#3A5AD6'
        },
        secondary: {
          DEFAULT: '#6B48FF', // Rich purple
          foreground: '#FFFFFF',
          light: '#9370FF',
          dark: '#5A39D6'
        },
        accent: {
          DEFAULT: '#22D3EE', // Bright cyan
          foreground: '#FFFFFF',
          light: '#67E8F9',
          dark: '#0891B2'
        },
        background: {
          DEFAULT: '#F5F7FA', // Soft gray background
          dark: '#1A202C'
        },
        foreground: {
          DEFAULT: '#2D3748', // Deep gray text
          light: '#4A5568'
        },
        muted: {
          DEFAULT: '#E2E8F0', // Soft gray for muted elements
          foreground: '#718096'
        },
        success: {
          DEFAULT: '#48BB78', // Green for positive actions
          foreground: '#FFFFFF'
        },
        warning: {
          DEFAULT: '#ED8936', // Orange for warnings
          foreground: '#FFFFFF'
        },
        destructive: {
          DEFAULT: '#F56565', // Soft red for destructive actions
          foreground: '#FFFFFF'
        },
        border: '#E2E8F0'
      },
      borderRadius: {
        lg: '0.75rem', // Slightly more rounded corners
        md: 'calc(0.75rem - 2px)',
        sm: 'calc(0.75rem - 4px)'
      },
      boxShadow: {
        // Enhanced shadow for depth
        DEFAULT: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        md: '0 6px 12px -2px rgba(0, 0, 0, 0.1), 0 3px 6px -3px rgba(0, 0, 0, 0.05)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
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
        "subtle-bounce": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "subtle-bounce": "subtle-bounce 0.5s ease-in-out"
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

