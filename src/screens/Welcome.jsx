import { Link } from "react-router-dom";
import "../styles/welcome.css";

function Welcome() {
  return (
    <div className="welcome-page">
      <nav className="navbar">
        <div className="container nav-inner">
          <div className="logo">
            <div className="logo-icon">
              <span className="material-icons">find_replace</span>
            </div>
            <span className="logo-text">Reclaima</span>
          </div>

          <div className="nav-links">
            <a href="#">How it works</a>
            <a href="#">Safety</a>
            <a href="#">Campus Hub</a>
            <span className="divider"></span>
            <Link className="signin" to="/home">
              Sign In
            </Link>
            <Link className="signin" to="/signup">
              Sign Up
            </Link>
            <Link className="btn-primary small" to="/signup">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="hero">
        <div className="container hero-grid">
          <div className="hero-left">
            <div className="badge">
              <span className="dot"></span>
              Now live at State University
            </div>

            <h1>
              Reclaiming what's <span className="highlight">yours</span>,
              together.
            </h1>

            <p>
              The dedicated lost and found platform for your university
              community. Connect with fellow students and staff to return
              valuables and find what you've lost, faster than ever.
            </p>

            <div className="hero-actions">
              <Link className="btn-primary large" to="/signup">
                Get Started
                <span className="material-icons">arrow_forward</span>
              </Link>

              <div className="signin-box">
                <span>Already a member?</span>
                <Link to="/home">Sign in to your account</Link>
              </div>
            </div>
          </div>

          <div className="hero-right">
            <div className="image-wrapper">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDA_csNrwVW9RIv50QL_XeX0SkRylG4-fG49GnX6vU4s2SIwaLqAEX05Z7jQPN63GAKPy3T9cpfx3r7bomjcZ3SVxSx05oev4tz0TRtRUtjv8uMss_BFKEIFEGY2CtE4iKV_1HhR-nAav0kz1BSmthLAX4P9-N95OZ8LuBrXhwiI-rRiz95XRLIUD8Fll3Vq5-ZmW4vMFnF1j1OazE8cNuWh7tS9SIChbCdiFRhJcr9hqRSsryhU8-s_g1pZvna2AtYMzB5Ixh-vPSo"
                alt="University campus"
              />

              <div className="card floating-1">
                <strong>Item Found</strong>
                <p>Blue Hydro Flask found at the Student Quad.</p>
              </div>

              <div className="card floating-2">
                <strong>New Post</strong>
                <p>Lost: Silver MacBook Air in Library Room 302.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer>
        <div className="container footer-inner">
          <span>© 2024 Reclaima Inc. Built for university communities.</span>
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
