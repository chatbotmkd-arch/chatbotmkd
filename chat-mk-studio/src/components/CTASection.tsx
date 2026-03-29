import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language";

const t = {
  en: {
    title: "Ready to automate your Facebook Page messaging?",
    subtitle: "Create your AI chatbot in minutes and start responding to customers instantly — 24/7.",
    cta: "Get Started",
  },
  mk: {
    title: "Подготвени сте да го автоматизирате вашиот Messenger?",
    subtitle: "Креирајте го вашиот AI chatbot за неколку минути и почнете да одговарате на клиенти инстантно — 24/7.",
    cta: "Започни бесплатно",
  },
};

const CTASection = () => {
  const { lang } = useLanguage();
  const c = t[lang];

  return (
    <section className="py-24 section-muted">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl bg-foreground text-background overflow-hidden p-12 md:p-20 text-center shadow-2xl"
        >
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">{c.title}</h2>
          <p className="text-background/70 text-lg max-w-xl mx-auto mb-8">{c.subtitle}</p>
          <Link to="/signup">
            <Button size="lg" variant="secondary" className="gap-2 bg-background text-foreground hover:bg-background/90 text-base px-8">
              {c.cta} <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
