import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import SignIn from './components/Auth/SignIn';
import SignUp from './components/Auth/SignUp';
import Dashboard from './components/Dashboard/Dashboard';
import CalorieTracker from './components/CalorieTracker/CalorieTracker';
import WorkoutLog from './components/WorkoutLog/WorkoutLog';
import WeightTracker from './components/WeightTracker/WeightTracker';
import { Dumbbell, LogOut } from 'lucide-react';

type View = 'dashboard' | 'calories' | 'workouts' | 'weight';

function AppContent() {
  const { user, signOut } = useAuth();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [currentView, setCurrentView] = useState<View>('dashboard');

  if (!user) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Dumbbell className="w-12 h-12 text-blue-500" />
            </div>
            <h1 className="text-3xl font-bold">Modern Fitness Tracker</h1>
            <p className="text-gray-400 mt-2">Track your fitness journey</p>
          </div>

          {authMode === 'signin' ? (
            <SignIn onToggleMode={() => setAuthMode('signup')} />
          ) : (
            <SignUp onToggleMode={() => setAuthMode('signin')} />
          )}
        </div>
      </div>
    );
  }

  return (
    <DataProvider>
      <div className="min-h-screen bg-dark-bg">
        {/* Header */}
        <header className="glass border-b border-dark-border sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Dumbbell className="w-8 h-8 text-blue-500" />
                <h1 className="text-2xl font-bold">Fitness Tracker</h1>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-gray-400 text-sm">{user.email}</span>
                <button
                  onClick={signOut}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="glass border-b border-dark-border">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-2 overflow-x-auto py-2">
              {[
                { id: 'dashboard', label: 'Dashboard' },
                { id: 'calories', label: 'Calorie Tracker' },
                { id: 'workouts', label: 'Workout Log' },
                { id: 'weight', label: 'Weight Tracker' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as View)}
                  className={`px-6 py-2 rounded-lg whitespace-nowrap transition-colors ${currentView === item.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-dark-card hover:bg-dark-border text-gray-300'
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'calories' && <CalorieTracker />}
          {currentView === 'workouts' && <WorkoutLog />}
          {currentView === 'weight' && <WeightTracker />}
        </main>
      </div>
    </DataProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
