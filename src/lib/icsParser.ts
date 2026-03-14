import * as nodeIcal from 'node-ical';
import { v4 as uuidv4 } from 'uuid';
import type { CalendarEvent } from '@/types';

// Regex matching ULB course codes like INFO-F-514, DROIT-F-401, INFO-F514, etc.
const COURSE_CODE_REGEX = /([A-Z]+-[A-Z]-?\d{3,4})/;

function extractCourseCode(summary: string): string | undefined {
  const match = summary.match(COURSE_CODE_REGEX);
  return match?.[1];
}

function toISOString(date: Date | string | undefined): string {
  if (!date) return new Date().toISOString();
  if (date instanceof Date) return date.toISOString();
  return new Date(date).toISOString();
}

function normalizeEvent(
  event: nodeIcal.VEvent,
  source: 'ULB' | 'UNamur'
): CalendarEvent {
  const summary = typeof event.summary === 'string' ? event.summary : '';
  const startDate = event.start instanceof Date ? event.start : new Date(event.start as string);
  let endDate: Date;

  if (event.end instanceof Date) {
    endDate = event.end;
  } else if (event.end) {
    endDate = new Date(event.end as string);
  } else {
    // Fallback: start + 1 hour
    endDate = new Date(startDate.getTime() + 3600 * 1000);
  }

  return {
    id: (event.uid as string) || uuidv4(),
    title: summary,
    start: toISOString(startDate),
    end: toISOString(endDate),
    location: typeof event.location === 'string' ? event.location : undefined,
    description: typeof event.description === 'string' ? event.description : undefined,
    source,
    courseCode: extractCourseCode(summary),
  };
}

function filterVEvents(data: nodeIcal.CalendarResponse): nodeIcal.VEvent[] {
  return Object.values(data).filter(
    (e): e is nodeIcal.VEvent => e.type === 'VEVENT'
  );
}

export async function parseIcsFromUrl(url: string): Promise<CalendarEvent[]> {
  const data = await nodeIcal.async.fromURL(url);
  return filterVEvents(data).map((e) => normalizeEvent(e, 'ULB'));
}

export async function parseIcsFromFile(absolutePath: string): Promise<CalendarEvent[]> {
  const data = await nodeIcal.async.parseFile(absolutePath);
  return filterVEvents(data).map((e) => normalizeEvent(e, 'UNamur'));
}
