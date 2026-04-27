import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const initialForm = { email: "", full_name: "", password: "" };

const features = [
  { label: "Plans",   value: "3",    desc: "Ready-made training splits" },
  { label: "Logging", value: "Live", desc: "Sets, reps, and weight" },
  { label: "Review",  value: "PR",   desc: "Progress and history" },
];

function AuthPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { authenticate } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = mode === "signup" ? form : { email: form.email, password: form.password };
      await authenticate(mode, payload);
      navigate("/");
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to authenticate right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 text-white"
      style={{ background: "#0d0a1a" }}>

      {/* Ambient orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-10%] h-[420px] w-[420px] rounded-full blur-[130px]"
          style={{ background: "rgba(124,58,237,0.2)" }} />
        <div className="absolute bottom-[-10%] right-[-8%] h-[380px] w-[380px] rounded-full blur-[120px]"
          style={{ background: "rgba(236,72,153,0.16)" }} />
        <div className="absolute right-[30%] top-[30%] h-[220px] w-[220px] rounded-full blur-[100px]"
          style={{ background: "rgba(124,58,237,0.1)" }} />
      </div>

      <div
        className="relative z-10 grid w-full max-w-6xl overflow-hidden rounded-3xl shadow-2xl lg:grid-cols-[1.05fr_0.95fr]"
        style={{ background: "rgba(18,14,34,0.92)", border: "1px solid rgba(124,58,237,0.22)", boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(168,85,247,0.1)" }}
      >
        {/* ── LEFT PANEL ── */}
        <section
          className="hidden min-h-[620px] flex-col justify-between p-10 lg:flex"
          style={{ borderRight: "1px solid rgba(124,58,237,0.15)", background: "rgba(0,0,0,0.25)" }}
        >
          {/* Gradient spot */}
          <div className="absolute left-0 top-0 h-[260px] w-[260px] rounded-full blur-[90px] opacity-40"
            style={{ background: "rgba(124,58,237,0.35)" }} />

          <div className="relative z-10">
            <div className="mb-10 flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl font-black text-white"
                style={{ background: "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)", boxShadow: "0 4px 20px rgba(124,58,237,0.5)" }}
              >
                💪
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-[0.28em]">Gym Tracker</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: "rgba(168,85,247,0.65)" }}>
                  Performance Lab
                </p>
              </div>
            </div>

            <h1
              className="max-w-xl text-6xl font-black uppercase leading-none tracking-normal text-white"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              Training data,{" "}
              <span style={{
                background: "linear-gradient(135deg, #a855f7, #ec4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                without the clutter.
              </span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-7" style={{ color: "rgba(255,255,255,0.45)" }}>
              Choose a split, start a session, and keep every set organized in one focused workspace.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-3">
            {features.map((feature) => (
              <div
                key={feature.label}
                className="rounded-2xl p-4"
                style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.22)" }}
              >
                <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: "rgba(168,85,247,0.55)" }}>
                  {feature.label}
                </p>
                <p className="mt-2 text-2xl font-black" style={{
                  background: "linear-gradient(135deg, #a855f7, #ec4899)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  {feature.value}
                </p>
                <p className="mt-1 text-xs leading-5" style={{ color: "rgba(255,255,255,0.35)" }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── RIGHT PANEL (Form) ── */}
        <section className="p-6 sm:p-10">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl font-black text-white"
              style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
            >
              💪
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.24em]">Gym Tracker</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "rgba(168,85,247,0.6)" }}>
                Performance Lab
              </p>
            </div>
          </div>

          <span className="section-badge mb-5 inline-flex">
            {mode === "login" ? "Welcome back" : "Create account"}
          </span>
          <h2 className="text-4xl font-black uppercase tracking-normal text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            {mode === "login" ? "Sign in" : "Start tracking"}
          </h2>
          <p className="mt-2 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            {mode === "login" ? "Continue your training dashboard." : "Set up your profile and begin your first plan."}
          </p>

          {/* Tab switcher */}
          <div
            className="mt-8 grid grid-cols-2 gap-2 rounded-2xl p-1.5"
            style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(124,58,237,0.2)" }}
          >
            {["login", "signup"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => { setMode(option); setError(""); }}
                className="min-h-11 rounded-xl text-sm font-black capitalize transition"
                style={
                  mode === option
                    ? { background: "linear-gradient(135deg,#7c3aed,#ec4899)", color: "white", boxShadow: "0 4px 16px rgba(124,58,237,0.4)" }
                    : { color: "rgba(255,255,255,0.4)" }
                }
              >
                {option === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em]"
                style={{ color: "rgba(168,85,247,0.7)" }} htmlFor="email">
                Email
              </label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange}
                className="input-field" placeholder="athlete@example.com" required />
            </div>

            {mode === "signup" && (
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em]"
                  style={{ color: "rgba(168,85,247,0.7)" }} htmlFor="full_name">
                  Full name
                </label>
                <input id="full_name" name="full_name" value={form.full_name} onChange={handleChange}
                  className="input-field" placeholder="Alex Carter" required />
              </div>
            )}

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em]"
                style={{ color: "rgba(168,85,247,0.7)" }} htmlFor="password">
                Password
              </label>
              <input id="password" name="password" type="password" value={form.password} onChange={handleChange}
                className="input-field" placeholder="••••••••" required />
            </div>

            {error && (
              <div className="rounded-xl px-4 py-3 text-sm"
                style={{ background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.25)", color: "#f472b6" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-fire w-full justify-center">
              {loading ? "Please wait..." : mode === "signup" ? "Create Account" : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            {mode === "login" ? "Need an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
              className="font-black transition"
              style={{ color: "#c084fc" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#f472b6"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#c084fc"; }}
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </section>
      </div>
    </div>
  );
}

export default AuthPage;
