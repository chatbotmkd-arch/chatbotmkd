import { motion } from "framer-motion";
import { Brain, Sparkles, ShieldCheck } from "lucide-react";

const highlights = [
  {
    icon: Brain,
    title: "Создаден за AI",
    description: "Оптимизиран со најновите LLM модели за одлично разбирање и генерирање на македонски јазик.",
  },
  {
    icon: Sparkles,
    title: "Дизајнирано за едноставност",
    description: "Поставете го вашиот AI chatbot за неколку минути, без кодирање или техничко знаење.",
  },
  {
    icon: ShieldCheck,
    title: "Инженерирано за безбедност",
    description: "Заштита на податоци на ниво на претпријатие со енкрипција и усогласеност со стандарди.",
  },
];

const HighlightsSection = () => {
  return (
    <section className="py-24 section-muted">
      <div className="container">
        <div className="grid md:grid-cols-3 gap-8">
          {highlights.map((h, i) => (
            <motion.div
              key={h.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center p-8"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-accent flex items-center justify-center mx-auto mb-5">
                <h.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-display font-bold text-xl text-foreground mb-3">{h.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{h.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HighlightsSection;
