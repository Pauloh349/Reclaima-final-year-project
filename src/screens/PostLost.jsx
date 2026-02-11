import "../styles/report-lost.css";
import { Link } from "react-router-dom";

const ReportLost = () => {
  return (
    <div className="post-lost-page">
      <nav className="navbar">
        <div className="nav-container">
          <div className="navbar-left">
            <div className="logo-icon">
              <span className="material-icons">search</span>
            </div>
            <span className="logo-text">Reclaima</span>
          </div>
          <div className="navbar-right">
            <button className="icon-btn">
              <span className="material-icons">notifications_none</span>
            </button>
            <div className="user-info">
              <div className="user-text">
                <p>Alex Rivera</p>
                <p className="user-id">Student ID: 202409</p>
              </div>
              <img
                className="user-img"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVnnIZidPG0NxJvltEEQIIuFqM-14w9vVJ6oM9NYpx7EAyvqxO1Z_HamEGZM6J2VG20mdcUfkv_Y9ze_5bwOlxpqBOTwHy5Rbv6Z_Aw6jHV6CJqPGN0OMG8JWR8XuiPSgNGn0QeGXiMChtz9i3tw8i2MRAyaPC7CMM7wgQQoTimHxz1PIQ9qAvngQYknDeXTIwqdjv5BT8LW2HLGyq_2tN_0EjgIMKr6GM1Yx1wubtD8S3yHL5EAkzzVmTvozD0_MQP1Pdh__g4Rgs"
                alt="User Avatar"
              />
            </div>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <div className="progress-section">
          <div className="progress-header">
            <span>Step 1 of 4</span>
            <span>25% Complete</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar"></div>
          </div>
          <div className="progress-steps">
            <div className="active">Category</div>
            <div>Details</div>
            <div>Location</div>
            <div>Review</div>
          </div>
        </div>

        <div className="page-header">
          <h1>What did you lose?</h1>
          <p>
            Select the category that best describes your missing item. This
            helps us match it faster with found reports.
          </p>
        </div>

        <div className="category-grid">
          <button className="category-card">
            <div className="category-icon">
              <span className="material-icons">badge</span>
            </div>
            <span>ID / Badge</span>
          </button>
          <button className="category-card">
            <div className="category-icon">
              <span className="material-icons">smartphone</span>
            </div>
            <span>Phone</span>
          </button>
          <button className="category-card">
            <div className="category-icon">
              <span className="material-icons">account_balance_wallet</span>
            </div>
            <span>Wallet</span>
          </button>
          <button className="category-card">
            <div className="category-icon">
              <span className="material-icons">vpn_key</span>
            </div>
            <span>Keys</span>
          </button>
          <button className="category-card">
            <div className="category-icon">
              <span className="material-icons">laptop_mac</span>
            </div>
            <span>Laptop</span>
          </button>
          <button className="category-card">
            <div className="category-icon">
              <span className="material-icons">add_circle_outline</span>
            </div>
            <span>Other</span>
          </button>
        </div>

        <div className="action-buttons">
          <Link to="/home" className="cancel-btn">
            <span className="material-icons">arrow_back</span>
            Cancel Report
          </Link>
          <Link to="/lost/zone" className="next-btn">
            Next Step
          </Link>
        </div>

        <div className="footer-help">
          <p>
            Not sure which to pick? <a href="#">Contact support</a> for
            assistance.
          </p>
        </div>
      </main>

      <div className="bg-circle top-right"></div>
      <div className="bg-circle bottom-left"></div>
    </div>
  );
};

export default ReportLost;
