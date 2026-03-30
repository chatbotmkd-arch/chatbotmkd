import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Bot,
  Users,
  MessageSquare,
  CreditCard,
  Loader2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Shield,
  ChevronDown,
  Receipt,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/language";
import LanguageToggle from "@/components/LanguageToggle";
import { api } from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────

interface AdminStats {
  totalTeams: number;
  paidTeams: number;
  totalChatbots: number;
  messagesToday: number;
  pendingInvoices: number;
}

interface AdminUser {
  teamId: string;
  teamName: string;
  clientNumber: number;
  ownerName: string;
  ownerEmail: string;
  plan: number;
  planName: string;
  trialEndsAt: string | null;
  graceEndsAt: string | null;
  trialActive: boolean;
  graceActive: boolean;
  messagesUsed: number;
  messagesLimit: number;
  chatbotCount: number;
  chatbotLimit: number;
  createdAt: string;
}

interface AdminInvoice {
  _id: string;
  invoiceNumber: string;
  paymentReference: string;
  teamName: string;
  clientNumber: number;
  userName: string;
  userEmail: string;
  plan: number;
  period: string;
  amount: number;
  status: string;
  companyName: string;
  edb: string;
  createdAt: string;
}

const planColors: Record<number, string> = {
  0: "bg-gray-100 text-gray-700",
  1: "bg-blue-100 text-blue-700",
  2: "bg-purple-100 text-purple-700",
};

const t = {
  en: {
    planNames: { 0: "Free", 1: "Starter", 2: "Pro" } as Record<number, string>,
    accessDenied: "Access denied",
    backToDashboard: "Back to Dashboard",
    adminDashboard: "Admin Dashboard",
    users: "Users",
    paid: "Paid",
    chatbots: "Chatbots",
    messagesToday: "Messages today",
    awaitingPayment: "Awaiting payment",
    invoices: "Invoices",
    // Users table
    userCol: "User",
    plan: "Plan",
    status: "Status",
    messagesCol: "Messages",
    chatbotsCol: "Chatbots",
    registered: "Registered",
    actions: "Actions",
    // Trial status
    active: "Active",
    expired: "Expired",
    days: "d",
    // Invoices table
    invoice: "Invoice",
    client: "Client",
    amount: "Amount",
    date: "Date",
    taxId: "Tax ID:",
    yearly: "yearly",
    monthly: "monthly",
    noInvoices: "No invoices",
    // Invoice statuses
    statusPending: "Awaiting payment",
    statusPaid: "Paid",
    statusCancelled: "Cancelled",
    statusExpired: "Expired",
    markPaid: "Paid",
  },
  mk: {
    planNames: { 0: "Бесплатен", 1: "Стартер", 2: "Про" } as Record<number, string>,
    accessDenied: "Пристап одбиен",
    backToDashboard: "Назад кон Dashboard",
    adminDashboard: "Admin Dashboard",
    users: "Корисници",
    paid: "Платени",
    chatbots: "Chatbot-и",
    messagesToday: "Пораки денес",
    awaitingPayment: "Чекаат плаќање",
    invoices: "Фактури",
    // Users table
    userCol: "Корисник",
    plan: "План",
    status: "Статус",
    messagesCol: "Пораки",
    chatbotsCol: "Chatbot-и",
    registered: "Регистриран",
    actions: "Акции",
    // Trial status
    active: "Активен",
    expired: "Истечен",
    days: "д",
    // Invoices table
    invoice: "Фактура",
    client: "Клиент",
    amount: "Износ",
    date: "Датум",
    taxId: "ЕДБ:",
    yearly: "годишно",
    monthly: "месечно",
    noInvoices: "Нема фактури",
    // Invoice statuses
    statusPending: "Чека плаќање",
    statusPaid: "Платена",
    statusCancelled: "Откажана",
    statusExpired: "Истечена",
    markPaid: "Платена",
  },
};

// ── Main Component ────────────────────────────────────────────

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { lang } = useLanguage();
  const c = t[lang];
  const navigate = useNavigate();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [invoices, setInvoices] = useState<AdminInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"users" | "invoices">("users");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [statsData, usersData, invoicesData] = await Promise.all([
        api.get<AdminStats>("/admin/stats"),
        api.get<AdminUser[]>("/admin/users"),
        api.get<AdminInvoice[]>("/admin/invoices"),
      ]);
      setStats(statsData);
      setUsers(usersData);
      setInvoices(invoicesData);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Access denied");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePlan = async (teamId: string, plan: number) => {
    setActionLoading(`plan-${teamId}`);
    try {
      await api.patch(`/admin/teams/${teamId}/plan`, { plan, period: "monthly" });
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleExtendGrace = async (teamId: string) => {
    setActionLoading(`grace-${teamId}`);
    try {
      await api.post(`/admin/teams/${teamId}/extend-grace`, { days: 8 });
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkPaid = async (invoiceId: string) => {
    setActionLoading(`pay-${invoiceId}`);
    try {
      await api.patch(`/admin/invoices/${invoiceId}/mark-paid`, {});
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
    } finally {
      setActionLoading(null);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{c.accessDenied}</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Link to="/dashboard">
              <Button variant="outline">{c.backToDashboard}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingInvoices = invoices.filter((i) => i.status === "pending");
  const locale = lang === "mk" ? "mk-MK" : "en-US";

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border bg-card">
        <div className="container flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center gap-2 font-display font-bold text-xl text-foreground">
            <Bot className="w-7 h-7 text-primary" />
            NexaAI
            <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-medium ml-2">
              Admin
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Link to="/dashboard">
              <Button variant="outline" size="sm">Dashboard</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container py-10">
        <h1 className="font-display font-bold text-3xl text-foreground mb-8">{c.adminDashboard}</h1>

        {/* Stats cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <StatCard icon={Users} label={c.users} value={stats.totalTeams} />
            <StatCard icon={CreditCard} label={c.paid} value={stats.paidTeams} />
            <StatCard icon={Bot} label={c.chatbots} value={stats.totalChatbots} />
            <StatCard icon={MessageSquare} label={c.messagesToday} value={stats.messagesToday} />
            <StatCard
              icon={Receipt}
              label={c.awaitingPayment}
              value={stats.pendingInvoices}
              highlight={stats.pendingInvoices > 0}
            />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={tab === "users" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("users")}
            className="gap-2"
          >
            <Users className="w-4 h-4" />
            {c.users} ({users.length})
          </Button>
          <Button
            variant={tab === "invoices" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("invoices")}
            className="gap-2"
          >
            <Receipt className="w-4 h-4" />
            {c.invoices}
            {pendingInvoices.length > 0 && (
              <span className="bg-destructive text-white text-xs rounded-full px-1.5 py-0.5 ml-1">
                {pendingInvoices.length}
              </span>
            )}
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : tab === "users" ? (
          <UsersTable
            users={users}
            actionLoading={actionLoading}
            onChangePlan={handleChangePlan}
            onExtendGrace={handleExtendGrace}
            lang={lang}
          />
        ) : (
          <InvoicesTable
            invoices={invoices}
            actionLoading={actionLoading}
            onMarkPaid={handleMarkPaid}
            lang={lang}
          />
        )}
      </div>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, highlight }: {
  icon: React.ElementType;
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Icon className={`w-4 h-4 ${highlight ? "text-destructive" : "text-muted-foreground"}`} />
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
        </div>
        <div className={`text-2xl font-bold ${highlight ? "text-destructive" : "text-foreground"}`}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Users Table ───────────────────────────────────────────────

function UsersTable({ users, actionLoading, onChangePlan, onExtendGrace, lang }: {
  users: AdminUser[];
  actionLoading: string | null;
  onChangePlan: (teamId: string, plan: number) => void;
  onExtendGrace: (teamId: string) => void;
  lang: "en" | "mk";
}) {
  const c = t[lang];
  const locale = lang === "mk" ? "mk-MK" : "en-US";

  return (
    <div className="rounded-xl border border-border overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50 text-left">
            <th className="px-4 py-3 font-medium text-muted-foreground">#</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">{c.userCol}</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">{c.plan}</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">{c.status}</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">{c.messagesCol}</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">{c.chatbotsCol}</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">{c.registered}</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">{c.actions}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {users.map((u) => {
            const usagePercent = Math.min(100, Math.round((u.messagesUsed / u.messagesLimit) * 100));
            return (
              <tr key={u.teamId} className="hover:bg-muted/30">
                <td className="px-4 py-3 text-muted-foreground">{u.clientNumber}</td>
                <td className="px-4 py-3">
                  <div className="font-medium">{u.ownerName}</div>
                  <div className="text-xs text-muted-foreground">{u.ownerEmail}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${planColors[u.plan] || planColors[0]}`}>
                    {c.planNames[u.plan] || c.planNames[0]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <TrialStatus user={u} lang={lang} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <Progress value={usagePercent} className="h-1.5 flex-1" />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {u.messagesUsed}/{u.messagesLimit}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  {u.chatbotCount}/{u.chatbotLimit}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(u.createdAt).toLocaleDateString(locale)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <PlanDropdown
                      currentPlan={u.plan}
                      loading={actionLoading === `plan-${u.teamId}`}
                      onChange={(plan) => onChangePlan(u.teamId, plan)}
                      lang={lang}
                    />
                    {u.plan === 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7 px-2"
                        onClick={() => onExtendGrace(u.teamId)}
                        disabled={actionLoading === `grace-${u.teamId}`}
                      >
                        {actionLoading === `grace-${u.teamId}` ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        <span className="ml-1">+8{c.days}</span>
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Trial Status Badge ────────────────────────────────────────

function TrialStatus({ user, lang }: { user: AdminUser; lang: "en" | "mk" }) {
  const c = t[lang];
  const d = c.days;

  if (user.plan > 0) {
    return <span className="text-xs text-green-600 font-medium">{c.active}</span>;
  }

  if (user.graceActive) {
    const daysLeft = user.graceEndsAt
      ? Math.ceil((new Date(user.graceEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 0;
    return (
      <span className="inline-flex items-center gap-1 text-xs text-yellow-600 font-medium">
        <Clock className="w-3 h-3" />
        Grace ({daysLeft}{d})
      </span>
    );
  }

  if (user.trialActive) {
    const daysLeft = user.trialEndsAt
      ? Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 0;
    return (
      <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium">
        <Clock className="w-3 h-3" />
        Trial ({daysLeft}{d})
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs text-destructive font-medium">
      <AlertTriangle className="w-3 h-3" />
      {c.expired}
    </span>
  );
}

// ── Plan Dropdown ─────────────────────────────────────────────

function PlanDropdown({ currentPlan, loading, onChange, lang }: {
  currentPlan: number;
  loading: boolean;
  onChange: (plan: number) => void;
  lang: "en" | "mk";
}) {
  const c = t[lang];
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="text-xs h-7 px-2 gap-1"
        onClick={() => setOpen(!open)}
        disabled={loading}
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ChevronDown className="w-3 h-3" />}
        {c.plan}
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-50 py-1 min-w-[120px]">
            {[0, 1, 2].map((plan) => (
              <button
                key={plan}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-muted/50 flex items-center gap-2 ${
                  plan === currentPlan ? "font-bold" : ""
                }`}
                onClick={() => {
                  onChange(plan);
                  setOpen(false);
                }}
              >
                {plan === currentPlan && <CheckCircle2 className="w-3 h-3 text-primary" />}
                <span className={plan !== currentPlan ? "ml-5" : ""}>{c.planNames[plan]}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Invoices Table ────────────────────────────────────────────

function InvoicesTable({ invoices, actionLoading, onMarkPaid, lang }: {
  invoices: AdminInvoice[];
  actionLoading: string | null;
  onMarkPaid: (invoiceId: string) => void;
  lang: "en" | "mk";
}) {
  const c = t[lang];
  const locale = lang === "mk" ? "mk-MK" : "en-US";

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    paid: "bg-green-100 text-green-700",
    cancelled: "bg-gray-100 text-gray-500",
    expired: "bg-red-100 text-red-700",
  };

  const statusLabels: Record<string, string> = {
    pending: c.statusPending,
    paid: c.statusPaid,
    cancelled: c.statusCancelled,
    expired: c.statusExpired,
  };

  return (
    <div className="rounded-xl border border-border overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50 text-left">
            <th className="px-4 py-3 font-medium text-muted-foreground">{c.invoice}</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">{c.client}</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">{c.plan}</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">{c.amount}</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">{c.status}</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">{c.date}</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">{c.actions}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {invoices.map((inv) => (
            <tr key={inv._id} className="hover:bg-muted/30">
              <td className="px-4 py-3">
                <div className="font-mono text-xs">{inv.invoiceNumber}</div>
                <div className="text-xs text-muted-foreground">{inv.paymentReference}</div>
              </td>
              <td className="px-4 py-3">
                <div className="font-medium">{inv.companyName}</div>
                <div className="text-xs text-muted-foreground">{inv.userEmail}</div>
                <div className="text-xs text-muted-foreground">{c.taxId} {inv.edb}</div>
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${planColors[inv.plan] || planColors[0]}`}>
                  {c.planNames[inv.plan]} · {inv.period === "annual" ? c.yearly : c.monthly}
                </span>
              </td>
              <td className="px-4 py-3 font-medium">
                {inv.amount.toLocaleString()} МКД
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[inv.status] || ""}`}>
                  {statusLabels[inv.status] || inv.status}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                {new Date(inv.createdAt).toLocaleDateString(locale)}
              </td>
              <td className="px-4 py-3">
                {inv.status === "pending" && (
                  <Button
                    size="sm"
                    className="text-xs h-7 gap-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => onMarkPaid(inv._id)}
                    disabled={actionLoading === `pay-${inv._id}`}
                  >
                    {actionLoading === `pay-${inv._id}` ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3" />
                    )}
                    {c.markPaid}
                  </Button>
                )}
              </td>
            </tr>
          ))}
          {invoices.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                {c.noInvoices}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
