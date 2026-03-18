import { useEffect, useMemo, useState } from "react";
import "../styles/home.css";
import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import UserBadge from "../components/UserBadge";
import { getUserDisplayName, useAuthUser } from "../hooks/useAuthUser";
import placeholderImage from "../assets/default-image.png";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString();
}

const Home = () => {
  const user = useAuthUser();
  const displayName = useMemo(() => getUserDisplayName(user), [user]);
  const [summary, setSummary] = useState({
    lostCount: 0,
    foundCount: 0,
    openCount: 0,
    recentItems: [],
  });
  const [matchCount, setMatchCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const email = (user?.email || "").trim();

    if (!email) {
      setSummary({
        lostCount: 0,
        foundCount: 0,
        openCount: 0,
        recentItems: [],
      });
      setMatchCount(0);
      setLoading(false);
      return () => {
        mounted = false;
      };
    }

    setLoading(true);
    setError("");

    Promise.all([
      fetch(`${API_BASE}/api/items/summary?email=${encodeURIComponent(email)}`)
        .then((response) => {
          if (!response.ok) throw new Error("summary");
          return response.json();
        })
        .catch(() => null),
      fetch(`${API_BASE}/api/items/matches?email=${encodeURIComponent(email)}`)
        .then((response) => {
          if (!response.ok) throw new Error("matches");
          return response.json();
        })
        .catch(() => null),
    ])
      .then(([summaryPayload, matchesPayload]) => {
        if (!mounted) return;
        if (summaryPayload) {
          setSummary({
            lostCount: summaryPayload.lostCount || 0,
            foundCount: summaryPayload.foundCount || 0,
            openCount: summaryPayload.openCount || 0,
            recentItems: summaryPayload.recentItems || [],
          });
        }
        if (matchesPayload) {
          setMatchCount((matchesPayload.matches || []).length || 0);
        }
        if (!summaryPayload && !matchesPayload) {
          setError("Unable to load dashboard data right now.");
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [user?.email]);

  return (
    <div className="home-page">
      <NavBar
        icon="location_searching"
        links={[
          { label: "Dashboard", to: "/home", active: true },
          { label: "Smart Matches", to: "/matches" },        ]}
        rightContent={
          <>
            <button className="rc-navbar-icon-btn" aria-label="Notifications">
              <span className="material-icons">notifications</span>
            </button>
            <UserBadge showChevron />
          </>
        }
      />

      <main className="home-shell">
        <section className="home-hero">
          <div className="hero-copy">
            <span className="eyebrow">Dashboard</span>
            <h1>Welcome back, {displayName}</h1>
            <p>
              Track your reported items, check matches, and keep conversations
              moving with finders.
            </p>
          </div>
          <div className="hero-actions">
            <Link to="/matches" className="hero-cta primary">
              View Smart Matches
              <span className="material-icons">arrow_forward</span>
            </Link>
            <Link to="/messages" className="hero-cta ghost">
              Open Messages
              <span className="material-icons">chat</span>
            </Link>
          </div>
        </section>

        <section className="home-stats">
          <article>
            <div>
              <small>Lost Reports</small>
              <strong>{summary.lostCount}</strong>
            </div>
            <span className="stat-icon material-icons">search</span>
          </article>
          <article>
            <div>
              <small>Found Reports</small>
              <strong>{summary.foundCount}</strong>
            </div>
            <span className="stat-icon material-icons">inventory_2</span>
          </article>
          <article>
            <div>
              <small>Open Cases</small>
              <strong>{summary.openCount}</strong>
            </div>
            <span className="stat-icon material-icons">fact_check</span>
          </article>
          <article>
            <div>
              <small>Possible Matches</small>
              <strong>{matchCount}</strong>
            </div>
            <span className="stat-icon material-icons">hub</span>
          </article>
        </section>

        <section className="home-grid">
          <div className="home-actions">
            <header>
              <h2>Quick Actions</h2>
              <p>Launch the most common tasks with a single click.</p>
            </header>
            <div className="action-cards">
              <Link to="/lost" className="action-card">
                <div>
                  <span className="material-icons">search</span>
                  <h3>Report Lost Item</h3>
                </div>
                <p>Describe what you lost and where it might be.</p>
              </Link>
              <Link to="/found" className="action-card">
                <div>
                  <span className="material-icons">inventory_2</span>
                  <h3>Report Found Item</h3>
                </div>
                <p>Log a found item and help reunite it quickly.</p>
              </Link>
              <Link to="/messages" className="action-card">
                <div>
                  <span className="material-icons">forum</span>
                  <h3>Messages Inbox</h3>
                </div>
                <p>Reply to finders and coordinate safe pickups.</p>
              </Link>
              <Link to="/matches" className="action-card">
                <div>
                  <span className="material-icons">assistant</span>
                  <h3>Smart Matches</h3>
                </div>
                <p>Review recommended matches based on your reports.</p>
              </Link>
            </div>
          </div>

          <div className="home-activity">
            <header>
              <h2>Recent Activity</h2>
              <p>Latest reports tied to your account.</p>
            </header>
            {loading ? (
              <p className="matches-muted">Loading activity...</p>
            ) : error ? (
              <p className="matches-muted">{error}</p>
            ) : summary.recentItems.length === 0 ? (
              <p className="matches-muted">No recent items yet.</p>
            ) : (
              <div className="activity-list">
                {summary.recentItems.map((item) => (
                  <div key={item.id} className="activity-card">
                    <img
                      src={item.photoUrl || placeholderImage}
                      alt={item.title || "Item"}
                    />
                    <div>
                      <div className="activity-head">
                        <h3>{item.title || "Untitled"}</h3>
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                      <p>{item.location || "Location not provided"}</p>
                      <span className="activity-tag">
                        {item.type ? item.type.toUpperCase() : "ITEM"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-links">
          <Link to="/how-it-works">How it works</Link>
          <Link to="/terms">Campus Safety</Link>
          <Link to="/help">Support</Link>
        </div>
        <p>© 2026 Reclaima University Platform</p>
      </footer>
    </div>
  );
};

export default Home;

