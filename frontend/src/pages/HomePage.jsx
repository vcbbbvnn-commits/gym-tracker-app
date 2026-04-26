import { Link } from "react-router-dom";

function GlowStat({ icon, title, value }) {
  return (
    <div className="flex min-w-[205px] items-center gap-3 rounded-2xl border border-orange-400/45 bg-black/35 px-5 py-4 shadow-[0_0_28px_rgba(251,107,29,0.18)] backdrop-blur-md">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-orange-300/25 bg-orange-500/15 text-xl">
        {icon}
      </div>
      <div>
        <p className="text-sm font-black text-white">{title}</p>
        <p className="text-sm text-orange-300">{value}</p>
      </div>
    </div>
  );
}

function HomePage() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#080c12]">
      <img
        src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=1800&q=90&fit=crop"
        alt="Bodybuilder lifting in a gym"
        className="absolute inset-0 h-full w-full object-cover object-center"
        style={{ filter: "brightness(0.62) contrast(1.16) saturate(0.72)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/62 to-black/8" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/35" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1500px] items-center px-7 pb-16 pt-32 md:px-12">
        <div className="max-w-3xl">
          <h1
            className="text-[64px] font-black uppercase leading-[0.96] tracking-normal text-white md:text-[96px]"
            style={{ fontFamily: "'Bebas Neue', sans-serif", textShadow: "0 8px 28px rgba(0,0,0,0.45)" }}
          >
            Your Fitness
            <br />
            <span className="bg-gradient-to-r from-orange-500 via-orange-300 to-yellow-400 bg-clip-text text-transparent">
              Journey
            </span>
            <br />
            Starts Here
          </h1>

          <div className="mt-12 flex flex-wrap gap-6">
            <GlowStat icon="🔥" title="Today's Burn" value="612 cal" />
            <GlowStat icon="🏆" title="New PR!" value="Deadlift 160kg" />
            <GlowStat icon="⚡" title="Workout Streak" value="17 Days" />
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-4">
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
