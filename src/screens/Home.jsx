import "../styles/home.css";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="home-page">
      <nav className="navbar">
        <div className="navbar-left">
          <div className="logo-icon">
            <span className="material-icons-outlined">location_searching</span>
          </div>
          <span className="logo-text">Reclaima</span>
        </div>
        <div className="navbar-right">
          <button className="icon-btn">
            <span className="material-icons-outlined">notifications</span>
          </button>
          <div className="divider"></div>
          <button className="user-btn">
            <img
              className="user-img"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-a4k-dzglr3WR5xOMK6lpSWTCp2cum41llRNSt_XpifFfqGpXcCh5EpqdAkZUHfeYrKWHRPeHCmW5TFCBIRM9T9zvvJqVydGPOdxSSjfjj1qdvI4RT6XR6DkcxS7mfTShf2LR1kfnCNCvjSK3-CyLptvg1roEw5V5ORXfKXaGu4dLI41oWrUkba2SYToworuTgrE1IidJPnW3qy7Bj3nIzLquvr-9nbnXeFY2Ps-rAUKoS9StOkheJEwpiiNLqWD0NBcjwHEkTYUy"
              alt="User Profile"
            />
            <span className="user-name">Alex Rivera</span>
            <span className="material-icons-outlined">expand_more</span>
          </button>
        </div>
      </nav>

      <main className="main-content">
        <div className="welcome-msg">
          <h1>Hello, Alex</h1>
          <p>What would you like to do today?</p>
        </div>

        <div className="action-grid">
          <Link to="/lost" className="action-card">
            <div className="card-topbar"></div>
            <div className="card-icon">
              <span className="material-icons-outlined">search</span>
            </div>
            <h2>I Lost an Item</h2>
            <p>
              Post details about your missing property so the community can
              help you find it.
            </p>
            <div className="card-link">
              Report Lost Item
              <span className="material-icons-outlined">arrow_forward</span>
            </div>
          </Link>

          <Link to="/found" className="action-card">
            <div className="card-topbar"></div>
            <div className="card-icon">
              <span className="material-icons-outlined">add_box</span>
            </div>
            <h2>I Found an Item</h2>
            <p>
              Report an item you've discovered on campus to reunite it with its
              owner.
            </p>
            <div className="card-link">
              Report Found Item
              <span className="material-icons-outlined">arrow_forward</span>
            </div>
          </Link>
        </div>

        <div className="secondary-cta">
          <Link to="/matches">
            <span className="material-icons-outlined">view_list</span>
            Browse all recently reported items
            <span className="material-icons-outlined">open_in_new</span>
          </Link>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-links">
          <a href="#">How it works</a>
          <a href="#">Campus Safety</a>
          <a href="#">Support</a>
        </div>
        <p>© 2024 Reclaima University Platform</p>
      </footer>
    </div>
  );
};

export default Home;
