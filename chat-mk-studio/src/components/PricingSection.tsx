import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const PricingSection = () => {
  const [annual, setAnnual] = useState(false);

  const plans = [
    {
      name: "Бесплатен",
      desc: "Пробајте без ризик",
      price: "0",
      period: "",
      currency: "МКД",
      highlight: false,
      cta: "Започни бесплатно",
      ctaLink: "/signup",
      features: [
        { text: "20 пораки вкупно (засекогаш)", included: true },
        { text: "1 AI chatbot", included: true },
        { text: "2 извори на податоци", included: true },
        { text: "Македонски јазик", included: true },
        { text: "Интеграција на веб-страна", included: true },
        { text: "Facebook & Instagram", included: false },
        { text: "Напредна аналитика", included: false },
        { text: "Приоритетна поддршка", included: false },
      ],
    },
    {
      name: "Стартер",
      desc: "За мали и средни бизниси",
      price: annual ? "12,000" : "1,200",
      period: annual ? "/годишно" : "/месечно",
      currency: "МКД",
      highlight: true,
      badge: "Популарен",
      cta: "Започни сега",
      ctaLink: "/signup",
      features: [
        { text: "2,000 пораки месечно", included: true },
        { text: "3 AI chatbot-и", included: true },
        { text: "10 извори на податоци", included: true },
        { text: "Повеќејазична поддршка", included: true },
        { text: "Интеграција на веб-страна", included: true },
        { text: "Facebook & Instagram", included: true },
        { text: "Напредна аналитика", included: true },
        { text: "Email поддршка", included: true },
      ],
    },
    {
      name: "Про",
      desc: "За растечки и големи бизниси",
      price: annual ? "17,000" : "1,800",
      period: annual ? "/годишно" : "/месечно",
      currency: "МКД",
      highlight: false,
      cta: "Започни сега",
      ctaLink: "/signup",
      features: [
        { text: "10,000 пораки месечно", included: true },
        { text: "10 AI chatbot-и", included: true },
        { text: "50 извори на податоци", included: true },
        { text: "Повеќејазична поддршка", included: true },
        { text: "Сите интеграции", included: true },
        { text: "API пристап", included: true },
        { text: "Приоритетна поддршка", included: true },
        { text: "Прилагодлив дизајн", included: true },
      ],
    },
  ];

  return (
    <section id="pricing" className="py-24 section-muted">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">Цени</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
            Започнете бесплатно, надградете кога ќе сте спремни
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Без кредитна картичка. Без скриени трошоци. Без ризик.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 mb-12">
          <span className={cn("text-sm font-medium", !annual ? "text-foreground" : "text-muted-foreground")}>Месечно</span>
          <button
            onClick={() => setAnnual(!annual)}
            className={cn(
              "relative w-12 h-6 rounded-full transition-colors",
              annual ? "bg-primary" : "bg-border"
            )}
          >
            <span className={cn(
              "absolute top-0.5 w-5 h-5 rounded-full bg-background transition-transform shadow-sm",
              annual ? "translate-x-6" : "translate-x-0.5"
            )} />
          </button>
          <span className={cn("text-sm font-medium", annual ? "text-foreground" : "text-muted-foreground")}>
            Годишно <span className="text-primary text-xs font-semibold">Заштеди</span>
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={cn(
                "relative rounded-2xl p-8 border flex flex-col bg-card",
                plan.highlight
                  ? "border-primary shadow-xl shadow-primary/10 scale-105"
                  : "border-border"
              )}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">
                  {plan.badge}
                </span>
              )}
              <h3 className="font-display font-bold text-xl text-foreground">{plan.name}</h3>
              <p className="text-sm mt-1 text-muted-foreground">{plan.desc}</p>

              <div className="mt-6 mb-6">
                <span className="font-display font-extrabold text-4xl text-foreground">{plan.price}</span>
                {plan.currency && plan.price !== "0" && <span className="text-sm ml-1 text-foreground">{plan.currency}</span>}
                {plan.price === "0" && <span className="text-sm ml-1 text-foreground">МКД</span>}
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((f) => (
                  <li key={f.text} className={cn("flex items-start gap-2 text-sm", f.included ? "text-foreground" : "text-muted-foreground/50")}>
                    {f.included ? (
                      <Check className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                    ) : (
                      <X className="w-4 h-4 mt-0.5 shrink-0" />
                    )}
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>

              <Link to={plan.ctaLink}>
                <Button className={cn("w-full", plan.highlight ? "" : "variant-outline")} variant={plan.highlight ? "default" : "outline"}>
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
