import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavBar from "../NavBar";
import {
  getUserDisplayName,
  notifyAuthUserChanged,
  useAuthUser,
} from "../../hooks/useAuthUser";
import userIcon from "../../assets/user-icon.png";
import itemPlaceholder from "../../assets/default-image.png";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const ACCOUNT_DELETION_EMAIL = "onlineapplications34@gmail.com";

function getAuthToken() {
  try {
    return localStorage.getItem("authToken") || "";
  } catch {
    return "";
  }
}

function buildAuthHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload.message || "Request failed");
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

async function fetchReportedItems(email) {
  const response = await fetch(`${API_BASE}/api/items`);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || "Unable to load reported items.");
  }

  const normalizedEmail = String(email || "").trim().toLowerCase();
  return (payload.items || []).filter((item) => {
    const itemEmail = String(item?.contactEmail || "").trim().toLowerCase();
    return normalizedEmail && itemEmail === normalizedEmail;
  });
}

function formatDate(value) {
  if (!value) return "Not available";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Not available";
  return parsed.toLocaleDateString();
}

function getInitials(user) {
  const first = String(user?.firstName || "").trim();
  const last = String(user?.lastName || "").trim();
  const fallback = String(user?.email || "U").trim();

  if (first || last) {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  }

  return fallback.slice(0, 2).toUpperCase();
}

function getProfileCompletion(profile, itemCount) {
  const fields = [
    profile?.firstName,
    profile?.lastName,
    profile?.phone,
    profile?.campus,
    profile?.email,
  ];
  const completed = fields.filter((value) => String(value || "").trim()).length;
  const bonus = itemCount > 0 ? 1 : 0;
  return Math.min(100, Math.round(((completed + bonus) / 6) * 100));
}

function buildDeletionMailtoUrl(profile, reason) {
  const supportEmail = ACCOUNT_DELETION_EMAIL;
  const fullName = [profile?.firstName, profile?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  const subject = "Account deletion request";
  const bodyLines = [
    "Hello Reclaima team,",
    "",
    "I would like to request deletion of my account.",
    "",
    `Name: ${fullName || "Not provided"}`,
    `Email: ${profile?.email || "Not provided"}`,
    `Reason: ${reason || "No reason provided."}`,
    "",
    "Please confirm once the request has been processed.",
  ];

  return `mailto:${encodeURIComponent(supportEmail)}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(bodyLines.join("\n"))}`;
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
  const navigate = useNavigate();
  const [profile, setProfile] = useState(user || null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    campus: "",
    receiveMatchEmails: true,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState("");
  const [passwordFeedback, setPasswordFeedback] = useState("");
  const [deletionReason, setDeletionReason] = useState("");
  const [deletionSaving, setDeletionSaving] = useState(false);
  const [deletionFeedback, setDeletionFeedback] = useState("");
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const authEmail = String(user?.email || profile?.email || "").trim().toLowerCase();

  useEffect(() => {
    let mounted = true;
    const token = getAuthToken();

    if (!token) {
      navigate("/signin", { replace: true });
      return () => {
        mounted = false;
      };
    }

    setLoading(true);
    setProfileFeedback("");
    setPasswordFeedback("");
    setDeletionFeedback("");

    Promise.all([
      fetchJson(`${API_BASE}/api/auth/me`, {
        headers: {
          ...buildAuthHeaders(),
        },
      }).catch((error) => {
        if (error.status === 401) {
          throw error;
        }
        return null;
      }),
      fetchReportedItems(authEmail),
    ])
      .then(([profilePayload, reportedItems]) => {
        if (!mounted) return;

        if (profilePayload?.user) {
          setProfile(profilePayload.user);
          setFormData({
            firstName: profilePayload.user.firstName || "",
            lastName: profilePayload.user.lastName || "",
            phone: profilePayload.user.phone || "",
            campus: profilePayload.user.campus || "",
            receiveMatchEmails: profilePayload.user.receiveMatchEmails !== false,
          });

          try {
            localStorage.setItem("authUser", JSON.stringify(profilePayload.user));
          } catch {
            // Ignore storage issues and keep the session in memory.
          }
          notifyAuthUserChanged();
        }

        setItems(reportedItems);
      })
      .catch((error) => {
        if (!mounted) return;
        if (error.status === 401) {
          try {
            localStorage.removeItem("authToken");
            localStorage.removeItem("authUser");
          } catch {
            // Ignore storage issues during sign-out fallback.
          }
          notifyAuthUserChanged();
          navigate("/signin", { replace: true });
          return;
        }
        setProfileFeedback("Unable to load your profile right now.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [navigate, authEmail]);

  const displayName = useMemo(() => getUserDisplayName(profile), [profile]);
  const reportedItems = useMemo(
    () =>
      [...items].sort((a, b) => {
        const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      }),
    [items],
  );
  const recentItems = reportedItems.slice(0, 3);

  const profileCompletion = useMemo(
    () => getProfileCompletion(profile, reportedItems.length),
    [profile, reportedItems.length],
  );

  const handleLogout = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
    }
    notifyAuthUserChanged();
    navigate("/signin", { replace: true });
  };

  const handleProfileChange = (event) => {
    const { name, value, type, checked } = event.target;
    const nextValue = type === "checkbox" ? checked : value;

    setFormData((current) => ({
      ...current,
      [name]: nextValue,
    }));

    setProfileErrors((current) => {
      if (!current[name]) {
        return current;
      }
      const nextErrors = { ...current };
      delete nextErrors[name];
      return nextErrors;
    });
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((current) => ({
      ...current,
      [name]: value,
    }));

    setPasswordErrors((current) => {
      if (!current[name]) {
        return current;
      }
      const nextErrors = { ...current };
      delete nextErrors[name];
      return nextErrors;
    });
  };

  const handleDeletionReasonChange = (event) => {
    setDeletionReason(event.target.value);
    setDeletionFeedback("");
  };

  const validateProfileForm = () => {
    const errors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required.";
    }
    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required.";
    }
    if (formData.phone.trim() && !/^[+()\-\d\s]{7,30}$/.test(formData.phone.trim())) {
      errors.phone = "Enter a valid phone number.";
    }

    return errors;
  };

  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordForm.currentPassword) {
      errors.currentPassword = "Current password is required.";
    }
    if (!passwordForm.newPassword) {
      errors.newPassword = "New password is required.";
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters.";
    }
    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = "Please confirm your new password.";
    } else if (passwordForm.confirmPassword !== passwordForm.newPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    return errors;
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileFeedback("");

    const validationErrors = validateProfileForm();
    if (Object.keys(validationErrors).length > 0) {
      setProfileErrors(validationErrors);
      return;
    }

    setProfileErrors({});
    setProfileSaving(true);

    try {
      const payload = await fetchJson(`${API_BASE}/api/auth/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...buildAuthHeaders(),
        },
        body: JSON.stringify({
          ...formData,
          receiveMatchEmails: formData.receiveMatchEmails,
        }),
      });

      if (payload.user) {
        setProfile(payload.user);
        setFormData({
          firstName: payload.user.firstName || "",
          lastName: payload.user.lastName || "",
          phone: payload.user.phone || "",
          campus: payload.user.campus || "",
          receiveMatchEmails: payload.user.receiveMatchEmails !== false,
        });

        try {
          localStorage.setItem("authUser", JSON.stringify(payload.user));
        } catch {
          // Ignore storage failures.
        }

        notifyAuthUserChanged();
      }

      setProfileFeedback(payload.message || "Profile updated successfully.");
    } catch (error) {
      if (error.status === 401) {
        handleLogout();
        return;
      }
      setProfileFeedback(
        error.payload?.message || "Unable to save your profile right now.",
      );
      setProfileErrors(error.payload?.errors || {});
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordFeedback("");

    const validationErrors = validatePasswordForm();
    if (Object.keys(validationErrors).length > 0) {
      setPasswordErrors(validationErrors);
      return;
    }

    setPasswordErrors({});
    setPasswordSaving(true);

    try {
      const payload = await fetchJson(`${API_BASE}/api/auth/change-password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...buildAuthHeaders(),
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword,
        }),
      });

      setPasswordFeedback(payload.message || "Password updated successfully.");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      if (error.status === 401) {
        handleLogout();
        return;
      }
      setPasswordFeedback(
        error.payload?.message || "Unable to update your password right now.",
      );
      setPasswordErrors(error.payload?.errors || {});
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleAccountDeletionRequest = async (event) => {
    event.preventDefault();
    setDeletionFeedback("");
    setDeletionSaving(true);
    const trimmedReason = deletionReason.trim();
    const mailtoUrl = buildDeletionMailtoUrl(profile, trimmedReason);

    try {
      const payload = await fetchJson(
        `${API_BASE}/api/auth/request-account-deletion`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...buildAuthHeaders(),
          },
          body: JSON.stringify({
            reason: trimmedReason,
          }),
        },
      );

      setDeletionFeedback(payload.message || "Your deletion request has been sent.");
      setDeletionReason("");
    } catch (error) {
      if (error.status === 401) {
        handleLogout();
        return;
      }

      try {
        window.location.href = mailtoUrl;
        setDeletionFeedback(
          "We opened your email app with a prefilled deletion request to onlineapplications34@gmail.com. Please send it to complete the request.",
        );
        setDeletionReason("");
      } catch {
        setDeletionFeedback(
          error.payload?.message || "Unable to send your deletion request right now.",
        );
      }
    } finally {
      setDeletionSaving(false);
    }
  };

  const handleResetChanges = () => {
    setFormData({
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      phone: profile?.phone || "",
      campus: profile?.campus || "",
      receiveMatchEmails: profile?.receiveMatchEmails !== false,
    });
    setProfileErrors({});
    setProfileFeedback("");
  };

  return (
    <div className="profile-page">
      <ProfileNavbar />

      <main className="profile-main-shell">
        <section className="profile-hero">
          <div className="profile-hero-copy">
            <span className="profile-eyebrow">Account settings</span>
            <h1>{displayName}</h1>
            <p>
              Keep the details that matter for lost-and-found operations up to
              date so people can reach you when a match is found.
            </p>
            <div className="profile-pill-row">
              <span className="profile-pill">
                <span className="material-icons">mail</span>
                {profile?.email || "Email not available"}
              </span>
              <span className="profile-pill">
                <span className="material-icons">event</span>
                {profile?.emailVerified ? "Email verified" : "Email unverified"}
              </span>
            </div>
          </div>

          <div className="profile-avatar-card">
            <div className="profile-avatar-ring">
              <div className="profile-avatar-core">
                <span>{getInitials(profile)}</span>
              </div>
            </div>
            <div className="profile-avatar-meta">
              <strong>{displayName}</strong>
              <span>{profile?.campus || "Campus not set"}</span>
            </div>
            <div className="profile-completion">
              <div className="profile-completion-head">
                <span>Useful contact fields</span>
                <strong>{profileCompletion}%</strong>
              </div>
              <div className="profile-completion-bar">
                <span style={{ width: `${profileCompletion}%` }} />
              </div>
            </div>
          </div>
        </section>

        <section className="profile-metrics">
          <article className="metric-card">
            <span className="material-icons">hub</span>
            <div>
              <small>Reported Items</small>
              <strong>{reportedItems.length}</strong>
            </div>
          </article>
          <article className="metric-card">
            <span className="material-icons">call</span>
            <div>
              <small>Contact Phone</small>
              <strong>{profile?.phone || "Add phone"}</strong>
            </div>
          </article>
          <article className="metric-card">
            <span className="material-icons">pin_drop</span>
            <div>
              <small>Campus</small>
              <strong>{profile?.campus || "Add your campus"}</strong>
            </div>
          </article>
          <article className="metric-card">
            <span className="material-icons">verified_user</span>
            <div>
              <small>Account</small>
              <strong>{profile?.emailVerified ? "Verified" : "Pending"}</strong>
            </div>
          </article>
        </section>

        <section className="profile-grid">
          <div className="profile-column">
            <section className="profile-card">
              <header className="profile-card-head">
                <div>
                  <span className="profile-card-kicker">Identity</span>
                  <h2>Personal details</h2>
                </div>
                <button className="profile-link-btn" type="button" onClick={handleResetChanges}>
                  Reset
                </button>
              </header>

              <form className="profile-form" onSubmit={handleProfileSubmit} noValidate>
                <div className="profile-form-grid">
                  <Field
                    label="First name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleProfileChange}
                    error={profileErrors.firstName}
                    icon="person"
                    placeholder="Your first name"
                  />
                  <Field
                    label="Last name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleProfileChange}
                    error={profileErrors.lastName}
                    icon="person"
                    placeholder="Your last name"
                  />
                  <Field
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleProfileChange}
                    error={profileErrors.phone}
                    icon="call"
                    placeholder="Optional phone number"
                  />
                  <Field
                    label="Campus"
                    name="campus"
                    value={formData.campus}
                    onChange={handleProfileChange}
                    error={profileErrors.campus}
                    icon="map"
                    placeholder="Main campus or residence"
                  />
                </div>

                <label className="profile-switch">
                  <input
                    type="checkbox"
                    name="receiveMatchEmails"
                    checked={formData.receiveMatchEmails}
                    onChange={handleProfileChange}
                  />
                  <span>
                    Send me match alerts and important account emails.
                  </span>
                </label>

                {profileFeedback ? <p className="form-feedback">{profileFeedback}</p> : null}

                <div className="profile-actions">
                  <button
                    type="button"
                    className="profile-btn"
                    onClick={handleResetChanges}
                    disabled={profileSaving}
                  >
                    Discard
                  </button>
                  <button type="submit" className="profile-btn primary" disabled={profileSaving}>
                    {profileSaving ? "Saving..." : "Save profile"}
                    <span className="material-icons">save</span>
                  </button>
                </div>
              </form>
            </section>

            <section className="profile-card">
              <header className="profile-card-head">
                <div>
                  <span className="profile-card-kicker">Security</span>
                  <h2>Change password</h2>
                </div>
              </header>

              <form className="profile-form" onSubmit={handlePasswordSubmit} noValidate>
                <div className="profile-form-grid">
                  <PasswordField
                    label="Current password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    error={passwordErrors.currentPassword}
                    visible={showCurrentPassword}
                    onToggle={() => setShowCurrentPassword((current) => !current)}
                  />
                  <PasswordField
                    label="New password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    error={passwordErrors.newPassword}
                    visible={showNewPassword}
                    onToggle={() => setShowNewPassword((current) => !current)}
                  />
                  <PasswordField
                    label="Confirm new password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    error={passwordErrors.confirmPassword}
                    visible={showConfirmPassword}
                    onToggle={() => setShowConfirmPassword((current) => !current)}
                  />
                </div>

                <p className="profile-note">
                  Use at least 8 characters. A stronger password makes your account
                  easier to protect.
                </p>

                {passwordFeedback ? <p className="form-feedback">{passwordFeedback}</p> : null}

                <div className="profile-actions">
                  <button
                    type="button"
                    className="profile-btn"
                    onClick={() =>
                      setPasswordForm({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      })
                    }
                    disabled={passwordSaving}
                  >
                    Clear
                  </button>
                  <button type="submit" className="profile-btn primary" disabled={passwordSaving}>
                    {passwordSaving ? "Updating..." : "Update password"}
                    <span className="material-icons">lock_reset</span>
                  </button>
                </div>
              </form>
            </section>

            <section className="profile-card">
              <header className="profile-card-head">
                <div>
                  <span className="profile-card-kicker">Overview</span>
                  <h2>Account snapshot</h2>
                </div>
              </header>

              <div className="profile-snapshot">
                <SnapshotRow label="Email" value={profile?.email || "Not set"} />
                <SnapshotRow
                  label="Name"
                  value={displayName || "Not set"}
                />
                <SnapshotRow label="Phone" value={profile?.phone || "Not set"} />
                <SnapshotRow label="Campus" value={profile?.campus || "Not set"} />
                <SnapshotRow
                  label="Visibility"
                  value={profile?.receiveMatchEmails ? "Match alerts on" : "Match alerts off"}
                />
              </div>

              <div className="profile-logout">
                <button type="button" className="profile-logout-btn" onClick={handleLogout}>
                  Sign out of this device
                </button>
              </div>
            </section>
            <section className="profile-card profile-deletion-card">
              <header className="profile-card-head">
                <div>
                  <span className="profile-card-kicker">Account removal</span>
                  <h2>Delete your account</h2>
                </div>
              </header>

              <form className="profile-form" onSubmit={handleAccountDeletionRequest} noValidate>
                <p className="profile-note">
                  Account deletion is handled by the support team. When you submit
                  this request, we email{" "}
                  <a href={`mailto:${ACCOUNT_DELETION_EMAIL}`}>{ACCOUNT_DELETION_EMAIL}</a>{" "}
                  with your account details and optional reason.
                </p>

                <div className="profile-field">
                  <label className="profile-field-label" htmlFor="deletion-reason">
                    Optional reason
                  </label>
                  <div className="profile-textarea-wrap">
                    <span className="material-icons">note_alt</span>
                    <textarea
                      id="deletion-reason"
                      value={deletionReason}
                      onChange={handleDeletionReasonChange}
                      placeholder="Tell us why you'd like to delete your account"
                      maxLength={500}
                    />
                  </div>
                  <div className="profile-field-meta">
                    <span className="profile-field-hint">
                      This helps the support team confirm the request.
                    </span>
                    <span className="profile-field-count">
                      {deletionReason.length}/500
                    </span>
                  </div>
                </div>

                {deletionFeedback ? <p className="form-feedback">{deletionFeedback}</p> : null}

                <div className="profile-actions deletion-actions">
                  <a className="profile-btn" href={`mailto:${ACCOUNT_DELETION_EMAIL}`}>
                    Email support directly
                  </a>
                  <button
                    type="submit"
                    className="profile-btn danger"
                    disabled={deletionSaving}
                  >
                    {deletionSaving ? "Sending..." : "Request deletion"}
                    <span className="material-icons">delete_forever</span>
                  </button>
                </div>
              </form>
            </section>
          </div>

          <div className="profile-column">
            <section className="profile-card">
              <header className="profile-card-head">
                <div>
                  <span className="profile-card-kicker">My items</span>
                  <h2>Quick status</h2>
                </div>
                <Link className="profile-link-btn" to="/home">
                  Dashboard
                </Link>
              </header>

              <div className="profile-summary">
                <div className="profile-summary-tile">
                  <span className="material-icons">inventory_2</span>
                  <strong>{reportedItems.length}</strong>
                  <small>Reported items</small>
                </div>
                <div className="profile-summary-tile">
                  <span className="material-icons">travel_explore</span>
                  <strong>{reportedItems.filter((item) => item.type === "lost").length}</strong>
                  <small>Lost posts</small>
                </div>
                <div className="profile-summary-tile">
                  <span className="material-icons">redeem</span>
                  <strong>{reportedItems.filter((item) => item.type === "found").length}</strong>
                  <small>Found posts</small>
                </div>
              </div>

              {loading ? (
                <p className="profile-muted">Loading recent items...</p>
              ) : recentItems.length === 0 ? (
                <div className="profile-empty profile-empty-tight">
                  <span className="material-icons">inventory_2</span>
                  <p>No reported items yet. Start with a lost or found post.</p>
                </div>
              ) : (
                <div className="profile-mini-list">
                  {recentItems.map((item) => (
                    <article
                      className="profile-mini-item"
                      key={item._id || `${item.title}-${item.createdAt}`}
                    >
                      <img
                        src={item.photoUrl || itemPlaceholder}
                        alt={item.title || "Reported item"}
                      />
                      <div>
                        <div className="profile-mini-head">
                          <strong>{item.title || "Untitled report"}</strong>
                          <span>{formatDate(item.createdAt)}</span>
                        </div>
                        <p>{item.location || item.zone || "Location not provided"}</p>
                        <small>
                          {(item.type || "item").toUpperCase()} • {item.status || "open"}
                        </small>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="profile-card profile-help-card">
              <header className="profile-card-head">
                <div>
                  <span className="profile-card-kicker">Need help?</span>
                  <h2>Helpful shortcuts</h2>
                </div>
              </header>

              <div className="profile-help-grid">
                <Link className="profile-help-item" to="/lost">
                  <span className="material-icons">search</span>
                  <div>
                    <strong>Post a lost item</strong>
                    <p>Add details so others can spot it faster.</p>
                  </div>
                </Link>
                <Link className="profile-help-item" to="/found">
                  <span className="material-icons">inventory_2</span>
                  <div>
                    <strong>Post a found item</strong>
                    <p>Log a found item and help return it safely.</p>
                  </div>
                </Link>
                <Link className="profile-help-item" to="/help">
                  <span className="material-icons">support_agent</span>
                  <div>
                    <strong>Open support</strong>
                    <p>Get help with account or item questions.</p>
                  </div>
                </Link>
              </div>

              <div className="profile-help-note">
                <span className="material-icons">tips_and_updates</span>
                <p>
                  Keep your phone and campus updated so finders and campus staff
                  can contact you quickly.
                </p>
              </div>
            </section>
          </div>
        </section>
      </main>

      <ProfileFooter />
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  error,
  icon,
  placeholder,
}) {
  return (
    <div className="profile-field">
      <label className="profile-field-label" htmlFor={`profile-${name}`}>
        {label}
      </label>
      <div className="profile-input-wrap">
        <span className="material-icons">{icon}</span>
        <input
          id={`profile-${name}`}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      </div>
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}

function PasswordField({
  label,
  name,
  value,
  onChange,
  error,
  visible,
  onToggle,
}) {
  return (
    <div className="profile-field">
      <label className="profile-field-label" htmlFor={`profile-${name}`}>
        {label}
      </label>
      <div className="profile-input-wrap password">
        <span className="material-icons">lock</span>
        <input
          id={`profile-${name}`}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={label}
        />
        <button
          type="button"
          className="profile-icon-btn"
          onClick={onToggle}
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
        >
          <span className="material-icons">
            {visible ? "visibility_off" : "visibility"}
          </span>
        </button>
      </div>
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}

function SnapshotRow({ label, value }) {
  return (
    <div className="snapshot-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function ProfileFooter() {
  return (
    <footer className="footer">© 2026 University Lost & Found Platform</footer>
  );
}
