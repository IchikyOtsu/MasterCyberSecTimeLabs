export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO 8601
  end: string;   // ISO 8601
  location?: string;
  description?: string;
  source: 'ULB' | 'UNamur';
  courseCode?: string;
}
