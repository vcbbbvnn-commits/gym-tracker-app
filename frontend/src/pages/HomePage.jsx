import { Link } from "react-router-dom";

function GlowStat({ icon, title, value }) {
  return (
    <div
      className="flex min-w-[205px] items-center gap-3 rounded-2xl px-5 py-4 backdrop-blur-md"
      style={{
        background: "rgba(13,10,26,0.75)",
        border: "1px solid rgba(124,58,237,0.35)",
        boxShadow: "0 0 28px rgba(124,58,237,0.18)",
      }}
    >
      <div
        className="flex h-11 w-11 items-center justify-center rounded-xl text-xl"
        style={{ background: "rgba(124,58,237,0.18)", border: "1px solid rgba(168,85,247,0.28)" }}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-black text-white">{title}</p>
        <p className="text-sm font-semibold" style={{ color: "#c084fc" }}>{value}</p>
      </div>
    </div>
  );
}

function HomePage() {
  return (
    <section className="relative min-h-screen overflow-hidden" style={{ background: "#0d0a1a" }}>
      {/* Hero image */}
      <img
        src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=1800&q=90&fit=crop"
        alt="Bodybuilder lifting in a gym"
        className="absolute inset-0 h-full w-full object-cover object-center"
        style={{ filter: "brightness(0.45) contrast(1.1) saturate(0.55)" }}
      />

      {/* Purple-pink overlay */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(135deg, rgba(13,10,26,0.92) 0%, rgba(124,58,237,0.18) 50%, rgba(13,10,26,0.85) 100%)"
      }} />
      <div className="absolute inset-0" style={{
        background: "linear-gradient(to top, rgba(13,10,26,0.95) 0%, transparent 50%, rgba(13,10,26,0.4) 100%)"
      }} />

      {/* Ambient orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-5%] top-[15%] h-[380px] w-[380px] rounded-full blur-[130px]"
          style={{ background: "rgba(124,58,237,0.22)" }} />
        <div className="absolute right-[5%] top-[20%] h-[280px] w-[280px] rounded-full blur-[110px]"
          style={{ background: "rgba(236,72,153,0.16)" }} />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1500px] items-center px-7 pb-16 pt-32 md:px-12">
        <div className="max-w-3xl">
          {/* Eyebrow badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2"
            style={{ background: "rgba(124,58,237,0.18)", border: "1px solid rgba(168,85,247,0.35)" }}>
            <span className="h-2 w-2 animate-pulse rounded-full" style={{ background: "#a855f7" }} />
            <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "#c084fc" }}>
              Your Performance Hub
            </span>
          </div>

          <h1
            className="text-[64px] font-black uppercase leading-[0.96] tracking-normal text-white md:text-[96px]"
            style={{ fontFamily: "'Bebas Neue', sans-serif", textShadow: "0 8px 28px rgba(0,0,0,0.55)" }}
          >
            Your Fitness
            <br />
            <span style={{
              background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Journey
            </span>
            <br />
            Starts Here
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7" style={{ color: "rgba(255,255,255,0.55)" }}>
            Track every set, beat every PR, and follow elite training splits — all in one place.
          </p>

          <div className="mt-10 flex flex-wrap gap-5">
            <GlowStat icon="🔥" title="Today's Burn" value="612 cal" />
            <GlowStat icon="🏆" title="New PR!" value="Deadlift 160kg" />
            <GlowStat icon="⚡" title="Workout Streak" value="17 Days" />
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link to="/sessions" className="btn-fire min-w-[235px] justify-center py-4 text-base">
              ▶ Start Training
            </Link>
            <Link to="/templates" className="btn-ghost min-w-[265px] justify-center py-4 text-base">
              Browse Templates →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomePage;
