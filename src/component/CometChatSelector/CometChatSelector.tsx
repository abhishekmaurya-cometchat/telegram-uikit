import { useEffect, useState } from "react";
import {
  Conversation,
  Group,
  User,
  Call,
} from "@cometchat/chat-sdk-javascript";
import { CometChatUIKitLoginListener } from "@cometchat/chat-uikit-react";
import { CometChatGroup } from "../CometChat/CometChatGroup/CometChatGroup";
import "./CometChatSelector.css";
import CometChatTab from "../CometChatTab/CometChatTab";
import { CometChatCall } from "../CometChat/CometChatCall/CometChatCall";
import { CometChatUser } from "../CometChat/CometChatUser/CometChatUser";
import { CometChatConvo } from "../CometChat/CometChatConvo/CometChatConvo";
import { GroupButton } from "../GroupButton/GroupButton";

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
  const { onSelectorItemClicked, onNewChatClicked = () => {} } = props;
  const [loggedInUser, setLoggedInUser] = useState<CometChat.User | null>();
  const [activeTab, setActiveTab] = useState<string>("chats");

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
