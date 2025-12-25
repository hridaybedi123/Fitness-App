export interface CalorieEntry {
  id: string;
  day: string; // ISO Date string (YYYY-MM-DD)
  target: number | null;
  exercise: number | null;
  intake: number | null;
  steps?: number | null;
}

export type WorkoutType = 'Push' | 'Pull' | 'Legs' | 'Rest' | '';

export interface WorkoutEntry {
  type: WorkoutType;
  notes: string;
}

export interface WorkoutData {
  [date: string]: WorkoutEntry; // key is ISO Date string (YYYY-MM-DD)
}

export interface WeightEntry {
  id: string;
  date: string; // ISO Date string (YYYY-MM-DD)
  weight: number;
}

export interface UserData {
  calories: CalorieEntry[];
  workouts: WorkoutData;
  weights: WeightEntry[];
}

export interface User {
  uid: string;
  email: string;
}
