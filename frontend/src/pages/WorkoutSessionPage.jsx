import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client";

/* ─── tiny helpers ─────────────────────────────── */
function formatTime(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

const FOCUS_CONFIG = {
  CHEST:     { color: "#ff6b00", bg: "rgba(255,107,0,0.12)",  border: "rgba(255,107,0,0.3)",  icon: "🏋️" },
  BACK:      { color: "#0a84ff", bg: "rgba(10,132,255,0.12)", border: "rgba(10,132,255,0.3)", icon: "↙️" },
  SHOULDERS: { color: "#bf5af2", bg: "rgba(191,90,242,0.12)", border: "rgba(191,90,242,0.3)", icon: "💪" },
  LEGS:      { color: "#30d158", bg: "rgba(48,209,88,0.12)",  border: "rgba(48,209,88,0.3)",  icon: "🦵" },
  BICEPS:    { color: "#ffd60a", bg: "rgba(255,214,10,0.12)", border: "rgba(255,214,10,0.3)", icon: "💪" },
  TRICEPS:   { color: "#ff375f", bg: "rgba(255,55,95,0.12)",  border: "rgba(255,55,95,0.3)",  icon: "🔱" },
  ARMS:      { color: "#ff375f", bg: "rgba(255,55,95,0.12)",  border: "rgba(255,55,95,0.3)",  icon: "💪" },
  PUSH:      { color: "#ff6b00", bg: "rgba(255,107,0,0.12)",  border: "rgba(255,107,0,0.3)",  icon: "↗️" },
  PULL:      { color: "#0a84ff", bg: "rgba(10,132,255,0.12)", border: "rgba(10,132,255,0.3)", icon: "↙️" },
  UPPER:     { color: "#bf5af2", bg: "rgba(191,90,242,0.12)", border: "rgba(191,90,242,0.3)", icon: "🧥" },
  LOWER:     { color: "#30d158", bg: "rgba(48,209,88,0.12)",  border: "rgba(48,209,88,0.3)",  icon: "🦵" },
  TRAINING:  { color: "#ffd60a", bg: "rgba(255,214,10,0.12)", border: "rgba(255,214,10,0.3)", icon: "⚡" },
};

function getFocusFromName(name = "") {
  const n = name.toUpperCase();
  for (const key of Object.keys(FOCUS_CONFIG)) {
    if (n.includes(key)) return key;
  }
  return "TRAINING";
}

/* ─── Muscle images ─────────────────────────────── */
const MUSCLE_IMAGES = {
  CHEST:"https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=300&q=75&fit=crop",
  BACK:"https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=300&q=75&fit=crop",
  SHOULDERS:"https://images.unsplash.com/photo-1581009137042-c552e485697a?w=300&q=75&fit=crop",
  LEGS:"https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=300&q=75&fit=crop",
  BICEPS:"https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=300&q=75&fit=crop",
  TRICEPS:"https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=300&q=75&fit=crop",
  ARMS:"https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=300&q=75&fit=crop",
  PUSH:"https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=300&q=75&fit=crop",
  PULL:"https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=300&q=75&fit=crop",
  UPPER:"https://images.unsplash.com/photo-1581009137042-c552e485697a?w=300&q=75&fit=crop",
  LOWER:"https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=300&q=75&fit=crop",
  TRAINING:"https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=300&q=75&fit=crop",
};

/* ─── Rest Timer ─────────────────────────────────── */
function RestTimer({ seconds, onDone, onSkip }) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    if (remaining <= 0) { onDone(); return; }
    const t = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining]);
  const pct = ((seconds - remaining) / seconds) * 100;
  return (
    <div className="rest-timer mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">⏱️</span>
          <div>
            <p className="text-xs font-black uppercase tracking-wider" style={{color:"#0a84ff"}}>Rest Timer</p>
            <p className="text-xs" style={{color:"rgba(255,255,255,0.4)"}}>Next set in…</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-black tabular-nums" style={{color:"#0a84ff"}}>{remaining}s</span>
          <button type="button" onClick={onSkip}
            className="rounded-xl px-3 py-1.5 text-xs font-bold"
            style={{background:"rgba(10,132,255,0.15)",color:"#0a84ff"}}>Skip</button>
        </div>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{background:"rgba(10,132,255,0.15)"}}>
        <div className="h-full rounded-full transition-all duration-1000"
          style={{width:`${pct}%`,background:"#0a84ff"}} />
      </div>
    </div>
  );
}

/* ─── ExerciseCard ──────────────────────────────── */
function ExerciseCard({ exercise, accentColor, muscleImg, onDeleteExercise, onAddSet, onDeleteSet, index, onSetLogged }) {
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [logging, setLogging] = useState(false);

  const handleLog = async (e) => {
    e.preventDefault();
    if (!reps || !weight) return;
    setLogging(true);
    await onAddSet(exercise.id, Number(reps), Number(weight));
    setReps(""); setWeight(""); setLogging(false);
    if (onSetLogged) onSetLogged();
  };

  const completedSets = exercise.sets.length;
  const notesMatch = exercise.notes?.match(/(\d+)\s*sets?\s*[×x]\s*([\d\-–]+)\s*reps?/i);
  const targetSets = notesMatch ? parseInt(notesMatch[1]) : null;
  const targetReps = notesMatch ? notesMatch[2] : null;

  return (
    <div className="relative overflow-hidden rounded-2xl ios-slide-up"
      style={{animationDelay:`${index*80}ms`,background:"#1c1c1e"}}>
      {/* Muscle image strip */}
      {muscleImg && (
        <div className="relative h-24 overflow-hidden">
          <img src={muscleImg} alt="muscle" className="h-full w-full object-cover"
            style={{filter:"brightness(0.4) saturate(0.7)"}} />
          <div className="absolute inset-0" style={{background:"linear-gradient(to bottom,transparent 30%,#1c1c1e 100%)"}} />
          <div className="absolute inset-x-0 bottom-0 h-0.5" style={{background:`linear-gradient(90deg,${accentColor},transparent)`}} />
        </div>
      )}
      <div className="px-4 pb-4 pt-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-sm font-black"
              style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}30`, color: accentColor }}
            >
              {index + 1}
            </div>
            <div>
              <h3 className="font-bold text-white text-base leading-tight">{exercise.name}</h3>
              {targetSets && targetReps && (
                <p className="text-xs mt-0.5" style={{ color: accentColor }}>
                  Target: {targetSets} sets × {targetReps} reps
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => onDeleteExercise(exercise.id)}
            className="rounded-full px-3 py-1 text-[11px] font-semibold text-gray-500 border border-white/10 hover:border-red-500/40 hover:text-red-400 transition-all"
          >
            Remove
          </button>
        </div>

        {/* Sets progress bar */}
        {targetSets && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">Sets completed</span>
              <span className="text-[11px] font-bold" style={{ color: accentColor }}>
                {completedSets} / {targetSets}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min((completedSets / targetSets) * 100, 100)}%`,
                  background: `linear-gradient(90deg, ${accentColor} 0%, ${accentColor}88 100%)`,
                  boxShadow: `0 0 8px ${accentColor}60`,
                }}
              />
            </div>
          </div>
        )}

        {/* Log set form */}
        <form onSubmit={handleLog} className="mb-4 flex gap-2">
          <input
            type="number"
            min="1"
            placeholder="Reps"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            required
            className="flex-1 rounded-xl border px-3 py-2.5 text-sm text-white outline-none transition-all placeholder-gray-600"
            style={{
              background: "rgba(0,0,0,0.4)",
              borderColor: "rgba(255,255,255,0.1)",
            }}
            onFocus={(e) => (e.target.style.borderColor = accentColor + "80")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
          />
          <input
            type="number"
            min="0"
            step="0.5"
            placeholder="kg"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
            className="flex-1 rounded-xl border px-3 py-2.5 text-sm text-white outline-none transition-all placeholder-gray-600"
            style={{
              background: "rgba(0,0,0,0.4)",
              borderColor: "rgba(255,255,255,0.1)",
            }}
            onFocus={(e) => (e.target.style.borderColor = accentColor + "80")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
          />
          <button
            type="submit"
            disabled={logging || !reps || !weight}
            className="rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 disabled:opacity-40"
            style={{
              background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}bb 100%)`,
              color: "#000",
              boxShadow: `0 4px 12px ${accentColor}40`,
            }}
          >
            {logging ? "…" : "+ Log"}
          </button>
        </form>

        {/* Logged sets table */}
        {exercise.sets.length > 0 && (
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {/* Header */}
            <div
              className="grid grid-cols-[32px_1fr_1fr_1fr_auto] gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-600"
              style={{ background: "rgba(0,0,0,0.3)" }}
            >
              <span>Set</span>
              <span>Reps</span>
              <span>Weight</span>
              <span>Time</span>
              <span></span>
            </div>
            {exercise.sets.map((s, i) => (
              <div
                key={s.id}
                className="grid grid-cols-[32px_1fr_1fr_1fr_auto] items-center gap-2 px-3 py-2.5 text-sm border-t border-white/5"
                style={{
                  background: i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent",
                }}
              >
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black"
                  style={{ background: `${accentColor}22`, color: accentColor }}
                >
                  {i + 1}
                </span>
                <span className="font-semibold text-white">{s.reps}</span>
                <span className="font-semibold text-white">{s.weight} kg</span>
                <span className="text-xs text-gray-500">
                  {new Date(s.performed_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                <button
                  onClick={() => onDeleteSet(s.id)}
                  className="text-[11px] text-gray-600 hover:text-red-400 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {exercise.sets.length === 0 && (
          <p className="text-xs text-gray-600 italic">No sets logged yet — add your first set above.</p>
        )}
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────── */
function WorkoutSessionPage() {
  const { workoutId } = useParams();
  const [workout, setWorkout]   = useState(null);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(true);
  const [elapsed, setElapsed]   = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [addExName, setAddExName] = useState("");
  const [restTimer, setRestTimer] = useState(null); // null | number (seconds)
  const [restDuration, setRestDuration] = useState(90);
  const intervalRef = useRef(null);

  /* Load workout */
  const loadWorkout = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/workouts/${workoutId}`);
      setWorkout(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to load workout session.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadWorkout(); }, [workoutId]);

  /* Timer */
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setElapsed((e) => e + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive]);

  /* Derive focus from workout name */
  const focus = workout ? getFocusFromName(workout.name) : "TRAINING";
  const cfg = FOCUS_CONFIG[focus] || FOCUS_CONFIG.TRAINING;

  /* Handlers */
  const handleAddExercise = async (e) => {
    e.preventDefault();
    if (!addExName.trim()) return;
    try {
      const { data } = await api.post(`/workouts/${workoutId}/exercises`, { name: addExName.trim(), notes: "" });
      setWorkout(data);
      setAddExName("");
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to add exercise.");
    }
  };

  const handleDeleteExercise = async (exerciseId) => {
    try {
      const { data } = await api.delete(`/workouts/exercises/${exerciseId}`);
      setWorkout(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to delete exercise.");
    }
  };

  const handleAddSet = async (exerciseId, reps, weight) => {
    try {
      const { data } = await api.post(`/workouts/exercises/${exerciseId}/sets`, { reps, weight });
      setWorkout(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to log set.");
    }
  };

  const handleDeleteSet = async (setId) => {
    try {
      const { data } = await api.delete(`/workouts/sets/${setId}`);
      setWorkout(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to delete set.");
    }
  };

  const totalSets = workout?.exercises?.reduce((s, e) => s + e.sets.length, 0) ?? 0;
  const totalVolume = workout?.exercises?.reduce(
    (vol, e) => vol + e.sets.reduce((sv, s) => sv + s.reps * s.weight, 0),
    0
  ) ?? 0;

  /* ─── Loading / error states ─── */
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div
          className="h-14 w-14 animate-spin rounded-full border-4 border-t-transparent"
          style={{ borderColor: "#22d3ee", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-gray-400">{error || "Workout not found."}</p>
        <Link to="/templates" className="btn-fire">
          ← Back to Programs
        </Link>
      </div>
    );
  }

  /* Parse "Day X" from workout name */
  const dayMatch = workout.name.match(/Day\s+(\d+)/i);
  const dayLabel = dayMatch ? `DAY ${dayMatch[1]}` : null;

  return (
    <div className="min-h-screen pb-24 pt-2">
      <div className="mx-auto max-w-3xl px-4">

        {/* ── Session Header ── */}
        <div
          className="mb-6 overflow-hidden rounded-3xl"
          style={{
            background: `linear-gradient(135deg, ${cfg.bg} 0%, rgba(255,255,255,0.02) 100%)`,
            border: `1px solid ${cfg.border}`,
            boxShadow: `0 20px 60px rgba(0,0,0,0.5)`,
          }}
        >
          {/* Top accent */}
          <div
            className="h-1"
            style={{ background: `linear-gradient(90deg, ${cfg.color} 0%, transparent 100%)` }}
          />

          <div className="p-6">
            {/* Back link + day badge */}
            <div className="flex items-center justify-between mb-4">
              <Link
                to="/templates"
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors"
              >
                ← Programs
              </Link>
              {dayLabel && (
                <span
                  className="rounded-full px-4 py-1 text-xs font-black uppercase tracking-widest"
                  style={{
                    background: cfg.bg,
                    border: `1px solid ${cfg.border}`,
                    color: cfg.color,
                  }}
                >
                  {dayLabel}
                </span>
              )}
            </div>

            {/* Focus icon + name */}
            <div className="flex items-center gap-4 mb-6">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl flex-shrink-0"
                style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
              >
                {cfg.icon}
              </div>
              <div>
                <p
                  className="text-xs font-black uppercase tracking-[0.25em] mb-1"
                  style={{ color: cfg.color }}
                >
                  {focus} DAY
                </p>
                <h1
                  className="text-2xl font-black text-white leading-tight"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {workout.name}
                </h1>
              </div>
            </div>

            {/* Timer + stats row */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {/* Timer */}
              <div
                className="col-span-1 flex flex-col items-center justify-center rounded-2xl py-4 px-3"
                style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <span className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Time</span>
                <span
                  className="font-mono text-xl font-black tabular-nums"
                  style={{ color: cfg.color }}
                >
                  {formatTime(elapsed)}
                </span>
              </div>
              {/* Sets */}
              <div
                className="flex flex-col items-center justify-center rounded-2xl py-4 px-3"
                style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <span className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Sets</span>
                <span className="font-black text-xl text-white">{totalSets}</span>
              </div>
              {/* Volume */}
              <div
                className="flex flex-col items-center justify-center rounded-2xl py-4 px-3"
                style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <span className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Volume</span>
                <span className="font-black text-xl text-white">
                  {totalVolume > 0 ? `${totalVolume.toLocaleString()}` : "—"}
                  {totalVolume > 0 && (
                    <span className="text-[11px] text-gray-500 font-normal ml-0.5">kg</span>
                  )}
                </span>
              </div>
            </div>

            {/* Start / Pause / End buttons */}
            <div className="flex gap-3">
              {!isActive ? (
                <button
                  onClick={() => { setStartTime(Date.now()); setIsActive(true); }}
                  className="flex-1 rounded-2xl py-3.5 text-sm font-black uppercase tracking-widest transition-all active:scale-95 hover:opacity-90"
                  style={{
                    background: `linear-gradient(135deg, ${cfg.color} 0%, ${cfg.color}bb 100%)`,
                    color: "#000",
                    boxShadow: `0 4px 20px ${cfg.color}50`,
                  }}
                >
                  ▶  {elapsed === 0 ? "Start Session" : "Resume"}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsActive(false)}
                    className="flex-1 rounded-2xl py-3.5 text-sm font-black uppercase tracking-widest transition-all active:scale-95"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#e5e7eb",
                    }}
                  >
                    ⏸  Pause
                  </button>
                  <button
                    onClick={() => setIsActive(false)}
                    className="rounded-2xl px-6 py-3.5 text-sm font-black uppercase tracking-widest transition-all active:scale-95"
                    style={{
                      background: "rgba(239,68,68,0.15)",
                      border: "1px solid rgba(239,68,68,0.3)",
                      color: "#ef4444",
                    }}
                  >
                    ⏹  Finish
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* ── Rest Timer ── */}
        {restTimer !== null && (
          <RestTimer seconds={restTimer} onDone={()=>setRestTimer(null)} onSkip={()=>setRestTimer(null)} />
        )}
        {/* Rest duration picker */}
        <div className="mb-4 flex items-center gap-2">
          <p className="text-xs font-bold uppercase tracking-wider mr-1" style={{color:"rgba(255,255,255,0.35)"}}>Rest:</p>
          {[60,90,120].map(s=>(
            <button key={s} type="button" onClick={()=>setRestDuration(s)}
              className="rounded-xl px-3 py-1.5 text-xs font-black transition"
              style={restDuration===s
                ?{background:"#0a84ff",color:"white"}
                :{background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.5)"}}>
              {s}s
            </button>
          ))}
        </div>

        {/* ── Exercise List ── */}
        <div className="space-y-4 mb-6">
          {workout.exercises.length === 0 ? (
            <div className="rounded-2xl p-10 text-center" style={{background:"#1c1c1e"}}>
              <p className="text-3xl mb-3">🏋️</p>
              <p className="text-sm" style={{color:"rgba(255,255,255,0.4)"}}>No exercises loaded. Add one below.</p>
            </div>
          ) : (
            workout.exercises.map((exercise, i) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                accentColor={cfg.color}
                muscleImg={MUSCLE_IMAGES[focus]}
                index={i}
                onDeleteExercise={handleDeleteExercise}
                onAddSet={handleAddSet}
                onDeleteSet={handleDeleteSet}
                onSetLogged={()=>setRestTimer(restDuration)}
              />
            ))
          )}
        </div>

        {/* ── Add Exercise ── */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
            + Add Exercise
          </p>
          <form onSubmit={handleAddExercise} className="flex gap-3">
            <input
              value={addExName}
              onChange={(e) => setAddExName(e.target.value)}
              placeholder="Exercise name…"
              required
              className="flex-1 rounded-xl border px-4 py-3 text-sm text-white outline-none transition-all placeholder-gray-600"
              style={{ background: "rgba(0,0,0,0.4)", borderColor: "rgba(255,255,255,0.1)" }}
              onFocus={(e) => (e.target.style.borderColor = cfg.color + "80")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
            <button
              type="submit"
              className="rounded-xl px-5 py-3 text-sm font-bold uppercase tracking-wider transition-all active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${cfg.color} 0%, ${cfg.color}bb 100%)`,
                color: "#000",
                boxShadow: `0 4px 12px ${cfg.color}40`,
              }}
            >
              Add
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default WorkoutSessionPage;
