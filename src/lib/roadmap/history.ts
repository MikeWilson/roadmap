import type { RoadmapData } from "@/app/api/generate-roadmap/schema";
import { encodeRoadmap } from "./url-codec";

const STORAGE_KEY = "roadmap-history";
const MAX_ENTRIES = 50;

export interface HistoryEntry {
  id: string;
  title: string;
  description: string;
  encodedData: string;
  createdAt: number;
}

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

export function saveToHistory(data: RoadmapData): void {
  const encoded = encodeRoadmap(data);
  const entries = getHistory();

  // Deduplicate by title (same roadmap regenerated)
  const existing = entries.findIndex((e) => e.title === data.title);
  if (existing !== -1) {
    entries.splice(existing, 1);
  }

  entries.unshift({
    id: crypto.randomUUID(),
    title: data.title,
    description: data.description,
    encodedData: encoded,
    createdAt: Date.now(),
  });

  // Cap at max entries
  if (entries.length > MAX_ENTRIES) {
    entries.length = MAX_ENTRIES;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  window.dispatchEvent(new Event("roadmap-history-change"));
}

export function removeFromHistory(id: string): void {
  const entries = getHistory().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  window.dispatchEvent(new Event("roadmap-history-change"));
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("roadmap-history-change"));
}
