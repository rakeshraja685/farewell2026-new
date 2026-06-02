import { useState, useMemo, useCallback, useRef } from "react";
import { people, categories } from "../data/people";

// ─── Easter Egg Modal ────────────────────────────────────────────────────────
function EasterEggModal({ person, onClose }) {
  const [slide, setSlide] = useState(0);
  const photos = person.easterEggPhotos;
  const total  = photos.length;

  const prev = () => setSlide((s) => (s - 1 + total) % total);
  const next = () => setSlide((s) => (s + 1) % total);

  // keyboard nav
  const handleKey = useCallback((e) => {
    if (e.key === "Escape")     onClose();
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft")  prev();
  }, [slide]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
      onKeyDown={handleKey}
      tabIndex={-1}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-lg" />

      {/* Content */}
      <div
        className="relative z-10 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Badge */}
        <div className="text-center mb-4">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary font-sans text-[10px] uppercase tracking-widest font-bold">
            🥚 You found the Easter Egg!
          </span>
        </div>

        {/* Image */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/80 aspect-[3/4] bg-stone-900">
          {photos.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={`Easter Egg ${i + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                i === slide ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}

          {/* Overlay label */}
          <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
            <p className="font-serif italic text-white text-lg">💪 The Secret Builder</p>
            <p className="font-sans text-[10px] text-stone-300 uppercase tracking-widest mt-1">
              {slide + 1} / {total}
            </p>
          </div>

          {/* Nav arrows */}
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center cursor-pointer hover:bg-black/70 transition-colors"
          >
            <span className="material-symbols-outlined text-white text-lg">chevron_left</span>
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center cursor-pointer hover:bg-black/70 transition-colors"
          >
            <span className="material-symbols-outlined text-white text-lg">chevron_right</span>
          </button>

          {/* Dot indicators */}
          <div className="absolute top-3 left-0 right-0 flex justify-center gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`rounded-full border-none cursor-pointer transition-all duration-300 ${
                  i === slide ? "w-4 h-1.5 bg-primary" : "w-1.5 h-1.5 bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mt-4 text-center space-y-1">
          <p className="font-serif italic text-stone-300 text-sm">
            "The man who codes also lifts. Who knew? 🏋️"
          </p>
          <p className="font-sans text-[10px] text-stone-600 uppercase tracking-widest">
            Click his card again to reopen · Press Esc to close
          </p>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-surface-container border border-outline-variant/30 flex items-center justify-center cursor-pointer hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-on-surface-variant text-lg">close</span>
        </button>
      </div>
    </div>
  );
}

// ─── Share Card (canvas) ──────────────────────────────────────────────────────
function shareCard(person, displayPhoto) {
  const canvas = document.createElement("canvas");
  canvas.width  = 600;
  canvas.height = 750;
  const ctx = canvas.getContext("2d");

  const grad = ctx.createLinearGradient(0, 0, 600, 750);
  grad.addColorStop(0, "#1c1917");
  grad.addColorStop(1, "#292524");
  ctx.fillStyle = grad;
  ctx.roundRect(0, 0, 600, 750, 16);
  ctx.fill();

  ctx.strokeStyle = "#d4a847";
  ctx.lineWidth   = 2;
  ctx.beginPath();
  ctx.moveTo(40, 40);
  ctx.lineTo(560, 40);
  ctx.stroke();

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    const photoX = 200, photoY = 70, photoSize = 200;
    ctx.save();
    ctx.beginPath();
    ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, photoX, photoY, photoSize, photoSize);
    ctx.restore();

    ctx.strokeStyle = "#d4a847";
    ctx.lineWidth   = 3;
    ctx.beginPath();
    ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#fafaf9";
    ctx.font = "bold 30px Georgia";
    ctx.textAlign = "center";
    ctx.fillText(person.name, 300, 310);

    ctx.fillStyle = "#d4a847";
    ctx.font = "italic 18px Georgia";
    ctx.fillText(`"${person.nickname}"`, 300, 345);

    ctx.fillStyle = "#a8a29e";
    ctx.font = "13px Arial";
    ctx.fillText(person.superlative.toUpperCase(), 300, 380);

    ctx.strokeStyle = "#d4a847";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(80, 405);
    ctx.lineTo(520, 405);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#d6d3d1";
    ctx.font = "italic 16px Georgia";
    ctx.textAlign = "center";
    const quote = `"${person.quote}"`;
    const words = quote.split(" ");
    let line = "", y = 440;
    for (const word of words) {
      const test = line + word + " ";
      if (ctx.measureText(test).width > 480 && line) {
        ctx.fillText(line.trim(), 300, y);
        line = word + " ";
        y += 28;
      } else { line = test; }
    }
    ctx.fillText(line.trim(), 300, y);

    ctx.fillStyle = "#d4a847";
    ctx.font = "bold 12px Arial";
    ctx.fillText("FAREWELL 2026 • CLASS OF 2023–2026 • AURELIAN LEGACY", 300, 715);

    ctx.strokeStyle = "#d4a847";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 710);
    ctx.lineTo(560, 710);
    ctx.stroke();

    const link = document.createElement("a");
    link.download = `${person.name.replace(/\s/g, "_")}_farewell_card.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };
  img.onerror = () => {
    ctx.fillStyle = "#d4a847";
    ctx.font = "bold 28px Georgia";
    ctx.textAlign = "center";
    ctx.fillText(person.name, 300, 310);
    const link = document.createElement("a");
    link.download = `${person.name.replace(/\s/g, "_")}_farewell_card.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };
  img.src = displayPhoto || person.photo;
}

// ─── Person Card ──────────────────────────────────────────────────────────────
function PersonCard({ person }) {
  const [imgSrc, setImgSrc] = useState(person.photo);

  // Fallback if image doesn't exist
  const handleImgError = () => {
    if (imgSrc !== person.photo) setImgSrc(person.photo);
  };

  const [eggOpen, setEggOpen] = useState(false);

  const handleClick = () => {
    if (person.easterEgg) setEggOpen(true);
  };

  return (
    <>
      <div
        className="group bg-surface-container-low rounded-2xl overflow-hidden yearbook-card-hover border border-transparent hover:border-primary/10"
      >
        {/* Photo */}
        <div
          className={`aspect-[4/5] overflow-hidden relative ${person.easterEgg ? "cursor-pointer" : ""}`}
          onClick={handleClick}
          title={person.easterEgg ? "Click for a surprise 🥚" : undefined}
        >
          <img
            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
            src={imgSrc}
            alt={person.name}
            loading="lazy"
            onError={handleImgError}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent opacity-70" />

          {/* Nickname badge */}
          <div className="absolute top-3 right-3 glass-card px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 transition-all duration-300">
            <span className="font-sans text-[10px] text-primary uppercase tracking-widest">{person.nickname}</span>
          </div>

          {/* Category badge */}
          <div className="absolute bottom-3 left-3">
            <span className="font-sans text-[9px] uppercase tracking-widest bg-black/50 backdrop-blur-sm text-stone-300 px-2 py-1 rounded-full">
              {person.category}
            </span>
          </div>

          {/* Easter egg hint — very subtle egg icon, hidden until hover */}
          {person.easterEgg && (
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-60 transition-opacity duration-500">
              <span className="text-lg select-none" title="Click me!">🥚</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-6">
          <span className="font-sans uppercase tracking-[0.2em] text-[9px] text-primary mb-2 block">
            {person.superlative}
          </span>
          <h3 className="font-serif italic text-xl text-on-surface mb-2 leading-tight">{person.name}</h3>
          <p className="font-body text-xs text-on-surface-variant leading-relaxed italic mb-4 line-clamp-2">
            "{person.quote}"
          </p>

          {/* Fun Fact */}
          <div className="pt-3 border-t border-outline-variant/10 mb-4">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-primary/40 text-sm mt-0.5">auto_awesome</span>
              <p className="font-sans text-[11px] text-on-surface-variant leading-relaxed">{person.funFact}</p>
            </div>
          </div>

          {/* Share Button */}
          <button
            onClick={() => shareCard(person, imgSrc)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface-variant text-[11px] font-sans uppercase tracking-widest transition-all duration-300 border border-outline-variant/15 hover:border-primary cursor-pointer hover:shadow-md hover:shadow-primary/10"
          >
            <span className="material-symbols-outlined text-sm">share</span>
            Share My Card
          </button>
        </div>
      </div>

      {/* Easter Egg Modal */}
      {eggOpen && <EasterEggModal person={person} onClose={() => setEggOpen(false)} />}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ClassYearbook() {
  const [activeCategory, setActiveCategory] = useState("All Scholars");
  const [searchQuery,    setSearchQuery]    = useState("");
  const [sortAlpha,      setSortAlpha]      = useState(false);

  const filtered = useMemo(() => {
    let result = people;
    if (activeCategory !== "All Scholars") {
      result = result.filter((p) => p.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.nickname.toLowerCase().includes(q) ||
        p.superlative.toLowerCase().includes(q)
      );
    }
    if (sortAlpha) {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }
    return result;
  }, [activeCategory, searchQuery, sortAlpha]);

  return (
    <div className="pt-12 pb-24 px-6 md:px-12 max-w-screen-2xl mx-auto route-transition">
      {/* Header */}
      <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="max-w-2xl">
          <div className="pill-badge mb-6">
            <span className="material-symbols-outlined text-xs">group</span>
            Class of 2023–2026
          </div>
          <h1 className="font-serif italic text-5xl md:text-7xl tracking-tight text-gradient-gold mb-4 leading-none">
            Class of <br />2026
          </h1>
          <p className="font-body text-on-surface-variant text-lg max-w-md">
            The faces behind the memories. A curated collection celebrating the people who made these past years truly unforgettable.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
          {/* Search */}
          <div className="relative w-full sm:w-72 group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-stone-600 group-focus-within:text-primary transition-colors text-lg">search</span>
            </div>
            <input
              className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant/30 text-on-surface pl-12 py-3.5 font-body placeholder:text-stone-600 tracking-wide outline-none text-sm transition-all"
              placeholder="Search classmates..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {/* Sort Toggle */}
          <button
            onClick={() => setSortAlpha(!sortAlpha)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-sans uppercase tracking-widest transition-all duration-300 border-none cursor-pointer ${
              sortAlpha
                ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
            }`}
          >
            <span className="material-symbols-outlined text-lg">sort_by_alpha</span>
            A–Z
          </button>
        </div>
      </header>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 rounded-full text-[11px] font-sans font-bold uppercase tracking-widest cursor-pointer transition-all duration-300 border outline-none ${
              activeCategory === cat
                ? "bg-primary text-on-primary border-primary filter-pill-active"
                : "bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high border-outline-variant/20 hover:border-primary/30"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results count */}
      <div className="mb-10">
        <span className="inline-flex items-center gap-2 bg-surface-container-high text-primary px-5 py-2 rounded-full text-[11px] font-bold font-sans uppercase tracking-widest border border-outline-variant/20">
          <span className="material-symbols-outlined text-sm">person</span>
          {filtered.length} {filtered.length === 1 ? "person" : "people"}
        </span>
      </div>

      {/* Student Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((person) => (
          <PersonCard key={person.id} person={person} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-24 text-center">
          <span className="material-symbols-outlined text-primary text-5xl mb-4">search_off</span>
          <p className="font-serif italic text-xl text-on-surface-variant">No classmates match your search.</p>
        </div>
      )}
    </div>
  );
}
