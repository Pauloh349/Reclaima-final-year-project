import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "../NavBar";
import { getUserDisplayName, useAuthUser } from "../../hooks/useAuthUser";
import userIcon from "../../assets/user-icon.png";
import itemPlaceholder from "../../assets/default-image.png";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

async function fetchItems() {
  const response = await fetch(`${API_BASE}/api/items`);
  if (!response.ok) {
    throw new Error("Request failed");
  }
  const data = await response.json();
  return data.items || [];
}

export function ProfileNavbar() {
  const user = useAuthUser();
  const displayName = getUserDisplayName(user);

  return (
    <NavBar
      icon="reorder"
      links={[
        { label: "Dashboard", to: "/home" },
        { label: "Browse Items", to: "/matches" },
        { label: "Profile", to: "/profile", active: true },
      ]}
      rightContent={
        <Link className="rc-navbar-user" to="/profile">
          <img src={userIcon} alt="User" />
          <span>{displayName}</span>
        </Link>
      }
    />
  );
}

export function Content() {
  const user = useAuthUser();
  const displayName = getUserDisplayName(user);
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [itemsError, setItemsError] = useState("");

  useEffect(() => {
    let mounted = true;
    const email = (user?.email || "").trim().toLowerCase();

    if (!email) {
      setItems([]);
      setLoadingItems(false);
      return () => {
        mounted = false;
      };
    }

    setLoadingItems(true);
    setItemsError("");

    fetchItems()
      .then((data) => {
        if (!mounted) return;
        const filtered = data.filter((item) => {
          const itemEmail = String(item?.contactEmail || "")
            .trim()
            .toLowerCase();
          return itemEmail && itemEmail === email;
        });
        setItems(filtered);
      })
      .catch(() => {
        if (mounted) setItemsError("Unable to load reported items.");
      })
      .finally(() => {
        if (mounted) setLoadingItems(false);
      });

    return () => {
      mounted = false;
    };
  }, [user?.email]);

  const reportedItems = useMemo(
    () =>
      [...items].sort((a, b) => {
        const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      }),
    [items],
  );

  return (
    <div className="profile-simple">
      <section className="simple-card profile-head">
        <img className="profile-avatar" src={userIcon} alt="Profile" />
        <div className="profile-main">
          <h1>{displayName}</h1>
          <p>{user?.email || ""}</p>
          <span className="simple-chip">Verified Student</span>
        </div>
        <button className="simple-btn primary">Edit</button>
      </section>

      <div className="profile-split">
        <div className="profile-left">
          <section className="simple-card">
            <h2>Account</h2>
            <div className="simple-list">
              <Row label="Student ID" value="202488319" />
              <Row label="Primary Campus" value="Main City Campus" />
              <Row label="Phone" value="+1 (555) 123-4567" />
              <Row label="Language" value="English" />
            </div>
          </section>

          <div className="simple-actions">
            <button className="simple-btn">Discard Changes</button>
            <button className="simple-btn primary">Save Changes</button>
          </div>
        </div>

        <div className="profile-right">
          <section className="simple-card">
            <h2>Reported Items</h2>
            <div className="report-grid">
              {loadingItems ? (
                <p className="profile-muted">Loading reported items...</p>
              ) : itemsError ? (
                <p className="profile-muted">{itemsError}</p>
              ) : reportedItems.length === 0 ? (
                <p className="profile-muted">No reported items</p>
              ) : (
                reportedItems.map((item) => (
                  <ReportedItemCard
                    key={item._id || `${item.title}-${item.createdAt}`}
                    title={item.title || "Untitled report"}
                    category={item.category || "General"}
                    status={[
                      item.type ? item.type.toUpperCase() : "ITEM",
                      item.status || "open",
                    ].join(" • ")}
                    meta={
                      item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : ""
                    }
                    location={item.location || item.zone || "No location"}
                    imageUrl={item.photoUrl || itemPlaceholder}
                  />
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="simple-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ReportedItemCard({
  title,
  category,
  status,
  meta,
  location,
  imageUrl,
}) {
  return (
    <article className="reported-card">
      <div className="reported-image">
        <img src={imageUrl} alt={title} loading="lazy" />
      </div>
      <div className="reported-body">
        <h3>{title}</h3>
        <p className="reported-category">{category}</p>
        <div className="reported-meta">
          <span className="material-icons">place</span>
          <span>{location}</span>
        </div>
        <p className="reported-status">
          {status}
          {meta ? ` · ${meta}` : ""}
        </p>
      </div>
    </article>
  );
}

export function ProfileFooter() {
  return (
    <footer className="footer">© 2026 University Lost & Found Platform</footer>
  );
}
