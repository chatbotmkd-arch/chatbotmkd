import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/lib/language";

const en = {
  title: "Privacy Policy",
  lastUpdated: "Last updated: March 29, 2026",
  sections: [
    {
      heading: "1. Introduction",
      body: "ChatbotMKD (\"we\", \"our\", \"us\") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our chatbot platform and services.",
    },
    {
      heading: "2. Information We Collect",
      body: `We collect the following types of information:

• **Account Information**: Name, email address, and password when you register.
• **Business Data**: Information you provide to train your chatbot, including FAQs, documents, and website content.
• **Conversation Data**: Messages exchanged between your chatbot and your customers through Messenger or your website widget.
• **Facebook Page Data**: When you connect your Facebook Page, we access your Page name and respond to incoming Messenger conversations using the pages_messaging permission. We do not access your personal Facebook profile, friends list, or any other personal data.
• **Usage Data**: Analytics about chatbot performance, message counts, and feature usage.`,
    },
    {
      heading: "3. How We Use Your Information",
      body: `Your information is used solely to provide chatbot functionality:

• To create and operate your AI chatbot
• To respond to incoming customer messages on your connected Facebook Page via Messenger
• To generate analytics about chatbot performance
• To improve our service and provide customer support

We do NOT use your data for advertising, profiling, or any purpose unrelated to providing our chatbot service.`,
    },
    {
      heading: "4. Facebook Data Usage",
      body: `When you connect your Facebook Page to ChatbotMKD:

• We only access incoming messages sent by customers to your Page
• We respond to these messages through the Messenger API on your behalf
• We never send unsolicited messages to any Facebook users
• We never access your personal Facebook profile or friends list
• We do not sell, share, or transfer Facebook data to any third parties
• You can disconnect your Facebook Page at any time from your dashboard`,
    },
    {
      heading: "5. Data Storage and Security",
      body: `• All data is encrypted using AES-256 at rest and TLS 1.3 in transit
• Data is stored on secure servers with restricted access
• We implement industry-standard security measures to protect your information
• Access to data is restricted to authorized personnel only`,
    },
    {
      heading: "6. Data Retention and Deletion",
      body: `• Your data is retained for as long as your account is active
• You can delete your chatbot data at any time from your dashboard
• Upon account deletion, all associated data is permanently removed within 30 days
• You can request deletion of your data by contacting us at contact@chatbotmkd.mk`,
    },
    {
      heading: "7. Third-Party Services",
      body: `We use the following third-party services to provide our platform:

• **AI Language Models** (OpenAI): To generate chatbot responses. Conversation data is processed but not stored by these providers for training purposes.
• **Cloud Hosting**: To securely host our application and database.
• **Meta Platform** (Facebook): To send and receive Messenger messages on your connected Facebook Page.

We do not sell or share your data with any other third parties.`,
    },
    {
      heading: "8. Your Rights (GDPR)",
      body: `Under the General Data Protection Regulation (GDPR), you have the right to:

• **Access**: Request a copy of your personal data
• **Rectification**: Correct any inaccurate data
• **Erasure**: Request deletion of your data
• **Portability**: Receive your data in a portable format
• **Restriction**: Restrict processing of your data
• **Objection**: Object to processing of your data

To exercise any of these rights, contact us at contact@chatbotmkd.mk.`,
    },
    {
      heading: "9. Contact Information",
      body: `If you have any questions about this Privacy Policy, please contact us:

• **Email**: contact@chatbotmkd.mk`,
    },
  ],
};

const mk = {
  title: "Политика на приватност",
  lastUpdated: "Последно ажурирање: 29 Март, 2026",
  sections: [
    {
      heading: "1. Вовед",
      body: "ChatbotMKD (\"ние\", \"нашиот\") е посветен на заштитата на вашата приватност. Оваа Политика на приватност објаснува како ги собираме, користиме и штитиме вашите информации.",
    },
    {
      heading: "2. Информации кои ги собираме",
      body: `Собираме следниве видови информации:

• **Информации за сметка**: Име, email адреса и лозинка при регистрација.
• **Бизнис податоци**: Информации кои ги давате за тренирање на chatbot-от, вклучувајќи FAQ, документи и содржина од веб-страна.
• **Податоци од разговори**: Пораки разменети помеѓу вашиот chatbot и клиентите преку Messenger или веб widget.
• **Facebook Page податоци**: Кога ја поврзувате вашата Facebook страница, пристапуваме до името на страницата и одговараме на дојдовни Messenger разговори. Не пристапуваме до вашиот личен Facebook профил.
• **Податоци за користење**: Аналитика за перформансите на chatbot-от.`,
    },
    {
      heading: "3. Како ги користиме вашите информации",
      body: `Вашите информации се користат исклучиво за chatbot функционалност:

• За креирање и работа на вашиот AI chatbot
• За одговарање на дојдовни пораки на вашата Facebook страница преку Messenger
• За генерирање аналитика
• За подобрување на нашата услуга

НЕ ги користиме вашите податоци за рекламирање или профилирање.`,
    },
    {
      heading: "4. Користење на Facebook податоци",
      body: `Кога ја поврзувате вашата Facebook страница со ChatbotMKD:

• Пристапуваме само до дојдовни пораки испратени од клиенти
• Одговараме на овие пораки преку Messenger API во ваше име
• Никогаш не испраќаме несакани пораки
• Никогаш не пристапуваме до вашиот личен Facebook профил
• Не ги продаваме, споделуваме или трансферираме Facebook податоци
• Можете да ја исклучите вашата Facebook страница во секое време`,
    },
    {
      heading: "5. Складирање и безбедност на податоци",
      body: `• Сите податоци се енкриптирани со AES-256 и TLS 1.3
• Податоците се складирани на безбедни сервери
• Пристапот до податоци е ограничен само на овластен персонал`,
    },
    {
      heading: "6. Задржување и бришење на податоци",
      body: `• Вашите податоци се задржуваат додека вашата сметка е активна
• Можете да ги избришете вашите chatbot податоци во секое време
• По бришење на сметката, сите податоци се трајно отстранети во рок од 30 дена
• Контактирајте не на contact@chatbotmkd.mk за бришење на податоци`,
    },
    {
      heading: "7. Трети страни",
      body: `Користиме следниве услуги од трети страни:

• **AI јазични модели** (OpenAI): За генерирање chatbot одговори.
• **Cloud Hosting**: За безбедно хостирање на апликацијата.
• **Meta платформа** (Facebook): За испраќање и примање Messenger пораки.

Не ги продаваме ниту споделуваме вашите податоци со други трети страни.`,
    },
    {
      heading: "8. Ваши права (GDPR)",
      body: `Според GDPR, имате право на:

• **Пристап**: Побарајте копија од вашите лични податоци
• **Исправка**: Корегирајте неточни податоци
• **Бришење**: Побарајте бришење на вашите податоци
• **Преносливост**: Примете ги вашите податоци во преносен формат
• **Ограничување**: Ограничете ја обработката на вашите податоци

Контактирајте не на contact@chatbotmkd.mk за остварување на овие права.`,
    },
    {
      heading: "9. Контакт информации",
      body: `Доколку имате прашања за оваа Политика на приватност:

• **Email**: contact@chatbotmkd.mk`,
    },
  ],
};

const content = { en, mk };

export default function PrivacyPolicy() {
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
