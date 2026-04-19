import { useState, useEffect, useCallback } from "react";
import {
  addHabit,
  deleteHabit,
  getTodayHabits,
  updateHabit,
  seedDemoData,
} from "../api/habits";

const ICONS = ["💧", "📚", "🏃", "🧘", "💪", "🥗", "😴", "✍️", "🎸", "🌿"];
const COLORS = [
  "#6366f1",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
];
const CATEGORIES = [
  "General",
  "Health",
  "Fitness",
  "Learning",
  "Productivity",
  "Mindfulness",
  "Personal",
];

export default function AddHabit({ onAdd }) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("⭐");
  const [color, setColor] = useState("#6366f1");
  const [weeklyTarget, setWeeklyTarget] = useState(5);
  const [reminderTime, setReminderTime] = useState("");
  const [category, setCategory] = useState("General");
  const [habits, setHabits] = useState([]);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState(""); // 'success' or 'error'
  const [loading, setLoading] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("⭐");
  const [editColor, setEditColor] = useState("#6366f1");
  const [editWeeklyTarget, setEditWeeklyTarget] = useState(5);
  const [editReminderTime, setEditReminderTime] = useState("");
  const [editCategory, setEditCategory] = useState("General");

  const loadHabits = useCallback(async () => {
    try {
      const data = await getTodayHabits();
      setHabits(data);
    } catch (err) {
      console.error(err);
      showMessage("Failed to load habits", "error");
    }
  }, []);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  const showMessage = (text, type = "success") => {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => {
      setMsg("");
    }, 3000);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return showMessage("Please enter a habit name!", "error");

    try {
      setLoading(true);
      await addHabit({
        name,
        icon,
        color,
        category,
        weekly_target: weeklyTarget,
        reminder_time: reminderTime || null,
      });
      showMessage("✅ Habit added successfully!", "success");
      setName("");
      setWeeklyTarget(5);
      setReminderTime("");
      setCategory("General");
      await loadHabits();
      setTimeout(() => {
        onAdd();
      }, 1000);
    } catch (err) {
      console.error(err);
      showMessage("❌ Failed to add habit. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteHabit(id);
      showMessage("✅ Habit deleted!", "success");
      await loadHabits();
    } catch (err) {
      console.error(err);
      showMessage("❌ Failed to delete habit.", "error");
    }
  };

  const handleSeedDemo = async () => {
    try {
      setLoading(true);
      const res = await seedDemoData(30);
      const seededDays = res.seeded_days || 30;
      const createdHabits = res.created_habits || 0;
      const createdLogs = res.created_logs || 0;
      showMessage(
        `✅ Last ${seededDays} days synced: +${createdHabits} habits, +${createdLogs} logs`,
        "success",
      );
      await loadHabits();
    } catch (err) {
      console.error(err);
      showMessage("❌ Failed to add demo data.", "error");
    } finally {
      setLoading(false);
    }
  };

  const beginEdit = (habit) => {
    setEditingHabitId(habit.id);
    setEditName(habit.name || "");
    setEditIcon(habit.icon || "⭐");
    setEditColor(habit.color || "#6366f1");
    setEditCategory(habit.category || "General");
    setEditWeeklyTarget(habit.weekly_target || 7);
    setEditReminderTime(habit.reminder_time || "");
  };

  const cancelEdit = () => {
    setEditingHabitId(null);
    setEditName("");
    setEditReminderTime("");
  };

  const handleUpdate = async () => {
    if (!editingHabitId) return;
    if (!editName.trim())
      return showMessage("Please enter a habit name!", "error");

    try {
      setLoading(true);
      await updateHabit(editingHabitId, {
        name: editName,
        icon: editIcon,
        color: editColor,
        category: editCategory,
        weekly_target: editWeeklyTarget,
        reminder_time: editReminderTime || null,
      });
      showMessage("✅ Habit updated successfully!", "success");
      setEditingHabitId(null);
      setEditName("");
      await loadHabits();
    } catch (err) {
      console.error(err);
      showMessage("❌ Failed to update habit.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>➕ Add New Habit</h1>
        <p>Build habits that stick</p>
      </div>

      <div className="form-card">
        <div className="form-title-wrap">
          <h3 className="form-title">Create a Signature Habit</h3>
          <p className="form-subtitle">
            Pick a name, icon, and color that feels motivating.
          </p>
        </div>

        <div className="form-group">
          <label>Habit Name</label>
          <input
            className="input"
            placeholder="e.g. Drink 8 glasses of water"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Pick an Icon</label>
          <div className="icon-grid">
            {ICONS.map((ic) => (
              <button
                key={ic}
                className={`icon-btn ${icon === ic ? "selected" : ""}`}
                onClick={() => setIcon(ic)}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Pick a Color</label>
          <div className="color-grid">
            {COLORS.map((c) => (
              <button
                key={c}
                className={`color-btn ${color === c ? "selected" : ""}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Weekly Target</label>
          <select
            className="input"
            value={weeklyTarget}
            onChange={(e) => setWeeklyTarget(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <option key={n} value={n}>
                {n} day{n > 1 ? "s" : ""} per week
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Category</label>
          <select
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Reminder Time (Optional)</label>
          <input
            className="input"
            type="time"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
          />
        </div>

        <div className="habit-preview" style={{ borderColor: color }}>
          <span className="preview-icon">{icon}</span>
          <div>
            <p className="preview-label">Preview</p>
            <strong>{name.trim() || "Your new habit"}</strong>
            <p className="preview-target">Category: {category}</p>
            <p className="preview-target">Target: {weeklyTarget}/7 days</p>
            <p className="preview-target">
              Reminder: {reminderTime ? reminderTime : "Not set"}
            </p>
          </div>
        </div>

        {msg && <div className={`msg msg-${msgType}`}>{msg}</div>}
        <button
          className="submit-btn"
          style={{ background: color }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "⏳ Adding..." : `${icon} Add Habit`}
        </button>
      </div>

      <div className="form-card">
        <div className="demo-actions">
          <h3>Your Habits ({habits.length})</h3>
          <button
            className="secondary-btn"
            onClick={handleSeedDemo}
            disabled={loading}
          >
            🧪 Load 1-Month Demo Data
          </button>
        </div>
        {habits.map((h) => (
          <div key={h.id} className="habit-row">
            <span className="habit-row-main">
              {h.icon} {h.name}
            </span>
            <span className="habit-row-category">
              🏷️ {h.category || "General"}
            </span>
            <span className="habit-row-target">
              🎯 {h.weekly_target || 7}/7
            </span>
            <span className="habit-row-time">
              ⏰ {h.reminder_time || "--:--"}
            </span>
            <div className="habit-row-actions">
              <button className="edit-btn" onClick={() => beginEdit(h)}>
                ✏️
              </button>
              <button className="delete-btn" onClick={() => handleDelete(h.id)}>
                🗑️
              </button>
            </div>
          </div>
        ))}
        {habits.length === 0 && (
          <p className="empty-hint">No habits yet. Add your first one above.</p>
        )}

        {editingHabitId && (
          <div className="edit-panel">
            <h4>Edit Habit</h4>
            <div className="form-group">
              <label>Habit Name</label>
              <input
                className="input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Icon</label>
              <div className="icon-grid">
                {ICONS.map((ic) => (
                  <button
                    key={`edit-${ic}`}
                    className={`icon-btn ${editIcon === ic ? "selected" : ""}`}
                    onClick={() => setEditIcon(ic)}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Color</label>
              <div className="color-grid">
                {COLORS.map((c) => (
                  <button
                    key={`edit-${c}`}
                    className={`color-btn ${editColor === c ? "selected" : ""}`}
                    style={{ background: c }}
                    onClick={() => setEditColor(c)}
                  />
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Weekly Target</label>
              <select
                className="input"
                value={editWeeklyTarget}
                onChange={(e) => setEditWeeklyTarget(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                  <option key={`edit-target-${n}`} value={n}>
                    {n} day{n > 1 ? "s" : ""} per week
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                className="input"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={`edit-category-${c}`} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Reminder Time (Optional)</label>
              <input
                className="input"
                type="time"
                value={editReminderTime}
                onChange={(e) => setEditReminderTime(e.target.value)}
              />
            </div>

            <div className="edit-panel-actions">
              <button className="secondary-btn" onClick={cancelEdit}>
                Cancel
              </button>
              <button
                className="submit-btn"
                style={{ background: editColor }}
                onClick={handleUpdate}
                disabled={loading}
              >
                {loading ? "⏳ Saving..." : "💾 Save Changes"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
