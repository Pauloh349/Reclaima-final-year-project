import "../styles/report-lost.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import NavBar from "../components/NavBar";
import UserBadge from "../components/UserBadge";
import { getUserDisplayName, useAuthUser } from "../hooks/useAuthUser";

const DRAFT_KEY = "lostReportDraft";

const ReportLost = () => {
  const user = useAuthUser();
  const displayName = getUserDisplayName(user);
  const navigate = useNavigate();
  const categories = [
    {
      icon: "badge",
      label: "ID or Badge",
      hint: "Student, staff, access cards",
    },
    { icon: "smartphone", label: "Phone", hint: "Smartphones and accessories" },
    {
      icon: "account_balance_wallet",
      label: "Wallet",
      hint: "Wallets, cards, and IDs",
    },
    { icon: "vpn_key", label: "Keys", hint: "Keys, fobs, keyholders" },
    { icon: "laptop_mac", label: "Laptop", hint: "Laptops and tablets" },
    { icon: "more_horiz", label: "Other", hint: "Anything not listed above" },
  ];

  const [selectedCategory, setSelectedCategory] = useState(
    categories[0]?.label || "",
  );
  const [statusMessage, setStatusMessage] = useState("");

  const persistDraft = () => {
    const draft = {
      category: selectedCategory,
      contactName: displayName,
      contactEmail: user?.email || "",
    };
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  };

  const handleContinue = () => {
    persistDraft();
    navigate("/lost/zone");
  };

  const handleSaveDraft = () => {
    persistDraft();
    setStatusMessage("Draft saved. You can complete it later.");
  };

  return (
    <div className="post-lost-page">
      <NavBar
        icon="search"
        links={[
          { label: "Dashboard", to: "/home" },
          { label: "Report Lost", to: "/lost", active: true },
          { label: "Report Found", to: "/found" },
          { label: "Smart Matches", to: "/matches" },
        ]}
        rightContent={
          <>
            <button className="rc-navbar-icon-btn" aria-label="Notifications">
              <span className="material-icons">notifications_none</span>
            </button>
            <UserBadge />
          </>
        }
      />

      <main className="lost-shell">
        <section className="lost-head">
          <span className="step-chip">Step 1 of 2</span>
          <h1>What did you lose?</h1>
          <p>
            Select the item type to start your report. This helps us match your
            report with found items more accurately.
          </p>
        </section>

        <section className="progress-panel">
          <div className="progress-labels two-step">
            <span>Category</span>
            <span>Details & Submit</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: "50%" }} />
          </div>
        </section>

        <section className="category-grid">
          {categories.map((category) => (
            <button
              key={category.label}
              className={`category-card ${
                selectedCategory === category.label ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(category.label)}
            >
              <div className="category-icon">
                <span className="material-icons">{category.icon}</span>
              </div>
              <div className="category-text">
                <strong>{category.label}</strong>
                <small>{category.hint}</small>
              </div>
            </button>
          ))}
        </section>

        <section className="info-note">
          <span className="material-icons">info</span>
          <p>
            Selected: <strong>{selectedCategory}</strong>. Add specific details
            in the next step, such as color, brand, and identifying marks.
          </p>
        </section>

        {statusMessage && <p className="lost-alert success">{statusMessage}</p>}

        <div className="action-bar">
          <Link to="/home" className="btn-ghost">
            <span className="material-icons">arrow_back</span>
            Cancel
          </Link>

          <div className="action-right">
            <button className="btn-ghost" onClick={handleSaveDraft}>
              Save Draft
            </button>
            <button className="btn-primary" onClick={handleContinue}>
              Continue
              <span className="material-icons">arrow_forward</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReportLost;
