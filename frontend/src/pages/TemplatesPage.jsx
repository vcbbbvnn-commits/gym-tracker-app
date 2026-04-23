import { useEffect, useState } from "react";
import api from "../api/client";
import { useNavigate } from "react-router-dom";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingId, setUsingId] = useState(null);
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

  const handleUseTemplate = async (templateId) => {
    setUsingId(templateId);
    try {
      const response = await api.post(`/templates/use/${templateId}`);
      navigate(`/workouts/${response.data.workout_id}`);
    } catch (err) {
      console.error("Failed to create workout from template", err);
      alert("Failed to create workout. Please try again.");
    } finally {
      setUsingId(null);
    }
  };

  const getDayFocus = (exercises) => {
    if (!exercises || exercises.length === 0) return "OFF";
    // Try to guess focus from exercise names
    const names = exercises.map(e => e.name.toLowerCase()).join(" ");
    if (names.includes("chest") || names.includes("bench")) return "CHEST";
    if (names.includes("back") || names.includes("row") || names.includes("lat")) return "BACK";
    if (names.includes("shoulder") || names.includes("press") || names.includes("lateral")) return "SHOULDERS";
    if (names.includes("leg") || names.includes("squat") || names.includes("deadlift")) return "LEGS";
    if (names.includes("bicep") || names.includes("curl")) return "BICEPS";
    if (names.includes("tricep") || names.includes("pushdown") || names.includes("skull")) return "TRICEPS";
    return "TRAIN";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-12 pt-8 text-white">
      <div className="mx-auto max-w-[1400px] px-4">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-2 text-6xl font-black italic tracking-tighter text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            ELITE TRAINING PROGRAMS
          </h1>
          <p className="text-gray-400">Select a split to view your 7-day schedule</p>
        </div>

        {error && (
          <div className="mb-8 rounded-xl bg-red-500/10 p-4 text-center text-red-500 border border-red-500/20">
            {error}
          </div>
        )}

        <div className="space-y-24">
          {templates.map((template) => (
            <div key={template.id} className="animate-fade-up">
              {/* Template Title */}
              <div className="mb-6 flex items-end justify-between border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-4xl font-bold uppercase tracking-tight text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {template.name}
                  </h2>
                  <p className="mt-1 text-gray-500">{template.description}</p>
                </div>
                <button
                  onClick={() => handleUseTemplate(template.id)}
                  disabled={usingId === template.id}
                  className="rounded-full bg-orange-600 px-8 py-3 font-bold uppercase tracking-widest text-white transition-all hover:bg-orange-500 hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {usingId === template.id ? "Initializing..." : "START PROGRAM"}
                </button>
              </div>

              {/* 7-Day Schedule Grid */}
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
                {daysOfWeek.map((dayName, index) => {
                  const dayNum = index + 1;
                  const dayExercises = template.exercises.filter(e => e.day_number === dayNum);
                  const focus = getDayFocus(dayExercises);
                  const isOff = focus === "OFF";

                  return (
                    <div 
                      key={dayName} 
                      className={`relative flex flex-col overflow-hidden border border-white/5 transition-all duration-300 hover:border-white/20 ${isOff ? 'bg-red-950/10' : 'bg-white/[0.02]'}`}
                      style={{ minHeight: '400px' }}
                    >
                      {/* Day Header */}
                      <div className="border-b border-white/5 bg-black/40 py-3 text-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                          {dayName}
                        </span>
                      </div>

                      {/* Focus Badge */}
                      <div className={`py-8 text-center transition-all ${isOff ? 'text-red-600' : 'text-white'}`}>
                        <h3 className="text-2xl font-black italic tracking-tighter" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                          {focus}
                        </h3>
                      </div>

                      {/* Exercises List */}
                      <div className="flex-1 px-4 pb-6">
                        <div className="space-y-4">
                          {dayExercises.sort((a, b) => a.order - b.order).map((exercise) => (
                            <div key={exercise.id} className="group flex flex-col">
                              <span className="text-[11px] font-bold text-white/90 leading-tight">
                                {exercise.name}
                              </span>
                              <span className="mt-1 text-[9px] font-medium text-gray-500 uppercase tracking-wider">
                                {exercise.recommended_sets} Sets • {exercise.recommended_reps} Reps
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Red Highlight for OFF days like in the image */}
                      {isOff && (
                        <div className="absolute inset-0 pointer-events-none border-b-4 border-red-600/30 opacity-50"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TemplatesPage;
