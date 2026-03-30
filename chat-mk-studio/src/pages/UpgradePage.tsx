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
import { useLanguage } from "@/lib/language";
import LanguageToggle from "@/components/LanguageToggle";

const t = {
  en: {
    back: "Back",
    upgradeTitle: "Upgrade your plan",
    currentPlan: "Current plan:",
    errorGenerating: "Error generating invoice.",
    errorGeneric: "Error.",
    current: "Current",
    lower: "Lower",
    mkdYearly: "MKD /yearly",
    mkdMonthly: "MKD /monthly",
    creditsMonthly: "credits (messages) per month",
    chatbots: "chatbots",
    sources: "sources",
    allIntegrations: "All integrations",
    prioritySupport: "Priority support",
    monthly: "Monthly",
    yearly: "Yearly",
    annual: "Annual",
    save: "Save",
    continueToPayment: "Continue to payment",
    billingDetails: "Billing details",
    companyName: "Company name *",
    taxId: "Tax ID (EDB) *",
    address: "Address *",
    city: "City *",
    phone: "Phone",
    invoiceEmail: "Invoice email *",
    generateProInvoice: "Generate pro-invoice",
    proInvoiceGenerated: "Pro-invoice generated. Make a payment to activate.",
    afterPaymentConfirmation: "After payment confirmation (1-2 business days), your plan will be automatically upgraded.",
    paymentConfirmed: "Payment confirmed! Your plan has been upgraded.",
    proInvoice: "Pro-invoice",
    awaitingPayment: "Awaiting payment",
    paid: "Paid",
    cancelled: "Cancelled",
    plan: "Plan",
    period: "Period",
    amount: "Amount",
    date: "Date",
    company: "Company",
    taxIdLabel: "Tax ID:",
    paymentInstructions: "Payment instructions",
    recipient: "Recipient",
    bank: "Bank",
    ibanAccount: "IBAN / Account",
    referenceNumber: "Reference number (payment purpose)",
    mandatoryRefNote: (ref: string) =>
      `You must enter the number ${ref} in the "payment purpose" / "reference number" field when making the payment, so we can identify your payment.`,
    cancelProInvoice: "Cancel pro-invoice",
    generateNew: "Generate new",
    invoiceHistory: "Invoice history",
    pending: "Pending",
    expired: "Expired",
    // Placeholders
    placeholderCompany: "e.g. Acme Corp",
    placeholderEdb: "e.g. MK4030990123456",
    placeholderAddress: "e.g. 123 Main St",
    placeholderCity: "e.g. Skopje",
    placeholderPhone: "e.g. 070 123 456",
    placeholderEmail: "info@company.com",
    // Date locale
    dateLocale: "en-US" as const,
  },
  mk: {
    back: "Назад",
    upgradeTitle: "Надградете го вашиот план",
    currentPlan: "Моментален план:",
    errorGenerating: "Грешка при генерирање.",
    errorGeneric: "Грешка.",
    current: "Моментален",
    lower: "Понизок",
    mkdYearly: "МКД /годишно",
    mkdMonthly: "МКД /месечно",
    creditsMonthly: "кредити (пораки) месечно",
    chatbots: "chatbot-и",
    sources: "извори",
    allIntegrations: "Сите интеграции",
    prioritySupport: "Приоритетна поддршка",
    monthly: "Месечно",
    yearly: "Годишно",
    annual: "Годишно",
    save: "Заштеди",
    continueToPayment: "Продолжи кон плаќање",
    billingDetails: "Податоци за фактурирање",
    companyName: "Назив на фирма *",
    taxId: "ЕДБ (Единствен Даночен Број) *",
    address: "Адреса *",
    city: "Град *",
    phone: "Телефон",
    invoiceEmail: "Email за фактура *",
    generateProInvoice: "Генерирај про-фактура",
    proInvoiceGenerated: "Про-фактурата е генерирана. Извршете уплата за активирање.",
    afterPaymentConfirmation: "По потврда на уплатата (1-2 работни дена), вашиот план ќе биде автоматски надграден.",
    paymentConfirmed: "Уплатата е потврдена! Вашиот план е надграден.",
    proInvoice: "Про-фактура",
    awaitingPayment: "Чека уплата",
    paid: "Платена",
    cancelled: "Откажана",
    plan: "План",
    period: "Период",
    amount: "Износ",
    date: "Датум",
    company: "Фирма",
    taxIdLabel: "ЕДБ:",
    paymentInstructions: "Инструкции за уплата",
    recipient: "Примач",
    bank: "Банка",
    ibanAccount: "IBAN / Сметка",
    referenceNumber: "Повикување на број (цел на дознака)",
    mandatoryRefNote: (ref: string) =>
      `Задолжително внесете го бројот ${ref} во полето „цел на дознака" / „повикување на број" при уплатата, за да можеме да ја идентификуваме вашата уплата.`,
    cancelProInvoice: "Откажи про-фактура",
    generateNew: "Генерирај нова",
    invoiceHistory: "Историја на про-фактури",
    pending: "Чека",
    expired: "Истечена",
    // Placeholders
    placeholderCompany: "нпр. Мебел Дизајн ДООЕЛ",
    placeholderEdb: "нпр. MK4030990123456",
    placeholderAddress: "нпр. ул. Македонија 5",
    placeholderCity: "нпр. Скопје",
    placeholderPhone: "нпр. 070 123 456",
    placeholderEmail: "info@kompanija.mk",
    // Date locale
    dateLocale: "mk-MK" as const,
  },
};

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
  const { lang } = useLanguage();
  const c = t[lang];

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
      setError(err instanceof Error ? err.message : c.errorGenerating);
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
      setError(err instanceof Error ? err.message : c.errorGeneric);
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
            NexaAI
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {c.back}
            </Button>
          </div>
        </div>
      </nav>

      <div className="container max-w-3xl py-10">
        <h1 className="font-display font-bold text-3xl text-foreground mb-2">{c.upgradeTitle}</h1>
        <p className="text-muted-foreground mb-8">
          {c.currentPlan} <span className="font-semibold text-foreground">{PLAN_NAMES[currentPlan]}</span>
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
                            {plan === currentPlan ? c.current : c.lower}
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
                          {selectedPeriod === "annual" ? c.mkdYearly : c.mkdMonthly}
                        </span>
                      </div>
                      <ul className="space-y-1.5 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> {plan === 1 ? "300" : "500"} {c.creditsMonthly}</li>
                        <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> {plan === 1 ? "3" : "10"} {c.chatbots}</li>
                        <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> {plan === 1 ? "10" : "50"} {c.sources}</li>
                        <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> {c.allIntegrations}</li>
                        {plan === 2 && <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> {c.prioritySupport}</li>}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Period toggle */}
            <div className="flex items-center justify-center gap-3">
              <span className={cn("text-sm font-medium", selectedPeriod === "monthly" ? "text-foreground" : "text-muted-foreground")}>
                {c.monthly}
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
                {c.yearly} <span className="text-primary text-xs font-semibold">{c.save}</span>
              </span>
            </div>

            <Button
              onClick={() => setStep("form")}
              className="w-full gap-2 bg-gradient-accent text-white hover:opacity-90"
              size="lg"
              disabled={selectedPlan <= currentPlan}
            >
              <CreditCard className="w-4 h-4" />
              {c.continueToPayment}
            </Button>
          </div>
        )}

        {/* ─── STEP 2: Billing form ─── */}
        {step === "form" && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="sm" onClick={() => setStep("select")} className="gap-1">
                <ArrowLeft className="w-4 h-4" />
                {c.back}
              </Button>
              <span className="text-sm text-muted-foreground">
                {PLAN_NAMES[selectedPlan]} · {selectedPeriod === "annual" ? c.annual : c.monthly} ·{" "}
                <span className="font-semibold text-foreground">
                  {PLAN_PRICES[selectedPlan][selectedPeriod].toLocaleString()} МКД
                </span>
              </span>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="w-5 h-5 text-primary" />
                  {c.billingDetails}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">{c.companyName}</Label>
                    <Input
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder={c.placeholderCompany}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edb">{c.taxId}</Label>
                    <Input
                      id="edb"
                      value={edb}
                      onChange={(e) => setEdb(e.target.value)}
                      placeholder={c.placeholderEdb}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="companyAddress">{c.address}</Label>
                  <Input
                    id="companyAddress"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    placeholder={c.placeholderAddress}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyCity">{c.city}</Label>
                    <Input
                      id="companyCity"
                      value={companyCity}
                      onChange={(e) => setCompanyCity(e.target.value)}
                      placeholder={c.placeholderCity}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPhone">{c.phone}</Label>
                    <Input
                      id="contactPhone"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder={c.placeholderPhone}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="contactEmail">{c.invoiceEmail}</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder={c.placeholderEmail}
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
              {c.generateProInvoice}
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
                    {c.proInvoiceGenerated}
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    {c.afterPaymentConfirmation}
                  </p>
                </div>
              </div>
            )}

            {createdInvoice.status === "paid" && (
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  {c.paymentConfirmed}
                </p>
              </div>
            )}

            {/* Invoice card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="w-5 h-5 text-primary" />
                    {c.proInvoice} {createdInvoice.invoiceNumber}
                  </CardTitle>
                  <span className={cn(
                    "text-xs font-medium px-2.5 py-1 rounded-full",
                    createdInvoice.status === "pending" && "bg-yellow-100 text-yellow-700",
                    createdInvoice.status === "paid" && "bg-green-100 text-green-700",
                    createdInvoice.status === "cancelled" && "bg-red-100 text-red-700",
                  )}>
                    {createdInvoice.status === "pending" && c.awaitingPayment}
                    {createdInvoice.status === "paid" && c.paid}
                    {createdInvoice.status === "cancelled" && c.cancelled}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">{c.plan}</span>
                    <p className="font-medium">{PLAN_NAMES[createdInvoice.plan]}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{c.period}</span>
                    <p className="font-medium">{createdInvoice.period === "annual" ? c.annual : c.monthly}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{c.amount}</span>
                    <p className="font-bold text-lg">{createdInvoice.amount.toLocaleString()} {createdInvoice.currency}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{c.date}</span>
                    <p className="font-medium">{new Date(createdInvoice.createdAt).toLocaleDateString(c.dateLocale)}</p>
                  </div>
                </div>

                <div className="border-t pt-4 text-sm">
                  <span className="text-muted-foreground">{c.company}</span>
                  <p className="font-medium">{createdInvoice.companyName}</p>
                  <p className="text-muted-foreground">{createdInvoice.companyAddress}, {createdInvoice.companyCity}</p>
                  <p className="text-muted-foreground">{c.taxIdLabel} {createdInvoice.edb}</p>
                </div>
              </CardContent>
            </Card>

            {/* Payment instructions */}
            {createdInvoice.status === "pending" && bankDetails && (
              <Card className="border-primary/30 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CreditCard className="w-5 h-5 text-primary" />
                    {c.paymentInstructions}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <PaymentRow
                    label={c.recipient}
                    value={bankDetails.accountHolder}
                    onCopy={() => copyToClipboard(bankDetails.accountHolder, "holder")}
                    isCopied={copied === "holder"}
                  />
                  <PaymentRow
                    label={c.bank}
                    value={bankDetails.bankName}
                    onCopy={() => copyToClipboard(bankDetails.bankName, "bank")}
                    isCopied={copied === "bank"}
                  />
                  <PaymentRow
                    label={c.ibanAccount}
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
                    label={c.amount}
                    value={`${createdInvoice.amount.toLocaleString()} ${createdInvoice.currency}`}
                    onCopy={() => copyToClipboard(String(createdInvoice.amount), "amount")}
                    isCopied={copied === "amount"}
                  />
                  <div className="border-t pt-3">
                    <PaymentRow
                      label={c.referenceNumber}
                      value={createdInvoice.paymentReference}
                      onCopy={() => copyToClipboard(createdInvoice.paymentReference, "ref")}
                      isCopied={copied === "ref"}
                      highlight
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {c.mandatoryRefNote(createdInvoice.paymentReference)}
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
                  {c.cancelProInvoice}
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
                {createdInvoice.status === "pending" ? c.generateNew : c.back}
              </Button>
            </div>
          </div>
        )}

        {/* ─── Past invoices ─── */}
        {invoices.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display font-bold text-xl text-foreground mb-4">{c.invoiceHistory}</h2>
            <div className="space-y-3">
              {invoices.map((inv) => (
                <Card key={inv._id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{inv.invoiceNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {PLAN_NAMES[inv.plan]} · {inv.period === "annual" ? c.annual : c.monthly} · {new Date(inv.createdAt).toLocaleDateString(c.dateLocale)}
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
                        {inv.status === "pending" && c.pending}
                        {inv.status === "paid" && c.paid}
                        {inv.status === "cancelled" && c.cancelled}
                        {inv.status === "expired" && c.expired}
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
