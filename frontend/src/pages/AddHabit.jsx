import { useState, useEffect } from "react";
import { addHabit, deleteHabit, getTodayHabits } from "../api/habits";

const ICONS = ["💧","📚","🏃","🧘","💪","🥗","😴","✍️","🎸","🌿"];
const COLORS = ["#6366f1","#ec4899","#f59e0b","#10b981","#3b82f6","#ef4444","#8b5cf6","#14b8a6"];

export default function AddHabit({ onAdd }) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("⭐");
  const [color, setColor] = useState("#6366f1");
  const [habits, setHabits] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => { loadHabits(); }, []);

  const loadHabits = async () => {
    const data = await getTodayHabits();
    setHabits(data);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return setMsg("Please enter a habit name!");
    await addHabit({ name, icon, color });
    setMsg("✅ Habit added!");
    setName("");
    loadHabits();
    setTimeout(() => { setMsg(""); onAdd(); }, 1000);
  };

  const handleDelete = async (id) => {
    await deleteHabit(id);
    loadHabits();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>➕ Add New Habit</h1>
        <p>Build habits that stick</p>
      </div>

      <div className="form-card">
        <div className="form-group">
          <label>Habit Name</label>
          <input className="input" placeholder="e.g. Drink 8 glasses of water"
            value={name} onChange={e => setName(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Pick an Icon</label>
          <div className="icon-grid">
            {ICONS.map(ic => (
              <button key={ic} className={`icon-btn ${icon === ic ? "selected" : ""}`}
                onClick={() => setIcon(ic)}>{ic}</button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Pick a Color</label>
          <div className="color-grid">
            {COLORS.map(c => (
              <button key={c} className={`color-btn ${color === c ? "selected" : ""}`}
                style={{ background: c }} onClick={() => setColor(c)} />
            ))}
          </div>
        </div>

        {msg && <div className="msg">{msg}</div>}
        <button className="submit-btn" style={{ background: color }} onClick={handleSubmit}>
          {icon} Add Habit
        </button>
      </div>

      <div className="form-card">
        <h3>Your Habits ({habits.length})</h3>
        {habits.map(h => (
          <div key={h.id} className="habit-row">
            <span>{h.icon} {h.name}</span>
            <button className="delete-btn" onClick={() => handleDelete(h.id)}>🗑️</button>
          </div>
        ))}
        {habits.length === 0 && <p>No habits yet!</p>}
      </div>
    </div>
  );
}