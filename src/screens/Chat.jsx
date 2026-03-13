import "../styles/Chat.css";
import { useLocation, useParams } from "react-router-dom";
import {
  ChatContainer,
  ChatFooter,
  ChatNavbar,
  ItemHeader,
} from "../components/chat/ChatSections";

export default function ChatPage() {
  const { id } = useParams();
  const location = useLocation();
  const item = location.state?.item || null;

  const chatId = id || "1";
  const finderName = item?.contactName || item?.contactEmail || "Finder";
  const itemTitle = item?.title || "Item Match";
  const itemLocation = item?.location || item?.zone || "Location not provided";
  const badge = item?.type === "found" ? "Found Item" : "Matched Item";
  const status = item?.status
    ? `Status: ${item.status}`
    : "Status: Coordination in progress";

  return (
    <div className="chat-page">
      <ChatNavbar chatId={chatId} />
      <main className="chat-main">
        <ItemHeader
          badge={badge}
          title={itemTitle}
          location={itemLocation}
          image={item?.photoUrl}
          status={status}
          itemId={item?._id}
        />
        <ChatContainer
          initialMessages={[]}
          finderName={finderName}
          finderImage={item?.photoUrl}
        />
        <ChatFooter />
      </main>
    </div>
  );
}
