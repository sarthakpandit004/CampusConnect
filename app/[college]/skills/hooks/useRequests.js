'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, serverTimestamp, doc } from 'firebase/firestore';

export function useRequests(session) {
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);

  const fetchRequests = async () => {
    const querySnapshot = await getDocs(collection(db, 'requests'));
    const allRequests = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    setIncomingRequests(allRequests.filter(r => r.receiverEmail === session.user.email));
    setOutgoingRequests(allRequests.filter(r => r.senderEmail === session.user.email));
  };

  const sendRequest = async (skill) => {
    await addDoc(collection(db, 'requests'), {
      skillId: skill.id,
      skillTitle: skill.title,
      senderEmail: session.user.email,
      receiverEmail: skill.userEmail,
      status: 'pending',
      timestamp: serverTimestamp(),
    });
  };

  const updateRequestStatus = async (id, status) => {
    await updateDoc(doc(db, 'requests', id), { status });
    fetchRequests();
  };

  useEffect(() => {
    if (session?.user?.email) fetchRequests();
  }, [session]);

  return { incomingRequests, outgoingRequests, fetchRequests, sendRequest, updateRequestStatus };
}
