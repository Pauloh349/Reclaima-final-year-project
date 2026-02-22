import { Link } from "react-router-dom";
import "../styles/SignIn.css";

const SignIn = () => {
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
            <h1>Sign in</h1>
            <p>Access your reports, matches, and messages.</p>
          </header>

          <form className="auth-form" action="#" method="POST">
            <label htmlFor="signin-email">University Email</label>
            <div className="input-row">
              <span className="material-icons input-icon">school</span>
              <input
                type="email"
                id="signin-email"
                name="signin-email"
                placeholder="name@university.edu"
                required
              />
            </div>

            <label htmlFor="signin-password">Password</label>
            <div className="input-row">
              <span className="material-icons input-icon">lock</span>
              <input
                type="password"
                id="signin-password"
                name="signin-password"
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" className="btn-primary">
              Continue
              <span className="material-icons">arrow_forward</span>
            </button>
          </form>

          <footer className="auth-footer">
            <p>
              New to Reclaima? <Link to="/signup">Create an account</Link>
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

export default SignIn;
