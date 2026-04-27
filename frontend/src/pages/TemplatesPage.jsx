import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

const DAY_NAMES = ["MON","TUE","WED","THU","FRI","SAT","SUN"];

// Muscle group images
const MUSCLE_IMAGES = {
  CHEST:     "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80&fit=crop",
  BACK:      "https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=400&q=80&fit=crop",
  SHOULDERS: "https://images.unsplash.com/photo-1581009137042-c552e485697a?w=400&q=80&fit=crop",
  LEGS:      "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80&fit=crop",
  BICEPS:    "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=400&q=80&fit=crop",
  TRICEPS:   "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=400&q=80&fit=crop",
  ARMS:      "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=400&q=80&fit=crop",
  PUSH:      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80&fit=crop",
  PULL:      "https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=400&q=80&fit=crop",
  UPPER:     "https://images.unsplash.com/photo-1581009137042-c552e485697a?w=400&q=80&fit=crop",
  LOWER:     "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80&fit=crop",
  TRAINING:  "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=400&q=80&fit=crop",
  REST:      "https://images.unsplash.com/photo-1520334363431-48a03a7b77d4?w=400&q=80&fit=crop",
};

const FOCUS_CONFIG = {
  CHEST:     { emoji:"🏋️", color:"#ff6b00", muscles:["Chest","Pectorals"] },
  BACK:      { emoji:"↙️", color:"#0a84ff", muscles:["Back","Lats","Rhomboids"] },
  SHOULDERS: { emoji:"💪", color:"#bf5af2", muscles:["Shoulders","Deltoids"] },
  LEGS:      { emoji:"🦵", color:"#30d158", muscles:["Quads","Hamstrings","Calves"] },
  BICEPS:    { emoji:"💪", color:"#ffd60a", muscles:["Biceps"] },
  TRICEPS:   { emoji:"🔱", color:"#ff375f", muscles:["Triceps"] },
  ARMS:      { emoji:"💪", color:"#ff375f", muscles:["Biceps","Triceps"] },
  PUSH:      { emoji:"↗️", color:"#ff6b00", muscles:["Chest","Shoulders","Triceps"] },
  PULL:      { emoji:"↙️", color:"#0a84ff", muscles:["Back","Biceps","Rear Delts"] },
  UPPER:     { emoji:"🧥", color:"#bf5af2", muscles:["Chest","Back","Shoulders","Arms"] },
  LOWER:     { emoji:"🦵", color:"#30d158", muscles:["Quads","Hamstrings","Glutes","Calves"] },
  TRAINING:  { emoji:"⚡", color:"#ffd60a", muscles:["Full Body"] },
  REST:      { emoji:"😴", color:"#48484a", muscles:["Recovery"] },
};

const CATEGORY_META = {
  "Bro Split":      { level:"Classic",  goal:"Muscle Focus",    rhythm:"5-day" },
  "Push/Pull/Legs": { level:"Elite",    goal:"Hypertrophy",     rhythm:"6-day" },
  "Upper/Lower":    { level:"Balanced", goal:"Strength + Size", rhythm:"4-day" },
};

// ── Hardcoded day labels per template (no guessing from exercise names) ──
const TEMPLATE_DAY_MAP = {
  "Bro Split": {
    1: "CHEST",
    2: "BACK",
    3: "SHOULDERS",
    4: "LEGS",
    5: "ARMS",
  },
  "Push/Pull/Legs": {
    1: "PUSH",
    2: "PULL",
    3: "LEGS",
    4: "PUSH",
    5: "PULL",
    6: "LEGS",
  },
  "Upper/Lower": {
    1: "UPPER",
    2: "LOWER",
    3: "REST",
    4: "UPPER",
    5: "LOWER",
  },
};

function getDayFocus(category, dayNumber, exercises) {
  // Hardcoded map — always correct
  if (TEMPLATE_DAY_MAP[category]?.[dayNumber]) {
    return TEMPLATE_DAY_MAP[category][dayNumber];
  }
  // Fallback for custom templates
  return exercises?.length ? "TRAINING" : "REST";
}


function getTemplateDays(template) {
  const numDays = template.duration_days || Math.max(...template.exercises.map(e => e.day_number));
  return Array.from({ length: numDays }, (_, i) => ({
    dayIndex: i,
    exercises: template.exercises.filter(e => e.day_number === i + 1).sort((a, b) => a.order - b.order),
  }));
}

function DayCard({ dayIndex, exercises, templateId, category, onStart, starting, expanded, onToggle }) {
  const dayNum = dayIndex + 1;
  const focus  = getDayFocus(category, dayNum, exercises);
  const cfg    = FOCUS_CONFIG[focus] || FOCUS_CONFIG.TRAINING;
  const isRest = focus==="REST";
  const img    = MUSCLE_IMAGES[focus];

  return (
    <article className="ios-card overflow-hidden transition-transform duration-200 hover:-translate-y-1">
      {/* Muscle image header */}
      <div className="relative h-32 overflow-hidden">
        <img src={img} alt={focus} className="h-full w-full object-cover"
          style={{ filter:"brightness(0.5) saturate(0.75)" }} />
        <div className="absolute inset-0"
          style={{ background:`linear-gradient(to bottom, transparent 20%, rgba(28,28,30,0.95) 100%)` }} />
        {/* Top bar color */}
        <div className="absolute inset-x-0 top-0 h-1"
          style={{ background: isRest?"rgba(255,255,255,0.06)":`linear-gradient(90deg,${cfg.color},transparent)` }} />
        {/* Day badge */}
        <div className="absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-black"
          style={{ background:"rgba(0,0,0,0.6)", color:"rgba(255,255,255,0.7)" }}>
          Day {dayNum}
        </div>
        {/* Focus label */}
        <div className="absolute bottom-3 left-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{color:cfg.color}}>
            {DAY_NAMES[dayIndex]}
          </p>
          <h3 className="text-xl font-black uppercase text-white leading-none mt-0.5"
            style={{fontFamily:"'Bebas Neue',sans-serif"}}>
            {cfg.emoji} {focus}
          </h3>
        </div>
      </div>

      <div className="p-4">
        {/* Muscle tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {cfg.muscles.map(m=>(
            <span key={m} className="rounded-full px-2.5 py-1 text-[10px] font-semibold"
              style={{background:`${cfg.color}15`, color:cfg.color}}>
              {m}
            </span>
          ))}
        </div>

        {/* Exercise previews */}
        {!isRest && (
          <div className="space-y-1.5 mb-3">
            <p className="text-[10px] uppercase tracking-widest" style={{color:"rgba(255,255,255,0.3)"}}>
              {exercises.length} exercises
            </p>
            {exercises.slice(0,2).map(ex=>(
              <div key={ex.id} className="flex items-center justify-between rounded-xl px-3 py-2"
                style={{background:"rgba(255,255,255,0.04)"}}>
                <p className="text-sm font-semibold text-white truncate">{ex.name}</p>
                <p className="text-xs shrink-0 ml-2" style={{color:"rgba(255,255,255,0.35)"}}>
                  {ex.recommended_sets}×{ex.recommended_reps}
                </p>
              </div>
            ))}
            {expanded && exercises.slice(2).map(ex=>(
              <div key={ex.id} className="flex items-center justify-between rounded-xl px-3 py-2"
                style={{background:"rgba(255,255,255,0.025)"}}>
                <p className="text-sm text-white/80 truncate">{ex.name}</p>
                <p className="text-xs shrink-0 ml-2" style={{color:"rgba(255,255,255,0.3)"}}>
                  {ex.recommended_sets}×{ex.recommended_reps}
                </p>
              </div>
            ))}
          </div>
        )}
        {isRest && <p className="text-sm italic mb-3" style={{color:"rgba(255,255,255,0.3)"}}>Rest & recovery day</p>}

        {!isRest && (
          <div className="flex gap-2">
            <button type="button" onClick={()=>onStart(templateId,dayNum)} disabled={starting}
              className="flex-1 rounded-xl py-3 text-xs font-black uppercase tracking-wider text-white transition active:scale-95 disabled:opacity-50"
              style={{background:`linear-gradient(135deg,${cfg.color},${cfg.color}bb)`, boxShadow:`0 4px 14px ${cfg.color}40`}}>
              {starting?"Starting…":"▶ Start"}
            </button>
            {exercises.length>2 && (
              <button type="button" onClick={onToggle}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
                style={{background:"rgba(255,255,255,0.06)"}}>
                {expanded?"⌃":"⌄"}
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function TemplatesPage() {
  const [templates,setTemplates]       = useState([]);
  const [activeId,setActiveId]         = useState(null);
  const [expandedDays,setExpandedDays] = useState({});
  const [loading,setLoading]           = useState(true);
  const [error,setError]               = useState(null);
  const [startingKey,setStartingKey]   = useState(null);
  const navigate = useNavigate();

  useEffect(()=>{
    (async()=>{
      try {
        setLoading(true);
        const {data} = await api.get("/templates");
        setTemplates(data);
        setActiveId(data[0]?.id??null);
      } catch(e){ setError("Failed to load templates"); }
      finally{ setLoading(false); }
    })();
  },[]);

  const active  = useMemo(()=>templates.find(t=>t.id===activeId)??templates[0],[activeId,templates]);
  const days    = useMemo(()=>active?getTemplateDays(active):[],[active]);
  const trainingDays = days.filter(d=>d.exercises.length>0).length;
  const meta    = CATEGORY_META[active?.category]??{level:"Custom",goal:"Training",rhythm:`${trainingDays}-day`};

  const handleStart = async(templateId,dayNumber)=>{
    const key=`${templateId}-${dayNumber}`;
    setStartingKey(key);
    try {
      const {data} = await api.post(`/templates/use/${templateId}?day_number=${dayNumber}`);
      navigate(`/workouts/${data.workout_id}`);
    } catch(e){
      alert(e.response?.data?.detail||"Failed to start session.");
    } finally{ setStartingKey(null); }
  };

  if(loading) return(
    <div className="flex min-h-[60vh] items-center justify-center flex-col gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"
        style={{borderColor:"rgba(255,107,0,0.25)",borderTopColor:"#ff6b00"}} />
      <p className="text-sm uppercase tracking-widest" style={{color:"rgba(255,255,255,0.35)"}}>Loading programs…</p>
    </div>
  );

  return (
    <main className="min-h-screen pb-12 text-white">
      {/* Header */}
      <section className="mb-8">
        <span className="section-badge mb-4 inline-flex">Training Programs</span>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-5xl font-black uppercase text-white md:text-7xl"
              style={{fontFamily:"'Bebas Neue',sans-serif"}}>
              Choose Your Split
            </h1>
            <p className="mt-2 max-w-xl text-sm" style={{color:"rgba(255,255,255,0.4)"}}>
              Train by muscle group, movement pattern, or recovery rhythm.
            </p>
          </div>
          {/* Tab switcher */}
          <div className="flex gap-2 rounded-2xl p-1.5 shrink-0"
            style={{background:"#1c1c1e"}}>
            {templates.map(t=>{
              const isActive = t.id===active?.id;
              return(
                <button key={t.id} type="button" onClick={()=>{setActiveId(t.id);setExpandedDays({});}}
                  className="min-h-11 whitespace-nowrap rounded-xl px-4 text-xs font-black uppercase tracking-wider transition"
                  style={isActive
                    ?{background:"#ff6b00",color:"white",boxShadow:"0 4px 14px rgba(255,107,0,0.4)"}
                    :{color:"rgba(255,255,255,0.4)"}}>
                  {t.category}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {error && <div className="mb-6 rounded-2xl px-5 py-4 text-sm text-red-400"
        style={{background:"rgba(255,69,58,0.1)",border:"1px solid rgba(255,69,58,0.2)"}}>{error}</div>}

      {active && (
        <>
          {/* Program info + stats */}
          <section className="mb-8 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
            <div className="relative overflow-hidden rounded-2xl p-6"
              style={{background:"#1c1c1e"}}>
              {/* BG muscle image */}
              <img
                src={MUSCLE_IMAGES[active.category?.toUpperCase().replace(/\//g,"_")]||MUSCLE_IMAGES.TRAINING}
                alt={active.name}
                className="absolute inset-0 h-full w-full object-cover opacity-10"
              />
              <div className="relative z-10">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider"
                    style={{background:"rgba(255,107,0,0.2)",color:"#ff9a3d"}}>{meta.level}</span>
                  <span className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider"
                    style={{background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.5)"}}>{meta.goal}</span>
                  <span className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider"
                    style={{background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.5)"}}>{meta.rhythm}</span>
                </div>
                <h2 className="text-4xl font-black uppercase text-white md:text-5xl"
                  style={{fontFamily:"'Bebas Neue',sans-serif"}}>{active.name}</h2>
                <p className="mt-2 text-sm leading-6" style={{color:"rgba(255,255,255,0.45)"}}>
                  {active.description}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                {label:"Training Days",value:trainingDays},
                {label:"Exercises",value:active.exercises.length},
                {label:"Rhythm",value:meta.rhythm},
              ].map(s=>(
                <div key={s.label} className="rounded-2xl p-4 flex flex-col justify-between"
                  style={{background:"#1c1c1e"}}>
                  <p className="text-[10px] font-bold uppercase tracking-wider"
                    style={{color:"rgba(255,107,0,0.7)"}}>{s.label}</p>
                  <p className="text-2xl font-black text-white mt-2">{s.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Day cards grid */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
            {days.map(({dayIndex,exercises})=>(
              <DayCard key={dayIndex} dayIndex={dayIndex} exercises={exercises}
                templateId={active.id} category={active.category} onStart={handleStart}
                starting={startingKey===`${active.id}-${dayIndex+1}`}
                expanded={Boolean(expandedDays[`${active.id}-${dayIndex+1}`])}
                onToggle={()=>{
                  const k=`${active.id}-${dayIndex+1}`;
                  setExpandedDays(c=>({...c,[k]:!c[k]}));
                }} />
            ))}
          </section>
        </>
      )}
    </main>
  );
}

export default TemplatesPage;
