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

export interface CourseMappingEntry {
  targetCode: string;   // UNamur course code
  mockIcsFile: string;  // filename inside /public/mock/
}

export interface CourseMapping {
  [ulbCourseCode: string]: CourseMappingEntry;
}

export interface CasUser {
  uid: string;
  mail: string;
  displayName?: string;
}
