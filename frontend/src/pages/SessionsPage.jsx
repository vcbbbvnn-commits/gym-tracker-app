import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

const workoutTemplates = ["Push", "Pull", "Legs", "Upper", "Lower", "Full Body"];

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

  return (
    <div>
      {/* Header */}
      <div className="mb-10 text-center">
        <span className="section-badge mb-5 inline-flex px-6 py-3 text-base">Training</span>
        <h1 className="text-4xl font-black uppercase text-white md:text-5xl">Workout Sessions</h1>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[355px_1fr]">
        {/* ── CREATE FORM ── */}
        <section
          className="rounded-2xl p-5 shadow-2xl"
          style={{ background: "rgba(18,14,34,0.7)", border: "1px solid rgba(124,58,237,0.2)", backdropFilter: "blur(16px)" }}
        >
          <h2 className="text-2xl font-black uppercase text-white">Create Workout</h2>
          <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>Build your split program</p>

          <form className="mt-6 space-y-4" onSubmit={handleCreateWorkout}>
            <div
              className="overflow-hidden rounded-xl"
              style={{ border: "1px solid rgba(124,58,237,0.4)", boxShadow: "0 0 24px rgba(124,58,237,0.1)" }}
            >
              <select
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="w-full px-4 py-3 text-white outline-none"
                style={{ background: "rgba(124,58,237,0.08)", borderBottom: "1px solid rgba(124,58,237,0.2)" }}
              >
                {workoutTemplates.map((template) => (
                  <option key={template} value={template}>{template}</option>
                ))}
              </select>

              <div
                className="m-4 flex h-28 items-center justify-center rounded-xl"
                style={{ background: "rgba(124,58,237,0.08)" }}
              >
                <span className="text-5xl">🏋️</span>
              </div>

              <div className="px-4 pb-4">
                <p className="text-base font-semibold text-white">{form.name} Day</p>
                <label className="mt-4 block text-sm" style={{ color: "rgba(168,85,247,0.75)" }} htmlFor="description">
                  Notes
                </label>
                <textarea
                  id="description"
                  rows="3"
                  placeholder="optional"
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  className="mt-2 w-full resize-none rounded-lg px-3 py-3 text-white outline-none transition placeholder:text-white/20"
                  style={{
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(124,58,237,0.2)",
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = "rgba(168,85,247,0.6)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "rgba(124,58,237,0.2)"; }}
                />
              </div>
            </div>

            {/* Split display */}
            <div
              className="overflow-hidden rounded-xl"
              style={{ border: "1px solid rgba(124,58,237,0.2)" }}
            >
              <div className="px-4 py-3 text-sm font-bold uppercase tracking-widest"
                style={{ borderBottom: "1px solid rgba(124,58,237,0.15)", color: "rgba(168,85,247,0.7)" }}>
                Split
              </div>
              <div className="px-4 py-3 text-white">{form.name}</div>
            </div>

            {error && (
              <div className="rounded-xl px-4 py-3 text-sm"
                style={{ background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.25)", color: "#f472b6" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn-fire w-full justify-center py-3">
              {submitting ? "Creating..." : "+ Create Workout"}
            </button>
          </form>

          <div
            className="mt-5 rounded-xl px-4 py-3"
            style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.18)" }}
          >
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
              Want pre-built programs?{" "}
              <Link to="/templates" className="font-bold transition" style={{ color: "#c084fc" }}
                onMouseEnter={e => { e.currentTarget.style.color = "#f472b6"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "#c084fc"; }}>
                Browse Templates →
              </Link>
            </p>
          </div>
        </section>

        {/* ── SESSIONS LIST ── */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-black uppercase text-white">Active Sessions</h2>
            <p className="mt-1 text-sm" style={{ color: "rgba(168,85,247,0.7)" }}>
              {workouts.length} program{workouts.length !== 1 ? "s" : ""} ready
            </p>
          </div>

          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="skeleton h-24 rounded-xl" />
              ))}
            </div>
          )}

          {!loading && workouts.length === 0 && (
            <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
              <div className="mb-5 text-8xl">🏋️‍♂️</div>
              <h3 className="text-4xl font-black text-white md:text-5xl">No workouts yet</h3>
              <p className="mt-3 text-lg font-semibold" style={{ color: "#c084fc" }}>
                Create your first split on the left
              </p>
            </div>
          )}

          {!loading && workouts.length > 0 && (
            <div className="space-y-3">
              {workouts.map((workout) => {
                const setCount = workout.exercises?.reduce((total, exercise) => total + exercise.sets.length, 0) || 0;
                return (
                  <div
                    key={workout.id}
                    className="workout-card"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-xl font-black text-white">{workout.name}</h3>
                        <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
                          {workout.description || "Open this session to add structure."}
                        </p>
                        <p className="mt-3 text-xs uppercase tracking-[0.18em]" style={{ color: "rgba(168,85,247,0.6)" }}>
                          {workout.exercises?.length || 0} exercises · {setCount} sets
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Link
                          to={`/workouts/${workout.id}`}
                          className="rounded-xl px-4 py-2 text-sm font-bold text-white transition"
                          style={{ background: "linear-gradient(135deg,#7c3aed,#ec4899)", boxShadow: "0 4px 14px rgba(124,58,237,0.35)" }}
                        >
                          Open
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteWorkout(workout.id)}
                          disabled={deletingId === workout.id}
                          className="rounded-xl px-4 py-2 text-sm font-bold transition disabled:opacity-50"
                          style={{ background: "rgba(236,72,153,0.08)", border: "1px solid rgba(236,72,153,0.25)", color: "#f472b6" }}
                        >
                          {deletingId === workout.id ? "..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default SessionsPage;
