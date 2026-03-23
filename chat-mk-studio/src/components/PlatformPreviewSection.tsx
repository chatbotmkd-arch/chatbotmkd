import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, BarChart3, Activity, Database, Cog } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  {
    id: "playground",
    label: "Playground",
    icon: MessageSquare,
    title: "Тестирајте го вашиот агент",
    description: "Интерактивен playground за тестирање на одговорите, подесување на промптот и фино подесување на однесувањето пред објавување.",
    mockContent: (
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 shrink-0" />
          <div className="bg-muted rounded-xl rounded-tl-none p-3 text-sm text-muted-foreground max-w-[70%]">Здраво! Како можам да ви помогнам?</div>
        </div>
        <div className="flex gap-3 justify-end">
          <div className="bg-primary/10 rounded-xl rounded-tr-none p-3 text-sm text-foreground max-w-[70%]">Кои се вашите работни часови?</div>
        </div>
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 shrink-0" />
          <div className="bg-muted rounded-xl rounded-tl-none p-3 text-sm text-muted-foreground max-w-[70%]">Нашите работни часови се од понеделник до петок, 09:00 - 17:00. Но јас сум достапен 24/7!</div>
        </div>
      </div>
    ),
  },
  {
    id: "analytics",
    label: "Аналитика",
    icon: BarChart3,
    title: "Детални извештаи",
    description: "Следете го бројот на разговори, задоволството на клиентите, најчести прашања и перформанси на агентот во реално време.",
    mockContent: (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[{ label: "Разговори", value: "1,247" }, { label: "Задоволство", value: "94%" }, { label: "Решени", value: "89%" }].map((s) => (
            <div key={s.label} className="bg-muted rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="bg-muted rounded-lg p-4 h-24 flex items-end gap-1">
          {[40, 65, 45, 80, 60, 90, 70, 85, 55, 75, 95, 80].map((h, i) => (
            <div key={i} className="flex-1 bg-primary/30 rounded-t" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "activity",
    label: "Активност",
    icon: Activity,
    title: "Следење во живо",
    description: "Гледајте ги активните разговори во реално време, интервенирајте кога е потребно и прегледајте го целосниот историјат.",
    mockContent: (
      <div className="space-y-3">
        {[
          { user: "Клиент #142", msg: "Прашање за испорака", time: "2 мин", status: "active" },
          { user: "Клиент #139", msg: "Поврат на производ", time: "15 мин", status: "resolved" },
          { user: "Клиент #141", msg: "Статус на нарачка", time: "8 мин", status: "resolved" },
        ].map((item) => (
          <div key={item.user} className="flex items-center gap-3 bg-muted rounded-lg p-3">
            <div className={cn("w-2 h-2 rounded-full shrink-0", item.status === "active" ? "bg-green-500" : "bg-muted-foreground/30")} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">{item.user}</div>
              <div className="text-xs text-muted-foreground truncate">{item.msg}</div>
            </div>
            <span className="text-xs text-muted-foreground shrink-0">{item.time}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "sources",
    label: "Извори",
    icon: Database,
    title: "Управување со извори",
    description: "Додадете документи, поврзете веб-страни, внесете FAQ или текст за да ја изградите базата на знаење на вашиот агент.",
    mockContent: (
      <div className="space-y-3">
        {[
          { name: "FAQ.pdf", type: "Документ", size: "245 KB", chunks: 34 },
          { name: "chatbotmk.com", type: "Веб-страна", size: "12 стр.", chunks: 48 },
          { name: "Ценовник 2025", type: "Текст", size: "1.2 KB", chunks: 8 },
        ].map((item) => (
          <div key={item.name} className="flex items-center gap-3 bg-muted rounded-lg p-3">
            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
              <Database className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">{item.name}</div>
              <div className="text-xs text-muted-foreground">{item.type} · {item.size}</div>
            </div>
            <span className="text-xs text-muted-foreground bg-background rounded px-2 py-0.5">{item.chunks} chunks</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "actions",
    label: "Акции",
    icon: Cog,
    title: "Конфигурација на акции",
    description: "Дефинирајте акции кои вашиот агент може да ги извршува: закажување термини, проверка на статус, испраќање нотификации.",
    mockContent: (
      <div className="space-y-3">
        {[
          { name: "Закажи термин", trigger: "Кога клиентот бара термин", active: true },
          { name: "Провери статус на нарачка", trigger: "Кога клиентот прашува за нарачка", active: true },
          { name: "Ескалирај до агент", trigger: "Кога ботот не може да помогне", active: false },
        ].map((item) => (
          <div key={item.name} className="flex items-center gap-3 bg-muted rounded-lg p-3">
            <div className={cn("w-2 h-2 rounded-full shrink-0", item.active ? "bg-green-500" : "bg-muted-foreground/30")} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">{item.name}</div>
              <div className="text-xs text-muted-foreground truncate">{item.trigger}</div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
];

const PlatformPreviewSection = () => {
  const [activeTab, setActiveTab] = useState("playground");
  const active = tabs.find((t) => t.id === activeTab)!;

  return (
    <section className="py-24">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">Платформа</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
            Сè на едно место
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Моќен dashboard за управување, тестирање и оптимизирање на вашиот AI агент.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-card rounded-2xl border border-border/60 overflow-hidden shadow-lg"
            >
              <div className="p-8 md:p-10">
                <div className="grid md:grid-cols-2 gap-8 items-start">
                  <div>
                    <h3 className="font-display font-bold text-xl text-foreground mb-3">{active.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{active.description}</p>
                  </div>
                  <div className="bg-background rounded-xl border border-border p-4">
                    {active.mockContent}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default PlatformPreviewSection;
