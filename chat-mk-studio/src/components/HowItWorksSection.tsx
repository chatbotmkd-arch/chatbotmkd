import { motion } from "framer-motion";
import { Bot, Database, Share2 } from "lucide-react";
import { useLanguage } from "@/lib/language";

const t = {
  en: {
    label: "How It Works",
    title: "3 Steps to Your AI Chatbot",
    subtitle: "No coding required. No technical skills needed.",
    steps: [
      { num: "01", icon: Bot, title: "Create your chatbot", desc: "Answer a few questions about your business. Upload your FAQs, documents, or website URL." },
      { num: "02", icon: Database, title: "Train with your content", desc: "The AI learns from your data and becomes an expert on your business, products, and services." },
      { num: "03", icon: Share2, title: "Connect your channels", desc: "Link your Facebook Page, Instagram account, or embed a chat widget on your website — all in one click." },
    ],
  },
  mk: {
    label: "Како работи",
    title: "3 чекори до вашиот AI Chatbot",
    subtitle: "Без кодирање. Без техничко знаење.",
    steps: [
      { num: "01", icon: Bot, title: "Креирајте го вашиот chatbot", desc: "Одговорете на неколку прашања за вашиот бизнис. Поставете FAQ, документи или веб-страна." },
      { num: "02", icon: Database, title: "Тренирајте со вашите податоци", desc: "AI учи од вашите информации и станува експерт за вашиот бизнис, производи и услуги." },
      { num: "03", icon: Share2, title: "Поврзете ги вашите канали", desc: "Поврзете Facebook страница, Instagram профил или додајте chat widget на вашата веб-страна — сè со еден клик." },
    ],
  },
};

const HowItWorksSection = () => {
  const { lang } = useLanguage();
  const c = t[lang];

  return (
    <section id="how-it-works" className="py-24">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">{c.label}</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">{c.title}</h2>
          <p className="mt-4 text-muted-foreground text-lg">{c.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {c.steps.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-display font-bold text-xl mx-auto mb-6 shadow-lg shadow-primary/20">
                {s.num}
              </div>
              <div className="flex items-center gap-2 justify-center mb-3">
                <s.icon className="w-5 h-5 text-primary" />
                <h3 className="font-display font-semibold text-lg text-foreground">{s.title}</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed text-sm">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
