import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/language";
import LanguageToggle from "@/components/LanguageToggle";

const t = {
  en: {
    title: "Create an account",
    subtitle: "Start free for 8 days",
    name: "Name",
    namePlaceholder: "Your name",
    email: "Email",
    emailPlaceholder: "you@email.com",
    password: "Password",
    passwordPlaceholder: "At least 6 characters",
    confirmPassword: "Confirm password",
    confirmPlaceholder: "Repeat your password",
    submit: "Start free",
    hasAccount: "Already have an account?",
    loginLink: "Log in",
    error: "Registration failed",
    mismatch: "Passwords do not match",
    tooShort: "Password must be at least 6 characters",
  },
  mk: {
    title: "Создади сметка",
    subtitle: "Започнете бесплатно за 8 дена",
    name: "Име",
    namePlaceholder: "Вашето име",
    email: "Email",
    emailPlaceholder: "vase@email.com",
    password: "Лозинка",
    passwordPlaceholder: "Најмалку 6 карактери",
    confirmPassword: "Потврди лозинка",
    confirmPlaceholder: "Повторете ја лозинката",
    submit: "Започни бесплатно",
    hasAccount: "Веќе имате сметка?",
    loginLink: "Најави се",
    error: "Грешка при регистрација",
    mismatch: "Лозинките не се совпаѓаат",
    tooShort: "Лозинката мора да има најмалку 6 карактери",
  },
};

const Signup = () => {
  const { register } = useAuth();
  const { lang } = useLanguage();
  const c = t[lang];
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(c.mismatch);
      return;
    }

    if (password.length < 6) {
      setError(c.tooShort);
      return;
    }

    setLoading(true);

    try {
      await register(email, password, name);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : c.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-display font-bold text-2xl text-foreground">
            <Bot className="w-8 h-8 text-primary" />
            NexaAI
          </Link>
          <LanguageToggle />
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl">{c.title}</CardTitle>
            <CardDescription>{c.subtitle}</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">{c.name}</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={c.namePlaceholder}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{c.email}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={c.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{c.password}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={c.passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{c.confirmPassword}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder={c.confirmPlaceholder}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>

            <CardFooter className="flex-col gap-4">
              <Button
                type="submit"
                className="w-full bg-gradient-accent text-white hover:opacity-90"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {c.submit}
              </Button>
              <p className="text-sm text-muted-foreground">
                {c.hasAccount}{" "}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  {c.loginLink}
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
