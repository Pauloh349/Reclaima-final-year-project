export function ChatNavbar() {
  return (
    <nav className="chat-nav">
      <div className="logo">
        <span className="material-icons">rebase_edit</span>
        <strong>Reclaima</strong>
      </div>

      <div className="nav-links">
        <a href="#">Browse Lost Items</a>
        <a href="#">Report Found</a>
        <img
          src="https://via.placeholder.com/40"
          alt="Profile"
          className="nav-avatar"
        />
      </div>
    </nav>
  );
}

export function ItemHeader() {
  return (
    <div className="item-header">
      <img
        src="https://via.placeholder.com/80"
        alt="Item"
        className="item-img"
      />

      <div className="item-info">
        <span className="badge">Found Item</span>
        <h1>Blue Hydro Flask</h1>
        <p className="location">
          <span className="material-icons">location_on</span>
          Main Library, 2nd Floor
        </p>
      </div>

      <div className="item-meta">
        <button className="link-btn">View Item Details</button>
        <small>Status: Coordination in progress</small>
      </div>
    </div>
  );
}

export function ChatContainer() {
  return (
    <div className="chat-container">
      <SafetyBanner />
      <Messages />
      <MessageInput />
    </div>
  );
}

function SafetyBanner() {
  return (
    <div className="safety-banner">
      <span className="material-icons">security</span>
      <div>
        <strong>Safety First</strong>
        <p>Meet in public campus locations and verify items before exchange.</p>
      </div>
    </div>
  );
}

function Messages() {
  return (
    <div className="messages">
      <div className="date-divider">Today</div>

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

      <SuggestionChips />
    </div>
  );
}

function Message({ sender, text, time, isOwn }) {
  return (
    <div className={`message-row ${isOwn ? "own" : ""}`}>
      {!isOwn && (
        <img
          src="https://via.placeholder.com/32"
          alt="Avatar"
          className="avatar"
        />
      )}

      <div className="bubble-group">
        <span className="sender">{sender}</span>
        <div className={`bubble ${isOwn ? "own-bubble" : ""}`}>{text}</div>
        <span className="time">{time}</span>
      </div>
    </div>
  );
}

function SuggestionChips() {
  return (
    <div className="suggestions">
      <button>That works for me!</button>
      <button>Can we meet at the Library instead?</button>
    </div>
  );
}

function MessageInput() {
  return (
    <div className="chat-input">
      <button className="icon-btn">
        <span className="material-icons">add_circle_outline</span>
      </button>

      <textarea placeholder="Type a message..." rows="1" />

      <button className="send-btn">
        <span className="material-icons">send</span>
      </button>
    </div>
  );
}

export function ChatFooter() {
  return (
    <div className="chat-footer">
      <p>
        Need help? <a href="#">Contact Campus Security</a>
      </p>

      <div className="footer-actions">
        <button className="danger">
          <span className="material-icons">report_problem</span>
          Report User
        </button>

        <button>Archive Chat</button>
      </div>
    </div>
  );
}
