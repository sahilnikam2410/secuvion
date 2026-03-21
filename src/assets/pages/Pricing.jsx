import React from "react";

export default function Pricing() {
  return (
    <section className="section-container">

      <div className="content-center">

        {/* SECTION TAG */}

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
          [10] PLANS
        </div>


        {/* TITLE */}

        <h2 className="section-title">
          Choose Your Shield
        </h2>


        {/* SUBTITLE */}

        <p className="section-sub">
          World-class protection at prices built for real people.
        </p>


        {/* PRICING CARDS */}

        <div className="card-grid">

          {/* FREE */}

          <div className="card">
            <h3 style={{marginBottom:"10px"}}>Free</h3>
            <h2 style={{color:"var(--cyan)"}}>$0</h2>

            <ul style={{marginTop:"20px", lineHeight:"2"}}>
              <li>Basic fraud detection</li>
              <li>Security advisories</li>
              <li>Email breach check</li>
              <li>Community reports</li>
            </ul>

            <button className="cyber-btn" style={{marginTop:"30px"}}>
              GET STARTED
            </button>
          </div>


          {/* PRO */}

          <div className="card">
            <h3 style={{marginBottom:"10px"}}>Pro</h3>
            <h2 style={{color:"var(--cyan)"}}>$9 / mo</h2>

            <ul style={{marginTop:"20px", lineHeight:"2"}}>
              <li>Real-time monitoring</li>
              <li>Device protection</li>
              <li>Phishing alerts</li>
              <li>Priority response</li>
            </ul>

            <button className="cyber-btn" style={{marginTop:"30px"}}>
              ACTIVATE
            </button>
          </div>


          {/* ULTIMATE */}

          <div className="card">
            <h3 style={{marginBottom:"10px"}}>Ultimate</h3>
            <h2 style={{color:"var(--orange)"}}>$19 / mo</h2>

            <ul style={{marginTop:"20px", lineHeight:"2"}}>
              <li>Identity monitoring</li>
              <li>Dark web surveillance</li>
              <li>Family protection</li>
              <li>Dedicated analyst</li>
            </ul>

            <button className="cyber-btn" style={{marginTop:"30px"}}>
              ACTIVATE
            </button>
          </div>

        </div>

      </div>

    </section>
  );
}