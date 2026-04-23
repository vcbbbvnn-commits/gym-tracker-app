function SectionHeading({ eyebrow, title, subtitle }) {
  return (
    <div className="space-y-2">
      {eyebrow && (
        <span className="section-badge inline-flex">{eyebrow}</span>
      )}
      {title && (
        <h2
          className="text-2xl font-bold text-white"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="text-sm leading-relaxed text-gray-500">{subtitle}</p>
      )}
    </div>
  );
}

export default SectionHeading;
