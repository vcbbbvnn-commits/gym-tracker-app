import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Muscle group images from Unsplash
const MUSCLE_IMAGES = {
  CHEST:    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&q=85&fit=crop",
  BACK:     "https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=500&q=85&fit=crop",
  LEGS:     "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&q=85&fit=crop",
  SHOULDERS:"https://images.unsplash.com/photo-1581009137042-c552e485697a?w=500&q=85&fit=crop",
  ARMS:     "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=500&q=85&fit=crop",
  PUSH:     "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&q=85&fit=crop",
  PULL:     "https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=500&q=85&fit=crop",
  UPPER:    "https://images.unsplash.com/photo-1581009137042-c552e485697a?w=500&q=85&fit=crop",
  LOWER:    "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&q=85&fit=crop",
};

function getHour() { return new Date().getHours(); }
function getGreeting() {
  const h = getHour();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

// Circular Activity Ring (SVG)
function ActivityRing({ value, max, color, size = 80, stroke = 9, label, sublabel }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const offset = circ * (1 - pct);
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="ring-svg" style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`${color}22`} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.34,1.56,0.64,1)", filter: `drop-shadow(0 0 6px ${color}88)` }} />
      </svg>
      <div className="text-center">
        <p className="text-sm font-black text-white">{label}</p>
        <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>{sublabel}</p>
      </div>
    </div>
  );
}

function StatBadge({ icon, title, value, color }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl p-4"
      style={{ background: "rgba(28,28,30,0.8)", border: "0.5px solid rgba(255,255,255,0.1)" }}>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
        style={{ background: `${color}18` }}>{icon}</div>
      <div>
        <p className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.45)" }}>{title}</p>
        <p className="text-sm font-black text-white">{value}</p>
      </div>
    </div>
  );
}

function HomePage() {
  const { user } = useAuth();
  const displayName = user?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Athlete";

  return (
    <section className="relative min-h-screen overflow-hidden" style={{ background: "#000" }}>
      {/* Bodybuilder hero image */}
      <img
        src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=1800&q=90&fit=crop"
        alt="Bodybuilder lifting"
        className="absolute inset-0 h-full w-full object-cover object-center"
        style={{ filter: "brightness(0.35) contrast(1.1)" }}
      />

      {/* Dark overlay gradient */}
      <div className="absolute inset-0"
        style={{ background: "linear-gradient(to right, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.1) 100%)" }} />
      <div className="absolute inset-0"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.98) 0%, transparent 50%)" }} />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1400px] items-center px-6 pb-20 pt-32 md:px-10">
        <div className="max-w-2xl">

          {/* Greeting */}
          <div className="mb-4 flex items-center gap-2.5">
            <div className="h-2 w-2 rounded-full animate-pulse" style={{ background: "#30d158" }} />
            <span className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.55)" }}>
              {getGreeting()}, {displayName}
            </span>
          </div>

          {/* Hero headline */}
          <h1 className="text-[60px] font-black uppercase leading-[0.9] text-white md:text-[88px]"
            style={{ fontFamily: "'Bebas Neue', sans-serif", textShadow: "0 4px 24px rgba(0,0,0,0.6)" }}>
            Push Your<br />
            <span style={{
              background: "linear-gradient(135deg, #ff6b00 0%, #ff9a3d 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
            }}>Limits</span><br />
            Every Day
          </h1>

          <p className="mb-10 max-w-md text-base font-medium leading-relaxed text-white/50 md:text-lg">
            Track every set, crush every PR, and follow elite training programs
            — all in one premium app.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link to="/templates" className="btn-fire group flex items-center justify-center gap-2 px-8 py-4 text-base font-black uppercase tracking-widest">
              <span>Start Training</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link to="/exercises" className="flex items-center justify-center gap-2 rounded-2xl border px-8 py-4 text-base font-black uppercase tracking-widest text-white transition hover:bg-white/10"
              style={{ borderColor: "rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)" }}>
              <span>🔍 Search Exercises</span>
            </Link>
          </div>

          {/* Activity Rings */}
          <div className="mt-10 flex items-center gap-8 rounded-2xl p-5 w-fit"
            style={{ background: "rgba(28,28,30,0.85)", backdropFilter: "blur(30px)", border: "0.5px solid rgba(255,255,255,0.1)" }}>
            <ActivityRing value={612} max={800} color="#ff375f" size={76} label="612" sublabel="Cal" />
            <ActivityRing value={4} max={5} color="#30d158" size={76} label="4/5" sublabel="Workouts" />
            <ActivityRing value={17} max={30} color="#0a84ff" size={76} label="17" sublabel="Day Streak" />
          </div>

          {/* Stats row */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatBadge icon="🔥" title="Today's Burn" value="612 cal" color="#ff375f" />
            <StatBadge icon="🏆" title="Latest PR" value="Deadlift 160kg" color="#ffd60a" />
            <StatBadge icon="⚡" title="Streak" value="17 Days" color="#0a84ff" />
          </div>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/sessions" className="btn-fire min-w-[200px] py-4 text-base font-black">
              ▶ Start Training
            </Link>
            <Link to="/templates" className="btn-ghost min-w-[200px] py-4 text-base font-semibold">
              Browse Programs →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomePage;
