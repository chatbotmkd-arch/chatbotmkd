import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLanguage } from "@/lib/language";

const faqs = {
  en: [
    { q: "Which channels does NexaAI support?", a: "NexaAI works on three channels: Facebook Messenger, Instagram DMs, and your website via an embeddable chat widget. One chatbot serves all three — train once, deploy everywhere." },
    { q: "How does the Facebook & Instagram integration work?", a: "After creating your chatbot, you connect your Facebook Page and Instagram account with one click. When a customer sends a message on Messenger or Instagram DMs, NexaAI receives it and responds automatically with answers based on your business data. The chatbot only responds to incoming messages — it never sends unsolicited messages." },
    { q: "How do I add the chatbot to my website?", a: "Just copy a small embed snippet from your dashboard and paste it into your website's HTML. The chat widget appears in the corner of your site, ready to answer customer questions instantly." },
    { q: "What permissions does NexaAI need?", a: "NexaAI requests pages_messaging and instagram_manage_messages permissions, which allow it to read and respond to incoming conversations on your connected Facebook Page and Instagram account. These are used solely to deliver chatbot replies." },
    { q: "Is my business data safe?", a: "Yes. All data is encrypted with AES-256 at rest and TLS 1.3 in transit. We are fully GDPR compliant. Your data is never sold or shared with third parties and is used only to power your chatbot." },
    { q: "Can I disconnect my channels at any time?", a: "Absolutely. You have full control. You can disconnect your Facebook Page, Instagram account, or remove the website widget at any time from your dashboard, and the chatbot will immediately stop responding on that channel." },
    { q: "How long does setup take?", a: "Most users are up and running in under 10 minutes. You answer a few questions about your business, upload your data (FAQs, documents, or a website URL), and connect your channels." },
    { q: "What happens when the chatbot can't answer a question?", a: "You can configure the chatbot to either acknowledge that it doesn't know the answer, provide your contact information for follow-up, or attempt to help with the closest available information. You define the rules." },
    { q: "Does the chatbot support Macedonian?", a: "Yes! NexaAI is built for the Macedonian market and supports Macedonian, English, Albanian, and many other languages natively." },
  ],
  mk: [
    { q: "Кои канали ги поддржува NexaAI?", a: "NexaAI работи на три канали: Facebook Messenger, Instagram DMs и вашата веб-страна преку chat widget. Еден chatbot ги опслужува сите три — тренирајте еднаш, поврзете насекаде." },
    { q: "Како функционира Facebook и Instagram интеграцијата?", a: "Откако ќе го креирате вашиот chatbot, ги поврзувате вашата Facebook страница и Instagram профил со еден клик. Кога клиент испрати порака на Messenger или Instagram DM, NexaAI ја прима и автоматски одговара со одговори базирани на вашите податоци. Chatbot-от одговара само на дојдовни пораки — никогаш не испраќа несакани пораки." },
    { q: "Како да го додадам chatbot-от на мојата веб-страна?", a: "Копирајте мал код од вашиот dashboard и залепете го во HTML на вашата веб-страна. Chat widget-от се појавува во аголот на сајтот, подготвен да одговара на прашања." },
    { q: "Какви дозволи бара NexaAI?", a: "NexaAI бара pages_messaging и instagram_manage_messages дозволи, кои овозможуваат читање и одговарање на дојдовни разговори на вашата Facebook страница и Instagram профил. Овие се користат исклучиво за chatbot одговори." },
    { q: "Дали моите податоци се безбедни?", a: "Да. Сите податоци се енкриптирани со AES-256 и TLS 1.3. Целосно сме усогласени со GDPR. Вашите податоци никогаш не се продаваат или споделуваат со трети страни." },
    { q: "Може ли да ги исклучам каналите во секое време?", a: "Апсолутно. Имате целосна контрола. Можете да ги исклучите Facebook страницата, Instagram профилот или да го отстраните widget-от од веб-страната во секое време од вашиот dashboard." },
    { q: "Колку време трае поставувањето?", a: "Повеќето корисници се подготвени за помалку од 10 минути. Одговарате на неколку прашања, поставувате податоци и ги поврзувате вашите канали." },
    { q: "Што се случува кога chatbot-от не знае одговор?", a: "Можете да го конфигурирате да признае дека не знае, да даде контакт информации или да се обиде да помогне со најблиските информации. Вие ги дефинирате правилата." },
    { q: "Дали chatbot-от поддржува македонски јазик?", a: "Да! NexaAI е направен за македонскиот пазар и поддржува македонски, англиски, албански и многу други јазици." },
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
