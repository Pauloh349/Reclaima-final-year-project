import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "../styles/Chat.css";
import finderAvatar from "../assets/user-icon.png";
import { ChatContainer, ChatNavbar } from "../components/chat/ChatSections";
import { getUserDisplayName, useAuthUser } from "../hooks/useAuthUser";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

function normalizeMessage(message) {
  return {
    id: message?.id || message?._id,
    senderId: String(message?.senderId || ""),
    recipientId: String(message?.recipientId || ""),
    text: message?.text || "",
    createdAt: message?.createdAt || new Date().toISOString(),
  };
}

function formatRecipientName(recipient) {
  if (!recipient) return "Finder";
  const first = recipient.firstName || "";
  const last = recipient.lastName || "";
  const fullName = `${first} ${last}`.trim();
  return fullName || recipient.email || "Finder";
}

export default function ChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthUser();
  const [item, setItem] = useState(location.state?.item || null);
  const [recipient, setRecipient] = useState(null);

  const [chatId, setChatId] = useState(id && id !== "new" ? id : "");
  const [messages, setMessages] = useState([]);
  const scrollAnchorRef = useRef(null);
  const appendMessage = (nextMessage) => {
    if (!nextMessage) return;
    const nextId = nextMessage?.id ? String(nextMessage.id) : "";
    setMessages((prev) => {
      if (!nextId) {
        return [...prev, nextMessage];
      }
      const exists = prev.some((message) => String(message.id) === nextId);
      return exists ? prev : [...prev, nextMessage];
    });
  };
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationsLoaded, setNotificationsLoaded] = useState(false);
  const [chatLoaded, setChatLoaded] = useState(false);

  const userId = user?.id ? String(user.id) : "";
  const displayName = getUserDisplayName(user);

  const finderName = formatRecipientName(recipient);
  const itemTitle = item?.title || "Item Match";
  const itemLocation = item?.location || item?.zone || "Location not provided";
  const status = item?.status
    ? `Status: ${item.status}`
    : "Status: Coordination in progress";

  const isItemIdLink = Boolean(item?._id && id && String(item._id) === id);

  useEffect(() => {
    let mounted = true;

    if (!userId) {
      return () => {
        mounted = false;
      };
    }

    if (id && id !== "new" && !isItemIdLink) {
      setChatId(id);
      return () => {
        mounted = false;
      };
    }

    if (!item?._id) {
      return () => {
        mounted = false;
      };
    }

    fetch(`${API_BASE}/api/chats/by-item`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        itemId: item._id,
        senderId: userId,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Request failed");
        }
        return response.json();
      })
      .then((data) => {
        if (!mounted) return;
        const resolvedId = data?.chat?.id || "";
        if (resolvedId) {
          setChatId(String(resolvedId));
          navigate(`/chat/${resolvedId}`, { replace: true, state: { item } });
        }
        if (data?.recipient) {
          setRecipient(data.recipient);
        }
      })
      .catch(() => {
        if (mounted) {
          setChatId("");
        }
      });

    return () => {
      mounted = false;
    };
  }, [API_BASE, id, isItemIdLink, item?._id, navigate, userId]);

  useEffect(() => {
    let mounted = true;

    if (!chatId || chatLoaded || item) {
      return () => {
        mounted = false;
      };
    }

    const query = userId ? `?userId=${userId}` : "";
    fetch(`${API_BASE}/api/chats/${chatId}${query}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Request failed");
        }
        return response.json();
      })
      .then((data) => {
        if (!mounted) return;
        setItem(data?.item || null);
        if (data?.recipient) {
          setRecipient(data.recipient);
        }
        setChatLoaded(true);
      })
      .catch(() => {
        if (mounted) setChatLoaded(true);
      });

    return () => {
      mounted = false;
    };
  }, [API_BASE, chatId, chatLoaded, item, userId]);

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
    if (!loadingMessages) {
      scrollAnchorRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [loadingMessages, messages.length]);

  useEffect(() => {
    let mounted = true;

    if (!chatId) {
      return () => {
        mounted = false;
      };
    }

    setLoadingMessages(true);

    fetch(`${API_BASE}/api/chats/${chatId}/messages`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Request failed");
        }
        return response.json();
      })
      .then((data) => {
        if (!mounted) return;
        const nextMessages = (data?.messages || []).map(normalizeMessage);
        setMessages(nextMessages);
      })
      .catch(() => {
        if (mounted) setMessages([]);
      })
      .finally(() => {
        if (mounted) setLoadingMessages(false);
      });

    return () => {
      mounted = false;
    };
  }, [API_BASE, chatId]);

  useEffect(() => {
    if (!userId) return undefined;

    const source = new EventSource(
      `${API_BASE}/api/notifications/stream?userId=${userId}`,
    );

    source.addEventListener("message", (event) => {
      try {
        const payload = JSON.parse(event.data || "{}");
        if (!payload?.message) return;

        if (String(payload.chatId) === String(chatId)) {
          appendMessage(normalizeMessage(payload.message));
        }

        if (String(payload.message.senderId) !== String(userId)) {
          setNotificationCount((count) => count + 1);
        }
      } catch {
        // ignore malformed events
      }
    });

    return () => {
      source.close();
    };
  }, [API_BASE, chatId, userId]);

  const handleSendMessage = async (text) => {
    if (!chatId || !userId || !text) return;

    const response = await fetch(`${API_BASE}/api/chats/${chatId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        senderId: userId,
        text,
      }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      return;
    }

    if (payload?.message) {
      appendMessage(normalizeMessage(payload.message));
    }
  };

  return (
    <div className="chat-page">
      <ChatNavbar
        chatId={chatId || "1"}
        notificationCount={notificationCount}
        itemTitle={itemTitle}
        itemLocation={itemLocation}
        itemStatus={status}
        itemId={item?._id}
      />
      <main className="chat-main">
        {loadingMessages ? (
          <p className="matches-muted">Loading messages...</p>
        ) : (
          <ChatContainer
            messages={messages}
            finderName={finderName}
            finderImage={finderAvatar}
            currentUserId={userId}
            currentUserName={displayName}
            onSendMessage={handleSendMessage}
            scrollAnchorRef={scrollAnchorRef}
          />
        )}
      </main>
    </div>
  );
}
