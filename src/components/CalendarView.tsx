'use client';

import { useState, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventClickArg, EventContentArg } from '@fullcalendar/core';
import EventModal from './EventModal';
import type { CalendarEvent } from '@/types';

interface CalendarViewProps {
  events: CalendarEvent[];
  isLoading: boolean;
}

function EventContent({ eventInfo }: { eventInfo: EventContentArg }) {
  const isULB = eventInfo.event.extendedProps.source === 'ULB';
  return (
    <div className={`overflow-hidden rounded px-1 py-0.5 text-white text-xs leading-tight w-full h-full ${isULB ? 'bg-blue-500' : 'bg-emerald-500'}`}>
      <span className="font-semibold truncate block">{eventInfo.event.title}</span>
      {eventInfo.event.extendedProps.location && (
        <span className="opacity-80 truncate block text-[10px]">
          📍 {eventInfo.event.extendedProps.location}
        </span>
      )}
    </div>
  );
}

export default function CalendarView({ events, isLoading }: CalendarViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const handleEventClick = useCallback((info: EventClickArg) => {
    setSelectedEvent({
      id: info.event.id,
      title: info.event.title,
      start: info.event.startStr,
      end: info.event.endStr,
      source: info.event.extendedProps.source as 'ULB' | 'UNamur',
      location: info.event.extendedProps.location,
      description: info.event.extendedProps.description,
      courseCode: info.event.extendedProps.courseCode,
    });
  }, []);

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
    <div className="p-5 space-y-4">
      {/* Legend + stats */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" />
            Cours ULB ({events.filter((e) => e.source === 'ULB').length})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
            Cours UNamur ({events.filter((e) => e.source === 'UNamur').length})
          </span>
          <span className="text-gray-400">Total : {events.length}</span>
        </div>
        {isLoading && (
          <span className="text-xs text-indigo-500 animate-pulse">Actualisation…</span>
        )}
      </div>

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

      <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
}
