import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import heroChatbot from "@/assets/hero-chatbot.png";

const HeroSection = () => {
  return (
    <section className="pt-32 pb-20 overflow-hidden">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl leading-tight tracking-tight text-foreground">
              Направете сопствен{" "}
              <span className="text-gradient">AI асистент</span>{" "}
              за вашиот бизнис
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-lg leading-relaxed">
              За неколку клика добивате AI chatbot на вашата веб-страна,
              Facebook или Instagram — на македонски јазик, 24/7.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link to="/signup">
                <Button size="lg" className="gap-2 text-base px-8 shadow-lg shadow-primary/20">
                  Започни бесплатно <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Без кредитна картичка. Готов за 5 минути.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-foreground/8 border border-border/60">
              <img
                src={heroChatbot}
                alt="AI Chatbot демо"
                className="w-full h-auto"
                loading="eager"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
