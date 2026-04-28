import { useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";

const ACCENTS = [
  { name: "magenta", hex: "#FF3AF2", border: "border-accent-magenta", shadow: "hard-shadow-magenta" },
  { name: "cyan", hex: "#00F5D4", border: "border-accent-cyan", shadow: "hard-shadow-cyan" },
  { name: "yellow", hex: "#FFE600", border: "border-accent-yellow", shadow: "hard-shadow-yellow" },
  { name: "orange", hex: "#FF6B35", border: "border-accent-orange", shadow: "hard-shadow-orange" },
  { name: "purple", hex: "#7B2FFF", border: "border-accent-purple", shadow: "hard-shadow-purple" }
];

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mql) return;
    const onChange = () => setReduced(Boolean(mql.matches));
    onChange();
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

function useInView(options) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), options);
    io.observe(el);
    return () => io.disconnect();
  }, [options]);
  return [ref, inView];
}

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function BalloonCandles({ seed = 0 }) {
  const items = useMemo(() => {
    const palette = ACCENTS.map((a) => a.hex);
    const anims = ["motion-safe:animate-float", "motion-safe:animate-wiggle", "motion-safe:animate-bounce-subtle"];
    const pos = [
      { t: "8%", l: "12%", s: "text-5xl", g: "🎈" },
      { t: "12%", l: "84%", s: "text-6xl", g: "🎈" },
      { t: "64%", l: "6%", s: "text-4xl", g: "🎈" },
      { t: "72%", l: "90%", s: "text-4xl", g: "🎈" },
      { t: "18%", l: "52%", s: "text-3xl", g: "🕯️" },
      { t: "78%", l: "52%", s: "text-3xl", g: "🕯️" }
    ];
    return pos.map((p, i) => ({
      id: `${seed}-bc-${i}`,
      glyph: p.g,
      className: cx("pointer-events-none absolute select-none opacity-90", p.s, anims[(seed + i) % anims.length]),
      style: {
        top: p.t,
        left: p.l,
        color: palette[(seed + i) % palette.length],
        filter: `drop-shadow(0 0 18px ${palette[(seed + i) % palette.length]}55)`
      }
    }));
  }, [seed]);

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      {items.map((it) => (
        <span key={it.id} className={it.className} style={it.style}>
          {it.glyph}
        </span>
      ))}
    </div>
  );
}

function MusicPlayer() {
  const reduced = usePrefersReducedMotion();
  const audioRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const [d, setD] = useState(0);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onLoaded = () => {
      setReady(true);
      setD(a.duration || 0);
    };
    const onTime = () => setT(a.currentTime || 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);

    a.addEventListener("loadedmetadata", onLoaded);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onEnded);
    return () => {
      a.removeEventListener("loadedmetadata", onLoaded);
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("ended", onEnded);
    };
  }, []);

  const toggle = async () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      return;
    }
    try {
      await a.play();
    } catch {
     
    }
  };

  return (
    <div className="mt-10 w-full max-w-3xl">
      <div className="relative border-4 border-accent-purple bg-[#0d0d1a]/70 p-5 backdrop-blur hard-shadow-purple">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-[220px]">
            <div className="text-xs font-bold uppercase tracking-[0.26em] text-accent-purple">Birthday song</div>
            <div className="mt-2 font-heading text-2xl font-black uppercase text-white text-shadow-triple">
              Happy Birthday, Mom 🎵
            </div>
            <div className="mt-1 text-sm text-white/80">Press play.</div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggle}
              className="inline-flex items-center gap-3 border-4 border-accent-cyan bg-[#0d0d1a] px-5 py-3 font-heading text-sm font-black uppercase tracking-widest text-white hard-shadow-cyan focus:outline-none focus-visible:ring-4 focus-visible:ring-accent-cyan"
              aria-label={playing ? "Pause birthday song" : "Play birthday song"}
            >
              {playing ? "Pause" : "Play"} <span aria-hidden="true">{playing ? "⏸" : "▶"}</span>
            </button>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-4">
          <div className="text-xs font-bold uppercase tracking-[0.26em] text-accent-yellow">
            {formatTime(t)} / {formatTime(d)}
          </div>
          <input
            aria-label="Song progress"
            type="range"
            min={0}
            max={Math.max(1, d || 1)}
            value={Math.min(t, d || 1)}
            onChange={(e) => {
              const a = audioRef.current;
              if (!a) return;
              a.currentTime = Number(e.target.value);
              setT(a.currentTime || 0);
            }}
            className="h-[10px] w-full cursor-pointer appearance-none rounded-full border-4 border-accent-yellow bg-[#0d0d1a] outline-none"
          />
        </div>

        <div className="mt-4">
          <audio
            ref={audioRef}
            src="/birthday.mp3"
            preload={reduced ? "none" : "metadata"}
            controls={!ready}
            className={cx("w-full", ready ? "hidden" : "block")}
          />
          <div className="text-sm text-white/80">
            {ready ? "Song ready." : "Loading…"}
          </div>
        </div>
      </div>
    </div>
  );
}

function FloatingDecorations({ seed = 0, density = 8 }) {
  const items = useMemo(() => {
    const glyphs = ["✦", "✨", "♥", "✧", "●", "✺"];
    const anims = ["motion-safe:animate-float", "motion-safe:animate-wiggle", "motion-safe:animate-spin-slow", "motion-safe:animate-bounce-subtle", "motion-safe:animate-pulse-glow"];
    const sizes = ["text-xs", "text-sm", "text-base", "text-lg", "text-2xl", "text-3xl", "text-4xl"];
    const pos = [
      { t: "8%", l: "7%" },
      { t: "14%", l: "82%" },
      { t: "22%", l: "56%" },
      { t: "46%", l: "10%" },
      { t: "52%", l: "88%" },
      { t: "68%", l: "22%" },
      { t: "72%", l: "76%" },
      { t: "84%", l: "48%" },
      { t: "32%", l: "92%" },
      { t: "90%", l: "8%" }
    ];
    return Array.from({ length: density }).map((_, i) => {
      const a = ACCENTS[(seed + i) % ACCENTS.length];
      const p = pos[(seed + i) % pos.length];
      return {
        id: `${seed}-${i}`,
        glyph: glyphs[(seed + i * 3) % glyphs.length],
        className: cx(
          "pointer-events-none absolute select-none opacity-80 blur-[0.2px]",
          sizes[(seed + i * 5) % sizes.length],
          anims[(seed + i * 7) % anims.length]
        ),
        style: { top: p.t, left: p.l, color: a.hex, textShadow: `0 0 18px ${a.hex}40` }
      };
    });
  }, [seed, density]);

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      {items.map((it) => (
        <span key={it.id} className={it.className} style={it.style}>
          {it.glyph}
        </span>
      ))}
    </div>
  );
}

function SectionShell({ id, label, title, children, seed }) {
  return (
    <section id={id} className="relative isolate bg-cosmic-pattern py-20 sm:py-28">
      <FloatingDecorations seed={seed} density={9} />
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-7">
        <div className="mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-[0.26em] text-accent-cyan">{label}</span>
            <span className="h-[4px] w-14 bg-accent-magenta shadow-[0_0_22px_rgba(255,58,242,0.28)]" />
          </div>
          <h2 className="mt-4 font-heading text-5xl font-extrabold uppercase leading-[0.95] text-white sm:text-6xl text-shadow-triple">
            {title}
          </h2>
        </div>
        {children}
      </div>
    </section>
  );
}

function ConfettiOnLoad({ disabled }) {
  useEffect(() => {
    if (disabled) return;
    const durationMs = 950;
    const end = Date.now() + durationMs;
    const colors = ACCENTS.map((a) => a.hex);
    const tick = () => {
      confetti({
        particleCount: 24,
        spread: 80,
        startVelocity: 46,
        origin: { x: Math.random(), y: 0.15 + Math.random() * 0.25 },
        colors
      });
      if (Date.now() < end) requestAnimationFrame(tick);
    };
    tick();
  }, [disabled]);
  return null;
}

function Hero() {
  const reduced = usePrefersReducedMotion();
  const [bgY, setBgY] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const onScroll = () => setBgY(window.scrollY * 0.18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduced]);

  return (
    <header className="relative isolate min-h-screen overflow-hidden bg-cosmic-pattern">
      <ConfettiOnLoad disabled={reduced} />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-80"
        style={{
          transform: `translate3d(0, ${-bgY}px, 0)`
        }}
      >
        <div className="absolute inset-0 bg-mesh-dots opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,58,242,0.20),transparent_44%),radial-gradient(circle_at_80%_30%,rgba(0,245,212,0.18),transparent_46%),radial-gradient(circle_at_55%_78%,rgba(255,230,0,0.14),transparent_48%)]" />
      </div>

      <FloatingDecorations seed={1} density={10} />
      <BalloonCandles seed={1} />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-5 py-24 text-center sm:px-7">
        <div className="inline-flex items-center gap-3 rounded-full border-4 border-accent-yellow bg-[#0d0d1a]/60 px-4 py-2 backdrop-blur hard-shadow-yellow">
          <span className="text-xs font-bold uppercase tracking-[0.26em] text-accent-yellow">From your family, with love</span>
          <span aria-hidden="true" className="text-accent-yellow motion-safe:animate-pulse-glow">
            ✨
          </span>
        </div>

        <h1 className="mt-8 font-heading text-7xl font-black uppercase leading-[0.86] sm:text-8xl lg:text-9xl">
          <span className="gradient-text text-shadow-hero">Happy Birthday</span>{" "}
          <span className="text-white text-shadow-hero">Mom!</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg font-medium text-white/90 sm:text-xl">
          Happy Birthday, Mom. We love you so much.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#gallery"
            className="group inline-flex items-center gap-3 border-4 border-accent-cyan bg-[#0d0d1a]/70 px-6 py-4 font-heading text-base font-extrabold uppercase tracking-widest text-white hard-shadow-cyan transition-transform duration-150 hover:-translate-y-1 focus:outline-none focus-visible:ring-4 focus-visible:ring-accent-cyan"
          >
            See our memories
            <span aria-hidden="true" className="text-accent-cyan transition-transform duration-150 group-hover:translate-x-1">
              →
            </span>
          </a>
          <a
            href="#message"
            className="inline-flex items-center gap-3 border-4 border-accent-magenta bg-[#0d0d1a]/70 px-6 py-4 font-heading text-base font-extrabold uppercase tracking-widest text-white hard-shadow-magenta transition-transform duration-150 hover:-translate-y-1 focus:outline-none focus-visible:ring-4 focus-visible:ring-accent-magenta"
          >
            Read our message ♥
          </a>
        </div>

        <MusicPlayer />

        <div className="mt-14 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { k: "Blessings for Mom", v: "Endless" },
            { k: "Family Love", v: "∞" },
            { k: "Smiles Today", v: "MAX" }
          ].map((it, i) => {
            const a = ACCENTS[i % ACCENTS.length];
            return (
              <div
                key={it.k}
                className={cx(
                  "relative border-4 bg-[#0d0d1a]/65 p-5 text-left backdrop-blur transition-transform duration-150",
                  a.border,
                  a.shadow,
                  i === 0 ? "rotate-1" : i === 1 ? "-rotate-1" : "rotate-1"
                )}
              >
                <div className="text-xs font-bold uppercase tracking-[0.26em]" style={{ color: a.hex }}>
                  {it.k}
                </div>
                <div className="mt-2 font-heading text-2xl font-black text-white text-shadow-triple">{it.v}</div>
              </div>
            );
          })}
        </div>

        <div className="mt-14 text-7xl motion-safe:animate-bounce-subtle" aria-hidden="true">
          🎂🕯️🎈
        </div>
      </div>
    </header>
  );
}

function Gallery() {
  const reduced = usePrefersReducedMotion();
  const scrollerRef = useRef(null);
  const [lightbox, setLightbox] = useState(null);

  const photos = useMemo(
    () => [
      { src: "/1.jpeg", alt: "Mom photo 1", caption: "Memory 01 ✨" },
      { src: "/2.jpeg", alt: "Mom photo 2", caption: "Memory 02 💛" },
      { src: "/3.jpeg", alt: "Mom photo 3", caption: "Memory 03 ✦" },
      { src: "/4.jpeg", alt: "Mom photo 4", caption: "Memory 04 ♥" },
      { src: "/5.jpeg", alt: "Mom photo 5", caption: "Memory 05 🎈" },
      { src: "/6.jpeg", alt: "Mom photo 6", caption: "Memory 06 🎂" },
      { src: "/7.jpeg", alt: "Mom photo 7", caption: "Memory 07 ✨" },
      { src: "/8.jpeg", alt: "Mom photo 8", caption: "Memory 08 💛" },
      { src: "/9.jpeg", alt: "Mom photo 9", caption: "Memory 09 ✦" },
      { src: "/old1.jpeg", alt: "Old family photo from Lebanon 1", caption: "Lebanon memory 01 🇱🇧" },
      { src: "/old2.jpeg", alt: "Old family photo from Lebanon 2", caption: "Lebanon memory 02 🇱🇧" },
      { src: "/old3.jpeg", alt: "Old family photo from Lebanon 3", caption: "Lebanon memory 03 🇱🇧" },
      { src: "/old4.jpeg", alt: "Old family photo from Lebanon 4", caption: "Lebanon memory 04 🇱🇧" }
    ],
    []
  );

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || reduced) return;

    let raf = 0;
    let last = performance.now();
    const speed = 0.24;

    const step = (now) => {
      const dt = now - last;
      last = now;
      el.scrollLeft += speed * dt;
      const loopPoint = el.scrollWidth / 2;
      if (el.scrollLeft >= loopPoint) {
        el.scrollLeft -= loopPoint;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  return (
    <SectionShell id="gallery" label="Photos" title="Mom & Memory" seed={3}>
      <div className="relative">
        <div className="mb-5">
          <p className="max-w-2xl text-lg text-white/90">Memory photos moving right to left. Click photo to zoom.</p>
        </div>

        <div
          ref={scrollerRef}
          className="group flex gap-6 overflow-x-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {photos.concat(photos).map((p, idx) => (
            <GalleryCard key={`${p.src}-${idx}`} photo={p} index={idx} onOpen={() => setLightbox(p)} />
          ))}
        </div>
      </div>

      {lightbox ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo preview"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-5 backdrop-blur"
          onClick={() => setLightbox(null)}
        >
          <div
            className="w-full max-w-4xl border-4 border-accent-cyan bg-[#0d0d1a] p-4 hard-shadow-cyan"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-bold uppercase tracking-[0.26em] text-accent-cyan">Zoom view</div>
              <button
                type="button"
                onClick={() => setLightbox(null)}
                className="border-4 border-accent-magenta bg-[#0d0d1a] px-3 py-2 font-heading text-sm font-black uppercase tracking-widest text-white hard-shadow-magenta focus:outline-none focus-visible:ring-4 focus-visible:ring-accent-magenta"
              >
                Close
              </button>
            </div>
            <img src={lightbox.src} alt={lightbox.alt} className="mt-4 max-h-[70vh] w-full object-cover" />
            <div className="mt-3 text-lg text-white/90">{lightbox.caption}</div>
          </div>
        </div>
      ) : null}
    </SectionShell>
  );
}

function GalleryCard({ photo, index, onOpen }) {
  const accent = ACCENTS[index % ACCENTS.length];
  const rotate = index % 3 === 0 ? "rotate-1" : index % 3 === 1 ? "-rotate-1" : "rotate-2";
  const from = index % 2 === 0 ? "translate-x-8" : "-translate-x-8";
  const [ref, inView] = useInView({ threshold: 0.2, rootMargin: "0px 0px -10% 0px" });

  return (
    <figure
      ref={ref}
      className={cx(
        "min-w-[260px] max-w-[260px] sm:min-w-[320px] sm:max-w-[320px]",
        "transition-all duration-500",
        inView ? "opacity-100 translate-x-0 translate-y-0" : cx("opacity-0", from, "translate-y-4")
      )}
    >
      <button
        type="button"
        onClick={onOpen}
        className={cx(
          "group relative w-full border-4 bg-[#0d0d1a]/55 p-3 text-left backdrop-blur transition-transform duration-150 hover:-translate-y-1 focus:outline-none focus-visible:ring-4",
          accent.border,
          accent.shadow,
          rotate
        )}
        style={{ ["--tw-ring-color"]: accent.hex }}
      >
        <img src={photo.src} alt={photo.alt} className="h-[210px] w-full object-cover sm:h-[240px]" />
        <figcaption className="mt-3 text-sm font-bold uppercase tracking-[0.26em]" style={{ color: accent.hex }}>
          {photo.caption}
        </figcaption>
      </button>
    </figure>
  );
}

function Reasons() {
  const reasons = useMemo(
    () => [
      { emoji: "🌟", text: "Your laugh fills every room." },
      { emoji: "🫶", text: "You love our family in a way that feels like home." },
      { emoji: "🍲", text: "You make ordinary days taste like comfort." },
      { emoji: "🧠", text: "Your wisdom always finds the gentle truth." },
      { emoji: "🌈", text: "You turn storms into stories we can smile about." },
      { emoji: "💪", text: "Your strength is soft, steady, and unstoppable." },
      { emoji: "🎉", text: "You celebrate each of us like we matter — because we do." },
      { emoji: "💖", text: "You are the heart of this family." }
    ],
    []
  );

  return (
    <SectionShell id="reasons" label="Reasons" title="Why we love you" seed={5}>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {reasons.map((r, i) => (
          <ReasonCard key={r.text} index={i} emoji={r.emoji} text={r.text} />
        ))}
      </div>
    </SectionShell>
  );
}

function ReasonCard({ index, emoji, text }) {
  const a = ACCENTS[index % ACCENTS.length];
  const rotate = index % 2 === 0 ? "rotate-1" : "-rotate-1";
  const [ref, inView] = useInView({ threshold: 0.18, rootMargin: "0px 0px -12% 0px" });

  return (
    <article
      ref={ref}
      className={cx(
        "border-4 bg-[#0d0d1a]/60 p-6 backdrop-blur transition-all duration-500",
        a.border,
        a.shadow,
        rotate,
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.26em]" style={{ color: a.hex }}>
            {String(index + 1).padStart(2, "0")}.
          </div>
          <h3 className="mt-2 font-heading text-2xl font-black uppercase text-white text-shadow-triple">
            Reason {String(index + 1).padStart(2, "0")}
          </h3>
        </div>
        <div aria-hidden="true" className="text-4xl motion-safe:animate-pulse-glow">
          {emoji}
        </div>
      </div>
      <p className="mt-4 text-lg text-white/90">{text}</p>
    </article>
  );
}

function Timeline() {
  const events = useMemo(
    () => [
      { year: "2016", title: "Family time", text: "A day we all remember.", img: "/1.jpeg" },
      { year: "2018", title: "Good memories", text: "Smiles and moments together.", img: "/2.jpeg" },
      { year: "2020", title: "Happy days", text: "Simple and beautiful.", img: "/3.jpeg" },
      { year: "2021", title: "Special day", text: "A photo full of love.", img: "/7.jpeg" },
      { year: "2022", title: "Together", text: "Beautiful family memory.", img: "/8.jpeg" },
      { year: "2023", title: "Old memory", text: "Lebanon memory 🇱🇧", img: "/old1.jpeg" },
      { year: "2024", title: "Old memory", text: "Lebanon memory 🇱🇧", img: "/old2.jpeg" },
      { year: "Today", title: "Happy Birthday Mom", text: "We love you.", img: "/4.jpeg" }
    ],
    []
  );

  return (
    <SectionShell id="timeline" label="Timeline" title="Memory" seed={7}>
      <div className="relative">
        <div aria-hidden="true" className="absolute left-4 top-0 h-full w-[4px] bg-accent-cyan opacity-80 sm:left-1/2 sm:-translate-x-1/2" />
        <div className="space-y-10">
          {events.map((e, i) => (
            <TimelineNode key={e.year} index={i} event={e} />
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

function TimelineNode({ event, index }) {
  const a = ACCENTS[index % ACCENTS.length];
  const [ref, inView] = useInView({ threshold: 0.2, rootMargin: "0px 0px -12% 0px" });

  const isLeft = index % 2 === 0;
  const cardSide = isLeft ? "sm:items-end sm:text-right" : "sm:items-start sm:text-left";

  return (
    <div ref={ref} className="relative grid w-full grid-cols-1 sm:grid-cols-[1fr_56px_1fr] sm:items-start">
      <div className={cx("hidden sm:block", isLeft ? "sm:col-start-1" : "sm:col-start-3")} />

      <div
        className={cx(
          "relative w-full max-w-xl border-4 bg-[#0d0d1a]/65 p-6 backdrop-blur transition-all duration-500",
          a.border,
          a.shadow,
          isLeft ? "sm:col-start-1 sm:mr-auto" : "sm:col-start-3 sm:ml-auto",
          inView ? "opacity-100 scale-100" : "opacity-0 scale-[0.92]"
        )}
      >
        <div className={cx("flex flex-col gap-4", cardSide)}>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center border-4 bg-[#0d0d1a] px-3 py-2 font-heading text-sm font-black uppercase tracking-widest text-white" style={{ borderColor: a.hex }}>
              {event.year}
            </span>
            <span aria-hidden="true" className="text-xl" style={{ color: a.hex }}>
              ✦
            </span>
          </div>
          <h3 className="font-heading text-2xl font-black uppercase text-white text-shadow-triple">{event.title}</h3>
          <p className="text-lg text-white/90">{event.text}</p>
          <img src={event.img} alt={`${event.year} memory`} className="h-52 w-full bg-[#0d0d1a] object-contain p-2 sm:h-48" />
        </div>
      </div>

      <div
        aria-hidden="true"
        className={cx(
          "absolute left-0 top-8 h-6 w-6 -translate-x-[10px] rounded-full border-4 bg-cosmic sm:left-auto sm:right-auto sm:top-8 sm:col-start-2 sm:mx-auto sm:translate-x-0",
          a.border,
          "shadow-[0_0_26px_rgba(0,245,212,0.25)]"
        )}
      />
    </div>
  );
}

function Message() {
  const [ref, inView] = useInView({ threshold: 0.2, rootMargin: "0px 0px -12% 0px" });
  return (
    <section id="message" className="relative isolate overflow-hidden bg-cosmic-pattern py-20 sm:py-28">
      <FloatingDecorations seed={11} density={9} />
      <BalloonCandles seed={11} />
      <div className="absolute inset-0 bg-mesh-dots opacity-85 motion-safe:animate-pulse-glow" aria-hidden="true" />

      <div className="mx-auto w-full max-w-6xl px-5 sm:px-7">
        <div className="mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-[0.26em] text-accent-magenta">A note</span>
            <span className="h-[4px] w-14 bg-accent-yellow shadow-[0_0_22px_rgba(255,230,0,0.25)]" />
          </div>
          <h2 className="mt-4 font-heading text-5xl font-extrabold uppercase leading-[0.95] text-white sm:text-6xl text-shadow-triple">
            Birthday message
          </h2>
        </div>

        <div
          ref={ref}
          className={cx(
            "relative border-4 border-accent-yellow bg-[#0d0d1a]/60 p-8 backdrop-blur hard-shadow-yellow transition-all duration-500",
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <p className="font-heading text-3xl font-black uppercase leading-tight text-white text-shadow-hero sm:text-4xl">
            “Happy Birthday Mom.”
          </p>
          <p className="mt-6 text-lg text-white/90">
            We love you. Thank you for everything.
          </p>
          <p className="mt-5 text-lg text-white/90">
            Happy Birthday, Mom. ♥
          </p>

          <div aria-hidden="true" className="absolute -right-4 -top-5 text-6xl motion-safe:animate-float">
            💗
          </div>
        </div>
      </div>
    </section>
  );
}

function useCountUp({ startWhen, to, durationMs = 900 }) {
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!startWhen) return;
    if (reduced) {
      setValue(to);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const from = 0;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + (to - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [startWhen, to, durationMs, reduced]);
  return value;
}

function Stats() {
  const [ref, inView] = useInView({ threshold: 0.2, rootMargin: "0px 0px -12% 0px" });
  const years = useCountUp({ startWhen: inView, to: 60 });
  const moments = useCountUp({ startWhen: inView, to: 365 });

  const cards = [
    { label: "Years of Grace", value: years, suffix: "+" },
    { label: "Blessings for Mom", value: "∞", suffix: "" },
    { label: "Smiles This Year", value: moments, suffix: "+" }
  ];

  return (
    <SectionShell id="stats" label="Fun" title="Small stats" seed={13}>
      <div ref={ref} className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {cards.map((c, i) => {
          const a = ACCENTS[(i + 1) % ACCENTS.length];
          return (
            <div
              key={c.label}
              className={cx(
                "border-4 bg-[#0d0d1a]/65 p-6 backdrop-blur transition-all duration-500",
                a.border,
                a.shadow,
                i === 1 ? "-rotate-1" : "rotate-1",
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <div className="text-xs font-bold uppercase tracking-[0.26em]" style={{ color: a.hex }}>
                {c.label}
              </div>
              <div className="mt-3 font-heading text-4xl font-black text-white text-shadow-triple">
                {typeof c.value === "number" ? `${c.value}${c.suffix}` : c.value}
              </div>
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}

function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;
  return (
    <a
      href="#top"
      className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-3 border-4 border-accent-cyan bg-[#0d0d1a]/80 px-5 py-4 font-heading text-sm font-black uppercase tracking-widest text-white hard-shadow-cyan backdrop-blur transition-transform duration-150 hover:-translate-y-1 focus:outline-none focus-visible:ring-4 focus-visible:ring-accent-cyan"
      aria-label="Back to top"
    >
      ↑ Top
    </a>
  );
}

export default function App() {
  return (
    <div id="top" className="min-h-screen bg-cosmic font-body">
      <Hero />
      <main>
        <Gallery />
        <Reasons />
        <Timeline />
        <Message />
      </main>
      <footer className="relative bg-cosmic-pattern py-14">
        <FloatingDecorations seed={21} density={8} />
        <div className="mx-auto max-w-6xl px-5 text-center sm:px-7">
          <p className="text-lg text-white/90">
            Made with love.
          </p>
          <p className="mt-2 text-xs font-bold uppercase tracking-[0.26em] text-accent-yellow">
            Happy Birthday, Mom ♥
          </p>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.26em] text-white/80">
            Made with love by your son
          </p>
        </div>
      </footer>
      <BackToTop />
    </div>
  );
}

