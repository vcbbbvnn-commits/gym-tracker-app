import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef } from "react";

// Floating particles component
function Particles() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const particles = [];
    const count = 18;

    for (let i = 0; i < count; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      const size = Math.random() * 4 + 1;
      const left = Math.random() * 100;
      const delay = Math.random() * 15;
      const duration = Math.random() * 12 + 10;
      p.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${left}%;
        bottom: -10px;
        animation-duration: ${duration}s;
        animation-delay: ${delay}s;
        opacity: ${Math.random() * 0.6 + 0.2};
      `;
      container.appendChild(p);
      particles.push(p);
    }

    return () => particles.forEach((p) => p.remove());
  }, []);

  return <div ref={containerRef} className="particles-bg" />;
}

const NAV_LINKS = [
  { to: "/", label: "Home", icon: "⚡" },
  { to: "/sessions", label: "Sessions", icon: "🔥" },
  { to: "/templates", label: "Templates", icon: "📋" },
  { to: "/progress", label: "Progress", icon: "📈" },
];

function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="relative min-h-screen" style={{ background: "#080a0e" }}>
      {/* Animated particles */}
      <Particles />

      {/* Background glow spots */}
      <div
        className="fixed pointer-events-none"
        style={{
          top: "-20%",
          left: "-10%",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 70%)",
          zIndex: 0,
        }}
      />
      <div
        className="fixed pointer-events-none"
        style={{
          bottom: "-20%",
          right: "-10%",
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, rgba(234,88,12,0.05) 0%, transparent 70%)",
          zIndex: 0,
        }}
      />

      {/* Main Layout */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <header
          className="sticky top-4 z-50 mb-8 animate-fade-in"
          style={{ animationDelay: "0ms" }}
        >
          <div
            className="flex items-center justify-between rounded-2xl px-6 py-4"
            style={{
              background: "rgba(8,10,14,0.85)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" }}
              >
                <span className="text-lg">💪</span>
              </div>
              <div>
                <p
                  className="font-display text-xl leading-none tracking-widest"
                  style={{ color: "#fb923c", fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.15em" }}
                >
                  GYM TRACKER
                </p>
                <p
                  className="text-xs font-medium tracking-widest"
                  style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.2em", fontSize: "9px" }}
                >
                  TRAIN ELITE
                </p>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="hidden items-center gap-1 lg:flex">
              {NAV_LINKS.map(({ to, label, icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? "text-white"
                        : "text-gray-400 hover:text-gray-200"
                    }`
                  }
                  style={({ isActive }) =>
                    isActive
                      ? {
                          background:
                            "linear-gradient(135deg, rgba(249,115,22,0.2) 0%, rgba(234,88,12,0.1) 100%)",
                          border: "1px solid rgba(249,115,22,0.35)",
                          color: "#fb923c",
                        }
                      : {
                          background: "transparent",
                          border: "1px solid transparent",
                        }
                  }
                >
                  <span className="text-base">{icon}</span>
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {user && (
                <div className="hidden items-center gap-3 sm:flex">
                  <div
                    className="flex items-center gap-2 rounded-xl px-3 py-2"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
                      style={{
                        background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                        color: "white",
                      }}
                    >
                      {(user.full_name || user.email || "U")[0].toUpperCase()}
                    </div>
                    <span className="max-w-[100px] truncate text-xs text-gray-300">
                      {user.full_name || user.email?.split("@")[0]}
                    </span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={logout}
                className="rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 hover:scale-105"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  color: "#f87171",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(239,68,68,0.2)";
                  e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(239,68,68,0.1)";
                  e.currentTarget.style.borderColor = "rgba(239,68,68,0.25)";
                }}
              >
                Logout
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          <div
            className="mt-2 flex items-center gap-1 overflow-x-auto rounded-xl px-4 py-3 lg:hidden"
            style={{
              background: "rgba(8,10,14,0.9)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {NAV_LINKS.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `flex flex-shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                    isActive ? "text-orange-400" : "text-gray-400"
                  }`
                }
                style={({ isActive }) =>
                  isActive
                    ? {
                        background: "rgba(249,115,22,0.15)",
                        border: "1px solid rgba(249,115,22,0.3)",
                      }
                    : { border: "1px solid transparent" }
                }
              >
                <span>{icon}</span>
                {label}
              </NavLink>
            ))}
          </div>
        </header>

        {/* Page Content */}
        <main className="relative">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="mt-16 text-center">
          <div className="fire-divider mb-6" />
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
            © 2026 GYM TRACKER — TRAIN HARD. TRACK HARDER.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default Layout;
