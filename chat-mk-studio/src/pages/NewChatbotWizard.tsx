import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, ArrowLeft, ArrowRight, Loader2, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { WizardAnswers } from "@/components/wizard/types";
import { getVisibleQuestions, getStepGroups, INDUSTRY_QUESTION_IDS, PURPOSE_QUESTION_IDS } from "@/components/wizard/wizardConfig";
import { buildConfig, buildSystemPrompt } from "@/components/wizard/systemPromptBuilder";
import WizardStep from "@/components/wizard/WizardStep";

const purposeLabels: Record<string, string> = {
  customer_support: "Корисничка поддршка",
  sales: "Продажба",
  info_faq: "Информации и FAQ",
  appointments: "Закажување термини",
  onboarding: "Onboarding",
};

const industryLabels: Record<string, string> = {
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
};

const toneLabels: Record<string, string> = {
  professional: "Професионален",
  friendly: "Пријателски",
  casual: "Неформален",
  formal: "Многу формален",
};

const langLabels: Record<string, string> = {
  mk: "Македонски",
  mk_en: "Македонски и Англиски",
  en: "Англиски",
  sq: "Албански",
};

const NewChatbotWizard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<WizardAnswers>({});
  const [currentQuestionId, setCurrentQuestionId] = useState<string>("bot_name");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [showReview, setShowReview] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  const visibleQuestions = useMemo(() => getVisibleQuestions(answers), [answers]);
  const currentIndex = visibleQuestions.findIndex((q) => q.id === currentQuestionId);
  const currentQuestion = visibleQuestions[currentIndex];
  const stepGroups = useMemo(() => getStepGroups(visibleQuestions), [visibleQuestions]);
  const totalSteps = visibleQuestions.length;
  const progressPercent = showReview
    ? 100
    : totalSteps > 0
    ? Math.round(((currentIndex + 1) / totalSteps) * 100)
    : 0;

  // Find which group the current question belongs to
  const currentGroup = currentQuestion?.group || "";
  let groupStepNum = 0;
  for (const g of stepGroups) {
    if (g.name === currentGroup) break;
    groupStepNum += g.count;
  }

  const currentValue = currentQuestion ? answers[currentQuestion.id] : undefined;

  const isStepValid = () => {
    if (!currentQuestion) return false;
    if (!currentQuestion.required) return true;
    const val = answers[currentQuestion.id];
    if (val === undefined || val === "") return false;
    if (Array.isArray(val) && val.length === 0) return false;
    return true;
  };

  const handleAnswer = (value: string | string[]) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };

    // If a branching question changed, clear downstream conditional answers
    if (currentQuestion.id === "industry") {
      for (const id of INDUSTRY_QUESTION_IDS) delete newAnswers[id];
      // Also clear purpose-specific since they depend on industry × purpose
      for (const id of PURPOSE_QUESTION_IDS) delete newAnswers[id];
    }
    if (currentQuestion.id === "bot_purpose") {
      for (const id of PURPOSE_QUESTION_IDS) delete newAnswers[id];
    }
    if (currentQuestion.id === "unknown_answer") {
      if (value !== "admit_redirect" && value !== "admit_contact") {
        delete newAnswers.escalation_contact;
      }
    }

    setAnswers(newAnswers);

    // Apply default values for upcoming questions
    const newVisible = getVisibleQuestions(newAnswers);
    const nextIdx = newVisible.findIndex((q) => q.id === currentQuestion.id) + 1;
    if (nextIdx < newVisible.length) {
      const nextQ = newVisible[nextIdx];
      if (nextQ.defaultValue && newAnswers[nextQ.id] === undefined) {
        newAnswers[nextQ.id] = nextQ.defaultValue(newAnswers);
        setAnswers({ ...newAnswers });
      }
    }
  };

  const handleNext = () => {
    if (!isStepValid()) return;
    setDirection(1);

    if (currentIndex >= totalSteps - 1) {
      setShowReview(true);
      return;
    }

    const nextVisible = getVisibleQuestions(answers);
    const nextIdx = nextVisible.findIndex((q) => q.id === currentQuestionId) + 1;
    if (nextIdx < nextVisible.length) {
      const nextQ = nextVisible[nextIdx];
      // Apply default if the next question has one and no answer yet
      if (nextQ.defaultValue && answers[nextQ.id] === undefined) {
        setAnswers((prev) => ({
          ...prev,
          [nextQ.id]: nextQ.defaultValue!(prev),
        }));
      }
      setCurrentQuestionId(nextQ.id);
    }
  };

  const handleBack = () => {
    setDirection(-1);
    if (showReview) {
      setShowReview(false);
      return;
    }
    if (currentIndex > 0) {
      setCurrentQuestionId(visibleQuestions[currentIndex - 1].id);
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    setError("");
    try {
      const name = answers.bot_name as string;
      const { config, appearance } = buildConfig(answers);
      const chatbot = await api.post<{ _id: string }>("/chatbots", {
        name,
        config,
        appearance,
      });
      navigate(`/dashboard/chatbot/${chatbot._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка при креирање");
      setCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !showReview) {
      e.preventDefault();
      if (currentQuestion?.type !== "textarea") {
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
            ChatBot MK
          </Link>
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            Откажи
          </Button>
        </div>
      </nav>

      {/* Progress */}
      <div className="border-b border-border bg-card/50">
        <div className="container py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              {showReview
                ? "Преглед"
                : `Чекор ${currentIndex + 1} од ${totalSteps} — ${currentGroup}`}
            </span>
            <span className="text-sm text-muted-foreground">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 container max-w-2xl py-10 flex flex-col">
        <div className="flex-1">
          <AnimatePresence mode="wait" initial={false}>
            {showReview ? (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.2 }}
              >
                <ReviewScreen
                  answers={answers}
                  showPrompt={showPrompt}
                  onTogglePrompt={() => setShowPrompt(!showPrompt)}
                />
              </motion.div>
            ) : currentQuestion ? (
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: direction * 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -30 }}
                transition={{ duration: 0.2 }}
              >
                <WizardStep
                  question={currentQuestion}
                  answers={answers}
                  value={currentValue ?? (currentQuestion.type === "checkbox" ? [] : "")}
                  onChange={handleAnswer}
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
        <div className="flex items-center justify-between pt-8 mt-8 border-t border-border">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentIndex === 0 && !showReview}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад
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
              Создади Chatbot
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="gap-2 bg-gradient-accent text-white hover:opacity-90"
            >
              Продолжи
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Review Screen ──────────────────────────────────────────────

interface ReviewScreenProps {
  answers: WizardAnswers;
  showPrompt: boolean;
  onTogglePrompt: () => void;
}

function ReviewScreen({ answers, showPrompt, onTogglePrompt }: ReviewScreenProps) {
  const prompt = buildSystemPrompt(answers);

  const rows: { label: string; value: string }[] = [
    { label: "Име на chatbot", value: answers.bot_name as string },
    { label: "Бизнис", value: answers.business_name as string },
    ...(answers.phone_number ? [{ label: "Телефон", value: answers.phone_number as string }] : []),
    ...(answers.location_info ? [{ label: "Локација", value: answers.location_info as string }] : []),
    { label: "Работно време", value: answers.working_hours as string },
    { label: "Индустрија", value: industryLabels[answers.industry as string] || (answers.industry as string) },
    { label: "Опис", value: answers.business_description as string },
    { label: "Цел", value: purposeLabels[answers.bot_purpose as string] || (answers.bot_purpose as string) },
    { label: "Тон", value: toneLabels[answers.tone as string] || (answers.tone as string) },
    { label: "Јазик", value: langLabels[answers.language as string] || (answers.language as string) },
    { label: "Поздрав", value: answers.greeting_message as string },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display font-bold text-2xl text-foreground">
          Преглед на вашиот chatbot
        </h2>
        <p className="text-muted-foreground mt-2">
          Проверете ги информациите пред да го создадете.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
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

      {/* System prompt preview */}
      <button
        onClick={onTogglePrompt}
        className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
      >
        {showPrompt ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {showPrompt ? "Сокриј го system prompt-от" : "Прегледај го генерираниот system prompt"}
      </button>

      {showPrompt && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <pre className="text-xs text-foreground whitespace-pre-wrap font-mono leading-relaxed">
              {prompt}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default NewChatbotWizard;
