import { useState, useEffect } from "react";
import { getYearHeatmap } from "../api/habits";
import "./ContributionHeatmap.css";

export default function ContributionHeatmap() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    loadHeatmapData();
  }, []);

  const loadHeatmapData = async () => {
    try {
      setError(null);
      setLoading(true);
      const heatmapData = await getYearHeatmap();
      setData(heatmapData);
    } catch (err) {
      setError("Failed to load contribution heatmap");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Build a horizontal grid: each column is one week (Mon-Sun).
  const buildGrid = () => {
    if (!data.length) return [];

    const weekColumns = [];
    let currentWeek = [];

    data.forEach((item, index) => {
      const date = new Date(item.date + "T00:00:00");
      const adjustedDay = (date.getDay() + 6) % 7;

      if (index === 0) {
        for (let i = 0; i < adjustedDay; i += 1) {
          currentWeek.push(null);
        }
      }

      currentWeek.push(item);

      if (currentWeek.length === 7) {
        weekColumns.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weekColumns.push(currentWeek);
    }

    return weekColumns;
  };

  const getIntensityLevel = (count) => {
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count === 2) return 2;
    if (count === 3) return 3;
    return 4; // 4+
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const handleCellHover = (date, count, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({
      date: formatDate(date),
      count,
      x: rect.left,
      y: rect.top,
    });
  };

  const handleCellLeave = () => {
    setTooltip(null);
  };

  if (loading) {
    return <div className="heatmap-container loading">Loading heatmap...</div>;
  }

  if (error) {
    return <div className="heatmap-container error">{error}</div>;
  }

  const grid = buildGrid();
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const getMonthLabels = () => {
    const labels = [];
    let lastMonth = null;

    grid.forEach((week, weekIndex) => {
      const firstDayInWeek = week.find(Boolean);
      if (!firstDayInWeek) return;

      const date = new Date(firstDayInWeek.date + "T00:00:00");
      const month = date.getMonth();
      const year = date.getFullYear();
      const key = `${year}-${month}`;

      if (key !== lastMonth) {
        labels.push({
          weekIndex,
          label: date.toLocaleDateString("en-US", { month: "short" }),
        });
        lastMonth = key;
      }
    });

    return labels;
  };

  const monthLabels = getMonthLabels();
  const totalWeeks = Math.max(grid.length, 1);

  return (
    <div className="heatmap-container">
      <div className="heatmap-header">
        <h2>Contribution Heatmap</h2>
        <p>Daily habit completions over the past year</p>
        <button onClick={loadHeatmapData} className="refresh-btn">
          Refresh
        </button>
      </div>

      <div className="heatmap-wrapper">
        {/* Month labels */}
        <div className="heatmap-months">
          <div className="spacer"></div>
          <div className="months-labels">
            {monthLabels.map((item, idx) => (
              <div
                key={idx}
                className="month-label"
                style={{
                  left: `${(item.weekIndex / totalWeeks) * 100}%`,
                  position: "absolute",
                }}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Day labels + grid */}
        <div className="heatmap-content">
          <div className="day-labels">
            {dayLabels.map((day) => (
              <div key={day} className="day-label">
                {day}
              </div>
            ))}
          </div>

          <div
            className="heatmap-grid"
            style={{
              gridTemplateColumns: `repeat(${totalWeeks}, minmax(0, 1fr))`,
            }}
          >
            {grid.map((weekColumn, colIdx) => (
              <div key={colIdx} className="heatmap-column">
                {weekColumn.map((item, rowIdx) => {
                  if (!item) {
                    return (
                      <div
                        key={`${colIdx}-${rowIdx}`}
                        className="heatmap-cell intensity-0 heatmap-cell-empty"
                      />
                    );
                  }

                  const intensity = getIntensityLevel(item.count);
                  return (
                    <div
                      key={`${colIdx}-${rowIdx}`}
                      className={`heatmap-cell intensity-${intensity}`}
                      title={`${formatDate(item.date)}: ${item.count} ${
                        item.count === 1 ? "habit" : "habits"
                      } completed`}
                      onMouseEnter={(e) =>
                        handleCellHover(item.date, item.count, e)
                      }
                      onMouseLeave={handleCellLeave}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="heatmap-legend">
        <span>Less</span>
        <div className="legend-cells">
          {[0, 1, 2, 3, 4].map((intensity) => (
            <div
              key={intensity}
              className={`legend-cell intensity-${intensity}`}
              title={
                intensity === 0
                  ? "No completions"
                  : `${intensity}${intensity === 4 ? "+" : ""} completions`
              }
            />
          ))}
        </div>
        <span>More</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="heatmap-tooltip"
          style={{
            left: `${tooltip.x + 20}px`,
            top: `${tooltip.y - 40}px`,
          }}
        >
          <div className="tooltip-date">{tooltip.date}</div>
          <div className="tooltip-count">
            {tooltip.count} {tooltip.count === 1 ? "habit" : "habits"} completed
          </div>
        </div>
      )}
    </div>
  );
}
