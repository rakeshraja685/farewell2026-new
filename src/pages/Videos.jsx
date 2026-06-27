import { galleryVideos } from "../data/gallery";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

// ─── Custom Video Player Modal ────────────────────────────────────────────────
function VideoModal({ video, onClose }) {
  const iframeSrc = video.src;
  const isMobile = window.innerWidth < 768;

  // Lock body scroll while modal is open, restore on unmount
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleClose = () => {
    onClose();
  };

  // ── MOBILE: true full-screen ─────────────────────────────────────────────────
  // The root cause of controls overlapping the video is that Google Drive's
  // player renders seek bar / volume / play btn at fixed pixel heights.
  // Any constraining wrapper box (aspect-ratio, max-height) confuses Drive's
  // layout engine and causes those controls to float over the video content.
  // Giving the iframe the full 100dvw × 100dvh viewport solves this completely.
  if (isMobile) {
    return createPortal(
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "#000",
          width: "100dvw",
          height: "100dvh",
          overflow: "hidden",
        }}
      >
        {/* iframe fills the entire screen — no padding, no border-radius */}
        <iframe
          src={iframeSrc}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            border: "none",
            display: "block",
          }}
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          title={video.title}
        />

        {/* Floating overlay: title pill + close button — top-right corner */}
        <div
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            zIndex: 10000,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 8,
          }}
        >
          {/* Title pill */}
          <div
            style={{
              background: "rgba(0,0,0,0.70)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              borderRadius: 999,
              padding: "5px 14px",
              maxWidth: "58vw",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontStyle: "italic",
                fontSize: 13,
                color: "#fff",
                letterSpacing: 0.3,
              }}
            >
              {video.title}
            </span>
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            aria-label="Close video"
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.18)",
              border: "1px solid rgba(255,255,255,0.30)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              cursor: "pointer",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.5)",
              flexShrink: 0,
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 22, lineHeight: 1 }}
            >
              close
            </span>
          </button>
        </div>
      </div>,
      document.body
    );
  }

  // ── DESKTOP: elegant centered panel ─────────────────────────────────────────
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-8 bg-black/95 backdrop-blur-md">
      {/* Click-outside to close */}
      <div className="absolute inset-0 cursor-pointer" onClick={handleClose} />

      {/* Header bar */}
      <div className="absolute top-0 left-0 right-0 px-8 py-6 flex justify-between items-center z-20 pointer-events-none">
        <div className="max-w-2xl">
          <h3 className="font-serif italic text-2xl text-white drop-shadow-md truncate">
            {video.title}
          </h3>
          <p className="font-sans text-[11px] text-stone-300 uppercase tracking-widest mt-1">
            {video.date}
          </p>
        </div>
        <button
          onClick={handleClose}
          className="pointer-events-auto w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all backdrop-blur-sm cursor-pointer shadow-lg"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
      </div>

      {/* 16:9 video panel centered on screen */}
      <div
        className="relative w-full max-w-5xl z-10 bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10"
        style={{ aspectRatio: "16 / 9", maxHeight: "82vh" }}
      >
        <iframe
          src={iframeSrc}
          className="w-full h-full border-0"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          title={video.title}
        />
      </div>
    </div>,
    document.body
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Videos() {
  const [activeVideo, setActiveVideo] = useState(null);

  const getThumbnailUrl = (src) => {
    const match = src.match(/\/d\/([a-zA-Z0-9_-]+)/);
    const id = match ? match[1] : null;
    return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w800-h450` : null;
  };

  return (
    <div className="pt-12 pb-24 px-6 md:px-12 max-w-screen-2xl mx-auto route-transition">
      {/* Header */}
      <header className="mb-16 space-y-4">
        <div className="pill-badge mb-4">
          <span className="material-symbols-outlined text-xs">play_circle</span>
          Video Archive
        </div>
        <h1 className="font-serif italic text-6xl md:text-8xl tracking-tight text-gradient-gold">
          Videos
        </h1>
        <p className="font-body text-on-surface-variant text-lg max-w-2xl leading-relaxed">
          Watch the moments come alive — celebrations, candid clips and memories worth replaying forever.
        </p>
      </header>

      {/* Video count */}
      <p className="font-sans text-[11px] text-on-surface-variant uppercase tracking-widest mb-10">
        <span className="text-primary font-bold">{galleryVideos.length}</span>{" "}
        {galleryVideos.length === 1 ? "video" : "videos"}
      </p>

      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {galleryVideos.map((video) => {
          const thumbUrl = getThumbnailUrl(video.src);

          return (
            <button
              key={video.id}
              onClick={() => setActiveVideo(video)}
              className="group block relative w-full text-left rounded-2xl overflow-hidden bg-surface-container-low border border-surface-container-highest hover:border-primary/30 transition-all duration-500 shadow-lg hover:shadow-primary/20 hover:-translate-y-2 cursor-pointer"
            >
              {/* Thumbnail Container */}
              <div className="relative w-full aspect-video bg-[#0a0a0a] overflow-hidden border-b border-surface-container-highest">
                {thumbUrl ? (
                  <img
                    src={thumbUrl}
                    alt={video.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = "none";
                      if (e.target.nextSibling)
                        e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}

                {/* Fallback */}
                <div
                  className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]"
                  style={{ display: thumbUrl ? "none" : "flex" }}
                >
                  <span className="material-symbols-outlined text-stone-800 text-6xl">
                    movie
                  </span>
                </div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/0 transition-colors duration-500">
                  <div className="w-16 h-16 rounded-full bg-primary/90 text-on-primary flex items-center justify-center shadow-lg shadow-black/50 transform group-hover:scale-110 transition-transform duration-500 backdrop-blur-sm">
                    <span className="material-symbols-outlined text-3xl ml-1">
                      play_arrow
                    </span>
                  </div>
                </div>
              </div>

              {/* Video Info */}
              <div className="p-5 flex justify-between items-center bg-surface-container-low group-hover:bg-surface-container transition-colors duration-500">
                <div>
                  <h3 className="font-serif italic text-lg text-on-surface group-hover:text-primary transition-colors duration-300 line-clamp-1">
                    {video.title}
                  </h3>
                  <p className="font-sans text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">
                    <span className="material-symbols-outlined text-[10px] mr-1 align-middle text-primary/70">
                      calendar_today
                    </span>
                    {video.date}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Video Modal */}
      {activeVideo && (
        <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />
      )}
    </div>
  );
}
