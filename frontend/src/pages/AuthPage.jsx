import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  email: "",
  full_name: "",
  password: "",
};

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
      const payload =
        mode === "signup"
          ? form
          : {
              email: form.email,
              password: form.password,
            };
      await authenticate(mode, payload);
      navigate("/");
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to authenticate right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="panel hidden overflow-hidden p-10 lg:block">
          <div className="flex h-full flex-col justify-between">
            <div className="space-y-5">
              <p className="font-display text-xs uppercase tracking-[0.4em] text-cyanGlow">
                Gym Workout Tracker
              </p>
              <h1 className="max-w-xl font-display text-5xl leading-tight text-sand">
                Build stronger sessions, not scattered notes.
              </h1>
              <p className="max-w-xl text-lg text-slate-300">
                Plan Push/Pull/Legs routines, log sets in real time, and keep your progress visible.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["Workout Splits", "Create and organize recurring sessions."],
                ["Set Logging", "Track reps, weight, and timestamps cleanly."],
                ["Progress View", "See volume, best lifts, and history."],
              ].map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <h2 className="font-display text-lg text-sand">{title}</h2>
                  <p className="mt-2 text-sm text-slate-300">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="panel p-8 sm:p-10">
          <div className="mb-8 flex rounded-full border border-white/10 bg-white/5 p-1">
            {["login", "signup"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setMode(option)}
                className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold capitalize transition ${
                  mode === option ? "bg-cyanGlow text-slate-950" : "text-slate-300 hover:bg-white/10"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-slate-100 outline-none transition focus:border-cyanGlow"
                placeholder="athlete@example.com"
                required
              />
            </div>

            {mode === "signup" ? (
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200" htmlFor="full_name">
                  Full name
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-slate-100 outline-none transition focus:border-cyanGlow"
                  placeholder="Alex Carter"
                  required
                />
              </div>
            ) : null}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-slate-100 outline-none transition focus:border-cyanGlow"
                placeholder="••••••••"
                required
              />
            </div>

            {error ? <p className="rounded-2xl bg-coral/10 px-4 py-3 text-sm text-coral">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-sand px-4 py-3 font-display text-base text-slate-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Please wait..." : mode === "signup" ? "Create account" : "Sign in"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default AuthPage;
