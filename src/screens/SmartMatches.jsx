import "../styles/SmartMatches.css";
import MatchCard from "../components/smart-matches/MatchCard";
import NavBar from "../components/NavBar";
import laptopCarrier from "../assets/laptop-carrier.webp";
import paddedBag from "../assets/padded-bag.jpg";
import techBag from "../assets/tech-bag.jpg";

export default function SmartMatches() {
  const matches = [
    {
      image: laptopCarrier,
      title: "Blue Laptop Carrier",
      category: "Bags and Carriers",
      location: "Engineering Library, Floor 2",
      date: "Feb 18, 2026 • 10:15 AM",
      confidence: 98,
      status: "High confidence",
    },
    {
      image: paddedBag,
      title: "Dark Blue Padded Bag",
      category: "Bags and Carriers",
      location: "Student Union Cafeteria",
      date: "Feb 18, 2026 • 2:30 PM",
      confidence: 75,
      status: "Review suggested",
    },
    {
      image: techBag,
      title: "Tech Backpack, Navy",
      category: "Backpacks",
      location: "Bio-Tech Lab Corridor",
      date: "Feb 17, 2026 • 9:00 AM",
      confidence: 92,
      status: "High confidence",
    },
  ];

  return (
    <div className="smart-matches-page">
      <NavBar
        icon="search"
        links={[
          { label: "Dashboard", to: "/home" },
          { label: "My Lost Items", to: "/matches", active: true },
          { label: "Campus Map", to: "/lost/zone" },
        ]}
        rightContent={
          <>
            <button className="rc-navbar-icon-btn" aria-label="Notifications">
              <span className="material-icons">notifications</span>
            </button>
            <div className="avatar">
              <img src="https://via.placeholder.com/100" alt="profile" />
            </div>
          </>
        }
      />

      <main className="matches-shell">
        <header className="matches-header">
          <h1>Smart Matches</h1>
          <p>
            12 possible matches for <strong>Blue Laptop Bag</strong>
          </p>
        </header>

        <section className="matches-summary">
          <article>
            <small>Total Matches</small>
            <strong>12</strong>
          </article>
          <article>
            <small>High Confidence</small>
            <strong>5</strong>
          </article>
          <article>
            <small>New Today</small>
            <strong>3</strong>
          </article>
        </section>

        <section className="matches-filters">
          <input type="text" placeholder="Search by keyword or location" />
          <select defaultValue="all-zones">
            <option value="all-zones">All Campus Zones</option>
            <option value="library">Main Library</option>
            <option value="student-union">Student Union</option>
            <option value="science">Science Building</option>
          </select>
          <select defaultValue="7-days">
            <option value="24-hours">Last 24 hours</option>
            <option value="7-days">Last 7 days</option>
            <option value="30-days">Last 30 days</option>
          </select>
          <button className="reset-filter-btn">Reset</button>
        </section>

        <div className="matches-results-head">
          <h2>Recommended Results</h2>
          <span>Sorted by confidence</span>
        </div>

        <section className="matches-grid">
          {matches.map((item) => (
            <MatchCard key={item.title} {...item} />
          ))}
        </section>
      </main>

      <footer className="footer">
        <p>© 2026 Reclaima University Lost & Found</p>
      </footer>
    </div>
  );
}
