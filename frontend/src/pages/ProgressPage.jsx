import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

/* ── Inline SVG line chart ─────────────────────────── */
function LineChart({ data, color = "#ff6b00", height = 80 }) {
  if (!data.length) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  const w = 300; const h = height;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1 || 1)) * w;
    const y = h - (d.value / max) * (h - 10) - 5;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
      <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"
        strokeLinejoin="round" points={pts} />
      {data.map((d, i) => {
        const x = (i / (data.length - 1 || 1)) * w;
        const y = h - (d.value / max) * (h - 10) - 5;
        return <circle key={i} cx={x} cy={y} r="4" fill={color} />;
      })}
    </svg>
  );
}

/* ── Bar chart for weekly volume ─────────────────────── */
function BarChart({ data, color = "#ff6b00" }) {
  if (!data.length) return null;
  const max = Math.max(...data.map(d => d.volume), 1);
  return (
    <div className="flex items-end gap-1.5 h-24">
      {data.map((d, i) => {
        const pct = (d.volume / max) * 100;
        const label = d.week.split("-W")[1] ? `W${d.week.split("-W")[1]}` : d.week;
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>
              {Math.round(d.volume / 1000)}k
            </p>
            <div className="w-full rounded-t-lg transition-all duration-700"
              style={{ height: `${Math.max(pct, 5)}%`, background: i === data.length - 1 ? color : `${color}55` }} />
            <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</p>
          </div>
        );
      })}
    </div>
  );
}

function StatCard({ label, value, icon, color, delay }) {
  return (
    <div
      className="ios-slide-up rounded-2xl p-5"
      style={{ background: "#1c1c1e", animationDelay: delay }}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="text-3xl font-black" style={{ color }}>{value}</p>
    </div>
  );
}

function ProgressPage() {
  const [summary, setSummary] = useState(null);
  const [exerciseProgress, setExerciseProgress] = useState([]);
  const [history, setHistory] = useState([]);
  const [bodyWeights, setBodyWeights] = useState([]);
  const [weeklyVolume, setWeeklyVolume] = useState([]);
  const [newWeight, setNewWeight] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const loadProgress = async () => {
      try {
        const [summaryRes, exercisesRes, historyRes, bwRes, volRes] = await Promise.all([
          api.get("/progress/summary"),
          api.get("/progress/exercises"),
          api.get("/progress/history"),
          api.get("/body-weight").catch(() => ({ data: [] })),
          api.get("/body-weight/volume/weekly").catch(() => ({ data: [] })),
        ]);
        setSummary(summaryRes.data);
        setExerciseProgress(exercisesRes.data);
        setHistory(historyRes.data);
        setBodyWeights(bwRes.data);
        setWeeklyVolume(volRes.data);
      } catch (requestError) {
        setError(requestError.response?.data?.detail || "Unable to load progress data.");
      } finally {
        setLoading(false);
      }
    };
    loadProgress();
  }, []);

  const logBodyWeight = async (e) => {
    e.preventDefault();
    if (!newWeight) return;
    try {
      await api.post("/body-weight", { weight_kg: parseFloat(newWeight) });
      setNewWeight("");
      const { data } = await api.get("/body-weight");
      setBodyWeights(data);
    } catch {}
  };



  const stats = [
    { label: "Total Workouts", value: summary?.total_workouts ?? 0, icon: "🏋️", color: "#ff6b00", delay: "0ms" },
    { label: "Total Exercises", value: summary?.total_exercises ?? 0, icon: "💪", color: "#bf5af2", delay: "80ms" },
    { label: "Total Sets", value: summary?.total_sets ?? 0, icon: "🔢", color: "#30d158", delay: "160ms" },
    { label: "Volume (kg)", value: (summary?.total_volume ?? 0).toLocaleString(), icon: "⚖️", color: "#0a84ff", delay: "240ms" },
  ];

  const latestWeight = bodyWeights.length ? bodyWeights[bodyWeights.length - 1].weight_kg : null;
  const bwChartData = bodyWeights.slice(-14).map(b => ({ value: b.weight_kg, label: new Date(b.logged_at).toLocaleDateString() }));
  const personalRecords = exerciseProgress
    .slice()
    .sort((a, b) => b.best_weight - a.best_weight)
    .slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="ios-slide-up">
        <span className="section-badge mb-3 inline-flex">Analytics</span>
        <h1 className="text-5xl font-black uppercase text-white" style={{ fontFamily: "'Bebas Neue',sans-serif" }}>
          Your Progress
        </h1>
        <p className="mt-2 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
          Track volume, body weight, 1RMs, and workout history.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl px-5 py-4 text-sm"
          style={{ background: "rgba(255,69,58,0.1)", border: "1px solid rgba(255,69,58,0.2)", color: "#ff453a" }}>
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <section>
        <h2 className="mb-4 text-lg font-black text-white">Overview</h2>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((s) => <StatCard key={s.label} {...s} />)}
          </div>
        )}
      </section>

      {/* Personal Records */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-black text-white">Personal Records</h2>
            <p className="text-sm text-white/35">Your strongest logged lifts.</p>
          </div>
          <Link to="/strength" className="rounded-xl px-3 py-2 text-xs font-black text-black" style={{ background: "#ffd60a" }}>
            Score
          </Link>
        </div>
        {personalRecords.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {personalRecords.map((record, index) => (
              <Link
                key={record.exercise_name}
                to={`/progress/${encodeURIComponent(record.exercise_name)}`}
                className="rounded-2xl p-4 no-underline transition hover:-translate-y-1"
                style={{ background: "#1c1c1e", border: index === 0 ? "1px solid rgba(255,214,10,0.35)" : "1px solid rgba(255,255,255,0.08)" }}
              >
                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: index === 0 ? "#ffd60a" : "rgba(255,255,255,0.35)" }}>
                  PR #{index + 1}
                </p>
                <h3 className="mt-2 truncate text-sm font-black text-white">{record.exercise_name}</h3>
                <p className="mt-2 text-3xl font-black" style={{ color: "#ff6b00" }}>{record.best_weight}kg</p>
                <p className="text-xs text-white/35">{record.total_sets} sets · {Math.round(record.total_volume).toLocaleString()}kg volume</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl p-6 text-sm text-white/35" style={{ background: "#1c1c1e" }}>
            Log sets with weight to unlock PR cards.
          </div>
        )}
      </section>

      {/* Weekly Volume + Body Weight row */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Weekly Volume Bar Chart */}
        <section className="rounded-2xl p-6" style={{ background: "#1c1c1e" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,107,0,0.7)" }}>Volume Trend</p>
              <h2 className="text-lg font-black text-white">Weekly Volume</h2>
            </div>
            <span className="text-2xl">📊</span>
          </div>
          {weeklyVolume.length > 0
            ? <BarChart data={weeklyVolume} color="#ff6b00" />
            : <p className="text-sm italic" style={{ color: "rgba(255,255,255,0.3)" }}>No data yet — log some sets first.</p>}
        </section>

        {/* Body Weight Tracker */}
        <section className="rounded-2xl p-6" style={{ background: "#1c1c1e" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(48,209,88,0.7)" }}>Trend</p>
              <h2 className="text-lg font-black text-white">
                Body Weight {latestWeight ? <span style={{ color: "#30d158" }}>{latestWeight} kg</span> : ""}
              </h2>
            </div>
            <span className="text-2xl">⚖️</span>
          </div>
          {bwChartData.length > 1
            ? <LineChart data={bwChartData} color="#30d158" height={80} />
            : <p className="text-sm italic mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>No entries yet — log your weight below.</p>}
          <form onSubmit={logBodyWeight} className="flex gap-2 mt-4">
            <input type="number" step="0.1" min="30" max="300" value={newWeight}
              onChange={e => setNewWeight(e.target.value)}
              placeholder="Your weight in kg…"
              className="input-field flex-1" required />
            <button type="submit" className="btn-fire px-5 py-2.5 text-sm">Log</button>
          </form>
        </section>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Exercise Progress */}
        <section

          className="animate-fade-up rounded-3xl p-8"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            animationDelay: "200ms",
            opacity: 0,
          }}
        >
          <div className="mb-6">
            <span className="section-badge mb-3 inline-flex">Per Exercise</span>
            <h2
              className="text-xl font-bold text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Lift Overview
            </h2>
            <p className="mt-1 text-sm text-gray-500">Click any exercise to see detailed history</p>
          </div>

          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
            </div>
          )}

          {!loading && exerciseProgress.length === 0 && (
            <div
              className="flex flex-col items-center py-12 text-center"
              style={{ border: "2px dashed rgba(255,255,255,0.06)", borderRadius: "16px" }}
            >
              <div className="mb-3 text-4xl">📊</div>
              <p className="text-sm text-gray-500">No exercise data yet.</p>
              <p className="text-xs text-gray-600">Log a workout session to start tracking.</p>
            </div>
          )}

          <div className="space-y-3">
            {exerciseProgress.map((item, idx) => {
              const pct = Math.min(100, (item.best_weight / 200) * 100);
              return (
                <Link
                  key={item.exercise_name}
                  to={`/progress/${encodeURIComponent(item.exercise_name)}`}
                  className="group block rounded-2xl p-4 transition-all duration-400 hover:-translate-y-1"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    textDecoration: "none",
                    animationDelay: `${idx * 60}ms`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(34,211,238,0.3)";
                    e.currentTarget.style.background = "rgba(34,211,238,0.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  }}
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3
                        className="font-semibold text-white transition-colors group-hover:text-cyan-300"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {item.exercise_name}
                      </h3>
                      <p className="text-xs text-gray-600">{item.total_sets} sets tracked</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-cyan-300">{item.best_weight} kg</p>
                      <p className="text-xs text-gray-600">Best weight</p>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-gray-600">
                    <span>Volume: {item.total_volume} kg</span>
                    <span className="text-lime-300 opacity-0 transition-opacity group-hover:opacity-100">
                      View history →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Workout History */}
        <section
          className="animate-fade-up rounded-3xl p-8"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            animationDelay: "300ms",
            opacity: 0,
          }}
        >
          <div className="mb-6">
            <span className="section-badge mb-3 inline-flex">Timeline</span>
            <h2
              className="text-xl font-bold text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Workout History
            </h2>
            <p className="mt-1 text-sm text-gray-500">Your completed sessions</p>
          </div>

          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
            </div>
          )}

          {!loading && history.length === 0 && (
            <div
              className="flex flex-col items-center py-12 text-center"
              style={{ border: "2px dashed rgba(255,255,255,0.06)", borderRadius: "16px" }}
            >
              <div className="mb-3 text-4xl">📅</div>
              <p className="text-sm text-gray-500">No history yet.</p>
              <p className="text-xs text-gray-600">Complete your first workout session.</p>
            </div>
          )}

          <div className="space-y-3">
            {history.map((workout, idx) => {
              const setCount = workout.exercises?.reduce((t, e) => t + e.sets.length, 0) || 0;
              return (
                <div
                  key={workout.id}
                  className="rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    animationDelay: `${idx * 60 + 300}ms`,
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3
                        className="font-semibold text-white"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {workout.name}
                      </h3>
                      {workout.description && (
                        <p className="mt-1 text-xs text-gray-500">{workout.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-300">{workout.exercises?.length || 0}</p>
                      <p className="text-xs text-gray-600">exercises</p>
                    </div>
                  </div>
                  <div className="mt-3 fire-divider" />
                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <span style={{ color: "#22d3ee" }}>●</span>
                      {setCount} total sets
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

export default ProgressPage;
