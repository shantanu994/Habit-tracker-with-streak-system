from flask import Flask, jsonify, request, Response
from flask_cors import CORS
from sqlalchemy import and_
from models import db, Habit, HabitLog
from datetime import date, timedelta
import csv
import io
import os
from urllib.parse import quote_plus
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)


def build_database_uri():
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        return database_url

    db_user = os.getenv("MYSQL_USER", "root")
    db_password = quote_plus(os.getenv("MYSQL_PASSWORD", ""))
    db_host = os.getenv("MYSQL_HOST", "localhost")
    db_port = os.getenv("MYSQL_PORT", "3306")
    db_name = os.getenv("MYSQL_DB", "habit_flow")

    if db_password:
        return f"mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}?charset=utf8mb4"
    return f"mysql+pymysql://{db_user}@{db_host}:{db_port}/{db_name}?charset=utf8mb4"


app.config["SQLALCHEMY_DATABASE_URI"] = build_database_uri()
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

CORS(app)
db.init_app(app)

with app.app_context():
    db.create_all()


@app.route("/", methods=["GET"])
def home():
    return jsonify(
        {
            "message": "HabitFlow backend is running",
            "endpoints": ["/api/today", "/api/analytics", "/api/health"],
        }
    )


@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok"})


# ── GET all habits with today's status ──────────────
@app.route("/api/today", methods=["GET"])
def get_today():
    today = date.today()
    habits = Habit.query.all()
    result = []
    for h in habits:
        log = HabitLog.query.filter_by(habit_id=h.id, date=today).first()
        result.append(
            {
                **h.to_dict(),
                "completed_today": bool(log and log.completed),
                "streak": calculate_streak(h.id),
                "today_note": log.note if log else None,
            }
        )
    return jsonify(result)


# ── ADD a new habit ──────────────────────────────────
@app.route("/api/habits", methods=["POST"])
def add_habit():
    try:
        data = request.json
        if not data or "name" not in data:
            return jsonify({"error": "Habit name is required"}), 400
        if not data["name"].strip():
            return jsonify({"error": "Habit name cannot be empty"}), 400

        weekly_target = data.get("weekly_target", 7)
        try:
            weekly_target = int(weekly_target)
        except (TypeError, ValueError):
            return (
                jsonify({"error": "Weekly target must be a number between 1 and 7"}),
                400,
            )

        if weekly_target < 1 or weekly_target > 7:
            return jsonify({"error": "Weekly target must be between 1 and 7"}), 400

        reminder_time = normalize_reminder_time(data.get("reminder_time"))
        if data.get("reminder_time") is not None and reminder_time is None:
            return jsonify({"error": "Reminder time must be in HH:MM format"}), 400

        category = normalize_category(data.get("category"))
        if category is None:
            return jsonify({"error": "Category must be 1 to 40 characters"}), 400

        habit = Habit(
            name=data["name"].strip(),
            icon=data.get("icon", "⭐"),
            color=data.get("color", "#6366f1"),
            category=category,
            weekly_target=weekly_target,
            reminder_time=reminder_time,
        )
        db.session.add(habit)
        db.session.commit()
        return jsonify(habit.to_dict()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── UPDATE an existing habit ─────────────────────────
@app.route("/api/habits/<int:habit_id>", methods=["PUT"])
def update_habit(habit_id):
    try:
        habit = Habit.query.get_or_404(habit_id)
        data = request.json or {}

        if "name" in data:
            name = str(data.get("name", "")).strip()
            if not name:
                return jsonify({"error": "Habit name cannot be empty"}), 400
            habit.name = name

        if "icon" in data:
            icon = str(data.get("icon", "")).strip()
            if icon:
                habit.icon = icon

        if "color" in data:
            color = str(data.get("color", "")).strip()
            if color:
                habit.color = color

        if "category" in data:
            category = normalize_category(data.get("category"))
            if category is None:
                return jsonify({"error": "Category must be 1 to 40 characters"}), 400
            habit.category = category

        if "weekly_target" in data:
            try:
                weekly_target = int(data.get("weekly_target"))
            except (TypeError, ValueError):
                return (
                    jsonify(
                        {"error": "Weekly target must be a number between 1 and 7"}
                    ),
                    400,
                )
            if weekly_target < 1 or weekly_target > 7:
                return jsonify({"error": "Weekly target must be between 1 and 7"}), 400
            habit.weekly_target = weekly_target

        if "reminder_time" in data:
            reminder_time = normalize_reminder_time(data.get("reminder_time"))
            if (
                data.get("reminder_time") is not None
                and data.get("reminder_time") != ""
                and reminder_time is None
            ):
                return jsonify({"error": "Reminder time must be in HH:MM format"}), 400
            habit.reminder_time = reminder_time

        db.session.commit()
        return jsonify(habit.to_dict())
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── DELETE a habit ───────────────────────────────────
@app.route("/api/habits/<int:habit_id>", methods=["DELETE"])
def delete_habit(habit_id):
    try:
        habit = Habit.query.get_or_404(habit_id)
        db.session.delete(habit)
        db.session.commit()
        return jsonify({"message": "Deleted"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── TOGGLE today's completion ────────────────────────
@app.route("/api/habits/<int:habit_id>/complete", methods=["POST"])
def mark_complete(habit_id):
    try:
        # Verify habit exists
        habit = Habit.query.get_or_404(habit_id)
        today = date.today()
        existing = HabitLog.query.filter_by(habit_id=habit_id, date=today).first()
        if existing:
            db.session.delete(existing)
            db.session.commit()
            return jsonify({"status": "unchecked"})
        log = HabitLog(habit_id=habit_id, date=today, completed=True)
        db.session.add(log)
        db.session.commit()
        return jsonify({"status": "checked"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/habits/<int:habit_id>/note", methods=["PUT"])
def update_habit_note(habit_id):
    try:
        Habit.query.get_or_404(habit_id)
        payload = request.json or {}
        note = str(payload.get("note", "")).strip()

        if len(note) > 280:
            return jsonify({"error": "Note must be 280 characters or less"}), 400

        today = date.today()
        log = HabitLog.query.filter_by(habit_id=habit_id, date=today).first()
        if not log:
            log = HabitLog(habit_id=habit_id, date=today, completed=False)
            db.session.add(log)

        log.note = note or None
        db.session.commit()
        return jsonify({"status": "saved", "note": log.note or ""})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# ── GET analytics for all habits ────────────────────
@app.route("/api/analytics", methods=["GET"])
def get_analytics():
    habits = Habit.query.all()
    week_start, week_end = get_current_week_bounds()
    result = []
    for h in habits:
        total = HabitLog.query.filter_by(habit_id=h.id, completed=True).count()
        weekly = HabitLog.query.filter(
            HabitLog.habit_id == h.id,
            HabitLog.completed == True,
            HabitLog.date >= week_start,
            HabitLog.date <= week_end,
        ).count()
        weekly_progress_pct = (
            round((weekly / h.weekly_target) * 100) if h.weekly_target else 0
        )
        result.append(
            {
                **h.to_dict(),
                "total_completions": total,
                "current_streak": calculate_streak(h.id),
                "weekly_completions": weekly,
                "weekly_progress_pct": weekly_progress_pct,
                "weekly_on_track": weekly >= h.weekly_target,
            }
        )
    return jsonify(result)


@app.route("/api/analytics/weekly-trend", methods=["GET"])
def get_weekly_trend():
    habits = Habit.query.all()
    today = date.today()
    current_week_start = today - timedelta(days=today.weekday())
    target_per_week = sum(h.weekly_target for h in habits)
    result = []

    for week_offset in range(7, -1, -1):
        week_start = current_week_start - timedelta(days=week_offset * 7)
        week_end = week_start + timedelta(days=6)
        completed = HabitLog.query.filter(
            HabitLog.completed == True,
            HabitLog.date >= week_start,
            HabitLog.date <= week_end,
        ).count()
        completion_rate = (
            round((completed / target_per_week) * 100) if target_per_week else 0
        )

        result.append(
            {
                "week_label": week_start.strftime("%b %d"),
                "week_start": str(week_start),
                "week_end": str(week_end),
                "completed": completed,
                "target": target_per_week,
                "completion_rate": completion_rate,
            }
        )

    return jsonify(result)


@app.route("/api/export/csv", methods=["GET"])
def export_analytics_csv():
    habits = Habit.query.all()
    week_start, week_end = get_current_week_bounds()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "id",
            "name",
            "category",
            "weekly_target",
            "weekly_completions",
            "weekly_progress_pct",
            "total_completions",
            "current_streak",
        ]
    )

    for h in habits:
        total = HabitLog.query.filter_by(habit_id=h.id, completed=True).count()
        weekly = HabitLog.query.filter(
            HabitLog.habit_id == h.id,
            HabitLog.completed == True,
            HabitLog.date >= week_start,
            HabitLog.date <= week_end,
        ).count()
        progress = round((weekly / h.weekly_target) * 100) if h.weekly_target else 0
        writer.writerow(
            [
                h.id,
                h.name,
                h.category,
                h.weekly_target,
                weekly,
                progress,
                total,
                calculate_streak(h.id),
            ]
        )

    csv_data = output.getvalue()
    output.close()

    return Response(
        csv_data,
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=habit_analytics.csv"},
    )


# ── ADD demo data for presentation ───────────────────
@app.route("/api/demo/seed", methods=["POST"])
def seed_demo_data():
    try:
        payload = request.json or {}
        try:
            days = int(payload.get("days", 30))
        except (TypeError, ValueError):
            return jsonify({"error": "days must be a number"}), 400

        if days < 1 or days > 365:
            return jsonify({"error": "days must be between 1 and 365"}), 400

        demo_habits = [
            {
                "name": "Morning Walk",
                "icon": "🚶",
                "color": "#10b981",
                "category": "Fitness",
                "weekly_target": 5,
                "reminder_time": "06:30",
            },
            {
                "name": "Read 20 Pages",
                "icon": "📚",
                "color": "#3b82f6",
                "category": "Learning",
                "weekly_target": 6,
                "reminder_time": "21:00",
            },
            {
                "name": "Drink Water",
                "icon": "💧",
                "color": "#14b8a6",
                "category": "Health",
                "weekly_target": 7,
                "reminder_time": "10:00",
            },
            {
                "name": "Workout",
                "icon": "💪",
                "color": "#f59e0b",
                "category": "Fitness",
                "weekly_target": 4,
                "reminder_time": "18:30",
            },
            {
                "name": "Meditation",
                "icon": "🧘",
                "color": "#8b5cf6",
                "category": "Mindfulness",
                "weekly_target": 5,
                "reminder_time": "07:00",
            },
        ]

        weekday_patterns = [
            {0, 1, 2, 4, 5},
            {0, 1, 2, 3, 4, 6},
            {0, 1, 2, 3, 4, 5, 6},
            {1, 3, 5, 6},
            {0, 2, 3, 5, 6},
        ]

        synced_habits = []
        created_habit_count = 0
        created_log_count = 0

        # Create missing demo habits by name, reuse existing ones if present.
        for entry in demo_habits:
            habit = Habit.query.filter_by(name=entry["name"]).first()
            if not habit:
                habit = Habit(**entry)
                db.session.add(habit)
                created_habit_count += 1
            synced_habits.append(habit)

        db.session.flush()

        today = date.today()
        for idx, habit in enumerate(synced_habits):
            pattern = weekday_patterns[idx % len(weekday_patterns)]
            for days_ago in range(0, days):
                log_date = today - timedelta(days=days_ago)
                if log_date.weekday() in pattern and (days_ago + idx) % 6 != 0:
                    existing_log = HabitLog.query.filter_by(
                        habit_id=habit.id,
                        date=log_date,
                        completed=True,
                    ).first()
                    if not existing_log:
                        db.session.add(
                            HabitLog(habit_id=habit.id, date=log_date, completed=True)
                        )
                        created_log_count += 1

        db.session.commit()
        return jsonify(
            {
                "message": "Demo data synced",
                "seeded_days": days,
                "created_habits": created_habit_count,
                "created_logs": created_log_count,
            }
        )
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# ── GET heatmap data for a habit ─────────────────────
@app.route("/api/habits/<int:habit_id>/heatmap", methods=["GET"])
def get_heatmap(habit_id):
    logs = HabitLog.query.filter_by(habit_id=habit_id, completed=True).all()
    return jsonify([{"date": str(log.date), "count": 1} for log in logs])


# ── GET aggregated heatmap for all habits (past year) ─
@app.route("/api/heatmap/year", methods=["GET"])
def get_year_heatmap():
    """Returns daily completion counts for all habits in the past year"""
    today = date.today()
    year_ago = today - timedelta(days=365)

    # Get all completed logs in the past year
    logs = HabitLog.query.filter(
        HabitLog.completed == True, HabitLog.date >= year_ago, HabitLog.date <= today
    ).all()

    # Aggregate by date
    daily_counts = {}
    for log in logs:
        date_str = str(log.date)
        daily_counts[date_str] = daily_counts.get(date_str, 0) + 1

    # Build result for all days in the past year
    result = []
    current_date = year_ago
    while current_date <= today:
        date_str = str(current_date)
        result.append({"date": date_str, "count": daily_counts.get(date_str, 0)})
        current_date += timedelta(days=1)

    return jsonify(result)


# ── HELPER: calculate streak ─────────────────────────
def calculate_streak(habit_id):
    streak = 0
    check_date = date.today()
    while True:
        log = HabitLog.query.filter_by(
            habit_id=habit_id, date=check_date, completed=True
        ).first()
        if log:
            streak += 1
            check_date -= timedelta(days=1)
        else:
            break
    return streak


def get_current_week_bounds():
    today = date.today()
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)
    return week_start, week_end


def normalize_reminder_time(value):
    if value is None:
        return None

    value = str(value).strip()
    if value == "":
        return None

    parts = value.split(":")
    if len(parts) != 2:
        return None

    hour, minute = parts
    if not (hour.isdigit() and minute.isdigit()):
        return None

    hour_i = int(hour)
    minute_i = int(minute)
    if hour_i < 0 or hour_i > 23 or minute_i < 0 or minute_i > 59:
        return None

    return f"{hour_i:02d}:{minute_i:02d}"


def normalize_category(value):
    if value is None:
        return "General"

    category = str(value).strip()
    if not category:
        return "General"
    if len(category) > 40:
        return None
    return category


if __name__ == "__main__":
    print("\n" + "=" * 50)
    print("🔥 HabitFlow Backend Starting...")
    print("📍 Backend running on: http://localhost:5000")
    print("✅ CORS enabled for frontend")
    print("=" * 50 + "\n")
    app.run(debug=True, port=5000)
