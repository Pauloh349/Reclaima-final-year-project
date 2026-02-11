import React, { useState } from "react";
import "../styles/ReportFound.css";

const ReportFound = () => {
  const [handover, setHandover] = useState("security");

  return (
    <div className="report-found-page">
      {/* Navigation */}
      <nav className="nav">
        <div className="container nav-inner">
          <div className="logo">
            <div className="logo-icon">
              <span className="material-icons">recycling</span>
            </div>
            <span className="logo-text">Reclaima</span>
          </div>

          <div className="nav-right">
            <button className="cancel-btn">Cancel</button>
            <div className="avatar" />
          </div>
        </div>
      </nav>

      <main className="container main">
        {/* Progress */}
        <div className="progress-section">
          <div className="progress-labels">
            <span>Item Details</span>
            <span className="active">Handover Method</span>
            <span>Review & Post</span>
          </div>

          <div className="progress-bar">
            <div className="progress-fill" />
          </div>
        </div>

        {/* Header */}
        <div className="header-section">
          <h1>How would you like to return this item?</h1>
          <p>
            Help the owner get their item back safely. Choose a method that
            works best for you.
          </p>
        </div>

        {/* Handover Options */}
        <div className="handover-grid">
          <div
            className={`handover-card ${
              handover === "security" ? "active" : ""
            }`}
            onClick={() => setHandover("security")}
          >
            <div className="card-icon">
              <span className="material-icons">policy</span>
            </div>
            <h3>Security Office</h3>
            <p>
              Drop it off at the nearest campus security desk. We'll handle the
              notification and handover for you.
            </p>
          </div>

          <div
            className={`handover-card ${
              handover === "public" ? "active" : ""
            }`}
            onClick={() => setHandover("public")}
          >
            <div className="card-icon">
              <span className="material-icons">groups</span>
            </div>
            <h3>Meet in Public</h3>
            <p>
              Coordinate a time to meet the owner in a busy campus location
              like the Library or Student Union.
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="form-section">
          <label>Additional Description</label>
          <textarea
            placeholder="E.g. Found on the second floor of the library near the coffee machine..."
            rows="4"
          />
          <small>
            Mention unique markings, but avoid sharing sensitive personal data.
          </small>
        </div>

        {/* Photo Upload */}
        <div className="form-section">
          <label>
            Add a Photo <span>(Optional)</span>
          </label>
          <div className="upload-box">
            <span className="material-icons upload-icon">
              add_a_photo
            </span>
            <p>Click to upload or drag and drop</p>
            <small>PNG, JPG up to 10MB</small>
          </div>
        </div>

        {/* Safety Banner */}
        <div className="safety-banner">
          <span className="material-icons">verified_user</span>
          <div>
            <h4>Your safety is our priority</h4>
            <p>
              Always meet in well-lit, high-traffic campus areas. If you feel
              uncomfortable, use the Security Office drop-off method instead.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="action-buttons">
          <button className="back-btn">Back</button>
          <button className="submit-btn">
            Submit Report
            <span className="material-icons">arrow_forward</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <div className="footer-badge">
        <div className="pulse-dot" />
        <span>Community Powered Platform</span>
      </div>
    </div>
  );
};

export default ReportFound;
