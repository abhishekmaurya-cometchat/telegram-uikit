import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import { CometChatUIKit } from "@cometchat/chat-uikit-react";
import * as Sentry from "@sentry/react";
import { Login } from "./pages/Login/Login";
import Home from "./pages/Home/Home";
import { ChatContext } from "./context/ChatContext";

export default function App() {
  const { setLoggedInUser, loggedInUser } =
    useContext(ChatContext);

  useEffect(() => {
    CometChatUIKit.getLoggedinUser()
      .then((user) => setLoggedInUser(user))
  }, []);

  const testSentry = () => {
    Sentry.captureMessage("Sentry test message - it works!");
    throw new Error("Sentry test error - check your Sentry dashboard!");
  };

  return (
    <BrowserRouter>
      {/* Sentry Test Button - Remove after confirming it works */}
      <button
        onClick={testSentry}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 9999,
          padding: "10px 20px",
          background: "#362d59",
          color: "white",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
        }}
      >
        Test Sentry
      </button>

      <Routes>
        <Route
          path="/"
          element={<Navigate to={loggedInUser ? "/home" : "/login"} />}
        />
        <Route
          path="/login"
          element={!loggedInUser ? <Login /> : <Navigate to="/home" />}
        />
        <Route
          path="/home"
          element={loggedInUser ? <Home /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

