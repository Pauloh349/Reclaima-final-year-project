import { Link } from "react-router-dom";
import "../styles/SignIn.css";

const SignIn = () => {
  return (
    <div className="signup-page">
      <div className="auth-card">
        <div className="auth-content">
          <div className="auth-header">
            <h1>Log in your account</h1>
            <p>Join your campus community and help return what's lost.</p>
          </div>

          <form action="#" method="POST">
            <div className="form-group">
              <label htmlFor="university-email">University Email</label>
              <div className="input-wrapper">
                <span className="material-icons input-icon">school</span>
                <input
                  type="email"
                  id="university-email"
                  name="university-email"
                  placeholder="name@university.edu"
                  required
                />
              </div>
              <p className="form-note">
                Only verified .edu or university domains allowed.
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <span className="material-icons input-icon">lock</span>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Min. 8 characters"
                  required
                />
                <button type="button" className="visibility-toggle">
                  <span className="material-icons">visibility_off</span>
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary">
              Log In
              <span className="material-icons">arrow_forward</span>
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account? <Link to="/signup">Sign up</Link>
            </p>
          </div>
        </div>
      </div>

      <div className="illustrative-footer">
        <div className="feature-card">
          <div className="feature-icon">
            <span className="material-icons">verified_user</span>
          </div>
          <h3>Secure Login</h3>
          <p>Your data is encrypted and kept within the campus.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">
            <span className="material-icons">favorite</span>
          </div>
          <h3>Human Centered</h3>
          <p>Designed for students, by students.</p>
        </div>
      </div>

      <div className="decorative-bottom"></div>
      <div className="decorative-top"></div>

      <footer>
        <p>© 2024 Reclaima University Platform. All rights reserved.</p>
        <div className="footer-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
          <Link to="/help">Help Center</Link>
        </div>
      </footer>
    </div>
  );
};

export default SignIn;
