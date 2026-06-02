import { Link } from "react-router-dom";
import { useEffect, useRef, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { galleryPhotos } from "../data/gallery";

const sectionSlides = [
  "/images/sliding images/WhatsApp Image 2026-04-10 at 1.05.48 PM.jpeg",
  "/images/sliding images/WhatsApp Image 2026-04-10 at 1.05.50 PM.jpeg",
  "/images/sliding images/WhatsApp Image 2026-04-10 at 1.05.56 PM.jpeg",
  "/images/sliding images/WhatsApp Image 2026-05-02 at 12.27.00 PM.jpeg",
  "/images/sliding images/WhatsApp Image 2026-05-02 at 12.27.01 PM.jpeg",
  "/images/sliding images/WhatsApp Image 2026-05-02 at 12.27.02 PM.jpeg",
  "/images/sliding images/WhatsApp Image 2026-05-02 at 12.27.03 PM.jpeg",
  "/images/sliding images/WhatsApp Image 2026-05-02 at 12.27.04 PM.jpeg",
];

const heroSlides = [
  "/images/sliding images/WhatsApp Image 2026-04-10 at 1.05.48 PM.jpeg",
  "/images/sliding images/WhatsApp Image 2026-04-10 at 1.05.50 PM.jpeg",
  "/images/sliding images/WhatsApp Image 2026-04-10 at 1.05.56 PM.jpeg",
  "/images/sliding images/WhatsApp Image 2026-04-10 at 3.15.03 PM.jpeg",
  "/images/sliding images/WhatsApp Image 2026-04-10 at 3.15.36 PM.jpeg",
  "/images/sliding images/WhatsApp Image 2026-04-10 at 3.15.41 PM.jpeg",
  "/images/sliding images/WhatsApp Image 2026-04-10 at 3.16.19 PM.jpeg",
  "/images/sliding images/WhatsApp Image 2026-04-10 at 3.16.25 PM.jpeg",
  "/images/sliding images/WhatsApp Image 2026-04-10 at 3.16.27 PM.jpeg",
  "/images/sliding images/WhatsApp Image 2026-05-02 at 12.26.57 PM.jpeg",
  "/images/sliding images/WhatsApp Image 2026-05-02 at 12.26.57 PM (1).jpeg",
  "/images/sliding images/WhatsApp Image 2026-05-02 at 12.26.58 PM.jpeg",
];

function getRandomPhoto() {
  return galleryPhotos[Math.floor(Math.random() * galleryPhotos.length)];
}

function getDaysSinceFarewell() {
  const farewell = new Date("2026-04-10T00:00:00");
  const now = new Date();
  const diff = Math.floor((now - farewell) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

const quickNav = [
  { to: "/gallery",  icon: "🎉", label: "Gallery",   desc: "Browse moments"   },
  { to: "/videos",   icon: "🍿", label: "Videos",    desc: "Watch memories"   },
  { to: "/yearbook", icon: "👾", label: "People",    desc: "Our classmates"   },
  { to: "/classroom", icon: "🏫", label: "Classroom",  desc: "Explore the room" },
  { to: "/messages", icon: "✍️", label: "Guestbook", desc: "Leave a message"  },
];

export default function LandingPage() {
  const sectionsRef = useRef([]);
  const [currentSlide, setCurrentSlide]   = useState(0);
  const [sectionSlide, setSectionSlide]   = useState(0);
  const [daysSince, setDaysSince]         = useState(getDaysSinceFarewell());
  const [entered, setEntered] = useState(false);
  
  // Random polaroid state
  const [scatterPhotos, setScatterPhotos] = useState(() => {
    const shuffled = [...galleryPhotos].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const sectionTimer = setInterval(() => {
      setSectionSlide((prev) => (prev + 1) % sectionSlides.length);
    }, 3000);
    return () => clearInterval(sectionTimer);
  }, []);

  useEffect(() => {
    const tick = setInterval(() => setDaysSince(getDaysSinceFarewell()), 60000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    const scatterTimer = setInterval(() => {
      setScatterPhotos(prev => {
        const next = [...prev];
        const replaceIdx = Math.floor(Math.random() * 4);
        let newPhoto;
        do {
          newPhoto = getRandomPhoto();
        } while (next.find(p => p.id === newPhoto.id));
        next[replaceIdx] = newPhoto;
        return next;
      });
    }, 3500);
    return () => clearInterval(scatterTimer);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.12 }
    );
    sectionsRef.current.forEach((el) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  const addRef = (el) => {
    if (el && !sectionsRef.current.includes(el)) sectionsRef.current.push(el);
  };

  return (
    <div className="route-transition bg-background text-on-surface relative overflow-hidden">
      {/* Background Ambient Blobs */}
      <div className="ambient-blob purple w-[600px] h-[600px] top-0 left-0" />
      <div className="ambient-blob rose w-[500px] h-[500px] top-[40%] right-0" style={{ animationDelay: '-5s' }} />
      <div className="ambient-blob cyan w-[700px] h-[700px] bottom-0 left-[20%]" style={{ animationDelay: '-10s' }} />

      {/* ── Entry Screen ── */}
      {!entered && createPortal(
        <div 
          onClick={() => setEntered(true)}
          style={{ zIndex: 9999 }}
          className="fixed inset-0 flex flex-col items-center justify-center cursor-pointer gap-8 bg-background/95 backdrop-blur-xl animate-fadeIn"
        >
          <div className="text-[80px] animate-float">👋</div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-center px-4 animate-slideUp">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent-rose to-accent-cyan">Farewell 2026</span>
          </h1>
          <p className="font-body text-on-surface-variant bg-white/5 px-6 py-3 rounded-full animate-slideUp" style={{ animationDelay: '0.2s' }}>
            Tap anywhere to explore ✨
          </p>
        </div>,
        document.body
      )}

      {/* ── Hero Section ── */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-32 px-6 md:px-12">
        {/* Background slideshow */}
        <div className="absolute inset-4 md:inset-8 z-0 rounded-[2rem] overflow-hidden shadow-2xl">
          {heroSlides.map((src, index) => (
            <img
              key={src}
              src={src}
              alt={`Slide ${index + 1}`}
              style={{ willChange: "transform, opacity", transform: index === currentSlide ? 'scale(1)' : 'scale(1.05)' }}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-[2500ms] ease-in-out ${
                index === currentSlide ? "opacity-40" : "opacity-0"
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent pointer-events-none" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto w-full text-center flex flex-col items-center">
          <div className="pill-badge mx-auto animate-slideUp mb-6 bg-white/10 backdrop-blur-md text-white border-white/20">
            ✨ Aurelian Legacy • Class of 2023–2026
          </div>

          <h1 className="font-display text-6xl md:text-[7rem] font-bold leading-tight tracking-tight animate-slideUp" style={{ animationDelay: '0.2s' }}>
            Farewell <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent-rose to-accent-cyan animate-gradient-pan">Our Final Chapter</span>
          </h1>
          <p className="font-body text-on-surface-variant text-lg md:text-xl animate-slideUp mt-6 max-w-2xl font-light" style={{ animationDelay: '0.3s' }}>
            A tribute to the moments that defined us, the friendships that shaped us, and the future that awaits us.
          </p>
          
          <div className="pt-10 flex flex-wrap justify-center gap-4 animate-slideUp" style={{ animationDelay: '0.4s' }}>
            <Link to="/gallery" className="bg-white text-background font-semibold px-8 py-4 rounded-full bouncy-hover flex items-center gap-2 shadow-xl hover:shadow-[0_10px_30px_rgba(255,255,255,0.3)]">
              View Gallery 🎉
            </Link>
            <Link to="/videos" className="glass-card text-white font-semibold px-8 py-4 rounded-full bouncy-hover flex items-center gap-2 hover:bg-white/10">
              Watch Videos 🍿
            </Link>
          </div>
        </div>
      </section>

      {/* ── Quick Navigation ── */}
      <section ref={addRef} className="fade-in-section py-20 px-6 md:px-12 relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-4">
          {quickNav.map((item, i) => (
            <Link
              key={item.to}
              to={item.to}
              style={{ animationDelay: `${i * 50}ms` }}
              className="glass-card bouncy-hover hover:bg-white/10 rounded-[2rem] p-6 md:p-8 flex flex-col items-center text-center gap-4"
            >
              <div className="text-4xl bg-white/5 w-16 h-16 rounded-full flex items-center justify-center shadow-inner">
                {item.icon}
              </div>
              <h3 className="font-display font-semibold text-lg text-white">{item.label}</h3>
              <p className="font-body text-xs text-on-surface-variant">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── The Sweet Goodbye ── */}
      <section ref={addRef} className="fade-in-section py-24 px-6 md:px-12 relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center bg-surface/30 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-8 md:p-16">
          <div className="relative group mx-auto w-full max-w-md lg:max-w-none rounded-[2rem] overflow-hidden shadow-2xl aspect-[4/5]">
            {sectionSlides.map((src, i) => (
              <img
                key={src}
                src={src}
                alt={`Slide ${i + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                  i === sectionSlide ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
              {sectionSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSectionSlide(i)}
                  className={`rounded-full border-none cursor-pointer transition-all duration-300 ${
                    i === sectionSlide ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div className="pill-badge bg-accent-rose/20 text-accent-rose border-accent-rose/30">
              🍰 April 10, 2026
            </div>
            <h2 className="font-display font-bold text-4xl md:text-6xl text-white leading-tight">
              The Sweet <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent-rose to-accent-cyan animate-gradient-pan">Goodbye</span>
            </h2>
            <blockquote className="font-body text-lg text-on-surface-variant leading-relaxed p-6 bg-white/5 rounded-2xl border border-white/5 italic">
              "Every chapter must end so the next one can begin. This cake wasn't just a celebration — it was a promise. A promise that no matter where life takes us, the bonds we formed here will never dissolve."
            </blockquote>
          </div>
        </div>
      </section>

      {/* ── Scattered Core Memories ── */}
      <section ref={addRef} className="fade-in-section py-32 px-6 overflow-hidden relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-white">Core Memories 📸</h2>
        </div>
        
        <div className="memories-scatter">
          {[
            { width: '280px', top: '5%', left: '15%', transform: 'rotate(-8deg)' },
            { width: '300px', top: '10%', right: '15%', transform: 'rotate(12deg)' },
            { width: '320px', bottom: '5%', left: '30%', transform: 'rotate(-4deg)' },
            { width: '260px', top: '40%', right: '25%', transform: 'rotate(-10deg)' }
          ].map((pos, i) => (
            <div key={i} className="polaroid-modern" style={pos}>
              <div className="polaroid-modern-image relative bg-white/5">
                <img 
                  key={scatterPhotos[i].id}
                  src={scatterPhotos[i].src} 
                  alt={scatterPhotos[i].title} 
                  className="absolute inset-0 w-full h-full object-cover" 
                  style={{ animation: 'routeFadeIn 0.8s ease-out forwards' }}
                />
              </div>
              <p className="polaroid-modern-caption truncate px-2">{scatterPhotos[i].title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── By the Numbers ── */}
      <section ref={addRef} className="fade-in-section py-32 px-6 md:px-12 relative z-10">
        <div className="max-w-5xl mx-auto text-center mb-16">
          <span className="font-body text-sm text-primary font-semibold tracking-wider block mb-4 uppercase">Statistics</span>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-white mb-4">By the Numbers 📈</h2>
        </div>

        {/* Live counter card */}
        <div className="max-w-md mx-auto mb-16">
          <div className="glass-card rounded-[3rem] p-12 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent-rose to-accent-amber animate-gradient-pan" />
            <div className="text-5xl mb-4 animate-float">⏳</div>
            <p className="font-body text-sm text-on-surface-variant font-medium mb-2">Days Since Our Farewell</p>
            <div className="font-display font-bold text-7xl md:text-8xl tabular-nums tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent-rose to-accent-cyan animate-gradient-pan pb-2">{daysSince}</div>
            <p className="font-body text-xs text-primary mt-4 font-semibold">April 10, 2026 → Today</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { end: 1095, label: "Days Together", icon: "🗓️" },
            { end: 29, label: "Videos", icon: "🎬" },
            { end: 284, label: "Photos Taken", icon: "📷" },
            { end: "∞", label: "Inside Jokes", icon: "😂" },
          ].map((stat, i) => (
            <div key={i} className="glass-card rounded-3xl p-6 text-center bouncy-hover flex flex-col items-center justify-center">
              <div className="text-3xl mb-3">{stat.icon}</div>
              <div className="font-display font-bold text-3xl text-white mb-1">{stat.end}</div>
              <p className="font-body text-xs text-on-surface-variant font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-20 px-6 relative z-10 mt-20">
        <div className="max-w-4xl mx-auto glass-card rounded-[3rem] p-12 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
          <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4 relative z-10">Ready to leave a mark? ✍️</h2>
          <p className="font-body text-on-surface-variant mb-8 max-w-lg mx-auto relative z-10">
            Every great story needs a beautiful epilogue. Before we turn the final page, take a moment to sign our digital legacy.
          </p>
          <Link
            to="/messages"
            className="inline-flex items-center justify-center gap-2 bg-white text-background px-8 py-4 text-sm font-semibold rounded-full bouncy-hover shadow-xl relative z-10"
          >
            Sign the Guestbook
          </Link>
          
          <div className="mt-16 pt-8 border-t border-white/5 flex flex-col items-center gap-4 relative z-10">
            <div className="flex gap-4 flex-wrap justify-center">
              {quickNav.map(nav => (
                <Link key={nav.to} to={nav.to} className="font-body text-sm text-on-surface-variant hover:text-white transition-colors">{nav.label}</Link>
              ))}
            </div>
            <p className="font-body text-xs text-on-surface-variant opacity-60">
              © 2026 AURELIAN LEGACY • CLASS OF 2023-2026
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
