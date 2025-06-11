import React, { createContext, useContext, useState } from "react";

type Mood = "Focused" | "Tired" | "Distracted" | "Driven";

type WorkoutLog = {
  date: string;
  lifts: { exercise: string; sets: number; reps: number; weight: number }[];
  notes?: string;
};

type AppContextType = {
  mood: Mood;
  setMood: (m: Mood) => void;
  logs: WorkoutLog[];
  addLog: (log: WorkoutLog) => void;
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [mood, setMood] = useState<Mood>("Driven");
  const [logs, setLogs] = useState<WorkoutLog[]>([]);

  const addLog = (log: WorkoutLog) => setLogs((prev) => [log, ...prev]);

  return (
    <AppContext.Provider value={{ mood, setMood, logs, addLog }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext)!;
