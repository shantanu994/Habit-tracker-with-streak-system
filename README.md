# HabitFlow - Habit Tracker with Streak System

A modern, user-friendly habit tracking application designed to help you build consistency and maintain streaks. Track your daily habits, visualize your progress with analytics, and celebrate your achievements with streak counts.

## Features

- **Daily Dashboard** - View all your habits at a glance with today's completion status and current streaks
- **Quick Toggle** - Mark habits as complete with a single click
- **Progress Tracking** - See your daily progress percentage and completion count
- **Analytics Dashboard** - Visualize your habit data with:
  - GitHub-style contribution heatmap showing daily completions over the past year
  - Bar charts showing total completions per habit
  - Pie charts for habit distribution
  - Current streak and total completion counts
- **Contribution Heatmap** - Beautiful year-long heatmap with:
  - 7-day rows × 52-week columns layout
  - Color intensity based on daily habit completions
  - Hover tooltips showing date and completion count
  - Month labels for easy navigation
  - Fully responsive on mobile, tablet, and desktop
- **Customization** - Choose custom icons and colors for each habit
- **Streak Counter** - Track consecutive days of habit completion
- **Responsive Design** - Modern dark theme UI that works on desktop and mobile
- **Persistent Storage** - SQLite database for reliable data persistence
- **Error Handling** - Graceful error messages for network issues and validation

## Tech Stack

### Backend

- **Python 3.x** with Flask web framework
- **SQLAlchemy** ORM for database management
- **SQLite** for data persistence
- **Flask-CORS** for cross-origin requests
- RESTful API architecture

### Frontend

- **React 19** - Modern UI library
- **Axios** - HTTP client for API calls
- **Recharts** - Data visualization library
- **CSS3** - Custom styling with CSS variables and grid/flexbox
- Modern ES6+ JavaScript

## Project Structure

```
Habit-tracker-with-streak-system/
├── Backend/
│   ├── app.py              # Flask application & API routes
│   ├── models.py           # SQLAlchemy database models
│   ├── requirements.txt    # Python dependencies
│   ├── habits.db           # SQLite database (auto-generated)
│   └── instance/           # Flask instance folder
├── frontend/
│   ├── public/
│   │   ├── index.html      # HTML entry point
│   │   └── manifest.json   # PWA manifest
│   ├── src/
│   │   ├── App.js          # Main app component with routing
│   │   ├── index.js        # React entry point
│   │   ├── index.css       # Global styles
│   │   ├── main.jsx        # Main layout component
│   │   ├── api/
│   │   │   └── habits.js   # API client with Axios
│   │   ├── components/
│   │   │   ├── ContributionHeatmap.jsx  # GitHub-style heatmap component
│   │   │   └── ContributionHeatmap.css  # Heatmap styling
│   │   └── pages/
│   │       ├── Dashboard.jsx    # Today's habits view
│   │       ├── AddHabit.jsx     # Add/manage habits
│   │       └── Analytics.jsx    # Analytics & charts
│   ├── package.json        # Node dependencies
│   └── README.md
├── LICENSE
└── README.md (this file)
```

## Getting Started

### Prerequisites

- **Python 3.8+** - For the backend
- **Node.js 16+** - For the frontend
- **npm or yarn** - Package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/Habit-tracker-with-streak-system.git
   cd Habit-tracker-with-streak-system
   ```

2. **Setup Backend**

   ```bash
   cd Backend

   # Create a virtual environment
   python -m venv venv

   # Activate virtual environment
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate

   # Install dependencies
   pip install -r requirements.txt
   ```

3. **Setup Frontend**

   ```bash
   cd ../frontend

   # Install dependencies
   npm install
   ```

## Running the Application

### Start the Backend Server

```bash
cd Backend

# Activate virtual environment (if not already activated)
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

# Run the Flask app
python app.py
```

The backend will start on `http://localhost:5000`

You'll see output like:

```
==================================================
HabitFlow Backend Starting...
Backend running on: http://localhost:5000
CORS enabled for frontend
==================================================
```

### Start the Frontend Application

In a new terminal:

```bash
cd frontend

# Start the React development server
npm start
```

The frontend will open at `http://localhost:3000`

## Usage

### Dashboard (Today's View)

- **View today's habits** - See all your habits with completion status
- **Mark habits complete** - Click the checkbox to toggle completion
- **Track progress** - View your daily completion percentage
- **Monitor streaks** - See your current streak for each habit

### Add Habit

- **Create new habits** - Enter a name, choose an icon and color
- **Customize appearance** - Pick from 10 icons and 8 colors
- **View all habits** - See and manage all your created habits
- **Delete habits** - Remove habits you no longer want to track

### Analytics

- **View statistics** - Total completions and current streaks for all habits
- **Completion chart** - Bar chart showing completions per habit
- **Habit distribution** - Pie chart showing habit proportions
- **90-Day heatmap** - Visualization of completion patterns over time
- **Habit details** - Click on habit cards to view their heatmap

## API Endpoints

### GET `/api/today`

Retrieve all habits with today's completion status and streaks

```json
[
  {
    "id": 1,
    "name": "Drink Water",
    "icon": "water",
    "color": "#3b82f6",
    "completed_today": true,
    "streak": 15
  }
]
```

### POST `/api/habits`

Create a new habit

```json
{
  "name": "Morning Exercise",
  "icon": "exercise",
  "color": "#ef4444"
}
```

### DELETE `/api/habits/<id>`

Delete a habit by ID

### POST `/api/habits/<id>/complete`

Toggle habit completion for today

### GET `/api/analytics`

Get analytics data for all habits

```json
[
  {
    "id": 1,
    "name": "Drink Water",
    "total_completions": 45,
    "current_streak": 15
  }
]
```

### GET `/api/habits/<id>/heatmap`

Get completion history for a specific habit (90 days)

### GET `/api/heatmap/year`

Get daily habit completion counts for the past year (used for contribution heatmap)

**Response:**
```json
[
  {"date": "2024-04-11", "count": 3},
  {"date": "2024-04-12", "count": 1},
  {"date": "2024-04-13", "count": 0}
]
```

Returns 365 days of data with daily aggregated completions across all habits.

## Configuration

### Backend Configuration

Edit `Backend/app.py` to change:

- Database location: `app.config['SQLALCHEMY_DATABASE_URI']`
- Server port: `app.run(port=5000)`
- Debug mode: `app.run(debug=True)`

### Frontend Configuration

API base URL is configured in `frontend/src/api/habits.js`:

```javascript
const BASE = "http://localhost:5000/api";
```

Change this if you're running the backend on a different URL.

## Database Schema

### Habit Table

- `id` - Primary key
- `name` - Habit name (required)
- `icon` - Icon identifier (default: star)
- `color` - Hex color code (default: #6366f1)
- `created_at` - Creation date

### HabitLog Table

- `id` - Primary key
- `habit_id` - Foreign key to Habit
- `date` - Log date
- `completed` - Boolean completion status

## UI Customization

The application uses CSS variables and glassmorphism effects for a modern, sleek design. Edit `frontend/src/index.css` to customize:

```css
:root {
  --accent: #6366f1; /* Primary accent color (indigo) */
  --pink: #ec4899; /* Pink accent */
  --amber: #f59e0b; /* Amber accent */
  --green: #10b981; /* Green accent */
  --text: #f1f5f9; /* Text color */
  --muted: rgba(255, 255, 255, 0.4); /* Muted text */
  --glass: rgba(255, 255, 255, 0.06); /* Glass effect background */
  --glass-border: rgba(255, 255, 255, 0.12); /* Glass effect border */
  --glass-hover: rgba(255, 255, 255, 0.1); /* Glass effect on hover */
}
```

Features include animated background blobs, smooth transitions, hover effects, and a modern fixed bottom navigation bar.

## Error Handling

The application includes comprehensive error handling:

- **Network errors** - Shows helpful messages if backend is unreachable
- **Validation errors** - Prevents empty habit names
- **API errors** - Clear error messages from backend
- **Retry functionality** - Users can retry failed requests

## Recent Improvements

- **GitHub-Style Contribution Heatmap** ✨ New!
  - Year-long visualization of daily habit completions
  - 7-row × 52-column grid layout (days × weeks)
  - 5-level color intensity system (gray to vibrant green)
  - Hover tooltips with date and completion count
  - Month labels for easy navigation
  - Fully responsive design (desktop, tablet, mobile)
  - No external visualization libraries needed
  - Automatic data aggregation from all habits
- Added comprehensive error handling and validation
- Improved user feedback with success/error messages
- Added loading states for better UX
- Enhanced error recovery with retry functionality
- Better error messages for network issues
- Input validation on backend
- Axios interceptors for error handling
- Startup logging for debugging
- **Enhanced CSS Styling** - Updated `index.css` with:
  - Glassmorphism UI effects with backdrop filters
  - Animated background blobs for visual appeal
  - Improved color palette with accent colors (indigo, pink, amber, green)
  - Better spacing and layout with modern flexbox/grid
  - Smooth transitions and animations throughout the UI
  - Fixed bottom navbar with floating design
  - Enhanced visual hierarchy and readability

## Contribution Heatmap Guide

The Analytics page now includes a **GitHub-style contribution heatmap** that visualizes your habit completion patterns over the past year.

### How It Works

- **7 Rows** = Days of the week (Monday through Sunday)
- **52+ Columns** = Weeks of the past year
- **Each Cell** = One day of data
- **Color Intensity** = Number of habits completed that day

### Color System

```
░ Empty (Gray)       = 0 habits completed
░ Light Green        = 1 habit completed
▓ Medium Green       = 2 habits completed  
▓ Dark Green         = 3 habits completed
█ Vibrant Green      = 4+ habits completed
```

### Features

✅ Hover over any cell to see the exact date and completion count  
✅ Month labels automatically aligned across the top  
✅ Refresh button to reload data  
✅ Fully responsive - adapts to mobile, tablet, and desktop screens  
✅ Fast performance - aggregates data efficiently  
✅ No external charting library required  

The contribution heatmap appears at the top of the Analytics page and provides a quick visual overview of your entire year of habit tracking and consistency patterns.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Troubleshooting

### Backend won't start

- Ensure Python 3.8+ is installed
- Check that port 5000 is not in use: `lsof -i :5000` (macOS/Linux)
- Delete `habits.db` to reset the database

### Frontend can't connect to backend

- Verify backend is running on `http://localhost:5000`
- Check CORS is enabled (should see message on backend startup)
- Clear browser cache and reload

### No habits showing

- Check backend logs for errors
- Ensure database file `Backend/habits.db` exists
- Try creating a new habit

## Support

For support, open an issue on GitHub or contact the maintainers.

---
