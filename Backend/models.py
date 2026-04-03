from flask_sqlalchemy import SQLAlchemy
from datetime import date

db = SQLAlchemy()

class Habit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    icon = db.Column(db.String(10), default='⭐')
    color = db.Column(db.String(20), default='#6366f1')
    created_at = db.Column(db.Date, default=date.today)
    logs = db.relationship('HabitLog', backref='habit', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'icon': self.icon,
            'color': self.color,
            'created_at': str(self.created_at)
        }

class HabitLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    habit_id = db.Column(db.Integer, db.ForeignKey('habit.id'), nullable=False)
    date = db.Column(db.Date, default=date.today)
    completed = db.Column(db.Boolean, default=False)