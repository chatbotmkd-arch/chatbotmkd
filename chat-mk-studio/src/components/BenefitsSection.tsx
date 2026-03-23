import { motion } from "framer-motion";
import { UserCheck, Zap, PaintBucket, HeadphonesIcon, Eye } from "lucide-react";

const benefits = [
  {
    icon: UserCheck,
    title: "Персонализирано искуство",
    description: "AI агентот го памети контекстот и нуди одговори прилагодени на секој клиент.",
  },
  {
    icon: Zap,
    title: "Инстантни акции",
    description: "Не само одговори — ботот може да извршува акции како закажување, нарачки и ажурирања.",
  },
  {
    icon: PaintBucket,
    title: "Во стилот на вашиот бренд",
    description: "Целосно прилагодлив изглед и тон на комуникација кој го рефлектира вашиот бренд.",
  },
  {
    icon: HeadphonesIcon,
    title: "Паметна ескалација",
    description: "Автоматско препознавање кога е потребен човечки агент и беспрекорно пренасочување.",
  },
  {
    icon: Eye,
    title: "Целосна видливост",
    description: "Детален увид во секој разговор, метрики за задоволство и трендови на прашања.",
  },
];

const BenefitsSection = () => {
  return (
    <section className="py-24">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">Придобивки</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
            Зошто ChatBot MK?
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Повеќе од обичен chatbot — интелигентен AI агент за вашиот бизнис.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex gap-4"
            >
              <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <b.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground mb-1">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
