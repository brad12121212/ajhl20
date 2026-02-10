import { addHours } from "date-fns";

/** Events are "active" until 4 hours after start time; after that they're inactive (past). */
export function isEventActive(startTime: Date): boolean {
  return addHours(new Date(startTime), 4) > new Date();
}

/** Round a date to the nearest 5-minute increment (e.g. 6:52 → 6:50, 6:54 → 6:55). */
export function roundToNearest5Minutes(date: Date): Date {
  const d = new Date(date);
  const ms = d.getTime();
  const fiveMin = 5 * 60 * 1000;
  return new Date(Math.round(ms / fiveMin) * fiveMin);
}

export const LEAGUES = ["A", "B", "C", "D"] as const;
export const EVENT_TYPES = ["league", "extra"] as const;
export type League = (typeof LEAGUES)[number];
export type EventType = (typeof EVENT_TYPES)[number];
