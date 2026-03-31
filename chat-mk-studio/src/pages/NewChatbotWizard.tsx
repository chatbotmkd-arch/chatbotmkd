import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Bot, ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/language";
import LanguageToggle from "@/components/LanguageToggle";
import { api } from "@/lib/api";
import { WizardAnswers, WizardGroup } from "@/components/wizard/types";
import { getVisibleGroups } from "@/components/wizard/wizardConfig";
import { buildConfig, buildSystemPrompt } from "@/components/wizard/systemPromptBuilder";
import WizardStep from "@/components/wizard/WizardStep";
import UrlScanStep, { ScrapedBusinessInfo } from "@/components/wizard/UrlScanStep";

const purposeLabelsI18n = {
  en: {
    customer_support: "Customer Support",
    sales: "Sales",
    info_faq: "Info & FAQ",
    appointments: "Appointments",
    onboarding: "Onboarding",
  } as Record<string, string>,
  mk: {
    customer_support: "Корисничка поддршка",
    sales: "Продажба",
    info_faq: "Информации и FAQ",
    appointments: "Закажување термини",
    onboarding: "Onboarding",
  } as Record<string, string>,
};

const industryLabelsI18n = {
  en: {
    retail: "Retail / E-commerce",
    hospitality: "Hospitality / Hotels",
    healthcare: "Healthcare / Medicine",
    education: "Education",
    realestate: "Real Estate",
    finance: "Finance / Insurance",
    beauty: "Beauty / Cosmetics / Hair Salon",
    automotive: "Automotive",
    legal: "Legal Services",
    it_services: "IT / Technology",
    food: "Food / Restaurants / Delivery",
    other: "Other",
  } as Record<string, string>,
  mk: {
    retail: "Малопродажба / Е-трговија",
    hospitality: "Угостителство / Хотелиерство",
    healthcare: "Здравство / Медицина",
    education: "Образование",
    realestate: "Недвижности",
    finance: "Финансии / Осигурување",
    beauty: "Убавина / Козметика / Фризерство",
    automotive: "Автоиндустрија",
    legal: "Правни услуги",
    it_services: "ИТ / Технологија",
    food: "Храна / Ресторани / Достава",
    other: "Друго",
  } as Record<string, string>,
};

const toneLabelsI18n = {
  en: {
    professional: "Professional",
    friendly: "Friendly",
    casual: "Casual",
    formal: "Very Formal",
  } as Record<string, string>,
  mk: {
    professional: "Професионален",
    friendly: "Пријателски",
    casual: "Неформален",
    formal: "Многу формален",
  } as Record<string, string>,
};

const langLabelsI18n = {
  en: {
    mk: "Macedonian",
    mk_en: "Macedonian & English",
    en: "English",
    sq: "Albanian",
  } as Record<string, string>,
  mk: {
    mk: "Македонски",
    mk_en: "Македонски и Англиски",
    en: "Англиски",
    sq: "Албански",
  } as Record<string, string>,
};

const t = {
  en: {
    cancel: "Cancel",
    quickSetup: "Quick setup",
    review: "Review",
    back: "Back",
    createChatbot: "Create Chatbot",
    skip: "Skip",
    continue: "Continue",
    errorCreating: "Error creating chatbot",
    reviewTitle: "Review your chatbot",
    reviewDesc: "Review the information and edit the system prompt before creating.",
    business: "Business",
    industry: "Industry",
    description: "Description",
    phone: "Phone",
    location: "Location",
    workingHours: "Working hours",
    purpose: "Purpose",
    tone: "Tone",
    language: "Language",
    greeting: "Greeting",
    systemPromptDesc: "This is the \"brain\" of your chatbot — the instructions it follows. Feel free to edit, add or remove sections.",
    tip: "Tip: You can add specific rules, example responses, or information that the chatbot should know.",
  },
  mk: {
    cancel: "Откажи",
    quickSetup: "Брзо поставување",
    review: "Преглед",
    back: "Назад",
    createChatbot: "Создади Chatbot",
    skip: "Прескокни",
    continue: "Продолжи",
    errorCreating: "Грешка при креирање",
    reviewTitle: "Преглед на вашиот chatbot",
    reviewDesc: "Проверете ги информациите и уредете го system prompt-от пред да го создадете.",
    business: "Бизнис",
    industry: "Индустрија",
    description: "Опис",
    phone: "Телефон",
    location: "Локација",
    workingHours: "Работно време",
    purpose: "Цел",
    tone: "Тон",
    language: "Јазик",
    greeting: "Поздрав",
    systemPromptDesc: 'Ова е „мозокот" на вашиот chatbot — инструкциите по кои работи. Слободно уредете го, додајте или отстранете делови.',
    tip: "Совет: Можете да додадете специфични правила, примери за одговори, или информации што chatbot-от треба да ги знае.",
  },
};

const NewChatbotWizard = () => {
  const { user, loading: authLoading } = useAuth();
  const { lang } = useLanguage();
  const c = t[lang];
  const navigate = useNavigate();
  const [showUrlScan, setShowUrlScan] = useState(true);
  const [scannedInfo, setScannedInfo] = useState<ScrapedBusinessInfo | null>(null);
  const [answers, setAnswers] = useState<WizardAnswers>({});
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [showReview, setShowReview] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState("");
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  const handleScanComplete = (info: ScrapedBusinessInfo) => {
    setScannedInfo(info);
    setShowUrlScan(false);
  };

  const handleScanSkip = () => {
    setShowUrlScan(false);
  };

  const groups = useMemo(() => getVisibleGroups(answers, lang), [answers, lang]);
  const currentGroup = groups[currentGroupIndex];
  const totalGroups = groups.length;
  const progressPercent = showReview
    ? 100
    : totalGroups > 0
    ? Math.round(((currentGroupIndex + 1) / totalGroups) * 100)
    : 0;

  const isGroupValid = () => {
    if (!currentGroup) return false;
    return currentGroup.questions.every((q) => {
      if (!q.required) return true;
      const val = answers[q.id];
      if (val === undefined || val === "") return false;
      if (Array.isArray(val) && val.length === 0) return false;
      return true;
    });
  };

  const handleAnswer = (questionId: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (!isGroupValid()) return;
    setDirection(1);

    // Apply defaults for the next group's questions
    const newGroups = getVisibleGroups(answers, lang);
    const nextIdx = currentGroupIndex + 1;

    if (nextIdx >= newGroups.length) {
      setEditedPrompt(buildSystemPrompt(answers, scannedInfo));
      setShowReview(true);
      return;
    }

    // Apply default values for the next group
    const nextGroup = newGroups[nextIdx];
    const updatedAnswers = { ...answers };
    for (const q of nextGroup.questions) {
      if (q.defaultValue && updatedAnswers[q.id] === undefined) {
        updatedAnswers[q.id] = q.defaultValue(updatedAnswers);
      }
    }
    setAnswers(updatedAnswers);
    setCurrentGroupIndex(nextIdx);
  };

  const handleBack = () => {
    setDirection(-1);
    if (showReview) {
      setShowReview(false);
      return;
    }
    if (currentGroupIndex > 0) {
      setCurrentGroupIndex(currentGroupIndex - 1);
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    setError("");
    try {
      // Auto-generate bot name from business name
      const businessName = answers.business_name as string;
      const name = `${businessName} — Chatbot`;
      const { config, appearance } = buildConfig(answers);
      // Use the user-edited prompt instead of the auto-generated one
      config.systemPrompt = editedPrompt;
      const chatbot = await api.post<{ _id: string }>("/chatbots", {
        name,
        config,
        appearance,
        businessInfo: {
          businessName,
          phone: (answers.phone_number as string) || undefined,
          address: (answers.location_info as string) || undefined,
        },
      });
      navigate(`/dashboard/chatbot/${chatbot._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : c.errorCreating);
      setCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !showReview && !showUrlScan) {
      e.preventDefault();
      // Don't auto-advance if we have textareas in the current group
      const hasTextarea = currentGroup?.questions.some((q) => q.type === "textarea");
      if (!hasTextarea) {
        handleNext();
      }
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col" onKeyDown={handleKeyDown}>
      {/* Top nav */}
      <nav className="border-b border-border bg-card">
        <div className="container flex items-center justify-between h-16">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 font-display font-bold text-xl text-foreground"
          >
            <Bot className="w-7 h-7 text-primary" />
            NexaAI
          </Link>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              {c.cancel}
            </Button>
          </div>
        </div>
      </nav>

      {/* Progress */}
      <div className="border-b border-border bg-card/50">
        <div className="container py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              {showUrlScan
                ? c.quickSetup
                : showReview
                ? c.review
                : `${currentGroupIndex + 1} / ${totalGroups} — ${currentGroup?.name}`}
            </span>
            <span className="text-sm text-muted-foreground">
              {showUrlScan ? "" : `${progressPercent}%`}
            </span>
          </div>
          <Progress value={showUrlScan ? 0 : progressPercent} className="h-2" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 container max-w-2xl py-10 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait" initial={false}>
            {showUrlScan ? (
              <motion.div
                key="url-scan"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.2 }}
              >
                <UrlScanStep
                  onScanComplete={handleScanComplete}
                  onSkip={handleScanSkip}
                  lang={lang}
                />
              </motion.div>
            ) : showReview ? (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.2 }}
              >
                <ReviewScreen
                  answers={answers}
                  editedPrompt={editedPrompt}
                  onPromptChange={setEditedPrompt}
                  lang={lang}
                />
              </motion.div>
            ) : currentGroup ? (
              <motion.div
                key={`group-${currentGroupIndex}`}
                initial={{ opacity: 0, x: direction * 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -30 }}
                transition={{ duration: 0.2 }}
              >
                <GroupScreen
                  group={currentGroup}
                  answers={answers}
                  onAnswer={handleAnswer}
                  lang={lang}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm rounded-lg px-4 py-3 mt-4">
            {error}
          </div>
        )}

        {/* Bottom buttons */}
        <div className={`flex items-center justify-between pt-8 mt-8 border-t border-border ${showUrlScan ? "hidden" : ""}`}>
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentGroupIndex === 0 && !showReview}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {c.back}
          </Button>

          {showReview ? (
            <Button
              onClick={handleCreate}
              disabled={creating}
              className="gap-2 bg-gradient-accent text-white hover:opacity-90"
              size="lg"
            >
              {creating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {c.createChatbot}
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              {currentGroup && !currentGroup.questions.some((q) => q.required) && (
                <button
                  onClick={handleNext}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
                >
                  {c.skip}
                </button>
              )}
              <Button
                onClick={handleNext}
                disabled={!isGroupValid()}
                className="gap-2 bg-gradient-accent text-white hover:opacity-90"
              >
                {c.continue}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Group Screen ──────────────────────────────────────────────

interface GroupScreenProps {
  group: WizardGroup;
  answers: WizardAnswers;
  onAnswer: (questionId: string, value: string | string[]) => void;
  lang: "en" | "mk";
}

function GroupScreen({ group, answers, onAnswer, lang }: GroupScreenProps) {
  const isSingleQuestion = group.questions.length === 1;

  if (isSingleQuestion) {
    const question = group.questions[0];
    const value = answers[question.id] ?? (question.type === "checkbox" ? [] : "");
    return (
      <WizardStep
        question={question}
        answers={answers}
        value={value}
        onChange={(v) => onAnswer(question.id, v)}
        lang={lang}
      />
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="font-display font-bold text-2xl text-foreground">
        {group.name}
      </h2>

      <div className="space-y-6">
        {group.questions.map((question) => {
          const value = answers[question.id] ?? (question.type === "checkbox" ? [] : "");
          return (
            <WizardStep
              key={question.id}
              question={question}
              answers={answers}
              value={value}
              onChange={(v) => onAnswer(question.id, v)}
              compact
              lang={lang}
            />
          );
        })}
      </div>
    </div>
  );
}

// ── Review Screen ──────────────────────────────────────────────

interface ReviewScreenProps {
  answers: WizardAnswers;
  editedPrompt: string;
  onPromptChange: (prompt: string) => void;
  lang: "en" | "mk";
}

function ReviewScreen({ answers, editedPrompt, onPromptChange, lang }: ReviewScreenProps) {
  const c = t[lang];
  const purposeLabels = purposeLabelsI18n[lang];
  const industryLabels = industryLabelsI18n[lang];
  const toneLabels = toneLabelsI18n[lang];
  const langLabels = langLabelsI18n[lang];

  const rows: { label: string; value: string }[] = [
    { label: c.business, value: answers.business_name as string },
    { label: c.industry, value: industryLabels[answers.industry as string] || (answers.industry as string) },
    ...(answers.business_description ? [{ label: c.description, value: answers.business_description as string }] : []),
    ...(answers.phone_number ? [{ label: c.phone, value: answers.phone_number as string }] : []),
    ...(answers.location_info ? [{ label: c.location, value: answers.location_info as string }] : []),
    ...(answers.working_hours ? [{ label: c.workingHours, value: answers.working_hours as string }] : []),
    { label: c.purpose, value: purposeLabels[answers.bot_purpose as string] || (answers.bot_purpose as string) },
    { label: c.tone, value: toneLabels[answers.tone as string] || (answers.tone as string) },
    { label: c.language, value: langLabels[answers.language as string] || (answers.language as string) },
    ...(answers.greeting_message ? [{ label: c.greeting, value: answers.greeting_message as string }] : []),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display font-bold text-2xl text-foreground">
          {c.reviewTitle}
        </h2>
        <p className="text-muted-foreground mt-2">
          {c.reviewDesc}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {rows.map((row) => (
              <div key={row.label} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                <span className="text-sm font-medium text-muted-foreground min-w-[140px] shrink-0">
                  {row.label}
                </span>
                <span className="text-sm text-foreground">{row.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Editable system prompt */}
      <div className="space-y-3">
        <div>
          <h3 className="font-display font-semibold text-lg text-foreground">
            System Prompt
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {c.systemPromptDesc}
          </p>
        </div>
        <Textarea
          value={editedPrompt}
          onChange={(e) => onPromptChange(e.target.value)}
          className="font-mono text-sm leading-relaxed min-h-[350px] resize-y"
          placeholder="System prompt..."
        />
        <p className="text-xs text-muted-foreground">
          {c.tip}
        </p>
      </div>
    </div>
  );
}

export default NewChatbotWizard;
