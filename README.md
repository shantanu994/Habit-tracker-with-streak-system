# HabitFlow

HabitFlow is a full-stack habit tracking web app built with Flask + React.
It helps you stay consistent through streaks, analytics, visual feedback, and simple daily workflow tools.

## What You Get

- Daily habit dashboard with one-click complete/uncomplete toggle
- Habit streak tracking and daily progress summary
- Habit categories with category-based filtering
- Daily quick notes for each habit
- Weekly target system with on-track/off-track analytics
- Reminder time per habit
- GitHub-style yearly contribution heatmap
- Analytics charts (bar, pie, weekly momentum trend)
- Habit CRUD (create, edit, delete)
- Demo data seeding for fast testing
- CSV analytics export API

## Tech Stack

### Backend

- Python 3.x
- Flask
- Flask-CORS
- SQLAlchemy
- MySQL (via PyMySQL)

### Frontend

- React 19
- Axios
- Recharts
- CSS3 (custom responsive UI)

## Project Structure

```text
Habit-Flow/
|-- Backend/
|   |-- app.py
|   |-- models.py
|   |-- .env.example
|   |-- requirements.txt
|   `-- instance/
|-- frontend/
|   |-- package.json
|   |-- public/
|   `-- src/
|       |-- App.js
|       |-- index.css
|       |-- api/habits.js
|       |-- components/
|       `-- pages/
|-- instance/
|-- package.json
`-- README.md
```

## Setup

## 1. Backend Setup

```bash
cd Backend
python -m venv venv
```

Activate venv:

- Windows (PowerShell):

```powershell
venv\Scripts\Activate.ps1
```

- Windows (cmd):

```cmd
venv\Scripts\activate
```

- macOS/Linux:

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create environment file:

```bash
cp .env.example .env
```

For Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Update `.env` with your MySQL details:

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DB=habit_flow
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
```

If you prefer a single URL instead, set:

```env
DATABASE_URL=mysql+pymysql://root:your_mysql_password@localhost:3306/habit_flow?charset=utf8mb4
```

Run backend:

```bash
python app.py
```

Backend runs at: `http://localhost:5000`

Quick backend checks:

- `GET /` should return backend status JSON
- `GET /api/health` should return `{ "status": "ok" }`
- `GET /api/today` should return current habits list

## 2. Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs at: `http://localhost:3000`

## 3. Seed Sample Data (Previous 1 Month)

You can seed demo data directly from the app:

- Open **Add Habit** page
- Click **Load 1-Month Demo Data**
- This creates/syncs demo habits and completion logs for the last 30 days

Or via API:

```http
POST /api/demo/seed
Content-Type: application/json

{
  "days": 30
}
```

Then open Dashboard and Analytics to see charts and heatmap populated.

## API Endpoints

### Habits

- `GET /api/today`
  - Returns all habits with today's completion status, streak, and today's note
- `POST /api/habits`
  - Create habit (name, icon, color, category, weekly_target, reminder_time)
- `PUT /api/habits/<habit_id>`
  - Update habit details
- `DELETE /api/habits/<habit_id>`
  - Delete habit
- `POST /api/habits/<habit_id>/complete`
  - Toggle today's completion
- `PUT /api/habits/<habit_id>/note`
  - Save today's note (max 280 chars)

### Analytics

- `GET /api/analytics`
  - Habit-level totals, streak, weekly progress, on-track status
- `GET /api/analytics/weekly-trend`
  - 8-week trend data
- `GET /api/habits/<habit_id>/heatmap`
  - Habit completion dates
- `GET /api/heatmap/year`
  - Aggregated daily counts for past year
- `GET /api/export/csv`
  - Download analytics as CSV

### Utility

- `GET /`
  - Backend status message and quick endpoint list
- `GET /api/health`
  - Health check endpoint
- `POST /api/demo/seed`
  - Adds/syncs demo habits and historical logs (defaults to 30 days)
  - Optional body: `{ "days": 30 }` (range: 1 to 365)

## Data Model

### Habit

- `id` (PK)
- `name` (required)
- `icon`
- `color`
- `category` (default: `General`)
- `weekly_target` (1 to 7)
- `reminder_time` (`HH:MM` or null)
- `created_at`

### HabitLog

- `id` (PK)
- `habit_id` (FK -> Habit)
- `date`
- `completed` (bool)
- `note` (optional, max 280 chars)

## Key Product Flows

- Add habit with icon, color, category, weekly target, reminder time
- Mark complete from dashboard
- Add/edit today's note directly on dashboard cards
- Filter by completion status and category
- View performance and trends in analytics

## Frontend Scripts

From `frontend/`:

```bash
npm start
npm run build
npm test
```

## Backend Notes

- Database connection is read from `.env` using MySQL env vars or `DATABASE_URL`
- Uses `mysql+pymysql` SQLAlchemy driver with UTF-8 (`utf8mb4`) support
- CORS is enabled for local frontend development

## Troubleshooting

- If frontend cannot reach backend, verify backend is running on port 5000
- If backend starts but API fails, verify `.env` values and MySQL user permissions
- Confirm database and tables exist in MySQL (`habit_flow`, `habit`, `habit_log`)
- If demo seed fails, verify `POST /api/demo/seed` body uses `days` between 1 and 365
- If port is busy, change app run port in backend and update API base URL in frontend

## License

MIT License. See `LICENSE`.
