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
      <div className="mb-10 text-center">
        <span className="section-badge mb-5 inline-flex px-6 py-3 text-base">Training</span>
        <h1 className="text-4xl font-black uppercase text-white md:text-5xl">Workout Sessions</h1>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[355px_1fr]">
        <section className="rounded-xl border border-slate-500/30 bg-[#101722]/42 p-4 shadow-2xl shadow-black/20">
          <h2 className="text-2xl font-black uppercase text-white">Create Workout</h2>
          <p className="mt-1 text-base text-slate-400">Build your split program</p>

          <form className="mt-5 space-y-3" onSubmit={handleCreateWorkout}>
            <div className="overflow-hidden rounded-xl border border-orange-400/60 bg-[#121a26] shadow-[0_0_28px_rgba(251,107,29,0.08)]">
              <select
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="w-full border-b border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
              >
                {workoutTemplates.map((template) => (
                  <option key={template} value={template}>
                    {template}
                  </option>
                ))}
              </select>

              <div className="m-4 flex h-28 items-center justify-center rounded-xl bg-slate-700/35">
                <span className="text-5xl text-slate-300">🏋️</span>
              </div>

              <div className="px-4 pb-4">
                <p className="text-base text-white">{form.name} Day - Workout type selected</p>
                <label className="mt-5 block text-sm text-slate-400" htmlFor="description">
                  Notes
                </label>
                <textarea
                  id="description"
                  rows="3"
                  placeholder="optional"
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  className="mt-2 w-full resize-none rounded-lg border border-slate-500/40 bg-[#0d1521] px-3 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-orange-400/70"
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-500/40">
              <div className="border-b border-slate-500/30 px-4 py-3 text-white">Split</div>
              <div className="px-4 py-3 text-slate-300">{form.name}</div>
            </div>

            {error && <div className="rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

            <button type="submit" disabled={submitting} className="btn-fire w-full justify-center py-3">
              {submitting ? "Creating..." : "+ Create Workout"}
            </button>
          </form>

          <div className="mt-5 rounded-xl border border-orange-400/15 bg-orange-500/5 px-4 py-3">
            <p className="text-xs text-slate-400">
              Want pre-built programs?{" "}
              <Link to="/templates" className="font-bold text-orange-300 hover:text-orange-200">
                Browse Templates →
              </Link>
            </p>
          </div>
        </section>

        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-black uppercase text-white">Active Sessions</h2>
            <p className="mt-1 text-lg text-slate-400">
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
            <div className="flex min-h-[470px] flex-col items-center justify-center text-center">
              <div className="mb-5 text-8xl">🏋️‍♂️</div>
              <h3 className="text-4xl font-black text-white md:text-5xl">No workouts yet</h3>
              <p className="mt-3 text-xl font-semibold text-orange-300">Create your first split on the left</p>
            </div>
          )}

          {!loading && workouts.length > 0 && (
            <div className="space-y-3">
              {workouts.map((workout) => {
                const setCount = workout.exercises?.reduce((total, exercise) => total + exercise.sets.length, 0) || 0;
                return (
                  <div key={workout.id} className="rounded-xl border border-white/10 bg-[#101722]/60 p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-xl font-black text-white">{workout.name}</h3>
                        <p className="mt-1 text-sm text-slate-400">{workout.description || "Open this session to add structure."}</p>
                        <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-500">
                          {workout.exercises?.length || 0} exercises · {setCount} sets
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/workouts/${workout.id}`} className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white">
                          Open
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteWorkout(workout.id)}
                          disabled={deletingId === workout.id}
                          className="rounded-xl border border-red-400/25 px-4 py-2 text-sm font-bold text-red-300"
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
