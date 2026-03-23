import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, Clock, Users, AlertTriangle, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { value: "73%", label: "од бизнисите во ЕУ веќе користат AI", icon: TrendingUp },
  { value: "5x", label: "повеќе лидови со AI chatbot", icon: Users },
  { value: "24/7", label: "достапност без дополнителни вработени", icon: Clock },
  { value: "68%", label: "од клиентите преферираат chatbot", icon: Sparkles },
];

const timeline = [
  { year: "2005", text: "\u201EНе ни треба веб-страна\u201C", current: false },
  { year: "2012", text: "\u201EНе ни требаат социјални мрежи\u201C", current: false },
  { year: "2018", text: "\u201EНе ни треба онлајн продавница\u201C", current: false },
  { year: "2025", text: "\u201EНе ни треба AI chatbot\u201C", current: true },
];

const MarketingSection = () => {
  return (
    <section className="py-24 overflow-hidden relative">
      {/* Urgency marquee banner */}
      <div className="bg-foreground text-background py-4 mb-20 -mx-4">
        <div className="flex animate-marquee whitespace-nowrap gap-8">
          {Array.from({ length: 3 }).map((_, rep) => (
            <div key={rep} className="flex items-center gap-8 shrink-0">
              <span className="text-sm font-semibold tracking-wide">AI E НОВАТА ВЕБ-СТРАНА</span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span className="text-sm font-semibold tracking-wide">НЕ ЗАОСТАНУВАЈТЕ</span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span className="text-sm font-semibold tracking-wide">ВАШИТЕ КОНКУРЕНТИ ВЕЌ ГО ИМААТ</span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span className="text-sm font-semibold tracking-wide">ИДНИНАТА Е СЕГА</span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            </div>
          ))}
        </div>
      </div>

      <div className="container">
        {/* "Don't repeat the mistakes" headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <div className="inline-flex items-center gap-2 bg-destructive/10 text-destructive rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
            <AlertTriangle className="w-4 h-4" />
            Не повторувајте ги грешките од минатото
          </div>
          <h2 className="font-display font-extrabold text-3xl md:text-5xl text-foreground leading-tight">
            Во 2005 велеа{" "}
            <span className="line-through text-muted-foreground/50">{"\u201Eне ни треба веб-страна\u201C"}</span>
            <br />
            Денес велат{" "}
            <span className="text-gradient">{"\u201Eне ни треба AI\u201C"}</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Секоја технолошка револуција ги наградува оние кои се први.
            AI chatbot-от не е луксуз — тој е <strong className="text-foreground">нов стандард</strong>.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="max-w-2xl mx-auto mb-20">
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
            {timeline.map((item, i) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.15 }}
                className="relative pl-16 pb-8 last:pb-0"
              >
                <div className={`absolute left-3.5 w-5 h-5 rounded-full border-2 ${
                  item.current
                    ? "bg-primary border-primary animate-pulse"
                    : "bg-muted border-border"
                }`} />
                <div className={`rounded-xl p-5 ${
                  item.current
                    ? "bg-primary/5 border-2 border-primary/20"
                    : "bg-muted"
                }`}>
                  <span className={`text-xs font-bold tracking-wider ${
                    item.current ? "text-primary" : "text-muted-foreground"
                  }`}>{item.year}</span>
                  <p className={`font-display font-semibold text-lg mt-1 ${
                    item.current ? "text-foreground" : "text-muted-foreground line-through"
                  }`}>
                    {item.text}
                  </p>
                  {item.current && (
                    <p className="text-sm text-primary font-medium mt-2">
                      Вие сте тука. Не ја пропуштајте шансата!
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="text-center p-6 rounded-2xl bg-muted border border-border"
            >
              <stat.icon className="w-6 h-6 text-primary mx-auto mb-3" />
              <div className="font-display font-extrabold text-3xl md:text-4xl text-foreground">{stat.value}</div>
              <p className="text-sm text-muted-foreground mt-2 leading-snug">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Before / After comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16"
        >
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8">
            <div className="text-sm font-semibold text-destructive mb-4 uppercase tracking-wider">Без AI Chatbot</div>
            <ul className="space-y-3">
              {[
                "Клиентите чекаат одговор со часови",
                "Губите лидови надвор од работно време",
                "Вработените одговараат на исти прашања",
                "Високи трошоци за call center",
                "Нема увид во потребите на клиентите",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-destructive mt-0.5">✕</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-accent/30 bg-accent/5 p-8">
            <div className="text-sm font-semibold text-accent mb-4 uppercase tracking-wider">Со AI Chatbot</div>
            <ul className="space-y-3">
              {[
                "Инстантни одговори, 0 секунди чекање",
                "24/7 генерирање на лидови",
                "Автоматизирани повторливи прашања",
                "До 80% помалку трошоци за поддршка",
                "Детална аналитика за секој клиент",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="text-accent mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Final push CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-muted-foreground text-lg mb-6">
            Додека вие размислувате, вашите конкуренти веќе <strong className="text-foreground">конвертираат клиенти со AI</strong>.
          </p>
          <Link to="/signup">
            <Button size="lg" className="gap-2 text-base px-10">
              Започни бесплатно — за 5 минути <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground mt-3">Без кредитна картичка • Без обврска • Бесплатен пробен период</p>
        </motion.div>
      </div>
    </section>
  );
};

export default MarketingSection;
