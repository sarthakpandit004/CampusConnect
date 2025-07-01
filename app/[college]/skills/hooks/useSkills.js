'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export function useSkills(session) {
  const [skills, setSkills] = useState([]);

  const fetchSkills = async () => {
    const querySnapshot = await getDocs(collection(db, 'skills'));
    const allSkills = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setSkills(allSkills);
  };

  const addSkill = async (form, mediaUrl, mediaType) => {
    await addDoc(collection(db, 'skills'), {
      ...form,
      userEmail: session.user.email,
      mediaUrl,
      mediaType,
    });
    fetchSkills();
  };

  const updateSkill = async (id, form) => {
    await updateDoc(doc(db, 'skills', id), form);
    fetchSkills();
  };

  const deleteSkill = async (id) => {
    await deleteDoc(doc(db, 'skills', id));
    fetchSkills();
  };

  useEffect(() => {
    if (session?.user?.email) fetchSkills();
  }, [session]);

  return { skills, fetchSkills, addSkill, updateSkill, deleteSkill };
}
