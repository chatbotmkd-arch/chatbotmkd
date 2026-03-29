import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/language";

const t = {
  en: {
    label: "Pricing",
    title: "Start free, upgrade when you're ready",
    subtitle: "No credit card required. No hidden fees.",
    monthly: "Monthly",
    annual: "Annual",
    save: "Save",
    plans: [
      {
        name: "Free", desc: "Try it risk-free", price: "0", period: "", highlight: false, cta: "Start free", ctaLink: "/signup",
        features: ["8-day free trial", "30 message credits", "1 AI chatbot", "2 data sources", "Website integration", "Macedonian language"],
      },
      {
        name: "Starter", desc: "For small & medium businesses", highlight: true, badge: "Popular", cta: "Get started", ctaLink: "/signup",
        priceMonthly: "700", priceAnnual: "6,000", periodMonthly: "/mo", periodAnnual: "/yr",
        features: ["300 message credits/month", "3 AI chatbots", "10 data sources", "Multilingual support", "Website integration", "Facebook & Instagram", "Shareable chatbot link", "Email support"],
      },
      {
        name: "Pro", desc: "For growing businesses", highlight: false, cta: "Get started", ctaLink: "/signup",
        priceMonthly: "1,200", priceAnnual: "12,000", periodMonthly: "/mo", periodAnnual: "/yr",
        features: ["500 message credits/month", "10 AI chatbots", "50 data sources", "Multilingual support", "All integrations", "Shareable chatbot link", "Priority support"],
      },
    ],
  },
  mk: {
    label: "Цени",
    title: "Започнете бесплатно, надградете кога ќе сте спремни",
    subtitle: "Без кредитна картичка. Без скриени трошоци.",
    monthly: "Месечно",
    annual: "Годишно",
    save: "Заштеди",
    plans: [
      {
        name: "Бесплатен", desc: "Пробајте без ризик", price: "0", period: "", highlight: false, cta: "Започни бесплатно", ctaLink: "/signup",
        features: ["8 дена пробен период", "30 кредити (пораки)", "1 AI chatbot", "2 извори на податоци", "Интеграција на веб-страна", "Македонски јазик"],
      },
      {
        name: "Стартер", desc: "За мали и средни бизниси", highlight: true, badge: "Популарен", cta: "Започни сега", ctaLink: "/signup",
        priceMonthly: "700", priceAnnual: "6,000", periodMonthly: "/месечно", periodAnnual: "/годишно",
        features: ["300 кредити (пораки) месечно", "3 AI chatbot-и", "10 извори на податоци", "Повеќејазична поддршка", "Интеграција на веб-страна", "Facebook & Instagram", "Споделлив линк за chatbot", "Email поддршка"],
      },
      {
        name: "Про", desc: "За растечки бизниси", highlight: false, cta: "Започни сега", ctaLink: "/signup",
        priceMonthly: "1,200", priceAnnual: "12,000", periodMonthly: "/месечно", periodAnnual: "/годишно",
        features: ["500 кредити (пораки) месечно", "10 AI chatbot-и", "50 извори на податоци", "Повеќејазична поддршка", "Сите интеграции", "Споделлив линк за chatbot", "Приоритетна поддршка"],
      },
    ],
  },
};

const PricingSection = () => {
  const [annual, setAnnual] = useState(false);
  const { lang } = useLanguage();
  const c = t[lang];

  return (
    <section id="pricing" className="py-24 section-muted">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">{c.label}</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">{c.title}</h2>
          <p className="mt-4 text-muted-foreground text-lg">{c.subtitle}</p>
        </div>

        <div className="flex items-center justify-center gap-3 mb-12">
          <span className={cn("text-sm font-medium", !annual ? "text-foreground" : "text-muted-foreground")}>{c.monthly}</span>
          <button onClick={() => setAnnual(!annual)} className={cn("relative w-12 h-6 rounded-full transition-colors", annual ? "bg-primary" : "bg-border")}>
            <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-background transition-transform shadow-sm", annual ? "translate-x-6" : "translate-x-0.5")} />
          </button>
          <span className={cn("text-sm font-medium", annual ? "text-foreground" : "text-muted-foreground")}>
            {c.annual} <span className="text-primary text-xs font-semibold">{c.save}</span>
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {c.plans.map((plan, i) => {
            const price = plan.price ?? (annual ? plan.priceAnnual : plan.priceMonthly);
            const period = plan.period ?? (annual ? plan.periodAnnual : plan.periodMonthly);

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={cn("relative rounded-2xl p-8 border flex flex-col bg-card", plan.highlight ? "border-primary shadow-xl shadow-primary/10 scale-105" : "border-border")}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">{plan.badge}</span>
                )}
                <h3 className="font-display font-bold text-xl text-foreground">{plan.name}</h3>
                <p className="text-sm mt-1 text-muted-foreground">{plan.desc}</p>

                <div className="mt-6 mb-6">
                  <span className="font-display font-extrabold text-4xl text-foreground">{price}</span>
                  <span className="text-sm ml-1 text-foreground">MKD</span>
                  <span className="text-sm text-muted-foreground">{period}</span>
                </div>

                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link to={plan.ctaLink}>
                  <Button className="w-full" variant={plan.highlight ? "default" : "outline"}>{plan.cta}</Button>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
