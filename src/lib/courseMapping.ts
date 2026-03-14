import rawMapping from '@/data/courseMapping.json';
import type { CourseMapping } from '@/types';

export function getCourseMapping(): CourseMapping {
  return rawMapping as CourseMapping;
}

export function getMappedULBCodesSet(): Set<string> {
  return new Set(Object.keys(rawMapping));
}
