import { motion } from "framer-motion";
import { Lock, Shield, KeyRound, FileSearch } from "lucide-react";

const pillars = [
  {
    icon: Lock,
    title: "Енкрипција",
    description: "AES-256 енкрипција за сите податоци во мирување и TLS 1.3 за податоци во транзит.",
  },
  {
    icon: Shield,
    title: "GDPR усогласеност",
    description: "Целосна усогласеност со GDPR регулативата за заштита на лични податоци.",
  },
  {
    icon: KeyRound,
    title: "Контрола на пристап",
    description: "Гранулирани дозволи и улоги за секој член на тимот со SSO поддршка.",
  },
  {
    icon: FileSearch,
    title: "Ревизии",
    description: "Целосен аудит лог на сите активности за транспарентност и усогласеност.",
  },
];

const SecuritySection = () => {
  return (
    <section className="py-24">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">Безбедност</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
            Вашите податоци се безбедни
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Безбедноста е вградена во секој слој на нашата платформа.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <p.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;
