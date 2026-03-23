import { motion } from "framer-motion";
import { MessageSquare, Globe, Zap, BarChart3, Shield, Clock } from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Македонски јазик",
    description: "AI асистент кој разбира и одговара на македонски јазик природно и точно.",
  },
  {
    icon: Clock,
    title: "24/7 Достапност",
    description: "Вашиот chatbot работи нон-стоп, одговарајќи на клиентите во секое време.",
  },
  {
    icon: Zap,
    title: "Лесна интеграција",
    description: "Додадете го на вашата веб-страна, Facebook или Instagram со само неколку кликови.",
  },
  {
    icon: Globe,
    title: "Повеќејазична поддршка",
    description: "Покрај македонски, поддржува и англиски, албански и други јазици.",
  },
  {
    icon: BarChart3,
    title: "Напредна аналитика",
    description: "Следете ги разговорите, задоволството на клиентите и перформансите.",
  },
  {
    icon: Shield,
    title: "Безбедност",
    description: "Сите податоци се заштитени со енкрипција и усогласени со стандарди.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 section-muted">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">Функции</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
            Сè што ви треба за совршен AI асистент
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Алатки за тренирање, прилагодување и поврзување на вашиот chatbot со бизнис системите.
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={item}
              className="bg-card rounded-xl p-7 border border-border/60 hover:shadow-lg hover:shadow-foreground/5 transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
