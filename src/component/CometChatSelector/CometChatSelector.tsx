import { useEffect, useState } from "react";
import {
  Conversation,
  Group,
  User,
  Call,
} from "@cometchat/chat-sdk-javascript";
import { CometChatUIKitLoginListener } from "@cometchat/chat-uikit-react";
import "./CometChatSelector.css";
import { CometChatConvo } from "../CometChat/CometChatConvo/CometChatConvo";

interface SelectorProps {
  onSelectorItemClicked?: (
    input: User | Group | Conversation | Call,
    type: string
  ) => void;
  onHide?: () => void;
  onNewChatClicked?: () => void;
}

export const CometChatSelector = (props: SelectorProps) => {
  // Destructure props with a default function for onSelectorItemClicked
  const { onSelectorItemClicked } = props;
  const [loggedInUser, setLoggedInUser] = useState<CometChat.User | null>();

  // useEffect hook to fetch and set the logged-in user
  useEffect(() => {
    const loggedInUser = CometChatUIKitLoginListener.getLoggedInUser();
    setLoggedInUser(loggedInUser);
  }, []);

  return (
    <>
      {loggedInUser && (
        <>
          {/* {activeTab == "chats" ? (
            <CometChatConvo onSelectorItemClicked={onSelectorItemClicked} />
          ) : activeTab == "calls" ? (
            <CometChatCall onSelectorItemClicked={onSelectorItemClicked} />
          ) : activeTab == "users" ? (
            <CometChatUser onSelectorItemClicked={onSelectorItemClicked} />
          ) : activeTab == "groups" ? (
            <CometChatGroup onSelectorItemClicked={onSelectorItemClicked} />
          ) : null} */}

          {/* <CometChatTab activeTab={activeTab} setActiveTab={setActiveTab} /> */}

          <CometChatConvo onSelectorItemClicked={onSelectorItemClicked} />

        </>
      )}
    </>
  );
};
