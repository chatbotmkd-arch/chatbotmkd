import { motion } from "framer-motion";
import { Database, Palette, Rocket } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: Database,
    title: "Додадете ги вашите податоци",
    desc: "Поставете FAQ, документи или веб-страна. AI автоматски учи од вашите информации.",
  },
  {
    num: "02",
    icon: Palette,
    title: "Прилагодете го ботот",
    desc: "Изберете тон, јазик и однесување. Одговорете на неколку прашања и ботот е спремен.",
  },
  {
    num: "03",
    icon: Rocket,
    title: "Објавете го за секунди",
    desc: "Копирајте еден код за вашата веб-страна, или поврзете го со Facebook и Instagram.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">Како работи</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
            3 чекори. 5 минути. Готово.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Без техничко знаење. Без кодирање. Без чекање.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((s, i) => (
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
