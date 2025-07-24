'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

export default function ChatRoomList({ onSelectRoom }) {
  const { data: session, status } = useSession();
  const [publicRooms, setPublicRooms] = useState([]);
  const [privateRooms, setPrivateRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');

  useEffect(() => {
    if (!session || !session.user?.email) return;

 
    const publicQuery = query(
      collection(db, 'chatRooms'),
      where('isPublic', '==', true),
      orderBy('timestamp', 'desc')
    );

    const unsubscribePublic = onSnapshot(publicQuery, (snapshot) => {
      const rooms = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPublicRooms(rooms);
    });

   
    const privateQuery = query(
      collection(db, 'chatRooms'),
      where('participants', 'array-contains', session.user.email),
      orderBy('timestamp', 'desc')
    );

    const unsubscribePrivate = onSnapshot(privateQuery, (snapshot) => {
      const rooms = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((room) => !room.isPublic); 
      setPrivateRooms(rooms);
    });

    return () => {
      unsubscribePublic();
      unsubscribePrivate();
    };
  }, [session]);

  if (status === 'loading') return <p>Loading chat …</p>;
  if (!session || !session.user?.email) {
    return <p>Please sign in to view chats.</p>;
  }

  const createRoom = async () => {
    if (!newRoomName.trim()) return;
    try {
      await addDoc(collection(db, 'chatRooms'), {
        name: newRoomName.trim(),
        createdBy: session.user.email,
        participants: [session.user.email],
        isPublic: true, // Public by default
        timestamp: serverTimestamp(),
      });
      setNewRoomName('');
    } catch (err) {
      console.error('Error creating room:', err);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 space-y-6">
     

      <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Chat Rooms</h2>
   
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="New room name..."
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black transition"
        />
        <button
          onClick={createRoom}
          className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-900 transition"
        >
          Create
        </button>
      </div>



      {/* // public room visible to all  */}

      <div>
        <h3 className="text-sm font-semibold text-gray-600 mb-2">🌐 Public Rooms</h3>
        <ul className="space-y-2">
          {publicRooms.length === 0 ? (
            <p className="text-sm text-gray-400">No public rooms yet.</p>
          ) : (
            publicRooms.map((room) => (
              <li
                key={room.id}
                onClick={() => onSelectRoom(room)}
                className="cursor-pointer border border-gray-200 rounded-md px-4 py-3 hover:bg-gray-50 transition"
              >
                <p className="text-sm font-medium text-gray-800">{room.name}</p>
                <p className="text-xs text-gray-500">Created by: {room.createdBy}</p>
              </li>
            ))
          )}
        </ul>
      </div>




  {/* // for rooms created by user  */}
      <div>
        <h3 className="text-sm font-semibold text-gray-600 mt-6 mb-2"> Your Created Rooms</h3>
        <ul className="space-y-2">
          {privateRooms.length === 0 ? (
            <p className="text-sm text-gray-400">No private rooms yet.</p>
          ) : (
            privateRooms.map((room) => (
              <li
                key={room.id}
                onClick={() => onSelectRoom(room)}
                className="cursor-pointer border border-gray-200 rounded-md px-4 py-3 hover:bg-gray-50 transition"
              >
                <p className="text-sm font-medium text-gray-800">{room.name}</p>
                <p className="text-xs text-gray-500">Created by: {room.createdBy}</p>
              </li>
            ))
          )}
        </ul>
      </div>


    </div>
  );
}
