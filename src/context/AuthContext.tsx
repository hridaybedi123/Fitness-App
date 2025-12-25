import React, { createContext, useContext, useState } from 'react';
import { User } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useLocalStorage<User | null>('fitness-tracker-user', null);
  const [loading, setLoading] = useState(false);

  const signIn = async (email: string, _password: string) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock authentication - in production this would validate against Firebase
    const mockUser: User = {
      uid: `user-${Date.now()}`,
      email: email,
    };
    setUser(mockUser);
    setLoading(false);
  };

  const signUp = async (email: string, _password: string) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock authentication
    const mockUser: User = {
      uid: `user-${Date.now()}`,
      email: email,
    };
    setUser(mockUser);
    setLoading(false);
  };

  const signOut = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setUser(null);
    // Clear all data on sign out
    localStorage.removeItem('fitness-tracker-calories');
    localStorage.removeItem('fitness-tracker-workouts');
    localStorage.removeItem('fitness-tracker-weights');
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
