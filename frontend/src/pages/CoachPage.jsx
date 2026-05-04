import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
  const [workouts, setWorkouts] = useState([]);
  const [bodyWeights, setBodyWeights] = useState([]);
  const [profile, setProfile] = useState(null);
  const [reminder, setReminder] = useState(() => localStorage.getItem("gym_training_reminder") || "18:00");
  const [effort, setEffort] = useState("normal");
  const [mealPlan, setMealPlan] = useState("");
  const [mealLoading, setMealLoading] = useState(false);

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

  const shareText = latest
    ? `Workout complete: ${latest.name}\nSets: ${latestSets}\nVolume: ${Math.round(latestVolume).toLocaleString()} kg\nStreak: ${streak.current} days`
    : "No workout completed yet.";

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      <div className="ios-slide-up">
        <span className="section-badge mb-3 inline-flex">Smart Coach</span>
        <h1 className="text-5xl font-black uppercase text-white md:text-7xl" style={{ fontFamily: "'Bebas Neue',sans-serif" }}>
          Coaching Hub
        </h1>
        <p className="mt-1 text-sm text-white/40">Recovery, streaks, diet, weekly planning, reminders, and workout adjustments.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <SmartCard title="Current streak" value={`${streak.current}d`} sub={`Longest streak: ${streak.longest} days`} color="#ff6b00" />
        <SmartCard title="Recovery score" value={recoveryScore} sub={recoveryScore > 70 ? "Ready to train hard." : "Control intensity today."} color={recoveryColor} />
        <SmartCard title="This week" value={workoutsThisWeek.length} sub={`${setsThisWeek} sets logged this week`} color="#0a84ff" />
        <SmartCard title="Body target" value={latestWeight ? `${latestWeight}kg` : "--"} sub={targetWeight ? `Goal: ${targetWeight}kg` : "Set goal in AI Coach"} color="#30d158" />
      </div>

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
