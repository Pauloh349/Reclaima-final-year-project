import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import UserBadge from "../components/UserBadge";
import "../styles/HelpCenter.css";

const SUPPORT_EMAIL = "onlineapplications34@gmail.com";
const WHATSAPP_NUMBER = "254794300699";

const HelpCenter = () => {
  const [isSupportDialogOpen, setIsSupportDialogOpen] = useState(false);

  useEffect(() => {
    if (!isSupportDialogOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsSupportDialogOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSupportDialogOpen]);

  const openWhatsApp = () => {
    const message = encodeURIComponent(
      "Hi Reclaima support, I need help with the Help Center.",
    );
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setIsSupportDialogOpen(false);
  };

  const openEmail = () => {
    const subject = encodeURIComponent("Reclaima support request");
    const body = encodeURIComponent(
      "Hello Reclaima support,\n\nI need help with the Help Center.\n\nName:\nEmail:\nIssue:\n",
    );
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    setIsSupportDialogOpen(false);
  };

  return (
    <div className="help-page">
      <NavBar
        icon="support_agent"
        links={[
          { label: "Dashboard", to: "/home" },
          { label: "Sign In", to: "/signin" },
        ]}
        rightContent={
          <>
            <UserBadge />
            <Link to="/signup" className="rc-navbar-cta">
              Create Account
            </Link>
          </>
        }
      />

      <main className="help-container help-content">
        <header className="help-hero">
          <span className="eyebrow">Support</span>
          <h1>Help Center</h1>
          <p>
            Find answers fast, report issues, and learn how to reconnect with
            your missing items safely.
          </p>
          <div className="help-search">
            <span className="material-icons">search</span>
            <input type="text" placeholder="Search help articles..." />
          </div>
        </header>

        <section className="help-grid">
          <div className="help-card">
            <h3>Reporting Items</h3>
            <p>Learn how to post accurate lost or found reports.</p>
            <span>View guides</span>
          </div>
          <div className="help-card">
            <h3>Matching & Notifications</h3>
            <p>Understand how smart matches work and alerts are delivered.</p>
            <span>Explore matching</span>
          </div>
          <div className="help-card">
            <h3>Safe Meetups</h3>
            <p>Best practices for handovers and campus security support.</p>
            <span>Read safety tips</span>
          </div>
        </section>

        <section className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h4>How do I verify a match?</h4>
              <p>
                Use unique descriptions and compare photos. Meet in public
                spaces and confirm ownership before exchange.
              </p>
            </div>
            <div className="faq-item">
              <h4>Can I edit a report after posting?</h4>
              <p>
                Yes, head to your dashboard and update any report details at
                any time.
              </p>
            </div>
            <div className="faq-item">
              <h4>What if I feel unsafe?</h4>
              <p>
                Always meet in campus-approved locations and contact security
                if needed.
              </p>
            </div>
          </div>
        </section>

        <section className="help-cta">
          <div>
            <h2>Still need help?</h2>
            <p>
              Contact campus support or review our{" "}
              <Link to="/terms">community guidelines</Link>.
            </p>
          </div>
          <button
            type="button"
            className="primary-btn"
            onClick={() => setIsSupportDialogOpen(true)}
          >
            Contact Support
            <span className="material-icons">arrow_forward</span>
          </button>
        </section>
      </main>

      {isSupportDialogOpen ? (
        <div
          className="help-modal-backdrop"
          role="presentation"
          onClick={() => setIsSupportDialogOpen(false)}
        >
          <section
            className="help-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-support-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="help-modal-head">
              <div>
                <span className="eyebrow">Contact support</span>
                <h2 id="help-support-title">Choose how to reach us</h2>
                <p>
                  WhatsApp is faster. Email is available if your message can
                  wait a little longer.
                </p>
              </div>
              <button
                type="button"
                className="help-modal-close"
                onClick={() => setIsSupportDialogOpen(false)}
                aria-label="Close support options"
              >
                <span className="material-icons">close</span>
              </button>
            </header>

            <div className="help-modal-options">
              <button
                type="button"
                className="help-option help-option-primary"
                onClick={openWhatsApp}
              >
                <span className="help-option-icon">
                  <span className="material-icons">chat</span>
                </span>
                <span>
                  <strong>WhatsApp support</strong>
                  <small>Fastest option for quick help</small>
                </span>
                <span className="help-option-meta">0794300699</span>
              </button>

              <button
                type="button"
                className="help-option"
                onClick={openEmail}
              >
                <span className="help-option-icon">
                  <span className="material-icons">mail</span>
                </span>
                <span>
                  <strong>Email support</strong>
                  <small>Best for longer requests or details</small>
                </span>
                <span className="help-option-meta">{SUPPORT_EMAIL}</span>
              </button>
            </div>
          </section>
        </div>
      ) : null}

      <footer className="help-footer">
        <span>© 2026 Reclaima University Platform</span>
        <div className="footer-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
};

export default HelpCenter;

