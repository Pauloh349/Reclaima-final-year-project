import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import UserBadge from "../components/UserBadge";
import { getUserDisplayName, useAuthUser } from "../hooks/useAuthUser";
import "../styles/selectZone.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const DRAFT_KEY = "lostReportDraft";

async function submitLostReport(payload) {
  const response = await fetch(`${API_BASE}/api/items/lost`, {
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

const SelectZone = () => {
  const navigate = useNavigate();
  const user = useAuthUser();
  const displayName = getUserDisplayName(user);
  const zones = [
    {
      icon: "menu_book",
      name: "Main Library",
      note: "Reading rooms and study pods",
      active: true,
    },
    {
      icon: "apartment",
      name: "Hostels",
      note: "Residential blocks A to F",
    },
    {
      icon: "restaurant",
      name: "Cafeteria",
      note: "Main food court and cafe spaces",
    },
    {
      icon: "science",
      name: "Science Complex",
      note: "Labs, lecture halls, and corridors",
    },
  ];

  const [selectedZone, setSelectedZone] = useState("");
  const [zoneQuery, setZoneQuery] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [contactName, setContactName] = useState(displayName);
  const [contactEmail, setContactEmail] = useState(user?.email || "");
  const [contactPhone, setContactPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const draft = useMemo(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!contactName && draft?.contactName) {
      setContactName(draft.contactName);
    }
    if (!contactEmail && draft?.contactEmail) {
      setContactEmail(draft.contactEmail);
    }
  }, [draft, contactName, contactEmail]);

  const filteredZones = zones.filter((zone) =>
    zone.name.toLowerCase().includes(zoneQuery.trim().toLowerCase()),
  );

  const canSubmit = Boolean(
    draft?.category &&
      title.trim() &&
      selectedZone &&
      contactEmail.trim() &&
      !loading,
  );

  const persistDraft = () => {
    const payload = {
      category: draft?.category,
      contactName: contactName.trim(),
      contactEmail: contactEmail.trim(),
    };
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
    setSuccess("Draft updated.");
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!draft?.category) {
      setError("Please select a category first.");
      return;
    }

    if (!title.trim()) {
      setError("Please add a title for the lost item.");
      return;
    }

    if (!selectedZone) {
      setError("Please choose a campus zone.");
      return;
    }

    if (!contactEmail.trim()) {
      setError("Please provide a contact email.");
      return;
    }

    const payload = {
      title: title.trim(),
      category: draft.category,
      description: description.trim(),
      location: location.trim(),
      zone: selectedZone,
      contactName: contactName.trim(),
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim(),
    };

    try {
      setLoading(true);
      await submitLostReport(payload);
      sessionStorage.removeItem(DRAFT_KEY);
      setSuccess("Report submitted successfully.");
      setTimeout(() => navigate("/matches"), 700);
    } catch {
      setError("Unable to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="select-zone-page">
      <NavBar
        icon="search"
        links={[
          { label: "Dashboard", to: "/home" },
          { label: "My Items", to: "/matches" },
        ]}
        rightContent={<UserBadge />}
      />

      <main className="zone-shell">
        <header className="zone-header">
          <span className="step-pill">Step 2 of 2</span>
          <h1>Where did you lose it?</h1>
          <p>
            Choose the campus zone where the item was last seen. This helps us
            prioritize better matches.
          </p>
        </header>

        <section className="progress-panel">
          <div className="progress-labels two-step">
            <span>Category</span>
            <span className="active">Details & Submit</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: "100%" }} />
          </div>
        </section>

        <section className="zone-layout">
          <aside className="zone-panel">
            <div className="panel-head">
              <h2>Select Zone</h2>
              <small>{filteredZones.length} available</small>
            </div>
            <input
              type="text"
              placeholder="Search for a specific building..."
              className="search-input"
              value={zoneQuery}
              onChange={(event) => setZoneQuery(event.target.value)}
            />

            <div className="zone-list">
              {filteredZones.length === 0 ? (
                <div className="zone-empty">No zones match that search.</div>
              ) : (
                filteredZones.map((zone) => (
                  <button
                    key={zone.name}
                    className={`zone-card ${
                      selectedZone === zone.name ? "active" : ""
                    }`}
                    onClick={() => setSelectedZone(zone.name)}
                  >
                    <div className="zone-icon">
                      <span className="material-icons">{zone.icon}</span>
                    </div>
                    <div>
                      <h3>{zone.name}</h3>
                      <p>{zone.note}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </aside>

          <section className="map-panel">
            <div className="map-head">
              <h2>Campus Map</h2>
              <span>Egerton Main Campus + Nearby Landmarks</span>
            </div>
            <div className="map-body">
              <div className="map-canvas">
                <iframe
                  title="Egerton University Main Campus and Surroundings"
                  src="https://www.google.com/maps?q=Egerton+University+Main+Campus+Njoro&z=13&output=embed"
                  className="campus-map-frame"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="map-overlay">
                  <span className="map-focus-tag">Egerton Main Campus</span>
                  <div className="surrounding-chips">
                    <span>Njoro Town</span>
                    <span>Nakuru City</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="map-meta">
              <span className="material-icons">info</span>
              <div>
                <p>
                  Focused on Egerton University Main Campus with surrounding
                  coverage for likely movement zones.
                </p>
                <div className="map-links">
                  <a
                    href="https://www.google.com/maps/dir/?api=1&destination=Egerton+University+Main+Campus+Njoro"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Get Directions
                  </a>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Egerton+University+Main+Campus+Njoro"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open Full Map
                  </a>
                </div>
              </div>
            </div>
          </section>
        </section>

        <section className="zone-form">
          <header>
            <h2>Lost Item Details</h2>
            <p>
              Category: <strong>{draft?.category || "Select a category"}</strong>
            </p>
          </header>

          <div className="zone-form-grid">
            <label>
              Item Title <span className="field-required">*</span>
              <input
                type="text"
                placeholder="e.g., Black Lenovo Laptop"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className={error && !title.trim() ? "is-invalid" : ""}
              />
            </label>

            <label>
              Specific Location (optional)
              <input
                type="text"
                placeholder="e.g., Library front desk"
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

          {error && <p className="zone-alert error">{error}</p>}
          {success && <p className="zone-alert success">{success}</p>}
          {!canSubmit && !error && (
            <p className="zone-alert hint">
              Complete the required fields to submit your report.
            </p>
          )}
        </section>

        <div className="zone-actions">
          <button className="back-btn" onClick={() => navigate("/lost")}>
            <span className="material-icons">arrow_back</span>
            Back
          </button>

          <div className="action-right">
            <button className="secondary-btn" onClick={persistDraft}>
              Save Draft
            </button>
            <button
              className="continue-btn"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {loading ? "Submitting..." : "Submit Report"}
              <span className="material-icons">arrow_forward</span>
            </button>
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>© 2026 Reclaima • University Campus Lost & Found System</p>
      </footer>
    </div>
  );
};

export default SelectZone;
