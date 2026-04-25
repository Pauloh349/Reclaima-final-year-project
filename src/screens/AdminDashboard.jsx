import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import UserBadge from "../components/UserBadge";
import { getUserDisplayName, useAuthUser } from "../hooks/useAuthUser";
import "../styles/admin-dashboard.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const numberFormat = new Intl.NumberFormat("en-US");

function formatNumber(value) {
  if (typeof value !== "number") return "0";
  return numberFormat.format(value);
}

function getAuthToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("authToken") || "";
}

function buildAuthHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchJson(path) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: buildAuthHeaders(),
  });
  if (response.status === 401 || response.status === 403) {
    throw new Error("auth");
  }
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

async function downloadReport(path, filename) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: buildAuthHeaders(),
  });
  if (response.status === 401 || response.status === 403) {
    throw new Error("auth");
  }
  if (!response.ok) {
    throw new Error("Unable to download report.");
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function submitItemReport(payload) {
  const response = await fetch(`${API_BASE}/api/items/${payload.type}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Unable to create report.");
  }

  return response.json();
}

const AdminDashboard = () => {
  const adminUser = useAuthUser();
  const adminDisplayName = getUserDisplayName(adminUser);
  const [overview, setOverview] = useState(null);
  const [reportDays, setReportDays] = useState(90);
  const [itemType, setItemType] = useState("all");
  const [usersFormat, setUsersFormat] = useState("csv");
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [users, setUsers] = useState([]);
  const [userQuery, setUserQuery] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [roleDrafts, setRoleDrafts] = useState({});
  const [userAction, setUserAction] = useState("");
  const [userFeedback, setUserFeedback] = useState("");
  const [itemTypeDraft, setItemTypeDraft] = useState("found");
  const [itemTitle, setItemTitle] = useState("");
  const [itemCategory, setItemCategory] = useState("Phone");
  const [itemZone, setItemZone] = useState("Main Library");
  const [itemLocation, setItemLocation] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemContactName, setItemContactName] = useState("");
  const [itemContactEmail, setItemContactEmail] = useState("");
  const [itemContactPhone, setItemContactPhone] = useState("");
  const [itemHandover, setItemHandover] = useState("security");
  const [itemFeedback, setItemFeedback] = useState("");
  const [itemSubmitting, setItemSubmitting] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState("");

  useEffect(() => {
    setItemContactName((current) => current || adminDisplayName);
    setItemContactEmail((current) => current || adminUser?.email || "");
  }, [adminDisplayName, adminUser?.email]);

  useEffect(() => {
    let mounted = true;
    setLoadingOverview(true);
    fetchJson("/api/admin/overview")
      .then((data) => {
        if (mounted) setOverview(data);
      })
      .catch((err) => {
        if (!mounted) return;
        if (err?.message === "auth") {
          setError(
            "Admin access required. Please sign in with an admin account.",
          );
          return;
        }
        setError("Unable to load admin overview.");
      })
      .finally(() => {
        if (mounted) setLoadingOverview(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const loadUsers = async (query = "") => {
    setHasSearched(true);
    setLoadingUsers(true);
    setUserFeedback("");
    try {
      const qs = query ? `?query=${encodeURIComponent(query)}` : "";
      const data = await fetchJson(`/api/admin/users${qs}`);
      setUsers(data.users || []);
    } catch (err) {
      if (err?.message === "auth") {
        setError(
          "Admin access required. Please sign in with an admin account.",
        );
        return;
      }
      setUserFeedback("Unable to load users right now.");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleRoleUpdate = async (userId) => {
    const nextRole = roleDrafts[userId];
    if (!nextRole) return;
    setUserAction(userId);
    setUserFeedback("");
    try {
      const response = await fetch(
        `${API_BASE}/api/admin/users/${userId}/role`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...buildAuthHeaders(),
          },
          body: JSON.stringify({ role: nextRole }),
        },
      );

      if (response.status === 401 || response.status === 403) {
        throw new Error("auth");
      }

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.message || "Unable to update role.");
      }

      setUsers((current) =>
        current.map((user) =>
          user.id === userId
            ? { ...user, role: payload.user?.role || nextRole }
            : user,
        ),
      );
      setUserFeedback("Role updated successfully.");
    } catch (err) {
      if (err?.message === "auth") {
        setError(
          "Admin access required. Please sign in with an admin account.",
        );
      } else {
        setUserFeedback(err?.message || "Unable to update role right now.");
      }
    } finally {
      setUserAction("");
    }
  };

  const handleCreateItem = async () => {
    setItemFeedback("");

    if (!itemTitle.trim()) {
      setItemFeedback("Add a title before creating the report.");
      return;
    }

    if (!itemCategory.trim()) {
      setItemFeedback("Choose a category for the item.");
      return;
    }

    if (!itemZone.trim()) {
      setItemFeedback("Choose a campus zone for the item.");
      return;
    }

    if (!itemContactEmail.trim()) {
      setItemFeedback("Add a contact email for the report.");
      return;
    }

    const payload = {
      type: itemTypeDraft,
      title: itemTitle.trim(),
      category: itemCategory.trim(),
      zone: itemZone.trim(),
      location: itemLocation.trim(),
      description: itemDescription.trim(),
      contactName: itemContactName.trim(),
      contactEmail: itemContactEmail.trim(),
      contactPhone: itemContactPhone.trim(),
      handoverMethod: itemHandover,
    };

    try {
      setItemSubmitting(true);
      await submitItemReport(payload);
      setItemFeedback("Item added successfully.");
      setItemTitle("");
      setItemLocation("");
      setItemDescription("");
      setItemContactName(adminDisplayName);
      setItemContactEmail(adminUser?.email || "");
      setItemContactPhone("");
      setItemTypeDraft("found");
      setItemHandover("security");
      setIsCreateModalOpen(false);
    } catch {
      setItemFeedback("Unable to add the item right now.");
    } finally {
      setItemSubmitting(false);
    }
  };

  const itemsByType = overview?.itemsByType || [];
  const itemsByStatus = overview?.itemsByStatus || [];
  const recentItems = overview?.recentItems || [];

  const handleDownload = async (kind) => {
    try {
      setDownloading(kind);
      if (kind === "items") {
        await downloadReport(
          `/api/admin/reports/items?days=${reportDays}&type=${itemType}&format=csv`,
          `reclaima-items-${itemType}-${reportDays}d.csv`,
        );
      }
      if (kind === "users") {
        await downloadReport(
          `/api/admin/reports/users?days=${reportDays}&format=${usersFormat}`,
          `reclaima-users-${reportDays}d.${usersFormat}`,
        );
      }
    } catch (err) {
      if (err?.message === "auth") {
        setError(
          "Admin access required. Please sign in with an admin account.",
        );
      } else {
        setError("Download failed. Please try again.");
      }
    } finally {
      setDownloading("");
    }
  };

  return (
    <div className="admin-page">
      <NavBar
        icon="verified"
        logoText="Reclaima Admin"
        logoTo="/admin"
        links={[
          { label: "Overview", to: "#overview", active: true },
          { label: "Users", to: "#users" },
          { label: "Reports", to: "#reports" },
        ]}
        rightContent={
          <>
            <button className="rc-navbar-icon-btn" aria-label="Alerts">
              <span className="material-icons">notifications</span>
            </button>
            <UserBadge showChevron />
          </>
        }
      />

      <main className="admin-shell">
        <section className="admin-hero">
          <div>
            <span className="admin-eyebrow">System Control</span>
            <h1>Administrative Overview</h1>
            <p>
              Monitor user activity, add lost or found items on behalf of the
              team, and generate compliance-ready exports.
            </p>
            <div className="admin-hero-actions">
              <a className="admin-ghost" href="#reports">
                View Reports
              </a>
              <button
                className="admin-ghost admin-ghost-strong"
                type="button"
                onClick={() => {
                  setItemFeedback("");
                  setIsCreateModalOpen(true);
                }}
              >
                Add Item
                <span className="material-icons">add</span>
              </button>
            </div>
          </div>
          <div className="admin-hero-card">
            <div>
              <h3>Last Sync</h3>
              <p>
                {overview?.generatedAt
                  ? new Date(overview.generatedAt).toLocaleString()
                  : "--"}
              </p>
            </div>
            <div>
              <span className="material-icons">shield</span>
              <p>Admin access verified</p>
            </div>
          </div>
        </section>

        {error && <div className="admin-alert">{error}</div>}

        <section id="overview" className="admin-zone admin-zone-overview">
          <div className="admin-zone-head">
            <div>
              <span className="admin-eyebrow">Overview</span>
              <h2>Platform snapshot</h2>
              <p className="admin-muted">
                Stay on top of activity, inventory, and moderation signals at a
                glance.
              </p>
            </div>
          </div>

          <section className="admin-metrics">
            <article className="admin-metric-card">
              <span>Registered Users</span>
              <strong>{formatNumber(overview?.totals?.users)}</strong>
              <small>
                {formatNumber(overview?.activity?.newUsersLast30Days)} new in 30
                days
              </small>
            </article>
            <article className="admin-metric-card">
              <span>Total Reports</span>
              <strong>{formatNumber(overview?.totals?.items)}</strong>
              <small>
                {formatNumber(overview?.activity?.newItemsLast7Days)} new in 7
                days
              </small>
            </article>
            <article className="admin-metric-card">
              <span>Open Cases</span>
              <strong>
                {formatNumber(
                  itemsByStatus.find((item) => item._id === "open")?.count || 0,
                )}
              </strong>
              <small>Resolution queue</small>
            </article>
            <article className="admin-metric-card">
              <span>Smart Matches</span>
              <strong>{formatNumber(overview?.matches?.total || 0)}</strong>
              <small>Pending review</small>
            </article>
          </section>

          <section className="admin-grid">
            <div className="admin-panel">
              <header>
                <h2>Items Overview</h2>
                <div className="admin-pill">Live</div>
              </header>
              <div className="admin-breakdown">
                {itemsByType.length === 0 ? (
                  <p className="admin-muted">No item data yet.</p>
                ) : (
                  itemsByType.map((item) => (
                    <div key={item._id} className="admin-breakdown-row">
                      <span>{item._id || "Unspecified"}</span>
                      <strong>{formatNumber(item.count)}</strong>
                    </div>
                  ))
                )}
              </div>
              <div className="admin-breakdown">
                {itemsByStatus.length === 0
                  ? null
                  : itemsByStatus.map((item) => (
                      <div key={item._id} className="admin-breakdown-row">
                        <span>{item._id || "Unknown"} status</span>
                        <strong>{formatNumber(item.count)}</strong>
                      </div>
                    ))}
              </div>
            </div>

            <div className="admin-panel">
              <header>
                <h2>Quick Activity</h2>
                <span className="admin-muted">Recent system signals</span>
              </header>
              <div className="admin-breakdown">
                <div className="admin-breakdown-row">
                  <span>New users in 30 days</span>
                  <strong>
                    {formatNumber(overview?.activity?.newUsersLast30Days)}
                  </strong>
                </div>
                <div className="admin-breakdown-row">
                  <span>New items in 7 days</span>
                  <strong>
                    {formatNumber(overview?.activity?.newItemsLast7Days)}
                  </strong>
                </div>
                <div className="admin-breakdown-row">
                  <span>Recent reports</span>
                  <strong>{formatNumber(recentItems.length)}</strong>
                </div>
              </div>
            </div>
          </section>
        </section>

        <section id="users" className="admin-zone admin-zone-users">
          <div className="admin-zone-head">
            <div>
              <span className="admin-eyebrow">Users</span>
              <h2>Access and moderation</h2>
              <p className="admin-muted">
                Search accounts, adjust admin access, or lock users who are
                misusing the platform.
              </p>
            </div>
          </div>

          <section className="admin-panel admin-access">
            <header>
              <h2>User Access</h2>
              <span className="admin-muted">
                Manage admin permissions for staff and moderation actions for
                users.
              </span>
            </header>

            <div className="admin-access-controls">
              <div className="admin-access-search">
                <input
                  type="search"
                  placeholder="Search by name or email"
                  value={userQuery}
                  onChange={(event) => setUserQuery(event.target.value)}
                />
                <button
                  className="admin-primary"
                  onClick={() => loadUsers(userQuery)}
                  disabled={loadingUsers}
                >
                  {loadingUsers ? "Searching..." : "Search"}
                </button>
              </div>
              <button
                className="admin-ghost"
                onClick={() => {
                  setUserQuery("");
                  loadUsers("");
                }}
                disabled={loadingUsers}
              >
                Clear
              </button>
            </div>

            {userFeedback ? (
              <div className="admin-alert">{userFeedback}</div>
            ) : null}

            {!hasSearched ? (
              <p className="admin-muted">
                Search to look up a user by name or email.
              </p>
            ) : loadingUsers ? (
              <p className="admin-muted">Loading users...</p>
            ) : users.length === 0 ? (
              <p className="admin-muted">No users found.</p>
            ) : (
              <div className="admin-access-list">
                {users.map((user) => {
                  const displayName =
                    `${user.firstName || ""} ${user.lastName || ""}`.trim();
                  const draftRole = roleDrafts[user.id] || user.role || "user";
                  const lockLabel = user.accountLocked ? "Unlock" : "Lock";
                  const lockState = user.accountLocked ? "Locked" : "Active";
                  return (
                    <div key={user.id} className="admin-access-row">
                      <div className="admin-user-info">
                        <div className="admin-user-title">
                          <strong
                            className={
                              user.accountLocked
                                ? "admin-user-name is-locked"
                                : "admin-user-name"
                            }
                          >
                            {displayName || "Unnamed user"}
                          </strong>
                          <span
                            className={`admin-status-pill ${user.accountLocked ? "is-locked" : "is-active"}`}
                          >
                            {lockState}
                          </span>
                        </div>
                        <span className="admin-muted">
                          {user.email || "No email"}
                        </span>
                        {user.accountLocked && user.accountLockReason ? (
                          <span className="admin-user-note">
                            {user.accountLockReason}
                          </span>
                        ) : null}
                      </div>
                      <div className="admin-access-actions">
                        <select
                          value={draftRole}
                          onChange={(event) =>
                            setRoleDrafts((current) => ({
                              ...current,
                              [user.id]: event.target.value,
                            }))
                          }
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          className="admin-primary"
                          onClick={() => handleRoleUpdate(user.id)}
                          disabled={userAction === user.id}
                        >
                          {userAction === user.id ? "Updating..." : "Update"}
                        </button>
                        <button
                          className="admin-ghost admin-lock-btn"
                          onClick={() => {
                            const locked = !user.accountLocked;
                            const reason = locked
                              ? window.prompt(
                                  `Lock ${displayName || user.email || "this user"}? Add a short reason.`,
                                  "Misuse of the platform.",
                                )
                              : "";
                            if (locked && reason === null) return;
                            setUserAction(user.id);
                            setUserFeedback("");
                            fetch(
                              `${API_BASE}/api/admin/users/${user.id}/lock`,
                              {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                  ...buildAuthHeaders(),
                                },
                                body: JSON.stringify({
                                  locked,
                                  reason: reason || "",
                                }),
                              },
                            )
                              .then(async (response) => {
                                if (
                                  response.status === 401 ||
                                  response.status === 403
                                ) {
                                  throw new Error("auth");
                                }
                                const payload = await response
                                  .json()
                                  .catch(() => ({}));
                                if (!response.ok) {
                                  throw new Error(
                                    payload.message ||
                                      "Unable to update account lock.",
                                  );
                                }
                                setUsers((current) =>
                                  current.map((entry) =>
                                    entry.id === user.id
                                      ? payload.user || {
                                          ...entry,
                                          accountLocked: locked,
                                          accountLockReason: reason || "",
                                        }
                                      : entry,
                                  ),
                                );
                                setUserFeedback(payload.message);
                              })
                              .catch((err) => {
                                if (err?.message === "auth") {
                                  setError(
                                    "Admin access required. Please sign in with an admin account.",
                                  );
                                } else {
                                  setUserFeedback(
                                    err?.message ||
                                      "Unable to update account lock right now.",
                                  );
                                }
                              })
                              .finally(() => {
                                setUserAction("");
                              });
                          }}
                          disabled={userAction === user.id}
                        >
                          {lockLabel}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </section>

        <section id="reports" className="admin-zone admin-zone-reports">
          <div className="admin-zone-head">
            <div>
              <span className="admin-eyebrow">Reports</span>
              <h2>Exports and recent reports</h2>
              <p className="admin-muted">
                Generate audit-ready exports and review the newest entries
                without scrolling through a heavy dashboard.
              </p>
            </div>
          </div>

          <section className="admin-panel admin-recent">
            <header>
              <h2>Latest Reports</h2>
              <span className="admin-muted">
                Newest reports across the system
              </span>
            </header>
            {loadingOverview ? (
              <p className="admin-muted">Loading latest items...</p>
            ) : (
              <div className="admin-recent-grid">
                {recentItems.length === 0 ? (
                  <p className="admin-muted">No recent items yet.</p>
                ) : (
                  recentItems.map((item) => (
                    <article key={item._id} className="admin-recent-card">
                      <div>
                        <h3>{item.title || "Untitled report"}</h3>
                        <p>
                          {item.type || "Item"} · {item.category || "General"}
                        </p>
                      </div>
                      <div className="admin-recent-meta">
                        <span>
                          {item.location || item.zone || "No location"}
                        </span>
                        <span>
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString()
                            : ""}
                        </span>
                      </div>
                    </article>
                  ))
                )}
              </div>
            )}
          </section>

          <section className="admin-panel admin-reports">
            <header>
              <h2>Reports & Exports</h2>
              <span className="admin-muted">
                Generate audit-ready exports for compliance and analytics.
              </span>
            </header>

            <div className="admin-report-grid">
              <div className="admin-report-card">
                <div>
                  <h3>Items Report</h3>
                  <p>Export reports with status, location, and metadata.</p>
                  <div className="admin-report-controls">
                    <label>
                      Type
                      <select
                        value={itemType}
                        onChange={(event) => setItemType(event.target.value)}
                      >
                        <option value="all">All</option>
                        <option value="lost">Lost</option>
                        <option value="found">Found</option>
                      </select>
                    </label>
                    <label>
                      Range
                      <select
                        value={reportDays}
                        onChange={(event) =>
                          setReportDays(Number(event.target.value))
                        }
                      >
                        <option value={30}>30 days</option>
                        <option value={90}>90 days</option>
                        <option value={180}>180 days</option>
                        <option value={365}>365 days</option>
                      </select>
                    </label>
                  </div>
                </div>
                <button
                  className="admin-primary"
                  onClick={() => handleDownload("items")}
                  disabled={downloading === "items"}
                >
                  {downloading === "items" ? "Preparing..." : "Download"}
                  <span className="material-icons">download</span>
                </button>
              </div>

              <div className="admin-report-card">
                <div>
                  <h3>Users Report</h3>
                  <p>Full roster of registered users for audits.</p>
                  <div className="admin-report-controls">
                    <label>
                      Format
                      <select
                        value={usersFormat}
                        onChange={(event) => setUsersFormat(event.target.value)}
                      >
                        <option value="csv">CSV</option>
                        <option value="pdf">PDF</option>
                      </select>
                    </label>
                  </div>
                </div>
                <button
                  className="admin-primary"
                  onClick={() => handleDownload("users")}
                  disabled={downloading === "users"}
                >
                  {downloading === "users" ? "Preparing..." : "Download"}
                  <span className="material-icons">download</span>
                </button>
              </div>
            </div>
          </section>
        </section>

        {isCreateModalOpen ? (
          <div
            className="admin-modal-backdrop"
            role="presentation"
            onClick={() => setIsCreateModalOpen(false)}
          >
            <section
              className="admin-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="admin-create-title"
              onClick={(event) => event.stopPropagation()}
            >
              <header className="admin-modal-head">
                <div>
                  <span className="admin-eyebrow">Quick entry</span>
                  <h2 id="admin-create-title">Add Item</h2>
                  <p className="admin-muted">
                    Create a lost or found report without leaving the dashboard.
                  </p>
                </div>
                <button
                  type="button"
                  className="admin-modal-close"
                  onClick={() => setIsCreateModalOpen(false)}
                  aria-label="Close add item form"
                >
                  <span className="material-icons">close</span>
                </button>
              </header>

              <div className="admin-form-grid admin-modal-grid">
                <label>
                  Item Type
                  <select
                    value={itemTypeDraft}
                    onChange={(event) => setItemTypeDraft(event.target.value)}
                  >
                    <option value="found">Found</option>
                    <option value="lost">Lost</option>
                  </select>
                </label>

                <label>
                  Title
                  <input
                    type="text"
                    placeholder="e.g., Black Lenovo Laptop"
                    value={itemTitle}
                    onChange={(event) => setItemTitle(event.target.value)}
                  />
                </label>

                <label>
                  Category
                  <select
                    value={itemCategory}
                    onChange={(event) => setItemCategory(event.target.value)}
                  >
                    <option value="ID or Badge">ID or Badge</option>
                    <option value="Phone">Phone</option>
                    <option value="Wallet">Wallet</option>
                    <option value="Keys">Keys</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Other">Other</option>
                  </select>
                </label>

                <label>
                  Campus Zone
                  <select
                    value={itemZone}
                    onChange={(event) => setItemZone(event.target.value)}
                  >
                    <option value="Main Library">Main Library</option>
                    <option value="Hostels">Hostels</option>
                    <option value="Cafeteria">Cafeteria</option>
                    <option value="Science Complex">Science Complex</option>
                  </select>
                </label>

                <label>
                  Specific Location
                  <input
                    type="text"
                    placeholder="e.g., Front desk"
                    value={itemLocation}
                    onChange={(event) => setItemLocation(event.target.value)}
                  />
                </label>

                <label className="admin-form-full">
                  Description
                  <textarea
                    rows="3"
                    placeholder="Color, brand, identifying marks"
                    value={itemDescription}
                    onChange={(event) => setItemDescription(event.target.value)}
                  />
                </label>

                <label>
                  Contact Name
                  <input
                    type="text"
                    value={itemContactName}
                    onChange={(event) => setItemContactName(event.target.value)}
                  />
                </label>

                <label>
                  Contact Email
                  <input
                    type="email"
                    value={itemContactEmail}
                    onChange={(event) =>
                      setItemContactEmail(event.target.value)
                    }
                  />
                </label>

                <label>
                  Contact Phone
                  <input
                    type="tel"
                    value={itemContactPhone}
                    onChange={(event) =>
                      setItemContactPhone(event.target.value)
                    }
                  />
                </label>

                <label className="admin-form-full">
                  Handover Method
                  <div className="admin-form-toggle">
                    <button
                      type="button"
                      className={itemHandover === "security" ? "active" : ""}
                      onClick={() => setItemHandover("security")}
                    >
                      Security Office
                    </button>
                    <button
                      type="button"
                      className={itemHandover === "public" ? "active" : ""}
                      onClick={() => setItemHandover("public")}
                    >
                      Public Meeting
                    </button>
                  </div>
                </label>
              </div>

              {itemFeedback ? (
                <div className="admin-alert">{itemFeedback}</div>
              ) : null}

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-ghost"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="admin-primary"
                  type="button"
                  onClick={handleCreateItem}
                  disabled={itemSubmitting}
                >
                  {itemSubmitting ? "Adding..." : "Add Item"}
                  <span className="material-icons">add</span>
                </button>
              </div>
            </section>
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default AdminDashboard;
