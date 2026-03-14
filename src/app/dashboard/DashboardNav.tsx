'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardNav() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to login if not authenticated (fallback in case proxy is bypassed)
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const userName = session?.user?.name ?? session?.user?.email ?? 'Étudiant';

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
          </div>
          <h1 className="text-lg font-bold text-gray-900">TimeLabs</h1>
          <span className="hidden sm:inline text-gray-400 text-sm">
            Calendrier Inter-Universitaire
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-xs text-blue-600 font-medium">ULB</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 ml-2" />
            <span className="text-xs text-emerald-600 font-medium">UNamur</span>
          </div>
          {status === 'authenticated' && (
            <span className="text-sm text-gray-600 font-medium hidden sm:block">
              {userName}
            </span>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-sm text-gray-500 hover:text-red-600 font-medium transition-colors duration-150"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
}
