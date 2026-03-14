'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type UnamurCourse = Database['public']['Tables']['unamur_courses']['Row'];

interface PaeTabProps {
  profile: Profile;
  unamurCourses: UnamurCourse[];
  onIcsUrlSaved: (url: string) => void;
}

export default function PaeTab({ profile, unamurCourses: initial, onIcsUrlSaved }: PaeTabProps) {
  const supabase = createClient();
  const [icsUrl, setIcsUrl] = useState(profile.ulb_ics_url ?? '');
  const [savingIcs, setSavingIcs] = useState(false);
  const [icsMessage, setIcsMessage] = useState<string | null>(null);

  const [courses, setCourses] = useState<UnamurCourse[]>(initial);
  const [newCode, setNewCode] = useState('');
  const [addingCode, setAddingCode] = useState(false);

  // ── Save ICS URL ────────────────────────────────────────────────────────────
  const handleSaveIcs = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingIcs(true);
    setIcsMessage(null);
    const { error } = await supabase
      .from('profiles')
      .update({ ulb_ics_url: icsUrl.trim() || null, updated_at: new Date().toISOString() })
      .eq('id', profile.id);

    if (error) {
      setIcsMessage('Erreur : ' + error.message);
    } else {
      setIcsMessage('Lien sauvegardé !');
      onIcsUrlSaved(icsUrl.trim());
      setTimeout(() => setIcsMessage(null), 3000);
    }
    setSavingIcs(false);
  };

  // ── Add UNamur course code ──────────────────────────────────────────────────
  const handleAddCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = newCode.trim().toUpperCase();
    if (!code) return;
    if (courses.some((c) => c.course_code === code)) {
      setNewCode('');
      return;
    }
    setAddingCode(true);
    const { data, error } = await supabase
      .from('unamur_courses')
      .insert({ user_id: profile.id, course_code: code })
      .select()
      .single();

    if (!error && data) {
      setCourses((prev) => [...prev, data as UnamurCourse]);
      setNewCode('');
    }
    setAddingCode(false);
  };

  // ── Remove UNamur course code ───────────────────────────────────────────────
  const handleRemoveCode = async (id: string) => {
    await supabase.from('unamur_courses').delete().eq('id', id);
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 py-6 px-4">
      {/* ── ICS ULB ── */}
      <section className="space-y-3">
        <div>
          <h2 className="font-semibold text-gray-900">Lien ICS ULB</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Votre lien iCal personnel depuis CloudTimeedit / ADE ULB.
          </p>
        </div>
        <form onSubmit={handleSaveIcs} className="flex gap-2">
          <input
            type="url"
            value={icsUrl}
            onChange={(e) => setIcsUrl(e.target.value)}
            placeholder="https://cloud.timeedit.net/…"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={savingIcs}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            {savingIcs ? '…' : 'Sauvegarder'}
          </button>
        </form>
        {icsMessage && (
          <p className={`text-xs ${icsMessage.startsWith('Erreur') ? 'text-red-600' : 'text-green-600'}`}>
            {icsMessage}
          </p>
        )}
      </section>

      {/* ── UNamur course codes ── */}
      <section className="space-y-3">
        <div>
          <h2 className="font-semibold text-gray-900">Cours UNamur (PAE)</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Ajoutez les codes de vos cours donnés à l&apos;UNamur.
          </p>
        </div>

        {/* Add code form */}
        <form onSubmit={handleAddCode} className="flex gap-2">
          <input
            type="text"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value.toUpperCase())}
            placeholder="ex: IHDCB332"
            maxLength={20}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={addingCode || !newCode.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {addingCode ? '…' : '+ Ajouter'}
          </button>
        </form>

        {/* Course list */}
        {courses.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            Aucun cours UNamur ajouté.
          </p>
        ) : (
          <ul className="space-y-2">
            {courses.map((course) => (
              <li
                key={course.id}
                className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-2.5"
              >
                <span className="font-mono text-sm text-emerald-800 font-medium">
                  {course.course_code}
                </span>
                <button
                  onClick={() => handleRemoveCode(course.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors text-xs"
                  aria-label="Supprimer"
                >
                  Supprimer
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
