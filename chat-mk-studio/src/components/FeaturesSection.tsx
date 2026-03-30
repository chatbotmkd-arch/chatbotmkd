import { motion } from "framer-motion";
import { MessageSquare, Globe, Zap, BarChart3, Shield, Clock, Instagram, Code } from "lucide-react";
import { useLanguage } from "@/lib/language";

const features = {
  en: [
    { icon: MessageSquare, title: "Facebook Messenger", description: "Connect your chatbot to any Facebook Page. Responds to customer messages instantly via Messenger." },
    { icon: Instagram, title: "Instagram DMs", description: "Link your Instagram business account and auto-reply to Direct Messages from customers." },
    { icon: Code, title: "Website Chat Widget", description: "Embed a lightweight chat widget on your website. Customers get instant answers without leaving the page." },
    { icon: Globe, title: "Multilingual Support", description: "Supports Macedonian, English, Albanian, and many more languages out of the box." },
    { icon: Clock, title: "24/7 Availability", description: "Your chatbot works around the clock, answering customer questions even outside business hours." },
    { icon: Zap, title: "Easy Setup — No Code", description: "No coding required. Connect Facebook & Instagram in one click, or copy one embed snippet for your website." },
    { icon: BarChart3, title: "Analytics Dashboard", description: "Track conversations, customer satisfaction, and chatbot performance with detailed analytics." },
    { icon: Shield, title: "Data Security & GDPR", description: "All data is encrypted in transit and at rest. Fully compliant with GDPR data protection standards." },
  ],
  mk: [
    { icon: MessageSquare, title: "Facebook Messenger", description: "Поврзете го вашиот chatbot со било која Facebook страница. Одговара на пораки инстантно преку Messenger." },
    { icon: Instagram, title: "Instagram DMs", description: "Поврзете го вашиот Instagram бизнис профил и автоматски одговарајте на директни пораки од клиенти." },
    { icon: Code, title: "Chat Widget за веб-страна", description: "Додајте лесен chat widget на вашата веб-страна. Клиентите добиваат одговори без да ја напуштат страната." },
    { icon: Globe, title: "Повеќејазична поддршка", description: "Поддржува македонски, англиски, албански и многу други јазици." },
    { icon: Clock, title: "24/7 Достапност", description: "Вашиот chatbot работи нон-стоп, одговарајќи на клиентите и надвор од работно време." },
    { icon: Zap, title: "Лесна интеграција — без код", description: "Без кодирање. Поврзете Facebook и Instagram со еден клик, или копирајте еден код за вашата веб-страна." },
    { icon: BarChart3, title: "Аналитика", description: "Следете ги разговорите, задоволството на клиентите и перформансите со детална аналитика." },
    { icon: Shield, title: "Безбедност и GDPR", description: "Сите податоци се енкриптирани. Целосна усогласеност со GDPR стандардите за заштита на податоци." },
  ],
};

const labels = {
  en: { label: "Features", title: "Everything you need for a great chatbot", subtitle: "Tools to create, train, and deploy your AI chatbot on Facebook, Instagram, and your website." },
  mk: { label: "Функции", title: "Сè што ви треба за совршен chatbot", subtitle: "Алатки за тренирање, прилагодување и поврзување на вашиот AI chatbot на Facebook, Instagram и вашата веб-страна." },
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const FeaturesSection = () => {
  const { lang } = useLanguage();
  const c = labels[lang];
  const f = features[lang];

  return (
    <section id="features" className="py-24 section-muted">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">{c.label}</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">{c.title}</h2>
          <p className="mt-4 text-muted-foreground text-lg">{c.subtitle}</p>
        </div>

        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {f.map((feat) => (
            <motion.div key={feat.title} variants={item} className="bg-card rounded-xl p-7 border border-border/60 hover:shadow-lg hover:shadow-foreground/5 transition-all duration-300">
              <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                <feat.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-2">{feat.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feat.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
