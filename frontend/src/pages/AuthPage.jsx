import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const initialForm = { email: "", full_name: "", password: "" };

const features = [
  { icon: "💪", title: "Workout Splits", desc: "Create and organize Push/Pull/Legs programs." },
  { icon: "📊", title: "Set Logging", desc: "Track reps, weight, and timestamps cleanly." },
  { icon: "📈", title: "Progress View", desc: "See volume, best lifts, and full history." },
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
      const payload =
        mode === "signup"
          ? form
          : { email: form.email, password: form.password };
      await authenticate(mode, payload);
      navigate("/");
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to authenticate right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-4 py-10 overflow-hidden"
      style={{ background: "#080a0e" }}
    >
      {/* Background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 30%, rgba(249,115,22,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 70%, rgba(234,88,12,0.05) 0%, transparent 50%)",
        }}
      />

      {/* Background image with heavy overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1600&q=80&fit=crop')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.04,
        }}
      />

      <div className="relative z-10 w-full max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          {/* =====================
              LEFT: Hero Panel
              ===================== */}
          <div
            className="hidden animate-fade-up overflow-hidden rounded-3xl p-10 lg:block"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
              border: "1px solid rgba(255,255,255,0.07)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
              minHeight: "560px",
              position: "relative",
            }}
          >
            {/* Orange glow in corner */}
            <div
              className="pointer-events-none absolute"
              style={{
                top: 0,
                right: 0,
                width: "300px",
                height: "300px",
                background: "radial-gradient(circle at top right, rgba(249,115,22,0.15) 0%, transparent 70%)",
              }}
            />

            <div className="relative flex h-full flex-col justify-between">
              <div>
                {/* Logo */}
                <div className="mb-8 flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
                    style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" }}
                  >
                    💪
                  </div>
                  <span
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: "22px",
                      letterSpacing: "0.15em",
                      color: "#fb923c",
                    }}
                  >
                    GYM TRACKER
                  </span>
                </div>

                {/* Headline */}
                <h1
                  className="mb-4 leading-none text-white"
                  style={{
                    fontFamily: "'Bebas Neue', 'Space Grotesk', sans-serif",
                    fontSize: "clamp(40px, 5vw, 60px)",
                    letterSpacing: "0.02em",
                    lineHeight: 0.95,
                  }}
                >
                  BUILD STRONGER
                  <br />
                  <span
                    style={{
                      background: "linear-gradient(135deg, #f97316 0%, #fbbf24 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    SESSIONS
                  </span>
                  <br />
                  NOT NOTES
                </h1>

                <p className="mb-8 max-w-md text-base leading-relaxed text-gray-500">
                  Plan Push/Pull/Legs routines, log sets in real time, and keep your
                  progress visible.
                </p>

                {/* Feature chips */}
                <div className="space-y-3">
                  {features.map(({ icon, title, desc }) => (
                    <div
                      key={title}
                      className="flex items-start gap-4 rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      <div
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-lg"
                        style={{
                          background: "rgba(249,115,22,0.15)",
                          border: "1px solid rgba(249,115,22,0.25)",
                        }}
                      >
                        {icon}
                      </div>
                      <div>
                        <p
                          className="font-semibold text-white"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          {title}
                        </p>
                        <p className="text-sm text-gray-500">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom stats strip */}
              <div
                className="mt-8 flex items-center justify-between rounded-2xl px-6 py-4"
                style={{
                  background: "rgba(249,115,22,0.08)",
                  border: "1px solid rgba(249,115,22,0.15)",
                }}
              >
                {[
                  ["350k+", "Athletes"],
                  ["99.9%", "Uptime"],
                  ["Free", "Forever"],
                ].map(([val, label]) => (
                  <div key={label} className="text-center">
                    <p
                      className="font-bold text-white"
                      style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "20px" }}
                    >
                      {val}
                    </p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* =====================
              RIGHT: Auth Form
              ===================== */}
          <div
            className="animate-fade-up rounded-3xl p-8 sm:p-10"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
              border: "1px solid rgba(255,255,255,0.07)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
              animationDelay: "150ms",
              opacity: 0,
            }}
          >
            {/* Mobile Logo */}
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
                style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" }}
              >
                💪
              </div>
              <span
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "20px",
                  letterSpacing: "0.12em",
                  color: "#fb923c",
                }}
              >
                GYM TRACKER
              </span>
            </div>

            <h2
              className="mb-2 text-2xl font-bold text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {mode === "login" ? "Welcome Back" : "Join the Elite"}
            </h2>
            <p className="mb-8 text-sm text-gray-500">
              {mode === "login"
                ? "Sign in to continue your training journey."
                : "Create your account and start tracking today."}
            </p>

            {/* Tab Toggle */}
            <div
              className="mb-8 flex rounded-2xl p-1"
              style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              {["login", "signup"].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => { setMode(option); setError(""); }}
                  className="flex-1 rounded-xl py-3 text-sm font-semibold capitalize transition-all duration-300"
                  style={
                    mode === option
                      ? {
                          background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                          color: "white",
                          boxShadow: "0 4px 15px rgba(249,115,22,0.35)",
                        }
                      : { color: "rgba(255,255,255,0.4)" }
                  }
                >
                  {option === "login" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>

            {/* Form */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="athlete@example.com"
                  required
                />
              </div>

              {mode === "signup" && (
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400" htmlFor="full_name">
                    Full Name
                  </label>
                  <input
                    id="full_name"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Alex Carter"
                    required
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div
                  className="rounded-xl px-4 py-3 text-sm"
                  style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-fire w-full justify-center"
                style={{ width: "100%", borderRadius: "12px" }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Please wait...
                  </span>
                ) : mode === "signup" ? (
                  "🚀 Create Account"
                ) : (
                  "🔥 Sign In"
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-gray-600">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
                className="font-semibold transition hover:text-orange-400"
                style={{ color: "#f97316" }}
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
