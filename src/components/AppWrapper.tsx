'use client';

import dynamic from 'next/dynamic';

const App = dynamic(() => import('./App'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      Chargement…
    </div>
  ),
});

export default function AppWrapper() {
  return <App />;
}
