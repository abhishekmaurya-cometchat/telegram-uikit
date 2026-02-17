import { useContext, useEffect, useState } from "react";
import { CometChatLocalize, CometChatUIKit } from "@cometchat/chat-uikit-react";
import { ChatContext } from "../../context/ChatContext";
import "./Login.css";

type UserMetaData = {
  language?: string;
};

export const Login = () => {
  const [uid, setUid] = useState<string>("");
  const { setLoggedInUser, setLanguage, lang } = useContext(ChatContext);

  useEffect(() => {
    CometChatLocalize.init({ language: lang });
  }, [lang]);

  const handleLogin = async () => {
    if (!uid) return alert("Please enter UID");

    try {
      const user = await CometChatUIKit.login(uid);
      setLoggedInUser(user);

      const metadata = user.getMetadata() as UserMetaData;

      if (metadata?.language) {
        setLanguage(metadata.language);
      }
    } catch (error) {
      console.error(error);
      alert("Login failed");
    }
  };

  const handleClick = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg"
          alt="Telegram"
          className="login-logo"
        />
        <h2 className="login-title">Login to Telegram</h2>

        <input
          type="text"
          placeholder="Enter your UID"
          value={uid}
          onChange={(e) => setUid(e.target.value)}
          onKeyDown={handleClick}
          className="login-input"
        />

        <button onClick={handleLogin} className="login-btn">
          Login
        </button>
      </div>
    </div>
  );
};
