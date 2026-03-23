import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Дали AI ботот навистина разбира македонски?",
    a: "Да! Нашиот AI користи најновите јазични модели кои поддржуваат македонски јазик, и може природно да води разговори на македонски.",
  },
  {
    q: "Колку е тешко да се постави chatbot-от?",
    a: "Многу лесно. Одговорете на неколку прашања за вашиот бизнис, додадете ги вашите податоци и ботот е готов за 5 минути. Интеграцијата е со copy-paste на еден код.",
  },
  {
    q: "На кои платформи работи?",
    a: "На вашата веб-страна (WordPress, Shopify, или било која), на Facebook Pages и на Instagram. Со еден бот покривате три канали.",
  },
  {
    q: "Може ли да го прилагодам изгледот и тонот?",
    a: "Да, целосно. Можете да ги менувате боите, поздравот, тонот на одговорите и однесувањето за да одговара на вашиот бренд.",
  },
  {
    q: "Што се случува кога ботот не знае одговор?",
    a: "Ботот може автоматски да го пренасочи разговорот кон вас преку email или да остави контакт информации. Вие ги дефинирате правилата.",
  },
  {
    q: "Каде се чуваат моите податоци?",
    a: "Сите податоци се заштитени со енкрипција. Усогласени сме со GDPR стандардите за заштита на лични податоци.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-24">
      <div className="container max-w-3xl">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">ЧПП</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
            Често поставувани прашања
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="bg-muted rounded-xl border-none px-6"
            >
              <AccordionTrigger className="text-left font-display font-semibold text-foreground hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
