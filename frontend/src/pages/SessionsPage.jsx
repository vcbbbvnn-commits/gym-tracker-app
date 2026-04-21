import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

const workoutTemplates = ["Push", "Pull", "Legs", "Upper", "Lower", "Full Body"];

const typeColors = {
  Push: "#f97316",
  Pull: "#a78bfa",
  Legs: "#34d399",
  Upper: "#fbbf24",
  Lower: "#60a5fa",
  "Full Body": "#f472b6",
};

const typeIcons = {
  Push: "🏋️",
  Pull: "💪",
  Legs: "🦵",
  Upper: "⬆️",
  Lower: "⬇️",
  "Full Body": "🔥",
};

function SessionsPage() {
  const [workouts, setWorkouts] = useState([]);
  const [form, setForm] = useState({ name: "Push", description: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const loadWorkouts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/workouts");
      setWorkouts(data);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to load workouts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadWorkouts(); }, []);

  const handleCreateWorkout = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.post("/workouts", form);
      setForm({ name: "Push", description: "" });
      await loadWorkouts();
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to create workout.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteWorkout = async (workoutId) => {
    setDeletingId(workoutId);
    try {
      await api.delete(`/workouts/${workoutId}`);
      await loadWorkouts();
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to delete workout.");
    } finally {
      setDeletingId(null);
    }
  };

  const color = typeColors[form.name] || "#f97316";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="animate-fade-up" style={{ opacity: 0 }}>
        <span className="section-badge mb-3 inline-flex">Training</span>
        <h1
          className="text-4xl font-bold text-white"
          style={{ fontFamily: "'Bebas Neue', 'Space Grotesk', sans-serif", letterSpacing: "0.04em" }}
        >
          WORKOUT SESSIONS
        </h1>
        <p className="mt-2 text-gray-500">
          Create your splits and track every set with precision.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        {/* =====================
            CREATE FORM
            ===================== */}
        <div
          className="animate-fade-up rounded-3xl p-8"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            animationDelay: "100ms",
            opacity: 0,
          }}
        >
          {/* Card header */}
          <div className="mb-6 flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-xl transition-all duration-300"
              style={{
                background: `${color}20`,
                border: `1px solid ${color}40`,
              }}
            >
              {typeIcons[form.name] || "🔥"}
            </div>
            <div>
              <h2
                className="font-bold text-white"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Create Workout
              </h2>
              <p className="text-xs text-gray-500">Build your split program</p>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleCreateWorkout}>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400" htmlFor="workout-name">
                Workout Type
              </label>
              <select
                id="workout-name"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                className="input-field"
                style={{ paddingRight: "40px" }}
              >
                {workoutTemplates.map((template) => (
                  <option key={template} value={template}>{template}</option>
                ))}
              </select>
            </div>

            {/* Color preview */}
            <div
              className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{
                background: `${color}0d`,
                border: `1px solid ${color}30`,
              }}
            >
              <span className="text-2xl">{typeIcons[form.name] || "🔥"}</span>
              <div>
                <p className="text-sm font-semibold text-white">{form.name} Day</p>
                <p className="text-xs text-gray-500">Workout type selected</p>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400" htmlFor="description">
                Notes <span className="normal-case font-normal text-gray-600">(optional)</span>
              </label>
              <input
                id="description"
                type="text"
                placeholder="e.g., Heavy compounds, 60 mins"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
                className="input-field"
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
              disabled={submitting}
              className="btn-fire w-full justify-center"
              style={{ width: "100%", borderRadius: "12px" }}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating...
                </span>
              ) : (
                <>+ Create Workout</>
              )}
            </button>
          </form>

          {/* Templates hint */}
          <div
            className="mt-5 rounded-xl px-4 py-3"
            style={{ background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.15)" }}
          >
            <p className="text-xs text-gray-500">
              Want pre-built programs?{" "}
              <Link to="/templates" className="font-semibold transition hover:text-orange-300" style={{ color: "#f97316" }}>
                Browse Templates →
              </Link>
            </p>
          </div>
        </div>

        {/* =====================
            WORKOUTS LIST
            ===================== */}
        <div
          className="animate-fade-up"
          style={{ animationDelay: "200ms", opacity: 0 }}
        >
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2
                className="text-xl font-bold text-white"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Active Sessions
              </h2>
              <p className="text-sm text-gray-500">
                {workouts.length} program{workouts.length !== 1 ? "s" : ""} ready
              </p>
            </div>
            {!loading && workouts.length > 0 && (
              <div
                className="rounded-xl px-3 py-1.5 text-xs font-bold"
                style={{ background: "rgba(249,115,22,0.12)", color: "#f97316", border: "1px solid rgba(249,115,22,0.25)" }}
              >
                {workouts.length} Active
              </div>
            )}
          </div>

          {/* Skeleton loading */}
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-24 rounded-2xl" />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && workouts.length === 0 && (
            <div
              className="flex flex-col items-center justify-center rounded-3xl py-20 text-center"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "2px dashed rgba(255,255,255,0.08)",
              }}
            >
              <div className="mb-4 text-5xl">🏋️</div>
              <h3
                className="mb-2 text-lg font-bold text-white"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                No workouts yet
              </h3>
              <p className="text-sm text-gray-500">Create your first split on the left</p>
            </div>
          )}

          {/* Workout cards */}
          {!loading && workouts.length > 0 && (
            <div className="space-y-3">
              {workouts.map((workout, idx) => {
                const wColor = typeColors[workout.name] || "#f97316";
                const wIcon = typeIcons[workout.name] || "💪";
                const setCount = workout.exercises?.reduce((t, e) => t + e.sets.length, 0) || 0;

                return (
                  <div
                    key={workout.id}
                    className="workout-card animate-fade-up"
                    style={{ animationDelay: `${idx * 80}ms`, opacity: 0 }}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Icon */}
                        <div
                          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-xl"
                          style={{ background: `${wColor}15`, border: `1px solid ${wColor}30` }}
                        >
                          {wIcon}
                        </div>

                        {/* Info */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3
                              className="font-bold text-white"
                              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                            >
                              {workout.name}
                            </h3>
                            <span
                              className="hidden rounded-full px-2 py-0.5 text-xs font-semibold sm:inline"
                              style={{ background: `${wColor}15`, color: wColor }}
                            >
                              Day
                            </span>
                          </div>
                          {workout.description && (
                            <p className="mt-0.5 truncate text-sm text-gray-500">{workout.description}</p>
                          )}
                          <div className="mt-1 flex items-center gap-3 text-xs text-gray-600">
                            <span>{workout.exercises?.length || 0} exercises</span>
                            <span>•</span>
                            <span>{setCount} sets</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-shrink-0 items-center gap-2">
                        <Link
                          to={`/workouts/${workout.id}`}
                          className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 hover:scale-105"
                          style={{
                            background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                            color: "white",
                            boxShadow: "0 4px 15px rgba(249,115,22,0.3)",
                          }}
                        >
                          <span className="hidden sm:inline">Open</span>
                          →
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteWorkout(workout.id)}
                          disabled={deletingId === workout.id}
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-sm transition-all duration-300 hover:scale-105 disabled:opacity-50"
                          style={{
                            background: "rgba(239,68,68,0.08)",
                            border: "1px solid rgba(239,68,68,0.2)",
                            color: "#f87171",
                          }}
                        >
                          {deletingId === workout.id ? (
                            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            "✕"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SessionsPage;
