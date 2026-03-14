'use client';

import dynamic from 'next/dynamic';

// FullCalendar requires the DOM — disable SSR here in a client boundary
const CalendarView = dynamic(() => import('@/components/CalendarView'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 text-gray-400">
      <span>Chargement du calendrier…</span>
    </div>
  ),
});

export default function CalendarWrapper() {
  return <CalendarView />;
}
