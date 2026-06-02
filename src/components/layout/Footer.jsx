import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-32 border-t border-white/10 bg-background/50 backdrop-blur-xl">
      {/* Decorative Top Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Brand Column */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <Link to="/" className="font-display font-bold text-3xl md:text-4xl">
              Farewell<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent-rose to-accent-cyan">.26</span>
            </Link>
            <p className="font-body text-on-surface-variant text-lg max-w-sm leading-relaxed">
              A digital scrapbook for the Class of 2026. Preserving the laughs, the late nights, and the legacy we built together. ✨
            </p>
            {/* Social / share actions */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: "Farewell 2026",
                      text: "Check out our Class of 2026 Farewell Website!",
                      url: window.location.href,
                    }).catch(console.error);
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}
                className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-on-surface hover:text-primary bouncy-hover hover:bg-white/10 transition-colors cursor-pointer"
                title="Share Website"
              >
                <span className="material-symbols-outlined">share</span>
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-on-surface hover:text-accent-rose bouncy-hover hover:bg-white/10 transition-colors cursor-pointer"
                title="Copy Link"
              >
                <span className="material-symbols-outlined">link</span>
              </button>
            </div>
          </div>

          {/* Navigation Column */}
          <div className="md:col-span-3 md:col-start-7">
            <h4 className="font-display font-bold text-lg text-white mb-6 flex items-center gap-2">
              Explore 🧭
            </h4>
            <div className="flex flex-col gap-4">
              {[
                { to: "/",        label: "Home"     },
                { to: "/gallery", label: "Gallery"  },
                { to: "/videos",  label: "Videos"   },
                { to: "/yearbook",label: "Yearbook" },
                { to: "/classroom",label: "Classroom" },
                { to: "/messages",label: "Messages" },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="font-body text-on-surface-variant hover:text-white transition-colors duration-300 w-fit text-lg"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Quote Column */}
          <div className="md:col-span-3 md:col-start-10">
            <h4 className="font-display font-bold text-lg text-white mb-6 flex items-center gap-2">
              Parting Thought 💭
            </h4>
            <blockquote className="glass-card p-6 rounded-2xl border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-accent-cyan" />
              <p className="font-body text-on-surface-variant italic leading-relaxed relative z-10 text-lg">
                "How lucky I am to have something that makes saying goodbye so hard."
              </p>
              <footer className="mt-4 font-body text-sm font-bold text-white uppercase tracking-wider relative z-10">
                — Winnie the Pooh 🍯
              </footer>
            </blockquote>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-accent-rose animate-pulse" />
            <span className="font-body font-bold text-white/50 text-sm tracking-wider uppercase">
              Class of 2023–2026 • Aurelian Legacy
            </span>
          </div>
          <span className="font-body font-bold text-white/50 text-sm tracking-wider uppercase">
            Made with ❤️ for {year}
          </span>
        </div>
      </div>
    </footer>
  );
}
