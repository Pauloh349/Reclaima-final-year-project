import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/SignIn.css";
import "../styles/ResetPassword.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const token = query.get("token") || "";
  const isTokenMode = Boolean(token);

  const [formData, setFormData] = useState({
    email: query.get("email") || "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const validateRequestForm = () => {
    const validationErrors = {};
    const email = formData.email.trim().toLowerCase();

    if (!email) {
      validationErrors.email = "Email is required.";
    } else if (!EMAIL_REGEX.test(email)) {
      validationErrors.email = "Enter a valid email address.";
    }

    return validationErrors;
  };

  const validateResetForm = () => {
    const validationErrors = {};

    if (!token) {
      validationErrors.token = "The reset link is missing its token.";
    }

    if (!formData.password) {
      validationErrors.password = "New password is required.";
    } else if (formData.password.length < 8) {
      validationErrors.password = "Password must be at least 8 characters.";
    }

    if (!formData.confirmPassword) {
      validationErrors.confirmPassword = "Please confirm your new password.";
    } else if (formData.confirmPassword !== formData.password) {
      validationErrors.confirmPassword = "Passwords do not match.";
    }

    return validationErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback("");

    const validationErrors = isTokenMode ? validateResetForm() : validateRequestForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await fetch(
        isTokenMode ? "/api/auth/reset-password" : "/api/auth/request-password-reset",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            isTokenMode
              ? {
                  token,
                  password: formData.password,
                  confirmPassword: formData.confirmPassword,
                }
              : {
                  email: formData.email.trim().toLowerCase(),
                },
          ),
        },
      );

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setErrors(payload.errors || {});
        setFeedback(payload.message || "Something went wrong. Please try again.");
        return;
      }

      setFeedback(payload.message || "Request completed successfully.");

      if (isTokenMode) {
        window.setTimeout(() => {
          navigate("/signin");
        }, 1800);
      } else {
        setFormData((current) => ({
          ...current,
          email: "",
        }));
      }
    } catch {
      setFeedback("Could not connect to server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page reset-password-page">
      <main className="auth-shell">
        <div className="auth-brand">
          <div className="brand-icon">
            <span className="material-icons">{isTokenMode ? "lock_reset" : "key"}</span>
          </div>
          <span>Reclaima</span>
        </div>

        <section className="auth-card">
          <header className="auth-header">
            <h1>{isTokenMode ? "Choose a new password" : "Reset your password"}</h1>
            <p>
              {isTokenMode
                ? "Set a fresh password to get back into your account."
                : "Enter your email and we will send you a reset link if the account exists."}
            </p>
          </header>

          {feedback ? <p className="form-feedback">{feedback}</p> : null}
          {errors.token ? <p className="field-error">{errors.token}</p> : null}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {!isTokenMode ? (
              <>
                <label htmlFor="reset-email">University Email</label>
                <div className="input-row">
                  <span className="material-icons input-icon">mail</span>
                  <input
                    type="email"
                    id="reset-email"
                    name="email"
                    placeholder="name@university.edu"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? "input-error" : ""}
                  />
                </div>
                {errors.email ? <p className="field-error">{errors.email}</p> : null}
              </>
            ) : (
              <>
                <label htmlFor="new-password">New Password</label>
                <div className="input-row password-row">
                  <span className="material-icons input-icon">lock</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="new-password"
                    name="password"
                    placeholder="Create a strong password"
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

                <label htmlFor="confirm-password">Confirm New Password</label>
                <div className="input-row password-row">
                  <span className="material-icons input-icon">lock_outline</span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirm-password"
                    name="confirmPassword"
                    placeholder="Repeat your new password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={errors.confirmPassword ? "input-error" : ""}
                  />
                  <button
                    type="button"
                    className="toggle-visibility"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    aria-pressed={showConfirmPassword}
                    onClick={() => setShowConfirmPassword((current) => !current)}
                  >
                    <span className="material-icons">
                      {showConfirmPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
                {errors.confirmPassword ? (
                  <p className="field-error">{errors.confirmPassword}</p>
                ) : null}
              </>
            )}

            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting
                ? isTokenMode
                  ? "Updating..."
                  : "Sending..."
                : isTokenMode
                  ? "Update password"
                  : "Send reset link"}
              <span className="material-icons">
                {isTokenMode ? "check" : "send"}
              </span>
            </button>
          </form>

          <footer className="auth-footer">
            <p>
              Back to <Link to="/signin">Sign in</Link>
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

export default ResetPassword;
