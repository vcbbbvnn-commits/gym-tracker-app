import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const SPLIT_TYPES = [
  { name: "Push",       icon: "↗️", color: "#ff6b00", desc: "Chest · Shoulders · Triceps" },
  { name: "Pull",       icon: "↙️", color: "#0a84ff", desc: "Back · Biceps · Rear Delts" },
  { name: "Legs",       icon: "🦵", color: "#30d158", desc: "Quads · Hamstrings · Calves" },
  { name: "Upper",      icon: "🧥", color: "#bf5af2", desc: "Upper Body Compound" },
  { name: "Lower",      icon: "⬇️", color: "#ff9500", desc: "Lower Body Compound" },
  { name: "Full Body",  icon: "💥", color: "#ffd60a", desc: "Total Body Strength" },
  { name: "Chest",      icon: "🏋️", color: "#ff6b00", desc: "Chest Focus" },
  { name: "Back",       icon: "💪", color: "#0a84ff", desc: "Back Focus" },
  { name: "Shoulders",  icon: "🎯", color: "#bf5af2", desc: "Shoulders Focus" },
  { name: "Arms",       icon: "💪", color: "#ff375f", desc: "Biceps & Triceps" },
];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const EMPTY_CUSTOM_EXERCISE = { name: "", sets: 3, reps: "8-12", weight: "" };

function getSuggestedWorkoutKey(user) {
  return `gym_ai_suggested_workout_${user?.id || user?.email || "guest"}`;
}

function formatDateInput(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toLocalDateKey(value) {
  if (!value) return "";
  return formatDateInput(new Date(value));
}

function formatFriendlyDate(dateStr) {
  const date = new Date(`${dateStr}T12:00:00`);
  return `${DAY_LABELS[date.getDay()]}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`;
}

/* ── Calendar Component ─────────────────────────────────────────── */
function WorkoutCalendar({ workouts, selectedDate, onSelectDate, onLogDate }) {
  const [viewDate, setViewDate] = useState(new Date());

  // Build a map of date-string → workouts
  const workoutsByDate = useMemo(() => {
    const map = {};
    workouts.forEach(w => {
      // Use created_at if available, else use today
      const key = toLocalDateKey(w.created_at);
      if (!key) return;
      if (!map[key]) map[key] = [];
      map[key].push(w);
    });
    return map;
  }, [workouts]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = formatDateInput();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="rounded-3xl overflow-hidden" style={{ background: "#1c1c1e", border: "1px solid rgba(255,255,255,0.06)" }}>
      {/* Month nav */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <button onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition text-lg">‹</button>
        <p className="text-base font-black text-white">{MONTH_NAMES[month]} {year}</p>
        <button onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition text-lg">›</button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-white/5">
        {DAY_LABELS.map(d => (
          <div key={d} className="py-2 text-center text-[10px] font-black uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} className="h-12" />;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayWorkouts = workoutsByDate[dateStr] || [];
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const hasWorkout = dayWorkouts.length > 0;

          return (
            <button key={dateStr} type="button" onClick={() => onSelectDate(dateStr)}
              className="relative h-12 flex flex-col items-center justify-center gap-0.5 transition"
              style={{ borderTop: idx >= 7 ? "0.5px solid rgba(255,255,255,0.04)" : "none" }}>
              <span className={`text-xs font-bold flex h-7 w-7 items-center justify-center rounded-full transition ${
                hasWorkout ? "text-black font-black" : isToday ? "text-white" : "text-white/50"
              }`}
                style={hasWorkout
                  ? { background: "linear-gradient(135deg, #30d158, #0a84ff)", boxShadow: "0 2px 8px rgba(48,209,88,0.4)" }
                  : isSelected
                  ? { background: "rgba(255,149,0,0.18)", border: "1.5px solid #ff9500", color: "#ff9500" }
                  : isToday
                  ? { background: "rgba(255,107,0,0.25)", border: "1.5px solid #ff6b00", color: "#ff6b00" }
                  : {}}>
                {day}
              </span>
              {hasWorkout && (
                <div className="flex gap-0.5">
                  {dayWorkouts.slice(0, 3).map((w, i) => (
                    <div key={i} className="h-1 w-1 rounded-full" style={{ background: "#30d158" }} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <div className="border-t border-white/5 px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Selected day</p>
              <p className="text-sm font-black text-white">{formatFriendlyDate(selectedDate)}</p>
            </div>
            <button
              type="button"
              onClick={() => onLogDate(selectedDate)}
              className="rounded-2xl px-4 py-2.5 text-xs font-black uppercase tracking-wider text-black transition active:scale-95"
              style={{ background: "linear-gradient(135deg,#ff6b00,#ff9500)" }}
            >
              + Log workout here
            </button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 px-5 py-3 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-4 rounded-full" style={{ background: "linear-gradient(135deg,#30d158,#0a84ff)" }} />
          <span className="text-[10px] text-white/40 font-medium">Workout done</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-4 rounded-full" style={{ background: "rgba(255,107,0,0.25)", border: "1.5px solid #ff6b00" }} />
          <span className="text-[10px] text-white/40 font-medium">Today</span>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ────────────────────────────────────────────────────── */
function SessionsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [form, setForm] = useState({ name: "Push", description: "" });
  const [customOpen, setCustomOpen] = useState(false);
  const [customName, setCustomName] = useState("Custom Workout");
  const [customNotes, setCustomNotes] = useState("");
  const [customDate, setCustomDate] = useState(formatDateInput());
  const [customExercises, setCustomExercises] = useState([{ ...EMPTY_CUSTOM_EXERCISE }]);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [customSubmitting, setCustomSubmitting] = useState(false);
  const [aiStarting, setAiStarting] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [activeTab, setActiveTab] = useState("list"); // "list" | "calendar"
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(formatDateInput());

  const loadWorkouts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/workouts");
      setWorkouts(data);
    } catch (e) {
      setError(e.response?.data?.detail || "Unable to load workouts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadWorkouts(); }, []);

  useEffect(() => {
    const saved = localStorage.getItem(getSuggestedWorkoutKey(user));
    if (saved) {
      try {
        setAiSuggestion(JSON.parse(saved));
      } catch {
        localStorage.removeItem(getSuggestedWorkoutKey(user));
      }
    } else {
      setAiSuggestion(null);
    }
  }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.post("/workouts", form);
      setForm({ name: "Push", description: "" });
      await loadWorkouts();
    } catch (e) {
      setError(e.response?.data?.detail || "Unable to create workout.");
    } finally {
      setSubmitting(false);
    }
  };

  const createWorkoutFromPlan = async ({ name, description, exercises, performedAt }) => {
    const validExercises = exercises
      .map((exercise) => ({
        ...exercise,
        name: exercise.name.trim(),
        sets: Math.max(1, Number(exercise.sets) || 1),
        reps: String(exercise.reps || "10").trim(),
        weight: Number(exercise.weight) || 0,
      }))
      .filter((exercise) => exercise.name);

    if (!name.trim() || validExercises.length === 0) {
      throw new Error("Add a workout name and at least one exercise.");
    }

    const logTime = performedAt || new Date().toISOString();
    const { data: workout } = await api.post("/workouts", {
      name: name.trim(),
      description: description || "Custom workout",
      performed_at: logTime,
    });

    let currentWorkout = workout;
    for (const exercise of validExercises) {
      const { data: updatedWorkout } = await api.post(`/workouts/${workout.id}/exercises`, {
        name: exercise.name,
        notes: `${exercise.sets} sets x ${exercise.reps} reps`,
      });
      currentWorkout = updatedWorkout;
      const createdExercise = [...currentWorkout.exercises]
        .reverse()
        .find((item) => item.name === exercise.name);
      const repsValue = Number(String(exercise.reps).match(/\d+/)?.[0]) || 10;
      if (createdExercise) {
        for (let i = 0; i < exercise.sets; i += 1) {
          const { data: workoutWithSet } = await api.post(`/workouts/exercises/${createdExercise.id}/sets`, {
            reps: repsValue,
            weight: exercise.weight,
            set_type: "normal",
            performed_at: logTime,
          });
          currentWorkout = workoutWithSet;
        }
      }
    }

    await loadWorkouts();
    return currentWorkout;
  };

  const handleCustomCreate = async (event) => {
    event.preventDefault();
    setCustomSubmitting(true);
    setError("");
    try {
      const workout = await createWorkoutFromPlan({
        name: customName,
        description: customNotes || `Back-logged workout for ${formatFriendlyDate(customDate)}`,
        exercises: customExercises,
        performedAt: `${customDate}T12:00:00`,
      });
      setCustomOpen(false);
      setCustomName("Custom Workout");
      setCustomNotes("");
      setCustomDate(formatDateInput());
      setCustomExercises([{ ...EMPTY_CUSTOM_EXERCISE }]);
      navigate(`/workouts/${workout.id}`);
    } catch (e) {
      setError(e.message || e.response?.data?.detail || "Unable to create custom workout.");
    } finally {
      setCustomSubmitting(false);
    }
  };

  const handleStartAiSuggestion = async () => {
    if (!aiSuggestion) return;
    setAiStarting(true);
    setError("");
    try {
      const workout = await createWorkoutFromPlan({
        name: aiSuggestion.name,
        description: aiSuggestion.description,
        exercises: aiSuggestion.exercises || [],
        performedAt: new Date().toISOString(),
      });
      localStorage.removeItem(getSuggestedWorkoutKey(user));
      setAiSuggestion(null);
      navigate(`/workouts/${workout.id}`);
    } catch (e) {
      setError(e.message || e.response?.data?.detail || "Unable to start AI plan.");
    } finally {
      setAiStarting(false);
    }
  };

  const updateCustomExercise = (index, key, value) => {
    setCustomExercises((current) =>
      current.map((exercise, i) => (i === index ? { ...exercise, [key]: value } : exercise))
    );
  };

  const openCustomForDate = (dateStr) => {
    setSelectedCalendarDate(dateStr);
    setCustomDate(dateStr);
    setCustomOpen(true);
    setActiveTab("calendar");
    setCustomName(`${formatFriendlyDate(dateStr)} Workout`);
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/workouts/${id}`);
      await loadWorkouts();
    } catch (e) {
      setError(e.response?.data?.detail || "Unable to delete workout.");
    } finally {
      setDeletingId(null);
    }
  };

  const selected = SPLIT_TYPES.find(s => s.name === form.name) || SPLIT_TYPES[0];

  return (
    <div className="space-y-8 pb-8">
      {/* ── Page Header ── */}
      <div className="ios-slide-up">
        <span className="section-badge mb-3 inline-flex">Training</span>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-5xl font-black uppercase text-white" style={{ fontFamily: "'Bebas Neue',sans-serif" }}>
              My Workouts
            </h1>
            <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              {workouts.length} session{workouts.length !== 1 ? "s" : ""} logged
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCustomOpen((open) => !open)}
            className="rounded-2xl px-5 py-3 text-sm font-black uppercase tracking-wider transition active:scale-95"
            style={{ background: "linear-gradient(135deg,#ff6b00,#ff9500)", color: "#000", boxShadow: "0 4px 16px rgba(255,107,0,0.35)" }}
          >
            + Custom Workout
          </button>
        </div>
      </div>

      {aiSuggestion && (
        <div className="ios-slide-up rounded-3xl p-5" style={{ background: "rgba(255,107,0,0.08)", border: "1px solid rgba(255,107,0,0.25)" }}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: "#ff9500" }}>AI suggested workout</p>
              <h2 className="mt-1 text-xl font-black text-white">{aiSuggestion.name}</h2>
              <p className="mt-1 text-sm text-white/45">{aiSuggestion.description}</p>
              <p className="mt-2 text-xs text-white/35">
                {(aiSuggestion.exercises || []).map((exercise) => `${exercise.name} ${exercise.sets}x${exercise.reps}`).join(" · ")}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleStartAiSuggestion}
                disabled={aiStarting}
                className="rounded-2xl px-5 py-3 text-sm font-black text-black transition active:scale-95 disabled:opacity-60"
                style={{ background: "#ff9500" }}
              >
                {aiStarting ? "Starting..." : "Start this plan"}
              </button>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem(getSuggestedWorkoutKey(user));
                  setAiSuggestion(null);
                }}
                className="rounded-2xl px-4 py-3 text-sm font-bold text-white/50 transition hover:bg-white/10"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        {/* ── LEFT: Create Workout ── */}
        <div className="space-y-4">
          {customOpen && (
            <div className="ios-slide-up rounded-3xl p-5" style={{ background: "#1c1c1e", border: "1px solid rgba(255,255,255,0.08)" }}>
              <h2 className="mb-4 text-lg font-black text-white">Custom Workout Plan</h2>
              <form onSubmit={handleCustomCreate} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-white/35">Workout name</label>
                  <input
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="input-field"
                    placeholder="Friday Chest + Triceps"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-white/35">Workout date</label>
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => {
                      setCustomDate(e.target.value);
                      setSelectedCalendarDate(e.target.value);
                    }}
                    className="input-field"
                    required
                  />
                  <p className="mt-1.5 text-xs text-white/35">
                    This session will be shown on {formatFriendlyDate(customDate)} in the calendar.
                  </p>
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-white/35">Notes</label>
                  <textarea
                    rows={2}
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    className="w-full resize-none rounded-2xl px-3 py-2.5 text-sm text-white outline-none placeholder-white/20"
                    style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}
                    placeholder="What are you training today?"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] uppercase tracking-widest text-white/35">Exercises</p>
                    <button
                      type="button"
                      onClick={() => setCustomExercises((current) => [...current, { ...EMPTY_CUSTOM_EXERCISE }])}
                      className="rounded-xl px-3 py-1.5 text-xs font-black"
                      style={{ background: "rgba(255,107,0,0.14)", color: "#ff9500" }}
                    >
                      + Add
                    </button>
                  </div>
                  {customExercises.map((exercise, index) => (
                    <div key={index} className="rounded-2xl p-3" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <input
                        value={exercise.name}
                        onChange={(e) => updateCustomExercise(index, "name", e.target.value)}
                        className="mb-2 w-full rounded-xl px-3 py-2 text-sm text-white outline-none"
                        style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.08)" }}
                        placeholder="Exercise name"
                        required={index === 0}
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="number"
                          min="1"
                          value={exercise.sets}
                          onChange={(e) => updateCustomExercise(index, "sets", e.target.value)}
                          className="rounded-xl px-3 py-2 text-sm text-white outline-none"
                          style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.08)" }}
                          placeholder="Sets"
                        />
                        <input
                          value={exercise.reps}
                          onChange={(e) => updateCustomExercise(index, "reps", e.target.value)}
                          className="rounded-xl px-3 py-2 text-sm text-white outline-none"
                          style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.08)" }}
                          placeholder="Reps"
                        />
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={exercise.weight}
                          onChange={(e) => updateCustomExercise(index, "weight", e.target.value)}
                          className="rounded-xl px-3 py-2 text-sm text-white outline-none"
                          style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.08)" }}
                          placeholder="Kg"
                        />
                      </div>
                      {customExercises.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setCustomExercises((current) => current.filter((_, i) => i !== index))}
                          className="mt-2 text-xs font-bold text-red-400/70"
                        >
                          Remove exercise
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={customSubmitting}
                  className="w-full rounded-2xl py-3.5 text-sm font-black uppercase tracking-widest transition active:scale-95 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#30d158,#0a84ff)", color: "#000" }}
                >
                  {customSubmitting ? "Logging..." : "Log custom workout"}
                </button>
              </form>
            </div>
          )}

          <div className="ios-slide-up rounded-3xl overflow-hidden"
            style={{ background: "#1c1c1e", border: "1px solid rgba(255,255,255,0.06)" }}>
            {/* Card accent top */}
            <div className="h-1" style={{ background: `linear-gradient(90deg, ${selected.color}, transparent)` }} />

            <div className="p-5">
              <h2 className="text-lg font-black text-white mb-4">Create Workout</h2>

              <form onSubmit={handleCreate} className="space-y-4">
                {/* Split type grid */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>Choose Split</p>
                  <div className="grid grid-cols-2 gap-2">
                    {SPLIT_TYPES.map(s => (
                      <button key={s.name} type="button" onClick={() => setForm(f => ({ ...f, name: s.name }))}
                        className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-left transition-all"
                        style={form.name === s.name
                          ? { background: `${s.color}18`, border: `1.5px solid ${s.color}55`, boxShadow: `0 0 14px ${s.color}20` }
                          : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <span className="text-lg">{s.icon}</span>
                        <div>
                          <p className="text-xs font-black text-white leading-none">{s.name}</p>
                          <p className="text-[9px] mt-0.5 leading-none" style={{ color: "rgba(255,255,255,0.35)" }}>{s.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className="flex items-center gap-3 rounded-2xl p-3"
                  style={{ background: `${selected.color}10`, border: `1px solid ${selected.color}30` }}>
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-2xl"
                    style={{ background: `${selected.color}18` }}>{selected.icon}</div>
                  <div>
                    <p className="font-black text-white">{selected.name} Day</p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{selected.desc}</p>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest block mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                    Notes (optional)
                  </label>
                  <textarea rows={2} placeholder="e.g. 4 sets × 8-12 reps each exercise"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full resize-none rounded-2xl px-3 py-2.5 text-sm text-white outline-none transition placeholder-white/20"
                    style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}
                    onFocus={e => e.target.style.borderColor = `${selected.color}60`}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
                  />
                </div>

                {error && (
                  <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(255,69,58,0.1)", color: "#ff453a" }}>{error}</div>
                )}

                <button type="submit" disabled={submitting}
                  className="w-full rounded-2xl py-3.5 text-sm font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-60"
                  style={{ background: `linear-gradient(135deg, ${selected.color}, ${selected.color}bb)`, color: "#000", boxShadow: `0 4px 16px ${selected.color}40` }}>
                  {submitting ? "Creating…" : `+ Start ${selected.name} Session`}
                </button>
              </form>
            </div>
          </div>

          {/* Templates link */}
          <Link to="/templates"
            className="ios-slide-up flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition hover:opacity-80"
            style={{ background: "rgba(255,107,0,0.08)", border: "1px solid rgba(255,107,0,0.2)", color: "#ff6b00" }}>
            <span className="font-bold">Browse Programs (Bro Split, PPL…)</span>
            <span>→</span>
          </Link>
        </div>

        {/* ── RIGHT: History + Calendar ── */}
        <div className="space-y-4">
          {/* Tab switcher */}
          <div className="flex gap-2">
            {[["list", "📋 My Sessions"], ["calendar", "📅 Calendar"]].map(([tab, label]) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="rounded-2xl px-4 py-2 text-sm font-black transition-all"
                style={activeTab === tab
                  ? { background: "#ff6b00", color: "#000" }
                  : { background: "#1c1c1e", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}>
                {label}
              </button>
            ))}
          </div>

          {/* Calendar Tab */}
          {activeTab === "calendar" && (
            <div className="ios-slide-up">
              <WorkoutCalendar
                workouts={workouts}
                selectedDate={selectedCalendarDate}
                onSelectDate={setSelectedCalendarDate}
                onLogDate={openCustomForDate}
              />
              {/* Recent workouts below calendar */}
              {workouts.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-[10px] uppercase tracking-widest px-1" style={{ color: "rgba(255,255,255,0.3)" }}>Recent Activity</p>
                  {workouts.slice(0, 5).map(w => {
                    const d = w.created_at ? new Date(w.created_at) : null;
                    const dayName = d ? DAY_LABELS[d.getDay()] : "";
                    const dateStr = d ? `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}` : "";
                    const sets = w.exercises?.reduce((t, e) => t + e.sets.length, 0) || 0;
                    return (
                      <Link key={w.id} to={`/workouts/${w.id}`}
                        className="flex items-center justify-between rounded-2xl px-4 py-3 transition hover:opacity-80 no-underline"
                        style={{ background: "#1c1c1e", border: "1px solid rgba(255,255,255,0.06)", textDecoration: "none" }}>
                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <p className="text-xs font-black text-white">{dayName}</p>
                            <p className="text-[10px] text-white/40">{dateStr}</p>
                          </div>
                          <div className="h-8 w-px bg-white/10" />
                          <div>
                            <p className="text-sm font-bold text-white">{w.name}</p>
                            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>{w.exercises?.length || 0} exercises · {sets} sets</p>
                          </div>
                        </div>
                        <span className="text-white/30 text-sm">→</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* List Tab */}
          {activeTab === "list" && (
            <div className="ios-slide-up space-y-3">
              {loading && [1,2,3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}

              {!loading && workouts.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-3xl py-20 text-center"
                  style={{ background: "#1c1c1e", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="text-6xl mb-4">🏋️‍♂️</div>
                  <p className="text-xl font-black text-white">No sessions yet</p>
                  <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.4)" }}>Create your first workout on the left</p>
                </div>
              )}

              {!loading && workouts.map((w) => {
                const sets = w.exercises?.reduce((t, e) => t + e.sets.length, 0) || 0;
                const volume = w.exercises?.reduce((vol, e) =>
                  vol + e.sets.reduce((sv, s) => sv + s.reps * s.weight, 0), 0) || 0;
                const d = w.created_at ? new Date(w.created_at) : null;
                const dateStr = d
                  ? `${DAY_LABELS[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`
                  : "";
                // color by name
                const split = SPLIT_TYPES.find(s => w.name.toLowerCase().includes(s.name.toLowerCase()));
                const color = split?.color || "#ff6b00";

                return (
                  <div key={w.id} className="rounded-2xl overflow-hidden"
                    style={{ background: "#1c1c1e", border: "1px solid rgba(255,255,255,0.06)" }}>
                    {/* Color strip */}
                    <div className="h-0.5" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
                    <div className="px-4 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-black text-white text-base leading-tight truncate">{w.name}</p>
                            {sets > 0 && (
                              <span className="flex-shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black"
                                style={{ background: "rgba(48,209,88,0.12)", color: "#30d158", border: "1px solid rgba(48,209,88,0.25)" }}>
                                ✓ {sets} sets
                              </span>
                            )}
                          </div>
                          {dateStr && <p className="text-[11px] text-white/35 mb-2">{dateStr}</p>}
                          {w.description && <p className="text-xs text-white/40 truncate mb-2">{w.description}</p>}
                          {/* Mini stats */}
                          <div className="flex items-center gap-3">
                            <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                              💪 {w.exercises?.length || 0} exercises
                            </span>
                            {volume > 0 && (
                              <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                                ⚖️ {Math.round(volume).toLocaleString()} kg vol
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Link to={`/workouts/${w.id}`}
                            className="rounded-xl px-3.5 py-2 text-xs font-black text-black transition hover:opacity-90"
                            style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)`, boxShadow: `0 4px 12px ${color}30` }}>
                            Open
                          </Link>
                          <button onClick={() => handleDelete(w.id)} disabled={deletingId === w.id}
                            className="rounded-xl px-3 py-2 text-xs font-bold transition disabled:opacity-50"
                            style={{ background: "rgba(255,69,58,0.08)", border: "1px solid rgba(255,69,58,0.2)", color: "#ff453a" }}>
                            {deletingId === w.id ? "…" : "🗑️"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SessionsPage;
