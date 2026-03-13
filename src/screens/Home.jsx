import { useMemo } from "react";
import "../styles/home.css";
import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import UserBadge from "../components/UserBadge";
import { getUserDisplayName, useAuthUser } from "../hooks/useAuthUser";

const Home = () => {
  const user = useAuthUser();

  const displayName = useMemo(() => getUserDisplayName(user), [user]);

  return (
    <div className="home-page">
      <NavBar
        icon="location_searching"
        links={[]}
        rightContent={
          <>
            <button className="rc-navbar-icon-btn" aria-label="Notifications">
              <span className="material-icons">notifications</span>
            </button>
            <UserBadge showChevron />
          </>
        }
      />

      <main className="home-shell">
        <section className="home-hero">
          <div>
            <span className="eyebrow">Dashboard</span>
            <h1>Welcome back, {displayName}</h1>
            <p>
              Track reports, review smart matches, and quickly post new lost or
              found items.
            </p>
          </div>
          <Link to="/matches" className="hero-cta">
            View Smart Matches
            <span className="material-icons">arrow_forward</span>
          </Link>
        </section>

        <section className="stats-grid">
          <article className="stat-card">
            <small>Active Reports</small>
            <strong>6</strong>
          </article>
          <article className="stat-card">
            <small>Potential Matches</small>
            <strong>12</strong>
          </article>
          <article className="stat-card">
            <small>Resolved Cases</small>
            <strong>9</strong>
          </article>
        </section>

        <section className="action-grid">
          <Link to="/lost" className="action-card">
            <div className="action-head">
              <span className="material-icons">search</span>
              <h2>Report Lost Item</h2>
            </div>
            <p>
              Add missing item details so the community can help identify it
              faster.
            </p>
            <div className="card-link">
              Start report
              <span className="material-icons">arrow_forward</span>
            </div>
          </Link>

          <Link to="/found" className="action-card">
            <div className="action-head">
              <span className="material-icons">inventory_2</span>
              <h2>Report Found Item</h2>
            </div>
            <p>Log found property and let Reclaima suggest likely owners.</p>
            <div className="card-link">
              Start report
              <span className="material-icons">arrow_forward</span>
            </div>
          </Link>
        </section>

        <section className="quick-links">
          <Link to="/profile">Profile settings</Link>
          <Link to="/how-it-works">How it works</Link>
          <Link to="/help">Support</Link>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-links">
          <Link to="/how-it-works">How it works</Link>
          <Link to="/terms">Campus Safety</Link>
          <Link to="/help">Support</Link>
        </div>
        <p>© 2026 Reclaima University Platform</p>
      </footer>
    </div>
  );
};

export default Home;
