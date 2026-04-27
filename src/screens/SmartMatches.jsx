import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SmartMatches.css";
import MatchCard from "../components/smart-matches/MatchCard";
import NavBar from "../components/NavBar";
import UserBadge from "../components/UserBadge";
import { useAuthUser } from "../hooks/useAuthUser";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

async function fetchMatches(email) {
  const response = await fetch(
    `${API_BASE}/api/items/matches?email=${encodeURIComponent(email)}`,
  );
  if (!response.ok) {
    throw new Error("Request failed");
  }
  return response.json();
}

export default function SmartMatches() {
  const user = useAuthUser();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [lostCount, setLostCount] = useState(0);
  const [foundCount, setFoundCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleViewItem = (item) => {
    const itemId = String(item?._id || item?.id || "").trim();
    if (!itemId) return;
    navigate(`/item/${itemId}`);
  };

  const handleMessageFinder = (item) => {
    const itemId = String(item?._id || item?.id || "").trim();
    navigate("/chat/new", {
      state: {
        item: itemId ? { ...item, _id: itemId, id: itemId } : item,
      },
    });
  };

  useEffect(() => {
    let mounted = true;
    const email = (user?.email || "").trim();

    if (!email) {
      setMatches([]);
      setLostCount(0);
      setFoundCount(0);
      setLoading(false);
      return () => {
        mounted = false;
      };
    }

    setLoading(true);
    setError("");

    fetchMatches(email)
      .then((data) => {
        if (!mounted) return;
        setMatches(data.matches || []);
        setLostCount(data.lostCount || 0);
        setFoundCount(data.foundCount || 0);
      })
      .catch(() => {
        if (mounted) setError("Unable to load matches right now.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [user?.email]);

  const headerText = useMemo(() => {
    if (lostCount === 0) {
      return "Report a lost item to unlock smart matches.";
    }
    if (matches.length) {
      return `${matches.length} possible match${matches.length === 1 ? "" : "es"} for your reported items`;
    }
    return "We will show matches once your lost item reports align with found items.";
  }, [lostCount, matches.length]);

  const showGate = !loading && !error && lostCount === 0;

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
            <UserBadge />
          </>
        }
      />

      <main className="matches-shell">
        <header className="matches-header">
          <h1>Smart Matches</h1>
          <p>{headerText}</p>
        </header>

        <section className="matches-summary">
          <article>
            <small>Total Matches</small>
            <strong>{matches.length}</strong>
          </article>
          <article>
            <small>Lost Reports</small>
            <strong>{lostCount}</strong>
          </article>
          <article>
            <small>Found Candidates</small>
            <strong>{foundCount}</strong>
          </article>
        </section>

        {showGate ? (
          <section className="matches-gate">
            <div>
              <h2>Report a lost item to see matches</h2>
              <p>
                Once you submit a lost item, we will automatically compare it
                against found reports and show potential matches here.
              </p>
            </div>
            <button
              className="matches-gate-btn"
              onClick={() => navigate("/lost")}
            >
              Report Lost Item
            </button>
          </section>
        ) : (
          <>
            <div className="matches-results-head">
              <h2>Recommended Results</h2>
              <span>Sorted by newest reports</span>
            </div>

            {loading ? (
              <p className="matches-muted">Loading matches...</p>
            ) : error ? (
              <p className="matches-muted">{error}</p>
            ) : matches.length === 0 ? (
              <p className="matches-muted">No matches yet.</p>
            ) : (
              <section className="matches-grid">
                {matches.map((item) => {
                  const itemId = String(item?._id || item?.id || "").trim();

                  return (
                    <MatchCard
                      key={itemId || `${item.title}-${item.createdAt}`}
                      itemId={itemId}
                      image={item.photoUrl}
                      title={item.title || "Untitled report"}
                      category={item.category || "General"}
                      location={item.location || item.zone || "No location"}
                      date={
                        item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString()
                          : ""
                      }
                      confidence={95}
                      status={
                        item.matchSource?.title
                          ? `Matched to ${item.matchSource.title}`
                          : "Potential match"
                      }
                      onViewItem={() => handleViewItem(item)}
                      onMessageFinder={() => handleMessageFinder(item)}
                    />
                  );
                })}
              </section>
            )}
          </>
        )}
      </main>

      <footer className="footer">
        <p>© 2026 Reclaima University Lost & Found</p>
      </footer>
    </div>
  );
}
