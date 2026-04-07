/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./layouts/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        canvas: "#050505",
        panel: "#101010",
        panelAlt: "#16120e",
        line: "rgba(255,255,255,0.08)",
        brand: "#f59e0b",
        brandSoft: "#fbbf24",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
        chart: {
          1: "var(--chart-1)",
          2: "var(--chart-2)",
          3: "var(--chart-3)",
          4: "var(--chart-4)",
          5: "var(--chart-5)",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(245, 158, 11, 0.2), 0 20px 60px rgba(0, 0, 0, 0.45)",
      },
      backgroundImage: {
        aura:
          "radial-gradient(circle at top, rgba(245, 158, 11, 0.16), transparent 36%), radial-gradient(circle at bottom right, rgba(251, 191, 36, 0.12), transparent 28%)",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
        sans: ["ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};
