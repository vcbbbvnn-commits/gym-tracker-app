import { useEffect, useState, useMemo } from "react";
import api from "../api/client";

// ── Strength Standards (kg) per exercise keyword
// [Beginner, Novice, Intermediate, Advanced, Elite]
const STANDARDS = [
  { keywords: ["bench press", "chest press", "incline", "decline press", "dumbbell press"],
    muscle: "chest", label: "Chest", color: "#0a84ff", levels: [30, 50, 72, 100, 135] },
  { keywords: ["squat", "front squat", "hack squat", "goblet"],
    muscle: "quads", label: "Quads", color: "#ff6b00", levels: [50, 82, 112, 145, 185] },
  { keywords: ["deadlift"],
    muscle: "hamstrings", label: "Posterior Chain", color: "#30d158", levels: [60, 100, 135, 170, 215] },
  { keywords: ["overhead press", "shoulder press", "military press", "ohp", "arnold"],
    muscle: "shoulders", label: "Shoulders", color: "#bf5af2", levels: [25, 40, 57, 75, 102] },
  { keywords: ["row", "pulldown", "lat pull", "cable pull", "seated row", "bent over"],
    muscle: "back", label: "Back", color: "#34c759", levels: [35, 60, 85, 110, 148] },
  { keywords: ["curl", "bicep", "hammer curl", "preacher", "concentration"],
    muscle: "biceps", label: "Biceps", color: "#ffd60a", levels: [15, 25, 37, 52, 70] },
  { keywords: ["tricep", "pushdown", "skull", "extension", "dip", "close grip"],
    muscle: "triceps", label: "Triceps", color: "#ff375f", levels: [15, 27, 40, 55, 75] },
  { keywords: ["leg press", "lunge", "leg extension", "leg curl", "step up"],
    muscle: "quads", label: "Legs (Machine)", color: "#ff9500", levels: [70, 115, 158, 205, 265] },
];

const LEVEL_LABELS = ["Beginner", "Novice", "Intermediate", "Advanced", "Elite"];
const LEVEL_COLORS = ["#8e8e93", "#30d158", "#0a84ff", "#bf5af2", "#ff6b00"];

function scoreFromWeight(weight, levels) {
  if (!weight || weight <= 0) return 0;
  if (weight >= levels[4]) return 100;
  for (let i = 0; i < 4; i++) {
    if (weight <= levels[i + 1]) {
      const pct = (weight - levels[i]) / (levels[i + 1] - levels[i]);
      return Math.round((i / 4) * 100 + pct * 25);
    }
  }
  return 0;
}

function levelFromScore(s) {
  if (s >= 80) return 4;
  if (s >= 60) return 3;
  if (s >= 40) return 2;
  if (s >= 20) return 1;
  return 0;
}

// ── SVG Body Map
function BodyMap({ scores }) {
  const c = (muscle) => {
    const s = scores[muscle] || 0;
    if (s === 0) return "rgba(255,255,255,0.08)";
    if (s >= 80) return "#ff6b00";
    if (s >= 60) return "#bf5af2";
    if (s >= 40) return "#0a84ff";
    if (s >= 20) return "#30d158";
    return "#8e8e93";
  };

  return (
    <div className="flex gap-6 justify-center">
      {/* Front */}
      <div className="text-center">
        <p className="text-[9px] uppercase tracking-widest mb-2 text-white/30">Front</p>
        <svg viewBox="0 0 80 160" className="w-20 h-40">
          <ellipse cx="40" cy="11" rx="10" ry="10" fill="rgba(255,255,255,0.12)" />
          <rect x="35" y="20" width="10" height="7" rx="2" fill="rgba(255,255,255,0.1)" />
          <ellipse cx="17" cy="34" rx="9" ry="7" fill={c("shoulders")} opacity="0.9" />
          <ellipse cx="63" cy="34" rx="9" ry="7" fill={c("shoulders")} opacity="0.9" />
          <rect x="22" y="28" width="36" height="26" rx="5" fill={c("chest")} opacity="0.9" />
          <rect x="8"  cy="40" width="11" height="22" rx="5" y="40" fill={c("biceps")} opacity="0.9" />
          <rect x="61" y="40" width="11" height="22" rx="5" fill={c("biceps")} opacity="0.9" />
          <rect x="9"  y="63" width="9"  height="20" rx="4" fill="rgba(255,255,255,0.1)" />
          <rect x="62" y="63" width="9"  height="20" rx="4" fill="rgba(255,255,255,0.1)" />
          <rect x="26" y="54" width="28" height="26" rx="4" fill="rgba(255,255,255,0.07)" />
          <rect x="22" y="82" width="16" height="38" rx="6" fill={c("quads")} opacity="0.9" />
          <rect x="42" y="82" width="16" height="38" rx="6" fill={c("quads")} opacity="0.9" />
          <rect x="23" y="122" width="13" height="28" rx="5" fill="rgba(255,255,255,0.08)" />
          <rect x="44" y="122" width="13" height="28" rx="5" fill="rgba(255,255,255,0.08)" />
        </svg>
      </div>
      {/* Back */}
      <div className="text-center">
        <p className="text-[9px] uppercase tracking-widest mb-2 text-white/30">Back</p>
        <svg viewBox="0 0 80 160" className="w-20 h-40">
          <ellipse cx="40" cy="11" rx="10" ry="10" fill="rgba(255,255,255,0.12)" />
          <rect x="35" y="20" width="10" height="7" rx="2" fill="rgba(255,255,255,0.1)" />
          <ellipse cx="17" cy="34" rx="9" ry="7" fill={c("shoulders")} opacity="0.9" />
          <ellipse cx="63" cy="34" rx="9" ry="7" fill={c("shoulders")} opacity="0.9" />
          <rect x="22" y="28" width="36" height="32" rx="5" fill={c("back")} opacity="0.9" />
          <rect x="8"  y="40" width="11" height="22" rx="5" fill={c("triceps")} opacity="0.9" />
          <rect x="61" y="40" width="11" height="22" rx="5" fill={c("triceps")} opacity="0.9" />
          <rect x="26" y="60" width="28" height="22" rx="4" fill={c("back")} opacity="0.7" />
          <rect x="22" y="82" width="36" height="18" rx="6" fill="rgba(255,255,255,0.08)" />
          <rect x="22" y="98" width="16" height="30" rx="6" fill={c("hamstrings")} opacity="0.85" />
          <rect x="42" y="98" width="16" height="30" rx="6" fill={c("hamstrings")} opacity="0.85" />
          <rect x="23" y="130" width="13" height="22" rx="5" fill="rgba(255,255,255,0.1)" />
          <rect x="44" y="130" width="13" height="22" rx="5" fill="rgba(255,255,255,0.1)" />
        </svg>
      </div>
    </div>
  );
}

export default function StrengthScorePage() {
  const [exerciseData, setExerciseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("muscles");

  useEffect(() => {
    api.get("/progress/exercises")
      .then(r => setExerciseData(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const standardScores = useMemo(() => {
    return STANDARDS.map(std => {
      let bestWeight = 0, bestName = "";
      exerciseData.forEach(ex => {
        const name = ex.exercise_name.toLowerCase();
        if (std.keywords.some(k => name.includes(k)) && ex.best_weight > bestWeight) {
          bestWeight = ex.best_weight;
          bestName = ex.exercise_name;
        }
      });
      const score = scoreFromWeight(bestWeight, std.levels);
      return { ...std, bestWeight, bestName, score, levelIdx: levelFromScore(score) };
    });
  }, [exerciseData]);

  const muscleScores = useMemo(() => {
    const map = {};
    standardScores.forEach(s => {
      if (!map[s.muscle] || s.score > map[s.muscle]) map[s.muscle] = s.score;
    });
    return map;
  }, [standardScores]);

  const overallScore = useMemo(() => {
    const vals = Object.values(muscleScores).filter(v => v > 0);
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
  }, [muscleScores]);

  const hasData = exerciseData.length > 0;
  const overallLevel = levelFromScore(overallScore);

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4" style={{ borderColor: "#ff6b00", borderTopColor: "transparent" }} />
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl space-y-5 pb-10">
      {/* Header */}
      <div className="ios-slide-up">
        <span className="section-badge mb-3 inline-flex">Analytics</span>
        <h1 className="text-5xl font-black uppercase text-white" style={{ fontFamily: "'Bebas Neue',sans-serif" }}>
          Strength Score
        </h1>
        <p className="mt-1 text-sm text-white/40">One number. Total strength across all lifts.</p>
      </div>

      {/* Hero Score Card */}
      <div className="ios-slide-up rounded-3xl overflow-hidden" style={{ background: "#1c1c1e", border: "1px solid rgba(255,255,255,0.06)", animationDelay: "80ms" }}>
        <div className="h-1" style={{ background: "linear-gradient(90deg,#ff6b00,#bf5af2,#0a84ff)" }} />
        <div className="p-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest mb-1 text-white/35">Your Strength Score</p>
            <p className="text-8xl font-black leading-none" style={{ fontFamily: "'Bebas Neue',sans-serif", color: hasData ? "#ff6b00" : "rgba(255,255,255,0.15)" }}>
              {hasData ? overallScore : "—"}
            </p>
            <p className="text-base text-white/25 mb-3">/ 100</p>
            <span className="rounded-full px-3 py-1 text-xs font-black uppercase"
              style={{ background: `${LEVEL_COLORS[overallLevel]}18`, color: LEVEL_COLORS[overallLevel], border: `1px solid ${LEVEL_COLORS[overallLevel]}44` }}>
              {LEVEL_LABELS[overallLevel]}
            </span>
            {!hasData && (
              <p className="mt-4 text-xs text-white/40 max-w-[180px]">
                Log bench press, squats, deadlifts to unlock your score.
              </p>
            )}
          </div>
          <BodyMap scores={muscleScores} />
        </div>
        {/* Color legend */}
        <div className="flex flex-wrap gap-3 px-6 pb-5">
          {LEVEL_LABELS.map((l, i) => (
            <div key={l} className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full" style={{ background: LEVEL_COLORS[i] }} />
              <span className="text-[10px] text-white/40">{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[["muscles", "💪 Muscles"], ["progression", "📊 Standards"]].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)}
            className="rounded-2xl px-4 py-2 text-sm font-black transition-all"
            style={tab === t
              ? { background: "#ff6b00", color: "#000" }
              : { background: "#1c1c1e", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}>
            {l}
          </button>
        ))}
      </div>

      {/* Muscles Tab */}
      {tab === "muscles" && (
        <div className="ios-slide-up space-y-3">
          {standardScores.map((s, i) => (
            <div key={i} className="rounded-2xl p-4"
              style={{ background: "#1c1c1e", border: `1px solid ${s.score > 0 ? s.color + "28" : "rgba(255,255,255,0.05)"}` }}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-black text-white">{s.label}</p>
                  {s.bestName && <p className="text-[11px] text-white/35">Best: {s.bestName} · {s.bestWeight} kg</p>}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black" style={{ fontFamily: "'Bebas Neue',sans-serif", color: s.score > 0 ? s.color : "rgba(255,255,255,0.2)" }}>
                    {s.score || "—"}
                  </p>
                  {s.score > 0 && (
                    <span className="text-[10px] font-black uppercase" style={{ color: LEVEL_COLORS[s.levelIdx] }}>
                      {LEVEL_LABELS[s.levelIdx]}
                    </span>
                  )}
                </div>
              </div>
              {/* Score bar */}
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${s.score}%`, background: s.score > 0 ? `linear-gradient(90deg,${s.color},${s.color}88)` : "transparent", boxShadow: s.score > 0 ? `0 0 8px ${s.color}60` : "none" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Standards Tab */}
      {tab === "progression" && (
        <div className="ios-slide-up space-y-4">
          {standardScores.map((s, i) => (
            <div key={i} className="rounded-2xl overflow-hidden" style={{ background: "#1c1c1e", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <p className="text-sm font-black text-white">{s.label}</p>
                {s.bestWeight > 0 && (
                  <span className="text-[11px] font-bold" style={{ color: s.color }}>Your best: {s.bestWeight} kg</span>
                )}
              </div>
              <div className="grid grid-cols-5 divide-x divide-white/5">
                {LEVEL_LABELS.map((lvl, li) => {
                  const isCurrentLevel = s.score > 0 && s.levelIdx === li;
                  const isPassed = s.score > 0 && li < s.levelIdx;
                  return (
                    <div key={lvl} className="p-3 text-center"
                      style={isCurrentLevel ? { background: `${s.color}12` } : {}}>
                      <p className="text-[9px] uppercase tracking-widest mb-1"
                        style={{ color: isCurrentLevel ? s.color : isPassed ? "#30d158" : "rgba(255,255,255,0.25)" }}>
                        {lvl}
                      </p>
                      <p className="text-xs font-black"
                        style={{ color: isPassed ? "#30d158" : isCurrentLevel ? s.color : "rgba(255,255,255,0.4)" }}>
                        {isPassed ? "✓" : `${s.levels[li]}kg`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
