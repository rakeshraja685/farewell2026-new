import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const navLinks = [
  { to: "/gallery",   label: "Gallery"  },
  { to: "/videos",    label: "Videos"   },
  { to: "/yearbook",  label: "Yearbook" },
  { to: "/classroom", label: "Classroom" },
  { to: "/messages",  label: "Messages" },
];

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-500 ${
          scrolled ? "pt-4" : "pt-8"
        }`}
      >
        <div 
          className={`flex justify-between items-center px-6 transition-all duration-500 w-[90%] max-w-5xl rounded-full border border-white/10 shadow-2xl backdrop-blur-xl backdrop-saturate-150 ${
            scrolled ? "py-3 bg-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.2)]" : "py-4 bg-white/5"
          }`}
        >
          {/* Logo */}
          <Link
            to="/"
            className="font-display text-xl font-bold text-white hover:text-primary transition-colors duration-300 tracking-tight"
          >
            Farewell<span className="text-primary">.26</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex gap-1 items-center bg-white/5 p-1 rounded-full border border-white/5">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`font-body font-medium text-[13px] px-5 py-2 rounded-full transition-all duration-300 bouncy-hover ${
                  isActive(link.to)
                    ? "bg-primary text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                    : "text-on-surface-variant hover:text-white hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {/* CTA Button */}
            <Link
              to="/messages"
              className="hidden md:inline-flex items-center gap-2 px-5 py-2 text-[13px] font-semibold rounded-full bg-white text-background hover:scale-105 hover:bg-primary hover:text-white transition-all duration-300 shadow-xl"
            >
              Sign Guestbook
            </Link>

            {/* Mobile Hamburger */}
            <button
              className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 bg-white/10 rounded-full border border-white/10 cursor-pointer active:scale-95 transition-transform"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <span className="w-5 h-0.5 bg-white rounded-full" />
              <span className="w-5 h-0.5 bg-white rounded-full" />
              <span className="w-3 h-0.5 bg-white rounded-full self-start ml-2.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden animate-fadeIn">
          <div
            className="absolute inset-0 bg-background/60 backdrop-blur-xl"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-4 right-4 bottom-4 w-72 max-w-[85vw] glass-card rounded-3xl flex flex-col border border-white/10 shadow-2xl animate-slideInRight overflow-hidden">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-6 border-b border-white/5">
              <span className="font-display font-bold text-xl text-white">Menu</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
                aria-label="Close menu"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Links */}
            <div className="flex flex-col py-4 flex-1 overflow-y-auto px-4 gap-1">
              <Link
                to="/"
                className={`px-4 py-3.5 font-body font-medium text-[15px] rounded-2xl transition-all duration-200 flex items-center gap-3 ${
                  isActive("/")
                    ? "bg-primary/20 text-primary border border-primary/20"
                    : "text-on-surface hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">home</span>
                Home
              </Link>
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-3.5 font-body font-medium text-[15px] rounded-2xl transition-all duration-200 flex items-center gap-3 ${
                    isActive(link.to)
                      ? "bg-primary/20 text-primary border border-primary/20"
                      : "text-on-surface hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {link.to === "/gallery" ? "photo_library" : link.to === "/videos" ? "movie" : link.to === "/yearbook" ? "group" : link.to === "/classroom" ? "view_in_ar" : "edit_note"}
                  </span>
                  {link.label}
                </Link>
              ))}
            </div>

            {/* CTA */}
            <div className="p-6 border-t border-white/5">
              <Link
                to="/messages"
                className="block w-full bg-primary text-white py-3.5 text-sm font-semibold rounded-xl text-center hover:shadow-[0_8px_20px_rgba(139,92,246,0.4)] transition-shadow"
              >
                Sign Guestbook
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
