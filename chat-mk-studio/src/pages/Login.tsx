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
    title: "Log in",
    subtitle: "Enter your credentials to continue",
    email: "Email",
    emailPlaceholder: "you@email.com",
    password: "Password",
    submit: "Log in",
    noAccount: "Don't have an account?",
    signupLink: "Sign up",
    error: "Login failed",
  },
  mk: {
    title: "Најави се",
    subtitle: "Внесете ги вашите податоци за да продолжите",
    email: "Email",
    emailPlaceholder: "vase@email.com",
    password: "Лозинка",
    submit: "Најави се",
    noAccount: "Немате сметка?",
    signupLink: "Регистрирајте се",
    error: "Грешка при најава",
  },
};

const Login = () => {
  const { login } = useAuth();
  const { lang } = useLanguage();
  const c = t[lang];
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                {c.noAccount}{" "}
                <Link to="/signup" className="text-primary font-medium hover:underline">
                  {c.signupLink}
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
