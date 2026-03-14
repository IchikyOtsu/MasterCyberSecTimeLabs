import { NextRequest, NextResponse } from 'next/server';
import { parseIcsFromUrl } from '@/lib/icsParser';

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
    const events = await parseIcsFromUrl(icsUrl);
    return NextResponse.json(events);
  } catch (error) {
    console.error('[/api/calendar]', error);
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { error: 'Impossible de traiter le calendrier', details: message },
      { status: 502 }
    );
  }
}
