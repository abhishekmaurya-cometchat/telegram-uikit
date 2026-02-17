import { createContext } from "react";

interface ChatContextType {
  loggedInUser: any | null;
  setLoggedInUser: (user: any | null) => void;
  lang: string | null;
  setLanguage: (lang: string) => void; 
}

export const ChatContext = createContext<ChatContextType>({
  loggedInUser: null,
  setLoggedInUser: () => {},
  lang: "en",
  setLanguage: () => {},
});