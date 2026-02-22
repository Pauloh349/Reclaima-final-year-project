import React, { useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import "../styles/ReportFound.css";

const ReportFound = () => {
  const [handover, setHandover] = useState("security");

  return (
    <div className="report-found-page">
      <NavBar
        icon="recycling"
        links={[
          { label: "Dashboard", to: "/home" },
          { label: "Report Lost", to: "/lost" },
          { label: "Report Found", to: "/found", active: true },
        ]}
        rightContent={
          <>
            <Link to="/home" className="cancel-btn">
              Cancel
            </Link>
            <div className="avatar" />
          </>
        }
      />

      <main className="found-shell">
        <section className="found-header">
          <span className="step-chip">Step 2 of 3</span>
          <h1>How would you like to return this item?</h1>
          <p>
            Choose a safe handover approach and provide a short description to
            help the owner confirm the match.
          </p>
        </section>

        <section className="progress-panel">
          <div className="progress-labels">
            <span>Item Details</span>
            <span className="active">Handover Method</span>
            <span>Review and Post</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" />
          </div>
        </section>

        <section className="handover-grid">
          <button
            className={`handover-card ${
              handover === "security" ? "active" : ""
            }`}
            onClick={() => setHandover("security")}
          >
            <div className="handover-icon">
              <span className="material-icons">policy</span>
            </div>
            <h3>Security Office</h3>
            <p>
              Leave the item at a campus security desk and we will notify the
              owner securely.
            </p>
          </button>

          <button
            className={`handover-card ${
              handover === "public" ? "active" : ""
            }`}
            onClick={() => setHandover("public")}
          >
            <div className="handover-icon">
              <span className="material-icons">groups</span>
            </div>
            <h3>Meet in Public</h3>
            <p>
              Coordinate handover in a high-traffic campus area such as the
              library or student union.
            </p>
          </button>
        </section>

        <section className="form-section">
          <label>Additional Description</label>
          <textarea
            placeholder="Example: Found near the library coffee station around 10:00 AM."
            rows="4"
          />
          <small>
            Include distinctive details, but avoid sensitive personal
            information.
          </small>
        </section>

        <section className="form-section">
          <label>
            Add a Photo <span>(Optional)</span>
          </label>
          <div className="upload-box">
            <span className="material-icons upload-icon">add_a_photo</span>
            <p>Upload a clear photo</p>
            <small>PNG, JPG up to 10MB</small>
          </div>
        </section>

        <section className="safety-note">
          <span className="material-icons">verified_user</span>
          <p>
            Safety tip: use public, well-lit handover points. If unsure, use
            the Security Office option.
          </p>
        </section>

        <div className="action-bar">
          <button className="btn-ghost">Back</button>
          <div className="action-right">
            <button className="btn-ghost">Save Draft</button>
            <button className="btn-primary">
              Submit Report
              <span className="material-icons">arrow_forward</span>
            </button>
          </div>
        </div>
      </main>

      <footer className="found-footer">© 2026 Reclaima University Platform</footer>
    </div>
  );
};

export default ReportFound;
