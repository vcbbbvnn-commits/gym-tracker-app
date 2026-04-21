import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

function StatCounter({ end, suffix = "", label }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (end === 0) return;
    let start = 0;
    const duration = 1500;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end]);

  return (
    <div className="text-center">
      <p
        className="font-display text-3xl font-bold leading-none"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          background: "linear-gradient(135deg, #f97316 0%, #fbbf24 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {count}{suffix}
      </p>
      <p className="mt-1 text-xs font-medium tracking-widest text-gray-500 uppercase">{label}</p>
    </div>
  );
}

function FeatureCard({ icon, title, desc, color, delay }) {
  return (
    <div
      className="animate-fade-up"
      style={{ animationDelay: delay, opacity: 0 }}
    >
      <div
        className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-500 hover:-translate-y-2 cursor-default"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = color + "40";
          e.currentTarget.style.boxShadow = `0 20px 60px rgba(0,0,0,0.5), 0 0 30px ${color}15`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
          e.currentTarget.style.boxShadow = "0 10px 40px rgba(0,0,0,0.4)";
        }}
      >
        {/* Corner accent */}
        <div
          className="absolute top-0 right-0 h-20 w-20 opacity-5 group-hover:opacity-15 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at top right, ${color}, transparent)`,
          }}
        />

        <div
          className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}
        >
          {icon}
        </div>
        <h3
          className="mb-2 font-semibold text-white"
          style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "16px" }}
        >
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-gray-500">{desc}</p>

        {/* Bottom bar */}
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100"
          style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
        />
      </div>
    </div>
  );
}

function HomePage() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const loadWorkouts = async () => {
      try {
        const { data } = await api.get("/workouts");
        setWorkouts(data);
      } catch (error) {
        console.error("Failed to load workouts", error);
      } finally {
        setLoading(false);
      }
    };
    loadWorkouts();

    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const features = [
    {
      icon: "💪",
      title: "Track Every Rep",
      desc: "Log sets, reps, and weight with millisecond precision. Never miss a PR.",
      color: "#f97316",
      delay: "100ms",
    },
    {
      icon: "📈",
      title: "Monitor Progress",
      desc: "Visualize your gains over time. See your volume, PRs, and growth.",
      color: "#fbbf24",
      delay: "200ms",
    },
    {
      icon: "📋",
      title: "Smart Templates",
      desc: "Pre-built Push/Pull/Legs programs crafted by elite coaches.",
      color: "#a78bfa",
      delay: "300ms",
    },
    {
      icon: "⏱️",
      title: "Timed Sessions",
      desc: "Know exactly how long each workout takes. Optimize your time.",
      color: "#34d399",
      delay: "400ms",
    },
  ];

  return (
    <div className="relative">
      {/* =============================================
          HERO SECTION
          ============================================= */}
      <section className="relative min-h-[90vh] overflow-hidden rounded-3xl mb-8">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1800&q=90&fit=crop"
            alt="Gym background"
            className="h-full w-full object-cover object-center"
            style={{ filter: "brightness(0.35) contrast(1.1) saturate(0.8)" }}
          />
          {/* Overlays */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, rgba(8,10,14,0.92) 0%, rgba(8,10,14,0.6) 50%, rgba(8,10,14,0.4) 100%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to top, rgba(8,10,14,0.95) 0%, transparent 40%)",
            }}
          />
          {/* Orange glow */}
          <div
            className="absolute"
            style={{
              top: "20%",
              left: "5%",
              width: "400px",
              height: "400px",
              background: "radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex h-full min-h-[90vh] items-center px-8 py-20 lg:px-16">
          <div className="grid w-full items-center gap-12 lg:grid-cols-2">
            {/* Left: Text */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="animate-fade-up" style={{ animationDelay: "0ms", opacity: 0 }}>
                <span className="section-badge">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: "#f97316", boxShadow: "0 0 6px #f97316" }}
                  />
                  Elite Training Platform
                </span>
              </div>

              {/* Headline */}
              <div className="animate-fade-up space-y-2" style={{ animationDelay: "100ms", opacity: 0 }}>
                <h1
                  className="leading-none text-white"
                  style={{
                    fontFamily: "'Bebas Neue', 'Space Grotesk', sans-serif",
                    fontSize: "clamp(52px, 8vw, 96px)",
                    letterSpacing: "0.02em",
                    lineHeight: 0.95,
                  }}
                >
                  YOUR FITNESS
                  <br />
                  <span
                    style={{
                      background: "linear-gradient(135deg, #f97316 0%, #fbbf24 60%, #fb923c 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    JOURNEY
                  </span>
                  <br />
                  STARTS HERE
                </h1>
              </div>

              {/* Subtitle */}
              <p
                className="animate-fade-up max-w-lg text-base leading-relaxed text-gray-400"
                style={{ animationDelay: "200ms", opacity: 0 }}
              >
                Train with structure, track every rep, and watch yourself transform.
                Log workouts, monitor progress, and achieve the body you've always wanted.
              </p>

              {/* CTAs */}
              <div
                className="animate-fade-up flex flex-wrap items-center gap-4"
                style={{ animationDelay: "300ms", opacity: 0 }}
              >
                <Link to="/sessions" className="btn-fire">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Start Training
                </Link>
                <Link to="/templates" className="btn-ghost">
                  Browse Templates →
                </Link>
              </div>

              {/* Stats */}
              <div
                className="animate-fade-up"
                style={{ animationDelay: "400ms", opacity: 0 }}
              >
                <div
                  className="inline-flex items-center gap-8 rounded-2xl px-8 py-5"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <StatCounter end={workouts.length} label="Active Workouts" />
                  <div style={{ width: "1px", height: "36px", background: "rgba(255,255,255,0.08)" }} />
                  <StatCounter end={100} suffix="%" label="Dedication" />
                  <div style={{ width: "1px", height: "36px", background: "rgba(255,255,255,0.08)" }} />
                  <div className="text-center">
                    <p
                      className="font-display text-3xl font-bold leading-none"
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        background: "linear-gradient(135deg, #f97316 0%, #fbbf24 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      ∞
                    </p>
                    <p className="mt-1 text-xs font-medium tracking-widest text-gray-500 uppercase">Potential</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Floating Glass Cards */}
            <div className="relative hidden h-[500px] lg:block">
              {/* Floating Badge 1 */}
              <div
                className="floating-badge absolute"
                style={{
                  top: "8%",
                  right: "5%",
                  animationDelay: "0s",
                  minWidth: "170px",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
                    style={{ background: "rgba(249,115,22,0.2)", border: "1px solid rgba(249,115,22,0.3)" }}
                  >
                    🔥
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Today's Burn</p>
                    <p className="text-xs" style={{ color: "#f97316" }}>547 cal</p>
                  </div>
                </div>
              </div>

              {/* Floating Badge 2 */}
              <div
                className="floating-badge absolute"
                style={{
                  top: "35%",
                  right: "18%",
                  animationDelay: "2s",
                  minWidth: "200px",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
                    style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)" }}
                  >
                    🏆
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">New PR!</p>
                    <p className="text-xs text-gray-400">Bench Press 120kg</p>
                  </div>
                </div>
              </div>

              {/* Floating Badge 3 */}
              <div
                className="floating-badge absolute"
                style={{
                  bottom: "15%",
                  right: "8%",
                  animationDelay: "4s",
                  minWidth: "185px",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
                    style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.3)" }}
                  >
                    📈
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Weekly Volume</p>
                    <p className="text-xs" style={{ color: "#34d399" }}>+23% ↑</p>
                  </div>
                </div>
              </div>

              {/* Floating Badge 4 */}
              <div
                className="floating-badge absolute"
                style={{
                  bottom: "40%",
                  left: "5%",
                  animationDelay: "1.5s",
                  minWidth: "160px",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
                    style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)" }}
                  >
                    ⚡
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Streak</p>
                    <p className="text-xs" style={{ color: "#a78bfa" }}>14 Days 🔥</p>
                  </div>
                </div>
              </div>

              {/* Center decorative element */}
              <div
                className="absolute"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "200px",
                  height: "200px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)",
                  border: "1px solid rgba(249,115,22,0.12)",
                  animation: "float 8s ease-in-out infinite",
                }}
              />
              <div
                className="absolute"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  border: "1px solid rgba(249,115,22,0.2)",
                  animation: "float 6s ease-in-out infinite reverse",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* =============================================
          FEATURES SECTION
          ============================================= */}
      <section className="mb-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <span className="section-badge mb-3 inline-flex">What we offer</span>
            <h2
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Everything You Need to Crush It
            </h2>
          </div>
          <Link
            to="/sessions"
            className="hidden items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300 hover:-translate-y-1 sm:flex"
            style={{
              background: "rgba(249,115,22,0.1)",
              border: "1px solid rgba(249,115,22,0.25)",
              color: "#fb923c",
            }}
          >
            Get Started →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </section>

      {/* =============================================
          RECENT WORKOUTS
          ============================================= */}
      {workouts.length > 0 && (
        <section className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <span className="section-badge mb-3 inline-flex">Active Programs</span>
              <h2
                className="text-2xl font-bold text-white"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Your Workouts
              </h2>
            </div>
            <Link
              to="/sessions"
              className="text-sm font-semibold transition hover:text-orange-400"
              style={{ color: "#f97316" }}
            >
              View All →
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workouts.slice(0, 3).map((workout, idx) => (
              <Link
                key={workout.id}
                to={`/workouts/${workout.id}`}
                className="workout-card group block animate-fade-up"
                style={{ animationDelay: `${idx * 100}ms`, opacity: 0, textDecoration: "none" }}
              >
                {/* Top bar */}
                <div className="mb-4 flex items-center justify-between">
                  <div
                    className="rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-wider"
                    style={{
                      background: "rgba(249,115,22,0.15)",
                      color: "#f97316",
                      border: "1px solid rgba(249,115,22,0.25)",
                    }}
                  >
                    {workout.name}
                  </div>
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: "rgba(249,115,22,0.1)",
                      border: "1px solid rgba(249,115,22,0.2)",
                    }}
                  >
                    →
                  </div>
                </div>

                <h3
                  className="mb-2 text-lg font-bold text-white transition-colors group-hover:text-orange-400"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {workout.name} Session
                </h3>

                {workout.description && (
                  <p className="mb-4 text-sm text-gray-500 line-clamp-2">{workout.description}</p>
                )}

                <div className="fire-divider mb-4" />

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{workout.exercises?.length || 0} exercises</span>
                  <span className="text-orange-500">Open →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* =============================================
          CTA BANNER
          ============================================= */}
      <section>
        <div
          className="relative overflow-hidden rounded-3xl px-10 py-14 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(234,88,12,0.08) 50%, rgba(251,191,36,0.05) 100%)",
            border: "1px solid rgba(249,115,22,0.2)",
          }}
        >
          {/* Background glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: "radial-gradient(ellipse 60% 70% at 50% 50%, rgba(249,115,22,0.08) 0%, transparent 70%)",
            }}
          />

          <div className="relative">
            <p
              className="mb-3 text-sm font-bold uppercase tracking-widest"
              style={{ color: "#f97316" }}
            >
              Ready to Transform?
            </p>
            <h2
              className="mb-6 text-4xl font-bold text-white md:text-5xl"
              style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.05em" }}
            >
              BUILD THE BODY YOU WANT
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-gray-400">
              Stop procrastinating. Start your first session now and track every rep of your journey.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/sessions" className="btn-fire">
                🔥 Start First Session
              </Link>
              <Link to="/templates" className="btn-ghost">
                Browse Programs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
