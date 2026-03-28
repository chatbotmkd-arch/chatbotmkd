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

const channelLabels: Record<string, string> = {
  web: "Веб",
  facebook: "Facebook",
  instagram: "Instagram",
};

const ChatbotPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

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
      setError(err instanceof Error ? err.message : "Грешка при вчитување");
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
      setError(err instanceof Error ? err.message : "Грешка при зачувување");
    } finally {
      setSaving(false);
    }
  };

  const handleDeploy = async () => {
    try {
      const updated = await api.post<Chatbot>(`/chatbots/${id}/deploy`);
      setChatbot(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка при активирање");
    }
  };

  const handlePause = async () => {
    try {
      const updated = await api.post<Chatbot>(`/chatbots/${id}/pause`);
      setChatbot(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка при паузирање");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Дали сте сигурни дека сакате да го избришете овој chatbot?")) return;
    try {
      await api.delete(`/chatbots/${id}`);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка при бришење");
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
      setError(err instanceof Error ? err.message : "Грешка при додавање на извор");
    } finally {
      setAddingSource(false);
    }
  };

  const handleDeleteSource = async (sourceId: string) => {
    try {
      await api.delete(`/chatbots/${id}/sources/${sourceId}`);
      setSources((prev) => prev.filter((s) => s._id !== sourceId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка при бришење");
    }
  };

  const handleResyncSource = async (sourceId: string) => {
    try {
      await api.post(`/chatbots/${id}/sources/${sourceId}/resync`);
      const srcs = await api.get<Source[]>(`/chatbots/${id}/sources`);
      setSources(srcs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка при ресинхронизација");
    }
  };

  const handleCopyEmbed = async () => {
    try {
      const data = await api.get<{ embedCode: string }>(`/chatbots/${id}/embed`);
      await navigator.clipboard.writeText(data.embedCode);
      setEmbedCopied(true);
      setTimeout(() => setEmbedCopied(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка");
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
      const isLimitError = errorMsg.includes("лимитот") || errorMsg.includes("Надградете");
      setPlaygroundMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: isLimitError
            ? "⚠️ " + errorMsg + " Посетете ја страницата за цени за да го надградите вашиот план."
            : "Грешка при генерирање одговор. Проверете дали AI клучот е конфигуриран.",
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
      setError(err instanceof Error ? err.message : "Meta интеграцијата не е конфигурирана");
    }
  };

  const handleDisconnectPage = async (pageId: string) => {
    try {
      await api.post("/pages/disconnect", { pageId });
      setConnections((prev) => prev.filter((c) => c.pageId !== pageId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка при дисконектирање");
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
        <p className="text-muted-foreground">Chatbot-от не е пронајден.</p>
      </div>
    );
  }

  const statusColor = chatbot.status === "active" ? "text-green-600" : chatbot.status === "paused" ? "text-yellow-600" : "text-muted-foreground";
  const statusText = chatbot.status === "active" ? "Активен" : chatbot.status === "paused" ? "Паузиран" : "Нацрт";

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
            {chatbot.status === "active" ? (
              <Button variant="outline" size="sm" onClick={handlePause} className="gap-2">
                <Pause className="w-4 h-4" /> Паузирај
              </Button>
            ) : (
              <Button size="sm" onClick={handleDeploy} className="gap-2 bg-green-600 text-white hover:bg-green-700">
                <Play className="w-4 h-4" /> Активирај
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="gap-2 bg-gradient-accent text-white hover:opacity-90"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? "Зачувано" : "Зачувај"}
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
            <TabsTrigger value="playground">Playground</TabsTrigger>
            <TabsTrigger value="settings">Подесувања</TabsTrigger>
            <TabsTrigger value="conversations" onClick={() => { if (conversations.length === 0) loadConversations(); }}>Разговори</TabsTrigger>
            <TabsTrigger value="sources">Извори на податоци</TabsTrigger>
            <TabsTrigger value="integrations">Интеграции</TabsTrigger>
            <TabsTrigger value="embed">Embed код</TabsTrigger>
          </TabsList>

          {/* ═══ Playground Tab ═══ */}
          <TabsContent value="playground">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Chat area */}
              <Card className="flex flex-col" style={{ minHeight: "500px" }}>
                <CardHeader className="flex-row items-center justify-between pb-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    <CardTitle className="text-base">Тестирајте го вашиот chatbot</CardTitle>
                  </div>
                  {playgroundMessages.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={handlePlaygroundClear} className="text-muted-foreground">
                      Исчисти
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
                          Испратете порака за да го тестирате вашиот chatbot.
                        </p>
                        <p className="text-muted-foreground/60 text-xs mt-1">
                          Работи и без активирање — директно тестирајте.
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
                      placeholder={chatbot.appearance.placeholder || "Напишете порака..."}
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
                    <CardTitle className="text-base">Информации</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Модел</span>
                      <span className="font-medium text-foreground">{chatbot.config.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Јазик</span>
                      <span className="font-medium text-foreground">{chatbot.config.language === "mk" ? "Македонски" : chatbot.config.language}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Тон</span>
                      <span className="font-medium text-foreground capitalize">{chatbot.config.tone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Температура</span>
                      <span className="font-medium text-foreground">{chatbot.config.temperature}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Извори</span>
                      <span className="font-medium text-foreground">{sources.length} извор(и)</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-dashed">
                  <CardContent className="py-6">
                    <h4 className="font-display font-semibold text-foreground mb-2">Совети</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Додадете извори на податоци за подобри одговори</li>
                      <li>• Менувајте го system prompt-от за да го промените однесувањето</li>
                      <li>• Playground работи и на draft chatbot-и</li>
                      <li>• Разговорот се чува — може да тестирате follow-up прашања</li>
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
                  <h2 className="font-display font-semibold text-lg text-foreground">Разговори</h2>
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
                        Нема разговори. Тестирајте го chatbot-от во Playground или активирајте го.
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
                              {conv.messageCount} пор.
                            </span>
                          </div>
                          <p className="text-sm text-foreground truncate">
                            {conv.preview || "Празен разговор"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(conv.lastMessageAt).toLocaleString("mk-MK", {
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
                      <p className="text-muted-foreground">Изберете разговор за да ги видите пораките</p>
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
                            if (!conv) return "Разговор";
                            const isPlayground = conv.sessionId.startsWith("playground:");
                            return isPlayground ? "Playground разговор" : `${channelLabels[conv.channel] || conv.channel} разговор`;
                          })()}
                        </CardTitle>
                        <span className="text-xs text-muted-foreground">
                          {conversationMessages.length} пораки
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
                              {new Date(msg.createdAt).toLocaleTimeString("mk-MK", {
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
                          кликнете за уредување
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Инструкции за AI агентот — како да се однесува и одговара. Ова е најважниот дел од подесувањата.
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
                      {saved ? "Зачувано!" : "Зачувај"}
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
                  placeholder="Ти си AI асистент за компанијата X. Одговарај на македонски јазик. Биди кус и точен..."
                  className={cn(
                    "font-mono text-sm leading-relaxed min-h-[45vh] resize-y transition-colors duration-200",
                    promptFocused
                      ? "bg-background border-primary/30"
                      : "bg-muted/50 border-transparent"
                  )}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Совет: Додадете правила, FAQ, информации за бизнисот — сè што chatbot-от треба да го знае.
                </p>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Основни подесувања</CardTitle>
                  <CardDescription>Конфигурирајте го вашиот AI агент</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Име</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>AI Модел</Label>
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="gpt-4o-mini">GPT-4o Mini (побрз, поевтин)</option>
                      <option value="gpt-4o">GPT-4o (понапреден)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Јазик</Label>
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
                    <Label>Тон</Label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="professional">Професионален</option>
                      <option value="friendly">Пријателски</option>
                      <option value="casual">Неформален</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Температура: {temperature}</Label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">Пониско = попрецизно, Повисоко = покреативно</p>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Изглед</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Поздрав</Label>
                      <Input value={greeting} onChange={(e) => setGreeting(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Боја</Label>
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
                  <Trash2 className="w-4 h-4" /> Избриши chatbot
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* ═══ Sources Tab ═══ */}
          <TabsContent value="sources">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display font-semibold text-xl text-foreground">Извори на податоци</h2>
                <p className="text-sm text-muted-foreground">Додадете текст, FAQ или веб-страна за AI да учи од нив.</p>
              </div>
              <Dialog open={addSourceOpen} onOpenChange={setAddSourceOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-gradient-accent text-white hover:opacity-90">
                    <Plus className="w-4 h-4" /> Додади извор
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Додади извор на податоци</DialogTitle>
                    <DialogDescription>AI ќе учи од овие податоци за да одговара точно.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="flex gap-2">
                      <Button
                        variant={sourceType === "text" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSourceType("text")}
                      >
                        Текст / FAQ
                      </Button>
                      <Button
                        variant={sourceType === "website" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSourceType("website")}
                      >
                        Веб-страна
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label>Име</Label>
                      <Input
                        placeholder={sourceType === "text" ? "нпр. FAQ за испорака" : "нпр. Нашата веб-страна"}
                        value={sourceName}
                        onChange={(e) => setSourceName(e.target.value)}
                      />
                    </div>
                    {sourceType === "text" ? (
                      <div className="space-y-2">
                        <Label>Содржина</Label>
                        <Textarea
                          placeholder="Внесете го текстот, FAQ прашања и одговори, или друга информација..."
                          rows={8}
                          value={sourceContent}
                          onChange={(e) => setSourceContent(e.target.value)}
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label>URL</Label>
                        <Input
                          placeholder="https://vashata-stranica.mk"
                          value={sourceUrl}
                          onChange={(e) => setSourceUrl(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAddSourceOpen(false)}>Откажи</Button>
                    <Button
                      onClick={handleAddSource}
                      disabled={addingSource || !sourceName.trim() || (sourceType === "text" ? !sourceContent.trim() : !sourceUrl.trim())}
                      className="bg-gradient-accent text-white hover:opacity-90"
                    >
                      {addingSource && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                      Додади
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {sources.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Database className="w-10 h-10 text-muted-foreground/40 mb-4" />
                  <p className="text-muted-foreground mb-4">Нема извори. Додадете текст или веб-страна.</p>
                  <Button variant="outline" onClick={() => setAddSourceOpen(true)} className="gap-2">
                    <Plus className="w-4 h-4" /> Додади извор
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
                          {src.type === "website" ? "Веб-страна" : "Текст"} ·{" "}
                          <span className={cn(
                            src.status === "ready" && "text-green-600",
                            src.status === "processing" && "text-yellow-600",
                            src.status === "error" && "text-destructive",
                            src.status === "pending" && "text-muted-foreground",
                          )}>
                            {src.status === "ready" ? "Готов" : src.status === "processing" ? "Се обработува..." : src.status === "error" ? "Грешка" : "Чека"}
                          </span>
                          {src.errorMessage && ` — ${src.errorMessage}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleResyncSource(src._id)} title="Ресинхронизирај">
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteSource(src._id)} title="Избриши">
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
            <h2 className="font-display font-semibold text-xl text-foreground mb-2">Интеграции</h2>
            <p className="text-sm text-muted-foreground mb-6">Поврзете го вашиот chatbot со Facebook и Instagram.</p>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Website */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                      <Globe className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Веб-страна</CardTitle>
                      <CardDescription>Embed виџет на вашата страна</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Копирајте го embed кодот од табот "Embed код" и ставете го на вашата веб-страна.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Check className="w-4 h-4" /> Секогаш достапно
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
                      <CardTitle className="text-base">Facebook Page</CardTitle>
                      <CardDescription>Автоматски одговарајте на DM пораки</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {connections.filter((c) => c.status === "active").length > 0 ? (
                    <div className="space-y-3">
                      {connections.filter((c) => c.status === "active").map((conn) => (
                        <div key={conn._id} className="flex items-center justify-between bg-muted rounded-lg px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-foreground">{conn.pageName}</p>
                            <p className="text-xs text-green-600">Поврзана</p>
                            {conn.instagramAccountId && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <Instagram className="w-3 h-3" /> Instagram поврзан
                              </p>
                            )}
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleDisconnectPage(conn.pageId)}>
                            Дисконектирај
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Button onClick={handleConnectFacebook} className="w-full gap-2">
                      <Facebook className="w-4 h-4" /> Поврзи Facebook Page
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
                      <CardTitle className="text-base">Instagram</CardTitle>
                      <CardDescription>Автоматски одговарајте на Instagram DM</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {connections.some((c) => c.instagramAccountId && c.status === "active") ? (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Check className="w-4 h-4" /> Поврзан преку Facebook Page
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Instagram се поврзува автоматски кога ја поврзувате вашата Facebook Page
                      (ако имате поврзана Instagram Business сметка).
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
                      <CardTitle className="text-base">Споделлив линк</CardTitle>
                      <CardDescription>Директен линк до вашиот chatbot</CardDescription>
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
                          Chatbot-от мора да биде активен за линкот да работи.
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Споделете го овој линк за директен пристап до вашиот chatbot без потреба од веб-страна.
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Споделливиот линк ќе биде достапен откако chatbot-от ќе биде зачуван.
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
                        <CardTitle>Embed код за веб-страна</CardTitle>
                        <CardDescription>
                          Копирајте го кодот и ставете го на вашата веб-страна.
                        </CardDescription>
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                          <BookOpen className="w-4 h-4" />
                          Упатство
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-xl">Како да го додадете chatbot-от на вашата веб-страна</DialogTitle>
                          <DialogDescription>
                            Чекор по чекор упатство за инсталација
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                          {/* Step 1 */}
                          <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-sm">1</div>
                            <div>
                              <h4 className="font-semibold text-foreground mb-1">Копирајте го кодот</h4>
                              <p className="text-sm text-muted-foreground">
                                Кликнете на копчето „Копирај код" подолу. Кодот автоматски ќе се копира.
                              </p>
                            </div>
                          </div>

                          {/* Step 2 */}
                          <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-sm">2</div>
                            <div>
                              <h4 className="font-semibold text-foreground mb-1">Отворете го HTML-от на вашата страна</h4>
                              <p className="text-sm text-muted-foreground mb-2">
                                Пристапете до кодот на вашата веб-страна. Зависно од платформата:
                              </p>
                              <div className="space-y-2 text-sm">
                                <div className="bg-muted rounded-lg px-3 py-2">
                                  <span className="font-medium text-foreground">WordPress:</span>{" "}
                                  <span className="text-muted-foreground">Appearance → Theme Editor → footer.php, или користете plugin како „Insert Headers and Footers"</span>
                                </div>
                                <div className="bg-muted rounded-lg px-3 py-2">
                                  <span className="font-medium text-foreground">Wix:</span>{" "}
                                  <span className="text-muted-foreground">Settings → Custom Code → Add Code → Body - End</span>
                                </div>
                                <div className="bg-muted rounded-lg px-3 py-2">
                                  <span className="font-medium text-foreground">Shopify:</span>{" "}
                                  <span className="text-muted-foreground">Online Store → Themes → Edit Code → theme.liquid</span>
                                </div>
                                <div className="bg-muted rounded-lg px-3 py-2">
                                  <span className="font-medium text-foreground">Squarespace:</span>{" "}
                                  <span className="text-muted-foreground">Settings → Advanced → Code Injection → Footer</span>
                                </div>
                                <div className="bg-muted rounded-lg px-3 py-2">
                                  <span className="font-medium text-foreground">Custom HTML:</span>{" "}
                                  <span className="text-muted-foreground">Отворете го главниот HTML фајл (обично index.html)</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Step 3 */}
                          <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-sm">3</div>
                            <div>
                              <h4 className="font-semibold text-foreground mb-1">Залепете го кодот пред &lt;/body&gt;</h4>
                              <p className="text-sm text-muted-foreground mb-2">
                                Најдете го затворачкиот <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">&lt;/body&gt;</code> таг и
                                залепете го кодот <strong>непосредно пред него</strong>:
                              </p>
                              <div className="bg-muted rounded-lg p-3 font-mono text-xs text-muted-foreground leading-relaxed">
                                <div>&nbsp;&nbsp;&nbsp;&nbsp;...</div>
                                <div className="text-primary font-medium">&nbsp;&nbsp;&nbsp;&nbsp;{'<!-- Залепете го кодот ТУКА -->'}</div>
                                <div>&nbsp;&nbsp;&lt;/body&gt;</div>
                                <div>&lt;/html&gt;</div>
                              </div>
                            </div>
                          </div>

                          {/* Step 4 */}
                          <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-sm">4</div>
                            <div>
                              <h4 className="font-semibold text-foreground mb-1">Зачувајте и проверете</h4>
                              <p className="text-sm text-muted-foreground">
                                Зачувајте ги промените и отворете ја вашата веб-страна. Во долниот десен агол треба да се
                                појави иконата на chatbot-от. Кликнете на неа за да го тестирате.
                              </p>
                            </div>
                          </div>

                          {/* Tips */}
                          <div className="border-t border-border pt-4">
                            <h4 className="font-semibold text-foreground mb-3">Корисни совети</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                              <li className="flex gap-2">
                                <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                Кодот треба да се додаде само <strong className="text-foreground">еднаш</strong> — ќе работи на сите страници.
                              </li>
                              <li className="flex gap-2">
                                <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                Chatbot-от мора да биде <strong className="text-foreground">активиран</strong> (статус: Active) за да се прикажува.
                              </li>
                              <li className="flex gap-2">
                                <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                Промените во подесувањата (prompt, боја, поздрав) се применуваат <strong className="text-foreground">веднаш</strong> — не треба повторно да го додавате кодот.
                              </li>
                              <li className="flex gap-2">
                                <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                Ако имате проблеми, проверете дали вашиот домен е додаден во „Дозволени домени" во подесувањата.
                              </li>
                            </ul>
                          </div>
                        </div>
                        <DialogFooter>
                          <DialogTrigger asChild>
                            <Button>Разбрав</Button>
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
                    {embedCopied ? "Копирано!" : "Копирај код"}
                  </Button>

                  {chatbot.status !== "active" && (
                    <p className="text-sm text-yellow-600 mt-4">
                      Chatbot-от мора да биде активиран за виџетот да работи. Кликнете „Активирај" горе.
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
