function SectionHeading({ eyebrow, title, subtitle }) {
  return (
    <div className="space-y-2">
      <p className="font-display text-xs uppercase tracking-[0.35em] text-cyanGlow">{eyebrow}</p>
      <h2 className="font-display text-2xl text-sand">{title}</h2>
      {subtitle ? <p className="max-w-2xl text-sm text-slate-300">{subtitle}</p> : null}
    </div>
  );
}

export default SectionHeading;
