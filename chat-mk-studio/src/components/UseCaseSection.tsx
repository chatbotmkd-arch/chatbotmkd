import { motion } from "framer-motion";
import { MessageSquare, ShieldCheck, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/language";

const t = {
  en: {
    label: "Use Case",
    title: "One chatbot, every channel",
    subtitle: "NexaAI connects to your Facebook Page, Instagram account, and your website. When a customer sends a message on any channel, the chatbot responds automatically with helpful, accurate answers based on your business data.",
    noSpamTitle: "No spam. Ever.",
    noSpamText: "NexaAI only responds to messages initiated by customers — on Messenger, Instagram DMs, or your website widget. It never sends unsolicited messages, never contacts people who haven't reached out first, and fully complies with Meta's Platform Policies.",
    flowSteps: [
      "Customer sends a message via Messenger, Instagram, or your website",
      "NexaAI receives it via the respective API",
      "AI generates a response from your business data",
      "Customer gets an instant, helpful reply",
    ],
    permTitle: "Permissions we request",
    permName: "pages_messaging, instagram_manage_messages",
    permDesc: "To read and respond to incoming conversations on your connected Facebook Page and Instagram account. These permissions are used solely to deliver chatbot replies to customer-initiated messages.",
  },
  mk: {
    label: "Употреба",
    title: "Еден chatbot, секој канал",
    subtitle: "NexaAI се поврзува со вашата Facebook страница, Instagram профил и вашата веб-страна. Кога клиент ќе испрати порака на било кој канал, chatbot-от автоматски одговара со точни одговори базирани на вашите податоци.",
    noSpamTitle: "Без спам. Никогаш.",
    noSpamText: "NexaAI одговара само на пораки иницирани од клиенти — на Messenger, Instagram DM или вашиот веб widget. Никогаш не испраќа несакани пораки, никогаш не контактира луѓе кои не ви испратиле порака и целосно е усогласен со политиките на Meta.",
    flowSteps: [
      "Клиентот испраќа порака преку Messenger, Instagram или вашата веб-страна",
      "NexaAI ја прима преку соодветното API",
      "AI генерира одговор од вашите податоци",
      "Клиентот добива инстантен, корисен одговор",
    ],
    permTitle: "Дозволи кои ги бараме",
    permName: "pages_messaging, instagram_manage_messages",
    permDesc: "За читање и одговарање на дојдовни разговори на вашата поврзана Facebook страница и Instagram профил. Овие дозволи се користат исклучиво за доставување на chatbot одговори на пораки иницирани од клиенти.",
  },
};

const UseCaseSection = () => {
  const { lang } = useLanguage();
  const c = t[lang];

  return (
    <section className="py-24 section-muted">
      <div className="container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">{c.label}</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">{c.title}</h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">{c.subtitle}</p>
        </motion.div>

        {/* Flow diagram */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12"
        >
          <div className="grid sm:grid-cols-4 gap-4">
            {c.flowSteps.map((step, i) => (
              <div key={i} className="relative flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3 text-primary font-bold text-sm">
                  {i + 1}
                </div>
                <p className="text-sm text-foreground leading-snug">{step}</p>
                {i < 3 && (
                  <ArrowRight className="hidden sm:block absolute -right-2 top-3 w-4 h-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* No spam card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl border border-accent/30 bg-accent/5 p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-6 h-6 text-accent" />
              <h3 className="font-display font-semibold text-lg text-foreground">{c.noSpamTitle}</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{c.noSpamText}</p>
          </motion.div>

          {/* Permissions card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-2xl border border-border bg-card p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-6 h-6 text-primary" />
              <h3 className="font-display font-semibold text-lg text-foreground">{c.permTitle}</h3>
            </div>
            <div className="bg-muted rounded-lg px-4 py-3">
              <code className="text-sm font-mono text-primary font-semibold">{c.permName}</code>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{c.permDesc}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default UseCaseSection;
