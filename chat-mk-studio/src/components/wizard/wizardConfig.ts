import { WizardQuestion, WizardAnswers, WizardGroup } from "./types";

function q(question: WizardQuestion["question"], answers: WizardAnswers): string {
  return typeof question === "function" ? question(answers) : question;
}

function ph(placeholder: WizardQuestion["placeholder"], answers: WizardAnswers): string {
  if (!placeholder) return "";
  return typeof placeholder === "function" ? placeholder(answers) : placeholder;
}

export { q, ph };

// No longer needed — kept as empty arrays for backward compat
export const INDUSTRY_QUESTION_IDS: string[] = [];
export const PURPOSE_QUESTION_IDS: string[] = [];

export function getWizardQuestions(lang: "en" | "mk"): WizardQuestion[] {
  const isEn = lang === "en";

  return [
    // ══════════════════════════════════════════════════════════════
    // STEP 1: About your business
    // ══════════════════════════════════════════════════════════════
    {
      id: "industry",
      group: isEn ? "About your business" : "За вашиот бизнис",
      question: isEn ? "What industry is your business in?" : "Во која индустрија е вашиот бизнис?",
      type: "radio",
      options: [
        { value: "retail", label: isEn ? "Retail / E-commerce" : "Малопродажба / Е-трговија", description: isEn ? "Online or physical store" : "Онлајн или физичка продавница" },
        { value: "hospitality", label: isEn ? "Hospitality / Hotels" : "Угостителство / Хотелиерство", description: isEn ? "Hotels, apartments, tourism" : "Хотели, апартмани, туризам" },
        { value: "healthcare", label: isEn ? "Healthcare / Medicine" : "Здравство / Медицина", description: isEn ? "Clinics, offices, pharmacies" : "Клиники, ординации, аптеки" },
        { value: "education", label: isEn ? "Education" : "Образование", description: isEn ? "Courses, schools, universities" : "Курсеви, школи, универзитети" },
        { value: "realestate", label: isEn ? "Real Estate" : "Недвижности", description: isEn ? "Agencies, construction" : "Агенции, градежништво" },
        { value: "finance", label: isEn ? "Finance / Insurance" : "Финансии / Осигурување", description: isEn ? "Banks, insurance companies" : "Банки, осигурителни компании" },
        { value: "beauty", label: isEn ? "Beauty / Cosmetics" : "Убавина / Козметика", description: isEn ? "Salons, hair, spa" : "Салони, фризерски, спа" },
        { value: "automotive", label: isEn ? "Automotive" : "Автоиндустрија", description: isEn ? "Dealerships, services, parts" : "Автосалони, сервиси, делови" },
        { value: "legal", label: isEn ? "Legal Services" : "Правни услуги", description: isEn ? "Law offices, notaries" : "Адвокатски канцеларии, нотари" },
        { value: "it_services", label: isEn ? "IT / Technology" : "ИТ / Технологија", description: isEn ? "Software, web, digital services" : "Софтвер, веб, дигитални услуги" },
        { value: "food", label: isEn ? "Food / Restaurants / Delivery" : "Храна / Ресторани / Достава", description: isEn ? "Restaurants, cafes, delivery" : "Ресторани, кафулиња, достава" },
        { value: "other", label: isEn ? "Other" : "Друго", description: isEn ? "My industry is not listed" : "Не е наведена мојата дејност" },
      ],
      required: true,
    },
    {
      id: "business_name",
      group: isEn ? "About your business" : "За вашиот бизнис",
      question: isEn ? "What is your business name?" : "Како се вика вашиот бизнис?",
      type: "text",
      placeholder: isEn ? "e.g. Acme Corp" : "нпр. Мебел Дизајн ДООЕЛ",
      required: true,
    },
    {
      id: "business_description",
      group: isEn ? "About your business" : "За вашиот бизнис",
      question: (a) => {
        const ind = a.industry as string;
        if (isEn) {
          const map: Record<string, string> = {
            retail: "Describe your store in 2-3 sentences.",
            healthcare: "Describe your healthcare facility.",
            beauty: "Describe your salon/studio.",
            food: "Describe your restaurant/cafe.",
            hospitality: "Describe your property.",
            education: "Describe your educational institution.",
          };
          return map[ind] || "Describe your business in 2-3 sentences.";
        }
        const map: Record<string, string> = {
          retail: "Опишете ја вашата продавница во 2-3 реченици.",
          healthcare: "Опишете ја вашата здравствена установа.",
          beauty: "Опишете го вашиот салон/студио.",
          food: "Опишете го вашиот ресторан/кафуле.",
          hospitality: "Опишете го вашиот објект.",
          education: "Опишете ја вашата образовна институција.",
        };
        return map[ind] || "Опишете го вашиот бизнис во 2-3 реченици.";
      },
      subtitle: isEn ? "What do you offer? Who are your customers?" : "Што нудите? Кои се вашите клиенти?",
      type: "textarea",
      placeholder: (a) => {
        const ind = a.industry as string;
        if (isEn) {
          const map: Record<string, string> = {
            retail: "e.g. Online furniture store with nationwide delivery. We offer home and office furniture.",
            healthcare: "e.g. Private general practice with laboratory. Operating for 15 years.",
            beauty: "e.g. Cosmetics salon with face and body treatments. Two locations.",
            food: "e.g. Pizzeria with city-wide delivery. We offer pizzas, pasta and desserts.",
            hospitality: "e.g. 4-star hotel on the lakeside. 50 rooms and restaurant.",
          };
          return map[ind] || "e.g. We are a company that offers...";
        }
        const map: Record<string, string> = {
          retail: "нпр. Онлајн продавница за мебел со испорака низ цела Македонија. Нудиме мебел за дома и канцеларија.",
          healthcare: "нпр. Приватна ординација за општа медицина со лабораторија. Работиме 15 години во Скопје.",
          beauty: "нпр. Козметички салон со третмани за лице и тело. Два локации во Скопје.",
          food: "нпр. Пицерија со достава низ Скопје. Нудиме пици, пасти и десерти.",
          hospitality: "нпр. Хотел со 4 ѕвезди на брегот на Охридско Езеро. 50 соби и ресторан.",
        };
        return map[ind] || "нпр. Ние сме компанија која нуди...";
      },
      required: false,
    },
    {
      id: "unique_value",
      group: isEn ? "About your business" : "За вашиот бизнис",
      question: (a) => {
        const ind = a.industry as string;
        if (isEn) {
          const map: Record<string, string> = {
            retail: "What sets your store apart from others?",
            hospitality: "What makes your property special for guests?",
            healthcare: "Why do patients choose your clinic?",
            education: "What makes your school/course better than others?",
            realestate: "Why do clients choose your agency?",
            finance: "What sets you apart from other financial institutions?",
            beauty: "What makes your salon special?",
            automotive: "Why do customers come to you?",
            legal: "Why do clients choose your office?",
            it_services: "What sets you apart from other IT companies?",
            food: "What makes your restaurant/cafe unique?",
          };
          return map[ind] || "What makes your business special?";
        }
        const map: Record<string, string> = {
          retail: "Што ја издвојува вашата продавница од останатите?",
          hospitality: "Што го прави вашиот објект посебен за гостите?",
          healthcare: "Зошто пациентите ја избираат вашата ординација/клиника?",
          education: "Што го прави вашето училиште/курс подобар од другите?",
          realestate: "Зошто клиентите ја избираат вашата агенција?",
          finance: "Што ве издвојува од другите финансиски институции?",
          beauty: "Што го прави вашиот салон посебен?",
          automotive: "Зошто клиентите доаѓаат токму кај вас?",
          legal: "Зошто клиентите ја избираат вашата канцеларија?",
          it_services: "Што ве издвојува од другите ИТ компании?",
          food: "Што го прави вашиот ресторан/кафуле уникатен?",
        };
        return map[ind] || "Што го прави вашиот бизнис посебен?";
      },
      subtitle: isEn ? "Experience, quality, prices, location, unique offering..." : "Искуство, квалитет, цени, локација, уникатна понуда...",
      type: "textarea",
      placeholder: (a) => {
        const ind = a.industry as string;
        if (isEn) {
          const map: Record<string, string> = {
            retail: "e.g. We offer exclusive brands with free 24-hour delivery.",
            healthcare: "e.g. 20 years of experience, latest equipment, individual approach.",
            beauty: "e.g. Premium cosmetics, specialists with 10+ years of experience.",
            food: "e.g. Fresh local ingredients, traditional recipes from three generations.",
            legal: "e.g. 15 years of corporate law experience, over 500 successful cases.",
          };
          return map[ind] || "e.g. Our advantage is...";
        }
        const map: Record<string, string> = {
          retail: "нпр. Нудиме ексклузивни брендови со бесплатна испорака за 24 часа.",
          healthcare: "нпр. 20 години искуство, најнова опрема, индивидуален пристап.",
          beauty: "нпр. Премиум козметика, мајстори со 10+ години искуство.",
          food: "нпр. Свежи домашни состојки, традиционални рецепти од три генерации.",
          legal: "нпр. 15 години искуство во корпоративно право, над 500 успешни случаи.",
        };
        return map[ind] || "нпр. Нашата предност е...";
      },
      required: false,
    },

    // ══════════════════════════════════════════════════════════════
    // STEP 2: Contact & details
    // ══════════════════════════════════════════════════════════════
    {
      id: "phone_number",
      group: isEn ? "Contact & details" : "Контакт и детали",
      question: isEn ? "Contact phone number" : "Телефон за контакт",
      subtitle: isEn ? "The chatbot will use this to direct customers to you." : "Chatbot-от ќе го користи за да ги упати клиентите кон вас.",
      type: "text",
      placeholder: isEn ? "e.g. +389 2 3111 222 / 070 123 456" : "нпр. 02 3111 222 / 070 123 456",
      required: false,
    },
    {
      id: "location_info",
      group: isEn ? "Contact & details" : "Контакт и детали",
      question: isEn ? "Where are you located?" : "Каде се наоѓате?",
      subtitle: isEn ? "Address, city, or 'online' if you have no physical location." : "Адреса, град, или 'онлајн' ако немате физичка локација.",
      type: "text",
      placeholder: isEn ? "e.g. 123 Main St, Skopje" : "нпр. ул. Македонија 5, Скопје",
      required: false,
    },
    {
      id: "working_hours",
      group: isEn ? "Contact & details" : "Контакт и детали",
      question: isEn ? "Working hours" : "Работно време",
      type: "text",
      placeholder: isEn ? "e.g. Mon-Fri 09:00-17:00, Sat 10:00-14:00" : "нпр. Пон-Пет 09:00-17:00, Саб 10:00-14:00",
      required: false,
    },
    {
      id: "customer_trust",
      group: isEn ? "Contact & details" : "Контакт и детали",
      question: (a) => {
        const ind = a.industry as string;
        if (isEn) {
          const map: Record<string, string> = {
            healthcare: "What experience and credibility do you have?",
            legal: "What experience and specialization do you have?",
            finance: "What guarantees and licenses do you have?",
            education: "What results do your students achieve?",
            it_services: "Can you share key projects or clients?",
          };
          return map[ind] || "Why do customers trust you?";
        }
        const map: Record<string, string> = {
          healthcare: "Какво искуство и кредибилитет имате?",
          legal: "Какво искуство и специјализација имате?",
          finance: "Какви гаранции и лиценци имате?",
          education: "Какви резултати постигнуваат вашите ученици/студенти?",
          it_services: "Можете ли да споделите клучни проекти или клиенти?",
        };
        return map[ind] || "Зошто клиентите ви веруваат?";
      },
      subtitle: isEn ? "Experience, happy customers, awards, certificates..." : "Искуство, задоволни клиенти, награди, сертификати...",
      type: "textarea",
      placeholder: isEn ? "e.g. We have 10+ years of experience and over 1000 happy customers..." : "нпр. Имаме 10+ години искуство и над 1000 задоволни клиенти...",
      required: false,
    },
    {
      id: "bot_purpose",
      group: isEn ? "Contact & details" : "Контакт и детали",
      question: isEn ? "What is the main purpose of the chatbot?" : "Која е главната цел на chatbot-от?",
      type: "radio",
      options: [
        { value: "customer_support", label: isEn ? "Customer Support" : "Корисничка поддршка", description: isEn ? "Answers questions and solves problems" : "Одговара на прашања и решава проблеми" },
        { value: "sales", label: isEn ? "Sales" : "Продажба", description: isEn ? "Helps with purchases and recommends products" : "Помага при купување и препорачува производи" },
        { value: "info_faq", label: isEn ? "Info & FAQ" : "Информации и FAQ", description: isEn ? "Provides business information" : "Дава информации за бизнисот" },
        { value: "appointments", label: isEn ? "Appointments" : "Закажување термини", description: isEn ? "Helps with scheduling" : "Помага при закажување" },
        { value: "onboarding", label: "Onboarding", description: isEn ? "Guides new users" : "Ги води новите корисници" },
      ],
      required: true,
    },

    // ══════════════════════════════════════════════════════════════
    // STEP 3: Chatbot style
    // ══════════════════════════════════════════════════════════════
    {
      id: "tone",
      group: isEn ? "Chatbot style" : "Стил на chatbot-от",
      question: isEn ? "What tone should the chatbot use?" : "Каков тон да користи chatbot-от?",
      type: "radio",
      options: [
        { value: "professional", label: isEn ? "Professional" : "Професионален", description: isEn ? "Formal and business-like" : "Формален и деловен" },
        { value: "friendly", label: isEn ? "Friendly" : "Пријателски", description: isEn ? "Warm and approachable" : "Топол и достапен" },
        { value: "casual", label: isEn ? "Casual" : "Неформален", description: isEn ? "Relaxed and direct" : "Опуштен и директен" },
        { value: "formal", label: isEn ? "Very Formal" : "Многу формален", description: isEn ? "Official and respectful" : "Официјален и почитувачки" },
      ],
      required: false,
      defaultValue: () => "friendly",
    },
    {
      id: "language",
      group: isEn ? "Chatbot style" : "Стил на chatbot-от",
      question: isEn ? "What language should it respond in?" : "На кој јазик да одговара?",
      type: "radio",
      options: [
        { value: "mk", label: isEn ? "Macedonian" : "Македонски" },
        { value: "mk_en", label: isEn ? "Macedonian & English" : "Македонски и Англиски" },
        { value: "en", label: isEn ? "English" : "Англиски" },
        { value: "sq", label: isEn ? "Albanian" : "Албански" },
      ],
      required: false,
      defaultValue: () => "mk",
    },
    {
      id: "response_length",
      group: isEn ? "Chatbot style" : "Стил на chatbot-от",
      question: isEn ? "How detailed should the responses be?" : "Колку опширни да бидат одговорите?",
      type: "radio",
      options: [
        { value: "concise", label: isEn ? "Short" : "Кратки", description: isEn ? "1-2 sentences, straight to the point" : "1-2 реченици, право на поента" },
        { value: "balanced", label: isEn ? "Balanced" : "Балансирани", description: isEn ? "Enough detail, without overdoing it" : "Доволно детали, без претерување" },
        { value: "detailed", label: isEn ? "Detailed" : "Детални", description: isEn ? "Full explanations with examples" : "Целосни објаснувања со примери" },
      ],
      required: false,
      defaultValue: () => "balanced",
    },
    {
      id: "unknown_answer",
      group: isEn ? "Chatbot style" : "Стил на chatbot-от",
      question: isEn ? "When it doesn't know the answer, what should it do?" : "Кога не знае одговор, што да направи?",
      type: "radio",
      options: [
        { value: "admit_contact", label: isEn ? "Admit & refer" : "Признај и упати", description: isEn ? "Say it doesn't know + provide contact" : "Кажи дека не знае + даде контакт" },
        { value: "admit_only", label: isEn ? "Just admit" : "Само признај", description: isEn ? "Say it doesn't know" : "Кажи дека не знае" },
        { value: "try_help", label: isEn ? "Try to help" : "Обиди се да помогне", description: isEn ? "Give the closest answer" : "Дај најблизок одговор" },
      ],
      required: false,
      defaultValue: () => "admit_contact",
    },
    {
      id: "greeting_message",
      group: isEn ? "Chatbot style" : "Стил на chatbot-от",
      question: isEn ? "Welcome message" : "Порака за добредојде",
      subtitle: isEn ? "The first message customers will see." : "Првата порака што клиентите ќе ја видат.",
      type: "textarea",
      placeholder: (a) => {
        const name = a.business_name as string;
        if (isEn) {
          return name
            ? `e.g. Welcome to ${name}! How can I help you?`
            : "e.g. Hello! How can I help you today?";
        }
        return name
          ? `нпр. Добредојдовте во ${name}! Како можам да ви помогнам?`
          : "нпр. Здраво! Како можам да ви помогнам денес?";
      },
      required: false,
      defaultValue: (a) => {
        const name = a.business_name as string;
        return name
          ? `Добредојдовте во ${name}! Како можам да ви помогнам?`
          : "Здраво! Како можам да ви помогнам денес?";
      },
    },

    // ══════════════════════════════════════════════════════════════
    // STEP 4: Personalization
    // ══════════════════════════════════════════════════════════════
    {
      id: "custom_instructions",
      group: isEn ? "Personalization" : "Персонализација",
      question: isEn ? "Special instructions for the chatbot" : "Специјални инструкции за chatbot-от",
      subtitle: isEn
        ? "Specific rules or behavior. Example: 'Always offer free delivery for orders over $50.'"
        : "Конкретни правила или однесување. Пример: 'Секогаш понуди бесплатна достава за нарачки над 2000 ден.'",
      type: "textarea",
      placeholder: isEn
        ? "e.g. When a customer asks about a discount, offer 10% for first order. Never mention competitors..."
        : "нпр. Кога клиентот прашува за попуст, понуди 10% за прва нарачка. Никогаш не споменувај ги конкурентите...",
      required: false,
    },
    {
      id: "custom_faq",
      group: isEn ? "Personalization" : "Персонализација",
      question: isEn ? "Most common questions and answers" : "Најчести прашања и одговори",
      subtitle: isEn
        ? "Enter questions you get frequently, along with the correct answers."
        : "Внесете прашања што ги добивате често, заедно со точните одговори.",
      type: "textarea",
      placeholder: isEn
        ? "Q: Do you have parking?\nA: Yes, we have free parking behind the building.\n\nQ: How much is delivery?\nA: Delivery is free for orders over $50."
        : "П: Дали имате паркинг?\nО: Да, имаме бесплатен паркинг зад зградата.\n\nП: Колку чини достава?\nО: Достава е бесплатна за нарачки над 1500 ден.",
      required: false,
    },
    {
      id: "custom_personality",
      group: isEn ? "Personalization" : "Персонализација",
      question: isEn ? "How do you want your chatbot to sound?" : "Како сакате да звучи вашиот chatbot?",
      subtitle: isEn
        ? "Describe the personality in your own words — humorous, strict, formal, emojis, etc."
        : "Опишете ја личноста со ваши зборови — шеговит, строг, формален, емотикони итн.",
      type: "textarea",
      placeholder: isEn
        ? "e.g. Be friendly but professional, use emojis occasionally, address customers formally..."
        : "нпр. Да биде пријателски но професионален, да користи емотикони повремено, да се обраќа со 'Вие'...",
      required: false,
    },
  ];
}

// Keep backward-compatible export for any code that still uses the static array
export const wizardQuestions = getWizardQuestions("mk");

// ── Helpers ────────────────────────────────────────────────────

function getVisibleQuestions(questions: WizardQuestion[], answers: WizardAnswers): WizardQuestion[] {
  return questions.filter((q) => {
    if (q.showWhen) return q.showWhen(answers);
    return true;
  });
}

export function getVisibleGroups(answers: WizardAnswers, lang: "en" | "mk" = "mk"): WizardGroup[] {
  const questions = getWizardQuestions(lang);
  const visible = getVisibleQuestions(questions, answers);
  const groups: WizardGroup[] = [];
  for (const q of visible) {
    const last = groups[groups.length - 1];
    if (last && last.name === q.group) {
      last.questions.push(q);
    } else {
      groups.push({ name: q.group, questions: [q] });
    }
  }
  return groups;
}

export function getStepGroups(visible: WizardQuestion[]): { name: string; count: number }[] {
  const groups: { name: string; count: number }[] = [];
  for (const q of visible) {
    const last = groups[groups.length - 1];
    if (last && last.name === q.group) {
      last.count++;
    } else {
      groups.push({ name: q.group, count: 1 });
    }
  }
  return groups;
}
