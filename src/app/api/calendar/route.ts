import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { parseIcsFromUrl, parseIcsFromFile } from '@/lib/icsParser';
import { getCourseMapping, getMappedULBCodesSet } from '@/lib/courseMapping';
import type { CalendarEvent } from '@/types';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const icsUrl = searchParams.get('icsUrl');

  if (!icsUrl || !icsUrl.startsWith('http')) {
    return NextResponse.json(
      { error: 'Paramètre icsUrl manquant ou invalide' },
      { status: 400 }
    );
  }

  try {
    // 1. Parse the student's ICS feed
    const ulbEvents: CalendarEvent[] = await parseIcsFromUrl(icsUrl);

    // 2. Load the course mapping
    const mapping = getCourseMapping();
    const mappedCodes = getMappedULBCodesSet();

    // 3. Filter out ULB events whose course code matches a mapped code
    const filteredUlbEvents = ulbEvents.filter((event) => {
      if (!event.courseCode) return true;
      const codes = Array.from(mappedCodes);
      return !codes.some(
        (code) => event.courseCode!.includes(code) || event.title.includes(code)
      );
    });

    // 4. Collect unique UNamur mock ICS files
    const mockFilesToFetch = new Set<string>(
      Object.values(mapping).map((entry) => entry.mockIcsFile)
    );

    // 5. Parse UNamur mock files (server-side filesystem path)
    const unamurEventArrays = await Promise.all(
      Array.from(mockFilesToFetch).map((filename) =>
        parseIcsFromFile(path.join(process.cwd(), 'public', 'mock', filename))
      )
    );
    const unamurEvents: CalendarEvent[] = unamurEventArrays.flat();

    // 6. Merge and sort
    const merged: CalendarEvent[] = [...filteredUlbEvents, ...unamurEvents].sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    );

    return NextResponse.json(merged);
  } catch (error) {
    console.error('[/api/calendar]', error);
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { error: 'Impossible de traiter le calendrier', details: message },
      { status: 502 }
    );
  }
}
