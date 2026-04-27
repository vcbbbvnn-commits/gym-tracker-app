import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_LINKS = [
  { to: "/",          label: "Home",      icon: "⚡" },
  { to: "/sessions",  label: "Sessions",  icon: "🏋️" },
  { to: "/templates", label: "Programs",  icon: "📋" },
  { to: "/progress",  label: "Progress",  icon: "📈" },
];

function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const displayName = user?.full_name || user?.email?.split("@")[0] || "Athlete";

  return (
    <div className="relative min-h-screen" style={{ background: "#000000" }}>
      <div className={isHome ? "relative min-h-screen" : "relative min-h-screen"}>

        {/* ── TOP HEADER ── */}
        <header
          className={isHome
            ? "absolute left-0 right-0 top-0 z-50 px-5 pt-4 md:px-8"
            : "sticky top-0 z-50 px-5 md:px-8"}
          style={isHome ? {} : {
            background: "rgba(0,0,0,0.88)",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            borderBottom: "0.5px solid rgba(255,255,255,0.1)"
          }}
        >
          <div className={isHome
            ? "mx-auto flex max-w-[1400px] items-center justify-between rounded-2xl px-5 py-3.5"
            : "mx-auto flex max-w-[1400px] items-center justify-between py-3.5"}
            style={isHome ? {
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
              border: "0.5px solid rgba(255,255,255,0.12)"
            } : {}}
          >
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
                style={{ background: "linear-gradient(135deg,#ff6b00,#ff9a3d)", boxShadow: "0 4px 14px rgba(255,107,0,0.4)" }}>
                💪
              </div>
              <div>
                <p className="text-base font-black uppercase tracking-[0.18em] text-white">
                  Gym<span style={{ color: "#ff6b00" }}>.</span>Tracker
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Train Elite
                </p>
              </div>
            </div>

            {/* Desktop nav */}
            <nav className="hidden items-center gap-1 lg:flex">
              {NAV_LINKS.map(({ to, label, icon }) => (
                <NavLink key={to} to={to} end={to === "/"}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`}>
                  <span>{icon}</span>{label}
                </NavLink>
              ))}
            </nav>

            {/* User + logout */}
            <div className="flex items-center gap-2.5">
              <div className="hidden items-center gap-2.5 rounded-xl px-3 py-2 sm:flex"
                style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-black text-white"
                  style={{ background: "linear-gradient(135deg,#ff6b00,#ff375f)" }}>
                  {displayName[0]?.toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate text-sm font-medium text-white/75">{displayName}</span>
              </div>
              <button type="button" onClick={logout}
                className="rounded-xl px-3.5 py-2 text-sm font-semibold transition"
                style={{ background: "rgba(255,69,58,0.12)", color: "#ff453a" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,69,58,0.2)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,69,58,0.12)"}>
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* ── MAIN CONTENT ── */}
        <main className={isHome ? "" : "mx-auto max-w-[1400px] px-4 pb-28 pt-14 sm:px-6 lg:px-8"}>
          <Outlet />
        </main>

        {/* ── BOTTOM TAB BAR (mobile) ── */}
        <nav className="bottom-tab-bar lg:hidden">
          {NAV_LINKS.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} end={to === "/"}
              className={({ isActive }) => `tab-item ${isActive ? "active" : ""}`}>
              <span className="tab-icon">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}

export default Layout;
