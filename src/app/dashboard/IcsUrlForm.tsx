'use client';

import { useState } from 'react';

interface IcsUrlFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export default function IcsUrlForm({ onSubmit, isLoading }: IcsUrlFormProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim().startsWith('http')) {
      onSubmit(url.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Collez votre URL ICS ULB/ADE ici…"
        required
        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />
      <button
        type="submit"
        disabled={isLoading || !url.startsWith('http')}
        className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors duration-200 whitespace-nowrap"
      >
        {isLoading ? 'Chargement…' : 'Charger'}
      </button>
    </form>
  );
}
