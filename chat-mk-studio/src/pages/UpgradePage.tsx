import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bot, ArrowLeft, Loader2, Check, X, Clock, FileText,
  CreditCard, Building2, Copy, ArrowUpRight, AlertTriangle,
} from "lucide-react";
import { useAuth, PLAN_NAMES } from "@/lib/auth";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Invoice {
  _id: string;
  invoiceNumber: string;
  paymentReference: string;
  plan: number;
  period: "monthly" | "annual";
  amount: number;
  currency: string;
  companyName: string;
  companyAddress: string;
  companyCity: string;
  edb: string;
  contactEmail: string;
  contactPhone?: string;
  status: "pending" | "paid" | "cancelled" | "expired";
  createdAt: string;
  paidAt?: string;
}

interface BankDetails {
  bankName: string;
  accountHolder: string;
  iban: string;
  swift: string;
  purpose: string;
}

interface UpgradeStatus {
  currentPlan: number;
  pendingInvoice: Invoice | null;
  bankDetails?: BankDetails;
}

const PLAN_PRICES = {
  1: { monthly: 700, annual: 6000 },
  2: { monthly: 1200, annual: 12000 },
};

const UpgradePage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // State
  const [status, setStatus] = useState<UpgradeStatus | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  // Which view: "select" → "form" → "done"
  const [step, setStep] = useState<"select" | "form" | "done">("select");

  // Selection
  const [selectedPlan, setSelectedPlan] = useState<1 | 2>(1);
  const [selectedPeriod, setSelectedPeriod] = useState<"monthly" | "annual">("monthly");

  // Billing form
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyCity, setCompanyCity] = useState("");
  const [edb, setEdb] = useState("");
  const [contactEmail, setContactEmail] = useState(user?.email || "");
  const [contactPhone, setContactPhone] = useState("");

  // Created invoice result
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user) {
      setContactEmail(user.email);
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [statusData, invoicesData] = await Promise.all([
        api.get<UpgradeStatus>("/invoices/upgrade-status"),
        api.get<Invoice[]>("/invoices"),
      ]);
      setStatus(statusData);
      setInvoices(invoicesData);

      // If there's a pending invoice, show it
      if (statusData.pendingInvoice) {
        setCreatedInvoice(statusData.pendingInvoice);
        setBankDetails(statusData.bankDetails || null);
        setStep("done");
      }
    } catch {
      // ignore
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleCreateInvoice = async () => {
    setCreating(true);
    setError("");
    try {
      const data = await api.post<{ invoice: Invoice; bankDetails: BankDetails; planName: string }>(
        "/invoices",
        {
          plan: selectedPlan,
          period: selectedPeriod,
          companyName,
          companyAddress,
          companyCity,
          edb,
          contactEmail,
          contactPhone,
        }
      );
      setCreatedInvoice(data.invoice);
      setBankDetails(data.bankDetails);
      setStep("done");
      // Reload invoices list
      const inv = await api.get<Invoice[]>("/invoices");
      setInvoices(inv);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка при генерирање.");
    } finally {
      setCreating(false);
    }
  };

  const handleCancelInvoice = async (id: string) => {
    try {
      await api.post(`/invoices/${id}/cancel`);
      setCreatedInvoice(null);
      setStep("select");
      const inv = await api.get<Invoice[]>("/invoices");
      setInvoices(inv);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка.");
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(""), 2000);
  };

  if (authLoading || !user || loadingStatus) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const currentPlan = status?.currentPlan ?? 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <nav className="border-b border-border bg-card">
        <div className="container flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center gap-2 font-display font-bold text-xl text-foreground">
            <Bot className="w-7 h-7 text-primary" />
            ChatBot MK
          </Link>
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Назад
          </Button>
        </div>
      </nav>

      <div className="container max-w-3xl py-10">
        <h1 className="font-display font-bold text-3xl text-foreground mb-2">Надградете го вашиот план</h1>
        <p className="text-muted-foreground mb-8">
          Моментален план: <span className="font-semibold text-foreground">{PLAN_NAMES[currentPlan]}</span>
        </p>

        {error && (
          <div className="mb-6 bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="ghost" size="sm" className="ml-auto shrink-0" onClick={() => setError("")}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* ─── STEP 1: Select plan ─── */}
        {step === "select" && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {([1, 2] as const).map((plan) => {
                const prices = PLAN_PRICES[plan];
                const isCurrentOrLower = plan <= currentPlan;
                return (
                  <Card
                    key={plan}
                    className={cn(
                      "cursor-pointer transition-all",
                      selectedPlan === plan && !isCurrentOrLower
                        ? "border-primary shadow-lg shadow-primary/10"
                        : "border-border",
                      isCurrentOrLower && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => !isCurrentOrLower && setSelectedPlan(plan)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="font-display text-xl">{PLAN_NAMES[plan]}</CardTitle>
                        {isCurrentOrLower && (
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                            {plan === currentPlan ? "Моментален" : "Понизок"}
                          </span>
                        )}
                        {selectedPlan === plan && !isCurrentOrLower && (
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <span className="font-display font-bold text-3xl text-foreground">
                          {selectedPeriod === "annual" ? prices.annual.toLocaleString() : prices.monthly.toLocaleString()}
                        </span>
                        <span className="text-sm text-muted-foreground ml-1">
                          МКД {selectedPeriod === "annual" ? "/годишно" : "/месечно"}
                        </span>
                      </div>
                      <ul className="space-y-1.5 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> {plan === 1 ? "300" : "500"} кредити (пораки) месечно</li>
                        <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> {plan === 1 ? "3" : "10"} chatbot-и</li>
                        <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> {plan === 1 ? "10" : "50"} извори</li>
                        <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> Сите интеграции</li>
                        {plan === 2 && <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> Приоритетна поддршка</li>}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Period toggle */}
            <div className="flex items-center justify-center gap-3">
              <span className={cn("text-sm font-medium", selectedPeriod === "monthly" ? "text-foreground" : "text-muted-foreground")}>
                Месечно
              </span>
              <button
                onClick={() => setSelectedPeriod(selectedPeriod === "monthly" ? "annual" : "monthly")}
                className={cn(
                  "relative w-12 h-6 rounded-full transition-colors",
                  selectedPeriod === "annual" ? "bg-primary" : "bg-border"
                )}
              >
                <span className={cn(
                  "absolute top-0.5 w-5 h-5 rounded-full bg-background transition-transform shadow-sm",
                  selectedPeriod === "annual" ? "translate-x-6" : "translate-x-0.5"
                )} />
              </button>
              <span className={cn("text-sm font-medium", selectedPeriod === "annual" ? "text-foreground" : "text-muted-foreground")}>
                Годишно <span className="text-primary text-xs font-semibold">Заштеди</span>
              </span>
            </div>

            <Button
              onClick={() => setStep("form")}
              className="w-full gap-2 bg-gradient-accent text-white hover:opacity-90"
              size="lg"
              disabled={selectedPlan <= currentPlan}
            >
              <CreditCard className="w-4 h-4" />
              Продолжи кон плаќање
            </Button>
          </div>
        )}

        {/* ─── STEP 2: Billing form ─── */}
        {step === "form" && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="sm" onClick={() => setStep("select")} className="gap-1">
                <ArrowLeft className="w-4 h-4" />
                Назад
              </Button>
              <span className="text-sm text-muted-foreground">
                {PLAN_NAMES[selectedPlan]} · {selectedPeriod === "annual" ? "Годишно" : "Месечно"} ·{" "}
                <span className="font-semibold text-foreground">
                  {PLAN_PRICES[selectedPlan][selectedPeriod].toLocaleString()} МКД
                </span>
              </span>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="w-5 h-5 text-primary" />
                  Податоци за фактурирање
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">Назив на фирма *</Label>
                    <Input
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="нпр. Мебел Дизајн ДООЕЛ"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edb">ЕДБ (Единствен Даночен Број) *</Label>
                    <Input
                      id="edb"
                      value={edb}
                      onChange={(e) => setEdb(e.target.value)}
                      placeholder="нпр. MK4030990123456"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="companyAddress">Адреса *</Label>
                  <Input
                    id="companyAddress"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    placeholder="нпр. ул. Македонија 5"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyCity">Град *</Label>
                    <Input
                      id="companyCity"
                      value={companyCity}
                      onChange={(e) => setCompanyCity(e.target.value)}
                      placeholder="нпр. Скопје"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPhone">Телефон</Label>
                    <Input
                      id="contactPhone"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="нпр. 070 123 456"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="contactEmail">Email за фактура *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="info@kompanija.mk"
                  />
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleCreateInvoice}
              disabled={creating || !companyName || !companyAddress || !companyCity || !edb || !contactEmail}
              className="w-full gap-2 bg-gradient-accent text-white hover:opacity-90"
              size="lg"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              Генерирај про-фактура
            </Button>
          </div>
        )}

        {/* ─── STEP 3: Invoice generated — payment instructions ─── */}
        {step === "done" && createdInvoice && (
          <div className="space-y-6">
            {createdInvoice.status === "pending" && (
              <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 flex items-start gap-3">
                <Clock className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Про-фактурата е генерирана. Извршете уплата за активирање.
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    По потврда на уплатата (1-2 работни дена), вашиот план ќе биде автоматски надграден.
                  </p>
                </div>
              </div>
            )}

            {createdInvoice.status === "paid" && (
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Уплатата е потврдена! Вашиот план е надграден.
                </p>
              </div>
            )}

            {/* Invoice card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="w-5 h-5 text-primary" />
                    Про-фактура {createdInvoice.invoiceNumber}
                  </CardTitle>
                  <span className={cn(
                    "text-xs font-medium px-2.5 py-1 rounded-full",
                    createdInvoice.status === "pending" && "bg-yellow-100 text-yellow-700",
                    createdInvoice.status === "paid" && "bg-green-100 text-green-700",
                    createdInvoice.status === "cancelled" && "bg-red-100 text-red-700",
                  )}>
                    {createdInvoice.status === "pending" && "Чека уплата"}
                    {createdInvoice.status === "paid" && "Платена"}
                    {createdInvoice.status === "cancelled" && "Откажана"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">План</span>
                    <p className="font-medium">{PLAN_NAMES[createdInvoice.plan]}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Период</span>
                    <p className="font-medium">{createdInvoice.period === "annual" ? "Годишно" : "Месечно"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Износ</span>
                    <p className="font-bold text-lg">{createdInvoice.amount.toLocaleString()} {createdInvoice.currency}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Датум</span>
                    <p className="font-medium">{new Date(createdInvoice.createdAt).toLocaleDateString("mk-MK")}</p>
                  </div>
                </div>

                <div className="border-t pt-4 text-sm">
                  <span className="text-muted-foreground">Фирма</span>
                  <p className="font-medium">{createdInvoice.companyName}</p>
                  <p className="text-muted-foreground">{createdInvoice.companyAddress}, {createdInvoice.companyCity}</p>
                  <p className="text-muted-foreground">ЕДБ: {createdInvoice.edb}</p>
                </div>
              </CardContent>
            </Card>

            {/* Payment instructions */}
            {createdInvoice.status === "pending" && bankDetails && (
              <Card className="border-primary/30 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Инструкции за уплата
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <PaymentRow
                    label="Примач"
                    value={bankDetails.accountHolder}
                    onCopy={() => copyToClipboard(bankDetails.accountHolder, "holder")}
                    isCopied={copied === "holder"}
                  />
                  <PaymentRow
                    label="Банка"
                    value={bankDetails.bankName}
                    onCopy={() => copyToClipboard(bankDetails.bankName, "bank")}
                    isCopied={copied === "bank"}
                  />
                  <PaymentRow
                    label="IBAN / Сметка"
                    value={bankDetails.iban}
                    onCopy={() => copyToClipboard(bankDetails.iban, "iban")}
                    isCopied={copied === "iban"}
                  />
                  <PaymentRow
                    label="SWIFT"
                    value={bankDetails.swift}
                    onCopy={() => copyToClipboard(bankDetails.swift, "swift")}
                    isCopied={copied === "swift"}
                  />
                  <PaymentRow
                    label="Износ"
                    value={`${createdInvoice.amount.toLocaleString()} ${createdInvoice.currency}`}
                    onCopy={() => copyToClipboard(String(createdInvoice.amount), "amount")}
                    isCopied={copied === "amount"}
                  />
                  <div className="border-t pt-3">
                    <PaymentRow
                      label="Повикување на број (цел на дознака)"
                      value={createdInvoice.paymentReference}
                      onCopy={() => copyToClipboard(createdInvoice.paymentReference, "ref")}
                      isCopied={copied === "ref"}
                      highlight
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Задолжително внесете го бројот <strong>{createdInvoice.paymentReference}</strong> во
                    полето „цел на дознака" / „повикување на број" при уплатата, за да можеме да ја идентификуваме вашата уплата.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              {createdInvoice.status === "pending" && (
                <Button
                  variant="outline"
                  onClick={() => handleCancelInvoice(createdInvoice._id)}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Откажи про-фактура
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setCreatedInvoice(null);
                  setStep("select");
                }}
                className="gap-2"
              >
                {createdInvoice.status === "pending" ? "Генерирај нова" : "Назад"}
              </Button>
            </div>
          </div>
        )}

        {/* ─── Past invoices ─── */}
        {invoices.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display font-bold text-xl text-foreground mb-4">Историја на про-фактури</h2>
            <div className="space-y-3">
              {invoices.map((inv) => (
                <Card key={inv._id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{inv.invoiceNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {PLAN_NAMES[inv.plan]} · {inv.period === "annual" ? "Годишно" : "Месечно"} · {new Date(inv.createdAt).toLocaleDateString("mk-MK")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{inv.amount.toLocaleString()} МКД</span>
                      <span className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full",
                        inv.status === "pending" && "bg-yellow-100 text-yellow-700",
                        inv.status === "paid" && "bg-green-100 text-green-700",
                        inv.status === "cancelled" && "bg-red-100 text-red-700",
                        inv.status === "expired" && "bg-gray-100 text-gray-700",
                      )}>
                        {inv.status === "pending" && "Чека"}
                        {inv.status === "paid" && "Платена"}
                        {inv.status === "cancelled" && "Откажана"}
                        {inv.status === "expired" && "Истечена"}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setStep("done");
                          // Load this specific invoice
                          api
                            .get<{ invoice: Invoice; bankDetails: BankDetails }>(`/invoices/${inv._id}`)
                            .then((data) => {
                              setCreatedInvoice(data.invoice);
                              setBankDetails(data.bankDetails);
                            });
                        }}
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Helper component for payment detail rows ──

function PaymentRow({
  label,
  value,
  onCopy,
  isCopied,
  highlight,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  isCopied: boolean;
  highlight?: boolean;
}) {
  return (
    <div className={cn(
      "flex items-center justify-between gap-4 py-1.5",
      highlight && "bg-primary/10 rounded-lg px-3 py-2"
    )}>
      <div>
        <span className="text-xs text-muted-foreground">{label}</span>
        <p className={cn("text-sm font-medium", highlight && "text-primary font-bold text-base")}>{value}</p>
      </div>
      <Button variant="ghost" size="sm" onClick={onCopy} className="shrink-0 h-8 w-8 p-0">
        {isCopied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
      </Button>
    </div>
  );
}

export default UpgradePage;
