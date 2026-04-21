import { useEffect, useState } from "react";
import api from "../api/client";
import { useNavigate } from "react-router-dom";

const categoryColors = {
  Strength: "#f97316",
  Hypertrophy: "#a78bfa",
  Cardio: "#34d399",
  Flexibility: "#60a5fa",
  HIIT: "#f472b6",
  Default: "#fbbf24",
};

const categoryIcons = {
  Strength: "🏋️",
  Hypertrophy: "💪",
  Cardio: "🏃",
  Flexibility: "🧘",
  HIIT: "⚡",
  Default: "🔥",
};

function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
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

  const categories = [...new Set(templates.map((t) => t.category))];
  const filteredTemplates = selectedCategory
    ? templates.filter((t) => t.category === selectedCategory)
    : templates;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="animate-fade-up" style={{ opacity: 0 }}>
        <span className="section-badge mb-3 inline-flex">Programs</span>
        <h1
          className="text-4xl font-bold text-white"
          style={{ fontFamily: "'Bebas Neue', 'Space Grotesk', sans-serif", letterSpacing: "0.04em" }}
        >
          WORKOUT TEMPLATES
        </h1>
        <p className="mt-2 text-gray-500">
          Pre-built programs crafted by elite coaches. Use them directly.
        </p>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div
          className="animate-fade-up rounded-2xl px-6 py-4"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            animationDelay: "100ms",
            opacity: 0,
          }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 text-xs font-bold uppercase tracking-wider text-gray-600">Filter:</span>
            <button
              onClick={() => setSelectedCategory(null)}
              className="rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 hover:scale-105"
              style={
                selectedCategory === null
                  ? {
                      background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                      color: "white",
                      boxShadow: "0 4px 15px rgba(249,115,22,0.35)",
                    }
                  : {
                      background: "rgba(255,255,255,0.06)",
                      color: "rgba(255,255,255,0.6)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }
              }
            >
              All
            </button>
            {categories.map((category) => {
              const color = categoryColors[category] || categoryColors.Default;
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className="rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 hover:scale-105"
                  style={
                    isActive
                      ? {
                          background: `${color}25`,
                          color: color,
                          border: `1px solid ${color}50`,
                          boxShadow: `0 4px 15px ${color}20`,
                        }
                      : {
                          background: "rgba(255,255,255,0.06)",
                          color: "rgba(255,255,255,0.6)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }
                  }
                >
                  {categoryIcons[category] || "🔥"} {category}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Content */}
      {loading && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton h-72 rounded-3xl" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div
          className="rounded-2xl px-6 py-5 text-sm"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}
        >
          {error}
        </div>
      )}

      {!loading && !error && filteredTemplates.length === 0 && (
        <div
          className="flex flex-col items-center justify-center rounded-3xl py-24 text-center"
          style={{ background: "rgba(255,255,255,0.02)", border: "2px dashed rgba(255,255,255,0.08)" }}
        >
          <div className="mb-4 text-5xl">📋</div>
          <h3 className="mb-2 text-lg font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            No templates found
          </h3>
          <p className="text-sm text-gray-500">Try a different category filter</p>
        </div>
      )}

      {!loading && !error && filteredTemplates.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template, idx) => {
            const color = categoryColors[template.category] || categoryColors.Default;
            const icon = categoryIcons[template.category] || "🔥";

            return (
              <div
                key={template.id}
                className="animate-fade-up group relative overflow-hidden rounded-3xl transition-all duration-500 hover:-translate-y-3"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
                  animationDelay: `${idx * 80}ms`,
                  opacity: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${color}40`;
                  e.currentTarget.style.boxShadow = `0 25px 60px rgba(0,0,0,0.5), 0 0 40px ${color}12`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.boxShadow = "0 10px 40px rgba(0,0,0,0.4)";
                }}
              >
                {/* Top color band */}
                <div
                  className="h-1 w-full"
                  style={{ background: `linear-gradient(90deg, ${color} 0%, ${color}60 100%)` }}
                />

                {/* Background glow on hover */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(circle at 70% 20%, ${color}08 0%, transparent 60%)`,
                  }}
                />

                <div className="relative p-7">
                  {/* Category badge */}
                  <div className="mb-5 flex items-center justify-between">
                    <div
                      className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold"
                      style={{ background: `${color}18`, color: color, border: `1px solid ${color}35` }}
                    >
                      <span>{icon}</span>
                      {template.category}
                    </div>
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-sm"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      📋
                    </div>
                  </div>

                  {/* Name */}
                  <h3
                    className="mb-2 text-xl font-bold text-white"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {template.name}
                  </h3>

                  {/* Description */}
                  <p className="mb-5 text-sm leading-relaxed text-gray-500 line-clamp-2">
                    {template.description}
                  </p>

                  {/* Meta */}
                  <div
                    className="mb-5 flex items-center gap-4 rounded-xl px-4 py-3"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <div className="text-center">
                      <p
                        className="text-lg font-bold text-white"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {template.exercises.length}
                      </p>
                      <p className="text-xs text-gray-600">exercises</p>
                    </div>
                    <div
                      style={{ width: "1px", height: "30px", background: "rgba(255,255,255,0.06)" }}
                    />
                    <div className="text-center">
                      <p
                        className="text-lg font-bold text-white"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {template.duration_days}
                      </p>
                      <p className="text-xs text-gray-600">day cycle</p>
                    </div>
                  </div>

                  {/* Exercise preview */}
                  <div className="mb-6 space-y-1.5">
                    {template.exercises.slice(0, 3).map((exercise, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                        <span style={{ color: color, fontSize: "8px" }}>●</span>
                        {exercise.name}
                      </div>
                    ))}
                    {template.exercises.length > 3 && (
                      <p className="text-xs text-gray-600">
                        +{template.exercises.length - 3} more exercises
                      </p>
                    )}
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => handleUseTemplate(template.id)}
                    disabled={usingId === template.id}
                    className="w-full rounded-2xl py-3 text-sm font-bold uppercase tracking-wider text-white transition-all duration-300 hover:scale-105 disabled:opacity-60"
                    style={{
                      background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
                      boxShadow: `0 6px 20px ${color}30`,
                      letterSpacing: "0.08em",
                    }}
                  >
                    {usingId === template.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Loading...
                      </span>
                    ) : (
                      "Use This Template"
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TemplatesPage;
