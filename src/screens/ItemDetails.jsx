import "../styles/ItemDetails.css";
import { DetailRow, MiniCard } from "../components/item-details/ItemCards";

export default function ItemDetails() {
  return (
    <div className="item-page">
      {/* NAV */}
      <nav className="nav">
        <div className="nav-left">
          <div className="logo-icon">
            <span className="material-icons">reorder</span>
          </div>
          <span className="logo-text">Reclaima</span>
        </div>

        <div className="nav-links">
          <a href="#" className="active">
            Browse Lost Items
          </a>
          <a href="#">Report Found</a>
          <a href="#">My Claims</a>
        </div>

        <div className="nav-right">
          <span className="material-icons icon-btn">notifications</span>
          <div className="avatar">JD</div>
        </div>
      </nav>

      <main className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <span>Home</span>
          <span className="material-icons small">chevron_right</span>
          <span>Electronics</span>
          <span className="material-icons small">chevron_right</span>
          <strong>Apple MacBook Pro 14"</strong>
        </div>

        <div className="layout">
          {/* LEFT */}
          <div className="left">
            <div className="image-card">
              <img src="https://via.placeholder.com/800x600" alt="Laptop" />

              <div className="privacy-overlay">
                <span className="material-icons big">visibility_off</span>
                <h3>Privacy Protection Active</h3>
                <p>
                  Sensitive details are blurred. Full images are released after
                  ownership verification.
                </p>
                <button className="secondary-btn">View Safe Preview</button>
              </div>
            </div>

            <div className="description-card">
              <h2>Finder's Description</h2>
              <p>
                Found near the back row of the Main Library’s 3rd floor. It was
                left plugged in. Stickers on the lid are blurred for security.
              </p>

              <div className="info-box">
                <span className="material-icons">info</span>
                <div>
                  <strong>Security Tip</strong>
                  <p>Only the real owner will know identifying marks.</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="right">
            <div className="details-card">
              <span className="status">Available</span>
              <h1>Apple MacBook Pro 14" (Silver)</h1>

              <DetailRow
                icon="category"
                label="Category"
                value="Electronics & Computers"
              />

              <DetailRow
                icon="location_on"
                label="Location"
                value="North Campus - Science Library"
              />

              <DetailRow
                icon="calendar_today"
                label="Date Found"
                value="Thursday, Oct 24, 2024"
              />

              <DetailRow
                icon="handshake"
                label="Handover"
                value="Campus Security Office"
              />
            </div>

            <div className="action-card">
              <button className="primary-btn">
                <span className="material-icons">task_alt</span>
                Claim This Item
              </button>

              <button className="outline-btn">
                <span className="material-icons">forum</span>
                Message Finder
              </button>

              <p className="disclaimer">
                Fraudulent claims may lead to disciplinary action.
              </p>
            </div>

            <div className="finder-card">
              <div className="finder-left">
                <span className="material-icons">person</span>
                <div>
                  <small>Reported by</small>
                  <strong>Verified Student Finder</strong>
                </div>
              </div>
              <div className="stars">⭐⭐⭐⭐⭐</div>
            </div>
          </div>
        </div>

        {/* Similar Items */}
        <section className="similar-section">
          <h3>Found Nearby</h3>

          <div className="similar-grid">
            <MiniCard title="Blue HydroFlask" />
            <MiniCard title="Leather Wallet" />
            <MiniCard title="Ray-Ban Sunglasses" />
            <MiniCard title="Sony Headphones" />
          </div>
        </section>
      </main>

      <footer className="footer">
        © 2024 University Lost & Found Platform
      </footer>
    </div>
  );
}
