const store = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW: Record<string, number> = {
  "/api/generate-roadmap": 10,
  "/api/expand-goal": 20,
};
const DEFAULT_MAX = 20;

// Sweep stale entries every 5 minutes to avoid unbounded growth
let lastSweep = Date.now();
const SWEEP_INTERVAL = 5 * 60 * 1000;

function sweep() {
  const now = Date.now();
  if (now - lastSweep < SWEEP_INTERVAL) return;
  lastSweep = now;
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}

export function rateLimit(
  ip: string,
  route: string,
): { ok: true } | { ok: false; retryAfterSeconds: number } {
  sweep();
  const max = MAX_REQUESTS_PER_WINDOW[route] ?? DEFAULT_MAX;
  const key = `${ip}:${route}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true };
  }

  if (entry.count >= max) {
    return { ok: false, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count++;
  return { ok: true };
}
