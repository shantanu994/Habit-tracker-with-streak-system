import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import AddHabit from "./pages/AddHabit";

export default function App() {
  const [page, setPage] = useState("dashboard");

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <span>🔥</span>
          <span>HabitFlow</span>
        </div>
        <nav>
          <button className={page === "dashboard" ? "active" : ""} onClick={() => setPage("dashboard")}>🏠 Today</button>
          <button className={page === "analytics" ? "active" : ""} onClick={() => setPage("analytics")}>📊 Analytics</button>
          <button className={page === "add" ? "active" : ""} onClick={() => setPage("add")}>➕ Add Habit</button>
        </nav>
      </aside>
      <main className="main-content">
        {page === "dashboard" && <Dashboard />}
        {page === "analytics" && <Analytics />}
        {page === "add" && <AddHabit onAdd={() => setPage("dashboard")} />}
      </main>
    </div>
  );
}