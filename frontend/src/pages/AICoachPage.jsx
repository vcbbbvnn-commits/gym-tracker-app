import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const AI_ENDPOINT = "https://text.pollinations.ai/";

const SUGGESTIONS = [
  "What should I train today?",
  "Am I overtraining?",
  "How do I progress on bench press?",
  "Give me a warm-up routine",
  "What should I eat for my goal?",
  "Should I do cardio on rest days?",
  "What's my weakest muscle group?",
  "Adjust my plan for this week",
];

const GOALS = [
  { id: "gain", label: "Gain weight", desc: "Build muscle with a controlled surplus." },
  { id: "loss", label: "Lose weight", desc: "Cut fat while keeping strength." },
  { id: "recomp", label: "Recompose", desc: "Build muscle and slowly lean out." },
];

const BODY_TYPES = [
  { id: "lean", label: "Lean", desc: "Naturally slim or hard to gain." },
  { id: "average", label: "Average", desc: "Balanced frame and recovery." },
  { id: "broad", label: "Broad", desc: "Carries size or weight easily." },
];

const EXPERIENCE = [
  { id: "beginner", label: "Beginner", desc: "0-6 months of training." },
  { id: "intermediate", label: "Intermediate", desc: "6+ months, knows the basics." },
  { id: "advanced", label: "Advanced", desc: "Consistent lifter chasing details." },
];

const TRAINING_DAYS = [3, 4, 5, 6];

const FALLBACK_PLANS = {
  gain: {
    title: "Lean Muscle Builder",
    summary: "Train 4-5 days, focus on progressive overload, and eat in a small calorie surplus.",
    split: ["Upper strength", "Lower strength", "Rest or mobility", "Push hypertrophy", "Pull + legs", "Rest", "Rest"],
    nutrition: "Aim for 1.6-2.2g protein per kg bodyweight and add 250-350 calories above maintenance.",
  },
  loss: {
    title: "Strength Cut Plan",
    summary: "Lift 3-4 days, keep heavy compounds, add low-impact cardio, and use a steady calorie deficit.",
    split: ["Full body", "Cardio + core", "Upper", "Rest", "Lower", "Zone 2 cardio", "Rest"],
    nutrition: "Keep protein high at 1.8-2.2g per kg and use a 300-500 calorie deficit.",
  },
  recomp: {
    title: "Recomposition Plan",
    summary: "Train 4 days, push key lifts, keep calories near maintenance, and track waist plus strength.",
    split: ["Upper", "Lower", "Rest", "Push", "Pull + legs", "Rest", "Rest"],
    nutrition: "Eat near maintenance with high protein and place most carbs around workouts.",
  },
};

function getProfileKey(user) {
  return `gym_ai_profile_${user?.id || user?.email || "guest"}`;
}

function getPlanKey(user) {
  return `gym_ai_plan_${user?.id || user?.email || "guest"}`;
}

function makeFallbackPlan(profile) {
  const base = FALLBACK_PLANS[profile.goal] || FALLBACK_PLANS.recomp;
  const weeklyDays = Number(profile.trainingDays || 4);
  const split = base.split.map((day, index) => {
    if (index >= weeklyDays && !day.toLowerCase().includes("rest")) return "Rest or light cardio";
    return day;
  });

  return [
    `**${base.title}**`,
    base.summary,
    "",
    `**Profile:** ${profile.currentWeight}kg now, target ${profile.targetWeight}kg, ${profile.bodyType} body type, ${profile.experience} level.`,
    `**Weekly split:** ${split.join(" | ")}`,
    `**Nutrition:** ${base.nutrition}`,
    "**Progression:** When all sets hit the top of the rep range, add 2.5kg next time. If recovery drops, reduce volume for one week.",
  ].join("\n");
}

function TypingDots() {
  return (
    <div className="flex items-end gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-2 w-2 animate-bounce rounded-full"
          style={{ background: "#ff6b00", animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}

function MarkdownText({ content, isUser }) {
  return content.split("\n").map((line, i) => (
    <span key={`${line}-${i}`}>
      {line.split(/\*\*(.*?)\*\*/g).map((part, j) =>
        j % 2 === 1 ? (
          <strong key={`${part}-${j}`} style={{ color: isUser ? "#000" : "#ff9500" }}>
            {part}
          </strong>
        ) : (
          part
        )
      )}
      {i < content.split("\n").length - 1 && <br />}
    </span>
  ));
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {!isUser && (
        <div
          className="mb-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-black"
          style={{ background: "linear-gradient(135deg,#ff6b00,#ff375f)" }}
        >
          AI
        </div>
      )}
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser ? "rounded-br-sm" : "rounded-bl-sm"
        }`}
        style={
          isUser
            ? { background: "linear-gradient(135deg,#ff6b00,#ff9500)", color: "#000", fontWeight: 650 }
            : { background: "#2c2c2e", color: "rgba(255,255,255,0.88)", border: "0.5px solid rgba(255,255,255,0.08)" }
        }
      >
        <MarkdownText content={msg.content} isUser={isUser} />
      </div>
    </div>
  );
}

function OptionGroup({ title, options, value, onChange }) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/35">{title}</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {options.map((option) => {
          const active = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className="rounded-2xl p-3 text-left transition active:scale-[0.98]"
              style={
                active
                  ? { background: "rgba(255,107,0,0.14)", border: "1.5px solid rgba(255,107,0,0.55)" }
                  : { background: "#1c1c1e", border: "1px solid rgba(255,255,255,0.08)" }
              }
            >
              <p className="text-sm font-black text-white">{option.label}</p>
              <p className="mt-1 text-xs leading-5 text-white/40">{option.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Onboarding({ user, onComplete, onSkip }) {
  const [form, setForm] = useState({
    currentWeight: "",
    targetWeight: "",
    goal: "gain",
    bodyType: "average",
    experience: "beginner",
    trainingDays: 4,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const displayName = user?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Athlete";

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const currentWeight = Number(form.currentWeight);
    const targetWeight = Number(form.targetWeight);
    if (!currentWeight || currentWeight < 25 || currentWeight > 300) {
      setError("Enter a realistic current weight in kg.");
      return;
    }
    if (!targetWeight || targetWeight < 25 || targetWeight > 300) {
      setError("Enter a realistic target weight in kg.");
      return;
    }

    setLoading(true);
    const profile = {
      ...form,
      currentWeight,
      targetWeight,
      createdAt: new Date().toISOString(),
      skipped: false,
    };

    try {
      api.post("/body-weight", { weight_kg: currentWeight }).catch(() => {});

      const prompt = `Create a concise personalized gym plan for this user:
- Current weight: ${currentWeight}kg
- Target weight: ${targetWeight}kg
- Goal: ${form.goal}
- Body type: ${form.bodyType}
- Experience: ${form.experience}
- Training days per week: ${form.trainingDays}

Return a practical plan with title, weekly split, training focus, nutrition target, cardio/recovery advice, and progression rules. Keep it under 180 words. Use **bold** for section labels.`;

      const response = await fetch(AI_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          model: "openai",
          private: true,
        }),
      });

      const aiPlan = (await response.text()).trim();
      onComplete(profile, aiPlan || makeFallbackPlan(profile));
    } catch {
      onComplete(profile, makeFallbackPlan(profile));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl pb-10 text-white">
      <section className="mb-6">
        <span className="section-badge mb-4 inline-flex">AI onboarding</span>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-5xl font-black uppercase md:text-7xl" style={{ fontFamily: "'Bebas Neue',sans-serif" }}>
              Build your plan
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
              {displayName}, answer a few quick questions and AI Coach will create a training plan around your weight,
              goal, body type, and weekly schedule.
            </p>
          </div>
          <button
            type="button"
            onClick={onSkip}
            className="rounded-2xl px-5 py-3 text-sm font-black uppercase tracking-wider transition hover:bg-white/10"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.65)" }}
          >
            Skip to splits
          </button>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="rounded-3xl p-5 sm:p-6" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-white/35" htmlFor="currentWeight">
              Current weight (kg)
            </label>
            <input
              id="currentWeight"
              type="number"
              min="25"
              max="300"
              step="0.1"
              value={form.currentWeight}
              onChange={(e) => update("currentWeight", e.target.value)}
              className="input-field"
              placeholder="72"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-white/35" htmlFor="targetWeight">
              Target weight (kg)
            </label>
            <input
              id="targetWeight"
              type="number"
              min="25"
              max="300"
              step="0.1"
              value={form.targetWeight}
              onChange={(e) => update("targetWeight", e.target.value)}
              className="input-field"
              placeholder="78"
              required
            />
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <OptionGroup title="Main goal" options={GOALS} value={form.goal} onChange={(value) => update("goal", value)} />
          <OptionGroup title="Body type" options={BODY_TYPES} value={form.bodyType} onChange={(value) => update("bodyType", value)} />
          <OptionGroup title="Training level" options={EXPERIENCE} value={form.experience} onChange={(value) => update("experience", value)} />

          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/35">Training days per week</p>
            <div className="grid grid-cols-4 gap-2">
              {TRAINING_DAYS.map((days) => {
                const active = Number(form.trainingDays) === days;
                return (
                  <button
                    key={days}
                    type="button"
                    onClick={() => update("trainingDays", days)}
                    className="min-h-12 rounded-2xl text-sm font-black transition active:scale-[0.98]"
                    style={active ? { background: "#ff6b00", color: "#000" } : { background: "#1c1c1e", color: "rgba(255,255,255,0.5)" }}
                  >
                    {days} days
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl px-4 py-3 text-sm" style={{ background: "rgba(255,55,95,0.1)", border: "1px solid rgba(255,55,95,0.25)", color: "#ff375f" }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-fire mt-6 w-full justify-center py-4 text-base font-black">
          {loading ? "Creating your plan..." : "Generate my AI plan"}
        </button>
      </form>
    </div>
  );
}

export default function AICoachPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [customPlan, setCustomPlan] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [workoutContext, setWorkoutContext] = useState("");
  const [contextLoaded, setContextLoaded] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const profileKey = useMemo(() => getProfileKey(user), [user]);
  const planKey = useMemo(() => getPlanKey(user), [user]);

  useEffect(() => {
    const savedProfile = localStorage.getItem(profileKey);
    const savedPlan = localStorage.getItem(planKey);
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setProfile(parsed);
      setCustomPlan(savedPlan || "");
      setShowOnboarding(!parsed.skipped && !savedPlan);
    } else {
      setShowOnboarding(true);
    }
  }, [profileKey, planKey]);

  useEffect(() => {
    if (showOnboarding) return;

    const greeting = customPlan
      ? `Your **AI custom plan** is ready.\n\n${customPlan}\n\nAsk me to adjust it anytime based on soreness, equipment, schedule, or progress.`
      : "Hey! I'm your **AI Gym Coach**. I can help with training advice, recovery, form cues, and progression. You can also generate a custom AI plan here whenever you want.";

    setMessages([{ role: "assistant", content: greeting }]);
  }, [showOnboarding, customPlan]);

  useEffect(() => {
    Promise.all([
      api.get("/workouts").catch(() => ({ data: [] })),
      api.get("/progress/exercises").catch(() => ({ data: [] })),
      api.get("/body-weight").catch(() => ({ data: [] })),
    ]).then(([workoutsRes, progressRes, bwRes]) => {
      const workouts = workoutsRes.data || [];
      const progress = progressRes.data || [];
      const bodyWeights = bwRes.data || [];
      const totalWorkouts = workouts.length;
      const totalSets = workouts.reduce((t, w) => t + (w.exercises?.reduce((e, ex) => e + ex.sets.length, 0) || 0), 0);
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const thisWeek = workouts.filter((w) => w.created_at && new Date(w.created_at).getTime() > weekAgo);
      const topLifts = progress
        .slice()
        .sort((a, b) => b.best_weight - a.best_weight)
        .slice(0, 6)
        .map((e) => `${e.exercise_name}: ${e.best_weight}kg (${e.total_sets} sets total)`)
        .join(", ");
      const latestBW = bodyWeights.length ? bodyWeights[bodyWeights.length - 1].weight_kg : null;

      setWorkoutContext(`User's gym stats:
- Total workouts logged: ${totalWorkouts}
- Total sets logged: ${totalSets}
- Workouts this week: ${thisWeek.length}
- Recent splits trained: ${[...new Set(thisWeek.map((w) => w.name))].join(", ") || "none this week"}
- Top lifts: ${topLifts || "no lifts logged yet"}
- Current bodyweight: ${latestBW ? `${latestBW}kg` : "not logged"}`);
      setContextLoaded(true);
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const completeOnboarding = (nextProfile, plan) => {
    localStorage.setItem(profileKey, JSON.stringify(nextProfile));
    localStorage.setItem(planKey, plan);
    setProfile(nextProfile);
    setCustomPlan(plan);
    setShowOnboarding(false);
  };

  const skipOnboarding = () => {
    localStorage.setItem(profileKey, JSON.stringify({ skipped: true, createdAt: new Date().toISOString() }));
    setProfile({ skipped: true });
    setShowOnboarding(false);
    navigate("/templates");
  };

  const resetPlan = () => {
    localStorage.removeItem(profileKey);
    localStorage.removeItem(planKey);
    setProfile(null);
    setCustomPlan("");
    setShowOnboarding(true);
  };

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    setInput("");

    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const profileContext = profile?.skipped
        ? "The user skipped AI onboarding and may be following built-in splits."
        : `AI onboarding profile: ${JSON.stringify(profile || {})}
Custom AI plan:
${customPlan || "No custom plan generated yet."}`;

      const systemPrompt = `You are an expert personal trainer inside a gym tracking app. Give specific, practical advice in 3-5 sentences unless the user asks for a plan. Use **bold** for key labels.

${profileContext}

${workoutContext}

If advice could be risky, recommend conservative progression and rest. Do not diagnose medical issues.`;

      const response = await fetch(AI_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            ...newMessages.map((m) => ({ role: m.role, content: m.content })),
          ],
          model: "openai",
          private: true,
        }),
      });

      const reply = await response.text();
      setMessages((prev) => [...prev, { role: "assistant", content: reply.trim() || "I could not generate a response right now." }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I could not connect right now. Check your internet and try again.",
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  if (showOnboarding) {
    return <Onboarding user={user} onComplete={completeOnboarding} onSkip={skipOnboarding} />;
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col" style={{ height: "calc(100vh - 130px)" }}>
      <div className="flex flex-shrink-0 items-center justify-between gap-3 pb-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-black"
            style={{ background: "linear-gradient(135deg,#ff6b00,#ff375f)", boxShadow: "0 4px 16px rgba(255,107,0,0.4)" }}
          >
            AI
          </div>
          <div>
            <h1 className="text-lg font-black text-white">AI Gym Coach</h1>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: "#30d158" }} />
              <p className="text-[11px] text-white/40">{contextLoaded ? "Workout data loaded" : "Loading your data..."}</p>
            </div>
          </div>
        </div>
        <button type="button" onClick={resetPlan} className="rounded-xl px-3 py-2 text-xs font-black text-white/50 transition hover:bg-white/10">
          New plan
        </button>
      </div>

      {profile?.skipped && (
        <div className="mb-4 rounded-2xl p-4 text-sm text-white/55" style={{ background: "#1c1c1e", border: "1px solid rgba(255,255,255,0.08)" }}>
          You skipped setup and can follow the built-in splits. <Link to="/templates" className="font-black" style={{ color: "#ff9500" }}>Open programs</Link> or create an AI plan anytime.
        </div>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto pb-4" style={{ scrollbarWidth: "none" }}>
        {messages.map((msg, i) => (
          <Message key={`${msg.role}-${i}`} msg={msg} />
        ))}
        {loading && (
          <div className="flex items-end gap-2">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-black" style={{ background: "linear-gradient(135deg,#ff6b00,#ff375f)" }}>
              AI
            </div>
            <div className="rounded-2xl rounded-bl-sm" style={{ background: "#2c2c2e", border: "0.5px solid rgba(255,255,255,0.08)" }}>
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length <= 1 && (
        <div className="flex flex-shrink-0 gap-2 overflow-x-auto pb-3" style={{ scrollbarWidth: "none" }}>
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => sendMessage(suggestion)}
              className="flex-shrink-0 rounded-2xl px-3 py-2 text-xs font-bold transition hover:opacity-80"
              style={{ background: "rgba(255,107,0,0.1)", color: "#ff9500", border: "1px solid rgba(255,107,0,0.25)" }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-shrink-0 gap-2 pt-2">
        <textarea
          ref={inputRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask your AI coach anything..."
          className="flex-1 resize-none rounded-2xl px-4 py-3 text-sm text-white outline-none transition"
          style={{ background: "#1c1c1e", border: "1px solid rgba(255,255,255,0.1)", maxHeight: "100px" }}
          onFocus={(e) => {
            e.target.style.borderColor = "rgba(255,107,0,0.5)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "rgba(255,255,255,0.1)";
          }}
        />
        <button
          type="button"
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center self-end rounded-2xl text-lg transition-all active:scale-90 disabled:opacity-30"
          style={{ background: "linear-gradient(135deg,#ff6b00,#ff9500)", boxShadow: input.trim() ? "0 4px 16px rgba(255,107,0,0.4)" : "none" }}
        >
          {loading ? "..." : "^"}
        </button>
      </div>
    </div>
  );
}
