import { format, formatDistanceToNow, isPast, isToday } from 'date-fns';

/** Format an ISO date string as e.g. "Jun 13, 2026". */
export function formatDate(iso: string): string {
  return format(new Date(iso), 'MMM d, yyyy');
}

/** Convert an ISO date string into the `yyyy-MM-dd` value a date input expects. */
export function toDateInputValue(iso: string): string {
  return format(new Date(iso), 'yyyy-MM-dd');
}

/** Human-friendly relative due date, e.g. "in 3 days" or "2 days ago". */
export function formatRelativeDueDate(iso: string): string {
  const date = new Date(iso);
  if (isToday(date)) return 'Due today';
  return `Due ${formatDistanceToNow(date, { addSuffix: true })}`;
}

/** True when a pending task's due date is in the past (excluding today). */
export function isOverdue(iso: string): boolean {
  const date = new Date(iso);
  return isPast(date) && !isToday(date);
}
