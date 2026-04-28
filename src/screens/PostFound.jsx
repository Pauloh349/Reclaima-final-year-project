import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import UserBadge from "../components/UserBadge";
import { getUserDisplayName, useAuthUser } from "../hooks/useAuthUser";
import "../styles/ReportFound.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

async function submitFoundReport(payload) {
  const response = await fetch(`${API_BASE}/api/items/found`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Unable to submit report");
  }

  return response.json();
}

const ReportFound = () => {
  const navigate = useNavigate();
  const user = useAuthUser();
  const displayName = getUserDisplayName(user);
  const [handover, setHandover] = useState("security");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [zone, setZone] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [contactName, setContactName] = useState(displayName);
  const [contactEmail, setContactEmail] = useState(user?.email || "");
  const [contactPhone, setContactPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const categories = [
    "ID or Badge",
    "Phone",
    "Wallet",
    "Keys",
    "Laptop",
    "Other",
  ];

  const zones = [
    "Main Library",
    "Hostels",
    "Cafeteria",
    "Science Complex",
  ];

  const canSubmit = Boolean(
    title.trim() && category && zone && contactEmail.trim() && !loading,
  );

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Please add a title for the found item.");
      return;
    }

    if (!category) {
      setError("Please select a category.");
      return;
    }

    if (!zone) {
      setError("Please choose a campus zone.");
      return;
    }

    if (!contactEmail.trim()) {
      setError("Please provide a contact email.");
      return;
    }

    const payload = {
      title: title.trim(),
      category,
      description: description.trim(),
      location: location.trim(),
      zone,
      handoverMethod: handover,
      contactName: contactName.trim(),
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim(),
    };

    try {
      setLoading(true);
      await submitFoundReport(payload);
      setSuccess("Found report submitted successfully.");
      setTimeout(() => navigate("/matches"), 700);
    } catch {
      setError("Unable to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
            <UserBadge />
          </>
        }
      />

      <main className="found-shell">
        <section className="found-header">
          <span className="step-chip">Step 1 of 1</span>
          <h1>Report a found item</h1>
          <p>
            Share the key details and preferred handover so we can connect you
            with the owner quickly.
          </p>
        </section>

        <section className="progress-panel">
          <div className="progress-labels single-step">
            <span className="active">Details & Submit</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: "100%" }} />
          </div>
        </section>

        <section className="found-form">
          <div className="found-form-grid">
            <label>
              Item Title <span className="field-required">*</span>
              <input
                type="text"
                placeholder="e.g., Silver HP Laptop"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className={error && !title.trim() ? "is-invalid" : ""}
              />
            </label>

            <label>
              Category <span className="field-required">*</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className={error && !category ? "is-invalid" : ""}
              >
                <option value="">Select a category</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Campus Zone <span className="field-required">*</span>
              <select
                value={zone}
                onChange={(event) => setZone(event.target.value)}
                className={error && !zone ? "is-invalid" : ""}
              >
                <option value="">Select a zone</option>
                {zones.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Specific Location (optional)
              <input
                type="text"
                placeholder="e.g., Cafeteria entrance"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
              />
            </label>

            <label className="full">
              Description (optional)
              <textarea
                rows="3"
                placeholder="Color, brand, identifying marks"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </label>

            <label>
              Contact Name
              <input
                type="text"
                value={contactName}
                onChange={(event) => setContactName(event.target.value)}
              />
            </label>

            <label>
              Contact Email <span className="field-required">*</span>
              <input
                type="email"
                value={contactEmail}
                onChange={(event) => setContactEmail(event.target.value)}
                className={error && !contactEmail.trim() ? "is-invalid" : ""}
              />
            </label>

            <label>
              Contact Phone (optional)
              <input
                type="tel"
                value={contactPhone}
                onChange={(event) => setContactPhone(event.target.value)}
              />
            </label>
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
            className={`handover-card ${handover === "public" ? "active" : ""}`}
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

        {error && <p className="found-alert error">{error}</p>}
        {success && <p className="found-alert success">{success}</p>}
        {!canSubmit && !error && (
          <p className="found-alert hint">
            Complete the required fields to submit your report.
          </p>
        )}

        <section className="safety-note">
          <span className="material-icons">verified_user</span>
          <p>
            Safety tip: use public, well-lit handover points. If unsure, use
            the Security Office option.
          </p>
        </section>

        <div className="action-bar">
          <button className="btn-ghost" onClick={() => navigate(-1)}>
            Back
          </button>
          <div className="action-right">
            <button className="btn-ghost">Save Draft</button>
            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {loading ? "Submitting..." : "Submit Report"}
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
