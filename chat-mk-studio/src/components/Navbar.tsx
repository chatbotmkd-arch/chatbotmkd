import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Bot, Globe } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/language";

const t = {
  en: { features: "Features", howItWorks: "How It Works", pricing: "Pricing", faq: "FAQ", login: "Log in", cta: "Start free" },
  mk: { features: "Функции", howItWorks: "Како работи", pricing: "Цени", faq: "ЧПП", login: "Најави се", cta: "Започни бесплатно" },
};

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const { lang, setLang } = useLanguage();
  const c = t[lang];

  const navLinks = [
    { href: "#features", label: c.features },
    { href: "#how-it-works", label: c.howItWorks },
    { href: "#pricing", label: c.pricing },
    { href: "#faq", label: c.faq },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/60">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl text-foreground">
          <Bot className="w-7 h-7 text-primary" />
          {lang === "en" ? "ChatbotMKD" : "ЧатБот МК"}
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l.label}</a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => setLang(lang === "en" ? "mk" : "en")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted"
          >
            <Globe className="w-4 h-4" />
            {lang === "en" ? "MK" : "EN"}
          </button>

          {user ? (
            <Link to="/dashboard">
              <Button size="sm" className="px-6 shadow-sm shadow-primary/15">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{c.login}</Link>
              <Link to="/signup">
                <Button size="sm" className="px-6 shadow-sm shadow-primary/15">{c.cta}</Button>
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-background border-b border-border px-6 pb-6 space-y-4">
          <button onClick={() => setLang(lang === "en" ? "mk" : "en")} className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Globe className="w-4 h-4" />
            {lang === "en" ? "Македонски" : "English"}
          </button>
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="block text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>{l.label}</a>
          ))}
          {user ? (
            <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
              <Button className="w-full" size="sm">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to="/login" className="block text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>{c.login}</Link>
              <Link to="/signup" onClick={() => setMobileOpen(false)}>
                <Button className="w-full" size="sm">{c.cta}</Button>
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
