import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_LINKS = [
  { to: "/", label: "Home", icon: "⌂" },
  { to: "/sessions", label: "Sessions", icon: "▣" },
  { to: "/templates", label: "Plans", icon: "◫" },
  { to: "/progress", label: "Progress", icon: "⌁" },
];

function Layout() {
  const { user, logout } = useAuth();
  const displayName = user?.full_name || user?.email?.split("@")[0] || "Athlete";

  return (
    <div className="relative min-h-screen bg-[#07090d] text-slate-100">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-0 top-0 h-80 w-80 bg-cyan-400/10 blur-3xl" />
        <div className="absolute right-0 top-20 h-80 w-80 bg-lime-300/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1500px] flex-col px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <header className="sticky top-4 z-50 mb-8">
          <div className="rounded-2xl border border-white/10 bg-[#0b0f15]/85 px-4 py-3 shadow-2xl shadow-black/30 backdrop-blur-2xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-300 to-lime-300 text-lg font-black text-slate-950">
                  GT
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.28em] text-white">Gym Tracker</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-300/70">Performance Lab</p>
                </div>
              </div>

              <nav className="hidden items-center gap-1 lg:flex">
                {NAV_LINKS.map(({ to, label, icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === "/"}
                    className={({ isActive }) =>
                      `flex min-h-10 items-center gap-2 rounded-xl px-4 text-sm font-bold transition ${
                        isActive
                          ? "bg-white text-slate-950 shadow-lg shadow-cyan-400/10"
                          : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                      }`
                    }
                  >
                    <span className="text-base">{icon}</span>
                    {label}
                  </NavLink>
                ))}
              </nav>

              <div className="flex items-center gap-2">
                {user && (
                  <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 sm:flex">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-300 text-xs font-black text-slate-950">
                      {displayName[0]?.toUpperCase()}
                    </div>
                    <span className="max-w-[120px] truncate text-xs font-semibold text-slate-300">{displayName}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={logout}
                  className="min-h-10 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 text-sm font-bold text-rose-300 transition hover:bg-rose-400/15"
                >
                  Logout
                </button>
              </div>
            </div>

            <nav className="mt-3 grid grid-cols-4 gap-2 lg:hidden">
              {NAV_LINKS.map(({ to, label, icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  className={({ isActive }) =>
                    `flex min-h-12 flex-col items-center justify-center rounded-xl text-[11px] font-bold transition ${
                      isActive ? "bg-white text-slate-950" : "bg-white/[0.035] text-slate-400"
                    }`
                  }
                >
                  <span className="text-base leading-none">{icon}</span>
                  <span className="mt-1">{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </header>

        <main className="relative flex-1">
          <Outlet />
        </main>

        <footer className="mt-14 border-t border-white/10 pt-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
            © 2026 Gym Tracker · Train with data
          </p>
        </footer>
      </div>
    </div>
  );
}

export default Layout;
