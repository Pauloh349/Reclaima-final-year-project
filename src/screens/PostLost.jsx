import "../styles/report-lost.css";
import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";

const ReportLost = () => {
  const categories = [
    { icon: "badge", label: "ID or Badge", hint: "Student, staff, access cards" },
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
            <Link className="rc-navbar-user" to="/profile">
              <img
                className="user-img"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVnnIZidPG0NxJvltEEQIIuFqM-14w9vVJ6oM9NYpx7EAyvqxO1Z_HamEGZM6J2VG20mdcUfkv_Y9ze_5bwOlxpqBOTwHy5Rbv6Z_Aw6jHV6CJqPGN0OMG8JWR8XuiPSgNGn0QeGXiMChtz9i3tw8i2MRAyaPC7CMM7wgQQoTimHxz1PIQ9qAvngQYknDeXTIwqdjv5BT8LW2HLGyq_2tN_0EjgIMKr6GM1Yx1wubtD8S3yHL5EAkzzVmTvozD0_MQP1Pdh__g4Rgs"
                alt="User Avatar"
              />
              <span>Alex Rivera</span>
            </Link>
          </>
        }
      />

      <main className="lost-shell">
        <section className="lost-head">
          <span className="step-chip">Step 1 of 4</span>
          <h1>What did you lose?</h1>
          <p>
            Select the item type to start your report. This helps us match your
            report with found items more accurately.
          </p>
        </section>

        <section className="progress-panel">
          <div className="progress-labels">
            <span>Category</span>
            <span>Details</span>
            <span>Location</span>
            <span>Review</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" />
          </div>
        </section>

        <section className="category-grid">
          {categories.map((category, index) => (
            <button
              key={category.label}
              className={`category-card ${index === 0 ? "active" : ""}`}
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
            Add specific details in the next step, such as color, brand, and
            identifying marks.
          </p>
        </section>

        <div className="action-bar">
          <Link to="/home" className="btn-ghost">
            <span className="material-icons">arrow_back</span>
            Cancel
          </Link>

          <div className="action-right">
            <button className="btn-ghost">Save Draft</button>
            <Link to="/lost/zone" className="btn-primary">
              Continue
              <span className="material-icons">arrow_forward</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReportLost;
