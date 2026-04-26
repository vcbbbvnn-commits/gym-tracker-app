import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const initialForm = { email: "", full_name: "", password: "" };

const features = [
  { label: "Plans", value: "3", desc: "Ready-made training splits" },
  { label: "Logging", value: "Live", desc: "Sets, reps, and weight" },
  { label: "Review", value: "PR", desc: "Progress and history" },
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07090d] px-4 py-10 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-10%] h-96 w-96 bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] h-96 w-96 bg-lime-300/10 blur-3xl" />
      </div>

      <div className="relative z-10 grid w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-[#0b1017]/90 shadow-2xl shadow-black/40 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden min-h-[620px] flex-col justify-between border-r border-white/10 bg-black/20 p-10 lg:flex">
          <div>
            <div className="mb-10 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-300 to-lime-300 font-black text-slate-950">
                GT
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-[0.28em]">Gym Tracker</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-300/70">Performance Lab</p>
              </div>
            </div>

            <h1 className="max-w-xl text-6xl font-black uppercase leading-none tracking-normal" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              Training data, without the clutter.
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-slate-400">
              Choose a split, start a session, and keep every set organized in one focused workspace.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {features.map((feature) => (
              <div key={feature.label} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{feature.label}</p>
                <p className="mt-2 text-2xl font-black text-cyan-300">{feature.value}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="p-6 sm:p-10">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-300 to-lime-300 font-black text-slate-950">
              GT
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.24em]">Gym Tracker</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300/70">Performance Lab</p>
            </div>
          </div>

          <span className="section-badge mb-5 inline-flex">{mode === "login" ? "Welcome back" : "Create account"}</span>
          <h2 className="text-4xl font-black uppercase tracking-normal" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            {mode === "login" ? "Sign in" : "Start tracking"}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {mode === "login" ? "Continue your training dashboard." : "Set up your profile and begin your first plan."}
          </p>

          <div className="mt-8 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/25 p-1.5">
            {["login", "signup"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setMode(option);
                  setError("");
                }}
                className={`min-h-11 rounded-xl text-sm font-black capitalize transition ${
                  mode === option ? "bg-white text-slate-950" : "text-slate-500 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                {option === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-500" htmlFor="email">
                Email
              </label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} className="input-field" placeholder="athlete@example.com" required />
            </div>

            {mode === "signup" && (
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-500" htmlFor="full_name">
                  Full name
                </label>
                <input id="full_name" name="full_name" value={form.full_name} onChange={handleChange} className="input-field" placeholder="Alex Carter" required />
              </div>
            )}

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-500" htmlFor="password">
                Password
              </label>
              <input id="password" name="password" type="password" value={form.password} onChange={handleChange} className="input-field" placeholder="••••••••" required />
            </div>

            {error && <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">{error}</div>}

            <button type="submit" disabled={loading} className="btn-fire w-full justify-center">
              {loading ? "Please wait..." : mode === "signup" ? "Create Account" : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            {mode === "login" ? "Need an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError("");
              }}
              className="font-black text-cyan-300 transition hover:text-lime-300"
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
