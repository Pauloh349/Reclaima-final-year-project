import "../styles/SmartMatches.css";
import MatchCard from "../components/smart-matches/MatchCard";

export default function SmartMatches() {
  return (
    <div className="smart-matches-page">
      {/* Navigation */}
      <nav className="nav">
        <div className="nav-left">
          <div className="logo-icon">
            <span className="material-icons">search</span>
          </div>
          <span className="logo-text">Reclaima</span>
        </div>

        <div className="nav-links">
          <a href="#">Dashboard</a>
          <a href="#" className="active">
            My Lost Items
          </a>
          <a href="#">Campus Map</a>
        </div>

        <div className="nav-right">
          <button className="icon-btn">
            <span className="material-icons">notifications</span>
          </button>
          <div className="avatar">
            <img src="https://via.placeholder.com/100" alt="profile" />
          </div>
        </div>
      </nav>

      <main className="container">
        {/* Header */}
        <div className="page-header">
          <h1>Smart Matches Found</h1>
          <p>
            Our AI found 12 potential matches for your
            <strong> "Blue Laptop Bag"</strong>.
          </p>
        </div>

        <div className="content-layout">
          {/* Sidebar */}
          <aside className="sidebar">
            <div className="card">
              <h3>Filter Results</h3>

              <label>Refine Search</label>
              <input type="text" placeholder="Search keywords..." />

              <label>Campus Zone</label>
              <div className="checkbox-group">
                <label>
                  <input type="checkbox" defaultChecked /> Main Library
                </label>
                <label>
                  <input type="checkbox" /> Student Union
                </label>
                <label>
                  <input type="checkbox" defaultChecked /> Science Building
                </label>
                <label>
                  <input type="checkbox" /> Gymnasium
                </label>
              </div>

              <label>Time Found</label>
              <select defaultValue="7">
                <option value="1">Last 24 Hours</option>
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
              </select>

              <button className="secondary-btn">Reset Filters</button>
            </div>
          </aside>

          {/* Match Grid */}
          <div className="grid">
            <MatchCard
              image="../src/assets/laptop-carrier.webp"
              title="Blue Laptop Carrier"
              location="Engineering Library - Floor 2"
              date="Found Nov 14 • 10:15 AM"
              confidence="98% MATCH"
              high
            />

            <MatchCard
              image="../src/assets/padded-bag.jpg"
              title="Dark Blue Padded Bag"
              location="Student Union Cafeteria"
              date="Found Nov 14 • 2:30 PM"
              confidence="75% MATCH"
            />

            <MatchCard
              image="../src/assets/tech-bag.jpg"
              title="Tech Backpack - Navy"
              location="Bio-Tech Lab Corridor"
              date="Found Nov 13 • 9:00 AM"
              confidence="92% MATCH"
              high
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>© 2023 Reclaima University Lost & Found</p>
      </footer>
    </div>
  );
}
