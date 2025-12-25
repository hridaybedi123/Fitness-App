import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { WorkoutType } from '../../types';
import MonthlyStepsChart from './MonthlyStepsChart';

export default function WorkoutLog() {
  const { workouts, addWorkoutEntry, deleteWorkoutEntry } = useData();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: '' as WorkoutType,
    notes: '',
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDayClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setSelectedDate(dateStr);
    const existing = workouts[dateStr];
    if (existing) {
      setFormData({
        type: existing.type,
        notes: existing.notes,
      });
    } else {
      setFormData({
        type: '',
        notes: '',
      });
    }
  };

  const handleSave = () => {
    if (!selectedDate) return;

    addWorkoutEntry(selectedDate, formData);
    setSelectedDate(null);
    setFormData({ type: '', notes: '' });
  };

  const handleDelete = () => {
    if (!selectedDate) return;
    deleteWorkoutEntry(selectedDate);
    setSelectedDate(null);
    setFormData({ type: '', notes: '' });
  };

  const getWorkoutColor = (type: WorkoutType) => {
    switch (type) {
      case 'Push': return 'bg-red-500';
      case 'Pull': return 'bg-blue-500';
      case 'Legs': return 'bg-green-500';
      case 'Rest': return 'bg-gray-500';
      default: return 'bg-transparent';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Workout Log</h2>
        <p className="text-gray-400">Track your training split and progress</p>
      </div>

      {/* Legend */}
      <div className="glass rounded-xl p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm">Push</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm">Pull</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm">Legs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-500 rounded"></div>
            <span className="text-sm">Rest</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-dark-border rounded-lg">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold">
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
            <button onClick={handleNextMonth} className="p-2 hover:bg-dark-border rounded-lg">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
                {day}
              </div>
            ))}

            {/* Empty cells for days before month starts */}
            {Array.from({ length: monthStart.getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Days of month */}
            {daysInMonth.map(date => {
              const dateStr = format(date, 'yyyy-MM-dd');
              const workout = workouts[dateStr];
              const isSelected = selectedDate === dateStr;
              const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr;

              return (
                <button
                  key={dateStr}
                  onClick={() => handleDayClick(date)}
                  className={`aspect-square p-2 rounded-lg border-2 transition-all ${isSelected
                    ? 'border-blue-500 bg-blue-500/20'
                    : isToday
                      ? 'border-blue-500/50'
                      : 'border-transparent hover:border-dark-border'
                    } ${workout ? 'bg-dark-card' : ''}`}
                >
                  <div className="text-sm">{format(date, 'd')}</div>
                  {workout && (
                    <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${getWorkoutColor(workout.type)}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Edit Panel */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">
            {selectedDate ? format(parseISO(selectedDate), 'MMM dd, yyyy') : 'Select a date'}
          </h3>

          {selectedDate ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Workout Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as WorkoutType })}
                  className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select type</option>
                  <option value="Push">Push</option>
                  <option value="Pull">Pull</option>
                  <option value="Legs">Legs</option>
                  <option value="Rest">Rest</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg focus:outline-none focus:border-blue-500 min-h-[120px]"
                  placeholder="Add notes about your workout..."
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Save
                </button>
                {workouts[selectedDate] && (
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Click on a date to add or edit workout
            </div>
          )}
        </div>
      </div>

      {/* Monthly Steps Chart */}
      <MonthlyStepsChart />
    </div>
  );
}
