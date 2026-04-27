import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import SectionHeading from "../components/SectionHeading";

const workoutTemplates = ["Push", "Pull", "Legs", "Upper", "Lower", "Full Body"];

// Muscle group images
const MUSCLE_IMAGES = {
  Push:      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80&fit=crop",
  Pull:      "https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=400&q=80&fit=crop",
  Legs:      "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80&fit=crop",
  Upper:     "https://images.unsplash.com/photo-1581009137042-c552e485697a?w=400&q=80&fit=crop",
  Lower:     "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80&fit=crop",
  "Full Body": "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=400&q=80&fit=crop",
};

// Detect PR from workouts (highest weight for any exercise)
function detectPR(workouts) {
  let pr = null;
  let bestWeight = 0;
  workouts.forEach(w => {
    w.exercises?.forEach(ex => {
      ex.sets?.forEach(s => {
        if (s.weight > bestWeight) {
          bestWeight = s.weight;
          pr = { exercise: ex.name, weight: s.weight };
        }
      });
    });
  });
  return pr;
}

// Calculate streak (consecutive days with a workout)
function calcStreak(workouts) {
  if (!workouts.length) return 0;
  const days = new Set(workouts.map(w =>
    new Date(w.created_at || Date.now()).toDateString()
  ));
  let streak = 0;
  let d = new Date();
  while (days.has(d.toDateString())) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function DashboardPage() {
  const [workouts, setWorkouts]   = useState([]);
  const [form, setForm]           = useState({ name: "Push", description: "" });
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState("");

  const loadWorkouts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/workouts");
      setWorkouts(data);
    } catch (e) {
      setError(e.response?.data?.detail || "Unable to load workouts.");
    } finally { setLoading(false); }
  };

  useEffect(() => { loadWorkouts(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError("");
    try {
      await api.post("/workouts", form);
      setForm({ name: "Push", description: "" });
      await loadWorkouts();
    } catch (e) {
      setError(e.response?.data?.detail || "Unable to create workout.");
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/workouts/${id}`);
      await loadWorkouts();
    } catch (e) {
      setError(e.response?.data?.detail || "Unable to delete workout.");
    }
  };

  const streak = calcStreak(workouts);
  const pr     = detectPR(workouts);
  const totalSets = workouts.reduce((t, w) =>
    t + (w.exercises?.reduce((s, e) => s + e.sets.length, 0) || 0), 0);
  const muscleImg = MUSCLE_IMAGES[form.name] || MUSCLE_IMAGES["Full Body"];

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Dashboard" title="Build your split" />

      {/* ── Streak + PR Banners ── */}
      {(streak > 0 || pr) && (
        <div className="flex flex-wrap gap-3">
          {streak > 0 && (
            <div className="streak-badge">
              🔥 {streak}-Day Streak — Keep it going!
            </div>
          )}
          {pr && (
            <div className="pr-banner flex items-center gap-3">
              <span className="text-xl">🏆</span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#ffd60a" }}>
                  Personal Record
                </p>
                <p className="text-sm font-black text-white">
                  {pr.exercise} — {pr.weight} kg
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        {/* ── CREATE FORM ── */}
        <section className="ios-card overflow-visible">
          <div className="p-6">
            <h2 className="text-xl font-black text-white">Create Workout</h2>
            <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              Choose your split to get started
            </p>
          </div>

          {/* Muscle group image */}
          <div className="relative mx-6 mb-5 h-44 overflow-hidden rounded-2xl">
            <img
              src={muscleImg}
              alt={`${form.name} muscles`}
              className="h-full w-full object-cover"
              style={{ filter: "brightness(0.65) saturate(0.9)" }}
            />
            <div className="absolute inset-0 flex items-end p-4"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)" }}>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,107,0,0.9)" }}>
                  Training Focus
                </p>
                <p className="text-2xl font-black uppercase text-white"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  {form.name} Day
                </p>
              </div>
            </div>
          </div>

          <form className="px-6 pb-6 space-y-4" onSubmit={handleCreate}>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.4)" }}>
                Workout Type
              </label>
              <select
                value={form.name}
                onChange={e => setForm(c => ({ ...c, name: e.target.value }))}
                className="input-field"
              >
                {workoutTemplates.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.4)" }} htmlFor="desc">
                Notes <span style={{ color: "rgba(255,255,255,0.25)" }}>(optional)</span>
              </label>
              <textarea id="desc" rows="3" value={form.description}
                onChange={e => setForm(c => ({ ...c, description: e.target.value }))}
                className="input-field resize-none"
                placeholder="Heavy compounds first, then isolations."
              />
            </div>

            {error && (
              <div className="rounded-xl px-4 py-3 text-sm"
                style={{ background: "rgba(255,69,58,0.12)", color: "#ff453a" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn-fire w-full py-4 text-base font-black">
              {submitting ? "Creating…" : `+ Create ${form.name} Workout`}
            </button>
          </form>

          {/* Templates callout */}
          <div className="mx-6 mb-6 rounded-2xl p-4"
            style={{ background: "rgba(10,132,255,0.1)", border: "0.5px solid rgba(10,132,255,0.3)" }}>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
              ✨ Want a full program?{" "}
              <Link to="/templates" className="font-bold" style={{ color: "#0a84ff" }}>
                Browse pre-built splits →
              </Link>
            </p>
          </div>
        </section>

        {/* ── SESSIONS LIST ── */}
        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white">Active Sessions</h2>
              <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                {workouts.length} workout{workouts.length !== 1 ? "s" : ""} · {totalSets} total sets
              </p>
            </div>
          </div>

          {loading && (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
            </div>
          )}

          {!loading && workouts.length === 0 && (
            <div className="flex min-h-[380px] flex-col items-center justify-center rounded-2xl text-center"
              style={{ background: "#1c1c1e", border: "2px dashed rgba(255,255,255,0.08)" }}>
              <div className="mb-4 text-7xl">🏋️‍♂️</div>
              <h3 className="text-2xl font-black text-white">No workouts yet</h3>
              <p className="mt-2 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                Create your first split on the left
              </p>
            </div>
          )}

          <div className="space-y-3">
            {workouts.map(workout => {
              const setCount = workout.exercises?.reduce((t, e) => t + e.sets.length, 0) || 0;
              const vol = workout.exercises?.reduce((t, e) =>
                t + e.sets.reduce((s, st) => s + st.reps * st.weight, 0), 0) || 0;
              const img = MUSCLE_IMAGES[workout.name] || MUSCLE_IMAGES["Full Body"];

              return (
                <div key={workout.id} className="workout-card">
                  <div className="flex gap-4">
                    {/* Muscle thumbnail */}
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                      <img src={img} alt={workout.name} className="h-full w-full object-cover"
                        style={{ filter: "brightness(0.7) saturate(0.85)" }} />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <h3 className="text-base font-black text-white">{workout.name}</h3>
                        <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                          {workout.description || "Tap to add exercises"}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                        <span>💪 {workout.exercises?.length || 0} exercises</span>
                        <span>📊 {setCount} sets</span>
                        {vol > 0 && <span>⚖️ {vol.toLocaleString()} kg</span>}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2">
                      <Link to={`/workouts/${workout.id}`}
                        className="rounded-xl px-4 py-2 text-sm font-black text-white text-center"
                        style={{ background: "#ff6b00", boxShadow: "0 4px 12px rgba(255,107,0,0.35)" }}>
                        Open
                      </Link>
                      <button type="button" onClick={() => handleDelete(workout.id)}
                        className="rounded-xl px-4 py-2 text-sm font-semibold text-center"
                        style={{ background: "rgba(255,69,58,0.12)", color: "#ff453a" }}>
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
    </div>
  );
}

export default DashboardPage;
