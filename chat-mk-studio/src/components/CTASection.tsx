import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const CTASection = () => {
  return (
    <section className="py-24 section-muted">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl bg-foreground text-background overflow-hidden p-12 md:p-20 text-center shadow-2xl"
        >
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
            Подготвени сте да го трансформирате вашиот бизнис?
          </h2>
          <p className="text-background/70 text-lg max-w-xl mx-auto mb-8">
            Креирајте го вашиот AI асистент денес и почнете да заштедувате време и пари.
            Вашите конкуренти веќе го направија тоа.
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary" className="gap-2 bg-background text-foreground hover:bg-background/90 text-base px-8">
              Започни бесплатно <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
