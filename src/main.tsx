import { StrictMode, useContext, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import {
  CometChatLocalize,
  CometChatUIKit,
  UIKitSettingsBuilder,
} from "@cometchat/chat-uikit-react";
import { ChatProvider } from "./context/ChatProvider";
import { ChatContext } from "./context/ChatContext";

const COMETCHAT_CONSTANTS = {
  APP_ID: "16707974c173ad0c7",
  REGION: "in",
  AUTH_KEY: "f69513ac96929ccdfa8fde84d25cfa1940c5bbdf",
};

const UIKitSettings = new UIKitSettingsBuilder()
  .setAppId(COMETCHAT_CONSTANTS.APP_ID)
  .setRegion(COMETCHAT_CONSTANTS.REGION)
  .setAuthKey(COMETCHAT_CONSTANTS.AUTH_KEY)
  .subscribePresenceForAllUsers()
  .build();

CometChatUIKit.init(UIKitSettings)!
  .then(() => {
    console.log("CometChat UI Kit initialized");
    const rootElement = document.getElementById("root");

    if (!rootElement) {
      console.error("Root element not found");
      return;
    }

    createRoot(rootElement).render(
      <StrictMode>
        <ChatProvider>
          <App />
        </ChatProvider>
      </StrictMode>
    );
  })
  .catch((error) => {
    console.error("CometChat init failed:", error);
  });
