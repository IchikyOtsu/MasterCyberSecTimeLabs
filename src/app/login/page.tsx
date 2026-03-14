import LoginButton from './LoginButton';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md text-center space-y-6">
        {/* Logos */}
        <div className="flex items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
            ULB
          </div>
          <span className="text-gray-300 text-2xl">×</span>
          <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
            UNa
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">TimeLabs</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Calendrier fusionné pour le Master inter-universitaire
          </p>
        </div>

        {/* Description */}
        <div className="bg-indigo-50 rounded-xl p-4 text-left text-sm text-indigo-800 space-y-1">
          <p className="font-semibold">Comment ça marche ?</p>
          <ul className="list-disc list-inside space-y-1 text-indigo-700">
            <li>Connexion sécurisée via le CAS de l&apos;ULB</li>
            <li>Import de votre horaire ADE</li>
            <li>Correction automatique des cours UNamur</li>
            <li>Calendrier visuel bicolore</li>
          </ul>
        </div>

        <LoginButton />

        <p className="text-xs text-gray-400">
          Vos données de connexion ne sont jamais stockées sur ce serveur.
        </p>
      </div>
    </main>
  );
}
