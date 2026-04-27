import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

// ── Free exercise DB (yuhonas/free-exercise-db on GitHub) ──────────────────
const DB_URL =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";
const IMG_BASE =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

const MUSCLE_COLORS = {
  abdominals:       "#ff6b00",
  abductors:        "#ff9a3d",
  adductors:        "#ffcc00",
  biceps:           "#30d158",
  calves:           "#34c759",
  chest:            "#0a84ff",
  forearms:         "#5e5ce6",
  glutes:           "#bf5af2",
  hamstrings:       "#ff375f",
  "hip flexors":    "#ff6961",
  "it band":        "#ffd60a",
  "lat":            "#0a84ff",
  "lower back":     "#ff9500",
  "middle back":    "#ff6b00",
  neck:             "#8e8e93",
  quadriceps:       "#30d158",
  shoulders:        "#bf5af2",
  "trapezius":      "#5e5ce6",
  triceps:          "#ff375f",
};

const EQUIPMENT_ICONS = {
  barbell: "🏋️", dumbbell: "💪", "body only": "🤸",
  machine: "⚙️", "cable": "🔗", kettlebells: "🔔",
  bands: "〰️", "medicine ball": "⚽", "foam roll": "🥢",
  "e-z curl bar": "🏋️", other: "🔧",
};

const LEVEL_COLOR = { beginner: "#30d158", intermediate: "#ff9500", expert: "#ff375f" };

const MUSCLE_GROUPS = [
  "All", "chest", "biceps", "triceps", "shoulders", "abdominals",
  "quadriceps", "hamstrings", "glutes", "calves", "middle back",
  "lower back", "lat", "trapezius", "forearms", "neck",
];

const EQUIPMENT_LIST = [
  "All", "barbell", "dumbbell", "body only", "machine", "cable",
  "kettlebells", "bands", "medicine ball", "e-z curl bar",
];

/* ── Exercise Detail Modal ────────────────────────────────────────────────── */
function ExerciseModal({ ex, onClose, onAddToWorkout }) {
  if (!ex) return null;
  const imgSrc = ex.images?.[0] ? IMG_BASE + ex.images[0] : null;
  const altImg = ex.images?.[1] ? IMG_BASE + ex.images[1] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(20px)" }}
      onClick={onClose}>
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden"
        style={{ background: "#1c1c1e", border: "0.5px solid rgba(255,255,255,0.12)", maxHeight: "90vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}>

        {/* Image strip */}
        {imgSrc && (
          <div className="relative h-48 overflow-hidden">
            <img src={imgSrc} alt={ex.name} className="w-full h-full object-cover"
              style={{ filter: "brightness(0.7)" }} />
            {altImg && (
              <img src={altImg} alt={ex.name + " alt"}
                className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-60"
                style={{ mixBlendMode: "luminosity" }} />
            )}
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top,#1c1c1e 0%,transparent 60%)" }} />
            <button onClick={onClose}
              className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full text-sm"
              style={{ background: "rgba(0,0,0,0.6)", color: "white" }}>✕</button>
          </div>
        )}

        <div className="p-6">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="rounded-full px-3 py-0.5 text-[11px] font-black uppercase"
              style={{ background: `${LEVEL_COLOR[ex.level] || "#8e8e93"}22`, color: LEVEL_COLOR[ex.level] || "#8e8e93" }}>
              {ex.level}
            </span>
            <span className="rounded-full px-3 py-0.5 text-[11px] font-bold uppercase"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}>
              {EQUIPMENT_ICONS[ex.equipment] || "🔧"} {ex.equipment}
            </span>
            {ex.mechanic && (
              <span className="rounded-full px-3 py-0.5 text-[11px] font-bold uppercase"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}>
                {ex.mechanic}
              </span>
            )}
          </div>

          <h2 className="text-2xl font-black text-white mb-1">{ex.name}</h2>

          {/* Muscles */}
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
              Primary Muscles
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ex.primaryMuscles?.map(m => (
                <span key={m} className="rounded-full px-3 py-0.5 text-xs font-bold capitalize"
                  style={{ background: `${MUSCLE_COLORS[m] || "#ff6b00"}22`, color: MUSCLE_COLORS[m] || "#ff6b00", border: `1px solid ${MUSCLE_COLORS[m] || "#ff6b00"}44` }}>
                  {m}
                </span>
              ))}
            </div>
            {ex.secondaryMuscles?.length > 0 && (
              <div className="mt-2">
                <p className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "rgba(255,255,255,0.25)" }}>
                  Secondary
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {ex.secondaryMuscles.map(m => (
                    <span key={m} className="rounded-full px-2 py-0.5 text-[11px] capitalize"
                      style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          {ex.instructions?.length > 0 && (
            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>
                How To Perform
              </p>
              <ol className="space-y-2">
                {ex.instructions.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-black mt-0.5"
                      style={{ background: "rgba(255,107,0,0.2)", color: "#ff6b00" }}>
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {onAddToWorkout && (
            <button onClick={() => { onAddToWorkout(ex.name); onClose(); }}
              className="w-full rounded-2xl py-4 text-sm font-black uppercase tracking-widest"
              style={{ background: "linear-gradient(135deg,#ff6b00,#ff375f)", color: "#000" }}>
              + Add to Current Workout
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Exercise Card ────────────────────────────────────────────────────────── */
function ExCard({ ex, onClick }) {
  const imgSrc = ex.images?.[0] ? IMG_BASE + ex.images[0] : null;
  const muscle = ex.primaryMuscles?.[0];
  const color = MUSCLE_COLORS[muscle] || "#ff6b00";

  return (
    <button onClick={onClick} className="text-left rounded-2xl overflow-hidden transition hover:scale-[1.02] active:scale-[0.98]"
      style={{ background: "#1c1c1e", border: `1px solid rgba(255,255,255,0.06)` }}>
      {/* Exercise image */}
      <div className="relative h-36 overflow-hidden" style={{ background: "#2c2c2e" }}>
        {imgSrc ? (
          <img src={imgSrc} alt={ex.name} className="w-full h-full object-cover"
            loading="lazy" style={{ filter: "brightness(0.75) saturate(0.8)" }} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            {EQUIPMENT_ICONS[ex.equipment] || "💪"}
          </div>
        )}
        <div className="absolute inset-0" style={{ background: `linear-gradient(to top,#1c1c1e 0%,transparent 55%)` }} />
        {/* Level badge */}
        <span className="absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-black uppercase"
          style={{ background: `${LEVEL_COLOR[ex.level] || "#8e8e93"}cc`, color: "#000" }}>
          {ex.level}
        </span>
      </div>

      <div className="px-3 pb-3 pt-2">
        <p className="text-sm font-bold text-white leading-tight line-clamp-2 mb-1.5">{ex.name}</p>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold capitalize rounded-full px-2 py-0.5"
            style={{ background: `${color}18`, color }}>
            {muscle || "general"}
          </span>
          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
            {EQUIPMENT_ICONS[ex.equipment] || "🔧"}
          </span>
        </div>
      </div>
    </button>
  );
}

/* ── Main Page ────────────────────────────────────────────────────────────── */
export default function ExerciseLibraryPage() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState("All");
  const [equipment, setEquipment] = useState("All");
  const [level, setLevel] = useState("All");
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 24;

  useEffect(() => {
    const cached = sessionStorage.getItem("exerciseDB");
    if (cached) {
      setExercises(JSON.parse(cached));
      setLoading(false);
      return;
    }
    fetch(DB_URL)
      .then(r => r.json())
      .then(data => {
        sessionStorage.setItem("exerciseDB", JSON.stringify(data));
        setExercises(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load exercise database. Check your connection.");
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return exercises.filter(ex => {
      if (muscle !== "All" && !ex.primaryMuscles?.includes(muscle)) return false;
      if (equipment !== "All" && ex.equipment !== equipment) return false;
      if (level !== "All" && ex.level !== level) return false;
      if (q && !ex.name.toLowerCase().includes(q) &&
          !ex.primaryMuscles?.join(" ").includes(q)) return false;
      return true;
    });
  }, [exercises, query, muscle, equipment, level]);

  const paged = filtered.slice(0, page * PER_PAGE);
  const hasMore = paged.length < filtered.length;

  // Reset page when filters change
  useEffect(() => setPage(1), [query, muscle, equipment, level]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="ios-slide-up">
        <span className="section-badge mb-3 inline-flex">Database</span>
        <h1 className="text-5xl font-black uppercase text-white" style={{ fontFamily: "'Bebas Neue',sans-serif" }}>
          Exercise Library
        </h1>
        <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
          {loading ? "Loading…" : `${filtered.length.toLocaleString()} exercises · Tap any to see form guide & muscles`}
        </p>
      </div>

      {/* Search bar */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">🔍</span>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search exercises, muscles…"
          className="w-full rounded-2xl border py-3.5 pl-11 pr-4 text-sm text-white outline-none transition"
          style={{ background: "#1c1c1e", borderColor: "rgba(255,255,255,0.1)" }}
          onFocus={e => e.target.style.borderColor = "#ff6b0080"}
          onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
        />
      </div>

      {/* Filter rows */}
      <div className="space-y-3">
        {/* Muscle group */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {MUSCLE_GROUPS.map(m => (
            <button key={m} onClick={() => setMuscle(m)}
              className="flex-shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold capitalize transition"
              style={muscle === m
                ? { background: "#ff6b00", color: "#000" }
                : { background: "#1c1c1e", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {m}
            </button>
          ))}
        </div>
        {/* Equipment + Level */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {["All", "beginner", "intermediate", "expert"].map(l => (
            <button key={l} onClick={() => setLevel(l)}
              className="flex-shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold capitalize transition"
              style={level === l
                ? { background: LEVEL_COLOR[l] || "#8e8e93", color: "#000" }
                : { background: "#1c1c1e", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {l === "All" ? "All Levels" : l}
            </button>
          ))}
          <div className="w-px flex-shrink-0" style={{ background: "rgba(255,255,255,0.1)" }} />
          {EQUIPMENT_LIST.slice(0, 6).map(eq => (
            <button key={eq} onClick={() => setEquipment(eq)}
              className="flex-shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold capitalize transition"
              style={equipment === eq
                ? { background: "#0a84ff", color: "#000" }
                : { background: "#1c1c1e", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {EQUIPMENT_ICONS[eq] || ""} {eq === "All" ? "All Equipment" : eq}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl px-5 py-4 text-sm"
          style={{ background: "rgba(255,69,58,0.1)", border: "1px solid rgba(255,69,58,0.2)", color: "#ff453a" }}>
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="skeleton rounded-2xl h-52" />
          ))}
        </div>
      )}

      {/* Grid */}
      {!loading && (
        <>
          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-white font-bold">No exercises found</p>
              <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Try different filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {paged.map((ex, i) => (
                <ExCard key={i} ex={ex} onClick={() => setSelected(ex)} />
              ))}
            </div>
          )}

          {hasMore && (
            <div className="flex justify-center pt-4">
              <button onClick={() => setPage(p => p + 1)}
                className="rounded-2xl px-8 py-3 text-sm font-bold"
                style={{ background: "#1c1c1e", color: "#ff6b00", border: "1px solid rgba(255,107,0,0.3)" }}>
                Load More ({filtered.length - paged.length} remaining)
              </button>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {selected && <ExerciseModal ex={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
