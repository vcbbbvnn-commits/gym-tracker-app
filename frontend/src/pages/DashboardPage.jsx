import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import SectionHeading from "../components/SectionHeading";

const workoutTemplates = ["Push", "Pull", "Legs"];

function DashboardPage() {
  const [workouts, setWorkouts] = useState([]);
  const [form, setForm] = useState({ name: "Push", description: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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
    try {
      await api.delete(`/workouts/${workoutId}`);
      await loadWorkouts();
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to delete workout.");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      {/* ── CREATE PANEL ── */}
      <section className="panel animate-fade-up p-6 sm:p-8">
        <SectionHeading
          eyebrow="Program"
          title="Build your split"
          subtitle="Start with Push, Pull, or Legs, then add the specific exercises you want to run this week."
        />

        <form className="mt-8 space-y-5" onSubmit={handleCreateWorkout}>
          <div>
            <label className="mb-2 block text-sm font-semibold" style={{ color: "rgba(168,85,247,0.85)" }} htmlFor="name">
              Workout name
            </label>
            <select
              id="name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="input-field"
            >
              {workoutTemplates.map((template) => (
                <option key={template} value={template}>{template}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold" style={{ color: "rgba(168,85,247,0.85)" }} htmlFor="description">
              Notes
            </label>
            <textarea
              id="description"
              rows="4"
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className="input-field resize-none"
              placeholder="Heavy compounds first, then isolations."
            />
          </div>

          {error && (
            <p className="rounded-xl px-4 py-3 text-sm"
              style={{ background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.22)", color: "#f472b6" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-fire w-full justify-center"
          >
            {submitting ? "Creating..." : "Create workout"}
          </button>
        </form>
      </section>

      {/* ── SESSIONS PANEL ── */}
      <section className="panel animate-fade-up p-6 sm:p-8" style={{ animationDelay: "0.12s" }}>
        <SectionHeading
          eyebrow="Sessions"
          title="Current workouts"
          subtitle="Open a session to add exercises and log sets, or remove routines you no longer need."
        />

        {/* Templates callout */}
        <div
          className="mt-6 rounded-2xl px-5 py-4"
          style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)" }}
        >
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
            Want to get started quickly?{" "}
            <Link to="/templates" className="font-semibold transition" style={{ color: "#c084fc" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#f472b6"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#c084fc"; }}>
              Browse pre-built workout templates
            </Link>
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {loading && (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}
            </div>
          )}

          {!loading && workouts.length === 0 && (
            <div
              className="rounded-2xl px-5 py-10 text-center"
              style={{ border: "1px dashed rgba(124,58,237,0.25)", color: "rgba(255,255,255,0.35)" }}
            >
              No workouts yet. Create your first split on the left.
            </div>
          )}

          {workouts.map((workout) => {
            const setCount = workout.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
            return (
              <div
                key={workout.id}
                className="workout-card"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-xl font-black text-white">{workout.name}</h3>
                    <p className="mt-1.5 max-w-xl text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
                      {workout.description || "No notes yet. Open this session to add some structure."}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs uppercase tracking-[0.22em]"
                      style={{ color: "rgba(168,85,247,0.65)" }}>
                      <span>{workout.exercises.length} exercises</span>
                      <span>·</span>
                      <span>{setCount} sets</span>
                    </div>
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
                      className="rounded-xl px-4 py-2 text-sm font-bold transition"
                      style={{ background: "rgba(236,72,153,0.08)", border: "1px solid rgba(236,72,153,0.25)", color: "#f472b6" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;
