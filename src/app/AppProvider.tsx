import React, { createContext, useContext, useState } from "react";

export interface Exercise {
  exercise: string;
  sets: Array<{
    reps: number;
    weight: number;
  }>;
}

export interface WorkoutLog {
  type: "workout";
  date: string;
  time: string;
  exercises: Exercise[];
  note?: string;
  title?: string;
}

export interface MindsetLog {
  type: "mindset";
  date: string;
  time: string;
  mood: string;
  notes: string;
}

export interface SleepLog {
  type: "sleep";
  date: string;
  time: string;
  duration: number;
  quality: number;
  notes: string;
}

export interface NutritionLog {
  type: "nutrition";
  date: string;
  time: string;
  meals: string[];
  notes: string;
}

export type Log = WorkoutLog | MindsetLog | SleepLog | NutritionLog;

interface AppContextType {
  logs: Log[];
  addLog: (log: Log) => void;
  setLogs: React.Dispatch<React.SetStateAction<Log[]>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<Log[]>([]);

  const addLog = (log: Log) => {
    setLogs((prevLogs) => [...prevLogs, log]);
  };

  return (
    <AppContext.Provider value={{ logs, addLog, setLogs }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
