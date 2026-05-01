import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const PROGRAMS = [
  {
    id: "bro",
    name: "Bro Split",
    icon: "💪",
    color: "#ff6b00",
    days: 5,
    desc: "Classic bodybuilder split",
    schedule: [
      { day: "Mon", focus: "Chest", icon: "🏋️", color: "#0a84ff" },
      { day: "Tue", focus: "Back", icon: "↙️", color: "#30d158" },
      { day: "Wed", focus: "Shoulders", icon: "🎯", color: "#bf5af2" },
      { day: "Thu", focus: "Legs", icon: "🦵", color: "#ff6b00" },
      { day: "Fri", focus: "Arms", icon: "💪", color: "#ff375f" },
      { day: "Sat", focus: "Rest", icon: "😴", color: "#8e8e93" },
      { day: "Sun", focus: "Rest", icon: "😴", color: "#8e8e93" },
    ],
  },
  {
    id: "ppl",
    name: "Push Pull Legs",
    icon: "🔄",
    color: "#0a84ff",
    days: 6,
    desc: "Efficient 6-day program",
    schedule: [
      { day: "Mon", focus: "Push", icon: "↗️", color: "#ff6b00" },
      { day: "Tue", focus: "Pull", icon: "↙️", color: "#0a84ff" },
      { day: "Wed", focus: "Legs", icon: "🦵", color: "#30d158" },
      { day: "Thu", focus: "Push", icon: "↗️", color: "#ff6b00" },
      { day: "Fri", focus: "Pull", icon: "↙️", color: "#0a84ff" },
      { day: "Sat", focus: "Legs", icon: "🦵", color: "#30d158" },
      { day: "Sun", focus: "Rest", icon: "😴", color: "#8e8e93" },
    ],
  },
  {
    id: "ul",
    name: "Upper / Lower",
    icon: "⬆️",
    color: "#30d158",
    days: 4,
    desc: "Great for beginners & intermediate",
    schedule: [
      { day: "Mon", focus: "Upper", icon: "🧥", color: "#bf5af2" },
      { day: "Tue", focus: "Lower", icon: "🦵", color: "#ff6b00" },
      { day: "Wed", focus: "Rest", icon: "😴", color: "#8e8e93" },
      { day: "Thu", focus: "Upper", icon: "🧥", color: "#bf5af2" },
      { day: "Fri", focus: "Lower", icon: "🦵", color: "#ff6b00" },
      { day: "Sat", focus: "Rest", icon: "😴", color: "#8e8e93" },
      { day: "Sun", focus: "Rest", icon: "😴", color: "#8e8e93" },
    ],
  },
  {
    id: "fullbody",
    name: "Full Body",
    icon: "💥",
    color: "#ffd60a",
    days: 3,
    desc: "Maximum efficiency, 3×/week",
    schedule: [
      { day: "Mon", focus: "Full Body", icon: "💥", color: "#ffd60a" },
      { day: "Tue", focus: "Rest", icon: "😴", color: "#8e8e93" },
      { day: "Wed", focus: "Full Body", icon: "💥", color: "#ffd60a" },
      { day: "Thu", focus: "Rest", icon: "😴", color: "#8e8e93" },
      { day: "Fri", focus: "Full Body", icon: "💥", color: "#ffd60a" },
      { day: "Sat", focus: "Rest", icon: "😴", color: "#8e8e93" },
      { day: "Sun", focus: "Rest", icon: "😴", color: "#8e8e93" },
    ],
  },
];

export default function CoachPage() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState("ppl");

  useEffect(() => {
    api.get("/workouts")
      .then(r => setWorkouts(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const program = PROGRAMS.find(p => p.id === selectedProgram);

  // Recovery analysis from recent workouts
  const { workoutsThisWeek, totalSetsThisWeek, recoveryStatus, recoveryColor, recoveryMsg } = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recent = workouts.filter(w => {
      if (!w.created_at) return false;
      return new Date(w.created_at).getTime() > weekAgo;
    });
    const sets = recent.reduce((t, w) => t + (w.exercises?.reduce((e, ex) => e + ex.sets.length, 0) || 0), 0);
    let status = "Ready to Train", color = "#30d158", msg = "You're well rested and ready for an intense session!";
    if (recent.length >= 6) { status = "Needs Recovery"; color = "#ff375f"; msg = "High training frequency detected. Consider a deload this week."; }
    else if (recent.length >= 4) { status = "Normal Load"; color = "#ff9500"; msg = "Good training volume. Stay consistent."; }
    return { workoutsThisWeek: recent.length, totalSetsThisWeek: sets, recoveryStatus: status, recoveryColor: color, recoveryMsg: msg };
  }, [workouts]);

  // Achievements
  const achievements = useMemo(() => {
    const all = [];
    const totalSets = workouts.reduce((t, w) => t + (w.exercises?.reduce((e, ex) => e + ex.sets.length, 0) || 0), 0);
    if (workouts.length >= 1) all.push({ icon: "🏆", title: "First Workout!", desc: "You started your journey." });
    if (workouts.length >= 10) all.push({ icon: "🔥", title: "10 Workouts!", desc: "Consistency is key." });
    if (workouts.length >= 30) all.push({ icon: "💎", title: "30 Workouts!", desc: "You're a regular!" });
    if (totalSets >= 100) all.push({ icon: "💪", title: "100 Sets!", desc: "Serious volume logged." });
    if (totalSets >= 500) all.push({ icon: "⚡", title: "500 Sets!", desc: "Elite dedication!" });
    return all;
  }, [workouts]);

  const todayIdx = (new Date().getDay() + 6) % 7; // Mon=0

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-10">
      {/* Header */}
      <div className="ios-slide-up">
        <span className="section-badge mb-3 inline-flex">Coach</span>
        <h1 className="text-5xl font-black uppercase text-white" style={{ fontFamily: "'Bebas Neue',sans-serif" }}>
          Your Coach
        </h1>
        <p className="mt-1 text-sm text-white/40">Adaptive routines that evolve with you.</p>
      </div>

      {/* Recovery Zone */}
      <div className="ios-slide-up rounded-3xl p-5"
        style={{ background: "#1c1c1e", border: `1px solid ${recoveryColor}30`, animationDelay: "60ms" }}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/35 mb-1">Recovery Zone</p>
            <p className="text-base font-black" style={{ color: recoveryColor }}>● {recoveryStatus}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-white">{workoutsThisWeek}</p>
            <p className="text-[10px] text-white/35">workouts this week</p>
          </div>
        </div>
        <p className="text-sm text-white/55">{recoveryMsg}</p>
        {workoutsThisWeek >= 6 && (
          <div className="mt-3 rounded-2xl px-4 py-3 flex items-center gap-3"
            style={{ background: "rgba(255,55,95,0.1)", border: "1px solid rgba(255,55,95,0.25)" }}>
            <span className="text-xl">⚠️</span>
            <p className="text-sm font-bold text-white/80">
              Deload suggestion: Reduce weights by 40% this week for full recovery.
            </p>
          </div>
        )}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-3 text-center" style={{ background: "rgba(255,255,255,0.04)" }}>
            <p className="text-xl font-black text-white">{totalSetsThisWeek}</p>
            <p className="text-[10px] text-white/35">Sets this week</p>
          </div>
          <div className="rounded-2xl p-3 text-center" style={{ background: "rgba(255,255,255,0.04)" }}>
            <p className="text-xl font-black text-white">{workouts.length}</p>
            <p className="text-[10px] text-white/35">Total sessions</p>
          </div>
        </div>
      </div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="ios-slide-up" style={{ animationDelay: "120ms" }}>
          <p className="text-[10px] uppercase tracking-widest mb-3 px-1 text-white/35">🏆 Achievements Unlocked</p>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
            {achievements.map((a, i) => (
              <div key={i} className="flex-shrink-0 rounded-2xl p-4 text-center w-28"
                style={{ background: "rgba(255,214,10,0.08)", border: "1px solid rgba(255,214,10,0.2)" }}>
                <p className="text-2xl mb-1">{a.icon}</p>
                <p className="text-xs font-black text-white leading-tight">{a.title}</p>
                <p className="text-[9px] mt-1 text-white/40">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Program Picker */}
      <div className="ios-slide-up" style={{ animationDelay: "160ms" }}>
        <p className="text-[10px] uppercase tracking-widest mb-3 px-1 text-white/35">Choose Your Program</p>
        <div className="grid grid-cols-2 gap-3">
          {PROGRAMS.map(p => (
            <button key={p.id} onClick={() => setSelectedProgram(p.id)}
              className="rounded-2xl p-4 text-left transition-all active:scale-95"
              style={selectedProgram === p.id
                ? { background: `${p.color}14`, border: `1.5px solid ${p.color}55`, boxShadow: `0 0 20px ${p.color}20` }
                : { background: "#1c1c1e", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{p.icon}</span>
                <div className="h-2 w-2 rounded-full" style={{ background: selectedProgram === p.id ? p.color : "rgba(255,255,255,0.1)" }} />
              </div>
              <p className="text-sm font-black text-white">{p.name}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{p.days} days/week · {p.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Weekly Plan */}
      {program && (
        <div className="ios-slide-up rounded-3xl overflow-hidden" style={{ background: "#1c1c1e", border: "1px solid rgba(255,255,255,0.06)", animationDelay: "200ms" }}>
          <div className="h-0.5" style={{ background: `linear-gradient(90deg,${program.color},transparent)` }} />
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] uppercase tracking-widest text-white/35">Your Week — {program.name}</p>
              <span className="text-xs font-black text-white/40">{program.days}×/week</span>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {program.schedule.map((s, i) => {
                const isToday = i === todayIdx;
                const isRest = s.focus === "Rest";
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <p className="text-[9px] font-bold uppercase" style={{ color: isToday ? program.color : "rgba(255,255,255,0.3)" }}>
                      {s.day}
                    </p>
                    <div className="w-full aspect-square rounded-xl flex items-center justify-center text-base transition"
                      style={{
                        background: isToday ? `${s.color}20` : isRest ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.06)",
                        border: isToday ? `1.5px solid ${s.color}60` : "1px solid rgba(255,255,255,0.06)",
                      }}>
                      {s.icon}
                    </div>
                    <p className="text-[8px] text-center leading-tight" style={{ color: isRest ? "rgba(255,255,255,0.2)" : isToday ? s.color : "rgba(255,255,255,0.5)" }}>
                      {s.focus}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Today's focus */}
            {program.schedule[todayIdx]?.focus !== "Rest" && (
              <div className="mt-4 rounded-2xl p-4 flex items-center gap-3"
                style={{ background: `${program.schedule[todayIdx].color}10`, border: `1px solid ${program.schedule[todayIdx].color}30` }}>
                <span className="text-2xl">{program.schedule[todayIdx].icon}</span>
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mb-0.5">Today's Training</p>
                  <p className="font-black text-white">{program.schedule[todayIdx].focus} Day</p>
                </div>
                <Link to="/templates"
                  className="rounded-xl px-4 py-2 text-xs font-black text-black transition"
                  style={{ background: `linear-gradient(135deg,${program.schedule[todayIdx].color},${program.schedule[todayIdx].color}bb)` }}>
                  Start →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Auto-Progression Tips */}
      <div className="ios-slide-up rounded-3xl p-5" style={{ background: "#1c1c1e", border: "1px solid rgba(255,255,255,0.06)", animationDelay: "240ms" }}>
        <p className="text-[10px] uppercase tracking-widest text-white/35 mb-4">🤖 Auto-Progression Rules</p>
        <div className="space-y-3">
          {[
            { icon: "⬆️", rule: "Add 2.5kg when you hit the top of your rep range for all sets" },
            { icon: "🔁", rule: "Repeat weight when you can't complete all reps" },
            { icon: "🔽", rule: "Drop weight 10% if you fail 2 sessions in a row" },
            { icon: "😴", rule: "Schedule a deload every 4–6 weeks (40% volume reduction)" },
          ].map((t, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-lg mt-0.5">{t.icon}</span>
              <p className="text-sm text-white/60 leading-relaxed">{t.rule}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
