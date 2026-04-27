import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/ItemDetails.css";
import NavBar from "../components/NavBar";
import UserBadge from "../components/UserBadge";
import { DetailRow, MiniCard } from "../components/item-details/ItemCards";
import placeholderImage from "../assets/default-image.png";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

function formatDate(value) {
  if (!value) return "Date not provided";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date not provided";
  return date.toLocaleDateString();
}

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    if (!id) {
      setError("Missing item id.");
      setLoading(false);
      return () => {
        mounted = false;
      };
    }

    setLoading(true);
    setError("");

    fetch(`${API_BASE}/api/items/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Request failed");
        }
        return response.json();
      })
      .then((data) => {
        if (!mounted) return;
        setItem(data.item || null);
      })
      .catch(() => {
        if (mounted) setError("Unable to load item details right now.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  const handleMarkReturned = async () => {
    if (!id || updating) return;

    setUpdating(true);
    setUpdateMessage("");

    try {
      const returnMethod = item?.handoverMethod || "";
      const response = await fetch(`${API_BASE}/api/items/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "returned",
          returnMethod,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setUpdateMessage(payload.message || "Unable to update status.");
        return;
      }

      setItem(payload.item || item);
      setUpdateMessage("Marked as returned.");
    } catch {
      setUpdateMessage("Unable to update status.");
    } finally {
      setUpdating(false);
    }
  };

  const pageData = useMemo(() => {
    const title = item?.title || "Item";
    const category = item?.category || "Uncategorized";
    const description = item?.description || "No description provided.";
    const location = item?.location || item?.zone || "Location not provided";
    const dateFound = formatDate(item?.createdAt);
    const handover = item?.handoverMethod || "Not specified";
    const status = item?.status || "unknown";
    const image = item?.photoUrl || placeholderImage;
    const reporter = item?.contactName || item?.contactEmail || "Reported Finder";

    return {
      title,
      category,
      description,
      location,
      dateFound,
      handover,
      status,
      image,
      reporter,
    };
  }, [item]);

  const isReturned = pageData.status === "returned";

  const chatState = useMemo(() => {
    if (!item?._id) return {};
    const itemId = String(item._id);
    return {
      item: {
        ...item,
        _id: itemId,
        id: itemId,
      },
    };
  }, [item]);

  const handleStartClaim = () => {
    if (!item?._id) return;
    navigate("/chat/new", {
      state: {
        ...chatState,
        context: "claim",
      },
    });
  };

  const handleMessageFinder = () => {
    if (!item?._id) return;
    navigate("/chat/new", {
      state: {
        ...chatState,
        context: "message",
      },
    });
  };

  return (
    <div className="item-page">
      <NavBar
        icon="reorder"
        links={[
          { label: "Browse Lost Items", to: "/matches", active: true },
          { label: "Report Found", to: "/found" },
          { label: "My Claims", to: "/profile" },
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

      <main className="item-shell">
        <div className="item-breadcrumb">
          <span>Matches</span>
          <span className="material-icons">chevron_right</span>
          <span>{pageData.category}</span>
          <span className="material-icons">chevron_right</span>
          <strong>{pageData.title}</strong>
        </div>

        {loading ? (
          <p className="matches-muted">Loading item details...</p>
        ) : error ? (
          <p className="matches-muted">{error}</p>
        ) : !item ? (
          <p className="matches-muted">Item not found.</p>
        ) : (
          <section className="item-layout">
            <div className="item-primary">
              <div className="item-image-card">
                <img src={pageData.image} alt={pageData.title} />
                <span className="privacy-badge">
                  <span className="material-icons">visibility_off</span>
                  Privacy Protected
                </span>
              </div>

              <div className="item-description-card">
                <h2>Finder Description</h2>
                <p>{pageData.description}</p>

                <div className="tip-box">
                  <span className="material-icons">info</span>
                  <p>
                    Ownership is verified before release. Prepare unique details
                    when making a claim.
                  </p>
                </div>
              </div>
            </div>

            <aside className="item-side">
              <div className="summary-card">
                <span className="availability">
                  {pageData.status === "open" ? "Available" : pageData.status}
                </span>
                <h1>{pageData.title}</h1>

                <DetailRow
                  icon="category"
                  label="Category"
                  value={pageData.category}
                />
                <DetailRow
                  icon="location_on"
                  label="Found At"
                  value={pageData.location}
                />
                <DetailRow
                  icon="calendar_today"
                  label="Date Found"
                  value={pageData.dateFound}
                />
                <DetailRow
                  icon="handshake"
                  label="Return Method"
                  value={pageData.handover}
                />
              </div>

              <div className="action-card">
                <button
                  type="button"
                  className="btn-primary-action"
                  onClick={handleStartClaim}
                  disabled={!item}
                >
                  <span className="material-icons">task_alt</span>
                  Start Claim
                </button>
                <button
                  type="button"
                  className="btn-secondary-action"
                  onClick={handleMessageFinder}
                  disabled={!item}
                >
                  <span className="material-icons">forum</span>
                  Message Finder
                </button>
                <button
                  type="button"
                  className="btn-secondary-action"
                  onClick={handleMarkReturned}
                  disabled={isReturned || updating}
                >
                  <span className="material-icons">assignment_turned_in</span>
                  {isReturned ? "Returned" : "Mark as Returned"}
                </button>
                {updateMessage ? (
                  <p className="action-note">{updateMessage}</p>
                ) : (
                  <p className="action-note">
                    False claims may lead to account restrictions.
                  </p>
                )}
              </div>

              <div className="reporter-card">
                <span className="material-icons">person</span>
                <div>
                  <small>Reported by</small>
                  <strong>{pageData.reporter}</strong>
                </div>
              </div>
            </aside>
          </section>
        )}
      </main>

      <footer className="item-footer">
        © 2026 University Lost and Found Platform
      </footer>
    </div>
  );
}
