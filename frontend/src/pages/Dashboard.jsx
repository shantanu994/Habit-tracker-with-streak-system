import { useEffect, useState } from "react";
import { getTodayHabits, markComplete } from "../api/habits";

export default function Dashboard() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadHabits(); }, []);

  const loadHabits = async () => {
    const data = await getTodayHabits();
    setHabits(data);
    setLoading(false);
  };

  const handleToggle = async (id) => {
    await markComplete(id);
    loadHabits();
  };

  const completed = habits.filter(h => h.completed_today).length;
  const progress = habits.length ? Math.round((completed / habits.length) * 100) : 0;
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Good day! 👋</h1>
        <p>{today}</p>
      </div>

      <div className="progress-card">
        <div className="progress-info">
          <span>{completed} / {habits.length} habits done</span>
          <span>{progress}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="habits-list">
        {habits.length === 0 && (
          <div className="empty">No habits yet! Click ➕ Add Habit to start.</div>
        )}
        {habits.map(habit => (
          <div key={habit.id} className={`habit-card ${habit.completed_today ? "completed" : ""}`}
            style={{ borderLeft: `4px solid ${habit.color}` }}>
            <div className="habit-left">
              <button className="check-btn"
                style={{ background: habit.completed_today ? habit.color : "transparent", borderColor: habit.color }}
                onClick={() => handleToggle(habit.id)}>
                {habit.completed_today ? "✓" : ""}
              </button>
              <span className="habit-icon">{habit.icon}</span>
              <span className="habit-name">{habit.name}</span>
            </div>
            <div className="streak">🔥 {habit.streak}</div>
          </div>
        ))}
      </div>
    </div>
  );
}