import { useEffect, useState } from 'react';
import { formatClock } from '@/utils/dates';

/** Live HH:MM:SS readout for the operator status bar. */
export function useClock(intervalMs = 1000): string {
  const [time, setTime] = useState(() => formatClock(new Date()));
  useEffect(() => {
    const id = window.setInterval(() => setTime(formatClock(new Date())), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return time;
}
