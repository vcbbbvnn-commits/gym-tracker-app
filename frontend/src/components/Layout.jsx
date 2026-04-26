import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_LINKS = [
  { to: "/", label: "Home", icon: "⚡" },
  { to: "/sessions", label: "Sessions", icon: "🔥" },
  { to: "/templates", label: "Templates", icon: "📋" },
  { to: "/progress", label: "Progress", icon: "📈" },
];

function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const displayName = user?.full_name || user?.email?.split("@")[0] || "Athlete";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b111b] text-white">
      {!isHome && (
        <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(36,54,78,0.45),transparent_62%),linear-gradient(180deg,#111827_0%,#0c1320_45%,#0b111b_100%)]" />
      )}

      <div className={isHome ? "relative z-10 min-h-screen" : "relative z-10 min-h-screen"}>
        <header className={isHome ? "absolute left-0 right-0 top-0 z-50 px-6 pt-4 md:px-8" : "sticky top-0 z-50 border-b border-white/10 bg-[#111827]/88 px-6 backdrop-blur-xl md:px-8"}>
          <div
            className={
              isHome
                ? "mx-auto flex max-w-[1500px] items-center justify-between rounded-2xl border border-white/10 bg-black/25 px-6 py-4 shadow-2xl shadow-black/30 backdrop-blur-xl"
                : "mx-auto flex max-w-[1500px] items-center justify-between py-4"
            }
          >
            <div className="flex items-center gap-3">
              <div className={isHome ? "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-2xl" : "text-3xl text-orange-400"}>
                {isHome ? "💪" : "🏋️"}
              </div>
              <div>
                <p className="text-xl font-black uppercase tracking-[0.22em]">
                  <span className="text-orange-300">Gym</span> Tracker
                </p>
                <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-white/45">Train Elite</p>
              </div>
            </div>

            <nav className="hidden items-center gap-2 lg:flex">
              {NAV_LINKS.map(({ to, label, icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  className={({ isActive }) =>
                    `flex min-h-11 items-center gap-2 rounded-xl px-5 text-sm font-bold transition ${
                      isActive
                        ? "border border-orange-400/30 bg-orange-500/18 text-orange-300 shadow-lg shadow-orange-500/10"
                        : "border border-transparent text-white/62 hover:bg-white/[0.05] hover:text-white"
                    }`
                  }
                >
                  <span>{icon}</span>
                  {label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 sm:flex">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-xs font-black">
                  {displayName[0]?.toUpperCase()}
                </span>
                <span className="max-w-[110px] truncate text-sm text-white/80">{displayName}</span>
              </div>
              <button
                type="button"
                onClick={logout}
                className="min-h-10 rounded-xl border border-red-400/20 bg-red-500/10 px-4 text-sm font-bold text-red-300 transition hover:bg-red-500/18"
              >
                Logout
              </button>
            </div>
          </div>

          <nav className="mx-auto mt-3 grid max-w-[1500px] grid-cols-4 gap-2 rounded-xl border border-white/10 bg-black/25 p-2 backdrop-blur-xl lg:hidden">
            {NAV_LINKS.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `flex min-h-11 flex-col items-center justify-center rounded-lg text-[11px] font-bold ${
                    isActive ? "bg-orange-500/18 text-orange-300" : "text-white/55"
                  }`
                }
              >
                <span>{icon}</span>
                {label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className={isHome ? "" : "mx-auto max-w-[1500px] px-4 py-14 sm:px-6 lg:px-8"}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
