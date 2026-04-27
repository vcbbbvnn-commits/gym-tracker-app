import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_LINKS = [
  { to: "/",          label: "Home",      icon: "⚡" },
  { to: "/sessions",  label: "Sessions",  icon: "🏋️" },
  { to: "/templates", label: "Templates", icon: "📋" },
  { to: "/progress",  label: "Progress",  icon: "📈" },
];

function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const displayName = user?.full_name || user?.email?.split("@")[0] || "Athlete";

  return (
    <div className="relative min-h-screen overflow-hidden text-white" style={{ background: "#0d0a1a" }}>
      {/* Ambient glow orbs */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-[-8%] top-[-6%] h-[420px] w-[420px] rounded-full blur-[120px]"
          style={{ background: "rgba(124,58,237,0.15)" }} />
        <div className="absolute right-[-8%] top-[10%] h-[320px] w-[320px] rounded-full blur-[100px]"
          style={{ background: "rgba(236,72,153,0.12)" }} />
        <div className="absolute bottom-[-5%] left-[40%] h-[280px] w-[280px] rounded-full blur-[110px]"
          style={{ background: "rgba(124,58,237,0.08)" }} />
      </div>

      <div className="relative z-10 min-h-screen">
        {/* ── HEADER ── */}
        <header
          className={
            isHome
              ? "absolute left-0 right-0 top-0 z-50 px-6 pt-4 md:px-8"
              : "sticky top-0 z-50 border-b px-6 backdrop-blur-xl md:px-8"
          }
          style={isHome ? {} : { borderColor: "rgba(124,58,237,0.2)", background: "rgba(13,10,26,0.88)" }}
        >
          <div
            className={
              isHome
                ? "mx-auto flex max-w-[1500px] items-center justify-between rounded-2xl px-6 py-4 shadow-2xl backdrop-blur-xl"
                : "mx-auto flex max-w-[1500px] items-center justify-between py-4"
            }
            style={isHome ? {
              background: "rgba(13,10,26,0.75)",
              border: "1px solid rgba(124,58,237,0.22)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(168,85,247,0.08)"
            } : {}}
          >
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl text-xl font-black"
                style={{ background: "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)", boxShadow: "0 4px 18px rgba(124,58,237,0.45)" }}
              >
                💪
              </div>
              <div>
                <p className="text-xl font-black uppercase tracking-[0.22em]">
                  <span style={{ background: "linear-gradient(135deg,#a855f7,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    Gym
                  </span>{" "}
                  Tracker
                </p>
                <p className="text-[11px] font-bold uppercase tracking-[0.26em]" style={{ color: "rgba(168,85,247,0.6)" }}>
                  Train Elite
                </p>
              </div>
            </div>

            {/* Desktop nav */}
            <nav className="hidden items-center gap-1.5 lg:flex">
              {NAV_LINKS.map(({ to, label, icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  className={({ isActive }) =>
                    `flex min-h-10 items-center gap-2 rounded-xl px-4 text-sm font-bold transition ${
                      isActive
                        ? "pill-active"
                        : "text-white/55 hover:bg-white/[0.05] hover:text-white"
                    }`
                  }
                >
                  <span>{icon}</span>
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* User area */}
            <div className="flex items-center gap-3">
              <div
                className="hidden items-center gap-3 rounded-xl px-3 py-2 sm:flex"
                style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(168,85,247,0.2)" }}
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-black text-white"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
                >
                  {displayName[0]?.toUpperCase()}
                </span>
                <span className="max-w-[110px] truncate text-sm text-white/75">{displayName}</span>
              </div>
              <button
                type="button"
                onClick={logout}
                className="min-h-10 rounded-xl px-4 text-sm font-bold transition"
                style={{ background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.22)", color: "#f472b6" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(236,72,153,0.18)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(236,72,153,0.1)"; }}
              >
                Logout
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          <nav
            className="mx-auto mt-3 grid max-w-[1500px] grid-cols-4 gap-2 rounded-xl p-2 backdrop-blur-xl lg:hidden"
            style={{ border: "1px solid rgba(124,58,237,0.2)", background: "rgba(13,10,26,0.85)" }}
          >
            {NAV_LINKS.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `flex min-h-11 flex-col items-center justify-center rounded-lg text-[11px] font-bold transition ${
                    isActive ? "text-purple-300" : "text-white/50"
                  }`
                }
                style={({ isActive }) => isActive ? {
                  background: "linear-gradient(135deg,rgba(124,58,237,0.22),rgba(236,72,153,0.12))"
                } : {}}
              >
                <span>{icon}</span>
                {label}
              </NavLink>
            ))}
          </nav>
        </header>

        {/* ── MAIN ── */}
        <main className={isHome ? "" : "mx-auto max-w-[1500px] px-4 py-14 sm:px-6 lg:px-8"}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
