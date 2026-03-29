import { Link } from "react-router-dom";
import { Bot } from "lucide-react";
import { useLanguage } from "@/lib/language";

const t = {
  en: {
    desc: "AI chatbot platform for businesses. Create, train, and connect chatbots to Facebook Messenger.",
    product: "Product",
    features: "Features",
    pricing: "Pricing",
    howItWorks: "How It Works",
    company: "Company",
    contact: "Contact",
    legal: "Legal",
    terms: "Terms of Service",
    privacy: "Privacy Policy",
    trust: "Your data is encrypted and stored securely. We are GDPR compliant and never share your data with third parties.",
    copy: "All rights reserved.",
  },
  mk: {
    desc: "AI chatbot платформа за бизниси. Креирајте, тренирајте и поврзете chatbot-и со Facebook Messenger.",
    product: "Производ",
    features: "Функции",
    pricing: "Цени",
    howItWorks: "Како работи",
    company: "Компанија",
    contact: "Контакт",
    legal: "Правни",
    terms: "Услови за користење",
    privacy: "Политика на приватност",
    trust: "Вашите податоци се енкриптирани и безбедно складирани. Усогласени сме со GDPR и никогаш не ги споделуваме вашите податоци.",
    copy: "Сите права задржани.",
  },
};

const Footer = () => {
  const { lang } = useLanguage();
  const c = t[lang];
  const brand = lang === "en" ? "ChatbotMKD" : "ЧатБот МК";

  return (
    <footer className="border-t border-border py-12">
      <div className="container">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg text-foreground">
              <Bot className="w-6 h-6 text-primary" />
              {brand}
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm text-foreground mb-4">{c.product}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground transition-colors">{c.features}</a></li>
              <li><a href="#pricing" className="hover:text-foreground transition-colors">{c.pricing}</a></li>
              <li><a href="#how-it-works" className="hover:text-foreground transition-colors">{c.howItWorks}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm text-foreground mb-4">{c.company}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="mailto:contact@chatbotmkd.mk" className="hover:text-foreground transition-colors">
                  contact@chatbotmkd.mk
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm text-foreground mb-4">{c.legal}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/terms" className="hover:text-foreground transition-colors">{c.terms}</Link></li>
              <li><Link to="/privacy" className="hover:text-foreground transition-colors">{c.privacy}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-center italic mb-4">{c.trust}</p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {brand}. {c.copy}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
