'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import PaeTab from './PaeTab';
import type { CalendarEvent } from '@/types';
import type { Database } from '@/lib/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type UnamurCourse = Database['public']['Tables']['unamur_courses']['Row'];
type Tab = 'calendar' | 'pae';

const CalendarView = dynamic(() => import('./CalendarView'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-32 text-gray-400 text-sm">
      Chargement du calendrier…
    </div>
  ),
});

export default function App() {
  const supabase = createClient();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('calendar');

  // User & profile
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [unamurCourses, setUnamurCourses] = useState<UnamurCourse[]>([]);

  // Calendar
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [calendarError, setCalendarError] = useState<string | null>(null);

  // ── Load session + profile ────────────────────────────────────────────────
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      setUserId(user.id);
      setUserEmail(user.email ?? null);

      const profRes = await supabase
        .from('profiles').select('*').eq('id', user.id).single();
      const coursesRes = await supabase
        .from('unamur_courses').select('*').eq('user_id', user.id).order('created_at');

      const prof = profRes.data as Profile | null;
      const courses = coursesRes.data as UnamurCourse[] | null;

      if (prof) {
        setProfile(prof);
        if (prof.ulb_ics_url) fetchCalendar(prof.ulb_ics_url);
      }
      if (courses) setUnamurCourses(courses);
    };

    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Fetch calendar events ────────────────────────────────────────────────
  const fetchCalendar = useCallback(async (icsUrl: string) => {
    setIsLoading(true);
    setCalendarError(null);
    try {
      const res = await fetch(`/api/calendar?icsUrl=${encodeURIComponent(icsUrl)}`);
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? `Erreur ${res.status}`);
      }
      setEvents(await res.json());
    } catch (err) {
      setCalendarError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleIcsUrlSaved = useCallback((url: string) => {
    setProfile((p) => p ? { ...p, ulb_ics_url: url } : p);
    if (url) fetchCalendar(url);
  }, [fetchCalendar]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
        Chargement…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>
            <span className="font-bold text-gray-900">TimeLabs</span>
          </div>

          {/* Tabs */}
          <nav className="flex items-center gap-1">
            {([
              { id: 'calendar', label: 'Calendrier' },
              { id: 'pae',      label: 'PAE' },
            ] as { id: Tab; label: string }[]).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden sm:block">{userEmail}</span>
            <button
              onClick={handleSignOut}
              className="text-xs text-gray-500 hover:text-red-600 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'calendar' && (
          <>
            {!profile.ulb_ics_url ? (
              <div className="max-w-md mx-auto mt-10 text-center space-y-3">
                <p className="text-gray-500 text-sm">
                  Vous n&apos;avez pas encore renseigné votre lien ICS ULB.
                </p>
                <button
                  onClick={() => setActiveTab('pae')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
                >
                  Ajouter mon lien ICS dans PAE →
                </button>
              </div>
            ) : calendarError ? (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                <strong>Erreur :</strong> {calendarError}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <CalendarView events={events} isLoading={isLoading} />
              </div>
            )}
          </>
        )}

        {activeTab === 'pae' && (
          <PaeTab
            profile={profile}
            unamurCourses={unamurCourses}
            onIcsUrlSaved={handleIcsUrlSaved}
          />
        )}
      </main>
    </div>
  );
}
