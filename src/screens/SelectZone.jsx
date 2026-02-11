import React from "react";
import "../styles/selectZone.css";

const SelectZone = () => {
  return (
    <div className="select-zone-page">
      {/* Header */}
      <header className="header">
        <div className="container header-inner">
          <div className="logo">
            <div className="logo-icon">
              <span className="material-icons">search</span>
            </div>
            <span className="logo-text">Reclaima</span>
          </div>

          <div className="nav-links">
            <a href="#">Dashboard</a>
            <a href="#">My Items</a>
            <div className="avatar">
              <span className="material-icons">person</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container main-content">
        <div className="page-title">
          <h1>Where did you lose it?</h1>
          <p>Select the general campus area where the item was last seen.</p>
        </div>

        <div className="layout">
          {/* Left Column */}
          <div className="zone-list">
            <input
              type="text"
              placeholder="Search for a specific building..."
              className="search-input"
            />

            <button className="zone-card active">
              <div className="zone-icon">
                <span className="material-icons">menu_book</span>
              </div>
              <div>
                <h3>Main Library</h3>
                <p>Includes reading rooms and study pods</p>
              </div>
            </button>

            <button className="zone-card">
              <div className="zone-icon">
                <span className="material-icons">hotel</span>
              </div>
              <div>
                <h3>Hostels</h3>
                <p>Student residential blocks (A-F)</p>
              </div>
            </button>

            <button className="zone-card">
              <div className="zone-icon">
                <span className="material-icons">restaurant</span>
              </div>
              <div>
                <h3>Cafeteria</h3>
                <p>Main food court and coffee shops</p>
              </div>
            </button>
          </div>

          {/* Right Column */}
          <div className="map-container">
            <div className="map-header">
              <span>Campus Map View</span>
            </div>

            <div className="map-body">
              <div className="map-placeholder">
                <p>Campus Map Preview</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="footer-actions">
          <button className="back-btn">
            <span className="material-icons">arrow_back</span>
            Back to Item Details
          </button>

          <button className="continue-btn">
            Continue to Review
            <span className="material-icons">arrow_forward</span>
          </button>
        </div>
      </main>

      <footer className="footer">
        <p>© 2024 Reclaima • University Campus Lost & Found System</p>
      </footer>
    </div>
  );
};

export default SelectZone;
