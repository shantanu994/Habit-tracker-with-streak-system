import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import AddHabit from "./pages/AddHabit";

export default function App() {
  const [page, setPage] = useState("dashboard");

  return (
    <>
      {/* Animated background blobs */}
      <div className="bg-blobs">
        <div className="blob blob1" />
        <div className="blob blob2" />
        <div className="blob blob3" />
        <div className="blob blob4" />
      </div>

      <div className="app">
        <div className="main-content">
          {/* Logo at top */}
          <div className="top-header">
            <div className="logo-badge">🔥 HabitFlow</div>
          </div>

          {/* Pages */}
          {page === "dashboard" && <Dashboard />}
          {page === "analytics" && <Analytics />}
          {page === "add"       && <AddHabit onAdd={() => setPage("dashboard")} />}
        </div>

        {/* Bottom Navbar */}
        <nav className="navbar">
          <button className={`nav-btn ${page === "dashboard" ? "active" : ""}`} onClick={() => setPage("dashboard")}>
            🏠 Today
          </button>
          <button className={`nav-btn ${page === "analytics" ? "active" : ""}`} onClick={() => setPage("analytics")}>
            📊 Analytics
          </button>
          <button className={`nav-btn ${page === "add" ? "active" : ""}`} onClick={() => setPage("add")}>
            ➕ Add Habit
          </button>
        </nav>
      </div>
    </>
  );
}