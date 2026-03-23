import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const testimonials = [
  {
    quote: "ChatBot MK ни помогна да го намалиме времето за одговор на клиентите од 4 часа на под 30 секунди. Нашите клиенти се воодушевени!",
    author: "Марија Стојановска",
    role: "Директор на маркетинг",
    company: "DigiShop МК",
  },
  {
    quote: "Интеграцијата беше неверојатно лесна. За помалку од еден час имавме функционален AI chatbot на нашата веб-страна.",
    author: "Стефан Димитров",
    role: "CTO",
    company: "TechBridge Solutions",
  },
  {
    quote: "Од кога го воведовме ChatBot MK, нашиот тим за поддршка заштедува 20+ часа неделно на повторливи прашања.",
    author: "Ана Петровска",
    role: "Менаџер за корисничка поддршка",
    company: "MK Commerce",
  },
  {
    quote: "Способноста да разбира македонски јазик е она што го издвојува од другите решенија. Конечно AI кој работи за нашиот пазар.",
    author: "Дејан Трајковски",
    role: "Основач",
    company: "StartUp Hub Скопје",
  },
];

const TestimonialsSection = () => {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c === 0 ? testimonials.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === testimonials.length - 1 ? 0 : c + 1));

  return (
    <section className="py-24 section-muted">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">Искуства</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
            Што велат нашите клиенти
          </h2>
        </div>

        <div className="max-w-3xl mx-auto relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="bg-card rounded-2xl border border-border/60 p-10 md:p-12 text-center"
            >
              <Quote className="w-10 h-10 text-primary/20 mx-auto mb-6" />
              <p className="text-lg md:text-xl text-foreground leading-relaxed mb-8 font-display">
                "{testimonials[current].quote}"
              </p>
              <div>
                <p className="font-display font-semibold text-foreground">{testimonials[current].author}</p>
                <p className="text-sm text-muted-foreground">
                  {testimonials[current].role}, {testimonials[current].company}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${i === current ? "bg-primary" : "bg-border"}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-10 h-10 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
