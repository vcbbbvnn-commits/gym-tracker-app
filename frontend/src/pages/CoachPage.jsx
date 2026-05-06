import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const AI_ENDPOINT = "https://text.pollinations.ai/";

function getProfileKey(user) {
  return `gym_ai_profile_${user?.id || user?.email || "guest"}`;
}

function dateKey(value) {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getStreak(workouts) {
  const days = new Set(workouts.filter((w) => w.created_at).map((w) => dateKey(w.created_at)));
  let current = 0;
  const cursor = new Date();
  while (days.has(dateKey(cursor))) {
    current += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  let longest = 0;
  let run = 0;
  const sorted = [...days].sort();
  sorted.forEach((day, index) => {
    if (index === 0) {
      run = 1;
    } else {
      const prev = new Date(`${sorted[index - 1]}T12:00:00`);
      const now = new Date(`${day}T12:00:00`);
      const diff = Math.round((now - prev) / 86400000);
      run = diff === 1 ? run + 1 : 1;
    }
    longest = Math.max(longest, run);
  });
  return { current, longest };
}

function makePlan(profile, workoutsThisWeek) {
  const goal = profile?.goal || "recomp";
  const days = Number(profile?.trainingDays || 4);
  const base =
    goal === "loss"
      ? ["Full Body", "Zone 2 + Core", "Upper", "Rest", "Lower", "Cardio", "Rest"]
      : goal === "gain"
        ? ["Push", "Pull", "Legs", "Rest", "Upper Pump", "Lower Pump", "Rest"]
        : ["Upper", "Lower", "Rest", "Push", "Pull + Legs", "Rest", "Mobility"];

  return DAYS.map((day, i) => ({
    day,
    focus: i < days ? base[i] : "Rest",
    today: i === (new Date().getDay() + 6) % 7,
    done: workoutsThisWeek.some((w) => new Date(w.created_at).getDay() === ((i + 1) % 7)),
  }));
}

function calcNutrition(profile) {
  const weight = Number(profile?.currentWeight || 70);
  const goal = profile?.goal || "recomp";
  const protein = Math.round(weight * (goal === "loss" ? 2 : 1.8));
  const calories =
    goal === "loss"
      ? Math.round(weight * 28)
      : goal === "gain"
        ? Math.round(weight * 36)
        : Math.round(weight * 32);
  return {
    calories,
    protein,
    carbs: Math.round((calories * 0.45) / 4),
    fats: Math.round((calories * 0.25) / 9),
  };
}

// Muscle groups mapped from workout/exercise names
const MUSCLE_KEYWORDS = {
  chest:     ["chest","bench","fly","push","incline press","decline press","dip"],
  back:      ["back","row","pull","deadlift","lat","pulldown","cable row"],
  shoulders: ["shoulder","overhead","press","lateral raise","front raise","face pull","delt"],
  legs:      ["leg","squat","lunge","calf","hamstring","quad","leg press","leg curl","romanian"],
  biceps:    ["bicep","curl","hammer","preacher"],
  triceps:   ["tricep","pushdown","skull","extension","kickback","dip"],
  core:      ["core","plank","crunch","ab","mountain climber","sit-up"],
  glutes:    ["glute","hip thrust","bridge","kickback"],
};

function getMuscleStatus(workouts) {
  const now = Date.now();
  const result = {};
  for (const muscle of Object.keys(MUSCLE_KEYWORDS)) {
    result[muscle] = { daysAgo: null, status: "none" };
  }
  for (const w of workouts) {
    if (!w.created_at) continue;
    const daysAgo = Math.floor((now - new Date(w.created_at).getTime()) / 86400000);
    if (daysAgo > 5) continue;
    const nameLC = (w.name || "").toLowerCase();
    const exNames = (w.exercises || []).map(e => (e.name || "").toLowerCase());
    const allText = [nameLC, ...exNames].join(" ");
    for (const [muscle, keywords] of Object.entries(MUSCLE_KEYWORDS)) {
      if (keywords.some(kw => allText.includes(kw))) {
        if (result[muscle].daysAgo === null || daysAgo < result[muscle].daysAgo) {
          result[muscle].daysAgo = daysAgo;
        }
      }
    }
  }
  for (const muscle of Object.keys(result)) {
    const d = result[muscle].daysAgo;
    if (d === null)      result[muscle].status = "none";
    else if (d <= 1)     result[muscle].status = "fatigued";
    else if (d <= 2)     result[muscle].status = "recovering";
    else                 result[muscle].status = "ready";
  }
  return result;
}

const STATUS_CONFIG = {
  fatigued:   { color: "#ff375f", label: "Fatigued",   bg: "rgba(255,55,95,0.15)",  border: "rgba(255,55,95,0.3)" },
  recovering: { color: "#ff9500", label: "Recovering", bg: "rgba(255,149,0,0.15)",  border: "rgba(255,149,0,0.3)" },
  ready:      { color: "#30d158", label: "Recovered",  bg: "rgba(48,209,88,0.15)",  border: "rgba(48,209,88,0.3)" },
  none:       { color: "#3a3a3c", label: "Not trained", bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.06)" },
};

function MuscleHeatmap({ workouts }) {
  const muscles = useMemo(() => getMuscleStatus(workouts), [workouts]);
  const muscleOrder = ["chest","back","shoulders","biceps","triceps","legs","core","glutes"];
  const labels = { chest:"Chest", back:"Back", shoulders:"Shoulders", biceps:"Biceps", triceps:"Triceps", legs:"Legs", core:"Core", glutes:"Glutes" };

  return (
    <div className="rounded-3xl p-5 ios-slide-up" style={{ background: "#1c1c1e", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/35">Muscle recovery</p>
          <h2 className="text-xl font-black text-white">Fatigue Heatmap</h2>
        </div>
        <div className="flex items-center gap-3">
          {Object.entries(STATUS_CONFIG).filter(([k])=>k!=="none").map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full" style={{ background: cfg.color }} />
              <span className="text-[9px] font-bold text-white/30">{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {muscleOrder.map(muscle => {
          const s = muscles[muscle];
          const cfg = STATUS_CONFIG[s.status];
          return (
            <div key={muscle} className="rounded-2xl p-3 text-center transition hover:scale-[1.02]"
              style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl text-lg"
                style={{ background: `${cfg.color}20` }}>
                {muscle === "chest" ? "🫁" : muscle === "back" ? "🔙" : muscle === "shoulders" ? "🤷" :
                 muscle === "biceps" ? "💪" : muscle === "triceps" ? "🔱" : muscle === "legs" ? "🦵" :
                 muscle === "core" ? "🎯" : "🍑"}
              </div>
              <p className="text-xs font-black text-white">{labels[muscle]}</p>
              <p className="mt-0.5 text-[10px] font-bold" style={{ color: cfg.color }}>
                {s.daysAgo !== null ? (s.daysAgo === 0 ? "Today" : `${s.daysAgo}d ago`) : "—"}
              </p>
              <div className="mx-auto mt-2 h-1 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="h-full rounded-full" style={{
                  width: s.status === "fatigued" ? "90%" : s.status === "recovering" ? "55%" : s.status === "ready" ? "20%" : "0%",
                  background: cfg.color, transition: "width 0.5s ease",
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SmartCard({ title, value, sub, color = "#ff6b00" }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: "#1c1c1e", border: `1px solid ${color}25` }}>
      <p className="text-[10px] font-black uppercase tracking-widest text-white/35">{title}</p>
      <p className="mt-2 text-3xl font-black" style={{ color }}>{value}</p>
      <p className="mt-1 text-xs leading-5 text-white/40">{sub}</p>
    </div>
  );
}

export default function CoachPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [bodyWeights, setBodyWeights] = useState([]);
  const [profile, setProfile] = useState(null);
  const [reminder, setReminder] = useState(() => localStorage.getItem("gym_training_reminder") || "18:00");
  const [effort, setEffort] = useState("normal");
  const [mealPlan, setMealPlan] = useState("");
  const [mealLoading, setMealLoading] = useState(false);

  // Calendar state
  const [showCal, setShowCal] = useState(false);
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  // Log-workout modal state
  const [showLogModal, setShowLogModal] = useState(false);
  const [logDate, setLogDate] = useState(null);
  const [logName, setLogName] = useState("");
  const [logExercises, setLogExercises] = useState([{ name: "", sets: 3, reps: 10, weight: 0 }]);
  const [logSaving, setLogSaving] = useState(false);

  useEffect(() => {
    api.get("/workouts").then((r) => setWorkouts(r.data || [])).catch(() => {});
    api.get("/body-weight").then((r) => setBodyWeights(r.data || [])).catch(() => {});
    const saved = localStorage.getItem(getProfileKey(user));
    if (saved) setProfile(JSON.parse(saved));
  }, [user]);

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const workoutsThisWeek = workouts.filter((w) => w.created_at && new Date(w.created_at).getTime() > weekAgo);
  const setsThisWeek = workoutsThisWeek.reduce((t, w) => t + (w.exercises?.reduce((s, e) => s + e.sets.length, 0) || 0), 0);
  const streak = getStreak(workouts);
  const weeklyPlan = makePlan(profile, workoutsThisWeek);
  const nutrition = calcNutrition(profile);
  const latest = workouts[0];
  const latestSets = latest?.exercises?.reduce((t, e) => t + e.sets.length, 0) || 0;
  const latestVolume = latest?.exercises?.reduce((t, e) => t + e.sets.reduce((s, set) => s + set.reps * set.weight, 0), 0) || 0;
  const recoveryScore = Math.max(8, Math.min(100, 100 - workoutsThisWeek.length * 8 - Math.max(0, setsThisWeek - 45)));
  const recoveryColor = recoveryScore > 70 ? "#30d158" : recoveryScore > 45 ? "#ff9500" : "#ff375f";
  const latestWeight = bodyWeights.length ? bodyWeights[bodyWeights.length - 1].weight_kg : profile?.currentWeight;
  const targetWeight = profile?.targetWeight;

  const autoAdjust =
    effort === "easy"
      ? "Next session: add 2.5kg to compound lifts or add 1-2 reps per set."
      : effort === "hard"
        ? "Next session: repeat the same weight and try to improve form or reps."
        : effort === "failed"
          ? "Next session: reduce weight by 5-10% and keep the same exercises."
          : "Next session: progress only if all working sets were clean.";

  const saveReminder = (value) => {
    setReminder(value);
    localStorage.setItem("gym_training_reminder", value);
  };

  const generateMeals = async () => {
    setMealLoading(true);
    try {
      const response = await fetch(AI_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai",
          private: true,
          messages: [{ role: "user", content: `Create a concise gym diet plan for ${profile?.goal || "recomp"}, ${latestWeight || 70}kg, target ${targetWeight || "not set"}kg. Include calories, protein, and 3 simple meals under 120 words.` }],
        }),
      });
      setMealPlan((await response.text()).trim());
    } catch {
      setMealPlan(`Calories: ${nutrition.calories}. Protein: ${nutrition.protein}g. Meals: eggs/oats, chicken rice bowl, paneer or fish with vegetables. Keep water high and adjust portions weekly.`);
    } finally {
      setMealLoading(false);
    }
  };

  // Calendar helpers
  const workoutDates = useMemo(() => {
    const m = {};
    workouts.forEach(w => { if (w.created_at) { const k = dateKey(w.created_at); m[k] = m[k] ? [...m[k], w] : [w]; } });
    return m;
  }, [workouts]);

  const calDays = useMemo(() => {
    const first = new Date(calYear, calMonth, 1);
    const startDay = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [calMonth, calYear]);

  const calMonthName = new Date(calYear, calMonth).toLocaleString("default", { month: "long", year: "numeric" });

  const openLogModal = (date) => {
    setLogDate(date);
    setLogName("");
    setLogExercises([{ name: "", sets: 3, reps: 10, weight: 0 }]);
    setShowLogModal(true);
    setSelectedDate(null);
  };

  const addLogExercise = () => setLogExercises(prev => [...prev, { name: "", sets: 3, reps: 10, weight: 0 }]);
  const updateLogEx = (i, field, val) => setLogExercises(prev => prev.map((ex, j) => j === i ? { ...ex, [field]: val } : ex));
  const removeLogEx = (i) => setLogExercises(prev => prev.filter((_, j) => j !== i));

  const saveLogWorkout = async () => {
    if (!logName.trim() || logExercises.every(e => !e.name.trim())) return;
    setLogSaving(true);
    try {
      const { data: workout } = await api.post("/workouts", {
        name: logName.trim(),
        description: `Logged for ${logDate}`,
        performed_at: `${logDate}T12:00:00`,
      });
      for (const ex of logExercises.filter(e => e.name.trim())) {
        const { data: w2 } = await api.post(`/workouts/${workout.id}/exercises`, { name: ex.name.trim() });
        const created = [...w2.exercises].reverse().find(e => e.name === ex.name.trim());
        if (created) {
          for (let s = 0; s < ex.sets; s++) {
            await api.post(`/workouts/exercises/${created.id}/sets`, { reps: ex.reps, weight: ex.weight, set_type: "normal" });
          }
        }
      }
      const r = await api.get("/workouts");
      setWorkouts(r.data || []);
      setShowLogModal(false);
    } catch { /* silently fail */ } finally {
      setLogSaving(false);
    }
  };

  const shareText = latest
    ? `Workout complete: ${latest.name}\nSets: ${latestSets}\nVolume: ${Math.round(latestVolume).toLocaleString()} kg\nStreak: ${streak.current} days`
    : "No workout completed yet.";

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      <div className="ios-slide-up">
        <span className="section-badge mb-3 inline-flex">Smart Coach</span>
        <div className="flex items-center justify-between">
          <h1 className="text-5xl font-black uppercase text-white md:text-7xl" style={{ fontFamily: "'Bebas Neue',sans-serif" }}>
            Coaching Hub
          </h1>
          <button type="button" onClick={() => { setShowCal(!showCal); setSelectedDate(null); }}
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl transition active:scale-90"
            style={{ background: showCal ? "#ff6b00" : "rgba(255,255,255,0.08)" }}>
            📅
          </button>
        </div>
        <p className="mt-1 text-sm text-white/40">Recovery, streaks, diet, weekly planning, reminders, and workout adjustments.</p>
      </div>

      {/* ── CALENDAR ── */}
      {showCal && (
        <div className="rounded-3xl p-5 ios-slide-up" style={{ background: "#1c1c1e", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="mb-4 flex items-center justify-between">
            <button type="button" onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); }}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white/50 transition hover:bg-white/10">←</button>
            <h2 className="text-lg font-black text-white">{calMonthName}</h2>
            <button type="button" onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); }}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white/50 transition hover:bg-white/10">→</button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {["M","T","W","T","F","S","S"].map((d, i) => <div key={i} className="py-1 text-[10px] font-black text-white/25">{d}</div>)}
            {calDays.map((day, i) => {
              if (!day) return <div key={`e${i}`} />;
              const dk = `${calYear}-${String(calMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
              const hasWorkout = !!workoutDates[dk];
              const isToday = dk === dateKey(new Date());
              const isSelected = selectedDate === dk;
              return (
                <div key={dk} className="relative">
                  <button type="button" onClick={() => setSelectedDate(isSelected ? null : dk)}
                    className="flex h-10 w-full flex-col items-center justify-center rounded-xl text-sm font-bold transition"
                    style={{ background: isSelected ? "#ff6b00" : isToday ? "rgba(255,107,0,0.15)" : "transparent", color: isSelected ? "#000" : isToday ? "#ff6b00" : "#fff" }}>
                    {day}
                    {hasWorkout && <span className="absolute bottom-1 h-1 w-1 rounded-full" style={{ background: isSelected ? "#000" : "#30d158" }} />}
                  </button>
                </div>
              );
            })}
          </div>
          {/* Date action popup */}
          {selectedDate && (
            <div className="mt-4 rounded-2xl p-4 ios-slide-up" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="mb-3 text-xs font-black text-white/40">{new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
              {workoutDates[selectedDate] ? (
                <div className="space-y-2">
                  {workoutDates[selectedDate].map(w => (
                    <button key={w.id} type="button" onClick={() => navigate(`/workouts/${w.id}`)}
                      className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition hover:bg-white/10"
                      style={{ background: "rgba(48,209,88,0.08)", border: "1px solid rgba(48,209,88,0.2)" }}>
                      <div>
                        <p className="text-sm font-black text-white">{w.name}</p>
                        <p className="text-[11px] text-white/40">{w.exercises?.length || 0} exercises</p>
                      </div>
                      <span className="text-xs font-black" style={{ color: "#30d158" }}>View →</span>
                    </button>
                  ))}
                  <button type="button" onClick={() => openLogModal(selectedDate)}
                    className="w-full rounded-xl px-4 py-3 text-sm font-black text-white/50 transition hover:bg-white/10"
                    style={{ background: "rgba(255,255,255,0.04)" }}>+ Log another workout</button>
                </div>
              ) : (
                <button type="button" onClick={() => openLogModal(selectedDate)}
                  className="w-full rounded-xl px-4 py-3 text-sm font-black text-black transition active:scale-95"
                  style={{ background: "linear-gradient(135deg,#ff6b00,#ff9500)" }}>📝 Log Previous Workout</button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── LOG WORKOUT FLOATING MODAL (iOS style) ── */}
      {showLogModal && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center" onClick={() => setShowLogModal(false)}>
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }} />
          <div className="relative z-10 w-full max-w-lg rounded-t-3xl sm:rounded-3xl ios-slide-up"
            style={{ background: "#1c1c1e", border: "1px solid rgba(255,255,255,0.1)", maxHeight: "85vh", overflow: "auto" }}
            onClick={e => e.stopPropagation()}>
            {/* Handle bar */}
            <div className="flex justify-center pt-3 sm:hidden"><div className="h-1 w-10 rounded-full bg-white/20" /></div>
            <div className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/35">Log workout for</p>
                  <p className="text-lg font-black text-white">{logDate && new Date(logDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</p>
                </div>
                <button type="button" onClick={() => setShowLogModal(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white/40 hover:bg-white/10">✕</button>
              </div>
              <input value={logName} onChange={e => setLogName(e.target.value)} placeholder="Workout name (e.g. Push Day)"
                className="input-field mb-4" />
              <p className="mb-2 text-xs font-black text-white/35">EXERCISES</p>
              {logExercises.map((ex, i) => (
                <div key={i} className="mb-3 rounded-2xl p-3" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <div className="flex items-center gap-2">
                    <input value={ex.name} onChange={e => updateLogEx(i, "name", e.target.value)} placeholder="Exercise name"
                      className="input-field flex-1" style={{ padding: "10px 14px", fontSize: "13px" }} />
                    {logExercises.length > 1 && (
                      <button type="button" onClick={() => removeLogEx(i)} className="text-xs text-white/30 hover:text-red-400">✕</button>
                    )}
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[9px] font-bold text-white/25">Sets</label>
                      <input type="number" min={1} value={ex.sets} onChange={e => updateLogEx(i, "sets", +e.target.value)}
                        className="input-field" style={{ padding: "8px 10px", fontSize: "13px" }} />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-white/25">Reps</label>
                      <input type="number" min={1} value={ex.reps} onChange={e => updateLogEx(i, "reps", +e.target.value)}
                        className="input-field" style={{ padding: "8px 10px", fontSize: "13px" }} />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-white/25">Weight (kg)</label>
                      <input type="number" min={0} value={ex.weight} onChange={e => updateLogEx(i, "weight", +e.target.value)}
                        className="input-field" style={{ padding: "8px 10px", fontSize: "13px" }} />
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addLogExercise}
                className="mb-4 w-full rounded-xl py-2.5 text-xs font-black text-white/40 transition hover:bg-white/10"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.1)" }}>+ Add exercise</button>
              <button type="button" onClick={saveLogWorkout} disabled={logSaving || !logName.trim()}
                className="btn-fire w-full justify-center py-4 text-base font-black disabled:opacity-50">
                {logSaving ? "Saving..." : "Save Workout"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <SmartCard title="Current streak" value={`${streak.current}d`} sub={`Longest streak: ${streak.longest} days`} color="#ff6b00" />
        <SmartCard title="Recovery score" value={recoveryScore} sub={recoveryScore > 70 ? "Ready to train hard." : "Control intensity today."} color={recoveryColor} />
        <SmartCard title="This week" value={workoutsThisWeek.length} sub={`${setsThisWeek} sets logged this week`} color="#0a84ff" />
        <SmartCard title="Body target" value={latestWeight ? `${latestWeight}kg` : "--"} sub={targetWeight ? `Goal: ${targetWeight}kg` : "Set goal in AI Coach"} color="#30d158" />
      </div>

      {/* ── MUSCLE FATIGUE HEATMAP ── */}
      <MuscleHeatmap workouts={workouts} />

      <section className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl p-5" style={{ background: "#1c1c1e", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/35">AI weekly plan</p>
              <h2 className="text-xl font-black text-white">This Week</h2>
            </div>
            <Link to="/ai" className="rounded-xl px-3 py-2 text-xs font-black text-black" style={{ background: "#ff9500" }}>Adjust with AI</Link>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {weeklyPlan.map((item) => (
              <div key={item.day} className="rounded-2xl p-3 text-center" style={{ background: item.today ? "rgba(255,107,0,0.15)" : "rgba(255,255,255,0.04)", border: item.done ? "1px solid rgba(48,209,88,0.45)" : "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-[10px] font-black text-white/35">{item.day}</p>
                <p className="mt-2 text-xs font-black text-white">{item.focus}</p>
                {item.done && <p className="mt-1 text-[10px]" style={{ color: "#30d158" }}>Done</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl p-5" style={{ background: "#1c1c1e", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/35">Workout reminder</p>
          <h2 className="mt-1 text-xl font-black text-white">Daily Training Alert</h2>
          <input type="time" value={reminder} onChange={(e) => saveReminder(e.target.value)} className="input-field mt-4" />
          <p className="mt-3 text-xs leading-5 text-white/40">Saved in this browser. Use this as your daily training time until push notifications are added.</p>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-3xl p-5" style={{ background: "#1c1c1e", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/35">Diet target</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <SmartCard title="Calories" value={nutrition.calories} sub="Daily target" color="#ff9500" />
            <SmartCard title="Protein" value={`${nutrition.protein}g`} sub="Daily minimum" color="#30d158" />
            <SmartCard title="Carbs" value={`${nutrition.carbs}g`} sub="Training fuel" color="#0a84ff" />
            <SmartCard title="Fats" value={`${nutrition.fats}g`} sub="Hormones/recovery" color="#bf5af2" />
          </div>
          <button onClick={generateMeals} disabled={mealLoading} className="btn-fire mt-4 w-full justify-center">
            {mealLoading ? "Generating..." : "Generate meal ideas"}
          </button>
          {mealPlan && <p className="mt-4 rounded-2xl p-4 text-sm leading-6 text-white/60" style={{ background: "rgba(255,255,255,0.04)" }}>{mealPlan}</p>}
        </div>

        <div className="rounded-3xl p-5" style={{ background: "#1c1c1e", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/35">Auto-adjust plan</p>
          <h2 className="mt-1 text-xl font-black text-white">How was your last workout?</h2>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {["easy", "normal", "hard", "failed"].map((item) => (
              <button key={item} onClick={() => setEffort(item)} className="rounded-2xl px-3 py-3 text-sm font-black capitalize" style={effort === item ? { background: "#ff6b00", color: "#000" } : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)" }}>
                {item}
              </button>
            ))}
          </div>
          <p className="mt-4 rounded-2xl p-4 text-sm leading-6 text-white/60" style={{ background: "rgba(255,255,255,0.04)" }}>{autoAdjust}</p>
        </div>

        <div className="rounded-3xl p-5" style={{ background: "#1c1c1e", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/35">Share card</p>
          <h2 className="mt-1 text-xl font-black text-white">Latest Workout</h2>
          <pre className="mt-4 whitespace-pre-wrap rounded-2xl p-4 text-sm leading-6 text-white/70" style={{ background: "rgba(255,255,255,0.04)" }}>{shareText}</pre>
          <button type="button" onClick={() => navigator.clipboard?.writeText(shareText)} className="mt-4 w-full rounded-2xl py-3 text-sm font-black text-black" style={{ background: "#30d158" }}>
            Copy share text
          </button>
        </div>
      </section>
    </div>
  );
}
