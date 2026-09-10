import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface ScholarshipCountdownBannerProps {
  /** Reports the rendered banner height (0 when hidden) so the layout can
   * shift the fixed navbar + page content down by exactly that amount. */
  onHeightChange?: (height: number) => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(deadline: Date): TimeLeft | null {
  const diffMs = deadline.getTime() - Date.now();
  if (diffMs <= 0) return null;

  const totalSeconds = Math.floor(diffMs / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

const pad = (n: number) => String(n).padStart(2, '0');

export default function ScholarshipCountdownBanner({ onHeightChange }: ScholarshipCountdownBannerProps) {
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user } = useAuth();

  // Mirrors ScholarshipBanner's own "Apply" CTA logic: send signed-out
  // visitors to register (flagged so they land back in course browsing),
  // signed-in users straight to courses to pick one and apply.
  const handleApply = () => {
    if (!user) {
      sessionStorage.setItem('scholarship_browse_courses', 'true');
      router.push('/user/auth/register');
    } else {
      router.push('/courses/courses');
    }
  };

  // Fetch once on mount — the public endpoint already only returns a
  // deadline when the admin has the banner switched on and it hasn't
  // expired yet, so no separate "is_active" check is needed here.
  useEffect(() => {
    let cancelled = false;
    api.scholarshipCountdown
      .getPublic()
      .then((res) => {
        if (cancelled) return;
        setDeadline(res.deadline ? new Date(res.deadline) : null);
      })
      .catch(() => {
        if (!cancelled) setDeadline(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!deadline) {
      setTimeLeft(null);
      return;
    }

    setTimeLeft(getTimeLeft(deadline));
    const interval = setInterval(() => {
      const next = getTimeLeft(deadline);
      setTimeLeft(next);
      if (!next) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  // Report height (0 when nothing to show) so AppLayout can offset the
  // navbar/content to sit below this banner instead of behind it.
  useEffect(() => {
    if (!onHeightChange) return;
    if (!timeLeft) {
      onHeightChange(0);
      return;
    }
    const el = bannerRef.current;
    if (!el) return;
    onHeightChange(el.getBoundingClientRect().height);

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) onHeightChange(entry.contentRect.height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [timeLeft, onHeightChange]);

  if (!timeLeft) return null;

  return (
    <div
      ref={bannerRef}
      className="fixed top-0 left-0 w-full z-[60] bg-white dark:bg-[#0a0a0f] border-b border-gray-100 dark:border-white/10"
    >
      <div className="max-w-screen-xl mx-auto px-6 h-[52px] flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs sm:text-sm font-medium text-center text-gray-700 dark:text-gray-300">
        <span>Scholarship applications close soon —</span>
        <span className="font-mono font-semibold tabular-nums text-[#6C63FF]">
          {timeLeft.days}d {pad(timeLeft.hours)}h {pad(timeLeft.minutes)}m {pad(timeLeft.seconds)}s
        </span>
        <button
          onClick={handleApply}
          className="px-3 py-1 rounded-full bg-[#6C63FF] text-white font-semibold whitespace-nowrap hover:bg-[#5750d6] transition-colors"
        >
          Apply now
        </button>
      </div>
    </div>
  );
}
