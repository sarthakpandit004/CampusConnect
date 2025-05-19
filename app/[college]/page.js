export default function CollegeHome({ params }) {
  const collegeName = params?.college || "Unknown";

  const displayName =
    collegeName.charAt(0).toUpperCase() + collegeName.slice(1);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white px-4 py-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-4">
          Welcome to {displayName} CampusConnect
        </h1>
        <p className="text-lg text-gray-600 mb-10">
          A community space for learning, sharing, and growing together.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition">
            <h2 className="text-2xl font-semibold text-blue-700 mb-2">
              SkillSwap
            </h2>
            <p className="text-gray-600">
              Teach or learn skills from peers. Schedule micro-sessions based
              on your interests.
            </p>
          </div>

          <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition">
            <h2 className="text-2xl font-semibold text-blue-700 mb-2">
              CampusCrate
            </h2>
            <p className="text-gray-600">
              Buy, sell, or share notes, books, and other study materials
              easily within your campus.
            </p>
          </div>

          <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition md:col-span-2">
            <h2 className="text-2xl font-semibold text-blue-700 mb-2">
              Community Chat
            </h2>
            <p className="text-gray-600">
              Join course-specific groups and interact with fellow students like
              a mini Discord, right here.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
