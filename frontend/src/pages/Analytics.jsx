import { useEffect, useState } from "react";
import { getAnalytics } from "../api/habits";
import ContributionHeatmap from "../components/ContributionHeatmap";
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

export default function Analytics() {
  const [analytics, setAnalytics] = useState([]);
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
    } catch (err) {
      setError("Failed to load analytics. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
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
        <p>Performance intelligence for your daily systems</p>
      </div>

      {/* Contribution Heatmap */}
      <ContributionHeatmap />

      <div className="stat-cards-grid">
        {analytics.map((h) => (
          <div
            key={h.id}
            className="analytics-stat"
            style={{ borderLeft: `3px solid ${h.color}` }}
          >
            <div className="s-icon">{h.icon}</div>
            <div className="s-name">{h.name}</div>
            <div className="s-streak">🔥 {h.current_streak} day streak</div>
            <div className="s-total">
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
    </div>
  );
}
