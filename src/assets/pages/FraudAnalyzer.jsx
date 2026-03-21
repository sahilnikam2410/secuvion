import React from "react";

const FraudAnalyzer = () => {
  return (
    <div
      style={{
        background: "#06080c",
        minHeight: "100vh",
        color: "#e8ede6",
        padding: "40px",
        fontFamily: "sans-serif"
      }}
    >
      <h1 style={{ color: "#00ffc8" }}>AI Fraud Analyzer</h1>

      <p>
        Enter a suspicious website, email, or phone number to check
        if it may be a scam or phishing attempt.
      </p>

      <input
        type="text"
        placeholder="Enter suspicious URL / email / phone"
        style={{
          padding: "12px",
          width: "400px",
          marginTop: "20px",
          background: "#0a0e14",
          border: "1px solid #00ffc8",
          color: "white",
          borderRadius: "6px"
        }}
      />

      <br />
      <br />

      <button
        style={{
          padding: "12px 24px",
          background: "#00ffc8",
          border: "none",
          cursor: "pointer",
          fontWeight: "bold",
          borderRadius: "6px"
        }}
      >
        Analyze Risk
      </button>
    </div>
  );
};

export default FraudAnalyzer;