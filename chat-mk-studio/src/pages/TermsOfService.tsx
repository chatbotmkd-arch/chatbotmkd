import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/lib/language";

const en = {
  title: "Terms of Service",
  lastUpdated: "Last updated: March 29, 2026",
  sections: [
    {
      heading: "1. Service Description",
      body: "ChatbotMKD is a software-as-a-service (SaaS) platform that allows businesses to create, train, and deploy AI-powered chatbots. These chatbots can be integrated into websites and connected to Facebook Pages to automatically respond to customer messages via Messenger.",
    },
    {
      heading: "2. Account Registration",
      body: `By creating an account, you agree that:

• You are at least 18 years old
• The information you provide is accurate and complete
• You are responsible for maintaining the security of your account credentials
• You will not share your account with unauthorized parties`,
    },
    {
      heading: "3. Acceptable Use",
      body: `You agree to use ChatbotMKD only for lawful purposes. You may NOT:

• Use the chatbot to send spam or unsolicited messages
• Create chatbots that impersonate individuals or organizations
• Use the service to harass, deceive, or defraud users
• Violate Meta's Platform Policies or any applicable laws
• Upload malicious content or attempt to compromise our systems
• Use the service to collect personal data without proper consent`,
    },
    {
      heading: "4. Facebook Integration",
      body: `When connecting your Facebook Page to ChatbotMKD:

• You must be an administrator of the Facebook Page you connect
• You are responsible for ensuring your chatbot complies with Meta's Platform Policies
• The chatbot will only respond to messages initiated by users on your Page
• You can disconnect your Page at any time from your dashboard
• ChatbotMKD is not affiliated with or endorsed by Meta/Facebook`,
    },
    {
      heading: "5. Data and Content",
      body: `• You retain ownership of all data and content you upload to train your chatbot
• You grant ChatbotMKD a limited license to use your content solely to provide the chatbot service
• You are responsible for ensuring you have the right to use any content you upload
• ChatbotMKD does not claim ownership of your content`,
    },
    {
      heading: "6. Service Availability",
      body: `• We strive to provide 99.9% uptime but do not guarantee uninterrupted service
• We may perform maintenance that temporarily affects availability
• We reserve the right to modify or discontinue features with reasonable notice`,
    },
    {
      heading: "7. Payment and Billing",
      body: `• Free plan users receive a limited trial period with message credits
• Paid plans are billed monthly or annually as selected
• Payments are processed via bank transfer (pro-forma invoice)
• Plan changes take effect upon payment confirmation`,
    },
    {
      heading: "8. Limitation of Liability",
      body: `• ChatbotMKD is provided "as is" without warranties of any kind
• We are not liable for any indirect, incidental, or consequential damages
• Our total liability is limited to the amount you paid for the service in the last 12 months
• We are not responsible for the accuracy of AI-generated chatbot responses`,
    },
    {
      heading: "9. Termination",
      body: `• You can cancel your account at any time
• We may terminate accounts that violate these terms
• Upon termination, your data will be deleted within 30 days
• Any outstanding payments remain due upon termination`,
    },
    {
      heading: "10. Changes to Terms",
      body: "We may update these Terms of Service from time to time. We will notify you of significant changes via email or through our platform. Continued use of the service after changes constitutes acceptance of the new terms.",
    },
    {
      heading: "11. Contact",
      body: `For questions about these Terms of Service:

• **Email**: contact@chatbotmkd.mk`,
    },
  ],
};

const mk = {
  title: "Услови за користење",
  lastUpdated: "Последно ажурирање: 29 Март, 2026",
  sections: [
    {
      heading: "1. Опис на услугата",
      body: "ChatbotMKD е софтверска платформа (SaaS) која им овозможува на бизнисите да креираат, тренираат и поставуваат AI chatbot-и. Овие chatbot-и може да се интегрираат на веб-страници и да се поврзат со Facebook страници за автоматско одговарање на пораки преку Messenger.",
    },
    {
      heading: "2. Регистрација на сметка",
      body: `Со креирање на сметка, се согласувате дека:

• Имате најмалку 18 години
• Информациите кои ги давате се точни и комплетни
• Одговорни сте за безбедноста на вашите податоци за најава
• Нема да ја споделувате вашата сметка со неовластени лица`,
    },
    {
      heading: "3. Прифатлива употреба",
      body: `Се согласувате да го користите ChatbotMKD само за законски цели. НЕ смеете:

• Да го користите chatbot-от за испраќање спам
• Да креирате chatbot-и кои се претставуваат како други лица
• Да ја користите услугата за малтретирање или измама
• Да ги прекршите политиките на Meta или важечките закони
• Да поставувате малициозна содржина`,
    },
    {
      heading: "4. Facebook интеграција",
      body: `Кога ја поврзувате вашата Facebook страница:

• Мора да сте администратор на страницата која ја поврзувате
• Одговорни сте за усогласеност со политиките на Meta
• Chatbot-от одговара само на пораки иницирани од корисници
• Можете да ја исклучите вашата страница во секое време
• ChatbotMKD не е поврзан со Meta/Facebook`,
    },
    {
      heading: "5. Податоци и содржина",
      body: `• Вие го задржувате сопственоста над сите податоци кои ги поставувате
• На ChatbotMKD му давате лиценца за користење на содржината само за chatbot услугата
• Одговорни сте дека имате право да ја користите содржината која ја поставувате`,
    },
    {
      heading: "6. Достапност на услугата",
      body: `• Се стремиме кон 99.9% достапност но не гарантираме непрекината услуга
• Можеме да вршиме одржување кое привремено влијае на достапноста`,
    },
    {
      heading: "7. Плаќање и фактурирање",
      body: `• Бесплатните корисници добиваат ограничен пробен период со кредити
• Платените планови се фактурираат месечно или годишно
• Плаќањата се процесираат преку банкарски трансфер
• Промените на план важат по потврда на уплата`,
    },
    {
      heading: "8. Ограничување на одговорност",
      body: `• ChatbotMKD е обезбеден \"како што е\" без гаранции
• Не сме одговорни за индиректни или последични штети
• Нашата вкупна одговорност е ограничена на износот кој го плативте во последните 12 месеци`,
    },
    {
      heading: "9. Прекинување",
      body: `• Можете да ја откажете вашата сметка во секое време
• Можеме да прекинеме сметки кои ги прекршуваат овие услови
• По прекинување, вашите податоци ќе бидат избришани во рок од 30 дена`,
    },
    {
      heading: "10. Промени на условите",
      body: "Можеме да ги ажурираме овие Услови за користење. Ќе ве известиме за значајни промени преку email. Продолженото користење на услугата по промените претставува прифаќање на новите услови.",
    },
    {
      heading: "11. Контакт",
      body: `За прашања за овие Услови за користење:

• **Email**: contact@chatbotmkd.mk`,
    },
  ],
};

const content = { en, mk };

export default function TermsOfService() {
  const { lang } = useLanguage();
  const c = content[lang];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28 pb-20">
        <div className="container max-w-3xl">
          <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-2">{c.title}</h1>
          <p className="text-sm text-muted-foreground mb-10">{c.lastUpdated}</p>

          <div className="space-y-8">
            {c.sections.map((section) => (
              <div key={section.heading}>
                <h2 className="font-display font-semibold text-xl text-foreground mb-3">{section.heading}</h2>
                <div className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">{section.body}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
