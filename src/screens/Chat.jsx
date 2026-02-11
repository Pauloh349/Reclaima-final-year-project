import "../styles/Chat.css";
import {
  ChatContainer,
  ChatFooter,
  ChatNavbar,
  ItemHeader,
} from "../components/chat/ChatSections";

export default function ChatPage() {
  return (
    <div className="chat-page">
      <ChatNavbar />
      <main className="chat-main">
        <ItemHeader />
        <ChatContainer />
        <ChatFooter />
      </main>
    </div>
  );
}
