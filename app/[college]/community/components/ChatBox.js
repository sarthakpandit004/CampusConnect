'use client';

import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  where,
  arrayUnion,
  updateDoc,
  doc,               
} from 'firebase/firestore';

import { useSession } from 'next-auth/react';

export default function ChatBox({ room, currentUserEmail }) {
  const { data: session, status } = useSession();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!room) return;
   
if (!room || !room.id || !session?.user?.email) return;

    const q = query(
      collection(db, 'messages'),
      where('roomId', '==', room.id),
      orderBy('timestamp', 'asc')
    );

console.log("Trying to subscribe to messages for room:", room?.id);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messageList);

      // scroll to bottom on new messages
      if (bottomRef.current && snapshot.docChanges().some(change => change.type === 'added')) {
  setTimeout(() => bottomRef.current.scrollIntoView({ behavior: 'smooth' }), 100);
}
    });

    return () => unsubscribe();
  }, [room]);

  useEffect(() => {
  if (!room || !session?.user?.email) return;

  const isPublic = room.isPublic === true;
  const isParticipant = room.participants?.includes(session.user.email);

  if (!isPublic && !isParticipant) {
    const roomRef = doc(db, "chatRooms", room.id);
    console.log("Trying to join room:", room?.id);

    updateDoc(roomRef, {
      participants: arrayUnion(session.user.email),
    }).catch((err) => {
      console.error("Failed to join room:", err);
    });
  }
}, [room, session]);


  const sendMessage = async () => {
    if (!message.trim()) return;
    try {
      await addDoc(collection(db, 'messages'), {
        text: message.trim(),
        roomId: room.id,
        sender: session.user.email,
        timestamp: serverTimestamp(),
      });
      setMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  if (!room) return null;
  if (status !== 'authenticated') return <p>Please sign in to chat.</p>;

 return (
    <div className="flex flex-col h-[500px] bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-base font-semibold text-gray-900">#{room.name}</h2>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50">
        {messages.map((msg) => {
          const isOwnMessage = msg.sender === session?.user?.email;

          return (
    <div
      key={msg.id}
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[75%] px-4 py-2 rounded-lg shadow-sm text-sm break-words ${
          isOwnMessage
            ? 'bg-black text-white rounded-br-none'
            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
        }`}
      >
        <p>{msg.text}</p>
        <p
          className={`mt-1 text-xs text-gray-400 text-right ${
            isOwnMessage ? 'text-white/70' : ''
          }`}
        >
          {!isOwnMessage && <span className="mr-1">{msg.sender}</span>}
          {msg.timestamp?.seconds
            ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString()
            : 'Sending...'}
        </p>
      </div>
    </div>
  );
})}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-gray-200 px-4 py-3 bg-white">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black transition"
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="px-5 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-900 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );

}
