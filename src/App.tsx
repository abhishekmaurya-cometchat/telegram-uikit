import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import { CometChatUIKit } from "@cometchat/chat-uikit-react";
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

  return (
    <BrowserRouter>
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

