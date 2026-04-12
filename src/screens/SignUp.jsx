import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/signup.css";
import { notifyAuthUserChanged } from "../hooks/useAuthUser";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[\p{L}]+(?:[ '-][\p{L}]+)*$/u;

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    consent: false,
    humanCheck: false,
  });
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    const nextValue = type === "checkbox" ? checked : value;

    setFormData((current) => ({
      ...current,
      [name]: nextValue,
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

  const validateNameField = (value, label, key, validationErrors) => {
    const trimmed = value.trim();

    if (!trimmed) {
      validationErrors[key] = `${label} is required.`;
      return;
    }

    if (trimmed.length < 2) {
      validationErrors[key] = `${label} must be at least 2 characters.`;
      return;
    }

    if (trimmed.length > 50) {
      validationErrors[key] = `${label} must be 50 characters or fewer.`;
      return;
    }

    if (!NAME_REGEX.test(trimmed)) {
      validationErrors[key] = `${label} can only contain letters, spaces, apostrophes, or hyphens.`;
    }
  };

  const validateForm = () => {
    const validationErrors = {};
    const email = formData.email.trim().toLowerCase();

    validateNameField(formData.firstName, "First name", "firstName", validationErrors);
    validateNameField(formData.lastName, "Last name", "lastName", validationErrors);

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

    if (!formData.consent) {
      validationErrors.consent = "You must agree to the terms and privacy policy.";
    }

    if (!formData.humanCheck) {
      validationErrors.humanCheck = "Please confirm you are not a robot.";
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
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setErrors(payload.errors || {});
        setFeedback(payload.message || "Signup failed. Please try again.");

        if (payload.requiresEmailVerification) {
          navigate(`/verify-email?email=${encodeURIComponent(formData.email.trim().toLowerCase())}`);
        }

        return;
      }

      if (payload.requiresEmailVerification) {
        setFeedback(payload.message || "Please verify your email to continue.");
        navigate(`/verify-email?email=${encodeURIComponent(formData.email.trim().toLowerCase())}`);
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

      setFeedback(payload.message || "Account created successfully.");
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
            <h1>Create account</h1>
            <p>Start reporting and tracking items across your campus.</p>
          </header>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label htmlFor="signup-first-name">First Name</label>
            <div className="input-row">
              <span className="material-icons input-icon">person</span>
              <input
                type="text"
                id="signup-first-name"
                name="firstName"
                placeholder="Jane"
                value={formData.firstName}
                onChange={handleInputChange}
                className={errors.firstName ? "input-error" : ""}
                maxLength={50}
                autoComplete="given-name"
              />
            </div>
            {errors.firstName ? <p className="field-error">{errors.firstName}</p> : null}

            <label htmlFor="signup-last-name">Last Name</label>
            <div className="input-row">
              <span className="material-icons input-icon">person</span>
              <input
                type="text"
                id="signup-last-name"
                name="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleInputChange}
                className={errors.lastName ? "input-error" : ""}
                maxLength={50}
                autoComplete="family-name"
              />
            </div>
            {errors.lastName ? <p className="field-error">{errors.lastName}</p> : null}

            <label htmlFor="signup-email">University Email</label>
            <div className="input-row">
              <span className="material-icons input-icon">school</span>
              <input
                type="email"
                id="signup-email"
                name="email"
                placeholder="name@university.edu"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? "input-error" : ""}
              />
            </div>
            {errors.email ? <p className="field-error">{errors.email}</p> : null}

            <label htmlFor="signup-password">Password</label>
            <div className="input-row password-row">
              <span className="material-icons input-icon">lock</span>
              <input
                type={showPassword ? "text" : "password"}
                id="signup-password"
                name="password"
                placeholder="Create a secure password"
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

            <label className="consent-row" htmlFor="signup-consent">
              <input
                type="checkbox"
                id="signup-consent"
                name="consent"
                checked={formData.consent}
                onChange={handleInputChange}
              />
              <span>
                I agree to the <Link to="/terms">Terms of Service</Link> and{" "}
                <Link to="/privacy">Privacy Policy</Link>.
              </span>
            </label>
            {errors.consent ? <p className="field-error">{errors.consent}</p> : null}

            <label className="robot-row" htmlFor="signup-human-check">
              <input
                type="checkbox"
                id="signup-human-check"
                name="humanCheck"
                checked={formData.humanCheck}
                onChange={handleInputChange}
                className={errors.humanCheck ? "input-error" : ""}
              />
              <span>I am not a robot.</span>
            </label>
            {errors.humanCheck ? <p className="field-error">{errors.humanCheck}</p> : null}

            {feedback ? <p className="form-feedback">{feedback}</p> : null}

            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Account"}
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
