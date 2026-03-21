import React from "react";

export default function SectionWrapper({
  tag,
  title,
  subtitle,
  children
}) {
  return (
    <section className="section-container">

      <div className="content-center">

        {/* SECTION TAG */}
        {tag && (
          <div
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--cyan)",
              letterSpacing: "3px",
              fontSize: "12px",
              marginBottom: "14px",
              textAlign: "center"
            }}
          >
            {tag}
          </div>
        )}

        {/* TITLE */}
        <h2 className="section-title">
          {title}
        </h2>

        {/* SUBTITLE */}
        {subtitle && (
          <p className="section-sub">
            {subtitle}
          </p>
        )}

        {/* CONTENT */}
        <div style={{marginTop:"60px"}}>
          {children}
        </div>

      </div>

    </section>
  );
}