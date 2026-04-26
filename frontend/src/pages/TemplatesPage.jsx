import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

const DAY_NAMES = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const FULL_DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const FOCUS_CONFIG = {
  CHEST: { emoji: "🏋️", color: "#f97316", glow: "rgba(249,115,22,0.2)", muscles: ["Chest"] },
  BACK: { emoji: "↙️", color: "#3b82f6", glow: "rgba(59,130,246,0.2)", muscles: ["Back"] },
  SHOULDERS: { emoji: "💪", color: "#a78bfa", glow: "rgba(167,139,250,0.2)", muscles: ["Shoulders"] },
  LEGS: { emoji: "🦵", color: "#34d399", glow: "rgba(52,211,153,0.2)", muscles: ["Quads", "Hamstrings", "Calves"] },
  BICEPS: { emoji: "💪", color: "#fbbf24", glow: "rgba(251,191,36,0.2)", muscles: ["Biceps"] },
  TRICEPS: { emoji: "🔱", color: "#fb7185", glow: "rgba(251,113,133,0.2)", muscles: ["Triceps"] },
  ARMS: { emoji: "💪", color: "#fb7185", glow: "rgba(251,113,133,0.2)", muscles: ["Biceps", "Triceps"] },
  PUSH: { emoji: "↗️", color: "#f97316", glow: "rgba(249,115,22,0.2)", muscles: ["Chest", "Shoulders", "Triceps"] },
  PULL: { emoji: "↙️", color: "#3b82f6", glow: "rgba(59,130,246,0.2)", muscles: ["Back", "Biceps", "Rear delts"] },
  UPPER: { emoji: "🧥", color: "#a78bfa", glow: "rgba(167,139,250,0.2)", muscles: ["Chest", "Back", "Shoulders", "Arms"] },
  LOWER: { emoji: "🦵", color: "#34d399", glow: "rgba(52,211,153,0.2)", muscles: ["Quads", "Hamstrings", "Glutes", "Calves"] },
  TRAINING: { emoji: "⚡", color: "#fbbf24", glow: "rgba(251,191,36,0.2)", muscles: ["Training"] },
  REST: { emoji: "😴", color: "#4b5563", glow: "rgba(75,85,99,0.1)", muscles: ["Recovery"] },
};

const CATEGORY_META = {
  "Bro Split": {
    level: "Classic",
    goal: "Muscle focus",
    rhythm: "5-day split",
  },
  "Push/Pull/Legs": {
    level: "Elite",
    goal: "Hypertrophy",
    rhythm: "6-day split",
  },
  "Upper/Lower": {
    level: "Balanced",
    goal: "Strength + size",
    rhythm: "4-day split",
  },
};

function getDayFocus(exercises) {
  if (!exercises || exercises.length === 0) return "REST";

  const scores = {
    CHEST: 0,
    BACK: 0,
    LEGS: 0,
    SHOULDERS: 0,
    BICEPS: 0,
    TRICEPS: 0,
  };

  exercises.forEach((ex) => {
    const name = ex.name.toLowerCase();

    if (name.includes("squat") || name.includes("leg press") || name.includes("lunge")) scores.LEGS += 3;
    else if (name.includes("leg extension") || name.includes("leg curl") || name.includes("calf") || name.includes("romanian deadlift")) scores.LEGS += 1;

    if (name.includes("bench press") || name.includes("chest press") || name.includes("incline press") || name.includes("db press")) scores.CHEST += 3;
    else if (name.includes("fly") || name.includes("pec deck") || name.includes("crossover") || name.includes("dip")) scores.CHEST += 1;

    if (name.includes("deadlift") || name.includes("row") || name.includes("pull-up") || name.includes("pulldown") || name.includes("t-bar")) scores.BACK += 3;
    else if (name.includes("face pull") || name.includes("shrug") || (name.includes("lat") && !name.includes("lateral"))) scores.BACK += 1;

    if (name.includes("overhead press") || name.includes("shoulder press") || name.includes("military press")) scores.SHOULDERS += 3;
    else if (name.includes("lateral raise") || name.includes("front raise") || name.includes("rear delt")) scores.SHOULDERS += 1;

    if (name.includes("bicep") || (name.includes("curl") && !name.includes("leg"))) scores.BICEPS += 1;
    if (name.includes("tricep") || name.includes("skull crusher") || (name.includes("pushdown") && !name.includes("leg"))) scores.TRICEPS += 1;
  });

  const topFocus = Object.keys(scores).reduce((a, b) => (scores[a] > scores[b] ? a : b));
  const maxScore = scores[topFocus];
  if (maxScore === 0) return "TRAINING";

  const secondaryMuscles = Object.keys(scores).filter((muscle) => scores[muscle] >= maxScore * 0.5 && muscle !== topFocus);

  if (secondaryMuscles.length === 0) {
    return topFocus;
  }

  const hasChest = scores.CHEST > 0;
  const hasBack = scores.BACK > 0;
  const hasShoulders = scores.SHOULDERS > 0;
  const hasBiceps = scores.BICEPS > 0;
  const hasTriceps = scores.TRICEPS > 0;

  if (hasChest && hasShoulders && !hasBack) return "PUSH";
  if (hasBack && hasBiceps && !hasChest) return "PULL";
  if (hasChest && hasBack) return "UPPER";
  if (hasBiceps && hasTriceps && !hasChest && !hasBack && !hasShoulders && scores.LEGS === 0) return "ARMS";
  if (scores.LEGS > 0 && !hasChest && !hasBack) return "LOWER";

  return topFocus;
}

function getTemplateDays(template) {
  const maxDay = Math.max(...template.exercises.map((exercise) => exercise.day_number), 7);
  return Array.from({ length: maxDay }, (_, index) => ({
    dayIndex: index,
    exercises: template.exercises
      .filter((exercise) => exercise.day_number === index + 1)
      .sort((a, b) => a.order - b.order),
  }));
}

function StatTile({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-black text-white">{value}</p>
    </div>
  );
}

function DayCard({ dayIndex, exercises, templateId, onStart, starting, expanded, onToggle }) {
  const dayNum = dayIndex + 1;
  const focus = getDayFocus(exercises);
  const cfg = FOCUS_CONFIG[focus];
  const isRest = focus === "REST";
  const primaryExercises = exercises.slice(0, 2);

  return (
    <article
      className="relative flex min-h-[248px] flex-col overflow-hidden rounded-2xl border p-4 transition duration-300 hover:-translate-y-1"
      style={{
        background: isRest
          ? "rgba(7,9,12,0.72)"
          : `linear-gradient(160deg, rgba(255,255,255,0.065), rgba(255,255,255,0.02)), linear-gradient(180deg, ${cfg.glow}, transparent 45%)`,
        borderColor: isRest ? "rgba(255,255,255,0.06)" : `${cfg.color}40`,
        boxShadow: isRest ? "none" : `0 18px 45px rgba(0,0,0,0.35), 0 0 24px ${cfg.glow}`,
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ background: isRest ? "rgba(255,255,255,0.06)" : `linear-gradient(90deg, ${cfg.color}, transparent)` }}
      />

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em]" style={{ color: isRest ? "#4b5563" : cfg.color }}>
            {DAY_NAMES[dayIndex]}
          </p>
          <h3 className="mt-3 flex items-center gap-2 text-2xl font-black uppercase tracking-normal text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            <span>{cfg.emoji}</span>
            {focus}
          </h3>
        </div>
        <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-bold text-gray-400">Day {dayNum}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {cfg.muscles.map((muscle) => (
          <span key={muscle} className="rounded-full border px-2 py-1 text-[10px] font-semibold" style={{ borderColor: `${cfg.color}33`, color: isRest ? "#6b7280" : cfg.color }}>
            {muscle}
          </span>
        ))}
      </div>

      <div className="mt-4 flex-1">
        {isRest ? (
          <p className="text-sm italic text-gray-600">Rest & recovery day</p>
        ) : (
          <>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500">{exercises.length} exercises</p>
            <div className="mt-3 space-y-2">
              {primaryExercises.map((exercise) => (
                <div key={exercise.id} className="flex items-center justify-between gap-3 rounded-lg bg-black/20 px-3 py-2">
                  <p className="min-w-0 truncate text-sm font-semibold text-white">{exercise.name}</p>
                  <p className="shrink-0 text-xs text-gray-500">
                    {exercise.recommended_sets}x{exercise.recommended_reps}
                  </p>
                </div>
              ))}
            </div>

            {expanded && (
              <div className="mt-3 space-y-2">
                {exercises.slice(2).map((exercise) => (
                  <div key={exercise.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.025] px-3 py-2">
                    <p className="min-w-0 truncate text-sm font-semibold text-gray-200">{exercise.name}</p>
                    <p className="shrink-0 text-xs text-gray-500">
                      {exercise.recommended_sets}x{exercise.recommended_reps}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {!isRest && (
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onStart(templateId, dayNum)}
            disabled={starting}
            className="min-h-11 flex-1 rounded-xl px-3 text-xs font-black uppercase tracking-[0.14em] text-black transition active:scale-95 disabled:opacity-60"
            style={{ background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}bf)` }}
          >
            {starting ? "Starting..." : "▶ Start"}
          </button>
          {exercises.length > 2 && (
            <button
              type="button"
              onClick={onToggle}
              title={expanded ? "Hide exercises" : "Show exercises"}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-lg font-black text-white transition hover:border-white/20 hover:bg-white/[0.08]"
              aria-label={expanded ? "Hide exercises" : "Show exercises"}
            >
              {expanded ? "⌃" : "⌄"}
            </button>
          )}
        </div>
      )}
    </article>
  );
}

function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [activeTemplateId, setActiveTemplateId] = useState(null);
  const [expandedDays, setExpandedDays] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startingKey, setStartingKey] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const response = await api.get("/templates");
        setTemplates(response.data);
        setActiveTemplateId(response.data[0]?.id ?? null);
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

  const activeTemplate = useMemo(
    () => templates.find((template) => template.id === activeTemplateId) ?? templates[0],
    [activeTemplateId, templates],
  );

  const days = useMemo(() => (activeTemplate ? getTemplateDays(activeTemplate) : []), [activeTemplate]);
  const trainingDays = days.filter((day) => day.exercises.length > 0).length;
  const totalExercises = activeTemplate?.exercises.length ?? 0;
  const meta = CATEGORY_META[activeTemplate?.category] ?? {
    level: "Focused",
    goal: "Training",
    rhythm: `${trainingDays}-day split`,
  };

  const handleStartDay = async (templateId, dayNumber) => {
    const key = `${templateId}-${dayNumber}`;
    setStartingKey(key);
    try {
      const response = await api.post(`/templates/use/${templateId}?day_number=${dayNumber}`);
      navigate(`/workouts/${response.data.workout_id}`);
    } catch (err) {
      console.error("Failed to start day session", err);
      const detail = err.response?.data?.detail || "Failed to start session. Please try again.";
      alert(detail);
    } finally {
      setStartingKey(null);
    }
  };

  const handleSelectTemplate = (templateId) => {
    setActiveTemplateId(templateId);
    setExpandedDays({});
  };

  const toggleDay = (templateId, dayNumber) => {
    const key = `${templateId}-${dayNumber}`;
    setExpandedDays((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-14 w-14 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          <p className="text-sm uppercase tracking-widest text-gray-500">Loading programs...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#080a0e] pb-20 pt-8 text-white">
      <div className="mx-auto max-w-[1500px] px-4">
        <section className="mb-8">
          <span className="section-badge mb-4 inline-flex">Training Programs</span>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-5xl font-black uppercase tracking-normal text-white md:text-7xl" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                Choose Your Split
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-500 md:text-base">
                Train by muscle group, movement pattern, or weekly recovery rhythm.
              </p>
            </div>

            <div className="flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] p-1.5">
              {templates.map((template) => {
                const isActive = template.id === activeTemplate?.id;
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleSelectTemplate(template.id)}
                    className={`min-h-11 whitespace-nowrap rounded-xl px-4 text-xs font-black uppercase tracking-[0.16em] transition ${
                      isActive ? "bg-orange-500 text-black shadow-lg shadow-orange-500/20" : "text-gray-400 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    {template.category}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-center text-red-400">
            {error}
          </div>
        )}

        {activeTemplate && (
          <>
            <section className="mb-6 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
              <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-white/[0.025] p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-orange-400/25 bg-orange-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">
                    {meta.level}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
                    {meta.goal}
                  </span>
                </div>
                <h2 className="mt-4 text-3xl font-black uppercase tracking-normal text-white md:text-5xl" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  {activeTemplate.name}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-400">{activeTemplate.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <StatTile label="Days" value={trainingDays} />
                <StatTile label="Exercises" value={totalExercises} />
                <StatTile label="Rhythm" value={meta.rhythm} />
              </div>
            </section>

            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
              {days.map(({ dayIndex, exercises }) => (
                <DayCard
                  key={dayIndex}
                  dayIndex={dayIndex}
                  exercises={exercises}
                  templateId={activeTemplate.id}
                  onStart={handleStartDay}
                  starting={startingKey === `${activeTemplate.id}-${dayIndex + 1}`}
                  expanded={Boolean(expandedDays[`${activeTemplate.id}-${dayIndex + 1}`])}
                  onToggle={() => toggleDay(activeTemplate.id, dayIndex + 1)}
                />
              ))}
            </section>

            <section className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
              {days.map(({ dayIndex }) => (
                <p key={dayIndex} className="text-center text-[10px] font-bold uppercase tracking-[0.16em] text-gray-700">
                  {FULL_DAY_NAMES[dayIndex]}
                </p>
              ))}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

export default TemplatesPage;
