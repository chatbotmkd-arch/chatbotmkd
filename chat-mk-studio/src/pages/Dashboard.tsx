import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Bot, Plus, LogOut, MessageSquare, BarChart3, Settings, Loader2, Circle, AlertTriangle, ArrowUpRight, Clock } from "lucide-react";
import { useAuth, PLAN_NAMES, PLAN_LIMITS } from "@/lib/auth";
import { api } from "@/lib/api";

interface Chatbot {
  _id: string;
  name: string;
  status: "draft" | "active" | "paused";
  config: { model: string; language: string };
  createdAt: string;
}

interface UsageData {
  allowed: boolean;
  status: "ok" | "trial_expired" | "grace_expired" | "limit_reached";
  used: number;
  limit: number;
  plan: number;
  planName?: string;
  trialEndsAt?: string;
  graceEndsAt?: string | null;
  daysLeft?: number;
}

const statusLabels: Record<string, { text: string; color: string }> = {
  draft: { text: "Нацрт", color: "text-muted-foreground" },
  active: { text: "Активен", color: "text-green-600" },
  paused: { text: "Паузиран", color: "text-yellow-600" },
};

const Dashboard = () => {
  const { user, team, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [chatbotsData, usageData] = await Promise.all([
        api.get<Chatbot[]>("/chatbots"),
        api.get<UsageData>("/chat/usage"),
      ]);
      setChatbots(chatbotsData);
      setUsage(usageData);
    } catch {
      // silently fail on load
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const plan = user.plan ?? 0;
  const planName = PLAN_NAMES[plan] || "Бесплатен";
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS[0];
  const usagePercent = usage ? Math.min(100, Math.round((usage.used / usage.limit) * 100)) : 0;
  const isLimitReached = usage ? !usage.allowed : false;

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl text-foreground">
            <Bot className="w-7 h-7 text-primary" />
            ChatBot MK
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user.name} · <span className="font-medium text-foreground">{planName}</span>
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Одјави се
            </Button>
          </div>
        </div>
      </nav>

      <div className="container py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Управувајте со вашите AI chatbot-и.
            </p>
          </div>

          <Button
            className="gap-2 bg-gradient-accent text-white hover:opacity-90"
            onClick={() => navigate("/dashboard/new-chatbot")}
          >
            <Plus className="w-4 h-4" />
            Нов Chatbot
          </Button>
        </div>

        {/* Trial countdown — show when trial is active and <= 3 days left */}
        {usage && usage.status === "ok" && plan === 0 && usage.daysLeft != null && usage.daysLeft <= 3 && usage.daysLeft > 0 && (
          <div className="mb-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-yellow-600 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-700">
                Вашиот бесплатен пробен период истекува за {usage.daysLeft} {usage.daysLeft === 1 ? "ден" : "дена"}. Надградете за непрекинато користење.
              </p>
            </div>
            <Link to="/dashboard/upgrade">
              <Button size="sm" className="gap-1 shrink-0 bg-yellow-600 text-white hover:bg-yellow-700">
                Надгради
                <ArrowUpRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
        )}

        {/* Limit/trial expired warning */}
        {isLimitReached && usage && (
          <div className="mb-6 bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">
                {usage.status === "trial_expired"
                  ? "Вашиот бесплатен пробен период заврши. Надградете за да продолжите да го користите chatbot-от."
                  : usage.status === "grace_expired"
                  ? "Вашиот grace период заврши. Контактирајте не за активирање на план."
                  : usage.status === "limit_reached" && plan === 0
                  ? `Го достигнавте лимитот од ${usage.limit} бесплатни пораки. Надградете за повеќе пораки.`
                  : "Го достигнавте месечниот лимит на пораки. Надградете за повеќе пораки."}
              </p>
            </div>
            <Link to="/dashboard/upgrade">
              <Button size="sm" variant="destructive" className="gap-1 shrink-0">
                Надгради
                <ArrowUpRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Chatbot-и</CardTitle>
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{chatbots.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                од {limits.maxChatbots} дозволени
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Пораки {plan === 0 ? "(вкупно)" : "(месечно)"}
              </CardTitle>
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {usage ? usage.used : "—"}
              </div>
              <div className="mt-2">
                <Progress value={usagePercent} className="h-2" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {usage ? `${usage.used} од ${usage.limit}` : "Се вчитува..."} пораки
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">План</CardTitle>
              <Settings className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{planName}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {plan === 0
                  ? `30 пораки · ${usage?.daysLeft != null ? `${usage.daysLeft} дена преостануваат` : "8 дена пробен период"}`
                  : plan === 1 ? "300 пораки/месец" : "500 пораки/месец"}
              </p>
              {plan === 0 && (
                <Link to="/dashboard/upgrade">
                  <Button variant="link" size="sm" className="px-0 mt-1 h-auto text-primary gap-1">
                    Надгради
                    <ArrowUpRight className="w-3 h-3" />
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chatbot list or empty state */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : chatbots.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="font-display text-xl mb-2">Немате chatbot-и</CardTitle>
              <CardDescription className="text-center mb-6 max-w-sm">
                Создадете го вашиот прв AI chatbot и почнете да им помагате на клиентите 24/7.
              </CardDescription>
              <Button
                className="gap-2 bg-gradient-accent text-white hover:opacity-90"
                onClick={() => navigate("/dashboard/new-chatbot")}
              >
                <Plus className="w-4 h-4" />
                Создади Chatbot
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chatbots.map((bot) => {
              const st = statusLabels[bot.status] || statusLabels.draft;
              return (
                <Link key={bot._id} to={`/dashboard/chatbot/${bot._id}`}>
                  <Card className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Bot className="w-5 h-5 text-primary" />
                        </div>
                        <div className={`flex items-center gap-1.5 text-xs font-medium ${st.color}`}>
                          <Circle className="w-2 h-2 fill-current" />
                          {st.text}
                        </div>
                      </div>
                      <CardTitle className="font-display text-lg mt-3">{bot.name}</CardTitle>
                      <CardDescription>
                        {bot.config.model} · {bot.config.language === "mk" ? "Македонски" : bot.config.language}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">
                        Создаден: {new Date(bot.createdAt).toLocaleDateString("mk-MK")}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
