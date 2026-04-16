import { useEffect, useState, useRef } from "react";
import { getTodayHabits, markComplete, updateHabitNote } from "../api/habits";
import { playCheck, playUncheck, playAllDone } from "../sounds";
import { getRandomQuote } from "../quotes";
import confetti from "canvas-confetti";

export default function Dashboard() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState(getRandomQuote());
  const [animatingId, setAnimatingId] = useState(null);
  const [allDoneShown, setAllDoneShown] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [noteDrafts, setNoteDrafts] = useState({});
  const prevCompleted = useRef(0);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    const data = await getTodayHabits();
    setHabits(data);
    const draftMap = {};
    data.forEach((habit) => {
      draftMap[habit.id] = habit.today_note || "";
    });
    setNoteDrafts(draftMap);
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
    const completedNow = updated.filter((h) => h.completed_today).length;
    if (
      completedNow === updated.length &&
      updated.length > 0 &&
      !allDoneShown
    ) {
      setAllDoneShown(true);
      setQuote("🎉 ALL HABITS DONE! You're on fire today!");
      playAllDone();
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#6366f1", "#ec4899", "#f59e0b", "#10b981"],
      });
    } else if (completedNow < updated.length) {
      setAllDoneShown(false);
      setQuote(getRandomQuote());
    }
    prevCompleted.current = completedNow;
  };

  const handleNoteChange = (habitId, value) => {
    setNoteDrafts((prev) => ({ ...prev, [habitId]: value }));
  };

  const handleNoteSave = async (habitId) => {
    const note = noteDrafts[habitId] || "";
    await updateHabitNote(habitId, note);
    await loadHabits();
  };

  const completed = habits.filter((h) => h.completed_today).length;
  const totalStreak = habits.reduce((sum, h) => sum + h.streak, 0);
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);
  const progress = habits.length
    ? Math.round((completed / habits.length) * 100)
    : 0;
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const allDone = habits.length > 0 && completed === habits.length;
  const categories = [
    "all",
    ...new Set(habits.map((h) => h.category || "General")),
  ];

  const displayedHabits = [...habits]
    .filter((habit) => {
      if (statusFilter === "completed") return habit.completed_today;
      if (statusFilter === "pending") return !habit.completed_today;
      return true;
    })
    .filter((habit) => {
      if (categoryFilter === "all") return true;
      return (habit.category || "General") === categoryFilter;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "streak") return b.streak - a.streak;
      return 0;
    });

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Good day! 👋</h1>
        <p>{today}</p>
      </div>

      <div className="stat-row">
        <div className="stat-card premium-stat-card">
          <div className="s-icon">✅</div>
          <div className="s-val">{completed}</div>
          <div className="s-label">Done Today</div>
        </div>
        <div className="stat-card premium-stat-card">
          <div className="s-icon">🧩</div>
          <div className="s-val">{Math.max(habits.length - completed, 0)}</div>
          <div className="s-label">Remaining</div>
        </div>
        <div className="stat-card premium-stat-card">
          <div className="s-icon">🔥</div>
          <div className="s-val">{bestStreak}</div>
          <div className="s-label">Best Streak</div>
        </div>
      </div>

      {/* Motivational Quote */}
      <div className={`quote-card ${allDone ? "quote-celebration" : ""}`}>
        <span>💬</span> {quote}
      </div>

      {/* Progress Bar */}
      <div className="progress-card">
        <div className="progress-info">
          <span>
            {completed} / {habits.length} habits done
          </span>
          <span className="pct">{progress}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="progress-meta">
          <span>
            {allDone ? "Momentum locked in" : "Stay consistent and stack wins"}
          </span>
          <span>Total streak days: {totalStreak}</span>
        </div>
      </div>

      <div className="control-row">
        <div className="control-group">
          <label>Status</label>
          <select
            className="input control-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All habits</option>
            <option value="pending">Pending only</option>
            <option value="completed">Completed only</option>
          </select>
        </div>

        <div className="control-group">
          <label>Sort</label>
          <select
            className="input control-input"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="default">Default</option>
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

      {/* Habits List */}
      <div className="habits-list">
        {habits.length === 0 && (
          <div className="empty">
            No habits yet! Click ➕ Add Habit to start.
          </div>
        )}
        {habits.length > 0 && displayedHabits.length === 0 && (
          <div className="empty">No habits match the selected filter.</div>
        )}
        {displayedHabits.map((habit) => (
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
                  background: habit.completed_today
                    ? habit.color
                    : "transparent",
                  borderColor: habit.color,
                }}
                onClick={() => handleToggle(habit.id, habit.completed_today)}
              >
                {habit.completed_today ? "✓" : ""}
              </button>
              <span className="habit-icon">{habit.icon}</span>
              <div className="habit-text">
                <span className="habit-name">{habit.name}</span>
                <span className="habit-category-badge">
                  🏷️ {habit.category || "General"}
                </span>
                <span className="habit-reminder">
                  ⏰ {habit.reminder_time || "No reminder"}
                </span>
              </div>
            </div>
            <div className="habit-right">
              <div className="streak">🔥 {habit.streak}</div>
              <div className="habit-note-box" onClick={(e) => e.stopPropagation()}>
                <input
                  className="habit-note-input"
                  maxLength={280}
                  value={noteDrafts[habit.id] || ""}
                  onChange={(e) => handleNoteChange(habit.id, e.target.value)}
                  placeholder="Add quick note"
                />
                <button
                  className="note-save-btn"
                  onClick={() => handleNoteSave(habit.id)}
                >
                  Save
                </button>
              </div>
            </div>
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
