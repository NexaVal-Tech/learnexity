// lib/useCoursesByTrack.ts
import { useState, useEffect } from "react";
import { Course } from "@/lib/api";

type Track = "self_paced" | "group_mentorship" | "one_on_one";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function useCoursesByTrack(tracks: Track[]) {
  const [courses, setCourses]   = useState<Course[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = tracks.map((t) => `track[]=${t}`).join("&");
      const res    = await fetch(`${API_URL}/api/courses/by-track?${params}`, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data: Course[] = await res.json();
      setCourses(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracks.join(",")]);

  return { courses, loading, error, retry: fetchCourses };
}