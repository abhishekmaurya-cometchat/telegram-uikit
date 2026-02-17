import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import "./index.css";
import App from "./App";
import {
  CometChatUIKit,
  UIKitSettingsBuilder,
} from "@cometchat/chat-uikit-react";
import { ChatProvider } from "./context/ChatProvider";

// Initialize Sentry for error tracking
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN, // Set this in your .env file
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of transactions (reduce in production)
  // Session Replay
  replaysSessionSampleRate: 0.1, // Sample 10% of sessions
  replaysOnErrorSampleRate: 1.0, // Sample 100% of sessions with errors
  environment: import.meta.env.MODE, // 'development' or 'production'
});

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
