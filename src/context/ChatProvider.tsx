import { useState } from "react";
import { ChatContext } from "./ChatContext";

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [loggedInUser, setLoggedInUser] = useState<any | null>(null);
  const [lang, setLanguage] = useState<string | null>(null)

  return (
    <ChatContext.Provider value={{ loggedInUser, setLoggedInUser, lang, setLanguage}}>
      {children}
    </ChatContext.Provider>
  );
};