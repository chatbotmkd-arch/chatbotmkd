import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/lib/language";
import { useSearchParams } from "react-router-dom";

const en = {
  title: "Data Deletion Request",
  withCode: (code: string) =>
    `Your data deletion request has been received. Your confirmation code is:`,
  noCode: "To request deletion of your data, please contact us at the email below.",
  status: "Your data will be permanently deleted within 30 days of the request.",
  howTo: "How to Request Data Deletion",
  steps: [
    "Log in to your NexaAI account and delete your chatbot data from the dashboard, or",
    "Send an email to info@nexa.mk with the subject \"Data Deletion Request\" and include your account email address.",
  ],
  contact: "Contact",
  company: "THY BUSINESS GUIDE DOOEL Skopje",
  address: "Bul. Partizanski odred no. 102/2-14, Skopje, Republic of North Macedonia",
  dpo: "Data Protection Officer: Martin Boshkoski",
  email: "info@nexa.mk",
};

const mk = {
  title: "Барање за бришење на податоци",
  withCode: (_code: string) =>
    `Вашето барање за бришење на податоци е примено. Вашиот код за потврда е:`,
  noCode: "За барање за бришење на вашите податоци, контактирајте не на емаилот подолу.",
  status: "Вашите податоци ќе бидат трајно избришани во рок од 30 дена од барањето.",
  howTo: "Како да побарате бришење на податоци",
  steps: [
    "Најавете се на вашата NexaAI сметка и избришете ги податоците од контролната табла, или",
    'Испратете емаил на info@nexa.mk со наслов „Барање за бришење на податоци" и вклучете ја вашата емаил адреса.',
  ],
  contact: "Контакт",
  company: "Друштво за услуги ТХУ БУЗИНЕСС ГУИДЕ ДООЕЛ Скопје",
  address: "Бул. Партизански одреди бр. 102/2-14, Скопје, Република Северна Македонија",
  dpo: "Офицер за заштита на лични податоци: Мартин Бошкоски",
  email: "info@nexa.mk",
};

const content = { en, mk };

export default function DeletionStatus() {
  const { lang } = useLanguage();
  const c = content[lang];
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28 pb-20">
        <div className="container max-w-3xl">
          <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-6">
            {c.title}
          </h1>

          {code ? (
            <div className="space-y-4 mb-10">
              <p className="text-muted-foreground text-sm leading-relaxed">
                {c.withCode(code)}
              </p>
              <div className="bg-muted rounded-lg px-4 py-3 font-mono text-sm text-foreground">
                {code}
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {c.status}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm leading-relaxed mb-10">
              {c.noCode}
            </p>
          )}

          <div className="space-y-8">
            <div>
              <h2 className="font-display font-semibold text-xl text-foreground mb-3">
                {c.howTo}
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground text-sm leading-relaxed">
                {c.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>

            <div>
              <h2 className="font-display font-semibold text-xl text-foreground mb-3">
                {c.contact}
              </h2>
              <div className="text-muted-foreground text-sm leading-relaxed space-y-1">
                <p><strong>{c.company}</strong></p>
                <p>{c.address}</p>
                <p>{c.dpo}</p>
                <p>Email: {c.email}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
