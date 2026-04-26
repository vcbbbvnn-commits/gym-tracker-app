/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Dark base palette
        void: "#07090d",
        abyss: "#0b1017",
        carbon: "#0d1219",
        iron: "#141a22",
        steel: "#202833",
        signal: "#a3e635",
        aqua: "#22d3ee",
        violetCore: "#8b5cf6",
        roseCore: "#fb7185",
        ash: "#6b7280",       // muted gray
        // Kept for legacy compat
        midnight: "#08111f",
        ink: "#0f172a",
        cyanGlow: "#22d3ee",
        coral: "#fb7185",
        sand: "#f8fafc",
      },
      fontFamily: {
        display: ["'Bebas Neue'", "'Space Grotesk'", "sans-serif"],
        heading: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      boxShadow: {
        fire: "0 0 40px rgba(34,211,238,0.22), 0 0 80px rgba(163,230,53,0.1)",
        panel: "0 25px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
        glow: "0 0 30px rgba(34,211,238,0.32)",
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
          "0%, 100%": { boxShadow: "0 0 20px rgba(34,211,238,0.22)" },
          "50%": { boxShadow: "0 0 50px rgba(34,211,238,0.34), 0 0 80px rgba(163,230,53,0.16)" },
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
        "fire-gradient": "linear-gradient(135deg, #22d3ee 0%, #a3e635 100%)",
        "gold-gradient": "linear-gradient(135deg, #a3e635 0%, #22d3ee 100%)",
        "dark-gradient": "linear-gradient(180deg, #07090d 0%, #0b1017 45%, #0d1219 100%)",
        "card-gradient": "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
        "shimmer-gradient": "linear-gradient(90deg, transparent 0%, rgba(34,211,238,0.15) 50%, transparent 100%)",
      },
    },
  },
  plugins: [],
};
