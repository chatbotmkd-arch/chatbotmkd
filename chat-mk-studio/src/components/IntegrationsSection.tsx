import { motion } from "framer-motion";

const integrations = [
  { name: "Веб-страна", color: "#6366f1" },
  { name: "Facebook", color: "#1877f2" },
  { name: "Instagram", color: "#e4405f" },
  { name: "WordPress", color: "#21759b" },
  { name: "WooCommerce", color: "#96588a" },
  { name: "Shopify", color: "#7ab55c" },
];

const IntegrationsSection = () => {
  return (
    <section className="py-24 section-muted">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">Интеграции</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
            Поврзете се со алатките кои ги користите
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Интегрирајте го вашиот AI chatbot со популарни платформи и сервиси.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-2xl mx-auto"
        >
          {integrations.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="bg-card rounded-xl border border-border/60 p-6 flex flex-col items-center gap-3 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-display font-bold text-lg"
                style={{ backgroundColor: item.color }}
              >
                {item.name[0]}
              </div>
              <span className="text-sm font-medium text-foreground">{item.name}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default IntegrationsSection;
