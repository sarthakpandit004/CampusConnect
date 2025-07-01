'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState} from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  where,
  arrayUnion
  
} from 'firebase/firestore';


export default function ChatRoomList({ onSelectRoom }) {
  const { data: session, status } = useSession();  
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');

  
   useEffect(() => {
    if (!session || !session.user?.email) return;

    // ✅ MOVE query definition inside after the check
  const q = query(
  collection(db, "chatRooms"),
  where("participants", "array-contains-any", [session.user.email, "__PUBLIC__"]),
  orderBy("timestamp", "desc")
);


    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRooms(roomList);
    });

    return () => unsubscribe();
  }, [session]);

    if (status === "loading") return <p>Loading chat …</p>;

  if (!session || !session.user?.email) {
    return <p>Please sign in to view chats.</p>;
  }


const createRoom = async () => {
    if (!newRoomName.trim()) return;

    try {
     await addDoc(collection(db, "chatRooms"), {
  name: newRoomName.trim(),
  createdBy: session.user.email,
  participants: [session.user.email],  // ✅ include the creator
  isPublic: true,                      // ✅ optional, helps identify community rooms
  timestamp: serverTimestamp(),
});

      setNewRoomName("");
    } catch (err) {
      console.error("Error creating room:", err);
    }
  };
 
return (
  <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 space-y-5">
    {/* Heading */}
    <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
      Chat Rooms
    </h2>

    {/* Create Room Input */}
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

    {/* Room List */}
    <ul className="space-y-3">
      {rooms.map((room) => (
        <li
          key={room.id}
          onClick={() => onSelectRoom(room)}
          className="cursor-pointer border border-gray-200 rounded-md px-4 py-3 hover:bg-gray-50 transition"
        >
          <p className="text-sm font-medium text-gray-800">{room.name}</p>
          <p className="text-xs text-gray-500">Created by: {room.createdBy}</p>
        </li>
      ))}
    </ul>
  </div>
);

}
