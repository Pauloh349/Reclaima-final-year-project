import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/SignIn.css";
import { notifyAuthUserChanged } from "../hooks/useAuthUser";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => {
      if (!current[name]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[name];
      return nextErrors;
    });
  };

  const validateForm = () => {
    const validationErrors = {};
    const email = formData.email.trim().toLowerCase();

    if (!email) {
      validationErrors.email = "Email is required.";
    } else if (!EMAIL_REGEX.test(email)) {
      validationErrors.email = "Enter a valid email address.";
    }

    if (!formData.password) {
      validationErrors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      validationErrors.password = "Password must be at least 8 characters.";
    }

    return validationErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback("");

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setErrors(payload.errors || {});
        setFeedback(payload.message || "Signin failed. Please try again.");
        return;
      }

      if (payload.token) {
        localStorage.setItem("authToken", payload.token);
      }

      if (payload.user) {
        localStorage.setItem("authUser", JSON.stringify(payload.user));
      }

      notifyAuthUserChanged();

      const isAdmin = payload.user?.role === "admin";

      setFeedback(payload.message || "Signed in successfully.");
      navigate(isAdmin ? "/admin" : "/home");
    } catch {
      setFeedback("Could not connect to server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label htmlFor="signin-email">University Email</label>
            <div className="input-row">
              <span className="material-icons input-icon">school</span>
              <input
                type="email"
                id="signin-email"
                name="email"
                placeholder="name@university.edu"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? "input-error" : ""}
              />
            </div>
            {errors.email ? <p className="field-error">{errors.email}</p> : null}

            <label htmlFor="signin-password">Password</label>
            <div className="input-row password-row">
              <span className="material-icons input-icon">lock</span>
              <input
                type={showPassword ? "text" : "password"}
                id="signin-password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? "input-error" : ""}
              />
              <button
                type="button"
                className="toggle-visibility"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((current) => !current)}
              >
                <span className="material-icons">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            {errors.password ? <p className="field-error">{errors.password}</p> : null}

            {feedback ? <p className="form-feedback">{feedback}</p> : null}

            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Continue"}
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




