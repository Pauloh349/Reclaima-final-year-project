import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import UserBadge from "../components/UserBadge";
import "../styles/admin-dashboard.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const numberFormat = new Intl.NumberFormat("en-US");

function formatNumber(value) {
  if (typeof value !== "number") return "0";
  return numberFormat.format(value);
}

async function fetchJson(path) {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

async function downloadReport(path, filename) {
  const response = await fetch(`${API_BASE}${path}`);
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

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [summary, setSummary] = useState([]);
  const [rangeDays, setRangeDays] = useState(30);
  const [reportDays, setReportDays] = useState(90);
  const [itemType, setItemType] = useState("all");
  const [summaryFormat, setSummaryFormat] = useState("csv");
  const [itemsFormat, setItemsFormat] = useState("csv");
  const [usersFormat, setUsersFormat] = useState("csv");
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoadingOverview(true);
    fetchJson("/api/admin/overview")
      .then((data) => {
        if (mounted) setOverview(data);
      })
      .catch(() => {
        if (mounted) setError("Unable to load admin overview.");
      })
      .finally(() => {
        if (mounted) setLoadingOverview(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoadingSummary(true);
    fetchJson(`/api/admin/reports/summary?days=${rangeDays}`)
      .then((data) => {
        if (mounted) setSummary(data.rows || []);
      })
      .catch(() => {
        if (mounted) setError("Unable to load activity summary.");
      })
      .finally(() => {
        if (mounted) setLoadingSummary(false);
      });

    return () => {
      mounted = false;
    };
  }, [rangeDays]);

  const chartData = useMemo(() => {
    if (!summary.length) return [];
    return summary.slice(-14);
  }, [summary]);

  const maxChartValue = useMemo(() => {
    return chartData.reduce(
      (max, row) => Math.max(max, row.totalItems || 0),
      0,
    );
  }, [chartData]);

  const itemsByType = overview?.itemsByType || [];
  const itemsByStatus = overview?.itemsByStatus || [];
  const recentItems = overview?.recentItems || [];

  const handleDownload = async (kind) => {
    try {
      setDownloading(kind);
      if (kind === "summary") {
        await downloadReport(
          `/api/admin/reports/summary?days=${rangeDays}&format=${summaryFormat}`,
          `reclaima-summary-${rangeDays}d.${summaryFormat}`,
        );
      }
      if (kind === "items") {
        await downloadReport(
          `/api/admin/reports/items?days=${reportDays}&type=${itemType}&format=${itemsFormat}`,
          `reclaima-items-${itemType}-${reportDays}d.${itemsFormat}`,
        );
      }
      if (kind === "users") {
        await downloadReport(
          `/api/admin/reports/users?days=${reportDays}&format=${usersFormat}`,
          `reclaima-users-${reportDays}d.${usersFormat}`,
        );
      }
    } catch (err) {
      setError("Download failed. Please try again.");
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
          { label: "Overview", to: "/admin", active: true },
          { label: "User Dashboard", to: "/home" },
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
              Monitor user activity, lost and found reports, and generate
              compliance-ready exports.
            </p>
            <div className="admin-hero-actions">
              <label className="admin-format">
                Format
                <select
                  value={summaryFormat}
                  onChange={(event) => setSummaryFormat(event.target.value)}
                >
                  <option value="csv">CSV</option>
                  <option value="pdf">PDF</option>
                </select>
              </label>
              <button
                className="admin-primary"
                onClick={() => handleDownload("summary")}
                disabled={downloading === "summary"}
              >
                {downloading === "summary"
                  ? "Preparing..."
                  : "Download Summary"}
                <span className="material-icons">download</span>
              </button>
              <a className="admin-ghost" href="#reports">
                View Reports
              </a>
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
              <h2>Activity Trend</h2>
              <select
                value={rangeDays}
                onChange={(event) => setRangeDays(Number(event.target.value))}
              >
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 14 days</option>
                <option value={30}>Last 30 days</option>
                <option value={60}>Last 60 days</option>
              </select>
            </header>
            {loadingSummary ? (
              <p className="admin-muted">Loading activity...</p>
            ) : (
              <div className="admin-chart">
                {chartData.map((row) => (
                  <div key={row.date} className="admin-chart-bar">
                    <div
                      className="admin-chart-fill"
                      style={{
                        height: maxChartValue
                          ? `${Math.max((row.totalItems / maxChartValue) * 100, 8)}%`
                          : "8%",
                      }}
                    />
                    <span>{row.date.slice(5)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="admin-chart-legend">
              <span>Items created per day</span>
              <strong>
                {formatNumber(
                  summary.reduce(
                    (total, row) => total + (row.totalItems || 0),
                    0,
                  ),
                )}
              </strong>
            </div>
          </div>
        </section>

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
                      <span>{item.location || item.zone || "No location"}</span>
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

        <section id="reports" className="admin-panel admin-reports">
          <header>
            <h2>Reports & Exports</h2>
            <span className="admin-muted">
              Generate audit-ready exports for compliance and analytics.
            </span>
          </header>

          <div className="admin-report-grid">
            <div className="admin-report-card">
              <div>
                <h3>Summary Report</h3>
                <p>Daily lost & found totals and new user registrations.</p>
                <div className="admin-report-controls">
                  <label>
                    Format
                    <select
                      value={summaryFormat}
                      onChange={(event) => setSummaryFormat(event.target.value)}
                    >
                      <option value="csv">CSV</option>
                      <option value="pdf">PDF</option>
                    </select>
                  </label>
                </div>
              </div>
              <button
                className="admin-primary"
                onClick={() => handleDownload("summary")}
                disabled={downloading === "summary"}
              >
                {downloading === "summary" ? "Preparing..." : "Download"}
                <span className="material-icons">download</span>
              </button>
            </div>

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
                  <label>
                    Format
                    <select
                      value={itemsFormat}
                      onChange={(event) => setItemsFormat(event.target.value)}
                    >
                      <option value="csv">CSV</option>
                      <option value="pdf">PDF</option>
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
      </main>
    </div>
  );
};

export default AdminDashboard;
