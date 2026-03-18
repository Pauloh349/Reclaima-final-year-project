import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/ChatInbox.css";
import NavBar from "../components/NavBar";
import UserBadge from "../components/UserBadge";
import { useAuthUser } from "../hooks/useAuthUser";
import placeholderImage from "../assets/default-image.png";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function ChatInbox() {
  const user = useAuthUser();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationsLoaded, setNotificationsLoaded] = useState(false);

  const userId = user?.id ? String(user.id) : "";

  useEffect(() => {
    let mounted = true;

    if (!userId) {
      setChats([]);
      setLoading(false);
      return () => {
        mounted = false;
      };
    }

    setLoading(true);
    setError("");

    fetch(`${API_BASE}/api/chats?userId=${userId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Request failed");
        }
        return response.json();
      })
      .then((data) => {
        if (!mounted) return;
        setChats(data?.chats || []);
      })
      .catch(() => {
        if (mounted) setError("Unable to load chats right now.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [userId]);

  useEffect(() => {
    let mounted = true;

    if (!userId || notificationsLoaded) {
      return () => {
        mounted = false;
      };
    }

    fetch(`${API_BASE}/api/notifications?userId=${userId}&unread=true`)
      .then((response) => response.json())
      .then((data) => {
        if (!mounted) return;
        const count = Array.isArray(data?.notifications)
          ? data.notifications.length
          : 0;
        setNotificationCount(count);
        setNotificationsLoaded(true);
      })
      .catch(() => {
        if (mounted) setNotificationsLoaded(true);
      });

    return () => {
      mounted = false;
    };
  }, [API_BASE, notificationsLoaded, userId]);

  useEffect(() => {
    if (!userId) return undefined;

    const source = new EventSource(
      `${API_BASE}/api/notifications/stream?userId=${userId}`,
    );

    source.addEventListener("message", (event) => {
      try {
        const payload = JSON.parse(event.data || "{}");
        if (payload?.message) {
          const chatId = String(payload.chatId || "");
          if (chatId) {
            setChats((prev) => {
              const next = prev.map((chat) =>
                chat.id === chatId
                  ? {
                      ...chat,
                      lastMessage: payload.message,
                      lastMessageAt: payload.message.createdAt,
                    }
                  : chat,
              );
              const hasChat = next.some((chat) => chat.id === chatId);
              if (!hasChat) return prev;
              return [...next].sort((a, b) => {
                const aTime = a.lastMessageAt
                  ? new Date(a.lastMessageAt).getTime()
                  : 0;
                const bTime = b.lastMessageAt
                  ? new Date(b.lastMessageAt).getTime()
                  : 0;
                return bTime - aTime;
              });
            });
          }
          if (String(payload.message.senderId) !== String(userId)) {
            setNotificationCount((count) => count + 1);
          }
          return;
        }

        setNotificationCount((count) => count + 1);
      } catch {
        setNotificationCount((count) => count + 1);
      }
    });

    return () => {
      source.close();
    };
  }, [API_BASE, userId]);

  const messageLabel = (
    <span className="rc-navbar-link-label">
      Messages
      {notificationCount > 0 ? (
        <span className="rc-navbar-badge">{notificationCount}</span>
      ) : null}
    </span>
  );

  const headerText = useMemo(() => {
    if (!userId) return "Sign in to see your chats.";
    if (loading) return "Loading your conversations...";
    if (error) return error;
    if (!chats.length) return "No chats yet. Start from a smart match.";
    return `${chats.length} active conversation${chats.length === 1 ? "" : "s"}`;
  }, [chats.length, error, loading, userId]);

  return (
    <div className="chat-inbox-page">
      <NavBar
        icon="chat"
        links={[
          { label: "Dashboard", to: "/home" },
          { label: "Smart Matches", to: "/matches" },
          { label: messageLabel, to: "/messages", active: true },
        ]}
        rightContent={
          <>
            <button className="rc-navbar-icon-btn" aria-label="Notifications">
              <span className="material-icons">notifications</span>
              {notificationCount > 0 ? (
                <span className="rc-navbar-badge">{notificationCount}</span>
              ) : null}
            </button>
            <UserBadge />
          </>
        }
      />

      <main className="chat-inbox-shell">
        <header>
          <h1>Messages</h1>
          <p>{headerText}</p>
        </header>

        {loading ? (
          <p className="matches-muted">Loading chats...</p>
        ) : error ? (
          <p className="matches-muted">{error}</p>
        ) : chats.length === 0 ? (
          <p className="matches-muted">No chats yet.</p>
        ) : (
          <section className="chat-list">
            {chats.map((chat) => {
              const item = chat.item || {};
              const title = item.title || "Item";
              const location = item.location || item.zone || "Location";
              const image = item.photoUrl || placeholderImage;
              const lastText = chat.lastMessage?.text || "Start a conversation.";
              const lastTime = formatTime(chat.lastMessage?.createdAt);
              const linkState = chat.item ? { item: chat.item } : undefined;

              return (
                <Link
                  key={chat.id}
                  to={`/chat/${chat.id}`}
                  state={linkState}
                  className="chat-row"
                >
                  <img src={image} alt={title} className="chat-row-image" />
                  <div className="chat-row-body">
                    <div className="chat-row-head">
                      <h3>{title}</h3>
                      <span>{lastTime}</span>
                    </div>
                    <p>{location}</p>
                    <div className="chat-row-preview">{lastText}</div>
                  </div>
                </Link>
              );
            })}
          </section>
        )}
      </main>

      <footer className="footer">
        <p>© 2026 Reclaima University Lost & Found</p>
      </footer>
    </div>
  );
}













