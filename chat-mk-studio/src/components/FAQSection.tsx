import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLanguage } from "@/lib/language";

const faqs = {
  en: [
    { q: "How does the Facebook Messenger integration work?", a: "After creating your chatbot, you connect your Facebook Page with one click. When a customer sends a message to your Page, ChatbotMKD receives it via the Messenger API and responds automatically with answers based on your business data. The chatbot only responds to incoming messages — it never sends unsolicited messages." },
    { q: "What Facebook permissions does ChatbotMKD need?", a: "ChatbotMKD requests the pages_messaging permission, which allows it to read and respond to incoming Messenger conversations on your connected Facebook Page. This is the only permission needed and is used solely to deliver chatbot replies." },
    { q: "Is my business data safe?", a: "Yes. All data is encrypted with AES-256 at rest and TLS 1.3 in transit. We are fully GDPR compliant. Your data is never sold or shared with third parties and is used only to power your chatbot." },
    { q: "Can I disconnect my Facebook Page at any time?", a: "Absolutely. You have full control over the connection. You can disconnect your Facebook Page from ChatbotMKD at any time from your dashboard, and the chatbot will immediately stop responding to messages." },
    { q: "How long does setup take?", a: "Most users are up and running in under 10 minutes. You answer a few questions about your business, upload your data (FAQs, documents, or a website URL), and connect your Facebook Page." },
    { q: "What happens when the chatbot can't answer a question?", a: "You can configure the chatbot to either acknowledge that it doesn't know the answer, provide your contact information for follow-up, or attempt to help with the closest available information. You define the rules." },
    { q: "Does the chatbot support Macedonian?", a: "Yes! ChatbotMKD is built for the Macedonian market and supports Macedonian, English, Albanian, and many other languages natively." },
  ],
  mk: [
    { q: "Како функционира Facebook Messenger интеграцијата?", a: "Откако ќе го креирате вашиот chatbot, го поврзувате со вашата Facebook страница со еден клик. Кога клиент ќе испрати порака, ChatbotMKD ја прима преку Messenger API и автоматски одговара со одговори базирани на вашите податоци. Chatbot-от одговара само на дојдовни пораки — никогаш не испраќа несакани пораки." },
    { q: "Какви Facebook дозволи бара ChatbotMKD?", a: "ChatbotMKD бара дозвола pages_messaging, која овозможува читање и одговарање на дојдовни Messenger разговори на вашата поврзана Facebook страница. Тоа е единствената потребна дозвола." },
    { q: "Дали моите податоци се безбедни?", a: "Да. Сите податоци се енкриптирани со AES-256 и TLS 1.3. Целосно сме усогласени со GDPR. Вашите податоци никогаш не се продаваат или споделуваат со трети страни." },
    { q: "Може ли да ја исклучам мојата Facebook страница во секое време?", a: "Апсолутно. Имате целосна контрола. Можете да ја исклучите вашата Facebook страница од ChatbotMKD во секое време од вашиот dashboard." },
    { q: "Колку време трае поставувањето?", a: "Повеќето корисници се подготвени за помалку од 10 минути. Одговарате на неколку прашања, поставувате податоци и ја поврзувате вашата Facebook страница." },
    { q: "Што се случува кога chatbot-от не знае одговор?", a: "Можете да го конфигурирате да признае дека не знае, да даде контакт информации или да се обиде да помогне со најблиските информации. Вие ги дефинирате правилата." },
    { q: "Дали chatbot-от поддржува македонски јазик?", a: "Да! ChatbotMKD е направен за македонскиот пазар и поддржува македонски, англиски, албански и многу други јазици." },
  ],
};

const labels = {
  en: { label: "FAQ", title: "Frequently asked questions" },
  mk: { label: "ЧПП", title: "Често поставувани прашања" },
};

const FAQSection = () => {
  const { lang } = useLanguage();
  const c = labels[lang];
  const f = faqs[lang];

  return (
    <section id="faq" className="py-24">
      <div className="container max-w-3xl">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">{c.label}</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">{c.title}</h2>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {f.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="bg-muted rounded-xl border-none px-6">
              <AccordionTrigger className="text-left font-display font-semibold text-foreground hover:no-underline">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
