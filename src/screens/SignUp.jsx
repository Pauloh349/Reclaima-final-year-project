import { Link } from "react-router-dom";
import "../styles/signup.css";

const SignUp = () => {
  return (
    <div className="auth-page">
      <main className="auth-shell">
        <div className="auth-brand">
          <div className="brand-icon">
            <span className="material-icons">find_replace</span>
          </div>
          <span>Reclaima</span>
        </div>

        <section className="auth-card">
          <header className="auth-header">
            <h1>Create account</h1>
            <p>Start reporting and tracking items across your campus.</p>
          </header>

          <form className="auth-form" action="#" method="POST">
            <label htmlFor="signup-email">University Email</label>
            <div className="input-row">
              <span className="material-icons input-icon">school</span>
              <input
                type="email"
                id="signup-email"
                name="signup-email"
                placeholder="name@university.edu"
                required
              />
            </div>

            <label htmlFor="signup-password">Password</label>
            <div className="input-row">
              <span className="material-icons input-icon">lock</span>
              <input
                type="password"
                id="signup-password"
                name="signup-password"
                placeholder="Create a secure password"
                required
              />
            </div>

            <label className="consent-row" htmlFor="signup-consent">
              <input
                type="checkbox"
                id="signup-consent"
                name="signup-consent"
                required
              />
              <span>
                I agree to the <Link to="/terms">Terms of Service</Link> and{" "}
                <Link to="/privacy">Privacy Policy</Link>.
              </span>
            </label>

            <button type="submit" className="btn-primary">
              Create Account
              <span className="material-icons">arrow_forward</span>
            </button>
          </form>

          <footer className="auth-footer">
            <p>
              Already have an account? <Link to="/signin">Sign in</Link>
            </p>
          </footer>
        </section>

        <footer className="page-footer">
          <div className="footer-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/help">Help Center</Link>
          </div>
          <p>© 2026 Reclaima University Platform</p>
        </footer>
      </main>
    </div>
  );
};

export default SignUp;
