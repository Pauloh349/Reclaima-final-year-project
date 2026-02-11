export function ProfileNavbar() {
  return (
    <nav className="nav">
      <div className="nav-left">
        <div className="logo-icon">
          <span className="material-icons">reclaim</span>
        </div>
        <span className="logo-text">Reclaima</span>
      </div>

      <div className="nav-right">
        <a href="#">Dashboard</a>
        <a href="#">Browse Items</a>
        <div className="divider" />
        <div className="user">
          <img src="https://via.placeholder.com/40" alt="User" />
          <span>Alex Chen</span>
        </div>
      </div>
    </nav>
  );
}

export function Sidebar() {
  return (
    <aside className="sidebar">
      <SidebarItem icon="person" label="Account Profile" active />
      <SidebarItem icon="history" label="My Reports" />
      <SidebarItem icon="notifications" label="Notifications" />
      <SidebarItem icon="security" label="Security" />

      <div className="logout">
        <SidebarItem icon="logout" label="Logout" danger />
      </div>
    </aside>
  );
}

function SidebarItem({ icon, label, active, danger }) {
  return (
    <button
      className={`sidebar-item 
      ${active ? "active" : ""} 
      ${danger ? "danger" : ""}`}
    >
      <span className="material-icons">{icon}</span>
      {label}
    </button>
  );
}

export function Content() {
  return (
    <div className="content">
      <ProfileCard />
      <ReportsSection />
      <SettingsGrid />
      <CampusPreferences />
      <FooterControls />
    </div>
  );
}

function ProfileCard() {
  return (
    <section className="card profile-card">
      <div className="profile-left">
        <div className="avatar">
          <img src="https://via.placeholder.com/150" alt="Profile" />
        </div>

        <div>
          <div className="profile-header">
            <h1>Alex Chen</h1>
            <span className="badge">Verified Student</span>
          </div>

          <p className="meta">alex.chen@university.edu • ID: 202488319</p>

          <div className="stats">
            <Stat label="Items Lost" value="3" />
            <Stat label="Items Found" value="12" />
            <Stat label="Member Since" value="Sept 2023" />
          </div>
        </div>
      </div>

      <button className="primary-btn">Edit Profile</button>
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat-box">
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}

function ReportsSection() {
  return (
    <section>
      <div className="section-header">
        <h2>Recent Reports</h2>
        <button className="link-btn">
          View all history
          <span className="material-icons">arrow_forward</span>
        </button>
      </div>

      <div className="report-grid">
        <ReportCard
          title="Blue Leather Wallet"
          type="Lost"
          status="Matching in progress"
        />
        <ReportCard title="AirPods Case" type="Found" status="Owner Contacted" />
      </div>
    </section>
  );
}

function ReportCard({ title, type, status }) {
  return (
    <div className="report-card">
      <img src="https://via.placeholder.com/100" alt={title} />

      <div className="report-info">
        <div className="report-header">
          <h3>{title}</h3>
          <span className={`tag ${type.toLowerCase()}`}>{type}</span>
        </div>

        <p className="report-meta">Reported recently • Campus Area</p>

        <div className="status">{status}</div>
      </div>
    </div>
  );
}

function SettingsGrid() {
  return (
    <div className="settings-grid">
      <Notifications />
      <Security />
    </div>
  );
}

function Notifications() {
  return (
    <section className="card">
      <h3>Notification Preferences</h3>

      <Toggle label="New Match Found" />
      <Toggle label="Messages" />
      <Toggle label="University Alerts" />
    </section>
  );
}

function Security() {
  return (
    <section className="card">
      <h3>Security & Privacy</h3>

      <input type="password" placeholder="Current Password" />
      <input type="password" placeholder="New Password" />

      <div className="security-box">
        <span className="material-icons">verified_user</span>
        <div>
          <strong>Two-Factor Authentication</strong>
          <small>Highly Recommended</small>
        </div>
        <button className="outline-btn small">Enable</button>
      </div>

      <button className="link-btn right">Update Security Settings</button>
    </section>
  );
}

function Toggle({ label }) {
  return (
    <div className="toggle-row">
      <span>{label}</span>
      <label className="switch">
        <input type="checkbox" defaultChecked />
        <span className="slider" />
      </label>
    </div>
  );
}

function CampusPreferences() {
  return (
    <section className="card">
      <h3>Campus Preferences</h3>

      <div className="form-grid">
        <div>
          <label>Primary Campus</label>
          <select>
            <option>Main City Campus</option>
            <option>West Side Annex</option>
          </select>
        </div>

        <div>
          <label>Phone Number</label>
          <input type="tel" defaultValue="+1 (555) 123-4567" />
        </div>

        <div>
          <label>Display Language</label>
          <select>
            <option>English</option>
            <option>Spanish</option>
          </select>
        </div>
      </div>
    </section>
  );
}

function FooterControls() {
  return (
    <div className="footer-controls">
      <button className="danger-link">Delete account permanently</button>

      <div className="actions">
        <button className="outline-btn">Discard</button>
        <button className="primary-btn">Save All Changes</button>
      </div>
    </div>
  );
}

export function ProfileFooter() {
  return (
    <footer className="footer">© 2024 University Lost & Found Platform</footer>
  );
}
