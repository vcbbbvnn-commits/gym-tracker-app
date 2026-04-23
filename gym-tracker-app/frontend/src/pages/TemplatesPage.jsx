import { useEffect, useState } from "react";
import api from "../api/client";
import { useNavigate } from "react-router-dom";

const DAY_NAMES = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const FULL_DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const FOCUS_CONFIG = {
  CHEST:     { emoji: "🏋️", color: "#f97316", glow: "rgba(249,115,22,0.2)" },
  BACK:      { emoji: "🔙", color: "#3b82f6", glow: "rgba(59,130,246,0.2)" },
  SHOULDERS: { emoji: "💪", color: "#a78bfa", glow: "rgba(167,139,250,0.2)" },
  LEGS:      { emoji: "🦵", color: "#34d399", glow: "rgba(52,211,153,0.2)" },
  BICEPS:    { emoji: "💪", color: "#fbbf24", glow: "rgba(251,191,36,0.2)" },
  TRICEPS:   { emoji: "🔱", color: "#fb7185", glow: "rgba(251,113,133,0.2)" },
  PUSH:      { emoji: "↗️", color: "#f97316", glow: "rgba(249,115,22,0.2)" },
  PULL:      { emoji: "↙️", color: "#3b82f6", glow: "rgba(59,130,246,0.2)" },
  UPPER:     { emoji: "🧥", color: "#a78bfa", glow: "rgba(167,139,250,0.2)" },
  LOWER:     { emoji: "👖", color: "#34d399", glow: "rgba(52,211,153,0.2)" },
  TRAINING:  { emoji: "⚡", color: "#fbbf24", glow: "rgba(251,191,36,0.2)" },
  REST:      { emoji: "😴", color: "#4b5563", glow: "rgba(75,85,99,0.1)"  },
};

function getDayFocus(exercises) {
  if (!exercises || exercises.length === 0) return "REST";
  
  const scores = {
    CHEST: 0, BACK: 0, LEGS: 0, SHOULDERS: 0, 
    BICEPS: 0, TRICEPS: 0
  };

  exercises.forEach(ex => {
    const name = ex.name.toLowerCase();
    // LEGS
    if (name.includes("squat") || name.includes("leg press") || name.includes("lunge")) scores.LEGS += 3;
    else if (name.includes("leg extension") || name.includes("leg curl") || name.includes("calf") || name.includes("romanian deadlift")) scores.LEGS += 1;
    
    // CHEST
    if (name.includes("bench press") || name.includes("chest press") || name.includes("incline press") || name.includes("db press")) scores.CHEST += 3;
    else if (name.includes("fly") || name.includes("pec deck") || name.includes("crossover") || name.includes("dip")) scores.CHEST += 1;
    
    // BACK
    if (name.includes("deadlift") || name.includes("row") || name.includes("pull-up") || name.includes("pulldown") || name.includes("t-bar")) scores.BACK += 3;
    else if (name.includes("face pull") || name.includes("shrug") || (name.includes("lat") && !name.includes("lateral"))) scores.BACK += 1;
    
    // SHOULDERS
    if (name.includes("overhead press") || name.includes("shoulder press") || name.includes("military press")) scores.SHOULDERS += 3;
    else if (name.includes("lateral raise") || name.includes("front raise") || name.includes("rear delt")) scores.SHOULDERS += 1;
    
    // ARMS
    if (name.includes("bicep") || (name.includes("curl") && !name.includes("leg"))) scores.BICEPS += 1;
    if (name.includes("tricep") || name.includes("skull crusher") || (name.includes("pushdown") && !name.includes("leg"))) scores.TRICEPS += 1;
  });

  const topFocus = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
  const maxScore = scores[topFocus];
  if (maxScore === 0) return "TRAINING";

  // Threshold for secondary muscles: at least 50% of the primary score
  const secondaryMuscles = Object.keys(scores).filter(m => scores[m] >= (maxScore * 0.5) && m !== topFocus);
  
  if (secondaryMuscles.length === 0) {
    return topFocus;
  }

  const hasChest = scores.CHEST > 0;
  const hasBack = scores.BACK > 0;
  const hasShoulders = scores.SHOULDERS > 0;

  if (hasChest && hasShoulders && !hasBack) return "PUSH";
  if (hasBack && scores.BICEPS > 0 && !hasChest) return "PULL";
  if (hasChest && hasBack) return "UPPER";

  return topFocus;
}

function DayCard({ dayIndex, exercises, templateId, onStart, starting }) {
  const dayNum = dayIndex + 1;
  const focus = getDayFocus(exercises);
  const cfg = FOCUS_CONFIG[focus];
  const isRest = focus === "REST";

  return (
    <div
      className="relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1"
      style={{
        background: isRest
          ? "rgba(10,10,12,0.6)"
          : `linear-gradient(160deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)`,
        border: `1px solid ${isRest ? "rgba(255,255,255,0.05)" : cfg.color + "30"}`,
        boxShadow: isRest ? "none" : `0 8px 32px rgba(0,0,0,0.4), 0 0 0 0 ${cfg.glow}`,
        minHeight: "320px",
      }}
    >
      {/* Top accent bar */}
      {!isRest && (
        <div
          className="h-1 w-full"
          style={{ background: `linear-gradient(90deg, ${cfg.color}, transparent)` }}
        />
      )}

      {/* Day label */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <span
          className="text-[10px] font-black tracking-[0.25em] uppercase"
          style={{ color: isRest ? "#374151" : cfg.color }}
        >
          {DAY_NAMES[dayIndex]}
        </span>
        <span
          className="text-[10px] font-semibold"
          style={{ color: isRest ? "#374151" : "rgba(255,255,255,0.3)" }}
        >
          Day {dayNum}
        </span>
      </div>

      {/* Focus / emoji */}
      <div className="px-4 pb-3 flex items-center gap-2">
        <span className="text-2xl">{cfg.emoji}</span>
        <span
          className="text-lg font-black tracking-tight"
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            color: isRest ? "#374151" : cfg.color,
          }}
        >
          {focus}
        </span>
      </div>

      {/* Exercise list */}
      <div className="flex-1 px-4 pb-4 space-y-2 overflow-hidden">
        {isRest ? (
          <p className="text-xs text-gray-600 italic">Rest & recovery day</p>
        ) : (
          exercises
            .sort((a, b) => a.order - b.order)
            .map((ex, i) => (
              <div key={ex.id} className="flex items-start gap-2">
                <span
                  className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
                  style={{
                    background: cfg.color + "22",
                    color: cfg.color,
                    border: `1px solid ${cfg.color}40`,
                  }}
                >
                  {i + 1}
                </span>
                <div>
                  <p className="text-[11px] font-semibold text-white leading-tight">{ex.name}</p>
                  <p className="text-[9px] text-gray-500">
                    {ex.recommended_sets}×{ex.recommended_reps}
                  </p>
                </div>
              </div>
            ))
        )}
      </div>

      {/* Start button */}
      {!isRest && (
        <div className="p-3 pt-0">
          <button
            onClick={() => onStart(templateId, dayNum)}
            disabled={starting}
            className="w-full rounded-xl py-2.5 text-xs font-bold uppercase tracking-widest transition-all duration-200 active:scale-95 disabled:opacity-50"
            style={{
              background: starting
                ? "rgba(255,255,255,0.05)"
                : `linear-gradient(135deg, ${cfg.color} 0%, ${cfg.color}bb 100%)`,
              color: starting ? cfg.color : "#000",
              border: `1px solid ${cfg.color}50`,
              boxShadow: starting ? "none" : `0 4px 16px ${cfg.color}40`,
            }}
          >
            {starting ? "Starting…" : `▶  Start Day ${dayNum}`}
          </button>
        </div>
      )}
    </div>
  );
}

function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startingKey, setStartingKey] = useState(null); // "templateId-dayNum"
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const response = await api.get("/templates");
        setTemplates(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to load templates");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const handleStartDay = async (templateId, dayNumber) => {
    const key = `${templateId}-${dayNumber}`;
    setStartingKey(key);
    try {
      const response = await api.post(
        `/templates/use/${templateId}?day_number=${dayNumber}`
      );
      navigate(`/workouts/${response.data.workout_id}`);
    } catch (err) {
      console.error("Failed to start day session", err);
      const detail = err.response?.data?.detail || "Failed to start session. Please try again.";
      alert(detail);
    } finally {
      setStartingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div
            className="h-14 w-14 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: "#f97316", borderTopColor: "transparent" }}
          />
          <p className="text-sm text-gray-500 uppercase tracking-widest">Loading programs…</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pb-20 pt-8 text-white"
      style={{ background: "#080a0e" }}
    >
      <div className="mx-auto max-w-[1600px] px-4">

        {/* Page header */}
        <div className="mb-14 text-center">
          <span className="section-badge mb-4 inline-flex">Training Programs</span>
          <h1
            className="text-5xl font-black uppercase tracking-tight text-white md:text-7xl"
            style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.04em" }}
          >
            Choose Your Split
          </h1>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">
            Pick the training day you want to hit today. Each day is tailored to a specific muscle group — just tap <strong className="text-orange-400">Start Day</strong> to begin.
          </p>
        </div>

        {error && (
          <div className="mb-8 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-center text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-20">
          {templates.map((template) => {
            const maxDay = Math.max(...template.exercises.map(e => e.day_number), 7);
            const days = Array.from({ length: maxDay }, (_, i) => ({
              dayIndex: i,
              exercises: template.exercises.filter(e => e.day_number === i + 1),
            }));

            // Count training days
            const trainingDays = days.filter(d => d.exercises.length > 0).length;

            return (
              <section key={template.id}>
                {/* Template header */}
                <div
                  className="mb-6 rounded-2xl p-6"
                  style={{
                    background: "linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(255,255,255,0.02) 100%)",
                    border: "1px solid rgba(249,115,22,0.15)",
                  }}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span
                          className="rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest"
                          style={{
                            background: "rgba(249,115,22,0.15)",
                            color: "#f97316",
                            border: "1px solid rgba(249,115,22,0.3)",
                          }}
                        >
                          {template.category}
                        </span>
                        <span className="text-[11px] text-gray-500">
                          {trainingDays} training days / week
                        </span>
                      </div>
                      <h2
                        className="text-2xl font-black uppercase tracking-tight text-white md:text-3xl"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {template.name}
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">{template.description}</p>
                    </div>
                  </div>
                </div>

                {/* Day cards grid */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
                  {days.map(({ dayIndex, exercises }) => (
                    <DayCard
                      key={dayIndex}
                      dayIndex={dayIndex}
                      exercises={exercises}
                      templateId={template.id}
                      onStart={handleStartDay}
                      starting={startingKey === `${template.id}-${dayIndex + 1}`}
                    />
                  ))}
                </div>

                {/* Day name labels below grid */}
                <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
                  {days.map(({ dayIndex }) => (
                    <p key={dayIndex} className="text-center text-[10px] text-gray-600">
                      {FULL_DAY_NAMES[dayIndex]}
                    </p>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default TemplatesPage;
