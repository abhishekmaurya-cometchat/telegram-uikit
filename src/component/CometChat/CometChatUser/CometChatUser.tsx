import { CometChatUsers } from "@cometchat/chat-uikit-react";
import { CometChat, User } from "@cometchat/chat-sdk-javascript";
import { useState, useEffect } from "react";
import "./CometChatUser.css";

interface SelectorProps {
  onSelectorItemClicked?: (input: User, type: string) => void;
  onHide?: () => void;
  onNewChatClicked?: () => void;
}

export const CometChatUser = (props: SelectorProps) => {
  const { onSelectorItemClicked = () => {} } = props;
  const [chatUser, setChatUser] = useState<CometChat.User | undefined>(undefined);

  return (
    <div className="user-wrapper">
      <CometChatUsers
        onItemClick={(user: CometChat.User) => {
          onSelectorItemClicked(user, "user");
          setChatUser(user);
        }}
        showSectionHeader={false}
        activeUser={chatUser}
      />
    </div>
  );
};
