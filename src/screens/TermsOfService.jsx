import { Link } from "react-router-dom";
import "../styles/Legal.css";

const TermsOfService = () => {
  return (
    <div className="legal-page">
      <nav className="legal-nav">
        <div className="legal-container nav-inner">
          <div className="logo">
            <div className="logo-icon">
              <span className="material-icons">gavel</span>
            </div>
            <span className="logo-text">Reclaima</span>
          </div>
          <div className="nav-links">
            <Link to="/home">Dashboard</Link>
            <Link to="/signin">Sign In</Link>
            <Link to="/signup" className="nav-cta">
              Create Account
            </Link>
          </div>
        </div>
      </nav>

      <main className="legal-container legal-content">
        <header className="legal-hero">
          <span className="eyebrow">Legal</span>
          <h1>Terms of Service</h1>
          <p className="legal-subtitle">
            By using Reclaima, you agree to keep the community safe, respectful,
            and focused on reuniting lost items.
          </p>
          <p className="legal-meta">Effective February 11, 2026</p>
        </header>

        <section className="legal-section">
          <h2>Community Guidelines</h2>
          <ul>
            <li>Provide accurate information in all reports.</li>
            <li>Respect privacy and avoid sharing sensitive data.</li>
            <li>Coordinate meetups in public, well-lit locations.</li>
            <li>Report suspicious activity to campus authorities.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>Account Responsibilities</h2>
          <p>
            You are responsible for maintaining the security of your account and
            for all activity that occurs under your login credentials.
          </p>
        </section>

        <section className="legal-section">
          <h2>Content Ownership</h2>
          <p>
            You retain ownership of the content you submit, but grant Reclaima a
            limited license to display and process it for the purpose of
            matching lost items.
          </p>
        </section>

        <section className="legal-section">
          <h2>Service Availability</h2>
          <p>
            We work to keep Reclaima available at all times, but we may suspend
            access for maintenance, security, or policy enforcement.
          </p>
        </section>

        <section className="legal-section">
          <h2>Need Help?</h2>
          <p>
            Visit our <Link to="/help">Help Center</Link> for FAQs and support
            resources.
          </p>
        </section>
      </main>
    </div>
  );
};

export default TermsOfService;
