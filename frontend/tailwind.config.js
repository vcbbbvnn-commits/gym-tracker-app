/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Dark base palette
        void: "#080a0e",
        abyss: "#0c0f14",
        carbon: "#111418",
        iron: "#181c22",
        steel: "#1e2329",
        // Accent palette
        fire: "#f97316",      // orange fire
        ember: "#ea580c",     // deep orange
        blaze: "#fb923c",     // light orange
        amber: "#f59e0b",     // golden amber
        gold: "#fbbf24",      // bright gold
        ash: "#6b7280",       // muted gray
        // Kept for legacy compat
        midnight: "#08111f",
        ink: "#0f172a",
        cyanGlow: "#f97316",
        coral: "#ef4444",
        sand: "#fef3c7",
      },
      fontFamily: {
        display: ["'Bebas Neue'", "'Space Grotesk'", "sans-serif"],
        heading: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      boxShadow: {
        fire: "0 0 40px rgba(249,115,22,0.25), 0 0 80px rgba(249,115,22,0.1)",
        panel: "0 25px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
        glow: "0 0 30px rgba(249,115,22,0.4)",
        card: "0 8px 32px rgba(0,0,0,0.5)",
      },
      animation: {
        "fade-up": "fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "float": "float 6s ease-in-out infinite",
        "float-slow": "float 9s ease-in-out infinite",
        "float-fast": "float 4s ease-in-out infinite",
        "pulse-fire": "pulseFire 2s ease-in-out infinite",
        "slide-left": "slideLeft 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-right": "slideRight 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-in": "scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "shimmer": "shimmer 2.5s linear infinite",
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%": { transform: "translateY(-12px) rotate(1deg)" },
          "66%": { transform: "translateY(-6px) rotate(-1deg)" },
        },
        pulseFire: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(249,115,22,0.3)" },
          "50%": { boxShadow: "0 0 50px rgba(249,115,22,0.6), 0 0 80px rgba(249,115,22,0.2)" },
        },
        slideLeft: {
          "0%": { opacity: "0", transform: "translateX(-30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideRight: {
          "0%": { opacity: "0", transform: "translateX(30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
      },
      backgroundImage: {
        "fire-gradient": "linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)",
        "gold-gradient": "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
        "dark-gradient": "linear-gradient(180deg, #080a0e 0%, #0c0f14 40%, #111418 100%)",
        "card-gradient": "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
        "shimmer-gradient": "linear-gradient(90deg, transparent 0%, rgba(249,115,22,0.15) 50%, transparent 100%)",
      },
    },
  },
  plugins: [],
};
