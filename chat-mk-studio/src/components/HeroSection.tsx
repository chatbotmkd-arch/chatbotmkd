import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language";

const chatMessages = [
  { role: "user" as const, en: "Hi, what are your opening hours?", mk: "Здраво, кое е вашето работно време?" },
  { role: "bot" as const, en: "We're open Mon-Fri, 9am-5pm. Can I help with anything else?", mk: "Работиме Пон-Пет, 9:00-17:00. Може ли да ви помогнам со нешто друго?" },
  { role: "user" as const, en: "Do you deliver to Bitola?", mk: "Дали доставувате до Битола?" },
  { role: "bot" as const, en: "Yes! We deliver across North Macedonia. Standard delivery is 2-3 business days.", mk: "Да! Доставуваме низ цела Македонија. Стандардна достава е 2-3 работни дена." },
];

const t = {
  en: {
    h1a: "Create a chatbot for your",
    h1b: "Facebook Page",
    h1c: "in 10 minutes",
    sub: "Train your chatbot with your business data and automatically reply to customer messages on Messenger — 24/7, in any language.",
    cta: "Get Started",
    note: "No credit card required. Ready in minutes.",
    widgetTitle: "Your Business Page",
  },
  mk: {
    h1a: "Креирајте chatbot за вашата",
    h1b: "Facebook страница",
    h1c: "за 10 минути",
    sub: "Тренирајте го вашиот chatbot со податоци за вашиот бизнис и автоматски одговарајте на пораки на Messenger — 24/7, на било кој јазик.",
    cta: "Започни бесплатно",
    note: "Без кредитна картичка. Готов за неколку минути.",
    widgetTitle: "Вашата бизнис страница",
  },
};

const HeroSection = () => {
  const { lang } = useLanguage();
  const c = t[lang];

  return (
    <section className="pt-32 pb-20 overflow-hidden">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl leading-tight tracking-tight text-foreground">
              {c.h1a}{" "}
              <span className="text-gradient">{c.h1b}</span>{" "}
              {c.h1c}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-lg leading-relaxed">{c.sub}</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link to="/signup">
                <Button size="lg" className="gap-2 text-base px-8 shadow-lg shadow-primary/20">
                  {c.cta} <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">{c.note}</p>
          </motion.div>

          {/* Messenger-style chat mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-foreground/8 border border-border/60 bg-card">
              {/* Header bar */}
              <div className="bg-[#0084ff] px-5 py-3.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{c.widgetTitle}</div>
                  <div className="text-white/70 text-xs">Messenger</div>
                </div>
              </div>

              {/* Chat body */}
              <div className="p-5 space-y-4 min-h-[280px] bg-gradient-to-b from-card to-muted/30">
                {chatMessages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.8 + i * 0.6 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[#0084ff] text-white rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      }`}
                    >
                      {msg[lang]}
                    </div>
                  </motion.div>
                ))}

                {/* Typing indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 3.2, duration: 0.3 }}
                  className="flex justify-start"
                >
                  <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-md flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
