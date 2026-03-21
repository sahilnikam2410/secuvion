import React from "react";

export default function Learn() {
  return (

    <section className="section-container">

      <div className="content-center">

        {/* SECTION LABEL */}

        <div
          style={{
            color: "var(--cyan)",
            letterSpacing: "3px",
            fontSize: "12px",
            marginBottom: "12px"
          }}
        >
          [11] TRAINING
        </div>


        {/* TITLE */}

        <h2 className="section-title">
          Knowledge Base
        </h2>


        {/* DESCRIPTION */}

        <p className="section-sub">
          Concise, jargon-free guides to upgrade your digital literacy.
        </p>


        {/* CARD GRID */}

        <div className="card-grid">

          <div className="card">
            <div style={{color:"var(--cyan)",fontSize:"12px",marginBottom:"10px"}}>
              ESSENTIAL
            </div>
            <h3>Phishing Detection</h3>
          </div>


          <div className="card">
            <div style={{color:"var(--cyan)",fontSize:"12px",marginBottom:"10px"}}>
              FUNDAMENTALS
            </div>
            <h3>How Scams Work</h3>
          </div>


          <div className="card">
            <div style={{color:"var(--cyan)",fontSize:"12px",marginBottom:"10px"}}>
              FINANCE
            </div>
            <h3>Bank Account Safety</h3>
          </div>


          <div className="card">
            <div style={{color:"var(--cyan)",fontSize:"12px",marginBottom:"10px"}}>
              EMERGENCY
            </div>
            <h3>Post-Breach Actions</h3>
          </div>


          <div className="card">
            <div style={{color:"var(--cyan)",fontSize:"12px",marginBottom:"10px"}}>
              PRIVACY
            </div>
            <h3>Social Media Privacy</h3>
          </div>


          <div className="card">
            <div style={{color:"var(--cyan)",fontSize:"12px",marginBottom:"10px"}}>
              FUNDAMENTALS
            </div>
            <h3>Password Mastery</h3>
          </div>

        </div>

      </div>

    </section>

  );
}