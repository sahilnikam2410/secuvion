import React from "react";

export default function RadarBackground() {

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        background:
          "radial-gradient(circle at center, rgba(0,255,200,0.08), transparent 70%)"
      }}
    />
  );

}