import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Bot, ArrowLeft, Save, Loader2, Trash2, Play, Pause,
  Globe, Facebook, Instagram, Plus, Copy, Check, Code,
  Database, RefreshCw, X, Send, MessageSquare, Link2, ExternalLink, BookOpen, Pencil,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/language";
import LanguageToggle from "@/components/LanguageToggle";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Chatbot {
  _id: string;
  name: string;
  slug?: string;
  status: "draft" | "active" | "paused";
  config: {
    model: string;
    systemPrompt: string;
    language: string;
    tone: string;
    temperature: number;
  };
  appearance: {
    primaryColor: string;
    greeting: string;
    placeholder: string;
    position: string;
  };
  allowedDomains: string[];
  createdAt: string;
}

interface Source {
  _id: string;
  type: "document" | "website" | "faq" | "text";
  name: string;
  status: "pending" | "processing" | "ready" | "error";
  errorMessage?: string;
  createdAt: string;
}

interface MetaConnection {
  _id: string;
  pageId: string;
  pageName: string;
  instagramAccountId?: string;
  status: "active" | "disconnected" | "error";
  chatbotId: string;
}

interface ConversationItem {
  _id: string;
  sessionId: string;
  channel: "web" | "facebook" | "instagram";
  status: "active" | "ended" | "escalated";
  messageCount: number;
  preview: string;
  lastMessageAt: string;
  createdAt: string;
}

interface ConvMessage {
  _id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

const t = {
  en: {
    // Status
    active: "Active",
    paused: "Paused",
    draft: "Draft",
    notFound: "Chatbot not found.",
    // Channel labels
    channelWeb: "Web",
    channelFacebook: "Facebook",
    channelInstagram: "Instagram",
    // Nav buttons
    pause: "Pause",
    activate: "Activate",
    saved: "Saved",
    save: "Save",
    // Errors
    errorLoading: "Error loading",
    errorSaving: "Error saving",
    errorActivating: "Error activating",
    errorPausing: "Error pausing",
    confirmDelete: "Are you sure you want to delete this chatbot?",
    errorDeleting: "Error deleting",
    errorAddingSource: "Error adding source",
    errorResyncing: "Error resyncing",
    errorGeneric: "Error",
    metaNotConfigured: "Meta integration is not configured",
    errorDisconnecting: "Error disconnecting",
    // Tabs
    tabPlayground: "Playground",
    tabSettings: "Settings",
    tabConversations: "Conversations",
    tabSources: "Data Sources",
    tabIntegrations: "Integrations",
    tabEmbed: "Embed Code",
    // Playground
    testYourChatbot: "Test your chatbot",
    clear: "Clear",
    sendMessageToTest: "Send a message to test your chatbot.",
    worksWithoutActivating: "Works without activating — test directly.",
    typeMessage: "Type a message...",
    playgroundLimitError: "Visit the pricing page to upgrade your plan.",
    playgroundGenericError: "Error generating response. Check if the AI key is configured.",
    // Info panel
    information: "Information",
    model: "Model",
    language: "Language",
    tone: "Tone",
    temperature: "Temperature",
    sources: "Sources",
    sourcesCount: "source(s)",
    tips: "Tips",
    tip1: "Add data sources for better responses",
    tip2: "Change the system prompt to modify behavior",
    tip3: "Playground works on draft chatbots too",
    tip4: "Conversation is saved — you can test follow-up questions",
    // Conversations
    conversations: "Conversations",
    noConversations: "No conversations. Test the chatbot in Playground or activate it.",
    msg: "msg.",
    emptyConversation: "Empty conversation",
    selectConversation: "Select a conversation to view messages",
    playgroundConversation: "Playground conversation",
    conversation: "conversation",
    messages: "messages",
    // Settings - System Prompt
    clickToEdit: "click to edit",
    systemPromptDesc: "Instructions for the AI agent — how it should behave and respond. This is the most important part of the settings.",
    savedBang: "Saved!",
    systemPromptPlaceholder: "You are an AI assistant for company X. Answer in English. Be concise and accurate...",
    systemPromptTip: "Tip: Add rules, FAQ, business information — everything the chatbot needs to know.",
    // Settings - Basic
    basicSettings: "Basic settings",
    configureAgent: "Configure your AI agent",
    name: "Name",
    aiModel: "AI Model",
    gpt4oMini: "GPT-4o Mini (faster, cheaper)",
    gpt4o: "GPT-4o (more advanced)",
    languageLabel: "Language",
    toneLabel: "Tone",
    professional: "Professional",
    friendly: "Friendly",
    casual: "Casual",
    tempLabel: "Temperature",
    tempDesc: "Lower = more precise, Higher = more creative",
    // Settings - Appearance
    appearance: "Appearance",
    greeting: "Greeting",
    color: "Color",
    deleteChatbot: "Delete chatbot",
    // Sources
    dataSources: "Data Sources",
    dataSourcesDesc: "Add text, FAQ or website for AI to learn from.",
    addSource: "Add source",
    addDataSource: "Add data source",
    aiWillLearn: "AI will learn from this data to answer accurately.",
    textFaq: "Text / FAQ",
    website: "Website",
    content: "Content",
    enterText: "Enter text, FAQ questions and answers, or other information...",
    cancel: "Cancel",
    add: "Add",
    noSources: "No sources. Add text or website.",
    sourceReady: "Ready",
    sourceProcessing: "Processing...",
    sourceError: "Error",
    sourcePending: "Pending",
    sourceTypeWebsite: "Website",
    sourceTypeText: "Text",
    namePlaceholderText: "e.g. Delivery FAQ",
    namePlaceholderWebsite: "e.g. Our website",
    urlPlaceholder: "https://your-website.com",
    // Integrations
    integrations: "Integrations",
    integrationsDesc: "Connect your chatbot with Facebook and Instagram.",
    websiteTitle: "Website",
    embedWidgetDesc: "Embed widget on your site",
    embedWidgetInfo: "Copy the embed code from the \"Embed Code\" tab and add it to your website.",
    alwaysAvailable: "Always available",
    facebookPage: "Facebook Page",
    autoReplyDM: "Automatically reply to DM messages",
    connected: "Connected",
    instagramConnected: "Instagram connected",
    disconnect: "Disconnect",
    connectFacebookPage: "Connect Facebook Page",
    instagramTitle: "Instagram",
    autoReplyInstagramDM: "Automatically reply to Instagram DM",
    connectedViaFacebook: "Connected via Facebook Page",
    instagramAutoConnect: "Instagram connects automatically when you connect your Facebook Page (if you have a linked Instagram Business account).",
    shareableLink: "Shareable link",
    directLink: "Direct link to your chatbot",
    chatbotMustBeActive: "Chatbot must be active for the link to work.",
    shareLinkDesc: "Share this link for direct access to your chatbot without needing a website.",
    shareLinkPending: "The shareable link will be available after the chatbot is saved.",
    // Embed
    embedCode: "Embed code for website",
    embedCopyDesc: "Copy the code and add it to your website.",
    guide: "Guide",
    howToAdd: "How to add the chatbot to your website",
    stepByStep: "Step by step installation guide",
    step1Title: "Copy the code",
    step1Desc: "Click the \"Copy code\" button below. The code will be automatically copied.",
    step2Title: "Open your page HTML",
    step2Desc: "Access the code of your website. Depending on the platform:",
    step3Title: "Paste the code before </body>",
    step3Desc: "Find the closing",
    step3Desc2: "tag and paste the code",
    step3Desc3: "right before it",
    step3Comment: "<!-- Paste the code HERE -->",
    step4Title: "Save and verify",
    step4Desc: "Save the changes and open your website. In the bottom right corner, the chatbot icon should appear. Click it to test.",
    usefulTips: "Useful tips",
    tipOnce: "The code needs to be added only",
    tipOnceB: "once",
    tipOnceEnd: "— it will work on all pages.",
    tipActivated: "The chatbot must be",
    tipActivatedB: "activated",
    tipActivatedEnd: "(status: Active) to display.",
    tipImmediate: "Changes in settings (prompt, color, greeting) apply",
    tipImmediateB: "immediately",
    tipImmediateEnd: "— you don't need to re-add the code.",
    tipDomains: "If you have problems, check if your domain is added in \"Allowed Domains\" in settings.",
    copied: "Copied!",
    copyCode: "Copy code",
    gotIt: "Got it",
    mustBeActiveForWidget: "The chatbot must be activated for the widget to work. Click \"Activate\" above.",
    // Platform names (embed guide)
    wordpress: "WordPress:",
    wordpressDesc: "Appearance → Theme Editor → footer.php, or use a plugin like \"Insert Headers and Footers\"",
    wix: "Wix:",
    wixDesc: "Settings → Custom Code → Add Code → Body - End",
    shopify: "Shopify:",
    shopifyDesc: "Online Store → Themes → Edit Code → theme.liquid",
    squarespace: "Squarespace:",
    squarespaceDesc: "Settings → Advanced → Code Injection → Footer",
    customHtml: "Custom HTML:",
    customHtmlDesc: "Open the main HTML file (usually index.html)",
  },
  mk: {
    // Status
    active: "Активен",
    paused: "Паузиран",
    draft: "Нацрт",
    notFound: "Chatbot-от не е пронајден.",
    // Channel labels
    channelWeb: "Веб",
    channelFacebook: "Facebook",
    channelInstagram: "Instagram",
    // Nav buttons
    pause: "Паузирај",
    activate: "Активирај",
    saved: "Зачувано",
    save: "Зачувај",
    // Errors
    errorLoading: "Грешка при вчитување",
    errorSaving: "Грешка при зачувување",
    errorActivating: "Грешка при активирање",
    errorPausing: "Грешка при паузирање",
    confirmDelete: "Дали сте сигурни дека сакате да го избришете овој chatbot?",
    errorDeleting: "Грешка при бришење",
    errorAddingSource: "Грешка при додавање на извор",
    errorResyncing: "Грешка при ресинхронизација",
    errorGeneric: "Грешка",
    metaNotConfigured: "Meta интеграцијата не е конфигурирана",
    errorDisconnecting: "Грешка при дисконектирање",
    // Tabs
    tabPlayground: "Playground",
    tabSettings: "Подесувања",
    tabConversations: "Разговори",
    tabSources: "Извори на податоци",
    tabIntegrations: "Интеграции",
    tabEmbed: "Embed код",
    // Playground
    testYourChatbot: "Тестирајте го вашиот chatbot",
    clear: "Исчисти",
    sendMessageToTest: "Испратете порака за да го тестирате вашиот chatbot.",
    worksWithoutActivating: "Работи и без активирање — директно тестирајте.",
    typeMessage: "Напишете порака...",
    playgroundLimitError: "Посетете ја страницата за цени за да го надградите вашиот план.",
    playgroundGenericError: "Грешка при генерирање одговор. Проверете дали AI клучот е конфигуриран.",
    // Info panel
    information: "Информации",
    model: "Модел",
    language: "Јазик",
    tone: "Тон",
    temperature: "Температура",
    sources: "Извори",
    sourcesCount: "извор(и)",
    tips: "Совети",
    tip1: "Додадете извори на податоци за подобри одговори",
    tip2: "Менувајте го system prompt-от за да го промените однесувањето",
    tip3: "Playground работи и на draft chatbot-и",
    tip4: "Разговорот се чува — може да тестирате follow-up прашања",
    // Conversations
    conversations: "Разговори",
    noConversations: "Нема разговори. Тестирајте го chatbot-от во Playground или активирајте го.",
    msg: "пор.",
    emptyConversation: "Празен разговор",
    selectConversation: "Изберете разговор за да ги видите пораките",
    playgroundConversation: "Playground разговор",
    conversation: "разговор",
    messages: "пораки",
    // Settings - System Prompt
    clickToEdit: "кликнете за уредување",
    systemPromptDesc: "Инструкции за AI агентот — како да се однесува и одговара. Ова е најважниот дел од подесувањата.",
    savedBang: "Зачувано!",
    systemPromptPlaceholder: "Ти си AI асистент за компанијата X. Одговарај на македонски јазик. Биди кус и точен...",
    systemPromptTip: "Совет: Додадете правила, FAQ, информации за бизнисот — сè што chatbot-от треба да го знае.",
    // Settings - Basic
    basicSettings: "Основни подесувања",
    configureAgent: "Конфигурирајте го вашиот AI агент",
    name: "Име",
    aiModel: "AI Модел",
    gpt4oMini: "GPT-4o Mini (побрз, поевтин)",
    gpt4o: "GPT-4o (понапреден)",
    languageLabel: "Јазик",
    toneLabel: "Тон",
    professional: "Професионален",
    friendly: "Пријателски",
    casual: "Неформален",
    tempLabel: "Температура",
    tempDesc: "Пониско = попрецизно, Повисоко = покреативно",
    // Settings - Appearance
    appearance: "Изглед",
    greeting: "Поздрав",
    color: "Боја",
    deleteChatbot: "Избриши chatbot",
    // Sources
    dataSources: "Извори на податоци",
    dataSourcesDesc: "Додадете текст, FAQ или веб-страна за AI да учи од нив.",
    addSource: "Додади извор",
    addDataSource: "Додади извор на податоци",
    aiWillLearn: "AI ќе учи од овие податоци за да одговара точно.",
    textFaq: "Текст / FAQ",
    website: "Веб-страна",
    content: "Содржина",
    enterText: "Внесете го текстот, FAQ прашања и одговори, или друга информација...",
    cancel: "Откажи",
    add: "Додади",
    noSources: "Нема извори. Додадете текст или веб-страна.",
    sourceReady: "Готов",
    sourceProcessing: "Се обработува...",
    sourceError: "Грешка",
    sourcePending: "Чека",
    sourceTypeWebsite: "Веб-страна",
    sourceTypeText: "Текст",
    namePlaceholderText: "нпр. FAQ за испорака",
    namePlaceholderWebsite: "нпр. Нашата веб-страна",
    urlPlaceholder: "https://vashata-stranica.mk",
    // Integrations
    integrations: "Интеграции",
    integrationsDesc: "Поврзете го вашиот chatbot со Facebook и Instagram.",
    websiteTitle: "Веб-страна",
    embedWidgetDesc: "Embed виџет на вашата страна",
    embedWidgetInfo: "Копирајте го embed кодот од табот \"Embed код\" и ставете го на вашата веб-страна.",
    alwaysAvailable: "Секогаш достапно",
    facebookPage: "Facebook Page",
    autoReplyDM: "Автоматски одговарајте на DM пораки",
    connected: "Поврзана",
    instagramConnected: "Instagram поврзан",
    disconnect: "Дисконектирај",
    connectFacebookPage: "Поврзи Facebook Page",
    instagramTitle: "Instagram",
    autoReplyInstagramDM: "Автоматски одговарајте на Instagram DM",
    connectedViaFacebook: "Поврзан преку Facebook Page",
    instagramAutoConnect: "Instagram се поврзува автоматски кога ја поврзувате вашата Facebook Page (ако имате поврзана Instagram Business сметка).",
    shareableLink: "Споделлив линк",
    directLink: "Директен линк до вашиот chatbot",
    chatbotMustBeActive: "Chatbot-от мора да биде активен за линкот да работи.",
    shareLinkDesc: "Споделете го овој линк за директен пристап до вашиот chatbot без потреба од веб-страна.",
    shareLinkPending: "Споделливиот линк ќе биде достапен откако chatbot-от ќе биде зачуван.",
    // Embed
    embedCode: "Embed код за веб-страна",
    embedCopyDesc: "Копирајте го кодот и ставете го на вашата веб-страна.",
    guide: "Упатство",
    howToAdd: "Како да го додадете chatbot-от на вашата веб-страна",
    stepByStep: "Чекор по чекор упатство за инсталација",
    step1Title: "Копирајте го кодот",
    step1Desc: 'Кликнете на копчето „Копирај код" подолу. Кодот автоматски ќе се копира.',
    step2Title: "Отворете го HTML-от на вашата страна",
    step2Desc: "Пристапете до кодот на вашата веб-страна. Зависно од платформата:",
    step3Title: "Залепете го кодот пред </body>",
    step3Desc: "Најдете го затворачкиот",
    step3Desc2: "таг и залепете го кодот",
    step3Desc3: "непосредно пред него",
    step3Comment: "<!-- Залепете го кодот ТУКА -->",
    step4Title: "Зачувајте и проверете",
    step4Desc: "Зачувајте ги промените и отворете ја вашата веб-страна. Во долниот десен агол треба да се појави иконата на chatbot-от. Кликнете на неа за да го тестирате.",
    usefulTips: "Корисни совети",
    tipOnce: "Кодот треба да се додаде само",
    tipOnceB: "еднаш",
    tipOnceEnd: "— ќе работи на сите страници.",
    tipActivated: "Chatbot-от мора да биде",
    tipActivatedB: "активиран",
    tipActivatedEnd: "(статус: Active) за да се прикажува.",
    tipImmediate: "Промените во подесувањата (prompt, боја, поздрав) се применуваат",
    tipImmediateB: "веднаш",
    tipImmediateEnd: "— не треба повторно да го додавате кодот.",
    tipDomains: 'Ако имате проблеми, проверете дали вашиот домен е додаден во „Дозволени домени" во подесувањата.',
    copied: "Копирано!",
    copyCode: "Копирај код",
    gotIt: "Разбрав",
    mustBeActiveForWidget: 'Chatbot-от мора да биде активиран за виџетот да работи. Кликнете „Активирај" горе.',
    // Platform names (embed guide)
    wordpress: "WordPress:",
    wordpressDesc: 'Appearance → Theme Editor → footer.php, или користете plugin како „Insert Headers and Footers"',
    wix: "Wix:",
    wixDesc: "Settings → Custom Code → Add Code → Body - End",
    shopify: "Shopify:",
    shopifyDesc: "Online Store → Themes → Edit Code → theme.liquid",
    squarespace: "Squarespace:",
    squarespaceDesc: "Settings → Advanced → Code Injection → Footer",
    customHtml: "Custom HTML:",
    customHtmlDesc: "Отворете го главниот HTML фајл (обично index.html)",
  },
};

const ChatbotPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lang } = useLanguage();
  const c = t[lang];

  const channelLabels: Record<string, string> = {
    web: c.channelWeb,
    facebook: c.channelFacebook,
    instagram: c.channelInstagram,
  };

  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [connections, setConnections] = useState<MetaConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [model, setModel] = useState("gpt-4o-mini");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [language, setLanguage] = useState("mk");
  const [tone, setTone] = useState("professional");
  const [temperature, setTemperature] = useState(0.7);
  const [greeting, setGreeting] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#8b5cf6");

  // Source form
  const [addSourceOpen, setAddSourceOpen] = useState(false);
  const [sourceType, setSourceType] = useState<"text" | "website">("text");
  const [sourceName, setSourceName] = useState("");
  const [sourceContent, setSourceContent] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [addingSource, setAddingSource] = useState(false);

  // Embed code
  const [embedCopied, setEmbedCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [promptFocused, setPromptFocused] = useState(false);

  // Conversations history
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversationMessages, setConversationMessages] = useState<ConvMessage[]>([]);
  const [convMessagesLoading, setConvMessagesLoading] = useState(false);

  // Playground
  const [playgroundMessages, setPlaygroundMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [playgroundInput, setPlaygroundInput] = useState("");
  const [playgroundSending, setPlaygroundSending] = useState(false);
  const [playgroundSessionId, setPlaygroundSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadAll();
  }, [id, user]);

  const loadAll = async () => {
    try {
      const [bot, srcs, conns] = await Promise.all([
        api.get<Chatbot>(`/chatbots/${id}`),
        api.get<Source[]>(`/chatbots/${id}/sources`),
        api.get<MetaConnection[]>("/pages/status"),
      ]);

      setChatbot(bot);
      setSources(srcs);
      setConnections(conns.filter((c) => c.chatbotId === id));

      // Populate form
      setName(bot.name);
      setModel(bot.config.model);
      setSystemPrompt(bot.config.systemPrompt);
      setLanguage(bot.config.language);
      setTone(bot.config.tone);
      setTemperature(bot.config.temperature);
      setGreeting(bot.appearance.greeting);
      setPrimaryColor(bot.appearance.primaryColor);
    } catch (err) {
      setError(err instanceof Error ? err.message : c.errorLoading);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const updated = await api.put<Chatbot>(`/chatbots/${id}`, {
        name,
        config: { model, systemPrompt, language, tone, temperature },
        appearance: { primaryColor, greeting, placeholder: chatbot?.appearance.placeholder, position: chatbot?.appearance.position },
      });
      setChatbot(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : c.errorSaving);
    } finally {
      setSaving(false);
    }
  };

  const handleDeploy = async () => {
    try {
      const updated = await api.post<Chatbot>(`/chatbots/${id}/deploy`);
      setChatbot(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : c.errorActivating);
    }
  };

  const handlePause = async () => {
    try {
      const updated = await api.post<Chatbot>(`/chatbots/${id}/pause`);
      setChatbot(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : c.errorPausing);
    }
  };

  const handleDelete = async () => {
    if (!confirm(c.confirmDelete)) return;
    try {
      await api.delete(`/chatbots/${id}`);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : c.errorDeleting);
    }
  };

  const handleAddSource = async () => {
    setAddingSource(true);
    try {
      if (sourceType === "text") {
        await api.post(`/chatbots/${id}/sources/text`, {
          name: sourceName,
          content: sourceContent,
          type: "text",
        });
      } else {
        await api.post(`/chatbots/${id}/sources/website`, {
          url: sourceUrl,
          name: sourceName || sourceUrl,
        });
      }
      setAddSourceOpen(false);
      setSourceName("");
      setSourceContent("");
      setSourceUrl("");
      // Reload sources
      const srcs = await api.get<Source[]>(`/chatbots/${id}/sources`);
      setSources(srcs);
    } catch (err) {
      setError(err instanceof Error ? err.message : c.errorAddingSource);
    } finally {
      setAddingSource(false);
    }
  };

  const handleDeleteSource = async (sourceId: string) => {
    try {
      await api.delete(`/chatbots/${id}/sources/${sourceId}`);
      setSources((prev) => prev.filter((s) => s._id !== sourceId));
    } catch (err) {
      setError(err instanceof Error ? err.message : c.errorDeleting);
    }
  };

  const handleResyncSource = async (sourceId: string) => {
    try {
      await api.post(`/chatbots/${id}/sources/${sourceId}/resync`);
      const srcs = await api.get<Source[]>(`/chatbots/${id}/sources`);
      setSources(srcs);
    } catch (err) {
      setError(err instanceof Error ? err.message : c.errorResyncing);
    }
  };

  const handleCopyEmbed = async () => {
    try {
      const data = await api.get<{ embedCode: string }>(`/chatbots/${id}/embed`);
      await navigator.clipboard.writeText(data.embedCode);
      setEmbedCopied(true);
      setTimeout(() => setEmbedCopied(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : c.errorGeneric);
    }
  };

  const handlePlaygroundSend = async () => {
    const msg = playgroundInput.trim();
    if (!msg || playgroundSending) return;

    setPlaygroundInput("");
    setPlaygroundMessages((prev) => [...prev, { role: "user", content: msg }]);
    setPlaygroundSending(true);

    try {
      const data = await api.post<{ sessionId: string; message: { content: string } }>(
        `/chat/playground/${id}`,
        { message: msg, sessionId: playgroundSessionId }
      );
      setPlaygroundSessionId(data.sessionId);
      setPlaygroundMessages((prev) => [...prev, { role: "assistant", content: data.message.content }]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "";
      const isLimitError = errorMsg.includes("лимитот") || errorMsg.includes("Надградете") || errorMsg.includes("limit") || errorMsg.includes("Upgrade");
      setPlaygroundMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: isLimitError
            ? "⚠️ " + errorMsg + " " + c.playgroundLimitError
            : c.playgroundGenericError,
        },
      ]);
    } finally {
      setPlaygroundSending(false);
    }
  };

  const handlePlaygroundClear = () => {
    setPlaygroundMessages([]);
    setPlaygroundSessionId(null);
  };

  const loadConversations = async () => {
    setConversationsLoading(true);
    try {
      const data = await api.get<{ conversations: ConversationItem[]; total: number }>(
        `/chat/chatbots/${id}/conversations?limit=50`
      );
      setConversations(data.conversations);
    } catch {
      // silently fail
    } finally {
      setConversationsLoading(false);
    }
  };

  const loadConversationMessages = async (conversationId: string) => {
    setSelectedConversation(conversationId);
    setConvMessagesLoading(true);
    try {
      const msgs = await api.get<ConvMessage[]>(`/chat/conversations/${conversationId}/messages`);
      setConversationMessages(msgs);
    } catch {
      setConversationMessages([]);
    } finally {
      setConvMessagesLoading(false);
    }
  };

  const handleConnectFacebook = async () => {
    try {
      const data = await api.get<{ url: string }>(`/auth/facebook/connect?chatbotId=${id}`);
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : c.metaNotConfigured);
    }
  };

  const handleDisconnectPage = async (pageId: string) => {
    try {
      await api.post("/pages/disconnect", { pageId });
      setConnections((prev) => prev.filter((c) => c.pageId !== pageId));
    } catch (err) {
      setError(err instanceof Error ? err.message : c.errorDisconnecting);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!chatbot) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{c.notFound}</p>
      </div>
    );
  }

  const statusColor = chatbot.status === "active" ? "text-green-600" : chatbot.status === "paused" ? "text-yellow-600" : "text-muted-foreground";
  const statusText = chatbot.status === "active" ? c.active : chatbot.status === "paused" ? c.paused : c.draft;
  const locale = lang === "mk" ? "mk-MK" : "en-US";

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border bg-card">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              <span className="font-display font-semibold text-foreground">{chatbot.name}</span>
              <span className={`text-xs font-medium ${statusColor}`}>({statusText})</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            {chatbot.status === "active" ? (
              <Button variant="outline" size="sm" onClick={handlePause} className="gap-2">
                <Pause className="w-4 h-4" /> {c.pause}
              </Button>
            ) : (
              <Button size="sm" onClick={handleDeploy} className="gap-2 bg-green-600 text-white hover:bg-green-700">
                <Play className="w-4 h-4" /> {c.activate}
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="gap-2 bg-gradient-accent text-white hover:opacity-90"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? c.saved : c.save}
            </Button>
          </div>
        </div>
      </nav>

      <div className="container py-8">
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm rounded-lg px-4 py-3 mb-6">{error}</div>
        )}

        <Tabs defaultValue="playground">
          <TabsList className="mb-6">
            <TabsTrigger value="playground">{c.tabPlayground}</TabsTrigger>
            <TabsTrigger value="settings">{c.tabSettings}</TabsTrigger>
            <TabsTrigger value="conversations" onClick={() => { if (conversations.length === 0) loadConversations(); }}>{c.tabConversations}</TabsTrigger>
            <TabsTrigger value="sources">{c.tabSources}</TabsTrigger>
            <TabsTrigger value="integrations">{c.tabIntegrations}</TabsTrigger>
            <TabsTrigger value="embed">{c.tabEmbed}</TabsTrigger>
          </TabsList>

          {/* ═══ Playground Tab ═══ */}
          <TabsContent value="playground">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Chat area */}
              <Card className="flex flex-col" style={{ minHeight: "500px" }}>
                <CardHeader className="flex-row items-center justify-between pb-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    <CardTitle className="text-base">{c.testYourChatbot}</CardTitle>
                  </div>
                  {playgroundMessages.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={handlePlaygroundClear} className="text-muted-foreground">
                      {c.clear}
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-[400px]">
                    {playgroundMessages.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full text-center py-12">
                        <Bot className="w-12 h-12 text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground text-sm">
                          {c.sendMessageToTest}
                        </p>
                        <p className="text-muted-foreground/60 text-xs mt-1">
                          {c.worksWithoutActivating}
                        </p>
                      </div>
                    )}
                    {playgroundMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex",
                          msg.role === "user" ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-muted text-foreground rounded-bl-md"
                          )}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                    {playgroundSending && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-2.5">
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input */}
                  <div className="flex gap-2">
                    <Input
                      value={playgroundInput}
                      onChange={(e) => setPlaygroundInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handlePlaygroundSend();
                        }
                      }}
                      placeholder={chatbot.appearance.placeholder || c.typeMessage}
                      disabled={playgroundSending}
                      className="flex-1"
                    />
                    <Button
                      onClick={handlePlaygroundSend}
                      disabled={!playgroundInput.trim() || playgroundSending}
                      size="icon"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Info panel */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{c.information}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{c.model}</span>
                      <span className="font-medium text-foreground">{chatbot.config.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{c.language}</span>
                      <span className="font-medium text-foreground">{chatbot.config.language === "mk" ? "Македонски" : chatbot.config.language}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{c.tone}</span>
                      <span className="font-medium text-foreground capitalize">{chatbot.config.tone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{c.temperature}</span>
                      <span className="font-medium text-foreground">{chatbot.config.temperature}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{c.sources}</span>
                      <span className="font-medium text-foreground">{sources.length} {c.sourcesCount}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-dashed">
                  <CardContent className="py-6">
                    <h4 className="font-display font-semibold text-foreground mb-2">{c.tips}</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• {c.tip1}</li>
                      <li>• {c.tip2}</li>
                      <li>• {c.tip3}</li>
                      <li>• {c.tip4}</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ═══ Conversations Tab ═══ */}
          <TabsContent value="conversations">
            <div className="grid lg:grid-cols-3 gap-6" style={{ minHeight: "500px" }}>
              {/* Conversation list */}
              <div className="lg:col-span-1 space-y-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-semibold text-lg text-foreground">{c.conversations}</h2>
                  <Button variant="ghost" size="sm" onClick={loadConversations} disabled={conversationsLoading}>
                    <RefreshCw className={cn("w-4 h-4", conversationsLoading && "animate-spin")} />
                  </Button>
                </div>

                {conversationsLoading && conversations.length === 0 ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : conversations.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <MessageSquare className="w-10 h-10 text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground text-center">
                        {c.noConversations}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-1 max-h-[500px] overflow-y-auto">
                    {conversations.map((conv) => {
                      const isPlayground = conv.sessionId.startsWith("playground:");
                      const isSelected = selectedConversation === conv._id;
                      return (
                        <button
                          key={conv._id}
                          onClick={() => loadConversationMessages(conv._id)}
                          className={cn(
                            "w-full text-left rounded-lg px-4 py-3 transition-colors",
                            isSelected
                              ? "bg-primary/10 border border-primary/20"
                              : "hover:bg-muted border border-transparent"
                          )}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "text-xs font-medium px-2 py-0.5 rounded-full",
                                isPlayground
                                  ? "bg-purple-100 text-purple-700"
                                  : conv.channel === "facebook"
                                  ? "bg-blue-100 text-blue-700"
                                  : conv.channel === "instagram"
                                  ? "bg-pink-100 text-pink-700"
                                  : "bg-muted text-muted-foreground"
                              )}>
                                {isPlayground ? "Playground" : channelLabels[conv.channel] || conv.channel}
                              </span>
                              <span className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                conv.status === "active" ? "bg-green-500" : "bg-muted-foreground/30"
                              )} />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {conv.messageCount} {c.msg}
                            </span>
                          </div>
                          <p className="text-sm text-foreground truncate">
                            {conv.preview || c.emptyConversation}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(conv.lastMessageAt).toLocaleString(locale, {
                              day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                            })}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Message thread */}
              <div className="lg:col-span-2">
                {!selectedConversation ? (
                  <Card className="h-full flex items-center justify-center border-dashed">
                    <CardContent className="text-center py-16">
                      <MessageSquare className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                      <p className="text-muted-foreground">{c.selectConversation}</p>
                    </CardContent>
                  </Card>
                ) : convMessagesLoading ? (
                  <Card className="h-full flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </Card>
                ) : (
                  <Card className="h-full flex flex-col">
                    <CardHeader className="pb-3 border-b">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          {(() => {
                            const conv = conversations.find((c) => c._id === selectedConversation);
                            if (!conv) return c.conversation;
                            const isPlayground = conv.sessionId.startsWith("playground:");
                            return isPlayground ? c.playgroundConversation : `${channelLabels[conv.channel] || conv.channel} ${c.conversation}`;
                          })()}
                        </CardTitle>
                        <span className="text-xs text-muted-foreground">
                          {conversationMessages.length} {c.messages}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto py-4 space-y-4 max-h-[450px]">
                      {conversationMessages.map((msg) => (
                        <div
                          key={msg._id}
                          className={cn(
                            "flex",
                            msg.role === "user" ? "justify-end" : "justify-start"
                          )}
                        >
                          <div className={cn(
                            "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-muted text-foreground rounded-bl-md"
                          )}>
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                            <p className={cn(
                              "text-[10px] mt-1",
                              msg.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground"
                            )}>
                              {new Date(msg.createdAt).toLocaleTimeString(locale, {
                                hour: "2-digit", minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ═══ Settings Tab ═══ */}
          <TabsContent value="settings">
            {/* System Prompt — hero section */}
            <Card className={cn(
              "mb-8 transition-all duration-200",
              promptFocused
                ? "border-primary ring-2 ring-primary/20 shadow-md"
                : "border-border hover:border-primary/30 cursor-text"
            )}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      System Prompt
                      {!promptFocused && (
                        <span className="inline-flex items-center gap-1 text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          <Pencil className="w-3 h-3" />
                          {c.clickToEdit}
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {c.systemPromptDesc}
                    </CardDescription>
                  </div>
                  {promptFocused && (
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="gap-2 bg-gradient-accent text-white hover:opacity-90 shrink-0"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : saved ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {saved ? c.savedBang : c.save}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  onFocus={() => setPromptFocused(true)}
                  onBlur={(e) => {
                    // Keep focused if clicking the save button
                    if (e.relatedTarget?.closest?.("button")) return;
                    setPromptFocused(false);
                  }}
                  placeholder={c.systemPromptPlaceholder}
                  className={cn(
                    "font-mono text-sm leading-relaxed min-h-[45vh] resize-y transition-colors duration-200",
                    promptFocused
                      ? "bg-background border-primary/30"
                      : "bg-muted/50 border-transparent"
                  )}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {c.systemPromptTip}
                </p>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>{c.basicSettings}</CardTitle>
                  <CardDescription>{c.configureAgent}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>{c.name}</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{c.aiModel}</Label>
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="gpt-4o-mini">{c.gpt4oMini}</option>
                      <option value="gpt-4o">{c.gpt4o}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>{c.languageLabel}</Label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="mk">Македонски</option>
                      <option value="en">English</option>
                      <option value="sq">Shqip</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>{c.toneLabel}</Label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="professional">{c.professional}</option>
                      <option value="friendly">{c.friendly}</option>
                      <option value="casual">{c.casual}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>{c.tempLabel}: {temperature}</Label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">{c.tempDesc}</p>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>{c.appearance}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>{c.greeting}</Label>
                      <Input value={greeting} onChange={(e) => setGreeting(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>{c.color}</Label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer border-0"
                        />
                        <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-32" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button variant="destructive" size="sm" onClick={handleDelete} className="gap-2">
                  <Trash2 className="w-4 h-4" /> {c.deleteChatbot}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* ═══ Sources Tab ═══ */}
          <TabsContent value="sources">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display font-semibold text-xl text-foreground">{c.dataSources}</h2>
                <p className="text-sm text-muted-foreground">{c.dataSourcesDesc}</p>
              </div>
              <Dialog open={addSourceOpen} onOpenChange={setAddSourceOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-gradient-accent text-white hover:opacity-90">
                    <Plus className="w-4 h-4" /> {c.addSource}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{c.addDataSource}</DialogTitle>
                    <DialogDescription>{c.aiWillLearn}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="flex gap-2">
                      <Button
                        variant={sourceType === "text" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSourceType("text")}
                      >
                        {c.textFaq}
                      </Button>
                      <Button
                        variant={sourceType === "website" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSourceType("website")}
                      >
                        {c.website}
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label>{c.name}</Label>
                      <Input
                        placeholder={sourceType === "text" ? c.namePlaceholderText : c.namePlaceholderWebsite}
                        value={sourceName}
                        onChange={(e) => setSourceName(e.target.value)}
                      />
                    </div>
                    {sourceType === "text" ? (
                      <div className="space-y-2">
                        <Label>{c.content}</Label>
                        <Textarea
                          placeholder={c.enterText}
                          rows={8}
                          value={sourceContent}
                          onChange={(e) => setSourceContent(e.target.value)}
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label>URL</Label>
                        <Input
                          placeholder={c.urlPlaceholder}
                          value={sourceUrl}
                          onChange={(e) => setSourceUrl(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAddSourceOpen(false)}>{c.cancel}</Button>
                    <Button
                      onClick={handleAddSource}
                      disabled={addingSource || !sourceName.trim() || (sourceType === "text" ? !sourceContent.trim() : !sourceUrl.trim())}
                      className="bg-gradient-accent text-white hover:opacity-90"
                    >
                      {addingSource && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                      {c.add}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {sources.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Database className="w-10 h-10 text-muted-foreground/40 mb-4" />
                  <p className="text-muted-foreground mb-4">{c.noSources}</p>
                  <Button variant="outline" onClick={() => setAddSourceOpen(true)} className="gap-2">
                    <Plus className="w-4 h-4" /> {c.addSource}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {sources.map((src) => (
                  <Card key={src._id}>
                    <CardContent className="flex items-center gap-4 py-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        {src.type === "website" ? <Globe className="w-5 h-5 text-primary" /> : <Database className="w-5 h-5 text-primary" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{src.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {src.type === "website" ? c.sourceTypeWebsite : c.sourceTypeText} ·{" "}
                          <span className={cn(
                            src.status === "ready" && "text-green-600",
                            src.status === "processing" && "text-yellow-600",
                            src.status === "error" && "text-destructive",
                            src.status === "pending" && "text-muted-foreground",
                          )}>
                            {src.status === "ready" ? c.sourceReady : src.status === "processing" ? c.sourceProcessing : src.status === "error" ? c.sourceError : c.sourcePending}
                          </span>
                          {src.errorMessage && ` — ${src.errorMessage}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleResyncSource(src._id)}>
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteSource(src._id)}>
                          <X className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ═══ Integrations Tab ═══ */}
          <TabsContent value="integrations">
            <h2 className="font-display font-semibold text-xl text-foreground mb-2">{c.integrations}</h2>
            <p className="text-sm text-muted-foreground mb-6">{c.integrationsDesc}</p>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Website */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                      <Globe className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{c.websiteTitle}</CardTitle>
                      <CardDescription>{c.embedWidgetDesc}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {c.embedWidgetInfo}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Check className="w-4 h-4" /> {c.alwaysAvailable}
                  </div>
                </CardContent>
              </Card>

              {/* Facebook */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center">
                      <Facebook className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{c.facebookPage}</CardTitle>
                      <CardDescription>{c.autoReplyDM}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {connections.filter((c) => c.status === "active").length > 0 ? (
                    <div className="space-y-3">
                      {connections.filter((cn) => cn.status === "active").map((conn) => (
                        <div key={conn._id} className="flex items-center justify-between bg-muted rounded-lg px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-foreground">{conn.pageName}</p>
                            <p className="text-xs text-green-600">{c.connected}</p>
                            {conn.instagramAccountId && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <Instagram className="w-3 h-3" /> {c.instagramConnected}
                              </p>
                            )}
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleDisconnectPage(conn.pageId)}>
                            {c.disconnect}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Button onClick={handleConnectFacebook} className="w-full gap-2">
                      <Facebook className="w-4 h-4" /> {c.connectFacebookPage}
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Instagram */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                      <Instagram className="w-5 h-5 text-pink-500" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{c.instagramTitle}</CardTitle>
                      <CardDescription>{c.autoReplyInstagramDM}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {connections.some((cn) => cn.instagramAccountId && cn.status === "active") ? (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Check className="w-4 h-4" /> {c.connectedViaFacebook}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {c.instagramAutoConnect}
                    </p>
                  )}
                </CardContent>
              </Card>
              {/* Shareable Link */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Link2 className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{c.shareableLink}</CardTitle>
                      <CardDescription>{c.directLink}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {chatbot?.slug ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Input
                          readOnly
                          value={`${window.location.origin}/chat/${chatbot.slug}`}
                          className="text-sm font-mono"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="shrink-0"
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/chat/${chatbot.slug}`);
                            setLinkCopied(true);
                            setTimeout(() => setLinkCopied(false), 2000);
                          }}
                        >
                          {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="shrink-0"
                          asChild
                        >
                          <a href={`/chat/${chatbot.slug}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      </div>
                      {chatbot.status !== "active" && (
                        <p className="text-xs text-amber-600">
                          {c.chatbotMustBeActive}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {c.shareLinkDesc}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {c.shareLinkPending}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ═══ Embed Tab ═══ */}
          <TabsContent value="embed">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Code className="w-5 h-5 text-primary" />
                      <div>
                        <CardTitle>{c.embedCode}</CardTitle>
                        <CardDescription>
                          {c.embedCopyDesc}
                        </CardDescription>
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                          <BookOpen className="w-4 h-4" />
                          {c.guide}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-xl">{c.howToAdd}</DialogTitle>
                          <DialogDescription>
                            {c.stepByStep}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                          {/* Step 1 */}
                          <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-sm">1</div>
                            <div>
                              <h4 className="font-semibold text-foreground mb-1">{c.step1Title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {c.step1Desc}
                              </p>
                            </div>
                          </div>

                          {/* Step 2 */}
                          <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-sm">2</div>
                            <div>
                              <h4 className="font-semibold text-foreground mb-1">{c.step2Title}</h4>
                              <p className="text-sm text-muted-foreground mb-2">
                                {c.step2Desc}
                              </p>
                              <div className="space-y-2 text-sm">
                                <div className="bg-muted rounded-lg px-3 py-2">
                                  <span className="font-medium text-foreground">{c.wordpress}</span>{" "}
                                  <span className="text-muted-foreground">{c.wordpressDesc}</span>
                                </div>
                                <div className="bg-muted rounded-lg px-3 py-2">
                                  <span className="font-medium text-foreground">{c.wix}</span>{" "}
                                  <span className="text-muted-foreground">{c.wixDesc}</span>
                                </div>
                                <div className="bg-muted rounded-lg px-3 py-2">
                                  <span className="font-medium text-foreground">{c.shopify}</span>{" "}
                                  <span className="text-muted-foreground">{c.shopifyDesc}</span>
                                </div>
                                <div className="bg-muted rounded-lg px-3 py-2">
                                  <span className="font-medium text-foreground">{c.squarespace}</span>{" "}
                                  <span className="text-muted-foreground">{c.squarespaceDesc}</span>
                                </div>
                                <div className="bg-muted rounded-lg px-3 py-2">
                                  <span className="font-medium text-foreground">{c.customHtml}</span>{" "}
                                  <span className="text-muted-foreground">{c.customHtmlDesc}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Step 3 */}
                          <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-sm">3</div>
                            <div>
                              <h4 className="font-semibold text-foreground mb-1">{c.step3Title}</h4>
                              <p className="text-sm text-muted-foreground mb-2">
                                {c.step3Desc} <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">&lt;/body&gt;</code> {c.step3Desc2}{" "}
                                <strong>{c.step3Desc3}</strong>:
                              </p>
                              <div className="bg-muted rounded-lg p-3 font-mono text-xs text-muted-foreground leading-relaxed">
                                <div>&nbsp;&nbsp;&nbsp;&nbsp;...</div>
                                <div className="text-primary font-medium">&nbsp;&nbsp;&nbsp;&nbsp;{c.step3Comment}</div>
                                <div>&nbsp;&nbsp;&lt;/body&gt;</div>
                                <div>&lt;/html&gt;</div>
                              </div>
                            </div>
                          </div>

                          {/* Step 4 */}
                          <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-sm">4</div>
                            <div>
                              <h4 className="font-semibold text-foreground mb-1">{c.step4Title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {c.step4Desc}
                              </p>
                            </div>
                          </div>

                          {/* Tips */}
                          <div className="border-t border-border pt-4">
                            <h4 className="font-semibold text-foreground mb-3">{c.usefulTips}</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                              <li className="flex gap-2">
                                <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                {c.tipOnce} <strong className="text-foreground">{c.tipOnceB}</strong> {c.tipOnceEnd}
                              </li>
                              <li className="flex gap-2">
                                <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                {c.tipActivated} <strong className="text-foreground">{c.tipActivatedB}</strong> {c.tipActivatedEnd}
                              </li>
                              <li className="flex gap-2">
                                <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                {c.tipImmediate} <strong className="text-foreground">{c.tipImmediateB}</strong> {c.tipImmediateEnd}
                              </li>
                              <li className="flex gap-2">
                                <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                {c.tipDomains}
                              </li>
                            </ul>
                          </div>
                        </div>
                        <DialogFooter>
                          <DialogTrigger asChild>
                            <Button>{c.gotIt}</Button>
                          </DialogTrigger>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted rounded-lg p-4 font-mono text-sm text-foreground mb-4 overflow-x-auto">
                    <pre>{`<script>
  (function() {
    var s = document.createElement('script');
    s.src = '${window.location.origin}/widget.js';
    s.setAttribute('data-chatbot-id', '${id}');
    s.async = true;
    document.head.appendChild(s);
  })();
</script>`}</pre>
                  </div>
                  <Button onClick={handleCopyEmbed} className="gap-2">
                    {embedCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {embedCopied ? c.copied : c.copyCode}
                  </Button>

                  {chatbot.status !== "active" && (
                    <p className="text-sm text-yellow-600 mt-4">
                      {c.mustBeActiveForWidget}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ChatbotPage;
