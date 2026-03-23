import { Link } from "react-router-dom";
import { Bot } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border py-12">
      <div className="container">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg text-foreground">
              <Bot className="w-6 h-6 text-primary" />
              ЧатБот МК
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              AI chatbot решенија за македонскиот пазар.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm text-foreground mb-4">Производ</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground transition-colors">Функции</a></li>
              <li><a href="#pricing" className="hover:text-foreground transition-colors">Цени</a></li>
              <li><a href="#how-it-works" className="hover:text-foreground transition-colors">Како работи</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm text-foreground mb-4">Компанија</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">За нас</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Контакт</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm text-foreground mb-4">Правни</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Услови за користење</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Политика на приватност</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ЧатБот МК. Сите права задржани.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
