import { Link } from "react-router-dom";
import "../styles/Legal.css";

const PrivacyPolicy = () => {
  return (
    <div className="legal-page">
      <nav className="legal-nav">
        <div className="legal-container nav-inner">
          <div className="logo">
            <div className="logo-icon">
              <span className="material-icons">lock</span>
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
          <h1>Privacy Policy</h1>
          <p className="legal-subtitle">
            We collect only what we need to reunite lost items with their
            owners, and we keep it secure within your campus community.
          </p>
          <p className="legal-meta">Effective February 11, 2026</p>
        </header>

        <section className="legal-section">
          <h2>Information We Collect</h2>
          <ul>
            <li>Account details such as name, university email, and role.</li>
            <li>Item reports, photos, locations, and timestamps.</li>
            <li>Communication logs between finders and owners.</li>
            <li>Device and usage data for security and abuse prevention.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>How We Use Information</h2>
          <ul>
            <li>Match lost and found items with high confidence.</li>
            <li>Notify users about updates on their reports.</li>
            <li>Support campus safety teams and authorized staff.</li>
            <li>Improve features, reliability, and user experience.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>Sharing and Disclosure</h2>
          <p>
            We never sell personal data. We only share information with
            authorized campus administrators, safety teams, or service providers
            who help us operate the platform under strict confidentiality.
          </p>
        </section>

        <section className="legal-section">
          <h2>Your Choices</h2>
          <ul>
            <li>Review and update your profile in settings.</li>
            <li>Request deletion of your account and report history.</li>
            <li>Opt out of non-essential notifications.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>Contact</h2>
          <p>
            Questions about privacy? Visit the{" "}
            <Link to="/help">Help Center</Link> or contact campus support.
          </p>
        </section>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
