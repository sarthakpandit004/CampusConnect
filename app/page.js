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
    <main className="min-h-screen bg-gradient-to-br from-indigo-100 to-white flex flex-col items-center justify-center px-4 py-8">
      <div className="bg-white shadow-xl rounded-xl max-w-md w-full p-6 sm:p-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-indigo-700 mb-6">
          Welcome to CampusConnect
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
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
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition"
          >
            Enter Campus
          </button>
        </form>
      </div>
    </main>
  );
}
