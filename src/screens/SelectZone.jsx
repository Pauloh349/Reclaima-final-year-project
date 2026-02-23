import React from "react";
import NavBar from "../components/NavBar";
import "../styles/selectZone.css";

const SelectZone = () => {
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

  return (
    <div className="select-zone-page">
      <NavBar
        icon="search"
        links={[
          { label: "Dashboard", to: "/home" },
          { label: "My Items", to: "/matches" },
        ]}
        rightContent={
          <div className="avatar">
            <span className="material-icons">person</span>
          </div>
        }
      />

      <main className="zone-shell">
        <header className="zone-header">
          <span className="step-pill">Step 2 of 4</span>
          <h1>Where did you lose it?</h1>
          <p>
            Choose the campus zone where the item was last seen. This helps us
            prioritize better matches.
          </p>
        </header>

        <section className="zone-layout">
          <aside className="zone-panel">
            <div className="panel-head">
              <h2>Select Zone</h2>
              <small>4 available</small>
            </div>
            <input
              type="text"
              placeholder="Search for a specific building..."
              className="search-input"
            />

            <div className="zone-list">
              {zones.map((zone) => (
                <button
                  key={zone.name}
                  className={`zone-card ${zone.active ? "active" : ""}`}
                >
                  <div className="zone-icon">
                    <span className="material-icons">{zone.icon}</span>
                  </div>
                  <div>
                    <h3>{zone.name}</h3>
                    <p>{zone.note}</p>
                  </div>
                </button>
              ))}
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

        <div className="zone-actions">
          <button className="back-btn">
            <span className="material-icons">arrow_back</span>
            Back
          </button>

          <div className="action-right">
            <button className="secondary-btn">Save Draft</button>
            <button className="continue-btn">
              Continue
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
