import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client";
import SectionHeading from "../components/SectionHeading";

function WorkoutSessionPage() {
  const { workoutId } = useParams();
  const [workout, setWorkout] = useState(null);
  const [exerciseForm, setExerciseForm] = useState({ name: "", notes: "" });
  const [setForms, setSetForms] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const loadWorkout = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/workouts/${workoutId}`);
      setWorkout(data);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to load workout session.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkout();
  }, [workoutId]);

  // Timer effect for elapsed time
  useEffect(() => {
    let interval;
    if (isActive && sessionStartTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - sessionStartTime) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, sessionStartTime]);

  const handleStartWorkout = () => {
    const now = Date.now();
    setSessionStartTime(now);
    setIsActive(true);
  };

  const handleEndWorkout = () => {
    setIsActive(false);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleAddExercise = async (event) => {
    event.preventDefault();
    try {
      const { data } = await api.post(`/workouts/${workoutId}/exercises`, exerciseForm);
      setWorkout(data);
      setExerciseForm({ name: "", notes: "" });
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to add exercise.");
    }
  };

  const handleDeleteExercise = async (exerciseId) => {
    try {
      const { data } = await api.delete(`/workouts/exercises/${exerciseId}`);
      setWorkout(data);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to delete exercise.");
    }
  };

  const handleSetInput = (exerciseId, field, value) => {
    setSetForms((current) => ({
      ...current,
      [exerciseId]: {
        reps: current[exerciseId]?.reps || "",
        weight: current[exerciseId]?.weight || "",
        [field]: value,
      },
    }));
  };

  const handleAddSet = async (event, exerciseId) => {
    event.preventDefault();
    const form = setForms[exerciseId] || {};

    try {
      const { data } = await api.post(`/workouts/exercises/${exerciseId}/sets`, {
        reps: Number(form.reps),
        weight: Number(form.weight),
      });
      setWorkout(data);
      setSetForms((current) => ({
        ...current,
        [exerciseId]: { reps: "", weight: "" },
      }));
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to log set.");
    }
  };

  const handleDeleteSet = async (setId) => {
    try {
      const { data } = await api.delete(`/workouts/sets/${setId}`);
      setWorkout(data);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to delete set.");
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-300">Loading session...</p>;
  }

  if (!workout) {
    return (
      <div className="panel p-8">
        <p className="text-slate-200">{error || "Workout not found."}</p>
        <Link to="/sessions" className="mt-4 inline-flex text-cyanGlow">
          Back to sessions
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="panel animate-fade-up p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex-1">
            <SectionHeading
              eyebrow="Workout Session"
              title={workout.name}
              subtitle={workout.description || "Log every set so you can compare effort over time."}
            />
          </div>
          <Link to="/sessions" className="text-sm font-semibold text-cyanGlow hover:text-cyanGlow/80">
            Back to sessions
          </Link>
        </div>

        {/* Session Timer */}
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-cyanGlow/30 bg-cyanGlow/5 p-6">
            <p className="text-sm text-slate-400">Session Time</p>
            <p className="mt-2 font-display text-4xl text-cyanGlow font-mono">
              {formatTime(elapsedTime)}
            </p>
            {sessionStartTime && (
              <p className="mt-2 text-xs text-slate-400">
                Started: {new Date(sessionStartTime).toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            {!isActive ? (
              <button
                onClick={handleStartWorkout}
                className="flex-1 rounded-2xl bg-gradient-to-r from-cyanGlow to-cyan-400 px-6 py-3 font-display font-semibold text-slate-950 transition hover:shadow-lg hover:shadow-cyanGlow/50 transform hover:scale-105"
              >
                ▶ Start Workout
              </button>
            ) : (
              <button
                onClick={handleEndWorkout}
                className="flex-1 rounded-2xl bg-gradient-to-r from-coral to-red-400 px-6 py-3 font-display font-semibold text-white transition hover:shadow-lg hover:shadow-coral/50 transform hover:scale-105"
              >
                ⏹ End Workout
              </button>
            )}
          </div>
        </div>

        <form className="mt-8 grid gap-4 lg:grid-cols-[1fr_1fr_auto]" onSubmit={handleAddExercise}>
          <input
            value={exerciseForm.name}
            onChange={(event) => setExerciseForm((current) => ({ ...current, name: event.target.value }))}
            className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-slate-100 outline-none transition focus:border-cyanGlow"
            placeholder="Add exercise, e.g. Bench Press"
            required
          />
          <input
            value={exerciseForm.notes}
            onChange={(event) => setExerciseForm((current) => ({ ...current, notes: event.target.value }))}
            className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-slate-100 outline-none transition focus:border-cyanGlow"
            placeholder="Notes or cues"
          />
          <button
            type="submit"
            className="rounded-2xl bg-cyanGlow px-5 py-3 font-display text-slate-950 transition hover:opacity-90"
          >
            Add exercise
          </button>
        </form>

        {error ? <p className="mt-4 rounded-2xl bg-coral/10 px-4 py-3 text-sm text-coral">{error}</p> : null}
      </section>

      <section className="space-y-4">
        {workout.exercises.length === 0 ? (
          <div className="panel p-8 text-center text-slate-300">
            No exercises yet. Add one above to start logging sets.
          </div>
        ) : null}

        {workout.exercises.map((exercise, index) => (
          <article
            key={exercise.id}
            className="panel animate-fade-up p-6 sm:p-8"
            style={{ animationDelay: `${0.08 * (index + 1)}s` }}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="font-display text-xs uppercase tracking-[0.35em] text-cyanGlow">
                  Exercise
                </p>
                <h3 className="mt-2 font-display text-2xl text-sand">{exercise.name}</h3>
                <p className="mt-2 text-sm text-slate-300">{exercise.notes || "No exercise notes added yet."}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteExercise(exercise.id)}
                className="rounded-full border border-coral/40 px-4 py-2 text-sm font-semibold text-coral transition hover:bg-coral/10"
              >
                Remove exercise
              </button>
            </div>

            <form
              className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr_auto]"
              onSubmit={(event) => handleAddSet(event, exercise.id)}
            >
              <input
                type="number"
                min="1"
                value={setForms[exercise.id]?.reps || ""}
                onChange={(event) => handleSetInput(exercise.id, "reps", event.target.value)}
                className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-slate-100 outline-none transition focus:border-cyanGlow"
                placeholder="Reps"
                required
              />
              <input
                type="number"
                min="0"
                step="0.5"
                value={setForms[exercise.id]?.weight || ""}
                onChange={(event) => handleSetInput(exercise.id, "weight", event.target.value)}
                className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-slate-100 outline-none transition focus:border-cyanGlow"
                placeholder="Weight"
                required
              />
              <button
                type="submit"
                className="rounded-2xl bg-sand px-5 py-3 font-display text-slate-950 transition hover:opacity-90"
              >
                Log set
              </button>
            </form>

            <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
              <div className="grid grid-cols-[0.7fr_0.7fr_1.2fr_auto] gap-4 bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.25em] text-slate-400">
                <span>Reps</span>
                <span>Weight</span>
                <span>Time</span>
                <span>Action</span>
              </div>
              <div className="divide-y divide-white/10">
                {exercise.sets.length === 0 ? (
                  <div className="px-4 py-5 text-sm text-slate-300">No sets logged yet.</div>
                ) : null}

                {exercise.sets.map((setEntry) => (
                  <div
                    key={setEntry.id}
                    className="grid grid-cols-[0.7fr_0.7fr_1.2fr_auto] items-center gap-4 px-4 py-4 text-sm text-slate-200"
                  >
                    <span>{setEntry.reps}</span>
                    <span>{setEntry.weight} kg</span>
                    <span>{new Date(setEntry.performed_at).toLocaleString()}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteSet(setEntry.id)}
                      className="justify-self-start rounded-full border border-coral/40 px-3 py-1 text-xs font-semibold text-coral transition hover:bg-coral/10"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export default WorkoutSessionPage;
