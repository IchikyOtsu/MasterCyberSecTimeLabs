'use client';

import { useEffect } from 'react';
import type { CalendarEvent } from '@/types';

interface EventModalProps {
  event: CalendarEvent | null;
  onClose: () => void;
}

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('fr-BE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export default function EventModal({ event, onClose }: EventModalProps) {
  useEffect(() => {
    if (!event) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [event, onClose]);

  if (!event) return null;

  const isULB = event.source === 'ULB';
  const accentColor = isULB
    ? 'bg-blue-600 text-white'
    : 'bg-emerald-600 text-white';
  const borderColor = isULB ? 'border-blue-200' : 'border-emerald-200';
  const badgeBg = isULB ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border ${borderColor}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`${accentColor} px-6 py-4`}>
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-bold text-base leading-snug">{event.title}</h2>
            <button
              onClick={onClose}
              className="flex-shrink-0 opacity-80 hover:opacity-100 transition-opacity"
              aria-label="Fermer"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          {/* Source badge */}
          <span className={`inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full ${badgeBg}`}>
            {isULB ? '🔵 Cours ULB' : '🟢 Cours UNamur'}
          </span>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Time */}
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-gray-700">
              <p className="font-medium capitalize">{formatDateTime(event.start)}</p>
              <p className="text-gray-500">
                Fin :{' '}
                {new Intl.DateTimeFormat('fr-BE', {
                  hour: '2-digit',
                  minute: '2-digit',
                }).format(new Date(event.end))}
              </p>
            </div>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-gray-700">{event.location}</p>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-gray-600">{event.description}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5">
          <button
            onClick={onClose}
            className="w-full text-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors py-2 rounded-lg hover:bg-gray-50"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
