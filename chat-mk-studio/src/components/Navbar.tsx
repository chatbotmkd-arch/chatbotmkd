import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Bot } from "lucide-react";
import { useAuth } from "@/lib/auth";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/60">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl text-foreground">
          <Bot className="w-7 h-7 text-primary" />
          ЧатБот МК
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Функции</a>
          <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Како работи</a>
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Цени</a>
          <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">ЧПП</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Link to="/dashboard">
              <Button size="sm" className="px-6 shadow-sm shadow-primary/15">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Најави се
              </Link>
              <Link to="/signup">
                <Button size="sm" className="px-6 shadow-sm shadow-primary/15">Започни бесплатно</Button>
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
          <a href="#features" className="block text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>Функции</a>
          <a href="#how-it-works" className="block text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>Како работи</a>
          <a href="#pricing" className="block text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>Цени</a>
          <a href="#faq" className="block text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>ЧПП</a>
          {user ? (
            <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
              <Button className="w-full" size="sm">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to="/login" className="block text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>Најави се</Link>
              <Link to="/signup" onClick={() => setMobileOpen(false)}>
                <Button className="w-full" size="sm">Започни бесплатно</Button>
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
