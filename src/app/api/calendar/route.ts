import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import path from 'path';
import { parseIcsFromUrl, parseIcsFromFile } from '@/lib/icsParser';
import { getCourseMapping, getMappedULBCodesSet } from '@/lib/courseMapping';
import type { CalendarEvent } from '@/types';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  // Auth guard — validate JWT token (works with Next.js 16)
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Validate icsUrl query param
  const { searchParams } = request.nextUrl;
  const icsUrl = searchParams.get('icsUrl');
  if (!icsUrl || !icsUrl.startsWith('http')) {
    return NextResponse.json(
      { error: 'Missing or invalid icsUrl parameter' },
      { status: 400 }
    );
  }

  try {
    // 1. Parse the student's ULB ICS feed
    const ulbEvents: CalendarEvent[] = await parseIcsFromUrl(icsUrl);

    // 2. Load the mapping dictionary
    const mapping = getCourseMapping();
    const mappedCodes = getMappedULBCodesSet();

    // 3. Filter out ULB events whose course code is in the mapping
    const filteredUlbEvents = ulbEvents.filter((event) => {
      if (!event.courseCode) return true;
      // Check if any mapped code is contained in the course code
      const codes = Array.from(mappedCodes);
      const isReplaced = codes.some(
        (code) => event.courseCode!.includes(code) || event.title.includes(code)
      );
      return !isReplaced;
    });

    // 4. Collect unique mock ICS files to fetch for UNamur
    const mockFilesToFetch = new Set<string>(
      Object.values(mapping).map((entry) => entry.mockIcsFile)
    );

    // 5. Parse all UNamur mock ICS files
    const unamurEventArrays = await Promise.all(
      Array.from(mockFilesToFetch).map((filename) => {
        const absPath = path.join(process.cwd(), 'public', 'mock', filename);
        return parseIcsFromFile(absPath);
      })
    );
    const unamurEvents: CalendarEvent[] = unamurEventArrays.flat();

    // 6. Merge and sort by start date
    const mergedEvents: CalendarEvent[] = [
      ...filteredUlbEvents,
      ...unamurEvents,
    ].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    return NextResponse.json(mergedEvents);
  } catch (error) {
    console.error('[/api/calendar] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to process calendar', details: message },
      { status: 502 }
    );
  }
}
