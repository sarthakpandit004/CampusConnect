'use client';

import { useState } from 'react';
import ChatRoomList from './components/ChatRoomList';
import ChatBox from './components/ChatBox';
import Link from 'next/link';
import StickyNavbar from '@/components/StickyNavbar';


export default function CommunityPage() {
  const [selectedRoom, setSelectedRoom] = useState(null);

  return (
    <>
    
    <StickyNavbar></StickyNavbar>
    <main className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-gray-100 px-6 py-12">
      <div className="max-w-7xl mx-auto">
    

        <header className="relative text-center mb-16 py-12 px-6 bg-gradient-to-br from-neutral-50 via-white to-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-gray-200/20 via-transparent to-transparent" />
          <div className="relative z-10 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
              Community Chat
            </h1>
            <p className="mt-4 text-sm text-gray-600 max-w-xl mx-auto">
              Join discussions, ask questions, or start a thread with others in your campus circle.
            </p>
          </div>
        </header>

     
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

  
          <aside className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-5">
            <ChatRoomList onSelectRoom={setSelectedRoom} />
          </aside>

       
          <section className="md:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm p-6 min-h-[500px]">
            {selectedRoom ? (
              <ChatBox room={selectedRoom} />
            ) : (
              <div className="h-full flex items-center justify-center border border-dashed border-gray-200 rounded-xl bg-gray-50 text-gray-500 text-sm p-6">
                Select a chat room to start messaging
              </div>
            )}
          </section>

        </div>
      </div>
    </main>
    </>
  );
}
