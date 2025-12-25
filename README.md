# Modern Fitness Tracker - Prototype

A fully functional fitness tracking application built with React, TypeScript, and Tailwind CSS. This prototype uses local storage instead of Firebase, allowing you to test all features without any backend setup.

## Features

- 🔐 **Authentication** - Mock sign in/sign up (stored locally)
- 📊 **Dashboard** - Visual overview with charts and statistics
- 🍽️ **Calorie Tracker** - Track daily intake, exercise, and targets
- 💪 **Workout Log** - Calendar-based workout planning
- ⚖️ **Weight Tracker** - Monitor weight changes over time
- 🎨 **Modern UI** - Dark theme with glassmorphism effects

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## How to Use

1. **Sign In/Sign Up**: Use any email and password (stored locally)
2. **Navigate**: Use the top navigation to switch between sections
3. **Add Data**: Click "Add Entry" buttons to input your fitness data
4. **View Progress**: Check the dashboard for trends and statistics

## Testing Notes

- All data is stored in browser's localStorage
- No internet connection required
- Data persists between sessions (same browser)
- Sign out clears all data
- Each "user" can have their own data set

## Data Storage

The app stores:
- User authentication state
- Calorie entries (day, target, exercise, intake)
- Workout logs (type, notes by date)
- Weight entries (date, weight)

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **date-fns** - Date manipulation
- **Lucide React** - Icons

## Project Structure

```
src/
├── components/
│   ├── Auth/           # Sign in/Sign up
│   ├── Dashboard/      # Overview with charts
│   ├── CalorieTracker/ # Calorie management
│   ├── WorkoutLog/     # Workout calendar
│   └── WeightTracker/  # Weight tracking
├── context/
│   ├── AuthContext.tsx # Authentication state
│   └── DataContext.tsx # Data management
├── hooks/
│   └── useLocalStorage.ts # Local storage hook
├── types.ts            # TypeScript interfaces
└── App.tsx             # Main app component
```

## Future Migration to Firebase

When ready to add Firebase:
1. Replace `useLocalStorage` with Firestore queries
2. Update `AuthContext` to use Firebase Auth
3. Update `DataContext` to sync with Firestore
4. Add Firebase configuration

The data structures are already designed to match Firestore's format.

## License

MIT
