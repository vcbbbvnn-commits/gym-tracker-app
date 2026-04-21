import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

function ProgressDetailPage() {
  const { exerciseName } = useParams();
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchComparison = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/progress/weekly/${exerciseName}`);
        setComparison(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to load progress data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (exerciseName) {
      fetchComparison();
    }
  }, [exerciseName]);

  const formatChange = (change) => {
    if (change === 0) return "No change";
    const symbol = change > 0 ? "↑" : "↓";
    const color = change > 0 ? "text-lime-400" : "text-coral";
    return `${symbol} ${Math.abs(change).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="panel animate-fade-up px-8 py-12 text-center">
        <p className="text-slate-300">Loading progress data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel animate-fade-up border-coral/50 bg-coral/10 px-8 py-6">
        <p className="text-coral">{error}</p>
      </div>
    );
  }

  if (!comparison) {
    return (
      <div className="panel animate-fade-up px-8 py-12 text-center">
        <p className="text-slate-300">No data available</p>
      </div>
    );
  }

  const {
    exercise_name,
    current_week,
    previous_week,
    improvement,
  } = comparison;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="panel animate-fade-up px-8 py-8">
        <h2 className="font-display text-3xl text-sand">{exercise_name}</h2>
        <p className="mt-2 text-slate-300">Weekly Progress Comparison</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Current Week */}
        <div className="panel px-8 py-6">
          <h3 className="font-display text-xl text-cyanGlow">This Week</h3>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-300">Total Sets</span>
              <span className="font-semibold text-sand">
                {current_week.total_sets}
              </span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-3">
              <span className="text-slate-300">Best Weight</span>
              <span className="font-semibold text-sand">
                {current_week.best_weight.toFixed(1)} lbs
              </span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-3">
              <span className="text-slate-300">Total Volume</span>
              <span className="font-semibold text-sand">
                {current_week.total_volume.toFixed(0)} lbs
              </span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-3">
              <span className="text-slate-300">Avg Reps</span>
              <span className="font-semibold text-sand">
                {current_week.avg_reps.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Previous Week */}
        <div className="panel px-8 py-6">
          <h3 className="font-display text-xl text-slate-400">Last Week</h3>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-300">Total Sets</span>
              <span className="font-semibold text-slate-300">
                {previous_week.total_sets}
              </span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-3">
              <span className="text-slate-300">Best Weight</span>
              <span className="font-semibold text-slate-300">
                {previous_week.best_weight.toFixed(1)} lbs
              </span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-3">
              <span className="text-slate-300">Total Volume</span>
              <span className="font-semibold text-slate-300">
                {previous_week.total_volume.toFixed(0)} lbs
              </span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-3">
              <span className="text-slate-300">Avg Reps</span>
              <span className="font-semibold text-slate-300">
                {previous_week.avg_reps.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Improvement Metrics */}
      <div className="panel px-8 py-6">
        <h3 className="font-display text-xl text-cyanGlow">Improvement</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white/5 p-4">
            <p className="text-sm text-slate-400">Sets Improvement</p>
            <p
              className={`mt-2 font-display text-2xl ${
                improvement.sets_change_percent > 0
                  ? "text-lime-400"
                  : "text-coral"
              }`}
            >
              {formatChange(improvement.sets_change_percent)}
            </p>
          </div>
          <div className="rounded-lg bg-white/5 p-4">
            <p className="text-sm text-slate-400">Weight Improvement</p>
            <p
              className={`mt-2 font-display text-2xl ${
                improvement.weight_change_percent > 0
                  ? "text-lime-400"
                  : "text-coral"
              }`}
            >
              {formatChange(improvement.weight_change_percent)}
            </p>
          </div>
          <div className="rounded-lg bg-white/5 p-4">
            <p className="text-sm text-slate-400">Volume Improvement</p>
            <p
              className={`mt-2 font-display text-2xl ${
                improvement.volume_change_percent > 0
                  ? "text-lime-400"
                  : "text-coral"
              }`}
            >
              {formatChange(improvement.volume_change_percent)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProgressDetailPage;
