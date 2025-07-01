'use client';

import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, serverTimestamp, query ,  orderBy, limit, getDoc, onSnapshot } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { request } from 'http';
import StickyNavbar from '@/components/StickyNavbar';



export default function MarketplacePage() {
  const { data: session, status } = useSession();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    contact: '',
  });
  const [file, setFile] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
const [googleResults, setGoogleResults] = useState([]);
const [visibleCount, setVisibleCount] = useState(6);
const [googleSearch, setGoogleSearch]   = useState('');
const [messageTarget, setMessageTarget] = useState(null);
const [messageText, setMessageText] = useState('');
const [recentSearches, setRecentSearches] = useState([]);
const [formRequest, setFormRequest] = useState({
  title_2: '',
  description_2: '',
})
const [chatReceiverEmail, setChatReceiverEmail] = useState('');
const [requests, setRequests] = useState([]);
const [isChatOpen, setIsChatOpen] = useState(false);
const [activeRequestId, setActiveRequestId] = useState(null);
const [chatMessages, setChatMessages] = useState([]);
const [chatInput, setChatInput] = useState('');
const [chatFile, setChatFile] = useState(null);



const chatUnsubscribeRef = useRef(null);
  const bottomRef = useRef(null);

 
const openChatBox = (requestId, requesterEmail)=> {
  setIsChatOpen(true);
  setActiveRequestId(requestId);
    setChatReceiverEmail(requesterEmail);
  
  if (typeof chatUnsubscribeRef.current === 'function') {
  chatUnsubscribeRef.current(); 
  chatUnsubscribeRef.current = null;
}


  // Set new listener
  chatUnsubscribeRef.current = loadChatMessages(requestId);
}
const closeChatBox = () => {
  setIsChatOpen(false);
  setChatMessages([]);
  setActiveRequestId(null);
  setChatReceiverEmail('');
 if (typeof chatUnsubscribeRef.current === 'function') {
  chatUnsubscribeRef.current();
  chatUnsubscribeRef.current = null;
}

};


const sendChatMessage = async()=> {
  if (!chatInput.trim() && !chatFile) return;
  if (!activeRequestId || !session?.user?.email) return;
  let fileUrl = '';
  let fileType = '';
  let fileName = '';

    if (chatFile) {
    const formData = new FormData();
    formData.append('file', chatFile);
    formData.append('upload_preset', 'campusconnect_marketplace'); 

    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dajndivjw/auto/upload?resource_type=auto', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      fileUrl = data.secure_url;
      fileType = chatFile.type;
      fileName = chatFile.name;
    } catch (err) {
      console.error('File upload failed:', err);
      alert('Failed to upload file');
      return;
    }
  }

  await addDoc(collection(db, 'requestChats', activeRequestId, 'messages'), {
    sender: session.user.email,
    text: chatInput,
    fileUrl: fileUrl || '',
    fileType: fileType || '',
    fileName: fileName || '',
    timestamp: serverTimestamp(),
  })
  setChatInput('');
  loadChatMessages(activeRequestId);
  setChatFile(null);
}

const loadChatMessages = async (requestId)=> {
   const unsubscribe = onSnapshot(
    query(
      collection(db, 'requestChats', requestId, 'messages'),
      orderBy('timestamp', 'asc')
    ),
    (snapshot) => {
      const msgs = snapshot.docs.map(doc => doc.data());
      setChatMessages(msgs);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  );

  return unsubscribe;
}

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormRequest({ ...formRequest, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status !== 'authenticated') return alert('Please sign in');

    let imageUrl = '';

    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'campusconnect_marketplace');
      try {
        const res = await fetch('https://api.cloudinary.com/v1_1/dajndivjw/auto/upload?resource_type=raw', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        imageUrl = data.secure_url || '';
      } catch (err) {
        console.error('Image upload failed:', err);
        return alert('Failed to upload image');
        imageUrl = '';
      }
    }

    await addDoc(collection(db, 'marketplace'), {
    ...form,
  imageUrl: imageUrl || '',
  fileType: file?.type || '',
  fileName: file?.name || '',
  userEmail: session.user.email,
   timestamp: serverTimestamp(),
  status: 'available',
  postedAt: serverTimestamp(),
    });

    setForm({ title: '', description: '', category: '', price: '', contact: '' });
    setFile(null);
    fetchItems();
  };

  const handleSubmitTwo = async(e)=> {
      e.preventDefault();
     if (status !== 'authenticated') return alert('Please sign in');

         await addDoc(collection(db, 'RequestSection'), {
    ...formRequest,
  userEmail: session.user.email,
   timestamp: serverTimestamp(),
  postedAt: serverTimestamp(),
    });
     setFormRequest({ title_2: '', description_2: '' });
     fetchRequests();
  }
  const fetchRequests = async ()=> {
    const querySnapshot = await getDocs(collection(db, 'RequestSection'));
    const allRequests = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}))
    setRequests(allRequests);
    
  }

  const fetchItems = async () => {
    const querySnapshot = await getDocs(collection(db, 'marketplace'));
    const allItems = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setItems(allItems);
  };

   const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "marketplace", id));
      fetchItems();
    }catch(err){
      console.error("error deleting item ", err);
    }
   }

   const handleEdit = (item)=> {
    setForm({
      title: item.title,
    description: item.description ,
    category: item.category,
    price: item.price,
    contact: item.contact,

    }); 
    setEditingId(item.id)
   }

   const handleSave = async(id) => {
    try {
      const itemRef = doc(db, "marketplace", id);
      await updateDoc(itemRef, form); 
      setEditingId(null);
       setForm({ title: '', description: '', category: '', price: '', contact: '' });
       fetchItems();

    } catch(error){
      console.error("Error updating item: ", error);
    }
  }
   
  const handleToggleStatus =async(item)=> {
    try{
    const ref = doc(db, 'marketplace', item.id);
    const newStatus = item.status === 'sold'? 'available':'sold';
    await updateDoc(ref, {status: newStatus});
    console.log("Item object:", item);

    fetchItems();
  

    } catch(err){
      console.error("Failed to update item status:", err)
    }
  }

  const handleSearch = async () => {
  if (!googleSearch.trim()) return;
  try {
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(googleSearch)}&maxResults=40`
    );
    const data = await res.json();
    const books = data.items?.map((book) => {
      const info = book.volumeInfo;
      const access = book.accessInfo;
      return {
        title: info.title,
        authors: info.authors,
        thumbnail: info.imageLinks?.thumbnail,
        previewLink: info.previewLink,
        pdfAvailable: access.pdf?.isAvailable,
        pdfLink: access.pdf?.acsTokenLink || null,
      };
    }) || [];
    setGoogleResults(books);
    setVisibleCount(6); 
  } catch (err) {
    console.error('Google Books API failed:', err);
    setGoogleResults([]);
  }
};




   const handleSendMessage = async () => {
  if (!messageText.trim()) return;

  try {
    await addDoc(collection(db, 'messages'), {
      sender: session.user.email,
      receiver: messageTarget.userEmail,
      itemId: messageTarget.id,
      itemTitle: messageTarget.title,
      message: messageText,
      timestamp: serverTimestamp(),
    });

    alert("Message sent!");
    setMessageTarget(null);
    setMessageText('');
  } catch (err) {
    console.error("Failed to send message:", err);
  }
};

const fetchRecentSearches = async () => {
  const snapshot = await getDocs(
    query(
      collection(db, 'searchLogs'),
      orderBy('timestamp', 'desc'),
      limit(10)
    )
  );

  const terms = snapshot.docs.map(doc => doc.data().term);
  console.log("Fetched recent searches:", terms); 
  setRecentSearches(terms);
};






  useEffect(() => {
    if (status === 'authenticated') 
      {fetchItems();
      fetchRecentSearches();
      fetchRequests();
      }
  }, [status]);

  // =====================================return==============================
  

  return (
    <>
    <StickyNavbar></StickyNavbar>
    <main  className="min-h-screen bg-gradient-to-br from-white to-neutral-100 px-6 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <header className="relative text-center mb-16 py-12 px-6 bg-gradient-to-br from-neutral-50 via-white to-gray-100 rounded-2xl shadow-sm overflow-hidden">
  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-gray-200/20 via-transparent to-transparent"></div>

  <div className="relative z-10">
    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
      🎓 CampusCrate
      <span className="text-black"> Marketplace</span>
    </h1>
    <p className="mt-4 text-sm text-gray-600 max-w-xl mx-auto">
      Discover, post, and exchange useful items across your campus community — from books and notes to stationery and more.
    </p>
    <div className="mt-4 inline-flex items-center gap-2 justify-center text-black text-sm font-medium">
      📚 Try our new <a href="#campus-library" className="underline hover:text-gray-800">Campus Library</a>
    </div>
  </div>
</header>



       



        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-10">
          {/* LEFT COLUMN */}
          <section className="space-y-16">
            {/* Post Item Form */}

<form
  onSubmit={handleSubmit}
  className="bg-gradient-to-br from-neutral-50 via-white to-gray-100 p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6 transition"
>
  <h2 className="text-3xl font-bold text-gray-900 tracking-tight">📝 Post an Item</h2>

  {/* Item Name */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
    <input
      type="text"
      name="title"
      placeholder="Enter the item name"
      value={form.title}
      onChange={handleChange}
      required
      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
    />
  </div>

  {/* Description */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
    <textarea
      name="description"
      placeholder="Describe the item in detail"
      value={form.description}
      onChange={handleChange}
      required
      rows={4}
      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-black transition"
    />
  </div>

  {/* Category */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
    <select
      name="category"
      value={form.category}
      onChange={handleChange}
      required
      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black transition"
    >
      <option value="">Select a category</option>
      <option value="Books">Books</option>
      <option value="Notes">Notes</option>
      <option value="Stationery">Stationery</option>
      <option value="Free">Free</option>
      <option value="For Sale">For Sale</option>
    </select>
  </div>

  {/* Price & Contact */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
      <input
        type="text"
        name="price"
        placeholder="e.g. ₹100 or 'Free'"
        value={form.price}
        onChange={handleChange}
        required
        className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
      <input
        type="text"
        name="contact"
        placeholder="Email or phone number"
        value={form.contact}
        onChange={handleChange}
        required
        className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
      />
    </div>
  </div>

  {/* File Upload */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Upload File</label>
    <input
      type="file"
      accept="application/msword, application/vnd.ms-excel, application/vnd.ms-powerpoint, text/plain, application/pdf, image/*"
      onChange={(e) => setFile(e.target.files[0])}
      className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-black file:text-white hover:file:bg-gray-900 transition cursor-pointer"
    />
  </div>

  {/* Submit Button */}
  <div className="text-right">
    <button
      type="submit"
      className="bg-black text-white text-sm font-medium px-6 py-2 rounded-lg hover:bg-gray-900 transition"
    >
      🚀 Post Item
    </button>
  </div>
</form>



            {/* Category Filter + Listings */}
            {/* Category Filter + Listings */}
<div className="max-w-5xl mx-auto px-4">


  {items.length > 0 && (
    <>
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Filter by Category
        </label>
        <div className="relative w-full sm:w-64">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="appearance-none w-full bg-white border border-gray-300 text-sm text-gray-800 rounded-md px-4 py-2 pr-10 shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 transition"
          >
            <option value="">All Categories</option>
            <option value="Books">Books</option>
            <option value="Notes">Notes</option>
            <option value="Stationery">Stationery</option>
            <option value="Free">Free</option>
            <option value="For Sale">For Sale</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500 text-sm">
            ▼
          </div>
        </div>
      </div>

      <div className="space-y-6">
  <div className="mb-10 text-center">
    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
      📋 All Listings
    </h2>
    <p className="mt-2 text-sm text-gray-600 max-w-md mx-auto">
      Explore what's available from students across campus — from textbooks to tech gear.
    </p>
  </div>


        <div className="grid gap-6 sm:grid-cols-2">
           {items
      .filter(
        (item) =>
          (!selectedCategory || item.category === selectedCategory) &&
          (!searchTerm || item.title.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .map((item, idx) => {
        const isOwner = item.userEmail === session?.user?.email;
        const formattedDate = item.postedAt?.seconds
          ? new Date(item.postedAt.seconds * 1000).toLocaleDateString()
          : 'N/A';

        return (
          <div
            key={idx}
            className="bg-gradient-to-br from-white via-neutral-50 to-gray-100 border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-transform duration-200"
          >
            {editingId === item.id && isOwner ? (
              <>
                <input type="text" name="title" placeholder="Item Name" value={form.title} onChange={handleChange} required className="w-full border border-gray-300 p-2 rounded-md text-sm" />
                <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required className="w-full border border-gray-300 p-2 rounded-md text-sm mt-2" />
                <select name="category" value={form.category} onChange={handleChange} required className="w-full border border-gray-300 p-2 rounded-md text-sm mt-2">
                  <option value="">Select Category</option>
                  <option value="Books">Books</option>
                  <option value="Notes">Notes</option>
                  <option value="Stationery">Stationery</option>
                  <option value="Free">Free</option>
                  <option value="For Sale">For Sale</option>
                </select>
                <input type="text" name="price" placeholder="Price or 'Free'" value={form.price} onChange={handleChange} required className="w-full border border-gray-300 p-2 rounded-md text-sm mt-2" />
                <input type="text" name="contact" placeholder="Your Email or Phone" value={form.contact} onChange={handleChange} required className="w-full border border-gray-300 p-2 rounded-md text-sm mt-2" />
                <input type="file" accept="application/msword, application/vnd.ms-excel, application/vnd.ms-powerpoint, text/plain, application/pdf, image/*" onChange={(e) => setFile(e.target.files[0])} className="w-full mt-3 text-sm" />
                <div className="flex gap-3 mt-4">
                  <button onClick={() => handleSave(item.id)} className="text-sm text-green-600 hover:underline">Save</button>
                  <button onClick={() => setEditingId(null)} className="text-sm text-gray-600 hover:underline">Cancel</button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-3 flex items-start justify-between">
                  <span className="inline-block text-[11px] font-medium uppercase tracking-wide text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full shadow-sm">
                    {item.category}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">{item.description}</p>

                <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-700 mb-4">
                  <p><span className="font-semibold">💰 Price:</span> {item.price}</p>
                  <p><span className="font-semibold">📞 Contact:</span> {item.contact}</p>
                  <p className="col-span-2">
                    <span className="font-semibold">📅 Posted:</span> {formattedDate}
                  </p>
                </div>

                <span
                  className={`text-xs font-medium inline-block px-3 py-1 rounded-full border ${
                    item.status === 'sold'
                      ? 'text-red-600 bg-red-50 border-red-200'
                      : 'text-green-600 bg-green-50 border-green-200'
                  }`}
                >
                  {item.status === 'sold' ? '🔴 Sold' : '🟢 Available'}
                </span>

                {/* File Display */}

               {item.imageUrl && item.fileType === 'application/pdf' && (
  <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
    <div className="bg-gradient-to-r from-white to-gray-100 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
      <h4 className="text-sm font-medium text-gray-800 flex items-center gap-2">
        📄 PDF Preview
      </h4>
      <div className="flex gap-3 text-sm">
        <a
          href={item.imageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-black hover:text-gray-800 underline transition"
        >
          Download
        </a>
        <button
          onClick={() => window.open(item.imageUrl, '_blank')}
          className="text-black hover:text-gray-800 underline transition"
        >
          Print
        </button>
      </div>
    </div>
    <iframe
     src={`https://docs.google.com/gview?url=${encodeURIComponent(item.imageUrl)}&embedded=true`}
    className="w-full h-64 border-0"
    title="PDF Preview"
    ></iframe>
  </div>
)}


                {item.imageUrl && !item.fileType?.startsWith('image/') && item.fileType !== 'application/pdf' && (
                  <a
                    href={item.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center text-sm text-gray-700 hover:underline"
                  >
                    📄 Download {item.fileName || 'file'}
                  </a>
                )}

               {item.imageUrl && item.fileType?.startsWith('image/') && (
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full mt-4 rounded-xl border border-gray-200 object-cover"
                style={{ maxHeight: '400px' }} // Optional: limit height if needed
              />
              )}

                <div className="mt-6 flex flex-col gap-3">
                  <p className="text-xs text-gray-500 italic text-right">Posted by: {item.userEmail}</p>

                  {isOwner ? (
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => handleEdit(item)} className="px-3 py-1 text-xs font-medium text-gray-800 border border-gray-300 rounded-md hover:bg-gray-100 hover:text-black transition">Edit</button>
                      <button onClick={() => handleDelete(item.id)} className="px-3 py-1 text-xs font-medium text-gray-800 border border-gray-300 rounded-md hover:bg-gray-100 hover:text-black transition">Delete</button>
                      <button onClick={() => handleToggleStatus(item)} className="px-3 py-1 text-xs font-medium text-gray-800 border border-gray-300 rounded-md hover:bg-gray-100 hover:text-black transition">
                        {item.status === 'sold' ? 'Mark as Available' : 'Mark as Sold'}
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic mt-2">You can view this post.</p>
                  )}

                  <button
                    onClick={() => setMessageTarget(item)}
                    className="w-full mt-2 px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-900 transition"
                  >
                    📩 Contact Seller
                  </button>
                </div>
              </>
            )}
          </div>
        );
      })}
        </div>
      </div>
    </>
  )}
</div>


            {/* Google Book Results */}
        <section
  id="campus-library"
  className="relative mt-24 max-w-screen-xl mx-auto px-6 py-14 rounded-2xl shadow-lg overflow-hidden
             bg-gradient-to-br from-neutral-50 via-white to-gray-100 border border-gray-200"
>
  {/* radial background accent (same trick as header) */}
  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))]
                  from-gray-200/20 via-transparent to-transparent"></div>

  {/* all content lives above the halo */}
  <div className="relative z-10">

    {/* Title Block */}
    <div className="text-center mb-12">
      <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center justify-center gap-3">
        📚 Campus Library
      </h2>
      <p className="text-base text-gray-600 mt-3 max-w-xl mx-auto">
        Search books using Google Books API. Preview instantly and download if available.
      </p>
    </div>

    {/* Search Bar */}
    <div className="flex flex-col sm:flex-row items-center gap-4 mb-12 max-w-2xl mx-auto">
      <input
        type="text"
        value={googleSearch}
        onChange={(e) => setGoogleSearch(e.target.value)}
        placeholder="Search for a book..."
        className="flex-1 w-full px-5 py-3 text-sm border border-gray-300 rounded-lg shadow-sm
                   focus:outline-none focus:ring-2 focus:ring-black transition"
      />
      <button
        onClick={handleSearch}
        className="px-6 py-3 text-sm font-semibold text-white bg-black rounded-lg shadow
                   hover:bg-gray-900 transition"
      >
        Search
      </button>
    </div>

    {/* Helper Text */}
    {!googleResults.length && googleSearch.trim() && (
      <p className="text-center text-sm text-gray-500 mt-12">
        No books found. Try another search term! 📚
      </p>
    )}
    {!googleSearch.trim() && (
      <p className="text-center text-sm text-gray-500 mt-12">
        Start typing above to look up books via Google Books.
      </p>
    )}

    {/* Results */}
    {googleResults.length > 0 && (
      <div className="mt-12">
        <h3 className="text-2xl font-semibold text-center text-gray-800 mb-10">
          📖 Search Results
        </h3>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {googleResults.slice(0, visibleCount).map((book, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-lg
                         hover:-translate-y-1 transition-transform p-6 flex flex-col items-center text-center"
            >
              {book.thumbnail && (
                <img
                  src={book.thumbnail}
                  alt="Book Cover"
                  className="w-28 h-40 object-cover rounded-lg border border-gray-300 mb-4"
                />
              )}
              <h4 className="text-lg font-semibold text-gray-900 mb-1">{book.title}</h4>
              {book.authors && (
                <p className="text-sm text-gray-500 mb-4">By {book.authors.join(', ')}</p>
              )}
              <div className="mt-auto flex gap-6 text-sm font-medium text-gray-600">
                <a
                  href={book.previewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline hover:text-black"
                >
                  🔍 Preview
                </a>
                {book.pdfAvailable && book.pdfLink && (
                  <a
                    href={book.pdfLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline hover:text-black"
                  >
                    📄 PDF
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {visibleCount < googleResults.length && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={() => setVisibleCount((prev) => prev + 6)}
              className="px-6 py-3 text-sm font-semibold bg-black text-white rounded-lg
                         hover:bg-gray-900 transition"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    )}

  </div>
</section>


          </section>

          {/* RIGHT COLUMN (sticky) */}
          <aside className="space-y-12 xl:sticky top-24 h-fit">
            {/* Recent Searches */}
{recentSearches.length > 0 && (
  <div className="bg-white/80 backdrop-blur border border-gray-200 rounded-2xl shadow-md px-6 py-5 mb-14 max-w-xl mx-auto">
    <h2 className="text-sm font-semibold text-gray-800 mb-3 tracking-tight flex items-center gap-1">
      🧠 Students Recently Searched
    </h2>

    <div className="flex flex-wrap gap-2">
      {recentSearches.map((term, i) => (
        <span
          key={i}
          className="text-xs px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition cursor-default max-w-[160px] truncate shadow-sm"
          title={term}
        >
          {term}
        </span>
      ))}
    </div>
  </div>
)}


            {/* Request Form */}
     <form
  onSubmit={handleSubmitTwo}
  className="bg-gradient-to-br from-neutral-50 via-white to-gray-100 border border-gray-200 rounded-2xl shadow-sm max-w-2xl mx-auto px-8 py-10 space-y-8"
>
  {/* Title */}
  <div className="text-center">
    <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center justify-center gap-2">
      🎯 Request an Item
    </h2>
    <p className="text-sm text-gray-600 mt-1 max-w-md mx-auto">
      Need something specific? Let your campus know what you're looking for.
    </p>
  </div>

  {/* Item Name */}
  <div>
    <label className="block text-sm font-medium text-gray-800 mb-2">
      Item Name
    </label>
    <input
      type="text"
      name="title_2"
      placeholder="e.g. Scientific Calculator, Graph Paper..."
      value={formRequest.title_2}
      onChange={handleChange}
      required
      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
    />
  </div>

  {/* Description */}
  <div>
    <label className="block text-sm font-medium text-gray-800 mb-2">
      Description
    </label>
    <textarea
      name="description_2"
      placeholder="Mention brand, type, urgency, or any specific requirements."
      value={formRequest.description_2}
      onChange={handleChange}
      required
      rows={5}
      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md resize-none shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
    />
  </div>

  {/* Submit Button */}
  <div className="text-right">
    <button
      type="submit"
      className="inline-flex items-center justify-center gap-2 px-6 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-900 transition shadow"
    >
      📤 Submit Request
    </button>
  </div>
</form>




            {/* Request Cards */}
  <div className="mt-16 max-w-6xl mx-auto px-4">
  <section className="mt-24 max-w-6xl mx-auto px-4">
  <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center tracking-tight">
    📋 Your Requests
  </h2>
</section>

  {requests.length === 0 ? (
    <p className="text-gray-500 text-center text-sm">No requests yet.</p>
  ) : (
    <div className="flex flex-col gap-6">
      {requests.map((request) => (
        <div
          key={request.id}
          className="relative bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-transform duration-200"
        >
          {/* Optional badge */}
          <span className="absolute top-4 left-4 text-[11px] font-medium uppercase text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
            Request
          </span>

          <div className="flex flex-col h-full pt-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 leading-tight mb-1">
                {request.title_2}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {request.description_2}
              </p>
            </div>

            <div className="mt-auto flex flex-col gap-3">
              <p className="text-xs text-gray-500">
                Posted by: <span className="italic">{request.userEmail}</span>
              </p>

              <button
                onClick={() => openChatBox(request.id, request.userEmail)}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-900 transition"
              >
                💬 Chat
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )}
</div>

          </aside>
        </div>

        {/* Chat Panel + Message Modal (portals / modals) stay outside grid */}
        {isChatOpen && (
  <div className="fixed inset-0 z-50 flex">
    {/* translucent backdrop */}
    <div
      className="flex-1 bg-black/40 backdrop-blur-sm"
      onClick={closeChatBox}
    />

    {/* chat panel */}
    <div className="w-full sm:w-[26rem] h-full bg-white border-l border-gray-200 shadow-xl flex flex-col animate-slide-in">
      
      {/* header */}
      <div className="p-5 border-b border-gray-200 bg-white flex justify-between items-center">
        <h2 className="text-base font-semibold text-gray-900 truncate">
          💬 Chat with&nbsp;
          {chatReceiverEmail !== session?.user?.email
            ? chatReceiverEmail
            : 'Unknown'}
        </h2>
        <button
          onClick={closeChatBox}
          className="text-gray-400 hover:text-black text-xl font-bold transition"
          aria-label="Close chat"
        >
          &times;
        </button>
      </div>

      {/* messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
        {chatMessages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
              msg.sender === session?.user?.email
                ? 'ml-auto bg-gray-200 text-gray-900'
                : 'mr-auto bg-white border border-gray-200 text-gray-800'
            }`}
          >
            {msg.text && (
              <p className="whitespace-pre-wrap break-words">{msg.text}</p>
            )}

            {msg.fileUrl && msg.fileType?.startsWith('image/') && (
              <img
                src={msg.fileUrl}
                alt="Sent File"
                className="w-40 h-auto mt-2 rounded-md border border-gray-300"
              />
            )}

            {msg.fileUrl && msg.fileType === 'application/pdf' && (
              <iframe
                src={msg.fileUrl}
                title="PDF Preview"
                className="w-full h-48 mt-2 rounded-md border border-gray-300"
              />
            )}

            {msg.fileUrl &&
              !msg.fileType?.startsWith('image/') &&
              msg.fileType !== 'application/pdf' && (
                <a
                  href={msg.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:underline mt-2 inline-block"
                >
                  📄 Download {msg.fileName || 'file'}
                </a>
              )}

            <p className="text-xs text-gray-500 mt-1 italic">
              {msg.sender === session?.user?.email ? 'You' : msg.sender}
            </p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* composer */}
      <div className="p-4 border-t border-gray-200 bg-white space-y-3">
        <input
          type="text"
          placeholder="Type your message..."
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
        />

        <label className="block">
          <span className="text-sm text-gray-700">📎 Attach a file</span>
          <input
            type="file"
            accept="application/msword, application/vnd.ms-excel, application/vnd.ms-powerpoint, text/plain, application/pdf, image/*"
            onChange={(e) => setChatFile(e.target.files[0])}
            className="mt-1 block w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:bg-gray-100 file:text-gray-800 hover:file:bg-gray-200"
          />
        </label>

        <button
          onClick={sendChatMessage}
          className="w-full py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-900 transition"
        >
          Send
        </button>
      </div>
    </div>
  </div>
)}
{messageTarget && (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 w-[90%] max-w-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">📨 Message the Seller</h2>

      <div className="mb-3 text-sm text-gray-700">
        <strong>Item:</strong> {messageTarget.title}
      </div>

      <textarea
        rows={4}
        className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-black transition resize-none"
        placeholder="Write your message here..."
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
      />

      <div className="flex justify-end mt-5 gap-3">
        <button
          onClick={() => setMessageTarget(null)}
          className="text-sm text-gray-600 hover:underline transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSendMessage}
          className="px-5 py-2 text-sm font-semibold text-white bg-black rounded-lg hover:bg-gray-900 transition"
        >
          Send
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
