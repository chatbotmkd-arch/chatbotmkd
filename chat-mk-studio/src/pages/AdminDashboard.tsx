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

const planNames: Record<number, string> = {
  0: "Бесплатен",
  1: "Стартер",
  2: "Про",
};

// ── Main Component ────────────────────────────────────────────

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
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
            <h2 className="text-xl font-bold mb-2">Пристап одбиен</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Link to="/dashboard">
              <Button variant="outline">Назад кон Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingInvoices = invoices.filter((i) => i.status === "pending");

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
          <Link to="/dashboard">
            <Button variant="outline" size="sm">Dashboard</Button>
          </Link>
        </div>
      </nav>

      <div className="container py-10">
        <h1 className="font-display font-bold text-3xl text-foreground mb-8">Admin Dashboard</h1>

        {/* Stats cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <StatCard icon={Users} label="Корисници" value={stats.totalTeams} />
            <StatCard icon={CreditCard} label="Платени" value={stats.paidTeams} />
            <StatCard icon={Bot} label="Chatbot-и" value={stats.totalChatbots} />
            <StatCard icon={MessageSquare} label="Пораки денес" value={stats.messagesToday} />
            <StatCard
              icon={Receipt}
              label="Чекаат плаќање"
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
            Корисници ({users.length})
          </Button>
          <Button
            variant={tab === "invoices" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("invoices")}
            className="gap-2"
          >
            <Receipt className="w-4 h-4" />
            Фактури
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
          />
        ) : (
          <InvoicesTable
            invoices={invoices}
            actionLoading={actionLoading}
            onMarkPaid={handleMarkPaid}
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

function UsersTable({ users, actionLoading, onChangePlan, onExtendGrace }: {
  users: AdminUser[];
  actionLoading: string | null;
  onChangePlan: (teamId: string, plan: number) => void;
  onExtendGrace: (teamId: string) => void;
}) {
  return (
    <div className="rounded-xl border border-border overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50 text-left">
            <th className="px-4 py-3 font-medium text-muted-foreground">#</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Корисник</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">План</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Статус</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Пораки</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Chatbot-и</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Регистриран</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Акции</th>
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
                    {planNames[u.plan] || "Бесплатен"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <TrialStatus user={u} />
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
                  {new Date(u.createdAt).toLocaleDateString("mk-MK")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <PlanDropdown
                      currentPlan={u.plan}
                      loading={actionLoading === `plan-${u.teamId}`}
                      onChange={(plan) => onChangePlan(u.teamId, plan)}
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
                        <span className="ml-1">+8д</span>
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

function TrialStatus({ user }: { user: AdminUser }) {
  if (user.plan > 0) {
    return <span className="text-xs text-green-600 font-medium">Активен</span>;
  }

  if (user.graceActive) {
    const daysLeft = user.graceEndsAt
      ? Math.ceil((new Date(user.graceEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 0;
    return (
      <span className="inline-flex items-center gap-1 text-xs text-yellow-600 font-medium">
        <Clock className="w-3 h-3" />
        Grace ({daysLeft}д)
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
        Trial ({daysLeft}д)
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs text-destructive font-medium">
      <AlertTriangle className="w-3 h-3" />
      Истечен
    </span>
  );
}

// ── Plan Dropdown ─────────────────────────────────────────────

function PlanDropdown({ currentPlan, loading, onChange }: {
  currentPlan: number;
  loading: boolean;
  onChange: (plan: number) => void;
}) {
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
        План
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
                <span className={plan !== currentPlan ? "ml-5" : ""}>{planNames[plan]}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Invoices Table ────────────────────────────────────────────

function InvoicesTable({ invoices, actionLoading, onMarkPaid }: {
  invoices: AdminInvoice[];
  actionLoading: string | null;
  onMarkPaid: (invoiceId: string) => void;
}) {
  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    paid: "bg-green-100 text-green-700",
    cancelled: "bg-gray-100 text-gray-500",
    expired: "bg-red-100 text-red-700",
  };

  const statusLabels: Record<string, string> = {
    pending: "Чека плаќање",
    paid: "Платена",
    cancelled: "Откажана",
    expired: "Истечена",
  };

  return (
    <div className="rounded-xl border border-border overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50 text-left">
            <th className="px-4 py-3 font-medium text-muted-foreground">Фактура</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Клиент</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">План</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Износ</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Статус</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Датум</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Акции</th>
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
                <div className="text-xs text-muted-foreground">ЕДБ: {inv.edb}</div>
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${planColors[inv.plan] || planColors[0]}`}>
                  {planNames[inv.plan]} · {inv.period === "annual" ? "годишно" : "месечно"}
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
                {new Date(inv.createdAt).toLocaleDateString("mk-MK")}
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
                    Платена
                  </Button>
                )}
              </td>
            </tr>
          ))}
          {invoices.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                Нема фактури
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
