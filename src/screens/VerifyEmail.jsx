import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/signup.css";

const VerifyEmail = () => {
  const location = useLocation();
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const token = query.get("token") || "";
  const [email] = useState(query.get("email") || "");
  const [status, setStatus] = useState(token ? "verifying" : "idle");
  const [message, setMessage] = useState("");
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    setStatus("verifying");
    setMessage("");

    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!isMounted) return;

        if (response.ok) {
          setStatus("success");
          setMessage(payload.message || "Email verified successfully. You can sign in now.");
          return;
        }

        setStatus("error");
        setMessage(payload.message || "We could not verify this email.");
      })
      .catch(() => {
        if (!isMounted) return;
        setStatus("error");
        setMessage("Could not connect to server. Please try again.");
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleResend = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!email.trim()) {
      setMessage("Please enter the email you signed up with.");
      return;
    }

    setIsResending(true);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(payload.message || "Unable to resend verification email.");
        return;
      }

      setMessage(payload.message || "Verification email sent. Please check your inbox.");
    } catch {
      setMessage("Could not connect to server. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="auth-page">
      <main className="auth-shell">
        <div className="auth-brand">
          <div className="brand-icon">
            <span className="material-icons">mark_email_unread</span>
          </div>
          <span>Reclaima</span>
        </div>

        <section className="auth-card">
          <header className="auth-header">
            <h1>Verify your email</h1>
            <p>We sent a verification link to your inbox. Please verify to continue.</p>
          </header>

          {status === "verifying" ? (
            <p className="form-feedback">Verifying your email...</p>
          ) : null}

          {message ? <p className="form-feedback">{message}</p> : null}

          {status === "success" ? (
            <div className="auth-footer">
              <p>
                Your email is verified. <Link to="/signin">Sign in</Link>
              </p>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleResend}>
              <label htmlFor="verify-email">Email</label>
              <div className="input-row">
                <span className="material-icons input-icon">mail</span>
                <input
                  type="email"
                  id="verify-email"
                  name="email"
                  placeholder="name@university.edu"
                  value={email}
                  readOnly
                />
              </div>

              <button type="submit" className="btn-primary" disabled={isResending}>
                {isResending ? "Sending..." : "Resend verification email"}
                <span className="material-icons">send</span>
              </button>

              <footer className="auth-footer">
                <p>
                  Back to <Link to="/signin">Sign in</Link>
                </p>
              </footer>
            </form>
          )}
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

export default VerifyEmail;
