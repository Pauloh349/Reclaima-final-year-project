import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import "../styles/welcome.css";

function Welcome() {
  return (
    <div className="welcome-page">
      <NavBar
        fixed
        icon="find_replace"
        links={[
          { label: "How it works", to: "/how-it-works" },
          { kind: "divider" },
          { label: "Sign In", to: "/signin", className: "signin" },
          { label: "Sign Up", to: "/signup", className: "signin" },
        ]}
        rightContent={
          <Link className="btn-primary small" to="/signup">
            Get Started
          </Link>
        }
      />

      <main className="welcome-main">
        <section className="welcome-hero container">
          <div className="hero-copy">
            <span className="welcome-eyebrow">
              Campus Lost and Found Platform
            </span>
            <h1>
              Welcome to <span className="accent-text">Reclaima</span>
            </h1>
            <p>
              The fastest way for your campus community to recover lost items
              through clear reporting, smart matching, and safe handovers.
            </p>

            <div className="hero-actions">
              <Link className="btn-primary large" to="/signup">
                Get Started
                <span className="material-icons">arrow_forward</span>
              </Link>
              <Link className="btn-secondary" to="/signin">
                Sign In
              </Link>
              <Link className="btn-text" to="/how-it-works">
                How it works
                <span className="material-icons">play_circle</span>
              </Link>
            </div>

            <div className="hero-meta">
              <div>
                <strong>10K+</strong>
                <span>Campus users</span>
              </div>
              <div>
                <strong>2.4K</strong>
                <span>Items returned</span>
              </div>
              <div>
                <strong>24h</strong>
                <span>Average first match</span>
              </div>
            </div>
          </div>

          <div className="hero-panel">
            <h2>How Reclaima helps</h2>
            <ul>
              <li>
                <span className="material-icons">task_alt</span>
                Guided lost and found reporting in minutes
              </li>
              <li>
                <span className="material-icons">search</span>
                Smart matching by location, date, and category
              </li>
              <li>
                <span className="material-icons">verified_user</span>
                Safer handovers through trusted campus points
              </li>
            </ul>
            <Link to="/how-it-works" className="panel-link">
              View full process
              <span className="material-icons">arrow_forward</span>
            </Link>
          </div>
        </section>

        <section className="welcome-process-wrap container">
          <section className="welcome-process">
            <article className="process-card">
              <span className="step">01</span>
              <h3>Report</h3>
              <p>Post details in minutes with a guided workflow.</p>
            </article>
            <article className="process-card">
              <span className="step">02</span>
              <h3>Match</h3>
              <p>Receive AI-ranked matches by confidence and location.</p>
            </article>
            <article className="process-card">
              <span className="step">03</span>
              <h3>Return</h3>
              <p>Coordinate a secure handover and close the report.</p>
            </article>
          </section>
        </section>
      </main>

      <footer className="welcome-footer">
        <div className="container footer-inner">
          <span>© 2026 Reclaima Inc. Built for university communities.</span>
          <div className="footer-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/help">Contact Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Welcome;
