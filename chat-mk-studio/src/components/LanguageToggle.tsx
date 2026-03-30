import { Globe } from "lucide-react";
import { useLanguage } from "@/lib/language";

export default function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang } = useLanguage();
  return (
    <button
      onClick={() => setLang(lang === "en" ? "mk" : "en")}
      className={`flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted ${className ?? ""}`}
    >
      <Globe className="w-4 h-4" />
      {lang === "en" ? "MK" : "EN"}
    </button>
  );
}
