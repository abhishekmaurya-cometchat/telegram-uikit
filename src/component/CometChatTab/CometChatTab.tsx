import { getLocalizedString } from "@cometchat/chat-uikit-react";
import { MessageSquareMore, Phone, User2, Users } from "lucide-react";
import "./CometChatTab.css";

interface CometChatTabProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const CometChatTab = ({ activeTab, setActiveTab }: CometChatTabProps) => {
  const tabItems = [
    {
      name: getLocalizedString("conversation_chat_title"),
      icon: MessageSquareMore,
      id: "chats",
    },
    { name: getLocalizedString("call_logs_title"), icon: Phone, id: "calls" },
    { name: getLocalizedString("user_title"), icon: User2, id: "users" },
    { name: getLocalizedString("group_title"), icon: Users, id: "groups" },
  ];

  return (
    <>
      <div className="cometchat-tab-container">
        {tabItems.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-item ${activeTab === tab.id ? "active" : ""}`}
          >
            <tab.icon className="tab-icon" />
            <span>{tab.name}</span>
          </button>
        ))}
      </div>
    </>
  );
};

export default CometChatTab;
