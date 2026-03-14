'use client';

import { useState, useEffect, useCallback } from 'react';
import CalendarView from './CalendarView';
import type { CalendarEvent } from '@/types';

const STORAGE_KEY = 'timelabs_ics_url';

export default function App() {
  const [icsUrl, setIcsUrl] = useState<string>('');
  const [inputValue, setInputValue] = useState('');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  // On mount, restore saved URL and auto-load
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setIcsUrl(saved);
      setInputValue(saved);
      fetchCalendar(saved);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCalendar = useCallback(async (url: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/calendar?icsUrl=${encodeURIComponent(url)}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? `Erreur HTTP ${res.status}`);
      }
      const data: CalendarEvent[] = await res.json();
      setEvents(data);
      setHasLoaded(true);
      localStorage.setItem(STORAGE_KEY, url);
      setIcsUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setHasLoaded(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim().startsWith('http')) {
      fetchCalendar(inputValue.trim());
    }
  };

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setIcsUrl('');
    setInputValue('');
    setEvents([]);
    setHasLoaded(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>
            <span className="text-lg font-bold text-gray-900">TimeLabs</span>
            <span className="hidden sm:inline text-gray-400 text-sm">
              Calendrier Inter-Universitaire ULB × UNamur
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-2 h-2 rounded-full bg-blue-400" /> ULB
              <span className="w-2 h-2 rounded-full bg-emerald-400 ml-2" /> UNamur
            </span>
            {icsUrl && (
              <button
                onClick={handleReset}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                Changer de lien
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!hasLoaded ? (
          /* ── Onboarding ── */
          <div className="max-w-xl mx-auto mt-10 space-y-8">
            <div className="text-center space-y-2">
              <div className="flex justify-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold">ULB</div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-bold">UNa</div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Bienvenue sur TimeLabs</h1>
              <p className="text-gray-500 text-sm">
                Collez votre lien ICS CloudTimeedit pour afficher votre horaire corrigé ULB + UNamur.
              </p>
            </div>

            {/* How-to */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 text-sm text-indigo-800 space-y-3">
              <p className="font-semibold">Comment obtenir votre lien ICS ?</p>
              <ol className="list-decimal list-inside space-y-1.5 text-indigo-700">
                <li>Connectez-vous sur <strong>cloud.timeedit.net</strong> (ou ADE ULB)</li>
                <li>Ouvrez votre horaire personnel</li>
                <li>Cherchez le bouton <strong>«&nbsp;S&apos;abonner / Subscribe / iCal&nbsp;»</strong></li>
                <li>Copiez le lien <code className="bg-indigo-100 px-1 rounded text-xs">https://…ics</code></li>
              </ol>
            </div>

            {/* URL input */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="url"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="https://cloud.timeedit.net/…/ri.ics?…"
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={isLoading || !inputValue.startsWith('http')}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-xl transition-colors duration-200"
              >
                {isLoading ? 'Chargement…' : 'Afficher mon calendrier →'}
              </button>
            </form>
          </div>
        ) : (
          /* ── Calendar ── */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <CalendarView events={events} isLoading={isLoading} />
          </div>
        )}
      </main>
    </div>
  );
}
