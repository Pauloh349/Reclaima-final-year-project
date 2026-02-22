import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import "../styles/HelpCenter.css";

const HelpCenter = () => {
  return (
    <div className="help-page">
      <NavBar
        icon="support_agent"
        links={[
          { label: "Dashboard", to: "/home" },
          { label: "Sign In", to: "/signin" },
        ]}
        rightContent={
          <Link to="/signup" className="rc-navbar-cta">
            Create Account
          </Link>
        }
      />

      <main className="help-container help-content">
        <header className="help-hero">
          <span className="eyebrow">Support</span>
          <h1>Help Center</h1>
          <p>
            Find answers fast, report issues, and learn how to reconnect with
            your missing items safely.
          </p>
          <div className="help-search">
            <span className="material-icons">search</span>
            <input type="text" placeholder="Search help articles..." />
          </div>
        </header>

        <section className="help-grid">
          <div className="help-card">
            <h3>Reporting Items</h3>
            <p>Learn how to post accurate lost or found reports.</p>
            <span>View guides</span>
          </div>
          <div className="help-card">
            <h3>Matching & Notifications</h3>
            <p>Understand how smart matches work and alerts are delivered.</p>
            <span>Explore matching</span>
          </div>
          <div className="help-card">
            <h3>Safe Meetups</h3>
            <p>Best practices for handovers and campus security support.</p>
            <span>Read safety tips</span>
          </div>
        </section>

        <section className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h4>How do I verify a match?</h4>
              <p>
                Use unique descriptions and compare photos. Meet in public
                spaces and confirm ownership before exchange.
              </p>
            </div>
            <div className="faq-item">
              <h4>Can I edit a report after posting?</h4>
              <p>
                Yes, head to your dashboard and update any report details at
                any time.
              </p>
            </div>
            <div className="faq-item">
              <h4>What if I feel unsafe?</h4>
              <p>
                Always meet in campus-approved locations and contact security
                if needed.
              </p>
            </div>
          </div>
        </section>

        <section className="help-cta">
          <div>
            <h2>Still need help?</h2>
            <p>
              Contact campus support or review our{" "}
              <Link to="/terms">community guidelines</Link>.
            </p>
          </div>
          <button className="primary-btn">
            Contact Support
            <span className="material-icons">arrow_forward</span>
          </button>
        </section>
      </main>

      <footer className="help-footer">
        <span>© 2026 Reclaima University Platform</span>
        <div className="footer-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
};

export default HelpCenter;
