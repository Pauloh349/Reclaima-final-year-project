import "../styles/ItemDetails.css";
import NavBar from "../components/NavBar";
import { DetailRow, MiniCard } from "../components/item-details/ItemCards";

export default function ItemDetails() {
  return (
    <div className="item-page">
      <NavBar
        icon="reorder"
        links={[
          { label: "Browse Lost Items", to: "/matches", active: true },
          { label: "Report Found", to: "/found" },
          { label: "My Claims", to: "/profile" },
        ]}
        rightContent={
          <>
            <button className="rc-navbar-icon-btn" aria-label="Notifications">
              <span className="material-icons">notifications</span>
            </button>
            <div className="avatar">JD</div>
          </>
        }
      />

      <main className="item-shell">
        <div className="item-breadcrumb">
          <span>Matches</span>
          <span className="material-icons">chevron_right</span>
          <span>Electronics</span>
          <span className="material-icons">chevron_right</span>
          <strong>MacBook Pro 14"</strong>
        </div>

        <section className="item-layout">
          <div className="item-primary">
            <div className="item-image-card">
              <img src="/src/assets/tech-bag.jpg" alt="Laptop" />
              <span className="privacy-badge">
                <span className="material-icons">visibility_off</span>
                Privacy Protected
              </span>
            </div>

            <div className="item-description-card">
              <h2>Finder Description</h2>
              <p>
                Found on the 3rd floor of the Main Library near study cubicles.
                Device appears functional and was turned in without accessories.
              </p>

              <div className="tip-box">
                <span className="material-icons">info</span>
                <p>
                  Ownership is verified before release. Prepare unique details
                  when making a claim.
                </p>
              </div>
            </div>
          </div>

          <aside className="item-side">
            <div className="summary-card">
              <span className="availability">Available</span>
              <h1>Apple MacBook Pro 14" (Silver)</h1>

              <DetailRow
                icon="category"
                label="Category"
                value="Electronics and Computers"
              />
              <DetailRow
                icon="location_on"
                label="Found At"
                value="North Campus, Science Library"
              />
              <DetailRow
                icon="calendar_today"
                label="Date Found"
                value="Oct 24, 2024"
              />
              <DetailRow
                icon="handshake"
                label="Return Method"
                value="Campus Security Office"
              />
            </div>

            <div className="action-card">
              <button className="btn-primary-action">
                <span className="material-icons">task_alt</span>
                Start Claim
              </button>
              <button className="btn-secondary-action">
                <span className="material-icons">forum</span>
                Message Finder
              </button>
              <p className="action-note">
                False claims may lead to account restrictions.
              </p>
            </div>

            <div className="reporter-card">
              <span className="material-icons">person</span>
              <div>
                <small>Reported by</small>
                <strong>Verified Student Finder</strong>
              </div>
            </div>
          </aside>
        </section>

        <section className="nearby-section">
          <h3>Similar Items Nearby</h3>
          <div className="nearby-grid">
            <MiniCard
              title="Blue HydroFlask"
              imageSrc="/src/assets/tech-bag.jpg"
            />
            <MiniCard
              title="Leather Wallet"
              imageSrc="/src/assets/padded-bag.jpg"
            />
            <MiniCard
              title="Ray-Ban Sunglasses"
              imageSrc="/src/assets/laptop-carrier.webp"
            />
            <MiniCard
              title="Sony Headphones"
              imageSrc="/src/assets/tech-bag.jpg"
            />
          </div>
        </section>
      </main>

      <footer className="item-footer">
        © 2026 University Lost and Found Platform
      </footer>
    </div>
  );
}
