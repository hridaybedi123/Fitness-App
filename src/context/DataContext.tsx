import React, { createContext, useContext } from 'react';
import { CalorieEntry, WorkoutData, WeightEntry } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface DataContextType {
  calories: CalorieEntry[];
  workouts: WorkoutData;
  weights: WeightEntry[];
  addCalorieEntry: (entry: Omit<CalorieEntry, 'id'>) => void;
  updateCalorieEntry: (id: string, entry: Partial<CalorieEntry>) => void;
  deleteCalorieEntry: (id: string) => void;
  addWorkoutEntry: (date: string, entry: { type: string; notes: string }) => void;
  deleteWorkoutEntry: (date: string) => void;
  addWeightEntry: (entry: Omit<WeightEntry, 'id'>) => void;
  updateWeightEntry: (id: string, entry: Partial<WeightEntry>) => void;
  deleteWeightEntry: (id: string) => void;
  clearAllData: () => void;
  importCalorieEntries: (entries: Omit<CalorieEntry, 'id'>[]) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [calories, setCalories] = useLocalStorage<CalorieEntry[]>('fitness-tracker-calories', []);
  const [workouts, setWorkouts] = useLocalStorage<WorkoutData>('fitness-tracker-workouts', {});
  const [weights, setWeights] = useLocalStorage<WeightEntry[]>('fitness-tracker-weights', []);

  const addCalorieEntry = (entry: Omit<CalorieEntry, 'id'>) => {
    const newEntry: CalorieEntry = {
      ...entry,
      id: `cal-${Date.now()}`,
    };
    setCalories([...calories, newEntry]);
  };

  const updateCalorieEntry = (id: string, updates: Partial<CalorieEntry>) => {
    setCalories(calories.map(entry =>
      entry.id === id ? { ...entry, ...updates } : entry
    ));
  };

  const deleteCalorieEntry = (id: string) => {
    setCalories(calories.filter(entry => entry.id !== id));
  };

  const importCalorieEntries = (newEntries: Omit<CalorieEntry, 'id'>[]) => {
    const timestamp = Date.now();
    const entriesWithIds = newEntries.map((entry, index) => ({
      ...entry,
      id: `cal-${timestamp}-${index}`,
    }));
    setCalories([...calories, ...entriesWithIds]);
  };

  const addWorkoutEntry = (date: string, entry: { type: string; notes: string }) => {
    setWorkouts({
      ...workouts,
      [date]: entry as any,
    });
  };

  const deleteWorkoutEntry = (date: string) => {
    const newWorkouts = { ...workouts };
    delete newWorkouts[date];
    setWorkouts(newWorkouts);
  };

  const addWeightEntry = (entry: Omit<WeightEntry, 'id'>) => {
    const newEntry: WeightEntry = {
      ...entry,
      id: `weight-${Date.now()}`,
    };
    setWeights([...weights, newEntry]);
  };

  const updateWeightEntry = (id: string, updates: Partial<WeightEntry>) => {
    setWeights(weights.map(entry =>
      entry.id === id ? { ...entry, ...updates } : entry
    ));
  };

  const deleteWeightEntry = (id: string) => {
    setWeights(weights.filter(entry => entry.id !== id));
  };

  const clearAllData = () => {
    setCalories([]);
    setWorkouts({});
    setWeights([]);
  };

  return (
    <DataContext.Provider
      value={{
        calories,
        workouts,
        weights,
        addCalorieEntry,
        updateCalorieEntry,
        deleteCalorieEntry,
        addWorkoutEntry,
        deleteWorkoutEntry,
        addWeightEntry,
        updateWeightEntry,
        deleteWeightEntry,
        clearAllData,
        importCalorieEntries,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
