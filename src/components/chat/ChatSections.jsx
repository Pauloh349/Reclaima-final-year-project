import { Link } from "react-router-dom";
import NavBar from "../NavBar";

export function ChatNavbar() {
  return (
    <NavBar
      icon="rebase_edit"
      links={[
        { label: "Browse Lost Items", to: "/matches" },
        { label: "Report Found", to: "/found" },
        { label: "Messages", to: "/chat/1", active: true },
      ]}
      rightContent={
        <Link className="rc-navbar-user" to="/profile">
          <img
            src="/src/assets/user-icon.jpg"
            alt="Profile"
            className="nav-avatar"
          />
        </Link>
      }
    />
  );
}

export function ItemHeader() {
  return (
    <section className="chat-item-header">
      <img
        src="/src/assets/user-icon2.jpg"
        alt="Item"
        className="chat-item-image"
      />

      <div className="chat-item-info">
        <span className="chat-badge">Found Item</span>
        <h1>Blue Hydro Flask</h1>
        <p className="chat-location">
          <span className="material-icons">location_on</span>
          Main Library, 2nd Floor
        </p>
      </div>

      <div className="chat-item-meta">
        <button className="text-btn">View Item Details</button>
        <small>Status: Coordination in progress</small>
      </div>
    </section>
  );
}

export function ChatContainer() {
  return (
    <section className="chat-panel">
      <SafetyBanner />
      <Messages />
      <MessageInput />
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

function Messages() {
  return (
    <div className="chat-messages">
      <div className="date-pill">Today</div>

      <Message
        sender="Sarah (Finder)"
        text="Hi there! I found your Hydro Flask near the study cubicles. It has a National Parks sticker, is that yours?"
        time="10:14 AM"
      />

      <Message
        sender="You"
        text="Yes! That's definitely mine. Thank you so much!"
        time="10:16 AM"
        isOwn
      />

      <Message
        sender="Sarah (Finder)"
        text="Would you like to meet at Starbucks in the Student Union around 2:15 PM?"
        time="10:18 AM"
      />

      <div className="suggestion-chips">
        <button>That works for me!</button>
        <button>Can we meet at the Library instead?</button>
      </div>
    </div>
  );
}

function Message({ sender, text, time, isOwn }) {
  return (
    <div className={`message-row ${isOwn ? "own" : ""}`}>
      {!isOwn && (
        <img
          src="/src/assets/user-icon2.jpg"
          alt="Avatar"
          className="avatar"
        />
      )}

      <div className="message-body">
        <span className="message-sender">{sender}</span>
        <div className={`message-bubble ${isOwn ? "own" : ""}`}>{text}</div>
        <span className="message-time">{time}</span>
      </div>
    </div>
  );
}

function MessageInput() {
  return (
    <div className="chat-input-bar">
      <button className="icon-btn" aria-label="Attach file">
        <span className="material-icons">add_circle_outline</span>
      </button>

      <textarea placeholder="Type a message..." rows="1" />

      <button className="send-btn" aria-label="Send message">
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
