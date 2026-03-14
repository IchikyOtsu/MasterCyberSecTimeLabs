import CalendarWrapper from './CalendarWrapper';
import DashboardNav from './DashboardNav';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Info banner */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6 text-sm text-indigo-800">
          <strong>Comment obtenir votre URL ICS ?</strong> Connectez-vous sur{' '}
          <span className="font-mono bg-indigo-100 px-1 rounded">
            ade-web.ulb.ac.be
          </span>{' '}
          → Mon Agenda → Exporter → Copier le lien iCal.
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <CalendarWrapper />
        </div>
      </main>
    </div>
  );
}
