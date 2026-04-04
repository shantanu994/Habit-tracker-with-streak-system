from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, Habit, HabitLog
from datetime import date, timedelta

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///habits.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

CORS(app)
db.init_app(app)

with app.app_context():
    db.create_all()


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
        habit = Habit(
            name=data["name"].strip(),
            icon=data.get("icon", "⭐"),
            color=data.get("color", "#6366f1"),
        )
        db.session.add(habit)
        db.session.commit()
        return jsonify(habit.to_dict()), 201
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


# ── GET analytics for all habits ────────────────────
@app.route("/api/analytics", methods=["GET"])
def get_analytics():
    habits = Habit.query.all()
    result = []
    for h in habits:
        total = HabitLog.query.filter_by(habit_id=h.id, completed=True).count()
        result.append(
            {
                **h.to_dict(),
                "total_completions": total,
                "current_streak": calculate_streak(h.id),
            }
        )
    return jsonify(result)


# ── GET heatmap data for a habit ─────────────────────
@app.route("/api/habits/<int:habit_id>/heatmap", methods=["GET"])
def get_heatmap(habit_id):
    logs = HabitLog.query.filter_by(habit_id=habit_id, completed=True).all()
    return jsonify([{"date": str(log.date), "count": 1} for log in logs])


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


if __name__ == "__main__":
    print("\n" + "=" * 50)
    print("🔥 HabitFlow Backend Starting...")
    print("📍 Backend running on: http://localhost:5000")
    print("✅ CORS enabled for frontend")
    print("=" * 50 + "\n")
    app.run(debug=True, port=5000)
