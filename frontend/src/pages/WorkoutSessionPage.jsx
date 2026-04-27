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

/* ─── 1RM calculator (Epley formula) ────────────── */
function calc1RM(weight, reps) {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

/* ─── Set Type Config ────────────────────────────── */
const SET_TYPES = [
  { key: "warmup",  label: "W",  full: "Warmup",  color: "#ffd60a" },
  { key: "normal",  label: "N",  full: "Working", color: "#30d158" },
  { key: "drop",    label: "D",  full: "Drop",    color: "#bf5af2" },
  { key: "failure", label: "F",  full: "Failure", color: "#ff375f" },
];

/* ─── Plate Calculator ───────────────────────────── */
const PLATE_WEIGHTS = [25, 20, 15, 10, 5, 2.5, 1.25];
const PLATE_COLORS  = {
  25: "#ff375f", 20: "#0a84ff", 15: "#ffd60a",
  10: "#30d158", 5: "#bf5af2", 2.5: "#ff9500", 1.25: "#8e8e93",
};

function calcPlates(targetKg, barKg) {
  let remaining = (targetKg - barKg) / 2;
  const result = [];
  for (const plate of PLATE_WEIGHTS) {
    const count = Math.floor(remaining / plate);
    if (count > 0) { result.push({ plate, count }); remaining -= count * plate; }
  }
  return result;
}

function PlateCalculator({ onClose }) {
  const [target, setTarget] = useState("100");
  const [bar, setBar] = useState("20");
  const targetKg = parseFloat(target) || 0;
  const barKg    = parseFloat(bar)    || 20;
  const valid    = targetKg >= barKg;
  const plates   = valid ? calcPlates(targetKg, barKg) : [];
  const totalCheck = barKg + plates.reduce((s, { plate, count }) => s + plate * count * 2, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(20px)" }}
      onClick={onClose}>
      <div className="w-full max-w-md rounded-t-3xl p-6 ios-slide-up"
        style={{ background: "#1c1c1e", border: "0.5px solid rgba(255,255,255,0.12)" }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-black text-white">🧮 Plate Calculator</h3>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>Plates per side shown below</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">✕</button>
        </div>

        {/* Inputs */}
        <div className="flex gap-3 mb-5">
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-wider mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>Target Weight (kg)</p>
            <input type="number" value={target} onChange={e => setTarget(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-lg font-black text-white outline-none"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,107,0,0.5)" }} />
          </div>
          <div className="w-28">
            <p className="text-[10px] uppercase tracking-wider mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>Bar (kg)</p>
            <select value={bar} onChange={e => setBar(e.target.value)}
              className="w-full rounded-xl px-3 py-3 text-sm font-bold text-white outline-none"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <option value="20">20 kg</option>
              <option value="15">15 kg</option>
              <option value="10">10 kg</option>
            </select>
          </div>
        </div>

        {!valid && <p className="text-sm text-center mb-4" style={{ color: "#ff453a" }}>Target must be ≥ bar weight</p>}

        {/* Plate visualization */}
        {valid && plates.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center justify-center gap-1 mb-3">
              {/* Bar center */}
              <div className="h-4 w-16 rounded-full" style={{ background: "#8e8e93" }} />
              {/* Plates stacked outward */}
              {plates.map(({ plate, count }) =>
                Array.from({ length: count }).map((_, i) => (
                  <div key={`${plate}-${i}`}
                    className="rounded-sm flex items-center justify-center text-[8px] font-black"
                    style={{
                      width: "18px",
                      height: `${Math.max(24, plate * 2.2)}px`,
                      background: PLATE_COLORS[plate] || "#666",
                      color: "#000",
                    }}>
                    {plate}
                  </div>
                ))
              )}
              <div className="h-3 w-6 rounded-full" style={{ background: "#8e8e93" }} />
            </div>

            {/* Text summary */}
            <div className="rounded-xl p-4 space-y-2" style={{ background: "rgba(255,255,255,0.05)" }}>
              <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>
                Each Side
              </p>
              {plates.map(({ plate, count }) => (
                <div key={plate} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm" style={{ background: PLATE_COLORS[plate] }} />
                    <span className="text-sm text-white font-bold">{plate} kg</span>
                  </div>
                  <span className="text-sm font-black" style={{ color: PLATE_COLORS[plate] }}>× {count}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-white/10 flex justify-between">
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Total on bar</span>
                <span className="text-sm font-black" style={{ color: "#ff6b00" }}>{totalCheck} kg</span>
              </div>
            </div>
          </div>
        )}
        {valid && plates.length === 0 && (
          <p className="text-center text-sm mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
            No plates needed — just the bar ({barKg} kg)
          </p>
        )}
      </div>
    </div>
  );
}


/* ─── ExerciseCard ──────────────────────────────── */
function ExerciseCard({ exercise, accentColor, muscleImg, onDeleteExercise, onAddSet, onDeleteSet, index, onSetLogged }) {
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [setType, setSetType] = useState("normal");
  const [logging, setLogging] = useState(false);
  const [prevSession, setPrevSession] = useState(null);

  // Fetch previous session data for this exercise
  useEffect(() => {
    api.get(`/body-weight/last-session/${encodeURIComponent(exercise.name)}`)
      .then(r => { if (r.data.sets?.length) setPrevSession(r.data); })
      .catch(() => {});
  }, [exercise.name]);

  const handleLog = async (e) => {
    e.preventDefault();
    if (!reps || !weight) return;
    setLogging(true);
    await onAddSet(exercise.id, Number(reps), Number(weight), setType);
    setReps(""); setWeight(""); setLogging(false);
    if (onSetLogged) onSetLogged();
  };

  // Best 1RM from logged sets
  const best1RM = exercise.sets.length
    ? Math.max(...exercise.sets.map(s => calc1RM(s.weight, s.reps)))
    : null;

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
              {best1RM && (
                <p className="text-xs mt-0.5 font-bold" style={{ color: "#ffd60a" }}>
                  🏆 1RM ≈ {best1RM} kg
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

        {/* Previous session hint */}
        {prevSession && (() => {
          const workingSets = prevSession.sets.filter(s => s.set_type !== "warmup");
          const bestSet = workingSets.reduce((b, s) => s.weight > (b?.weight || 0) ? s : b, null);
          // Progressive overload: if hit ≥ 10 reps at top weight → suggest +2.5kg
          const suggestIncrease = bestSet && bestSet.reps >= 10;
          const suggestedWeight = bestSet ? bestSet.weight + 2.5 : null;
          return (
            <>
              <div className="mb-2 rounded-xl px-3 py-2 flex items-center gap-2"
                style={{background:"rgba(10,132,255,0.08)",border:"0.5px solid rgba(10,132,255,0.2)"}}>
                <span className="text-sm">📅</span>
                <div>
                  <p className="text-[10px] uppercase tracking-wider" style={{color:"rgba(10,132,255,0.7)"}}>Last session</p>
                  <p className="text-xs font-semibold text-white/70">
                    {workingSets.map(s => `${s.reps}×${s.weight}kg`).join(" · ")}
                  </p>
                </div>
              </div>
              {suggestIncrease && suggestedWeight && (
                <div className="mb-3 rounded-xl px-3 py-2 flex items-center gap-2"
                  style={{background:"rgba(48,209,88,0.08)",border:"0.5px solid rgba(48,209,88,0.25)"}}>
                  <span className="text-sm">🤖</span>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-wider" style={{color:"rgba(48,209,88,0.8)"}}>Progressive Overload</p>
                    <p className="text-xs font-semibold" style={{color:"rgba(255,255,255,0.8)"}}>
                      Hit {bestSet.reps} reps last time → Try <span style={{color:"#30d158",fontWeight:900}}>{suggestedWeight} kg</span> today 💪
                    </p>
                  </div>
                  <button type="button" onClick={() => setWeight(String(suggestedWeight))}
                    className="rounded-lg px-2.5 py-1 text-[11px] font-black"
                    style={{background:"rgba(48,209,88,0.2)",color:"#30d158"}}>
                    Use
                  </button>
                </div>
              )}
            </>
          );
        })()}

        {/* Set type selector */}
        <div className="mb-3 flex items-center gap-1.5">
          <p className="text-[10px] uppercase tracking-wider mr-1" style={{color:"rgba(255,255,255,0.3)"}}>Set:</p>
          {SET_TYPES.map(st => (
            <button key={st.key} type="button" onClick={()=>setSetType(st.key)}
              className="rounded-lg px-2.5 py-1 text-[11px] font-black transition"
              style={setType===st.key
                ?{background:st.color,color:"#000"}
                :{background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.4)"}}>
              {st.full}
            </button>
          ))}
        </div>

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
  const [restTimer, setRestTimer] = useState(null);
  const [restDuration, setRestDuration] = useState(90);
  const [showSummary, setShowSummary] = useState(false);
  const [showPlates, setShowPlates] = useState(false);
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

  const handleAddSet = async (exerciseId, reps, weight, set_type = "normal") => {
    try {
      const { data } = await api.post(`/workouts/exercises/${exerciseId}/sets`, { reps, weight, set_type });
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
    <>
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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPlates(true)}
                  className="rounded-full px-4 py-1 text-xs font-black uppercase tracking-widest flex items-center gap-1.5 transition active:scale-95"
                  style={{
                    background: "rgba(255,107,0,0.15)",
                    border: "1px solid rgba(255,107,0,0.3)",
                    color: "#ff6b00",
                  }}
                >
                  🧮 Plate Calc
                </button>
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

        {/* ── Finish Workout Button ── */}
        {totalSets > 0 && (
          <button
            type="button"
            onClick={() => { setIsActive(false); setShowSummary(true); }}
            className="w-full rounded-2xl py-4 text-base font-black uppercase tracking-widest transition active:scale-95"
            style={{ background: "linear-gradient(135deg,#30d158,#0a84ff)", color: "#000", boxShadow: "0 8px 24px rgba(48,209,88,0.35)" }}
          >
            🏁 Finish Workout
          </button>
        )}

      </div>
    </div>

    {/* ── Plate Calculator Modal ── */}
    {showPlates && <PlateCalculator onClose={() => setShowPlates(false)} />}

    {/* ── Workout Summary Modal ── */}
    {showSummary && workout && (
      <div className="fixed inset-0 z-50 flex items-end justify-center"
        style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(20px)" }}>
        <div className="w-full max-w-lg rounded-t-3xl p-8 ios-slide-up"
          style={{ background: "#1c1c1e", border: "0.5px solid rgba(255,255,255,0.12)" }}>
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-6xl mb-3">🏆</div>
            <h2 className="text-3xl font-black uppercase text-white" style={{ fontFamily: "'Bebas Neue',sans-serif" }}>
              Workout Complete!
            </h2>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
              {workout.name}
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon: "⏱️", label: "Duration", value: formatTime(elapsed) },
              { icon: "📊", label: "Total Sets", value: totalSets },
              { icon: "⚖️", label: "Volume", value: `${Math.round(totalVolume).toLocaleString()} kg` },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-4 text-center" style={{ background: "rgba(255,255,255,0.05)" }}>
                <p className="text-2xl mb-1">{s.icon}</p>
                <p className="text-lg font-black text-white">{s.value}</p>
                <p className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* PRs broken */}
          {workout.exercises.map(ex => {
            const pr = ex.sets.length
              ? Math.max(...ex.sets.map(s => calc1RM(s.weight, s.reps)))
              : 0;
            if (!pr) return null;
            return (
              <div key={ex.id} className="pr-banner flex items-center gap-3 mb-2">
                <span>🏅</span>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider" style={{ color: "#ffd60a" }}>Est. 1RM</p>
                  <p className="text-sm font-bold text-white">{ex.name} — {pr} kg</p>
                </div>
              </div>
            );
          })}

          <div className="mt-6 flex gap-3">
            <button type="button" onClick={() => setShowSummary(false)}
              className="flex-1 rounded-2xl py-4 text-sm font-bold"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}>
              Keep Editing
            </button>
            <Link to="/sessions"
              className="flex-1 rounded-2xl py-4 text-sm font-black text-center text-black"
              style={{ background: "linear-gradient(135deg,#30d158,#0a84ff)", boxShadow: "0 4px 16px rgba(48,209,88,0.35)" }}>
              Done ✓
            </Link>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

export default WorkoutSessionPage;

