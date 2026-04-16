import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const linkClass = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition ${
    isActive
      ? "bg-cyanGlow text-slate-950"
      : "bg-white/5 text-slate-200 hover:bg-white/10"
  }`;

function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="panel animate-fade-up px-6 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-display text-xs uppercase tracking-[0.35em] text-cyanGlow">
                Gym Workout Tracker
              </p>
              <h1 className="mt-2 font-display text-3xl text-sand">
                Train with structure, track with clarity.
              </h1>
              <p className="mt-2 text-sm text-slate-300">
                Signed in as {user?.full_name || "Athlete"}.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <NavLink to="/" className={linkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/progress" className={linkClass}>
                Progress
              </NavLink>
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-coral/40 px-4 py-2 text-sm font-semibold text-coral transition hover:bg-coral/10"
              >
                Logout
              </button>
            </div>
          </div>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
