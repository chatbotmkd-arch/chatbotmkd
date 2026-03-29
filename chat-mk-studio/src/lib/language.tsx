import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "en" | "mk";

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem("chatbotmkd-lang");
    return stored === "mk" ? "mk" : "en";
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("chatbotmkd-lang", l);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
