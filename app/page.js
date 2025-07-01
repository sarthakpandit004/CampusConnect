'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
  const [selectedCollege, setSelectedCollege] = useState('');
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedCollege) {
      router.push(`/${selectedCollege.toLowerCase()}`);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-gray-100 flex items-center justify-center px-6 py-16 relative overflow-hidden">
      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-black/5 via-transparent to-transparent" />

      {/* Content Card */}
      <div className="relative z-10 max-w-lg w-full bg-white border border-gray-200 rounded-2xl shadow-lg p-8 sm:p-10 text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          Welcome to CampusConnect
        </h1>
        <p className="text-sm text-gray-600 max-w-md mx-auto">
          A modern space to discover resources, connect with peers, and engage in your campus community.
        </p>

        {/* College Selection Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="text-left">
            <label
              htmlFor="college"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Select Your College
            </label>
            <select
              id="college"
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black transition"
              required
            >
              <option value="">-- Choose College --</option>
              <option value="amity">Amity University</option>
              <option value="du">Delhi University</option>
              <option value="iitd">IIT Delhi</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white px-5 py-2.5 text-sm font-medium rounded-md hover:bg-gray-900 transition"
          >
            Enter Campus
          </button>
        </form>

        {/* Optional tagline or link */}
        <p className="text-xs text-gray-400">
          Powered by CampusCrate • Your digital campus toolkit
        </p>
      </div>
    </main>
  );
}
