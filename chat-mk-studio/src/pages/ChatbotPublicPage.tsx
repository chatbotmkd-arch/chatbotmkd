import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Bot, Send, Loader2, MapPin, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

interface PageConfig {
  chatbotId: string;
  name: string;
  slug: string;
  language: string;
  appearance: {
    primaryColor: string;
    greeting: string;
    placeholder: string;
  };
  businessInfo: {
    phone?: string;
    email?: string;
    address?: string;
    businessName?: string;
  };
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const ChatbotPublicPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [config, setConfig] = useState<PageConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadConfig();
  }, [slug]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConfig = async () => {
    try {
      const res = await fetch(`${API_BASE}/widget/page/${slug}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError("not_found");
        } else {
          setError("error");
        }
        return;
      }
      const data = await res.json();
      setConfig(data);

      // Show greeting as first message
      if (data.appearance.greeting) {
        setMessages([
          {
            id: "greeting",
            role: "assistant",
            content: data.appearance.greeting,
          },
        ]);
      }
    } catch {
      setError("error");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || sending || !config) return;

    setInput("");
    const userMsg: ChatMessage = { id: `user-${Date.now()}`, role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);

    try {
      const res = await fetch(`${API_BASE}/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatbotId: config.chatbotId,
          sessionId,
          message: msg,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const isLimit = data.error?.includes("лимитот") || data.error?.includes("Надградете");
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "assistant",
            content: isLimit
              ? "Се извинувам, моментално не можам да одговорам. Ве молам пробајте подоцна."
              : "Грешка при генерирање одговор. Ве молам пробајте повторно.",
          },
        ]);
        return;
      }

      setSessionId(data.sessionId);
      setMessages((prev) => [
        ...prev,
        { id: data.message.id, role: "assistant", content: data.message.content },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `err-${Date.now()}`, role: "assistant", content: "Грешка при поврзување. Пробајте повторно." },
      ]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error === "not_found") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <Bot className="w-16 h-16 text-gray-300 mb-4" />
        <h1 className="text-xl font-semibold text-gray-700 mb-2">Chatbot не е пронајден</h1>
        <p className="text-gray-500 text-center">
          Оваа страница не постои или chatbot-от е деактивиран.
        </p>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <p className="text-gray-500">Грешка при вчитување. Пробајте повторно.</p>
      </div>
    );
  }

  const primaryColor = config.appearance.primaryColor || "#8b5cf6";
  const businessName = config.businessInfo.businessName || config.name;
  const hasFooterInfo = config.businessInfo.phone || config.businessInfo.address || config.businessInfo.email;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header
        className="shrink-0 px-4 py-4 text-white shadow-sm"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-semibold text-lg leading-tight">{businessName}</h1>
            <p className="text-white/70 text-xs">Виртуелен асистент</p>
          </div>
        </div>
      </header>

      {/* Chat area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                  msg.role === "user"
                    ? "rounded-br-md text-white"
                    : "bg-white text-gray-800 rounded-bl-md border border-gray-100"
                )}
                style={msg.role === "user" ? { backgroundColor: primaryColor } : undefined}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input area */}
      <div className="shrink-0 bg-white border-t border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={config.appearance.placeholder || "Напишете порака..."}
            disabled={sending}
            className="flex-1 rounded-full border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 disabled:opacity-50"
            autoFocus
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 disabled:opacity-40 transition-opacity"
            style={{ backgroundColor: primaryColor }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="shrink-0 bg-white border-t border-gray-100 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          {hasFooterInfo && (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mb-3 text-xs text-gray-500">
              {config.businessInfo.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {config.businessInfo.phone}
                </span>
              )}
              {config.businessInfo.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {config.businessInfo.address}
                </span>
              )}
              {config.businessInfo.email && (
                <span>{config.businessInfo.email}</span>
              )}
            </div>
          )}
          <p className="text-[11px] text-gray-400 text-center">
            Powered by{" "}
            <a
              href="https://chatbotmkd.mk"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              ChatBot MK
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ChatbotPublicPage;
