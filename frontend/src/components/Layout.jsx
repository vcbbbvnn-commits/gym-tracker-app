import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const MOBILE_LINKS = [
  { to: "/", label: "Home", icon: "H" },
  { to: "/sessions", label: "Sessions", icon: "S" },
  { to: "/ai", label: "AI Coach", icon: "AI" },
  { to: "/progress", label: "Progress", icon: "P" },
  { to: "/strength", label: "Score", icon: "100" },
];

const DESKTOP_LINKS = [
  { to: "/", label: "Home", icon: "H" },
  { to: "/sessions", label: "Sessions", icon: "S" },
  { to: "/templates", label: "Programs", icon: "T" },
  { to: "/exercises", label: "Exercises", icon: "E" },
  { to: "/ai", label: "AI Coach", icon: "AI" },
  { to: "/coach", label: "Coach", icon: "C" },
  { to: "/strength", label: "Score", icon: "100" },
  { to: "/progress", label: "Progress", icon: "P" },
];

const GOALS = [
  { id: "gain", label: "Weight gain" },
  { id: "loss", label: "Weight loss" },
  { id: "recomp", label: "Recomposition" },
];

function getProfileKey(user) {
  return `gym_ai_profile_${user?.id || user?.email || "guest"}`;
}

function getSetupKey(user) {
  return `gym_user_dashboard_setup_${user?.id || user?.email || "guest"}`;
}

function UserDashboardPanel({ open, mode, user, onClose, onLogout, onSaved }) {
  const [profile, setProfile] = useState(null);
  const [bodyWeights, setBodyWeights] = useState([]);
  const [form, setForm] = useState({ currentWeight: "", targetWeight: "", goal: "recomp", bodyType: "average" });
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("gym_theme") || "dark");

  useEffect(() => {
    if (!open || !user) return;
    const savedProfile = localStorage.getItem(getProfileKey(user));
    const parsedProfile = savedProfile ? JSON.parse(savedProfile) : null;
    setProfile(parsedProfile);
    setForm({
      currentWeight: parsedProfile?.currentWeight || "",
      targetWeight: parsedProfile?.targetWeight || "",
      goal: parsedProfile?.goal || "recomp",
      bodyType: parsedProfile?.bodyType || "average",
    });
    api.get("/body-weight").then((r) => setBodyWeights(r.data || [])).catch(() => setBodyWeights([]));
  }, [open, user]);

  useEffect(() => {
    document.body.classList.toggle("theme-light", theme === "light");
    localStorage.setItem("gym_theme", theme);
  }, [theme]);

  if (!open) return null;

  const displayName = user?.full_name || user?.email?.split("@")[0] || "Athlete";
  const latestWeight = bodyWeights.length ? bodyWeights[bodyWeights.length - 1].weight_kg : profile?.currentWeight;
  const goalLabel = GOALS.find((goal) => goal.id === (profile?.goal || form.goal))?.label || "Not set";

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    const nextProfile = {
      ...(profile || {}),
      currentWeight: Number(form.currentWeight) || null,
      targetWeight: Number(form.targetWeight) || null,
      goal: form.goal,
      bodyType: form.bodyType,
      updatedAt: new Date().toISOString(),
      skipped: false,
    };
    localStorage.setItem(getProfileKey(user), JSON.stringify(nextProfile));
    localStorage.setItem(getSetupKey(user), "done");
    if (nextProfile.currentWeight) {
      api.post("/body-weight", { weight_kg: nextProfile.currentWeight }).catch(() => {});
    }
    setProfile(nextProfile);
    setSaving(false);
    onSaved?.();
  };

  const skipLater = () => {
    localStorage.setItem(getSetupKey(user), "skipped");
    onSaved?.();
  };

  return (
    <div className="fixed inset-0 z-[220] flex justify-end" style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(18px)" }} onClick={onClose}>
      <aside className="ios-slide-in h-full w-full max-w-md overflow-y-auto px-5 py-6 shadow-2xl" style={{ background: "var(--bg-primary)", borderLeft: "1px solid var(--separator)" }} onClick={(event) => event.stopPropagation()}>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <span className="section-badge mb-3 inline-flex">{mode === "setup" ? "Quick setup" : "Dashboard"}</span>
            <h2 className="text-4xl font-black uppercase text-white" style={{ fontFamily: "'Bebas Neue',sans-serif" }}>User Profile</h2>
            <p className="mt-1 text-sm text-white/40">{mode === "setup" ? "Complete this now, or skip and do it later." : "Your account, goal, weight, and app settings."}</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-xl text-white/50 transition hover:bg-white/10">X</button>
        </div>

        <div className="rounded-3xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--separator)" }}>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-black text-white" style={{ background: "linear-gradient(135deg,#ff6b00,#ff375f)" }}>
              {displayName[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xl font-black text-white">{displayName}</p>
              <p className="truncate text-sm text-white/40">{user?.email}</p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl p-3" style={{ background: "rgba(255,255,255,0.04)" }}>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Body weight</p>
              <p className="mt-1 text-2xl font-black text-white">{latestWeight ? `${latestWeight}kg` : "--"}</p>
            </div>
            <div className="rounded-2xl p-3" style={{ background: "rgba(255,255,255,0.04)" }}>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Goal</p>
              <p className="mt-1 text-sm font-black text-white">{goalLabel}</p>
            </div>
          </div>
        </div>

        <form onSubmit={saveProfile} className="mt-5 rounded-3xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--separator)" }}>
          <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-white/35">Profile details</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-white/35">Current weight</label>
              <input type="number" min="25" max="300" step="0.1" value={form.currentWeight} onChange={(e) => setForm((current) => ({ ...current, currentWeight: e.target.value }))} className="input-field" placeholder="72" />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-white/35">Goal weight</label>
              <input type="number" min="25" max="300" step="0.1" value={form.targetWeight} onChange={(e) => setForm((current) => ({ ...current, targetWeight: e.target.value }))} className="input-field" placeholder="78" />
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-white/35">Goal</label>
            <div className="grid grid-cols-3 gap-2">
              {GOALS.map((goal) => (
                <button key={goal.id} type="button" onClick={() => setForm((current) => ({ ...current, goal: goal.id }))} className="min-h-12 rounded-2xl px-2 text-xs font-black" style={form.goal === goal.id ? { background: "#ff6b00", color: "#000" } : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)" }}>
                  {goal.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-white/35">Body type</label>
            <select value={form.bodyType} onChange={(e) => setForm((current) => ({ ...current, bodyType: e.target.value }))} className="input-field">
              <option value="lean">Lean</option>
              <option value="average">Average</option>
              <option value="broad">Broad</option>
            </select>
          </div>
          <button type="submit" disabled={saving} className="btn-fire mt-5 w-full justify-center">{saving ? "Saving..." : "Save profile"}</button>
          {mode === "setup" && (
            <button type="button" onClick={skipLater} className="mt-3 w-full rounded-2xl py-3 text-sm font-black text-white/50 transition hover:bg-white/10">Skip, I will do it later</button>
          )}
        </form>

        <div className="mt-5 rounded-3xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--separator)" }}>
          <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-white/35">App settings</p>
          <div className="grid grid-cols-2 gap-2">
            {["dark", "light"].map((item) => (
              <button key={item} type="button" onClick={() => setTheme(item)} className="rounded-2xl py-3 text-sm font-black capitalize" style={theme === item ? { background: "#ff9500", color: "#000" } : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)" }}>
                {item}
              </button>
            ))}
          </div>
          <button type="button" onClick={onLogout} className="mt-4 w-full rounded-2xl py-3 text-sm font-black" style={{ background: "rgba(255,69,58,0.12)", color: "#ff453a" }}>Logout</button>
        </div>
      </aside>
    </div>
  );
}

function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const displayName = user?.full_name || user?.email?.split("@")[0] || "Athlete";
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [dashboardMode, setDashboardMode] = useState("dashboard");

  useEffect(() => {
    const savedTheme = localStorage.getItem("gym_theme") || "dark";
    document.body.classList.toggle("theme-light", savedTheme === "light");
  }, []);

  useEffect(() => {
    if (!user) return;
    const setupState = localStorage.getItem(getSetupKey(user));
    const hasProfile = localStorage.getItem(getProfileKey(user));
    if (!setupState && !hasProfile) {
      setDashboardMode("setup");
      setDashboardOpen(true);
    }
  }, [user]);

  const openDashboard = () => {
    setDashboardMode("dashboard");
    setDashboardOpen(true);
  };

  const handleLogout = () => {
    setDashboardOpen(false);
    logout();
  };

  return (
    <div className="relative min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <div className="relative min-h-screen">
        <header
          className={isHome ? "absolute left-0 right-0 top-0 z-50 px-5 pt-4 md:px-8" : "sticky top-0 z-50 px-5 md:px-8"}
          style={isHome ? {} : { background: "rgba(0,0,0,0.88)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)", borderBottom: "0.5px solid rgba(255,255,255,0.1)" }}
        >
          <div
            className={isHome ? "mx-auto flex max-w-[1400px] items-center justify-between rounded-2xl px-5 py-3.5" : "mx-auto flex max-w-[1400px] items-center justify-between py-3.5"}
            style={isHome ? { background: "rgba(0,0,0,0.55)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)", border: "0.5px solid rgba(255,255,255,0.12)" } : {}}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl text-xl" style={{ background: "linear-gradient(135deg,#ff6b00,#ff9a3d)", boxShadow: "0 4px 14px rgba(255,107,0,0.4)" }}>
                G
              </div>
              <div>
                <p className="text-base font-black uppercase tracking-[0.18em] text-white">Gym<span style={{ color: "#ff6b00" }}>.</span>Tracker</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.35)" }}>Train Elite</p>
              </div>
            </div>

            <nav className="hidden min-w-0 items-center gap-1 xl:flex">
              {DESKTOP_LINKS.map(({ to, label, icon }) => (
                <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                  <span>{icon}</span><span className="nav-label">{label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-2.5">
              <button type="button" onClick={openDashboard} className="hidden items-center gap-2.5 rounded-xl px-3 py-2 sm:flex" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-black text-white" style={{ background: "linear-gradient(135deg,#ff6b00,#ff375f)" }}>
                  {displayName[0]?.toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate text-sm font-medium text-white/75">{displayName}</span>
              </button>
              <button type="button" onClick={openDashboard} className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black text-white sm:hidden" style={{ background: "linear-gradient(135deg,#ff6b00,#ff375f)" }}>
                {displayName[0]?.toUpperCase()}
              </button>
            </div>
          </div>
        </header>

        <main className={isHome ? "" : "mx-auto max-w-[1400px] px-4 pb-20 pt-14 sm:px-6 lg:px-8"}>
          <Outlet />
        </main>

        <nav className="bottom-tab-bar xl:hidden">
          {MOBILE_LINKS.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => `tab-item ${isActive ? "active" : ""}`}>
              <span className="tab-icon">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <UserDashboardPanel
          open={dashboardOpen}
          mode={dashboardMode}
          user={user}
          onClose={() => setDashboardOpen(false)}
          onLogout={handleLogout}
          onSaved={() => setDashboardOpen(false)}
        />
      </div>
    </div>
  );
}

export default Layout;
