import React from "react";

export default function SecurityScore() {
  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: "120px",
      }}
    >
      {/* SECTION TITLE */}

      <div style={{ textAlign: "center", maxWidth: "700px" }}>
        <div
          style={{
            color: "#00ffd0",
            letterSpacing: "3px",
            fontSize: "12px",
            marginBottom: "12px",
          }}
        >
          [05] ASSESSMENT
        </div>

        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "56px",
            marginBottom: "10px",
          }}
        >
          Cyber Safety Score
        </h2>

        <p
          style={{
            color: "#8a9aa9",
            fontSize: "16px",
          }}
        >
          Quick assessment of your current security posture.
        </p>
      </div>

      {/* DIAGNOSTIC CARD */}

      <div
        style={{
          marginTop: "70px",
          width: "720px",
          maxWidth: "90%",
          background: "rgba(10,14,20,0.85)",
          border: "1px solid rgba(0,255,200,0.25)",
          padding: "50px",
        }}
      >
        {/* Question 1 */}

        <div style={{ marginBottom: "30px" }}>
          Unique passwords per account?
        </div>

        {/* Question 2 */}

        <div style={{ marginBottom: "30px" }}>
          Two-factor authentication enabled?
        </div>

        {/* Question 3 */}

        <div style={{ marginBottom: "30px" }}>
          Devices and apps updated regularly?
        </div>

        {/* Question 4 */}

        <div style={{ marginBottom: "40px" }}>
          Can you spot phishing attempts?
        </div>

        {/* Button */}

        <button
          style={{
            background: "#00ffd0",
            border: "none",
            padding: "14px 34px",
            fontFamily: "'IBM Plex Mono', monospace",
            letterSpacing: "3px",
            fontSize: "12px",
            cursor: "pointer",
          }}
        >
          RUN DIAGNOSTIC
        </button>
      </div>
    </section>
  );
}