import { useEffect, useState, useRef } from "react";
import { getTodayHabits, markComplete } from "../api/habits";
import { playCheck, playUncheck, playAllDone } from "../sounds";
import { getRandomQuote } from "../quotes";
import confetti from "canvas-confetti";

export default function Dashboard() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState(getRandomQuote());
  const [animatingId, setAnimatingId] = useState(null);
  const [allDoneShown, setAllDoneShown] = useState(false);
  const prevCompleted = useRef(0);

  useEffect(() => { loadHabits(); }, []);

  const loadHabits = async () => {
    const data = await getTodayHabits();
    setHabits(data);
    setLoading(false);
  };

  const handleToggle = async (id, wasCompleted) => {
    // Animate the card
    setAnimatingId(id);
    setTimeout(() => setAnimatingId(null), 400);

    // Play sound
    if (wasCompleted) playUncheck();
    else playCheck();

    await markComplete(id);
    const updated = await getTodayHabits();
    setHabits(updated);

    // Check if all done
    const completedNow = updated.filter(h => h.completed_today).length;
    if (completedNow === updated.length && updated.length > 0 && !allDoneShown) {
      setAllDoneShown(true);
      setQuote("🎉 ALL HABITS DONE! You're on fire today!");
      playAllDone();
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#ec4899', '#f59e0b', '#10b981']
      });
    } else if (completedNow < updated.length) {
      setAllDoneShown(false);
      setQuote(getRandomQuote());
    }
    prevCompleted.current = completedNow;
  };

  const completed = habits.filter(h => h.completed_today).length;
  const progress = habits.length ? Math.round((completed / habits.length) * 100) : 0;
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const allDone = habits.length > 0 && completed === habits.length;

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Good day! 👋</h1>
        <p>{today}</p>
      </div>

      {/* Motivational Quote */}
      <div className={`quote-card ${allDone ? "quote-celebration" : ""}`}>
        <span>💬</span> {quote}
      </div>

      {/* Progress Bar */}
      <div className="progress-card">
        <div className="progress-info">
          <span>{completed} / {habits.length} habits done</span>
          <span>{progress}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Habits List */}
      <div className="habits-list">
        {habits.length === 0 && (
          <div className="empty">No habits yet! Click ➕ Add Habit to start.</div>
        )}
        {habits.map(habit => (
          <div
            key={habit.id}
            className={`habit-card 
              ${habit.completed_today ? "completed" : ""} 
              ${animatingId === habit.id ? "pop" : ""}`}
            style={{ borderLeft: `4px solid ${habit.color}` }}
          >
            <div className="habit-left">
              <button
                className="check-btn"
                style={{
                  background: habit.completed_today ? habit.color : "transparent",
                  borderColor: habit.color
                }}
                onClick={() => handleToggle(habit.id, habit.completed_today)}
              >
                {habit.completed_today ? "✓" : ""}
              </button>
              <span className="habit-icon">{habit.icon}</span>
              <span className="habit-name">{habit.name}</span>
            </div>
            <div className="streak">🔥 {habit.streak}</div>
          </div>
        ))}
      </div>

      {/* All Done Banner */}
      {allDone && (
        <div className="all-done-banner">
          🏆 Perfect Day! All habits completed!
        </div>
      )}
    </div>
  );
}