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
    <>
      <main className="min-h-screen bg-neutral-50 px-4 sm:px-6 md:px-8 py-12 font-sans">
        <div className="max-w-7xl mx-auto">
          
          <div className="fixed top-4 right-6 z-50 bg-white px-4 py-2 rounded-lg shadow border border-gray-200 text-sm">
            {status === 'authenticated' ? (
              <div className="flex items-center gap-3">
                <span className="text-gray-700">
                  {session?.user?.name || session?.user?.email}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: window.location.href })}
                  className="text-sm text-red-600 hover:underline"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn(undefined, { callbackUrl: window.location.href })}
                className="text-sm text-blue-600 hover:underline"
              >
                Sign in
              </button>
            )}
          </div>

         
          <section className="relative bg-gradient-to-br from-neutral-50 via-white to-gray-100 border border-gray-200 rounded-2xl shadow-sm px-8 py-16 text-center overflow-hidden">
  
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-gray-200/20 via-transparent to-transparent z-0" />

            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {displayName} CampusConnect
              </h1>
              <p className="text-base text-gray-600 max-w-xl mx-auto">
                A unified space to share skills, resources, and ideas with your peers.
              </p>
              <div className="mt-6 flex justify-center gap-4 flex-wrap">
                <Link href={`/${collegeName}/skills`}>
                  <span className="bg-black text-white px-6 py-2.5 rounded-md text-sm font-medium shadow hover:bg-gray-800 transition">
                    Share a Skill
                  </span>
                </Link>
                <Link href={`/${collegeName}/marketplace`}>
                  <span className="bg-white text-gray-800 px-6 py-2.5 rounded-md text-sm font-medium border border-gray-300 hover:bg-gray-100 transition">
                    Explore Marketplace
                  </span>
                </Link>
              </div>
            </div>
          </section>


  
         <section className="mt-20 relative bg-gradient-to-br from-neutral-50 via-white to-gray-100 border border-gray-200 rounded-2xl shadow-sm px-6 sm:px-10 py-16 overflow-hidden">

            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-gray-200/20 via-transparent to-transparent z-0" />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
                Explore Features
              </h2>

              <div className="grid sm:grid-cols-2 gap-6">
                <Link href={`/${collegeName}/skills`} className="group">
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 transform group-hover:-translate-y-1 text-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-700">
                      SkillSwap
                    </h3>
                    <p className="text-sm text-gray-600">
                      Learn or teach anything informally within your campus.
                    </p>
                  </div>
                </Link>

                <Link href={`/${collegeName}/marketplace`} className="group">
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 transform group-hover:-translate-y-1 text-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-700">
                      CampusCrate
                    </h3>
                    <p className="text-sm text-gray-600">
                      Exchange books, notes, and supplies with ease.
                    </p>
                  </div>
                </Link>

                <Link href={`/${collegeName}/community`} className="group sm:col-span-2">
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 transform group-hover:-translate-y-1 text-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-700">
                      Community Chat
                    </h3>
                    <p className="text-sm text-gray-600">
                      Join discussion circles, share ideas, and stay updated.
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </section>


        
          <section className="mt-16 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-2xl font-semibold text-center text-gray-900 mb-8">
              Campus Snapshot
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div>
                <h4 className="text-sm font-medium text-gray-600">Users</h4>
                <p className="mt-2 text-3xl font-bold text-gray-800">1,200+</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-600">Skills Shared</h4>
                <p className="mt-2 text-3xl font-bold text-gray-800">350+</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-600">Items Listed</h4>
                <p className="mt-2 text-3xl font-bold text-gray-800">500+</p>
              </div>
            </div>
          </section>



          <section className="mt-16 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Latest Activity</h3>
            <ul className="space-y-4 text-sm text-gray-700">
              <li className="bg-gray-50 border border-gray-100 rounded-md px-4 py-3 shadow-sm">
                Riya shared a skill: <strong>UI Design Fundamentals</strong>
              </li>
              <li className="bg-gray-50 border border-gray-100 rounded-md px-4 py-3 shadow-sm">
                Aman listed <strong>Physics Notes</strong> for exchange.
              </li>
              <li className="bg-gray-50 border border-gray-100 rounded-md px-4 py-3 shadow-sm">
                You have <strong>2 new skill requests</strong> pending.
              </li>
            </ul>
          </section>

        
          <section className="mt-16 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Student Feedback</h3>
            <blockquote className="text-gray-700 italic max-w-2xl mx-auto">
              “SkillSwap helped me learn Python in 3 days — smooth experience.”
            </blockquote>
            <p className="text-sm text-gray-500 mt-4">– Mehul, 2nd Year</p>
          </section>

         

         
          <div className="mt-16 text-center">
            <Link href={`/${collegeName}/skills`}>
              <span className="inline-block bg-black text-white font-medium py-3 px-6 rounded-md shadow hover:bg-gray-800 transition">
                Get Started
              </span>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
