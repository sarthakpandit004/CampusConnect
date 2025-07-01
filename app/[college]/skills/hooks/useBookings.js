'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';

export function useBookings(session) {
  const [myBookings, setMyBookings] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);

  const fetchBookings = async () => {
    const querySnapshot = await getDocs(collection(db, 'bookings'));
    const all = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const filtered = all.filter(b =>
      b.learnerEmail === session.user.email || b.teacherEmail === session.user.email
    );

    setMyBookings(filtered);

    const events = filtered.map(b => ({
      title: `Skill: ${b.skillTitle}`,
      start: new Date(b.timeSlot),
      end: new Date(new Date(b.timeSlot).getTime() + 15 * 60000),
      resource: b,
    }));

    setCalendarEvents(events);
  };

  const bookSession = async (skill, timeSlot) => {
    await addDoc(collection(db, 'bookings'), {
      skillId: skill.id,
      skillTitle: skill.title,
      learnerEmail: session.user.email,
      teacherEmail: skill.userEmail,
      timeSlot,
      status: 'confirmed',
    });
    fetchBookings();
  };

  const cancelBooking = async (id) => {
    await updateDoc(doc(db, 'bookings', id), { status: 'cancelled' });
    fetchBookings();
  };

  const rescheduleBooking = async (id, newTimeSlot) => {
    await updateDoc(doc(db, 'bookings', id), {
      timeSlot: newTimeSlot,
      status: 'confirmed',
    });
    fetchBookings();
  };

  useEffect(() => {
    if (session?.user?.email) fetchBookings();
  }, [session]);

  return {
    myBookings,
    calendarEvents,
    fetchBookings,
    bookSession,
    cancelBooking,
    rescheduleBooking,
  };
}
