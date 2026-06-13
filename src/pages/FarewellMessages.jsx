import { useState, useCallback, useEffect } from "react";
import { defaultMessages } from "../data/messages";
import Toast from "../components/Toast";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../firebase";

export default function FarewellMessages() {
  const [messages, setMessages] = useState(defaultMessages);
  const [hearts, setHearts] = useState(() => {
    try { return JSON.parse(localStorage.getItem("gala-hearts") || "{}"); } catch { return {}; }
  });
  const [animatingHeart, setAnimatingHeart] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [formData, setFormData] = useState({ name: "", message: "", anonymous: false });
  // Track which message IDs have a pending like update in-flight
  const [pendingLikes, setPendingLikes] = useState(new Set());

  useEffect(() => {
    // Listen to messages from Firestore in real-time
    const q = query(collection(db, "farewell_messages"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Preserve optimistic like counts for messages that have pending updates
      setMessages(prev => {
        const prevMap = Object.fromEntries(prev.map(m => [m.id, m]));
        const updatedMsgs = msgs.map(msg => {
          // If this message has a pending like update, keep our optimistic count
          if (pendingLikes.has(msg.id) && prevMap[msg.id]) {
            return { ...msg, likes: prevMap[msg.id].likes };
          }
          return msg;
        });
        return [...updatedMsgs, ...defaultMessages];
      });
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleHeart = async (id) => {
    // Block if an update is already in-flight for this message
    if (pendingLikes.has(id) || animatingHeart === id) return;

    const isLiked = !!hearts[id];
    const newHearts = { ...hearts, [id]: !isLiked };

    // 1. Instantly toggle heart color
    setHearts(newHearts);
    localStorage.setItem("gala-hearts", JSON.stringify(newHearts));
    setAnimatingHeart(id);
    setTimeout(() => setAnimatingHeart(null), 300);

    // 2. Optimistically update count on screen
    setMessages(prev => prev.map(msg =>
      msg.id === id ? { ...msg, likes: Math.max(0, (msg.likes || 0) + (isLiked ? -1 : 1)) } : msg
    ));

    // 3. Lock message while Firebase update is in-flight
    setPendingLikes(prev => new Set([...prev, id]));

    // 4. Send the real +1 or -1 to Firebase
    if (typeof id === 'string' && id.length > 10) {
      try {
        const msgRef = doc(db, "farewell_messages", id);
        await updateDoc(msgRef, { likes: increment(isLiked ? -1 : 1) });
      } catch (error) {
        console.error("Error updating likes:", error);
        // Revert on failure
        setHearts({ ...hearts, [id]: isLiked });
        localStorage.setItem("gala-hearts", JSON.stringify({ ...hearts, [id]: isLiked }));
        setMessages(prev => prev.map(msg =>
          msg.id === id ? { ...msg, likes: Math.max(0, (msg.likes || 0) + (isLiked ? 1 : -1)) } : msg
        ));
      } finally {
        // 5. Release lock
        setPendingLikes(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() && !formData.anonymous) {
      setToastMessage("Please enter your name or post as anonymous! 👤");
      setShowToast(true);
      return;
    }
    if (!formData.message.trim()) {
      setToastMessage("Please enter your farewell message! 💖");
      setShowToast(true);
      return;
    }
    
    const newMsg = {
      name: formData.anonymous ? "Anonymous" : (formData.name || "Anonymous"),
      date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" }),
      message: formData.message,
      avatar: null,
      source: null,
      type: "student",
      likes: 0,
      createdAt: serverTimestamp()
    };
    
    try {
      // Save message to Firebase Database
      await addDoc(collection(db, "farewell_messages"), newMsg);
      setFormData({ name: "", message: "", anonymous: false });
      setToastMessage("Your legacy has been preserved ✨");
      setShowToast(true);
    } catch (error) {
      console.error("Error adding message: ", error);
      alert("Failed to send message. Please make sure you have internet connection.");
    }
  };

  const hideToast = useCallback(() => setShowToast(false), []);

  return (
    <div className="pt-12 pb-24 px-6 md:px-12 max-w-screen-2xl mx-auto">
      {/* Hero */}
      <header className="mb-20 md:mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
          <div className="lg:col-span-7">
            <h1 className="font-serif italic text-5xl md:text-7xl lg:text-8xl leading-tight tracking-tight mb-8">
              The Aurelian <br /><span className="text-primary">Legacy</span>
            </h1>
            <p className="font-body text-on-surface-variant text-lg md:text-xl max-w-2xl leading-relaxed">
              A dedicated space for the words that define us. Share your reflections, gratitudes, and farewells as we close this chapter of our collective journey.
            </p>
          </div>
          <div className="lg:col-span-5 hidden lg:block">
            <div className="aspect-[4/3] bg-surface-container overflow-hidden rounded-2xl border border-outline-variant/20 shadow-2xl shadow-black/40">
              <img className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-700"
                src="/images/sliding images/WhatsApp Image 2026-04-10 at 3.16.19 PM.jpeg"
                alt="Farewell memories" />
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Message Feed */}
        <section className="lg:col-span-7 order-2 lg:order-1 space-y-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif italic text-3xl">Reflections & Well-wishes</h2>

          </div>

          {messages.map((msg) => (
            <article key={msg.id} className="bg-surface-container-low p-8 md:p-10 rounded-xl relative group animate-fadeIn">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-serif italic text-xl mb-1">{msg.name}</h3>
                </div>
                <span className="font-serif italic text-stone-600 text-sm">{msg.date}</span>
              </div>
              <div className="w-20 h-px bg-primary/30 mb-6" />
              <p className="font-serif text-on-surface leading-relaxed text-base italic mb-6 opacity-90">
                "{msg.message}"
              </p>
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-3">
                  {msg.avatar && (
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-surface-container-high">
                      <img className="w-full h-full object-cover grayscale" src={msg.avatar} alt={msg.name} />
                    </div>
                  )}
                  {msg.source && (
                    <span className="text-[10px] uppercase tracking-widest text-stone-500">
                      Shared via {msg.source}
                    </span>
                  )}
                </div>
                {/* Heart */}
                <button
                  onClick={() => toggleHeart(msg.id)}
                  disabled={pendingLikes.has(msg.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all border-none ${
                    pendingLikes.has(msg.id)
                      ? "cursor-wait opacity-70 bg-surface-container-high text-on-surface-variant"
                      : hearts[msg.id]
                        ? "cursor-pointer bg-red-500/10 text-red-400"
                        : "cursor-pointer bg-surface-container-high text-on-surface-variant hover:text-red-400 hover:bg-red-500/10"
                  }`}
                >
                  <span className={`material-symbols-outlined text-lg ${animatingHeart === msg.id ? "animate-heartPop" : ""}`}
                    style={{ fontVariationSettings: hearts[msg.id] ? "'FILL' 1" : "'FILL' 0" }}>
                    favorite
                  </span>
                  <span className="text-[10px] font-bold">
                    {(typeof msg.id === 'string' && msg.id.length > 10) ? (msg.likes || 0) : (hearts[msg.id] ? 1 : 0)}
                  </span>
                </button>
              </div>
            </article>
          ))}

          {messages.length === 0 && (
            <div className="py-16 text-center">
              <p className="font-serif italic text-xl text-on-surface-variant">No messages yet.</p>
            </div>
          )}
        </section>

        {/* Form Sidebar */}
        <aside className="lg:col-span-5 order-1 lg:order-2">
          <div className="sticky top-28 bg-surface-container p-8 md:p-10 rounded-xl shadow-2xl">
            <div className="mb-8">
              <h2 className="font-serif italic text-3xl mb-3">Leave Your Legacy</h2>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Your words will be archived in the physical yearbook and preserved in our digital vaults. Write with intention.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="block font-sans text-[10px] uppercase tracking-widest text-stone-500">Your Full Name</label>
                <input
                  className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant/30 text-on-surface focus:ring-0 focus:border-primary transition-colors py-3 text-sm placeholder:text-stone-700 outline-none"
                  placeholder="e.g. Sebastian Thorne"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>



              <div className="space-y-2">
                <label className="block font-sans text-[10px] uppercase tracking-widest text-stone-500">Your Farewell Message</label>
                <textarea
                  className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant/30 text-on-surface focus:ring-0 focus:border-primary transition-colors py-3 text-sm placeholder:text-stone-700 italic font-serif outline-none"
                  placeholder="Write your heartfelt message here..."
                  rows="5"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-4 py-2">
                <input
                  className="rounded border-outline-variant/30 bg-surface-container-lowest text-primary focus:ring-primary h-4 w-4"
                  id="anon"
                  type="checkbox"
                  checked={formData.anonymous}
                  onChange={(e) => setFormData({ ...formData, anonymous: e.target.checked })}
                />
                <label className="text-[10px] uppercase tracking-widest text-stone-400" htmlFor="anon">
                  Post message as anonymous
                </label>
              </div>

              <button
                className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary py-4 font-bold uppercase tracking-widest transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 active:scale-[0.98] border-none outline-none cursor-pointer rounded-lg"
                type="submit"
              >
                Publish to Guestbook
              </button>
            </form>

            <div className="mt-10 pt-10 border-t border-outline-variant/10">
              <span className="material-symbols-outlined text-primary-container mb-3 block">format_quote</span>
              <p className="font-serif italic text-stone-400 text-sm leading-relaxed">
                "The world is a book and those who do not travel stay only on one page. This is the end of our first chapter."
              </p>
            </div>
          </div>
        </aside>
      </div>

      <Toast message={toastMessage} isVisible={showToast} onClose={hideToast} />
    </div>
  );
}
