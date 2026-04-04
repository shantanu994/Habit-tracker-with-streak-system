import { useEffect, useState } from "react";
import { getAnalytics, getHeatmap } from "../api/habits";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

function buildHeatmap(logs) {
  const map = {};
  logs.forEach((l) => {
    map[l.date] = 1;
  });
  const grid = [];
  const today = new Date();
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split("T")[0];
    grid.push({ date: key, count: map[key] || 0 });
  }
  return grid;
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState([]);
  const [selected, setSelected] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await getAnalytics();
      setAnalytics(data);
      if (data.length > 0) {
        setSelected(data[0]);
        const logs = await getHeatmap(data[0].id);
        setHeatmap(buildHeatmap(logs));
      }
    } catch (err) {
      setError("Failed to load analytics. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (habit) => {
    try {
      setSelected(habit);
      const logs = await getHeatmap(habit.id);
      setHeatmap(buildHeatmap(logs));
    } catch (err) {
      setError("Failed to load habit details.");
      console.error(err);
    }
  };

  if (error)
    return (
      <div className="page">
        <div className="error-container">
          <h2>❌ Error</h2>
          <p>{error}</p>
          <button className="retry-btn" onClick={loadAnalytics}>
            🔄 Retry
          </button>
        </div>
      </div>
    );

  if (loading) return <div className="loading">⏳ Loading analytics...</div>;

  if (analytics.length === 0)
    return (
      <div className="page">
        <div className="page-header">
          <h1>📊 Analytics</h1>
          <p>Your habit performance</p>
        </div>
        <div className="empty">
          No habits yet! Create one to start tracking.
        </div>
      </div>
    );

  const barData = analytics.map((h) => ({
    name: h.icon + " " + h.name,
    completions: h.total_completions,
    fill: h.color,
  }));
  const pieData = analytics.map((h) => ({
    name: h.name,
    value: h.total_completions,
    color: h.color,
  }));

  return (
    <div className="page">
      <div className="page-header">
        <h1>📊 Analytics</h1>
        <p>Your habit performance</p>
      </div>

      <div className="stat-cards">
        {analytics.map((h) => (
          <div
            key={h.id}
            className="stat-card"
            style={{ borderTop: `3px solid ${h.color}` }}
          >
            <div className="stat-icon">{h.icon}</div>
            <div className="stat-name">{h.name}</div>
            <div className="stat-streak">🔥 {h.current_streak} day streak</div>
            <div className="stat-total">
              {h.total_completions} total completions
            </div>
          </div>
        ))}
      </div>

      <div className="chart-card">
        <h3>Total Completions per Habit</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={barData}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="completions">
              {barData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h3>Habit Distribution</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label
            >
              {pieData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h3>Consistency Heatmap (Last 90 Days)</h3>
        <div className="heatmap-selector">
          {analytics.map((h) => (
            <button
              key={h.id}
              className={`heatmap-btn ${selected?.id === h.id ? "active" : ""}`}
              style={{
                borderColor: h.color,
                background: selected?.id === h.id ? h.color : "transparent",
              }}
              onClick={() => handleSelect(h)}
            >
              {h.icon} {h.name}
            </button>
          ))}
        </div>
        <div className="heatmap-grid">
          {heatmap.map((cell, i) => (
            <div
              key={i}
              className="heatmap-cell"
              title={cell.date}
              style={{
                background: cell.count ? selected?.color : "#1e1e2e",
                opacity: cell.count ? 1 : 0.3,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
