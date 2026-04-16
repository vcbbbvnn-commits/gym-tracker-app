import { useEffect, useState } from "react";
import api from "../api/client";
import SectionHeading from "../components/SectionHeading";

function ProgressPage() {
  const [summary, setSummary] = useState(null);
  const [exerciseProgress, setExerciseProgress] = useState([]);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const [summaryResponse, exercisesResponse, historyResponse] = await Promise.all([
          api.get("/progress/summary"),
          api.get("/progress/exercises"),
          api.get("/progress/history"),
        ]);

        setSummary(summaryResponse.data);
        setExerciseProgress(exercisesResponse.data);
        setHistory(historyResponse.data);
      } catch (requestError) {
        setError(requestError.response?.data?.detail || "Unable to load progress data.");
      }
    };

    loadProgress();
  }, []);

  return (
    <div className="space-y-6">
      <section className="panel animate-fade-up p-6 sm:p-8">
        <SectionHeading
          eyebrow="Progress"
          title="Measure the work"
          subtitle="Keep an eye on total training volume, sessions completed, and which lifts are moving."
        />

        {error ? <p className="mt-6 rounded-2xl bg-coral/10 px-4 py-3 text-sm text-coral">{error}</p> : null}

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Total workouts", summary?.total_workouts ?? 0],
            ["Total exercises", summary?.total_exercises ?? 0],
            ["Total sets", summary?.total_sets ?? 0],
            ["Volume", `${summary?.total_volume ?? 0} kg`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{label}</p>
              <p className="mt-3 font-display text-3xl text-sand">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="panel animate-fade-up p-6 sm:p-8" style={{ animationDelay: "0.1s" }}>
          <SectionHeading
            eyebrow="By Exercise"
            title="Lift overview"
            subtitle="See which movements are carrying the most volume and where your best weights sit."
          />

          <div className="mt-8 space-y-3">
            {exerciseProgress.length === 0 ? (
              <p className="text-sm text-slate-300">No exercise progress yet. Log a workout session first.</p>
            ) : null}

            {exerciseProgress.map((item) => (
              <div
                key={item.exercise_name}
                className="rounded-3xl border border-white/10 bg-slate-950/40 p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-display text-xl text-sand">{item.exercise_name}</h3>
                    <p className="mt-2 text-sm text-slate-300">{item.total_sets} sets tracked</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm text-slate-200">
                    <div className="rounded-2xl bg-white/5 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Best weight</p>
                      <p className="mt-2 font-semibold">{item.best_weight} kg</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Volume</p>
                      <p className="mt-2 font-semibold">{item.total_volume} kg</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel animate-fade-up p-6 sm:p-8" style={{ animationDelay: "0.16s" }}>
          <SectionHeading
            eyebrow="History"
            title="Workout timeline"
            subtitle="Review past workout structures and how much work you logged in each session."
          />

          <div className="mt-8 space-y-4">
            {history.length === 0 ? <p className="text-sm text-slate-300">No workout history yet.</p> : null}

            {history.map((workout) => {
              const setCount = workout.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
              return (
                <div key={workout.id} className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-display text-xl text-sand">{workout.name}</h3>
                      <p className="mt-2 text-sm text-slate-300">
                        {workout.description || "No workout notes."}
                      </p>
                    </div>
                    <div className="text-sm text-slate-300">
                      <p>{workout.exercises.length} exercises</p>
                      <p>{setCount} total sets</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProgressPage;
