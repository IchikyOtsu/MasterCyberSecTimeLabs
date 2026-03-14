'use client';

import { useState, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventClickArg, EventContentArg } from '@fullcalendar/core';
import EventModal from './EventModal';
import IcsUrlForm from '@/app/dashboard/IcsUrlForm';
import type { CalendarEvent } from '@/types';

function EventContent({ eventInfo }: { eventInfo: EventContentArg }) {
  const isULB = eventInfo.event.extendedProps.source === 'ULB';
  return (
    <div
      className={`overflow-hidden rounded px-1 py-0.5 text-white text-xs leading-tight w-full h-full ${isULB ? 'bg-blue-500' : 'bg-emerald-500'}`}
    >
      <span className="font-semibold truncate block">{eventInfo.event.title}</span>
      {eventInfo.event.extendedProps.location && (
        <span className="opacity-80 truncate block text-[10px]">
          📍 {eventInfo.event.extendedProps.location}
        </span>
      )}
    </div>
  );
}

export default function CalendarView() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadCalendar = useCallback(async (icsUrl: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/calendar?icsUrl=${encodeURIComponent(icsUrl)}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? `Erreur HTTP ${res.status}`);
      }
      const data: CalendarEvent[] = await res.json();
      setEvents(data);
      setHasLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleEventClick = useCallback((info: EventClickArg) => {
    const event: CalendarEvent = {
      id: info.event.id,
      title: info.event.title,
      start: info.event.startStr,
      end: info.event.endStr,
      source: info.event.extendedProps.source as 'ULB' | 'UNamur',
      location: info.event.extendedProps.location,
      description: info.event.extendedProps.description,
      courseCode: info.event.extendedProps.courseCode,
    };
    setSelectedEvent(event);
  }, []);

  // Convert CalendarEvent[] to FullCalendar EventInput[]
  const fcEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.start,
    end: e.end,
    extendedProps: {
      source: e.source,
      location: e.location,
      description: e.description,
      courseCode: e.courseCode,
    },
  }));

  return (
    <div className="p-6 space-y-5">
      {/* URL Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          URL de votre calendrier ICS (ADE ULB)
        </label>
        <IcsUrlForm onSubmit={loadCalendar} isLoading={isLoading} />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          <strong>Erreur :</strong> {error}
        </div>
      )}

      {/* Legend */}
      {hasLoaded && (
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" />
            Cours ULB ({events.filter((e) => e.source === 'ULB').length})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
            Cours UNamur ({events.filter((e) => e.source === 'UNamur').length})
          </span>
          <span className="text-gray-400">
            Total : {events.length} événements
          </span>
        </div>
      )}

      {/* Empty state */}
      {!hasLoaded && !isLoading && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-3">
          <svg className="h-12 w-12 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <p className="text-sm">Entrez votre URL ICS pour afficher votre calendrier</p>
        </div>
      )}

      {/* FullCalendar */}
      {hasLoaded && (
        <FullCalendar
          plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          buttonText={{
            today: "Aujourd'hui",
            month: 'Mois',
            week: 'Semaine',
            day: 'Jour',
          }}
          locale="fr"
          firstDay={1}
          slotMinTime="07:00:00"
          slotMaxTime="21:00:00"
          events={fcEvents}
          eventContent={(info) => <EventContent eventInfo={info} />}
          eventClick={handleEventClick}
          height="auto"
          nowIndicator
          weekends={false}
        />
      )}

      {/* Event Modal */}
      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
