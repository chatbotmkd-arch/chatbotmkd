import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send } from "lucide-react";
import { useLanguage } from "@/lib/language";

interface Message {
  role: "user" | "bot";
  text: string;
}

const quickReplies = {
  en: [
    {
      label: "What are your hours?",
      reply: "We're open Monday to Friday, 9:00 AM - 5:00 PM. On Saturdays we work from 10:00 AM to 2:00 PM. We're closed on Sundays.",
    },
    {
      label: "Do you deliver?",
      reply: "Yes! We offer delivery across North Macedonia. Standard delivery takes 2-3 business days. Free shipping on orders over 1,500 MKD.",
    },
    {
      label: "Return policy?",
      reply: "You can return any product within 14 days of purchase. Items must be unused and in original packaging. Contact us to start a return.",
    },
  ],
  mk: [
    {
      label: "Кое е работното време?",
      reply: "Работиме од Понеделник до Петок, 9:00 - 17:00. Во Сабота работиме од 10:00 до 14:00. Во Недела не работиме.",
    },
    {
      label: "Дали доставувате?",
      reply: "Да! Доставуваме низ цела Македонија. Стандардна достава е 2-3 работни дена. Бесплатна достава за нарачки над 1.500 ден.",
    },
    {
      label: "Политика за враќање?",
      reply: "Може да вратите производ во рок од 14 дена. Производот мора да е некористен и во оригинално пакување. Контактирајте не за враќање.",
    },
  ],
};

const t = {
  en: {
    label: "Live Demo",
    title: "See it in action",
    subtitle: "Click a question below to see how the chatbot responds to customer messages on Facebook, Instagram, or your website.",
    widgetTitle: "Coffee Shop MK",
    widgetSub: "Typically replies instantly",
    typing: "Typing...",
    placeholder: "Try clicking a question below",
  },
  mk: {
    label: "Демо",
    title: "Видете го во акција",
    subtitle: "Кликнете на прашање подолу за да видите како chatbot-от одговара на пораки од клиенти на Facebook, Instagram или вашата веб-страна.",
    widgetTitle: "Coffee Shop MK",
    widgetSub: "Обично одговара инстантно",
    typing: "Пишува...",
    placeholder: "Кликнете на прашање подолу",
  },
};

const ChatDemoSection = () => {
  const { lang } = useLanguage();
  const c = t[lang];
  const replies = quickReplies[lang];

  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const [usedQuestions, setUsedQuestions] = useState<Set<number>>(new Set());

  const handleQuickReply = useCallback((index: number) => {
    if (typing || usedQuestions.has(index)) return;

    const q = replies[index];
    setUsedQuestions((prev) => new Set(prev).add(index));
    setMessages((prev) => [...prev, { role: "user", text: q.label }]);
    setTyping(true);

    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "bot", text: q.reply }]);
      setTyping(false);
    }, 1200);
  }, [typing, usedQuestions, replies]);

  return (
    <section className="py-24">
      <div className="container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">{c.label}</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">{c.title}</h2>
          <p className="mt-4 text-muted-foreground text-lg">{c.subtitle}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="max-w-md mx-auto"
        >
          <div className="rounded-2xl overflow-hidden shadow-2xl shadow-foreground/8 border border-border/60 bg-card">
            {/* Header */}
            <div className="bg-[#0084ff] px-5 py-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm">{c.widgetTitle}</div>
                <div className="text-white/70 text-xs">{c.widgetSub}</div>
              </div>
            </div>

            {/* Messages */}
            <div className="p-4 space-y-3 min-h-[260px] max-h-[360px] overflow-y-auto bg-gradient-to-b from-card to-muted/20">
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
                  {c.placeholder}
                </div>
              )}

              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[#0084ff] text-white rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {typing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-md flex gap-1 items-center">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Quick replies */}
            <div className="border-t border-border px-4 py-3 space-y-2">
              <div className="flex flex-wrap gap-2">
                {replies.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickReply(i)}
                    disabled={typing || usedQuestions.has(i)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      usedQuestions.has(i)
                        ? "border-border text-muted-foreground/40 cursor-default"
                        : "border-primary/30 text-primary hover:bg-primary/5 cursor-pointer"
                    }`}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ChatDemoSection;
