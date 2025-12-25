# 🚀 Quick Start Guide

## Your App is Running!

**URL:** http://localhost:5173/

## What You Can Do Now

### 1. Sign In / Sign Up
- Use **any email and password** (e.g., `test@example.com` / `password123`)
- No real authentication - all stored locally in your browser
- Each browser session can have different users

### 2. Dashboard
- View your fitness overview with charts
- See 30-day calorie trends
- Monitor weight changes
- Track recent workouts
- Get quick stats (7-day averages, weight changes)

### 3. Calorie Tracker
- Add daily entries with:
  - **Target**: Your calorie goal
  - **Exercise**: Calories burned
  - **Intake**: Calories consumed
- Automatically calculates:
  - **Net**: Intake - Exercise
  - **Surplus/Deficit**: Target - Net
- Edit or delete any entry
- View all entries in a sortable table

### 4. Workout Log
- Calendar view for the month
- Click any day to add/edit workouts
- Workout types:
  - **Push** (Red) - Chest, shoulders, triceps
  - **Pull** (Blue) - Back, biceps
  - **Legs** (Green) - Leg day
  - **Rest** (Gray) - Recovery
- Add notes for each workout
- Visual color coding on calendar

### 5. Weight Tracker
- Log weight entries with date
- View weight trend chart
- See statistics:
  - Current weight
  - Total change
  - Average weight
- Edit or delete entries
- Track progress over time

## Testing Tips

### Sample Data to Try

**Calorie Entry:**
- Date: Today
- Target: 2000 kcal
- Exercise: 400 kcal
- Intake: 1800 kcal
- Result: Net = 1400, Deficit = 600

**Workout Entry:**
- Select today on calendar
- Type: Push
- Notes: "Bench press 3x10, Shoulder press 3x12"

**Weight Entry:**
- Date: Today
- Weight: 175.5 lbs

### Flow Testing

1. **Sign up** with a new email
2. **Add 5-7 calorie entries** over different days
3. **Log workouts** for the past week
4. **Add weight entries** weekly
5. **Check Dashboard** to see all data visualized

## Features Implemented

✅ Mock authentication (no Firebase needed)
✅ Local storage persistence
✅ Full CRUD operations (Create, Read, Update, Delete)
✅ Data visualization with charts
✅ Responsive design
✅ Dark theme with glassmorphism
✅ Calendar-based workout planning
✅ Real-time calculations
✅ Form validation
✅ Inline editing

## Development Commands

```bash
# Stop the server
pkill -f "vite"

# Start the server again
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Data Storage

All data is stored in your browser's localStorage:
- `fitness-tracker-user` - User authentication
- `fitness-tracker-calories` - Calorie entries
- `fitness-tracker-workouts` - Workout logs
- `fitness-tracker-weights` - Weight entries

**To reset:** Sign out or clear localStorage in browser DevTools

## Browser DevTools

Press `F12` to open DevTools and:
- **Console**: See any errors or logs
- **Application > Local Storage**: View stored data
- **Network**: Monitor API calls (none currently)

## Known Behaviors

- Data persists in the same browser
- Different browsers = different data sets
- Sign out clears all data
- Dates use ISO format (YYYY-MM-DD)
- Workout calendar shows current month by default

## Next Steps

When ready to add Firebase:
1. Create Firebase project
2. Enable Authentication & Firestore
3. Replace localStorage hooks with Firebase calls
4. Update AuthContext with Firebase Auth
5. Update DataContext with Firestore queries

The data structure is already Firebase-compatible!

## Need Help?

Check the README.md for full documentation and project structure details.

---

**Happy Testing! 💪**
