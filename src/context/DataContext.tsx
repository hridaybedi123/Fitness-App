import React, { createContext, useContext, useState, useEffect } from 'react';
import { CalorieEntry, WorkoutData, WeightEntry } from '../types';
import { supabase } from '../supabase';
import { useAuth } from './AuthContext';

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
  const [calories, setCalories] = useState<CalorieEntry[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutData>({});
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const { user } = useAuth(); // We need the user ID for database queries

  // Fetch initial data when user logs in
  useEffect(() => {
    if (!user) {
      setCalories([]);
      setWorkouts({});
      setWeights([]);
      return;
    }

    const fetchData = async () => {
      // Fetch Calories
      const { data: calData } = await supabase
        .from('Calories')
        .select('*')
        .order('day', { ascending: false });

      if (calData) setCalories(calData);

      // Fetch Workouts
      const { data: workoutData } = await supabase
        .from('workouts')
        .select('*');

      if (workoutData) {
        // Convert array of rows back to object map: { date: { type, notes } }
        const workoutMap: WorkoutData = {};
        workoutData.forEach((w: any) => {
          workoutMap[w.date] = { type: w.type as any, notes: w.notes };
        });
        setWorkouts(workoutMap);
      }

      // Fetch Weights
      const { data: weightData } = await supabase
        .from('Weights')
        .select('*')
        .order('date', { ascending: true });

      if (weightData) setWeights(weightData);
    };

    fetchData();
  }, [user]);

  const addCalorieEntry = async (entry: Omit<CalorieEntry, 'id'>) => {
    if (!user) return;

    // Optimistic UI update
    const tempId = `temp-${Date.now()}`;
    const newEntry = { ...entry, id: tempId, user_id: user.uid };
    setCalories(prev => [newEntry, ...prev]);

    const { data, error } = await supabase
      .from('Calories')
      .insert([{
        day: entry.day,
        target: entry.target,
        exercise: entry.exercise,
        intake: entry.intake,
        steps: entry.steps,
        user_id: user.uid
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding calorie entry:', error);
      // Revert optimistic update
      setCalories(prev => prev.filter(c => c.id !== tempId));
    } else if (data) {
      // Replace temp ID with real ID
      setCalories(prev => prev.map(c => c.id === tempId ? data : c));
    }
  };

  const updateCalorieEntry = async (id: string, updates: Partial<CalorieEntry>) => {
    if (!user) return;

    setCalories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));

    const { error } = await supabase
      .from('Calories')
      .update({
        target: updates.target,
        exercise: updates.exercise,
        intake: updates.intake,
        steps: updates.steps,
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating calorie entry:', error);
      // Ideally fetch data again to revert, or handle error UI
    }
  };

  const deleteCalorieEntry = async (id: string) => {
    if (!user) return;

    const original = calories;
    setCalories(prev => prev.filter(c => c.id !== id));

    const { error } = await supabase
      .from('Calories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting calorie entry:', error);
      setCalories(original);
    }
  };

  const importCalorieEntries = async (newEntries: Omit<CalorieEntry, 'id'>[]) => {
    if (!user) return;

    const entriesWithUser = newEntries.map(e => ({
      day: e.day,
      target: e.target,
      exercise: e.exercise,
      intake: e.intake,
      steps: e.steps,
      user_id: user.uid
    }));

    const { data, error } = await supabase
      .from('Calories')
      .insert(entriesWithUser)
      .select();

    if (error) {
      console.error('Error importing:', error);
      alert('Import failed');
    } else if (data) {
      setCalories(prev => [...prev, ...data]);
    }
  };

  const addWorkoutEntry = async (date: string, entry: { type: string; notes: string }) => {
    if (!user) return;

    console.log('Adding workout:', date, entry);
    setWorkouts(prev => ({ ...prev, [date]: { ...entry, type: entry.type as any } }));

    // Check if exists to decide upsert or insert? Supabase 'upsert' works best
    const { data: upsertData, error } = await supabase
      .from('workouts')
      .upsert({
        date,
        type: entry.type,
        notes: entry.notes,
        user_id: user.uid
      }, { onConflict: 'date, user_id' })
      .select();

    if (error) {
      console.error('Error saving workout (Supabase):', error);
      console.error('If error is 409 or constraint related, you may need a unique constraint on (date, user_id)');
    } else {
      console.log('Workout saved successfully:', upsertData);
    }
  };

  const deleteWorkoutEntry = async (date: string) => {
    if (!user) return;

    const newWorkouts = { ...workouts };
    delete newWorkouts[date];
    setWorkouts(newWorkouts);

    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('date', date)
      .eq('user_id', user.uid); // Safety check

    if (error) console.error('Error deleting workout:', error);
  };

  const addWeightEntry = async (entry: Omit<WeightEntry, 'id'>) => {
    if (!user) return;

    const tempId = `temp-${Date.now()}`;
    setWeights(prev => [...prev, { ...entry, id: tempId }]);

    const { data, error } = await supabase
      .from('Weights')
      .insert([{
        date: entry.date,
        weight: entry.weight,
        user_id: user.uid
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding weight:', error);
      setWeights(prev => prev.filter(w => w.id !== tempId));
    } else if (data) {
      setWeights(prev => prev.map(w => w.id === tempId ? data : w));
    }
  };

  const updateWeightEntry = async (id: string, updates: Partial<WeightEntry>) => {
    if (!user) return;

    setWeights(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));

    const { error } = await supabase
      .from('Weights')
      .update({ weight: updates.weight, date: updates.date }) // only fields needed
      .eq('id', id);

    if (error) console.error('Error updating weight:', error);
  };

  const deleteWeightEntry = async (id: string) => {
    if (!user) return;
    setWeights(prev => prev.filter(w => w.id !== id));

    const { error } = await supabase
      .from('Weights')
      .delete()
      .eq('id', id);

    if (error) console.error('Error deleting weight:', error);
  };

  const clearAllData = async () => {
    if (!user) return;

    // Clear UI
    setCalories([]);
    setWorkouts({});
    setWeights([]);

    // Clear DB - 3 delete calls
    await supabase.from('Calories').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
    await supabase.from('workouts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('Weights').delete().neq('id', '00000000-0000-0000-0000-000000000000');
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
