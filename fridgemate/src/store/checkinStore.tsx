"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import type { CookingDoneEvent } from "@/types";

export interface CheckinState {
  history: CookingDoneEvent[];
  lastCookedDate: string | null; // YYYY-MM-DD
  streak: number;
}

export type CheckinAction =
  | { type: "RECORD"; event: CookingDoneEvent }
  | { type: "HYDRATE"; state: CheckinState };

const INITIAL: CheckinState = {
  history: [],
  lastCookedDate: null,
  streak: 0,
};

export function dateKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function computeNextStreak(
  prevDate: string | null,
  prevStreak: number,
  today: string
): number {
  if (prevDate === today) return prevStreak;
  if (!prevDate) return 1;
  const prev = new Date(prevDate);
  const cur = new Date(today);
  const diffDays = Math.round(
    (cur.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
  );
  return diffDays === 1 ? prevStreak + 1 : 1;
}

export function checkinReducer(s: CheckinState, a: CheckinAction): CheckinState {
  switch (a.type) {
    case "RECORD": {
      const today = dateKey(a.event.timestamp);
      return {
        history: [...s.history, a.event],
        lastCookedDate: today,
        streak: computeNextStreak(s.lastCookedDate, s.streak, today),
      };
    }
    case "HYDRATE":
      return a.state;
  }
}

interface CheckinContextValue {
  history: CookingDoneEvent[];
  streak: number;
  lastCookedDate: string | null;
  recordCooking: (recipeId: string) => { oldStreak: number; newStreak: number };
}

const CheckinContext = createContext<CheckinContextValue | null>(null);
const STORAGE_KEY = "fridgemate:checkin";

export function CheckinProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(checkinReducer, INITIAL);

  useEffect(() => {
    const raw =
      typeof window !== "undefined"
        ? localStorage.getItem(STORAGE_KEY)
        : null;
    if (raw) {
      try {
        dispatch({ type: "HYDRATE", state: JSON.parse(raw) });
      } catch {
        // ignore corrupted state
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const value: CheckinContextValue = useMemo(
    () => ({
      history: state.history,
      streak: state.streak,
      lastCookedDate: state.lastCookedDate,
      recordCooking: (recipeId) => {
        const old = state.streak;
        const today = dateKey(Date.now());
        const next = computeNextStreak(state.lastCookedDate, old, today);
        dispatch({
          type: "RECORD",
          event: { recipeId, timestamp: Date.now() },
        });
        return { oldStreak: old, newStreak: next };
      },
    }),
    [state]
  );

  return (
    <CheckinContext.Provider value={value}>{children}</CheckinContext.Provider>
  );
}

export function useCheckinStore(): CheckinContextValue {
  const ctx = useContext(CheckinContext);
  if (!ctx)
    throw new Error("useCheckinStore must be used inside <CheckinProvider>");
  return ctx;
}
