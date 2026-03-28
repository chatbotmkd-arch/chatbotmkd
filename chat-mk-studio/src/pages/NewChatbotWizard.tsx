import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Bot, ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { WizardAnswers, WizardGroup } from "@/components/wizard/types";
import { getVisibleGroups, INDUSTRY_QUESTION_IDS, PURPOSE_QUESTION_IDS } from "@/components/wizard/wizardConfig";
import { buildConfig, buildSystemPrompt } from "@/components/wizard/systemPromptBuilder";
import WizardStep from "@/components/wizard/WizardStep";
import UrlScanStep from "@/components/wizard/UrlScanStep";

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
  const [showUrlScan, setShowUrlScan] = useState(true);
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

  const handleScanComplete = (prefilled: Partial<WizardAnswers>) => {
    setAnswers(prefilled as WizardAnswers);
    setShowUrlScan(false);
  };

  const handleScanSkip = () => {
    setShowUrlScan(false);
  };

  const groups = useMemo(() => getVisibleGroups(answers), [answers]);
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
    const newAnswers = { ...answers, [questionId]: value };

    // Branching cleanup
    if (questionId === "industry") {
      for (const id of INDUSTRY_QUESTION_IDS) delete newAnswers[id];
      for (const id of PURPOSE_QUESTION_IDS) delete newAnswers[id];
    }
    if (questionId === "bot_purpose") {
      for (const id of PURPOSE_QUESTION_IDS) delete newAnswers[id];
    }

    setAnswers(newAnswers);

    // Apply defaults for newly-visible questions in the next group
    const newGroups = getVisibleGroups(newAnswers);
    const nextGroupIdx = currentGroupIndex + 1;
    if (nextGroupIdx < newGroups.length) {
      const nextGroup = newGroups[nextGroupIdx];
      for (const q of nextGroup.questions) {
        if (q.defaultValue && newAnswers[q.id] === undefined) {
          newAnswers[q.id] = q.defaultValue(newAnswers);
        }
      }
      setAnswers({ ...newAnswers });
    }
  };

  const handleNext = () => {
    if (!isGroupValid()) return;
    setDirection(1);

    // Apply defaults for the next group's questions
    const newGroups = getVisibleGroups(answers);
    const nextIdx = currentGroupIndex + 1;

    if (nextIdx >= newGroups.length) {
      setEditedPrompt(buildSystemPrompt(answers));
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
      setError(err instanceof Error ? err.message : "Грешка при креирање");
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
              {showUrlScan
                ? "Брзо поставување"
                : showReview
                ? "Преглед"
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
            <div className="flex items-center gap-3">
              {currentGroup && !currentGroup.questions.some((q) => q.required) && (
                <button
                  onClick={handleNext}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
                >
                  Прескокни
                </button>
              )}
              <Button
                onClick={handleNext}
                disabled={!isGroupValid()}
                className="gap-2 bg-gradient-accent text-white hover:opacity-90"
              >
                Продолжи
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
}

function GroupScreen({ group, answers, onAnswer }: GroupScreenProps) {
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
}

function ReviewScreen({ answers, editedPrompt, onPromptChange }: ReviewScreenProps) {
  const rows: { label: string; value: string }[] = [
    { label: "Бизнис", value: answers.business_name as string },
    { label: "Индустрија", value: industryLabels[answers.industry as string] || (answers.industry as string) },
    ...(answers.business_description ? [{ label: "Опис", value: answers.business_description as string }] : []),
    ...(answers.phone_number ? [{ label: "Телефон", value: answers.phone_number as string }] : []),
    ...(answers.location_info ? [{ label: "Локација", value: answers.location_info as string }] : []),
    ...(answers.working_hours ? [{ label: "Работно време", value: answers.working_hours as string }] : []),
    { label: "Цел", value: purposeLabels[answers.bot_purpose as string] || (answers.bot_purpose as string) },
    { label: "Тон", value: toneLabels[answers.tone as string] || (answers.tone as string) },
    { label: "Јазик", value: langLabels[answers.language as string] || (answers.language as string) },
    ...(answers.greeting_message ? [{ label: "Поздрав", value: answers.greeting_message as string }] : []),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display font-bold text-2xl text-foreground">
          Преглед на вашиот chatbot
        </h2>
        <p className="text-muted-foreground mt-2">
          Проверете ги информациите и уредете го system prompt-от пред да го создадете.
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
            Ова е „мозокот" на вашиот chatbot — инструкциите по кои работи.
            Слободно уредете го, додајте или отстранете делови.
          </p>
        </div>
        <Textarea
          value={editedPrompt}
          onChange={(e) => onPromptChange(e.target.value)}
          className="font-mono text-sm leading-relaxed min-h-[350px] resize-y"
          placeholder="System prompt..."
        />
        <p className="text-xs text-muted-foreground">
          Совет: Можете да додадете специфични правила, примери за одговори, или информации
          што chatbot-от треба да ги знае.
        </p>
      </div>
    </div>
  );
}

export default NewChatbotWizard;
