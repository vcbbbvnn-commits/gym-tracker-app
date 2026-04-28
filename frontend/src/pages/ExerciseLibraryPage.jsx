import { useEffect, useMemo, useRef, useState } from "react";

// ── Free exercise DB (yuhonas/free-exercise-db on GitHub) ──────────────────
const DB_URL =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";
const IMG_BASE =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

// ── Wger REST API for exercise GIFs/videos (no key needed) ─────────────────
// We'll also embed YouTube search links as a fallback in the modal

const MUSCLE_COLORS = {
  abdominals: "#ff6b00", abductors: "#ff9a3d", adductors: "#ffcc00",
  biceps: "#30d158", calves: "#34c759", chest: "#0a84ff",
  forearms: "#5e5ce6", glutes: "#bf5af2", hamstrings: "#ff375f",
  "hip flexors": "#ff6961", "it band": "#ffd60a", lat: "#0a84ff",
  "lower back": "#ff9500", "middle back": "#ff6b00", neck: "#8e8e93",
  quadriceps: "#30d158", shoulders: "#bf5af2", trapezius: "#5e5ce6",
  triceps: "#ff375f",
};

const EQUIPMENT_ICONS = {
  barbell: "🏋️", dumbbell: "💪", "body only": "🤸", machine: "⚙️",
  cable: "🔗", kettlebells: "🔔", bands: "〰️", "medicine ball": "⚽",
  "foam roll": "🥢", "e-z curl bar": "🏋️", other: "🔧",
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

/* ── Animated Exercise Demo (CSS-driven flip between 2 frames) ───────────── */
function ExerciseAnimation({ images, name, size = "full" }) {
  const [frame, setFrame] = useState(0);
  const [loaded0, setLoaded0] = useState(false);
  const [loaded1, setLoaded1] = useState(false);
  const timerRef = useRef(null);

  const img0 = images?.[0] ? IMG_BASE + images[0] : null;
  const img1 = images?.[1] ? IMG_BASE + images[1] : null;

  // Start animation once both images are loaded
  useEffect(() => {
    if (loaded0 && loaded1 && img1) {
      timerRef.current = setInterval(() => {
        setFrame(f => (f === 0 ? 1 : 0));
      }, 700); // 700ms per frame = smooth GIF feel
    }
    return () => clearInterval(timerRef.current);
  }, [loaded0, loaded1, img1]);

  if (!img0) {
    return (
      <div className={`flex items-center justify-center text-5xl ${size === "full" ? "h-64" : "h-36"}`}
        style={{ background: "#2c2c2e" }}>
        💪
      </div>
    );
  }

  const heightClass = size === "full" ? "h-64" : "h-36";

  return (
    <div className={`relative ${heightClass} overflow-hidden`} style={{ background: "#0a0a0a" }}>
      {/* Frame 0 */}
      <img
        src={img0}
        alt={`${name} start`}
        onLoad={() => setLoaded0(true)}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
        style={{
          opacity: frame === 0 ? 1 : 0,
          filter: "brightness(0.85) saturate(0.9)",
        }}
      />
      {/* Frame 1 */}
      {img1 && (
        <img
          src={img1}
          alt={`${name} end`}
          onLoad={() => setLoaded1(true)}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
          style={{
            opacity: frame === 1 ? 1 : 0,
            filter: "brightness(0.85) saturate(0.9)",
          }}
        />
      )}

      {/* Loading pulse */}
      {!loaded0 && (
        <div className="absolute inset-0 skeleton" />
      )}

      {/* "LIVE" indicator when animating */}
      {loaded0 && loaded1 && img1 && (
        <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-full px-2 py-0.5"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)" }}>
          <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "#30d158" }} />
          <span className="text-[9px] font-black uppercase tracking-wider text-white">Live Demo</span>
        </div>
      )}

      {/* Bottom gradient */}
      {size === "full" && (
        <div className="absolute inset-x-0 bottom-0 h-24"
          style={{ background: "linear-gradient(to top, #1c1c1e 0%, transparent 100%)" }} />
      )}
    </div>
  );
}

/* ── Exercise Detail Modal ────────────────────────────────────────────────── */
function ExerciseModal({ ex, onClose }) {
  if (!ex) return null;
  const muscle = ex.primaryMuscles?.[0];
  const color = MUSCLE_COLORS[muscle] || "#ff6b00";
  const ytQuery = encodeURIComponent(`${ex.name} exercise form technique`);
  const ytUrl = `https://www.youtube.com/results?search_query=${ytQuery}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4"
      style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(30px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden"
        style={{
          background: "#1c1c1e",
          border: "0.5px solid rgba(255,255,255,0.12)",
          maxHeight: "92vh",
          overflowY: "auto",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Animated Demo ── */}
        <div className="relative">
          <ExerciseAnimation images={ex.images} name={ex.name} size="full" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full text-sm font-black transition hover:scale-110"
            style={{ background: "rgba(0,0,0,0.75)", color: "white", backdropFilter: "blur(10px)" }}
          >✕</button>
          {/* Muscle color strip on bottom */}
          <div className="absolute inset-x-0 bottom-0 h-1" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
        </div>

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

          <h2 className="text-2xl font-black text-white mb-4">{ex.name}</h2>

          {/* Muscles */}
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>
              Primary Muscles
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ex.primaryMuscles?.map(m => (
                <span key={m} className="rounded-full px-3 py-1 text-xs font-bold capitalize"
                  style={{
                    background: `${MUSCLE_COLORS[m] || "#ff6b00"}18`,
                    color: MUSCLE_COLORS[m] || "#ff6b00",
                    border: `1px solid ${MUSCLE_COLORS[m] || "#ff6b00"}44`,
                  }}>
                  {m}
                </span>
              ))}
            </div>
            {ex.secondaryMuscles?.length > 0 && (
              <div className="mt-2">
                <p className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "rgba(255,255,255,0.25)" }}>
                  Also Works
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

          {/* ── Step-by-step Instructions ── */}
          {ex.instructions?.length > 0 && (
            <div className="mb-6 rounded-2xl overflow-hidden"
              style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
              <div className="px-4 py-3 border-b border-white/5">
                <p className="text-[10px] uppercase tracking-widest font-black" style={{ color: "#ff6b00" }}>
                  📋 How To Perform
                </p>
              </div>
              <ol className="p-4 space-y-3">
                {ex.instructions.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
                    <span
                      className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-black"
                      style={{ background: "rgba(255,107,0,0.15)", color: "#ff6b00", border: "1px solid rgba(255,107,0,0.3)" }}>
                      {i + 1}
                    </span>
                    <span className="leading-relaxed pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* ── Watch on YouTube button ── */}
          <a
            href={ytUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black uppercase tracking-widest transition hover:opacity-90"
            style={{ background: "#ff0000", color: "#fff" }}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            Watch Full Tutorial on YouTube
          </a>
        </div>
      </div>
    </div>
  );
}

/* ── Exercise Card (animated on hover) ──────────────────────────────────── */
function ExCard({ ex, onClick }) {
  const [hovered, setHovered] = useState(false);
  const [frame, setFrame] = useState(0);
  const timerRef = useRef(null);
  const muscle = ex.primaryMuscles?.[0];
  const color = MUSCLE_COLORS[muscle] || "#ff6b00";
  const img0 = ex.images?.[0] ? IMG_BASE + ex.images[0] : null;
  const img1 = ex.images?.[1] ? IMG_BASE + ex.images[1] : null;

  useEffect(() => {
    if (hovered && img1) {
      timerRef.current = setInterval(() => setFrame(f => f === 0 ? 1 : 0), 600);
    } else {
      clearInterval(timerRef.current);
      setFrame(0);
    }
    return () => clearInterval(timerRef.current);
  }, [hovered, img1]);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group text-left rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: "#1c1c1e",
        border: hovered ? `1px solid ${color}44` : "1px solid rgba(255,255,255,0.06)",
        transform: hovered ? "scale(1.02) translateY(-2px)" : "scale(1)",
        boxShadow: hovered ? `0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px ${color}22` : "none",
      }}
    >
      {/* Animated image area */}
      <div className="relative h-36 overflow-hidden" style={{ background: "#1a1a1a" }}>
        {img0 ? (
          <>
            <img src={img0} alt={ex.name} loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
              style={{ opacity: frame === 0 ? 1 : 0, filter: "brightness(0.75) saturate(0.85)" }} />
            {img1 && (
              <img src={img1} alt={ex.name} loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                style={{ opacity: frame === 1 ? 1 : 0, filter: "brightness(0.75) saturate(0.85)" }} />
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">
            {EQUIPMENT_ICONS[ex.equipment] || "💪"}
          </div>
        )}

        <div className="absolute inset-0" style={{ background: "linear-gradient(to top,#1c1c1e 0%,transparent 55%)" }} />

        {/* Play indicator on hover */}
        {hovered && img1 && (
          <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full px-2 py-0.5"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}>
            <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "#30d158" }} />
            <span className="text-[8px] font-black uppercase text-white">Live</span>
          </div>
        )}

        {/* Level badge */}
        <span className="absolute top-2 right-2 rounded-full px-2 py-0.5 text-[9px] font-black uppercase"
          style={{ background: `${LEVEL_COLOR[ex.level] || "#8e8e93"}dd`, color: "#000" }}>
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
          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
            {EQUIPMENT_ICONS[ex.equipment] || "🔧"}
          </span>
        </div>
      </div>
    </button>
  );
}

/* ── Main Page ─────────────────────────────────────────────────────────────── */
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
    const cached = sessionStorage.getItem("exerciseDB_v2");
    if (cached) {
      setExercises(JSON.parse(cached));
      setLoading(false);
      return;
    }
    fetch(DB_URL)
      .then(r => r.json())
      .then(data => {
        sessionStorage.setItem("exerciseDB_v2", JSON.stringify(data));
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
      if (q && !ex.name.toLowerCase().includes(q) && !ex.primaryMuscles?.join(" ").includes(q)) return false;
      return true;
    });
  }, [exercises, query, muscle, equipment, level]);

  const paged = filtered.slice(0, page * PER_PAGE);
  const hasMore = paged.length < filtered.length;

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
          {loading
            ? "Loading…"
            : `${filtered.length.toLocaleString()} exercises · Hover to preview · Tap for full guide + video`}
        </p>
      </div>

      {/* Search bar */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">🔍</span>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search bench press, squat, deadlift…"
          className="w-full rounded-2xl border py-3.5 pl-11 pr-4 text-sm text-white outline-none transition"
          style={{ background: "#1c1c1e", borderColor: "rgba(255,255,255,0.1)" }}
          onFocus={e => e.target.style.borderColor = "#ff6b0080"}
          onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
        />
      </div>

      {/* Filter rows */}
      <div className="space-y-2">
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
          {EQUIPMENT_LIST.map(eq => (
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

      {error && (
        <div className="rounded-2xl px-5 py-4 text-sm"
          style={{ background: "rgba(255,69,58,0.1)", border: "1px solid rgba(255,69,58,0.2)", color: "#ff453a" }}>
          {error}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: 24 }).map((_, i) => <div key={i} className="skeleton rounded-2xl h-52" />)}
        </div>
      )}

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
                className="rounded-2xl px-8 py-3 text-sm font-bold transition hover:opacity-80"
                style={{ background: "#1c1c1e", color: "#ff6b00", border: "1px solid rgba(255,107,0,0.3)" }}>
                Load More ({filtered.length - paged.length} remaining)
              </button>
            </div>
          )}
        </>
      )}

      {selected && <ExerciseModal ex={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
