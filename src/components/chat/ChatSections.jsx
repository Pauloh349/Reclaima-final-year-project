import { useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "../NavBar";
import { getUserDisplayName, useAuthUser } from "../../hooks/useAuthUser";

export function ChatNavbar({ chatId = "1" }) {
  const user = useAuthUser();
  const displayName = getUserDisplayName(user);

  return (
    <NavBar
      icon="rebase_edit"
      links={[
        { label: "Browse Lost Items", to: "/matches" },
        { label: "Report Found", to: "/found" },
        { label: "Messages", to: `/chat/${chatId}`, active: true },
      ]}
      rightContent={
        <Link className="rc-navbar-user" to="/profile">
          <img
            src="/src/assets/user-icon.jpg"
            alt="Profile"
            className="nav-avatar"
          />
          <span>{displayName}</span>
        </Link>
      }
    />
  );
}

export function ItemHeader({
  badge = "Found Item",
  title = "Item Match",
  location = "Location not provided",
  image,
  status = "Status: Coordination in progress",
  itemId,
}) {
  const imageSrc = image || "/src/assets/user-icon2.jpg";
  const detailsLink = itemId ? `/item/${itemId}` : null;

  return (
    <section className="chat-item-header">
      <img src={imageSrc} alt={title} className="chat-item-image" />

      <div className="chat-item-info">
        <span className="chat-badge">{badge}</span>
        <h1>{title}</h1>
        <p className="chat-location">
          <span className="material-icons">location_on</span>
          {location}
        </p>
      </div>

      <div className="chat-item-meta">
        {detailsLink ? (
          <Link className="text-btn" to={detailsLink}>
            View Item Details
          </Link>
        ) : (
          <button className="text-btn" disabled>
            View Item Details
          </button>
        )}
        <small>{status}</small>
      </div>
    </section>
  );
}

export function ChatContainer({
  initialMessages = [],
  finderName = "Finder",
  finderImage,
  currentUserName = "You",
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;

    const time = new Date().toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });

    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${prev.length}`,
        sender: currentUserName,
        text: trimmed,
        time,
        isOwn: true,
      },
    ]);
    setDraft("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <section className="chat-panel">
      <SafetyBanner />
      <Messages
        messages={messages}
        finderName={finderName}
        finderImage={finderImage}
      />
      <MessageInput
        value={draft}
        onChange={setDraft}
        onSend={handleSend}
        onKeyDown={handleKeyDown}
        placeholder={`Message ${finderName}...`}
      />
    </section>
  );
}

function SafetyBanner() {
  return (
    <div className="safety-strip">
      <span className="material-icons">security</span>
      <div>
        <strong>Safety Reminder</strong>
        <p>Meet in public campus locations and verify items before exchange.</p>
      </div>
    </div>
  );
}

function Messages({ messages, finderName, finderImage }) {
  return (
    <div className="chat-messages">
      <div className="date-pill">Today</div>

      {messages.length === 0 ? (
        <p className="chat-empty">Start a conversation with {finderName}.</p>
      ) : (
        messages.map((message) => (
          <Message
            key={message.id}
            sender={message.sender}
            text={message.text}
            time={message.time}
            isOwn={message.isOwn}
            avatar={finderImage}
          />
        ))
      )}
    </div>
  );
}

function Message({ sender, text, time, isOwn, avatar }) {
  const avatarSrc = avatar || "/src/assets/user-icon2.jpg";

  return (
    <div className={`message-row ${isOwn ? "own" : ""}`}>
      {!isOwn && (
        <img src={avatarSrc} alt="Avatar" className="avatar" />
      )}

      <div className="message-body">
        <span className="message-sender">{sender}</span>
        <div className={`message-bubble ${isOwn ? "own" : ""}`}>{text}</div>
        <span className="message-time">{time}</span>
      </div>
    </div>
  );
}

function MessageInput({ value, onChange, onSend, onKeyDown, placeholder }) {
  const trimmed = value.trim();

  return (
    <div className="chat-input-bar">
      <button className="icon-btn" aria-label="Attach file">
        <span className="material-icons">add_circle_outline</span>
      </button>

      <textarea
        placeholder={placeholder}
        rows="1"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
      />

      <button
        className="send-btn"
        aria-label="Send message"
        onClick={onSend}
        disabled={!trimmed}
      >
        <span className="material-icons">send</span>
      </button>
    </div>
  );
}

export function ChatFooter() {
  return (
    <footer className="chat-footer">
      <p>
        Need help? <a href="/help">Contact Support</a>
      </p>

      <div className="footer-actions">
        <button className="danger">
          <span className="material-icons">report_problem</span>
          Report User
        </button>

        <button>Archive Chat</button>
      </div>
    </footer>
  );
}
