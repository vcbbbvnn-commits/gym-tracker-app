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

  useEffect(() => {
    loadWorkouts();
  }, []);

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
      <section className="panel animate-fade-up p-6 sm:p-8">
        <SectionHeading
          eyebrow="Program"
          title="Build your split"
          subtitle="Start with Push, Pull, or Legs, then add the specific exercises you want to run this week."
        />

        <form className="mt-8 space-y-5" onSubmit={handleCreateWorkout}>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200" htmlFor="name">
              Workout name
            </label>
            <select
              id="name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-slate-100 outline-none transition focus:border-cyanGlow"
            >
              {workoutTemplates.map((template) => (
                <option key={template} value={template}>
                  {template}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200" htmlFor="description">
              Notes
            </label>
            <textarea
              id="description"
              rows="4"
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-slate-100 outline-none transition focus:border-cyanGlow"
              placeholder="Heavy compounds first, then isolations."
            />
          </div>

          {error ? <p className="rounded-2xl bg-coral/10 px-4 py-3 text-sm text-coral">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-2xl bg-cyanGlow px-5 py-3 font-display text-slate-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Creating..." : "Create workout"}
          </button>
        </form>
      </section>

      <section className="panel animate-fade-up p-6 sm:p-8" style={{ animationDelay: "0.12s" }}>
        <SectionHeading
          eyebrow="Sessions"
          title="Current workouts"
          subtitle="Open a session to add exercises and log sets, or remove routines you no longer need."
        />

        {/* Callout to use templates */}
        <div className="mt-6 rounded-3xl border border-cyanGlow/30 bg-cyanGlow/10 px-6 py-4">
          <p className="text-sm text-slate-200">
            Want to get started quickly? <Link to="/templates" className="font-semibold text-cyanGlow hover:underline">Browse pre-built workout templates</Link>
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {loading ? <p className="text-sm text-slate-300">Loading workouts...</p> : null}

          {!loading && workouts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 px-5 py-8 text-center text-slate-300">
              No workouts yet. Create your first split on the left.
            </div>
          ) : null}

          {workouts.map((workout) => {
            const setCount = workout.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
            return (
              <div
                key={workout.id}
                className="rounded-3xl border border-white/10 bg-slate-950/40 p-5 transition hover:border-cyanGlow/40"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="font-display text-2xl text-sand">{workout.name}</h3>
                    <p className="mt-2 max-w-xl text-sm text-slate-300">
                      {workout.description || "No notes yet. Open this session to add some structure."}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.25em] text-slate-400">
                      <span>{workout.exercises.length} exercises</span>
                      <span>{setCount} sets</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Link
                      to={`/workouts/${workout.id}`}
                      className="rounded-full bg-sand px-4 py-2 text-sm font-semibold text-slate-950 transition hover:opacity-90"
                    >
                      Open session
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeleteWorkout(workout.id)}
                      className="rounded-full border border-coral/40 px-4 py-2 text-sm font-semibold text-coral transition hover:bg-coral/10"
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
