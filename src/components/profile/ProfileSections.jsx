import { Link } from "react-router-dom";
import NavBar from "../NavBar";

export function ProfileNavbar() {
  return (
    <NavBar
      icon="reorder"
      links={[
        { label: "Dashboard", to: "/home" },
        { label: "Browse Items", to: "/matches" },
        { label: "Profile", to: "/profile", active: true },
      ]}
      rightContent={
        <Link className="rc-navbar-user" to="/profile">
          <img src="../src/assets/user-icon.jpg" alt="User" />
          <span>Alex Chen</span>
        </Link>
      }
    />
  );
}

export function Content() {
  return (
    <div className="profile-simple">
      <section className="simple-card profile-head">
        <img
          className="profile-avatar"
          src="../src/assets/user-icon.jpg"
          alt="Profile"
        />
        <div className="profile-main">
          <h1>Alex Chen</h1>
          <p>alex.1234567@student.egerton.ac.ke</p>
          <span className="simple-chip">Verified Student</span>
        </div>
        <button className="simple-btn primary">Edit</button>
      </section>

      <section className="simple-card">
        <h2>Account</h2>
        <div className="simple-list">
          <Row label="Student ID" value="202488319" />
          <Row label="Primary Campus" value="Main City Campus" />
          <Row label="Phone" value="+1 (555) 123-4567" />
          <Row label="Language" value="English" />
        </div>
      </section>

      <section className="simple-card">
        <h2>Preferences</h2>
        <Toggle label="New Match Alerts" defaultChecked />
        <Toggle label="Messages" defaultChecked />
        <Toggle label="University Notifications" />
      </section>

      <section className="simple-card">
        <h2>Recent Reports</h2>
        <div className="simple-activity">
          <Activity title="Blue Leather Wallet" status="Matching in progress" />
          <Activity title="AirPods Case" status="Owner contacted" />
        </div>
      </section>

      <div className="simple-actions">
        <button className="simple-btn">Discard Changes</button>
        <button className="simple-btn primary">Save Changes</button>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="simple-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Toggle({ label, defaultChecked = false }) {
  return (
    <label className="simple-toggle">
      <span>{label}</span>
      <input type="checkbox" defaultChecked={defaultChecked} />
    </label>
  );
}

function Activity({ title, status }) {
  return (
    <div className="activity-item">
      <span>{title}</span>
      <small>{status}</small>
    </div>
  );
}

export function ProfileFooter() {
  return (
    <footer className="footer">© 2026 University Lost & Found Platform</footer>
  );
}
