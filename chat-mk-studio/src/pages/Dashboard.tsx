import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Bot, Plus, LogOut, MessageSquare, BarChart3, Settings, Loader2, Circle, AlertTriangle, ArrowUpRight, Clock } from "lucide-react";
import { useAuth, PLAN_LIMITS } from "@/lib/auth";
import { useLanguage } from "@/lib/language";
import LanguageToggle from "@/components/LanguageToggle";
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

const t = {
  en: {
    dashboard: "Dashboard",
    manageChatbots: "Manage your AI chatbots.",
    newChatbot: "New Chatbot",
    logout: "Log out",
    chatbots: "Chatbots",
    of: "of",
    allowed: "allowed",
    messagesTotal: "Messages (total)",
    messagesMonthly: "Messages (monthly)",
    messages: "messages",
    loading: "Loading...",
    plan: "Plan",
    freeMessages: "messages",
    daysRemaining: "days remaining",
    trialPeriod: "8-day trial",
    messagesPerMonth: "messages/month",
    upgrade: "Upgrade",
    noChatbots: "No chatbots yet",
    noChatbotsDesc: "Create your first AI chatbot and start helping customers 24/7.",
    createChatbot: "Create Chatbot",
    created: "Created",
    trialExpiring: (d: number) => `Your free trial expires in ${d} ${d === 1 ? "day" : "days"}. Upgrade for uninterrupted service.`,
    trialExpired: "Your free trial has ended. Upgrade to continue using the chatbot.",
    graceExpired: "Your grace period has ended. Contact us to activate a plan.",
    limitReachedFree: (l: number) => `You've reached the limit of ${l} free messages. Upgrade for more.`,
    limitReached: "You've reached the monthly message limit. Upgrade for more messages.",
    draft: "Draft",
    active: "Active",
    paused: "Paused",
    planNames: { 0: "Free", 1: "Starter", 2: "Pro" } as Record<number, string>,
  },
  mk: {
    dashboard: "Контролна табла",
    manageChatbots: "Управувајте со вашите AI chatbot-и.",
    newChatbot: "Нов Chatbot",
    logout: "Одјави се",
    chatbots: "Chatbot-и",
    of: "од",
    allowed: "дозволени",
    messagesTotal: "Пораки (вкупно)",
    messagesMonthly: "Пораки (месечно)",
    messages: "пораки",
    loading: "Се вчитува...",
    plan: "План",
    freeMessages: "пораки",
    daysRemaining: "дена преостануваат",
    trialPeriod: "8 дена пробен период",
    messagesPerMonth: "пораки/месец",
    upgrade: "Надгради",
    noChatbots: "Немате chatbot-и",
    noChatbotsDesc: "Создадете го вашиот прв AI chatbot и почнете да им помагате на клиентите 24/7.",
    createChatbot: "Создади Chatbot",
    created: "Создаден",
    trialExpiring: (d: number) => `Вашиот бесплатен пробен период истекува за ${d} ${d === 1 ? "ден" : "дена"}. Надградете за непрекинато користење.`,
    trialExpired: "Вашиот бесплатен пробен период заврши. Надградете за да продолжите да го користите chatbot-от.",
    graceExpired: "Вашиот grace период заврши. Контактирајте не за активирање на план.",
    limitReachedFree: (l: number) => `Го достигнавте лимитот од ${l} бесплатни пораки. Надградете за повеќе пораки.`,
    limitReached: "Го достигнавте месечниот лимит на пораки. Надградете за повеќе пораки.",
    draft: "Нацрт",
    active: "Активен",
    paused: "Паузиран",
    planNames: { 0: "Бесплатен", 1: "Стартер", 2: "Про" } as Record<number, string>,
  },
};

const Dashboard = () => {
  const { user, team, loading: authLoading, logout } = useAuth();
  const { lang } = useLanguage();
  const c = t[lang];
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
  const planName = c.planNames[plan] || c.planNames[0];
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS[0];
  const usagePercent = usage ? Math.min(100, Math.round((usage.used / usage.limit) * 100)) : 0;
  const isLimitReached = usage ? !usage.allowed : false;

  const statusLabels: Record<string, { text: string; color: string }> = {
    draft: { text: c.draft, color: "text-muted-foreground" },
    active: { text: c.active, color: "text-green-600" },
    paused: { text: c.paused, color: "text-yellow-600" },
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl text-foreground">
            <Bot className="w-7 h-7 text-primary" />
            NexaAI
          </Link>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <span className="text-sm text-muted-foreground">
              {user.name} · <span className="font-medium text-foreground">{planName}</span>
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              {c.logout}
            </Button>
          </div>
        </div>
      </nav>

      <div className="container py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl text-foreground">{c.dashboard}</h1>
            <p className="text-muted-foreground mt-1">{c.manageChatbots}</p>
          </div>

          <Button
            className="gap-2 bg-gradient-accent text-white hover:opacity-90"
            onClick={() => navigate("/dashboard/new-chatbot")}
          >
            <Plus className="w-4 h-4" />
            {c.newChatbot}
          </Button>
        </div>

        {/* Trial countdown */}
        {usage && usage.status === "ok" && plan === 0 && usage.daysLeft != null && usage.daysLeft <= 3 && usage.daysLeft > 0 && (
          <div className="mb-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-yellow-600 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-700">{c.trialExpiring(usage.daysLeft)}</p>
            </div>
            <Link to="/dashboard/upgrade">
              <Button size="sm" className="gap-1 shrink-0 bg-yellow-600 text-white hover:bg-yellow-700">
                {c.upgrade}
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
                  ? c.trialExpired
                  : usage.status === "grace_expired"
                  ? c.graceExpired
                  : usage.status === "limit_reached" && plan === 0
                  ? c.limitReachedFree(usage.limit)
                  : c.limitReached}
              </p>
            </div>
            <Link to="/dashboard/upgrade">
              <Button size="sm" variant="destructive" className="gap-1 shrink-0">
                {c.upgrade}
                <ArrowUpRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.chatbots}</CardTitle>
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{chatbots.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {c.of} {limits.maxChatbots} {c.allowed}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {plan === 0 ? c.messagesTotal : c.messagesMonthly}
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
                {usage ? `${usage.used} ${c.of} ${usage.limit}` : c.loading} {c.messages}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.plan}</CardTitle>
              <Settings className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{planName}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {plan === 0
                  ? `30 ${c.freeMessages} · ${usage?.daysLeft != null ? `${usage.daysLeft} ${c.daysRemaining}` : c.trialPeriod}`
                  : plan === 1 ? `300 ${c.messagesPerMonth}` : `500 ${c.messagesPerMonth}`}
              </p>
              {plan === 0 && (
                <Link to="/dashboard/upgrade">
                  <Button variant="link" size="sm" className="px-0 mt-1 h-auto text-primary gap-1">
                    {c.upgrade}
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
              <CardTitle className="font-display text-xl mb-2">{c.noChatbots}</CardTitle>
              <CardDescription className="text-center mb-6 max-w-sm">
                {c.noChatbotsDesc}
              </CardDescription>
              <Button
                className="gap-2 bg-gradient-accent text-white hover:opacity-90"
                onClick={() => navigate("/dashboard/new-chatbot")}
              >
                <Plus className="w-4 h-4" />
                {c.createChatbot}
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
                        {c.created}: {new Date(bot.createdAt).toLocaleDateString(lang === "mk" ? "mk-MK" : "en-US")}
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
