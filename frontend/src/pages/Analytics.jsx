import { useEffect, useState } from "react";
import { getAnalytics, getWeeklyTrend } from "../api/habits";
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
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

export default function Analytics() {
  const [analytics, setAnalytics] = useState([]);
  const [weeklyTrend, setWeeklyTrend] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("completions");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setError(null);
      setLoading(true);
      const [analyticsData, trendData] = await Promise.all([
        getAnalytics(),
        getWeeklyTrend(),
      ]);
      setAnalytics(analyticsData);
      setWeeklyTrend(trendData);
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

  const visibleAnalytics = [...analytics]
    .filter((h) => {
      if (statusFilter === "on-track") return h.weekly_on_track;
      if (statusFilter === "off-track") return !h.weekly_on_track;
      return true;
    })
    .filter((h) => {
      if (categoryFilter === "all") return true;
      return (h.category || "General") === categoryFilter;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "streak") return b.current_streak - a.current_streak;
      return b.total_completions - a.total_completions;
    });
  const categories = [
    "all",
    ...new Set(analytics.map((h) => h.category || "General")),
  ];

  const barData = visibleAnalytics.map((h) => ({
    name: h.icon + " " + h.name,
    completions: h.total_completions,
    fill: h.color,
  }));
  const pieData = visibleAnalytics.map((h) => ({
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

      <div className="control-row">
        <div className="control-group">
          <label>Weekly Status</label>
          <select
            className="input control-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All habits</option>
            <option value="on-track">On track</option>
            <option value="off-track">Off track</option>
          </select>
        </div>

        <div className="control-group">
          <label>Sort</label>
          <select
            className="input control-input"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="completions">Most completions</option>
            <option value="streak">Highest streak</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>

        <div className="control-group">
          <label>Category</label>
          <select
            className="input control-input"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "all" ? "All categories" : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="stat-cards-grid">
        {visibleAnalytics.map((h) => (
          <div
            key={h.id}
            className="analytics-stat"
            style={{ borderLeft: `3px solid ${h.color}` }}
          >
            <div className="s-icon">{h.icon}</div>
            <div className="s-name">{h.name}</div>
            <div className="s-category">🏷️ {h.category || "General"}</div>
            <div className="s-streak">🔥 {h.current_streak} day streak</div>
            <div className="s-total">
              {h.total_completions} total completions
            </div>
            <div className="s-weekly">
              🎯 {h.weekly_completions}/{h.weekly_target} this week
            </div>
            <div className="s-weekly-meta">{h.weekly_progress_pct}% of target</div>
          </div>
        ))}
      </div>

      {visibleAnalytics.length === 0 && (
        <div className="empty">No habits match the selected filter.</div>
      )}

      <div className="chart-card">
        <h3>Weekly Momentum Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={weeklyTrend}>
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.12)" />
            <XAxis dataKey="week_label" tick={{ fontSize: 11 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="completed" name="Completed" fill="#4f7cff" radius={[6, 6, 0, 0]} />
            <Line
              type="monotone"
              dataKey="target"
              name="Target"
              stroke="#ffb347"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
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
