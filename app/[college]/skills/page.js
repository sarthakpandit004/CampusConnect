'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, getDoc, query, where, arrayUnion} from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import StickyNavbar from '@/components/StickyNavbar';


import Link from 'next/link';

export default function SkillSwapPage() {
  const router = useRouter();
  const { data: sessions, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/api/auth/signin');
    }
  }, [status, router]);
 
  const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});


  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [file, setFile] = useState(null);
  
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
const [selectedSkillForBooking, setSelectedSkillForBooking] = useState(null);
const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
const [myBookings, setMyBookings] = useState([]);
const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
const [bookingToReschedule, setBookingToReschedule] = useState(null);
const [newTimeSlot, setNewTimeSlot] = useState('');
const [calendarEvents, setCalendarEvents] = useState([]);




  const [skills, setSkills] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    duration: '15 mins',
    category: '',
    Documents: " : FILE/VIDEO"
  });
  const [selectedCategory, setSelectedCategory] = useState("");
  const [editingId, setEditingId] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };






  const handleSubmit = async (e) => {
    e.preventDefault();

    let mediaUrl = "";
let mediaType = "";

if (file) {
  const formData = new FormData();
  formData.append("file", file);
formData.append("upload_preset", "campusconnect_skills"); 
formData.append("cloud_name", "dajndivjw");                



  try {
    const res = await fetch("https://api.cloudinary.com/v1_1/dajndivjw/auto/upload?resource_type=raw", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (data.secure_url) {
      mediaUrl = data.secure_url;

      if (file.type.includes("video")) {
      mediaType = "video";
    } else if (file.type === "application/pdf") {
      mediaType = "pdf";
    } else {
      mediaType = "other";
    }

      console.log("Cloudinary upload successful:", mediaUrl);
    } else {
      console.error("Cloudinary Upload Failed:", data);
      alert("Media upload failed. Please try again or check credentials.");
      return;
    }

  } catch (error) {
    console.error("Upload error:", error);
    alert("An error occurred during media upload.");
    return;
  }
}


    // let mediaType = null;
    // if (file) {
    //   if (file.type.startsWith("video/")) mediaType = "video";
    //   else if (file.type === "application/pdf") mediaType = "pdf";
    // }


    if (status === 'loading') {
      alert("Session is still loading. Please wait a moment.");
      return;
    }
    if (status !== 'authenticated' || !sessions?.user?.email) {
      alert("User not authenticated. Please sign in again.");
      return;
    }
    try {
      await addDoc(collection(db, 'skills'), {
        ...form,
        userEmail: sessions.user.email,
        mediaUrl,
        mediaType

      });
      setForm({ title: '', description: '', duration: '15 mins', category: '' ,  Documents: ': No file chosen '});
      fetchSkills();
    } catch (err) {
      console.error('Error adding skill:', err);
    }
  };





  const fetchSkills = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'skills'));
      const allSkills = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSkills(allSkills);
    } catch (err) {
      console.error('Error fetching skills:', err);
    }
  };

  const fetchRequests = async () => {
  if (!sessions?.user?.email) return;

  try {
    const querySnapshot = await getDocs(collection(db, 'requests'));
    const allRequests = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const incoming = allRequests.filter(r => r.receiverEmail === sessions.user.email);
    const outgoing = allRequests.filter(r => r.senderEmail === sessions.user.email);

    setIncomingRequests(incoming);
    setOutgoingRequests(outgoing);
  } catch (error) {
    console.error("Error fetching requests:", error);
  }
};


  const handleEdit = (skill) => {
    setForm({
      title: skill.title,
      description: skill.description,
      duration: skill.duration,
      category: skill.category || '',
    });
    setEditingId(skill.id);
  };

  const handleSave = async (id) => {
    try {
      const skillRef = doc(db, "skills", id);
      await updateDoc(skillRef, form);
      setEditingId(null);
      setForm({ title: '', description: '', duration: '15 mins', category: '', Documents: ': No file chosen ' });
      fetchSkills();
    } catch (error) {
      console.error("Error updating skill:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "skills", id));
      fetchSkills();
    } catch (err) {
      console.error("Error deleting skill:", err);
    }
  };

    const handleRequestStatusChange = async (id, newStatus) => {
  try {
    const ref = doc(db, 'requests', id);
    await updateDoc(ref, { status: newStatus });

        if (newStatus === 'accepted') {
      const snap = await getDoc(ref);
      const req = snap.data();

      await ensureChatRoom({
        requestId: id,
        skillId: req.skillId,
        skillTitle: req.skillTitle,
        senderEmail: req.senderEmail,
        receiverEmail: req.receiverEmail,
      });
    }

    fetchRequests(); 
  } catch (err) {
    console.error("Failed to update request status:", err);
  }
};

async function ensureChatRoom({ skillId, skillTitle, senderEmail, receiverEmail }) {

  const q = query(
    collection(db, "chatRooms"),
    where("skillId", "==", skillId)
  );
  const snap = await getDocs(q);

  if (!snap.empty) {
    
    const roomRef = snap.docs[0].ref;
    await updateDoc(roomRef, {
      participants: arrayUnion(senderEmail)  
    });
    return roomRef.id;
  }

 
  const docRef = await addDoc(collection(db, "chatRooms"), {
    name: skillTitle,
    createdBy: receiverEmail,
    participants: [senderEmail, receiverEmail],
    skillId,
    skillTitle,
    isPublic: false,
    timestamp: serverTimestamp()
  });
  return docRef.id;
}



  const handleRequestSkill = async (skill) => {
  if (status !== 'authenticated' || !sessions?.user?.email) {
    alert("Please sign in to request a skill.");
    return;
  }

  try {
    await addDoc(collection(db, 'requests'), {
      skillId: skill.id,
      skillTitle: skill.title,
      senderEmail: sessions.user.email,
      receiverEmail: skill.userEmail,
      status: "pending",
      timestamp: serverTimestamp()
    });
    alert("Request sent successfully!");
  } catch (err) {
    console.error("Failed to send request:", err);
    alert("Something went wrong. Try again.");
  }
};


const handleBookingSubmit = async () => {
  if (!selectedTimeSlot || !selectedSkillForBooking) {
    alert("Please pick a time first!");
    return;
  }

  try {
    const randomMeetingId = Math.random().toString(36).substring(2, 7) + "-" + Math.random().toString(36).substring(2, 11);
const meetingUrl = `https://meet.google.com/${randomMeetingId}`;

await addDoc(collection(db, 'bookings'), {
  skillId: selectedSkillForBooking.id,
  skillTitle: selectedSkillForBooking.title,
  learnerEmail: sessions.user.email,
  teacherEmail: selectedSkillForBooking.userEmail,
  timeSlot: new Date(selectedTimeSlot).toISOString(),
  meetingUrl, 
  status: 'confirmed'
});
    alert('Booking confirmed!');
    setBookingModalOpen(false);
  } catch (err) {
    console.error("Booking failed:", err);
    alert("Something went wrong. Try again later.");
  }
};

const fetchBookings = async () => {
  if (!sessions?.user?.email) return;

  try {
    const querySnapshot = await getDocs(collection(db, 'bookings'));
    const all = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const filtered = all.filter(
      b =>
        b.learnerEmail === sessions.user.email ||
        b.teacherEmail === sessions.user.email
    );

    setMyBookings(filtered);

    const events = filtered.map((booking) => ({
      title: `Skill: ${booking.skillTitle}`,
      start: new Date(booking.timeSlot),
      end: new Date(new Date(booking.timeSlot).getTime() + 15 * 60000),
      resource: booking, 
    }));

    setCalendarEvents(events);
  } catch (err) {
    console.error("Error fetching bookings:", err);
  }
};

const handleCancelBooking = async (id) => {
  try {
    const bookingRef = doc(db, 'bookings', id);
    await updateDoc(bookingRef, { status: 'cancelled' });
    alert('Booking cancelled.');
    fetchBookings(); 
  } catch (err) {
    console.error('Cancel failed:', err);
    alert('Something went wrong. Try again.');
  }
};

const handleRescheduleBooking = async () => {
  if (!newTimeSlot || !bookingToReschedule) {
    alert('Pick a new time first!');
    return;
  }

  try {
    const ref = doc(db, 'bookings', bookingToReschedule.id);
    await updateDoc(ref, {
      timeSlot: new Date(newTimeSlot).toISOString(),
      status: 'confirmed'
    });

    alert('Booking updated.');
    setRescheduleModalOpen(false);
    fetchBookings(); 
  } catch (err) {
    console.error("Reschedule failed:", err);
    alert("Something went wrong. Try again.");
  }
};



  useEffect(() => {
    if (status === 'authenticated' && sessions?.user?.email) {
      fetchSkills();
      fetchRequests();
      fetchBookings();

    }
  }, [status, sessions?.user?.email]);



  

  return (
    <>
    
    <StickyNavbar></StickyNavbar>
    <main className="min-h-screen bg-gradient-to-br from-white to-neutral-100 px-4 py-10 md:px-6 xl:px-0">
  <div className="max-w-7xl mx-auto">
    
    {/* Header */}
    <header className="relative text-center mb-16 py-12 px-6 bg-gradient-to-br from-neutral-50 via-white to-gray-100 rounded-2xl shadow-sm overflow-hidden">
  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-gray-200/20 via-transparent to-transparent"></div>

  <div className="relative z-10 max-w-4xl mx-auto">
    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
      SkillSwap
    </h1>
    <p className="mt-4 text-sm text-gray-600 max-w-2xl mx-auto">
      Share your knowledge or learn something new — connect with peers through quick, skill-based sessions.
    </p>
    <div className="mt-5 flex justify-center gap-4 text-sm font-medium text-black">
      <button
        onClick={() => router.back()}
        className="underline hover:text-gray-700 transition"
      >
        ← Back to Dashboard
      </button>
      <a href="#your-bookings" className="underline hover:text-gray-700 transition">
        View Your Bookings
      </a>
    </div>
  </div>
</header>



<div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-x-10 gap-y-12">
  
  <aside className="sticky top-7 md:self-start bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
   
    <div>
      <h3 className="text-sm font-semibold text-gray-800 tracking-wide uppercase mb-3 border-b pb-2 border-gray-200">
        🗂 Browse Categories
      </h3>

      <ul className="space-y-2 text-sm text-gray-600">
        <li className="cursor-pointer hover:text-black hover:underline transition">Programming</li>
        <li className="cursor-pointer hover:text-black hover:underline transition">Design</li>
        <li className="cursor-pointer hover:text-black hover:underline transition">Soft Skills</li>
        <li className="cursor-pointer hover:text-black hover:underline transition">Short Sessions</li>
      </ul>
    </div>

  </aside>


       
     <section className="space-y-12">
  <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
    <h2 className="text-2xl font-semibold text-gray-900 tracking-tight border-b border-gray-200 pb-3 mb-6">
      Offer a Skill
    </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 space-y-8 md:space-y-0">
          <div className="flex flex-col space-y-5">
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Figma for Beginners"
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black transition"
              required
            />

    <textarea
      name="description"
      value={form.description}
      onChange={handleChange}
      placeholder="Brief description of what you'll teach"
      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md resize-none min-h-[64px] focus:outline-none focus:ring-2 focus:ring-black transition"
      required
    />

    <select
      name="duration"
      value={form.duration}
      onChange={handleChange}
      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-black transition"
    >
      <option value="15 mins">15 mins</option>
      <option value="30 mins">30 mins</option>
      <option value="1 hour">1 hour</option>
    </select>

    <select
      name="category"
      value={form.category}
      onChange={(e) => setForm({ ...form, category: e.target.value })}
      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-black transition"
    >
      <option value="">Select Category</option>
      <option value="Programming">Programming</option>
      <option value="Web Development">Web Development</option>
      <option value="Machine Learning">Machine Learning</option>
      <option value="Aptitude">Aptitude</option>
      <option value="Notes">Notes</option>
    </select>
  </div>

  
  <div className="flex flex-col space-y-6">
    <input
      name="Documents"
      type="file"
      accept="video/*,application/pdf"
      onChange={(e) => setFile(e.target.files[0])}
      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-black transition"
    />

    <button
      type="submit"
      className="mt-2 px-6 py-3 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-900 transition"
    >
      ➕ Post Skill
    </button>
  </div>
</form>

            </section>

         
            {skills.length > 0 && (
             <section className="mb-10">
    <div className="flex flex-wrap items-end gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-1">
          Filter by Category
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-60 text-sm px-4 py-2 border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
        >
          <option value="">All Categories</option>
          <option value="Programming">Programming</option>
          <option value="Web Development">Web Development</option>
          <option value="Machine Learning">Machine Learning</option>
          <option value="Aptitude">Aptitude</option>
          <option value="Notes">Notes</option>
        </select>
                  </div>
                </div>
                <div className="space-y-6">
  <h3 className="text-2xl font-semibold text-gray-900 tracking-tight border-b border-gray-200 pb-2">
      All Skills
  </h3>

              
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
  {skills
    .filter(skill => !selectedCategory || skill.category === selectedCategory)
    .map((skill, idx) => {
      const isOwner = skill.userEmail === sessions?.user?.email;

      return (
        <div
          key={idx}
          className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition p-6 flex flex-col justify-between min-h-[280px]"
        >
          <div className="space-y-3">
          
            {editingId === skill.id && isOwner ? (
              <>
                <input
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black transition"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />

                <textarea
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-black transition"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />

                <select
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-black transition"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                >
                  <option value="15 mins">15 mins</option>
                  <option value="30 mins">30 mins</option>
                  <option value="1 hour">1 hour</option>
                </select>

                <select
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-black transition"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="">Select Category</option>
                  <option value="Programming">Programming</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Machine Learning">Machine Learning</option>
                  <option value="Aptitude">Aptitude</option>
                  <option value="Notes">Notes</option>
                </select>

                <div className="flex gap-4 mt-2">
                  <button
                    onClick={() => handleSave(skill.id)}
                    className="text-sm text-green-600 hover:underline"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-sm text-gray-500 hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              
              <>
                <h4 className="text-lg font-semibold text-gray-900">
                  {skill.title}
                </h4>

                <p className="text-sm text-gray-700">{skill.description}</p>

                <p className="text-sm text-gray-500">⏱ {skill.duration}</p>

                <p className="text-sm text-gray-600">
                  📚 Category:&nbsp;
                  <span className="font-medium">
                    {skill.category || 'Uncategorized'}
                  </span>
                </p>

                <p className="text-sm text-gray-500">
                  🧑‍🎓 Posted by: {skill.userEmail || 'Unknown'}
                </p>

                
                {skill.mediaUrl && skill.mediaType === 'video' && (
                  <video
                    controls
                    className="mt-4 w-full rounded-lg border border-gray-200"
                  >
                    <source src={skill.mediaUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}

                {skill.mediaUrl && skill.mediaType === 'pdf' && (
                  <iframe
                    src={skill.mediaUrl}
                    title="PDF Preview"
                    className="mt-4 w-full h-64 rounded-lg border border-gray-200"
                  />
                )}

  
                {isOwner ? (
                  <div className="flex gap-4 mt-4">
                    <button
                      onClick={() => handleEdit(skill)}
                      className="text-sm text-black hover:underline hover:text-gray-800 transition"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(skill.id)}
                      className="text-sm text-red-600 hover:underline transition"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                ) : (
                 <div className="flex flex-col sm:flex-row gap-2 mt-4">
  <button
    onClick={() => handleRequestSkill(skill)}
    className="px-4 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 hover:text-black transition-colors duration-150"
  >
    Request to Learn
  </button>
  <button
    onClick={() => {
      setSelectedSkillForBooking(skill);
      setBookingModalOpen(true);
    }}
    className="px-4 py-1.5 text-sm text-white bg-black rounded-md hover:bg-gray-900 transition-colors duration-150"
  >
    📅 Book Session
  </button>
</div>


                )}
              </>
            )}
          </div>

          
          <div className="mt-5 inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
            🎓 {skill.department || 'CS Dept'}
          </div>
        </div>
      );
    })}
</div>

                </div>
              </section>
            )}

          
            <section className="mt-16 space-y-8" id='your-bookings'>
  <h3 className="text-3xl font-bold text-gray-900 tracking-tight border-b border-gray-200 pb-3">
    Your Bookings
  </h3>

  {myBookings.length === 0 ? (
    <p className="text-sm text-gray-500">You have no upcoming bookings.</p>
  ) : (
    <ul className="space-y-6">
      {myBookings.map((booking, i) => {
        const isConfirmed = booking.status === 'confirmed';
        const isCancelled = booking.status === 'cancelled';
        const withWhom =
          sessions.user.email === booking.learnerEmail
            ? booking.teacherEmail
            : booking.learnerEmail;

        return (
          <li
            key={i}
            className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all p-6 space-y-4"
          >
      
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-lg font-semibold text-gray-900">
                {booking.skillTitle}
              </h4>

              <span
                className={`text-xs font-medium px-3 py-1 rounded-full border 
                  ${
                    isCancelled
                      ? 'text-red-600 bg-red-50 border-red-200'
                      : isConfirmed
                      ? 'text-green-600 bg-green-50 border-green-200'
                      : 'text-gray-600 bg-gray-100 border-gray-300'
                  }`}
              >
                {booking.status.toUpperCase()}
              </span>
            </div>

        
            <div className="grid sm:grid-cols-2 gap-y-2 text-sm text-gray-700">
              <p>
                <span className="font-medium">Time:</span>{' '}
                {new Date(booking.timeSlot).toLocaleString()}
              </p>
              <p>
                <span className="font-medium">With:</span> {withWhom}
              </p>
              {booking.meetingUrl && (
  <p className="text-sm text-blue-600 underline mt-2">
    📹 <a href={booking.meetingUrl} target="_blank" rel="noopener noreferrer">
      Join Meeting
    </a>
  </p>
)}
            </div>
            

           
            <div className="pt-2 flex flex-wrap items-center gap-4">
              {isConfirmed && (
                <button
                  onClick={() => {
                    setBookingToReschedule(booking);
                    setNewTimeSlot('');
                    setRescheduleModalOpen(true);
                  }}
                  className="text-sm text-gray-700 hover:underline hover:text-black transition"
                >
                  Reschedule
                </button>
              )}
              <button
                onClick={() => handleCancelBooking(booking.id)}
                className="text-sm text-red-600 hover:underline transition"
              >
                Cancel Booking
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  )}
</section>

            <section className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-10">

  <div>
  <h3 className="text-2xl font-semibold text-gray-900 tracking-tight mb-4 border-b border-gray-200 pb-3">
    Incoming Requests
  </h3>

  {incomingRequests.length === 0 ? (
    <p className="text-sm text-gray-500">No one has requested your skills yet.</p>
  ) : (
    <ul className="space-y-4">
      {incomingRequests.map((req) => (
        <li
          key={req.id}
          className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all space-y-3"
        >
          <p className="text-sm text-gray-800 font-medium">
            Skill:&nbsp;<span className="text-gray-600">{req.skillTitle}</span>
          </p>

          <p className="text-sm text-gray-600">
            Requested by:&nbsp;{req.senderEmail}
          </p>

          <p className="text-sm">
            Status:
            <span
              className={`ml-2 inline-block px-2 py-0.5 rounded-full text-xs font-medium
                ${req.status === 'pending'
                  ? 'bg-yellow-50 text-yellow-700'
                  : req.status === 'accepted'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'}
              `}
            >
              {req.status}
            </span>
          </p>

          {req.status === 'pending' && (
            <div className="flex gap-4 pt-1.5">
              <button
                onClick={() => handleRequestStatusChange(req.id, 'accepted')}
                className="text-sm text-gray-700 hover:text-black hover:underline transition"
              >
                Accept
              </button>
              <button
                onClick={() => handleRequestStatusChange(req.id, 'declined')}
                className="text-sm text-red-600 hover:underline transition"
              >
                Decline
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  )}
</div>


 
  <div>
  <h3 className="text-2xl font-semibold text-gray-900 tracking-tight mb-4 border-b border-gray-200 pb-3">
    Sent Requests
  </h3>

  {outgoingRequests.length === 0 ? (
    <p className="text-sm text-gray-500">You haven’t sent any requests yet.</p>
  ) : (
    <ul className="space-y-4">
      {outgoingRequests.map((req) => (
        <li
          key={req.id}
          className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all space-y-3"
        >
          <p className="text-sm text-gray-800 font-medium">
            Skill:&nbsp;<span className="text-gray-600">{req.skillTitle}</span>
          </p>

          <p className="text-sm text-gray-600">
            To:&nbsp;{req.receiverEmail}
          </p>

          <p className="text-sm">
            Status:
            <span
              className={`ml-2 inline-block px-2 py-0.5 rounded-full text-xs font-medium
                ${req.status === 'pending'
                  ? 'bg-yellow-50 text-yellow-700'
                  : req.status === 'accepted'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'}
              `}
            >
              {req.status}
            </span>
          </p>
        </li>
      ))}
    </ul>
  )}
</div>

</section>

           <section className="mt-16">
  <h3 className="text-2xl font-semibold text-gray-900 tracking-tight mb-6 border-b border-gray-200 pb-3 flex items-center gap-2">
    🗓 Calendar View
  </h3>

  <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
    <Calendar
      localizer={localizer}
      events={calendarEvents}
      startAccessor="start"
      endAccessor="end"
      style={{ height: 500 }}
    />
  </div>
</section>

          </section>
        </div>

        {bookingModalOpen && selectedSkillForBooking && (
  <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
    <div className="bg-white border border-gray-200 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-6 transition-all">
      {/* Heading */}
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          📅 Book Session
        </h2>
        <p className="text-sm text-gray-500">
          Confirm a time with <span className="font-medium text-gray-800">{selectedSkillForBooking.userEmail}</span>
        </p>
      </div>

      {/* Skill Info */}
      <div className="text-sm text-gray-700 space-y-1">
        <p>
          <span className="font-medium">Skill:</span> {selectedSkillForBooking.title}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Time</label>
        <input
          type="datetime-local"
          value={selectedTimeSlot}
          onChange={(e) => setSelectedTimeSlot(e.target.value)}
          className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black transition"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={() => setBookingModalOpen(false)}
          className="text-sm text-gray-600 hover:underline transition"
        >
          Cancel
        </button>
        <button
          onClick={handleBookingSubmit}
          className="px-5 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-900 transition"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
)}

       {rescheduleModalOpen && bookingToReschedule && (
  <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
    <div className="bg-white border border-gray-200 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-6 transition-all">

      
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-gray-900">
          🔁 Reschedule Booking
        </h2>
        <p className="text-sm text-gray-600">
          Choose a new time for{' '}
          <span className="font-medium text-gray-800">
            {bookingToReschedule.skillTitle}
          </span>
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          New Time
        </label>
        <input
          type="datetime-local"
          className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black transition"
          value={newTimeSlot}
          onChange={(e) => setNewTimeSlot(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={() => setRescheduleModalOpen(false)}
          className="text-sm text-gray-600 hover:underline transition"
        >
          Cancel
        </button>
        <button
          onClick={handleRescheduleBooking}
          className="px-5 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-900 transition"
        >
          Confirm New Time
        </button>
      </div>
    </div>
  </div>
)}

      </div>
    </main>
    </>
  );
}