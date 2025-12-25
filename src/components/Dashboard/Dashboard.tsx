import React from 'react';
import { useData } from '../../context/DataContext';
import { format, subDays, parseISO } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Target, Flame, Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import CalorieDeficitSurplusChart from './CalorieDeficitSurplusChart';
import WorkoutConsistency from './WorkoutConsistency';
import { isSameMonth, addMonths, subMonths } from 'date-fns';

export default function Dashboard() {
  const { calories, workouts, weights } = useData();

  const [weightDate, setWeightDate] = React.useState(new Date());

  // Get last 30 days of data
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    return format(date, 'yyyy-MM-dd');
  });

  // Calculate calorie trends
  const calorieChartData = last30Days.map(day => {
    const entry = calories.find(c => c.day === day);
    const net = entry ? (entry.intake || 0) - (entry.exercise || 0) : 0;
    const deficit = entry && entry.target ? entry.target - net : 0;

    return {
      date: format(parseISO(day), 'MM/dd'),
      net,
      target: entry?.target || 0,
      deficit,
    };
  });

  // Calculate weight trends for selected month
  const weightChartData = weights
    .filter(w => {
      const date = parseISO(w.date);
      return isSameMonth(date, weightDate);
    })
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(w => ({
      date: format(parseISO(w.date), 'MM/dd'),
      weight: w.weight,
    }));

  // Calculate stats
  const recentCalories = calories.slice(-7);
  const avgNet = recentCalories.length > 0
    ? recentCalories.reduce((sum, c) => sum + ((c.intake || 0) - (c.exercise || 0)), 0) / recentCalories.length
    : 0;

  const recentWeights = weights.slice(-2).sort((a, b) => a.date.localeCompare(b.date));
  const weightChange = recentWeights.length === 2
    ? recentWeights[1].weight - recentWeights[0].weight
    : 0;

  const workoutCount = Object.entries(workouts).filter(([date, entry]) => {
    const workoutDate = parseISO(date);
    return workoutDate >= subDays(new Date(), 7) && entry.type !== 'Rest' && entry.type !== '';
  }).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
        <p className="text-gray-400">Your fitness journey at a glance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Flame className="w-6 h-6 text-blue-500" />
            </div>
            {avgNet > 0 ? (
              <TrendingUp className="w-5 h-5 text-green-500" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-500" />
            )}
          </div>
          <p className="text-gray-400 text-sm mb-1">Avg Daily Net (7d)</p>
          <p className="text-3xl font-bold">{Math.round(avgNet)}</p>
          <p className="text-xs text-gray-500 mt-1">kcal/day</p>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Activity className="w-6 h-6 text-purple-500" />
            </div>
            {weightChange < 0 ? (
              <TrendingDown className="w-5 h-5 text-green-500" />
            ) : weightChange > 0 ? (
              <TrendingUp className="w-5 h-5 text-red-500" />
            ) : null}
          </div>
          <p className="text-gray-400 text-sm mb-1">Weight Change</p>
          <p className="text-3xl font-bold">
            {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)}
          </p>
          <p className="text-xs text-gray-500 mt-1">lbs (recent)</p>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Target className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-1">Workouts (7d)</p>
          <p className="text-3xl font-bold">{workoutCount}</p>
          <p className="text-xs text-gray-500 mt-1">sessions</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calorie Chart */}
        <CalorieDeficitSurplusChart />

        {/* Weight Chart */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Weight Trends</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setWeightDate(prev => subMonths(prev, 1))}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-medium min-w-[140px] text-center">
                {format(weightDate, 'MMMM yyyy')}
              </span>
              <button
                onClick={() => setWeightDate(prev => addMonths(prev, 1))}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                disabled={isSameMonth(weightDate, new Date()) && weightDate > new Date()}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          {weightChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weightChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="date" stroke="#666" />
                <YAxis stroke="#666" domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    borderRadius: '8px',
                  }}
                />
                <Line type="monotone" dataKey="weight" stroke="#a855f7" strokeWidth={2} name="Weight (lbs)" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No weight data available for this month
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <WorkoutConsistency />
    </div>
  );
}
