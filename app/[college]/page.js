'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';



export default function CollegeHome({ params }) {
  const collegeName = params?.college || 'Unknown';
  const displayName = collegeName.charAt(0).toUpperCase() + collegeName.slice(1);
const router = useRouter();
const { data: session, status } = useSession();


  return (
    <main className="min-h-screen bg-neutral-50 px-4 sm:px-6 md:px-8 py-12 font-sans">
      <div className="max-w-7xl mx-auto">
{/* Auth Bar */}
<div className="fixed top-4 right-6 z-50 bg-white px-4 py-2 rounded-xl shadow border border-gray-200 text-sm">
  {status === 'authenticated' ? (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-gray-700"> {session?.user?.name || session?.user?.email}</span>
      <button
        onClick={() => signOut({ callbackUrl: window.location.href })}
        className="text-sm text-red-600 hover:text-red-800 underline"
      >
        Sign out
      </button>
    </div>
  ) : (
    <button
      onClick={() => signIn(undefined, { callbackUrl: window.location.href })}
      className="text-sm text-blue-600 hover:text-blue-800 underline"
    >
      Sign in
    </button>
  )}
</div>


        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-neutral-50 via-white to-gray-100 px-6 sm:px-10 py-16 rounded-3xl shadow-sm border border-gray-200 text-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-gray-200/20 via-transparent to-transparent z-0" />
          <div className="relative z-10 max-w-4xl mx-auto">
            <span className="inline-block px-4 py-1 mb-3 text-xs font-semibold bg-neutral-100 text-gray-700 rounded-full tracking-wide uppercase">
              Welcome
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
              {displayName} CampusConnect
            </h1>
            <p className="text-base md:text-lg text-gray-600 max-w-xl mx-auto">
              Your campus hub to swap skills, share resources, and connect with peers.
            </p>
            <div className="mt-5 flex justify-center gap-4 flex-wrap">
              <Link href={`/${collegeName}/skills`}>
                <span className="bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow transition">
                  Start Sharing a Skill 🚀
                </span>
              </Link>
              <Link href={`/${collegeName}/marketplace`}>
                <span className="bg-white hover:bg-gray-100 text-gray-800 px-6 py-2.5 rounded-full text-sm font-semibold border border-gray-300 transition">
                  Browse Marketplace 📦
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
    <section className="mt-16 grid sm:grid-cols-2 gap-6">
  <Link href={`/${collegeName}/skills`} className="group">
    <div className="bg-gradient-to-br from-neutral-50 via-white to-gray-100 border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition transform hover:-translate-y-1 text-center">
      <h2 className="text-2xl font-semibold text-gray-900 mb-2 group-hover:text-blue-700">
        🔁 SkillSwap
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed">
        Teach or learn anything from peers — quick, informal and fun.
      </p>
    </div>
  </Link>

  <Link href={`/${collegeName}/marketplace`} className="group">
    <div className="bg-gradient-to-br from-neutral-50 via-white to-gray-100 border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition transform hover:-translate-y-1 text-center">
      <h2 className="text-2xl font-semibold text-gray-900 mb-2 group-hover:text-blue-700">
        📦 CampusCrate
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed">
        Exchange books, notes, and supplies with trust and ease.
      </p>
    </div>
  </Link>

  <Link href={`/${collegeName}/community`} className="group sm:col-span-2">
    <div className="bg-gradient-to-br from-neutral-50 via-white to-gray-100 border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition transform hover:-translate-y-1 text-center">
      <h2 className="text-2xl font-semibold text-gray-900 mb-2 group-hover:text-blue-700">
        💬 Community Chat
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed">
        Join campus circles, find study buddies, and share announcements.
      </p>
    </div>
  </Link>
</section>

        {/* Campus Snapshot */}
     <section className="mt-16 bg-gradient-to-br from-neutral-50 via-white to-gray-100 border border-gray-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-gray-200/20 via-transparent to-transparent z-0" />

  <div className="relative z-10">
    <h3 className="text-2xl font-semibold text-center text-gray-900 mb-8">📊 Campus Snapshot</h3>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
      <div>
        <h4 className="text-lg font-medium text-gray-900">👥 Users</h4>
        <p className="mt-2 text-3xl font-bold text-gray-800">+1,200</p>
      </div>
      <div>
        <h4 className="text-lg font-medium text-gray-900">📚 Skills Shared</h4>
        <p className="mt-2 text-3xl font-bold text-gray-800">350+</p>
      </div>
      <div>
        <h4 className="text-lg font-medium text-gray-900">🛒 Items in Crate</h4>
        <p className="mt-2 text-3xl font-bold text-gray-800">500+</p>
      </div>
    </div>
  </div>
</section>


        {/* Latest Buzz */}
   {/* Latest Campus Buzz */}
<section className="mt-16 bg-gradient-to-br from-neutral-50 via-white to-gray-100 border border-gray-200 rounded-2xl p-6 shadow-sm">
  <h3 className="text-2xl font-semibold text-gray-900 mb-6">📢 Latest Campus Buzz</h3>
  <ul className="space-y-4 text-sm text-gray-700">
    <li className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
      ✅ Riya shared a new skill: <strong>UI Design Fundamentals</strong>
    </li>
    <li className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
      💼 Aman listed <strong>Physics Notes</strong>
    </li>
    <li className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
      🔁 You have <strong>2 new skill requests pending</strong>
    </li>
  </ul>
</section>

{/* Student Feedback */}
<section className="mt-16 bg-gradient-to-br from-neutral-50 via-white to-gray-100 border border-gray-200 rounded-2xl p-6 shadow-sm text-center">
  <h3 className="text-2xl font-semibold text-gray-900 mb-6">💬 Student Feedback</h3>
  <blockquote className="text-gray-700 italic max-w-2xl mx-auto">
    “SkillSwap helped me learn Python in 3 days — amazing experience!”
  </blockquote>
  <p className="text-sm text-gray-500 mt-4">– Mehul, 2nd Year</p>
</section>

{/* Final CTA */}
<div className="mt-16 text-center">
  <Link href={`/${collegeName}/skills`}>
    <span className="inline-block bg-black hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-full shadow-md transition">
      🚀 Get Started Now
    </span>
  </Link>
</div>


      </div>
    </main>
  );
}
