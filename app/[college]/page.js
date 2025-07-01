'use client';
import Link from 'next/link';

export default function CollegeHome({ params }) {
  const collegeName = params?.college || 'Unknown';
  const displayName = collegeName.charAt(0).toUpperCase() + collegeName.slice(1);

  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-neutral-100 px-6 py-12">
      <div className="max-w-6xl mx-auto">

        {/* Hero Header */}
        <section className="relative text-center mb-20 px-6 py-20 bg-gradient-to-br from-neutral-50 via-white to-gray-100 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-200/20 via-transparent to-transparent" />
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
              🎓 Welcome to {displayName} CampusConnect
            </h1>
            <p className="mt-4 text-base text-gray-600 max-w-xl mx-auto">
              A platform built for your campus — connect, collaborate, and grow with your peers.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 justify-center text-black text-sm font-medium">
              ✨ Explore features below to get started
            </div>
          </div>
        </section>

        {/* Features Section */}
       <section className="grid gap-10 sm:grid-cols-2">
  {/* SkillSwap */}
  <Link href='/amity/skills' className="group">
    <div className="bg-gradient-to-br from-neutral-50 via-white to-gray-100 border border-gray-200 rounded-2xl p-6 text-center shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition transform text-gray-700 cursor-pointer">
      <h2 className="text-2xl font-semibold text-gray-900 mb-2 group-hover:text-blue-700 transition">🔁 SkillSwap</h2>
      <p className="text-sm leading-relaxed">
        Learn or teach skills with your peers. Create micro-sessions for quick sharing and discovery.
      </p>
    </div>
  </Link>

  {/* CampusCrate */}
  <Link href="/amity/marketplace" className="group">
    <div className="bg-gradient-to-br from-neutral-50 via-white to-gray-100 border border-gray-200 rounded-2xl p-6 text-center shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition transform text-gray-700 cursor-pointer">
      <h2 className="text-2xl font-semibold text-gray-900 mb-2 group-hover:text-blue-700 transition">📦 CampusCrate</h2>
      <p className="text-sm leading-relaxed">
        Buy, sell, or share textbooks, notes, and supplies easily within your campus.
       
      </p>
    </div>
  </Link>
 

  {/* Community Chat */}
  <Link href="/amity/community" className="group sm:col-span-2">
    <div className="bg-gradient-to-br from-neutral-50 via-white to-gray-100 border border-gray-200 rounded-2xl p-6 text-center shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition transform text-gray-700 cursor-pointer">
      <h2 className="text-2xl font-semibold text-gray-900 mb-2 group-hover:text-blue-700 transition">💬 Community Chat</h2>
      <p className="text-sm leading-relaxed">
        Join course-specific groups and interact — right on campus.
      </p>
    </div>
  </Link>
</section>



        {/* Call to Action */}
       
      </div>
    </main>
  );
}
