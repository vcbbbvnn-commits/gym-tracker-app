import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

function MetricCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-black text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{hint}</p>
    </div>
  );
}

function ModuleCard({ title, desc, accent, to, action }) {
  return (
    <Link
      to={to}
      className="group block rounded-2xl border border-white/10 bg-[#0d1219]/80 p-5 text-left transition hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-[#101720]"
    >
      <div className="mb-5 h-1.5 w-14 rounded-full" style={{ background: accent }} />
      <h3 className="text-lg font-black text-white">{title}</h3>
      <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">{desc}</p>
      <p className="mt-5 text-sm font-black uppercase tracking-[0.16em] text-cyan-300 transition group-hover:text-lime-300">
        {action}
      </p>
    </Link>
  );
}

function HomePage() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

  const totals = useMemo(() => {
    const exercises = workouts.reduce((sum, workout) => sum + (workout.exercises?.length || 0), 0);
    const sets = workouts.reduce(
      (sum, workout) => sum + (workout.exercises || []).reduce((inner, exercise) => inner + (exercise.sets?.length || 0), 0),
      0,
    );
    return { exercises, sets };
  }, [workouts]);

  const modules = [
    {
      title: "Program Library",
      desc: "Pick Bro Split, Push Pull Legs, or Upper Lower and launch a structured day.",
      accent: "linear-gradient(90deg, #22d3ee, #a3e635)",
      to: "/templates",
      action: "Browse plans →",
    },
    {
      title: "Session Builder",
      desc: "Create your own workout, add notes, and keep your training week organized.",
      accent: "linear-gradient(90deg, #8b5cf6, #22d3ee)",
      to: "/sessions",
      action: "Create session →",
    },
    {
      title: "Progress Review",
      desc: "Track total volume, best lifts, sets, and exercise-level training history.",
      accent: "linear-gradient(90deg, #a3e635, #fb7185)",
      to: "/progress",
      action: "View progress →",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#0b1017]/90">
        <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="p-6 sm:p-8 lg:p-10">
            <span className="section-badge mb-5 inline-flex">Training Command Center</span>
            <h1 className="max-w-3xl text-5xl font-black uppercase leading-none tracking-normal text-white md:text-7xl" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              Plan. Log. Progress.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
              A focused workspace for structured lifting: choose a split, start a day, log every set, and watch the numbers move.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/templates" className="btn-fire">
                Start a Plan
              </Link>
              <Link to="/sessions" className="btn-ghost">
                Build Custom
              </Link>
            </div>
          </div>

          <div className="relative min-h-[320px] border-t border-white/10 bg-black/20 lg:border-l lg:border-t-0">
            <img
              src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1300&q=85&fit=crop"
              alt="Strength training"
              className="absolute inset-0 h-full w-full object-cover opacity-55 grayscale"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#07090d] via-[#07090d]/45 to-cyan-400/15" />
            <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/10 bg-[#0b1017]/80 p-4 backdrop-blur-xl">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-300">Today’s Focus</p>
              <p className="mt-2 text-2xl font-black text-white">Choose your next training day</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Active Workouts" value={loading ? "..." : workouts.length} hint="Programs in your account" />
        <MetricCard label="Exercises" value={loading ? "..." : totals.exercises} hint="Movements ready to log" />
        <MetricCard label="Logged Sets" value={loading ? "..." : totals.sets} hint="Total recorded work" />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {modules.map((module) => (
          <ModuleCard key={module.title} {...module} />
        ))}
      </section>

      {workouts.length > 0 && (
        <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Recent</p>
              <h2 className="mt-1 text-2xl font-black text-white">Current Workouts</h2>
            </div>
            <Link to="/sessions" className="text-sm font-black uppercase tracking-[0.14em] text-cyan-300">
              View all →
            </Link>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {workouts.slice(0, 3).map((workout) => (
              <Link key={workout.id} to={`/workouts/${workout.id}`} className="rounded-2xl border border-white/10 bg-[#0d1219] p-4 transition hover:border-lime-300/30">
                <p className="text-lg font-black text-white">{workout.name}</p>
                <p className="mt-2 line-clamp-2 min-h-10 text-sm text-slate-500">
                  {workout.description || "Open this session and continue logging."}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                  <span>{workout.exercises?.length || 0} exercises</span>
                  <span className="text-lime-300">Open →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default HomePage;
