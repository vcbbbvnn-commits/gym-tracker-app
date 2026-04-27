import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client";

// Simple Line Chart Component
function MiniLineChart({ data, color = "#22d3ee", height = 120 }) {
  if (!data || data.length < 2) {
    return (
      <div className="flex items-center justify-center rounded-2xl bg-white/5" style={{ height }}>
        <p className="text-xs text-gray-500">Not enough data for chart</p>
      </div>
    );
  }

  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const padding = 10;
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d.value - min) / range) * 80 - 10;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="relative w-full" style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible">
        {/* Gradient fill */}
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.2 }} />
            <stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} />
          </linearGradient>
        </defs>
        <path
          d={`M 0,100 L ${points} L 100,100 Z`}
          fill="url(#grad)"
        />
        {/* Line */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
          vectorEffect="non-scaling-stroke"
        />
        {/* Dots */}
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 100;
          const y = 100 - ((d.value - min) / range) * 80 - 10;
          return (
            <circle key={i} cx={x} cy={y} r="1.5" fill={color} />
          );
        })}
      </svg>
      {/* Labels */}
      <div className="absolute inset-x-0 bottom-0 flex justify-between px-1 pt-1 text-[8px] text-gray-500">
        <span>{new Date(data[0].date).toLocaleDateString([], {month:'short', day:'numeric'})}</span>
        <span>{new Date(data[data.length-1].date).toLocaleDateString([], {month:'short', day:'numeric'})}</span>
      </div>
    </div>
  );
}

function ProgressDetailPage() {
  const { exerciseName } = useParams();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/progress/history/${encodeURIComponent(exerciseName)}`);
        setHistory(res.data);
        setError(null);
      } catch (err) {
        setError("Failed to load exercise history");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (exerciseName) fetchData();
  }, [exerciseName]);

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="skeleton h-12 w-12 rounded-full" />
    </div>
  );

  const bestEver = history.length ? Math.max(...history.map(h => h.best_weight)) : 0;
  const totalVolumeEver = history.reduce((sum, h) => sum + h.total_volume, 0);
  const lastWeight = history.length ? history[history.length - 1].best_weight : 0;
  const firstWeight = history.length ? history[0].best_weight : 0;
  const totalChange = lastWeight - firstWeight;

  const chartData = history.map(h => ({ date: h.date, value: h.best_weight }));

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-20">
      {/* Header */}
      <div className="ios-slide-up flex items-center justify-between">
        <div>
          <Link to="/progress" className="text-xs font-bold text-gray-500 hover:text-white transition-colors">
            ← Back to Progress
          </Link>
          <h1 className="mt-2 text-4xl font-black uppercase text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            {exerciseName}
          </h1>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-gray-500">Total Entries</p>
          <p className="text-2xl font-black text-cyan-400">{history.length}</p>
        </div>
      </div>

      {/* Hero Chart Section */}
      <section className="ios-slide-up overflow-hidden rounded-3xl p-6" 
        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)", border: "1px solid rgba(255,255,255,0.08)", animationDelay: "100ms" }}>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-cyan-400/70">Weight Progression (kg)</p>
            <h2 className="text-3xl font-black text-white">
              {lastWeight} <span className="text-xs font-medium text-gray-500">kg</span>
            </h2>
          </div>
          <div className={`rounded-full px-3 py-1 text-xs font-bold ${totalChange >= 0 ? "bg-lime-400/10 text-lime-400" : "bg-red-400/10 text-red-400"}`}>
            {totalChange >= 0 ? "+" : ""}{totalChange} kg all-time
          </div>
        </div>
        
        <MiniLineChart data={chartData} color="#22d3ee" height={180} />
      </section>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="ios-slide-up rounded-3xl p-5" 
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", animationDelay: "200ms" }}>
          <p className="text-[10px] uppercase tracking-widest text-gray-500">Personal Record</p>
          <p className="mt-1 text-2xl font-black text-white">{bestEver} kg</p>
        </div>
        <div className="ios-slide-up rounded-3xl p-5" 
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", animationDelay: "300ms" }}>
          <p className="text-[10px] uppercase tracking-widest text-gray-500">Total Volume</p>
          <p className="mt-1 text-2xl font-black text-white">{(totalVolumeEver / 1000).toFixed(1)}t</p>
        </div>
      </div>

      {/* History Table */}
      <section className="ios-slide-up space-y-3" style={{ animationDelay: "400ms" }}>
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 px-2">History</h3>
        <div className="overflow-hidden rounded-3xl" style={{ border: "1px solid rgba(255,255,255,0.05)" }}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase text-[10px] tracking-widest">Date</th>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase text-[10px] tracking-widest">Best Weight</th>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase text-[10px] tracking-widest">Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[...history].reverse().map((h, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 text-white/80 font-medium">
                    {new Date(h.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-white font-black">{h.best_weight} kg</td>
                  <td className="px-6 py-4 text-gray-500">{h.total_volume} kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default ProgressDetailPage;
