// lib/courseCache.ts
// A simple singleton cache so courses are fetched ONCE per session
// and instantly reused by courses.tsx, [id].tsx, and HeaderCourse.

import { api, Course } from "@/lib/api";

type Listener = (courses: Course[]) => void;

let cache: Course[] | null = null;
let inflight: Promise<Course[]> | null = null;
const listeners: Set<Listener> = new Set();

/**
 * Returns courses immediately from cache if available,
 * otherwise fetches once and notifies all subscribers.
 *
 * Usage:
 *   const courses = await getCourses();
 *
 * Or subscribe for reactive updates:
 *   const unsub = subscribeCourses(setCourses);
 *   return () => unsub();
 */
export async function getCourses(): Promise<Course[]> {
  if (cache) return cache;

  // If a fetch is already in flight, wait for it instead of firing a second one
  if (inflight) return inflight;

  inflight = (async () => {
    // Retry up to 3 times with exponential backoff
    let lastError: unknown;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const data = await api.courses.getAll();
        cache = data;
        inflight = null;
        // Notify any components that subscribed before the fetch finished
        listeners.forEach((fn) => fn(data));
        return data;
      } catch (err) {
        lastError = err;
        if (attempt < 2) {
          // Wait 500ms, 1500ms before retrying
          await new Promise((r) => setTimeout(r, 500 * Math.pow(3, attempt)));
        }
      }
    }
    inflight = null;
    throw lastError;
  })();

  return inflight;
}

/**
 * Subscribe to the course list.
 * Calls `fn` immediately with cached data (if available),
 * then again when the fetch resolves.
 * Returns an unsubscribe function.
 */
export function subscribeCourses(fn: Listener): () => void {
  listeners.add(fn);
  if (cache) fn(cache);               // instant if already cached
  else getCourses().catch(() => {});  // kick off fetch silently
  return () => listeners.delete(fn);
}

/** Manually bust the cache (e.g. after an admin action) */
export function bustCourseCache() {
  cache = null;
}