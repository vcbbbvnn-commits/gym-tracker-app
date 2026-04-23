import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

function StatCard({ label, value, icon, color, delay }) {
  return (
    <div
      className="animate-fade-up rounded-2xl p-5 transition-all duration-500 hover:-translate-y-2"
      style={{
        background: `linear-gradient(135deg, ${color}12 0%, ${color}05 100%)`,
        border: `1px solid ${color}25`,
        animationDelay: delay,
        opacity: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 12px 40px ${color}20`;
        e.currentTarget.style.borderColor = `${color}45`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = `${color}25`;
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <p
        className="text-3xl font-bold"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          background: `linear-gradient(135deg, ${color} 0%, ${color}bb 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {value}
      </p>
    </div>
  );
}

function ProgressPage() {
  const [summary, setSummary] = useState(null);
  const [exerciseProgress, setExerciseProgress] = useState([]);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const [summaryRes, exercisesRes, historyRes] = await Promise.all([
          api.get("/progress/summary"),
          api.get("/progress/exercises"),
          api.get("/progress/history"),
        ]);
        setSummary(summaryRes.data);
        setExerciseProgress(exercisesRes.data);
        setHistory(historyRes.data);
      } catch (requestError) {
        setError(requestError.response?.data?.detail || "Unable to load progress data.");
      } finally {
        setLoading(false);
      }
    };
    loadProgress();
  }, []);

  const stats = [
    { label: "Total Workouts", value: summary?.total_workouts ?? 0, icon: "🏋️", color: "#f97316", delay: "0ms" },
    { label: "Total Exercises", value: summary?.total_exercises ?? 0, icon: "💪", color: "#a78bfa", delay: "80ms" },
    { label: "Total Sets", value: summary?.total_sets ?? 0, icon: "🔢", color: "#34d399", delay: "160ms" },
    { label: "Volume (kg)", value: summary?.total_volume ?? 0, icon: "⚖️", color: "#fbbf24", delay: "240ms" },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="animate-fade-up" style={{ opacity: 0 }}>
        <span className="section-badge mb-3 inline-flex">Analytics</span>
        <h1
          className="text-4xl font-bold text-white"
          style={{ fontFamily: "'Bebas Neue', 'Space Grotesk', sans-serif", letterSpacing: "0.04em" }}
        >
          YOUR PROGRESS
        </h1>
        <p className="mt-2 text-gray-500">
          Track volume, best lifts, and your workout history.
        </p>
      </div>

      {error && (
        <div
          className="rounded-2xl px-5 py-4 text-sm"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}
        >
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <section>
        <h2
          className="mb-4 text-lg font-semibold text-white"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Overview
        </h2>
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
                    e.currentTarget.style.borderColor = "rgba(249,115,22,0.3)";
                    e.currentTarget.style.background = "rgba(249,115,22,0.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  }}
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3
                        className="font-semibold text-white transition-colors group-hover:text-orange-400"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {item.exercise_name}
                      </h3>
                      <p className="text-xs text-gray-600">{item.total_sets} sets tracked</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-orange-400">{item.best_weight} kg</p>
                      <p className="text-xs text-gray-600">Best weight</p>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-gray-600">
                    <span>Volume: {item.total_volume} kg</span>
                    <span className="text-orange-600 opacity-0 transition-opacity group-hover:opacity-100">
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
                      <span style={{ color: "#f97316" }}>●</span>
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
