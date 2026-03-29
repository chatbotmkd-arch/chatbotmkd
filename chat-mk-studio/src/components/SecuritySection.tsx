import { motion } from "framer-motion";
import { Lock, Shield, KeyRound, FileSearch } from "lucide-react";
import { useLanguage } from "@/lib/language";

const pillars = {
  en: [
    { icon: Lock, title: "Encryption", description: "AES-256 encryption for all data at rest and TLS 1.3 for data in transit." },
    { icon: Shield, title: "GDPR Compliant", description: "Full compliance with GDPR data protection regulations. Your data is never sold or shared." },
    { icon: KeyRound, title: "Access Control", description: "Granular permissions and roles for every team member with secure authentication." },
    { icon: FileSearch, title: "Audit Logs", description: "Complete audit trail of all activities for transparency and compliance." },
  ],
  mk: [
    { icon: Lock, title: "Енкрипција", description: "AES-256 енкрипција за сите податоци во мирување и TLS 1.3 за податоци во транзит." },
    { icon: Shield, title: "GDPR усогласеност", description: "Целосна усогласеност со GDPR регулативата. Вашите податоци никогаш не се продаваат или споделуваат." },
    { icon: KeyRound, title: "Контрола на пристап", description: "Гранулирани дозволи и улоги за секој член на тимот со безбедна автентикација." },
    { icon: FileSearch, title: "Ревизии", description: "Целосен аудит лог на сите активности за транспарентност и усогласеност." },
  ],
};

const labels = {
  en: { label: "Security", title: "Your data is safe with us", subtitle: "Security is built into every layer of our platform. Your business data is encrypted, protected, and never shared with third parties.", statement: "Your data is secure and used only to provide chatbot functionality." },
  mk: { label: "Безбедност", title: "Вашите податоци се безбедни", subtitle: "Безбедноста е вградена во секој слој на нашата платформа. Вашите податоци се енкриптирани, заштитени и никогаш не се споделуваат.", statement: "Вашите податоци се безбедни и се користат само за функционалност на chatbot-от." },
};

const SecuritySection = () => {
  const { lang } = useLanguage();
  const c = labels[lang];
  const p = pillars[lang];

  return (
    <section className="py-24">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">{c.label}</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">{c.title}</h2>
          <p className="mt-4 text-muted-foreground text-lg">{c.subtitle}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto mb-12">
          {p.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <pillar.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">{pillar.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{pillar.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground italic">{c.statement}</p>
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;
