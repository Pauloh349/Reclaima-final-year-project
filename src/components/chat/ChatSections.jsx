import { useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "../NavBar";
import { getUserDisplayName, useAuthUser } from "../../hooks/useAuthUser";
import userIcon from "../../assets/user-icon.png";

export function ChatNavbar({
  chatId = "1",
  notificationCount = 0,
  itemTitle,
  itemLocation,
  itemStatus,
  itemId,
}) {
  const [chatMenuOpen, setChatMenuOpen] = useState(false);
  const user = useAuthUser();
  const displayName = getUserDisplayName(user);

  const messageLabel = (
    <span className="rc-navbar-link-label">
      Messages
      {notificationCount > 0 ? (
        <span className="rc-navbar-badge">{notificationCount}</span>
      ) : null}
    </span>
  );

  return (
    <NavBar
      icon="rebase_edit"
      links={[
        { label: "Browse Lost Items", to: "/matches" },
        { label: "Report Found", to: "/found" },
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
          <div className="chat-nav-actions">
            <button
              type="button"
              className="chat-menu-btn"
              aria-label="Chat options"
              aria-expanded={chatMenuOpen}
              onClick={() => setChatMenuOpen((current) => !current)}
            >
              <span className="material-icons">more_vert</span>
            </button>

            {chatMenuOpen ? (
              <div className="chat-menu">
                <div className="chat-menu-item">
                  <span className="chat-menu-label">Item</span>
                  <h4>{itemTitle || "Item Match"}</h4>
                  <p>{itemLocation || "Location not provided"}</p>
                  <small>{itemStatus || "Status: Coordination in progress"}</small>
                  {itemId ? (
                    <Link to={`/item/${itemId}`} onClick={() => setChatMenuOpen(false)}>
                      View item details
                    </Link>
                  ) : null}
                </div>
                <Link to="/help" onClick={() => setChatMenuOpen(false)}>
                  Need support
                </Link>
                <button type="button" onClick={() => setChatMenuOpen(false)}>
                  Report user
                </button>
                <button type="button" onClick={() => setChatMenuOpen(false)}>
                  Archive chat
                </button>
              </div>
            ) : null}

            <Link className="rc-navbar-user" to="/profile">
              <img
                src={userIcon}
                alt="Profile"
                className="nav-avatar"
              />
              <span>{displayName}</span>
            </Link>
          </div>
        </>
      }
    />
  );
}

export function ChatContainer({
  messages = [],
  finderName = "Finder",
  finderImage,
  currentUserId,
  currentUserName = "You",
  onSendMessage,
  scrollAnchorRef,
}) {
  const [draft, setDraft] = useState("");
  const isSending = !onSendMessage;

  const handleSend = async () => {
    const trimmed = draft.trim();
    if (!trimmed || !onSendMessage) return;
    setDraft("");
    await onSendMessage(trimmed);
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
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        scrollAnchorRef={scrollAnchorRef}
      />
      <MessageInput
        value={draft}
        onChange={setDraft}
        onSend={handleSend}
        onKeyDown={handleKeyDown}
        placeholder={`Message ${finderName}`}
        disabled={isSending}
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

function formatMessageTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function Messages({
  messages,
  finderName,
  finderImage,
  currentUserId,
  currentUserName,
  scrollAnchorRef,
}) {
  return (
    <div className="chat-messages">
      <div className="date-pill">Today</div>

      {messages.length === 0 ? (
        <p className="chat-empty">Start a conversation with {finderName}.</p>
      ) : (
        messages.map((message) => {
          const isOwn = message.senderId === currentUserId;
          const sender = isOwn ? currentUserName : finderName;
          return (
            <Message
              key={message.id}
              sender={sender}
              text={message.text}
              time={formatMessageTime(message.createdAt)}
              isOwn={isOwn}
              avatar={finderImage}
            />
          );
        })
      )}
      <div ref={scrollAnchorRef} />
    </div>
  );
}

function Message({ sender, text, time, isOwn, avatar }) {
  const avatarSrc = avatar || "/src/assets/user-icon2.jpg";

  return (
    <div className={`message-row ${isOwn ? "own" : ""}`}>
      {!isOwn && <img src={avatarSrc} alt="Avatar" className="avatar" />}

      <div className="message-body">
        <span className="message-sender">{sender}</span>
        <div className={`message-bubble ${isOwn ? "own" : ""}`}>{text}</div>
        <span className="message-time">{time}</span>
      </div>
    </div>
  );
}

function MessageInput({
  value,
  onChange,
  onSend,
  onKeyDown,
  placeholder,
  disabled,
}) {
  const trimmed = value.trim();

  return (
    <div className="chat-input-bar">
      <button className="icon-btn" aria-label="Attach file" disabled={disabled}>
        <span className="material-icons">add_circle_outline</span>
      </button>

      <textarea
        placeholder={placeholder}
        rows="1"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        disabled={disabled}
      />

      <button
        className="send-btn"
        aria-label="Send message"
        onClick={onSend}
        disabled={!trimmed || disabled}
      >
        <span className="material-icons">send</span>
      </button>
    </div>
  );
}
