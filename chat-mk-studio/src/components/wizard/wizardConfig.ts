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

export const wizardQuestions: WizardQuestion[] = [
  // ══════════════════════════════════════════════════════════════
  // STEP 1: За вашиот бизнис (4 questions)
  // ══════════════════════════════════════════════════════════════
  {
    id: "industry",
    group: "За вашиот бизнис",
    question: "Во која индустрија е вашиот бизнис?",
    type: "radio",
    options: [
      { value: "retail", label: "Малопродажба / Е-трговија", description: "Онлајн или физичка продавница" },
      { value: "hospitality", label: "Угостителство / Хотелиерство", description: "Хотели, апартмани, туризам" },
      { value: "healthcare", label: "Здравство / Медицина", description: "Клиники, ординации, аптеки" },
      { value: "education", label: "Образование", description: "Курсеви, школи, универзитети" },
      { value: "realestate", label: "Недвижности", description: "Агенции, градежништво" },
      { value: "finance", label: "Финансии / Осигурување", description: "Банки, осигурителни компании" },
      { value: "beauty", label: "Убавина / Козметика", description: "Салони, фризерски, спа" },
      { value: "automotive", label: "Автоиндустрија", description: "Автосалони, сервиси, делови" },
      { value: "legal", label: "Правни услуги", description: "Адвокатски канцеларии, нотари" },
      { value: "it_services", label: "ИТ / Технологија", description: "Софтвер, веб, дигитални услуги" },
      { value: "food", label: "Храна / Ресторани / Достава", description: "Ресторани, кафулиња, достава" },
      { value: "other", label: "Друго", description: "Не е наведена мојата дејност" },
    ],
    required: true,
  },
  {
    id: "business_name",
    group: "За вашиот бизнис",
    question: "Како се вика вашиот бизнис?",
    type: "text",
    placeholder: "нпр. Мебел Дизајн ДООЕЛ",
    required: true,
  },
  {
    id: "business_description",
    group: "За вашиот бизнис",
    question: (a) => {
      const ind = a.industry as string;
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
    subtitle: "Што нудите? Кои се вашите клиенти?",
    type: "textarea",
    placeholder: (a) => {
      const ind = a.industry as string;
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
    group: "За вашиот бизнис",
    question: (a) => {
      const ind = a.industry as string;
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
    subtitle: "Искуство, квалитет, цени, локација, уникатна понуда...",
    type: "textarea",
    placeholder: (a) => {
      const ind = a.industry as string;
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
  // STEP 2: Контакт и детали (5 questions)
  // ══════════════════════════════════════════════════════════════
  {
    id: "phone_number",
    group: "Контакт и детали",
    question: "Телефон за контакт",
    subtitle: "Chatbot-от ќе го користи за да ги упати клиентите кон вас.",
    type: "text",
    placeholder: "нпр. 02 3111 222 / 070 123 456",
    required: false,
  },
  {
    id: "location_info",
    group: "Контакт и детали",
    question: "Каде се наоѓате?",
    subtitle: "Адреса, град, или 'онлајн' ако немате физичка локација.",
    type: "text",
    placeholder: "нпр. ул. Македонија 5, Скопје",
    required: false,
  },
  {
    id: "working_hours",
    group: "Контакт и детали",
    question: "Работно време",
    type: "text",
    placeholder: "нпр. Пон-Пет 09:00-17:00, Саб 10:00-14:00",
    required: false,
  },
  {
    id: "customer_trust",
    group: "Контакт и детали",
    question: (a) => {
      const ind = a.industry as string;
      const map: Record<string, string> = {
        healthcare: "Какво искуство и кредибилитет имате?",
        legal: "Какво искуство и специјализација имате?",
        finance: "Какви гаранции и лиценци имате?",
        education: "Какви резултати постигнуваат вашите ученици/студенти?",
        it_services: "Можете ли да споделите клучни проекти или клиенти?",
      };
      return map[ind] || "Зошто клиентите ви веруваат?";
    },
    subtitle: "Искуство, задоволни клиенти, награди, сертификати...",
    type: "textarea",
    placeholder: "нпр. Имаме 10+ години искуство и над 1000 задоволни клиенти...",
    required: false,
  },
  {
    id: "bot_purpose",
    group: "Контакт и детали",
    question: "Која е главната цел на chatbot-от?",
    type: "radio",
    options: [
      { value: "customer_support", label: "Корисничка поддршка", description: "Одговара на прашања и решава проблеми" },
      { value: "sales", label: "Продажба", description: "Помага при купување и препорачува производи" },
      { value: "info_faq", label: "Информации и FAQ", description: "Дава информации за бизнисот" },
      { value: "appointments", label: "Закажување термини", description: "Помага при закажување" },
      { value: "onboarding", label: "Onboarding", description: "Ги води новите корисници" },
    ],
    required: true,
  },

  // ══════════════════════════════════════════════════════════════
  // STEP 3: Стил на chatbot-от (5 questions)
  // ══════════════════════════════════════════════════════════════
  {
    id: "tone",
    group: "Стил на chatbot-от",
    question: "Каков тон да користи chatbot-от?",
    type: "radio",
    options: [
      { value: "professional", label: "Професионален", description: "Формален и деловен" },
      { value: "friendly", label: "Пријателски", description: "Топол и достапен" },
      { value: "casual", label: "Неформален", description: "Опуштен и директен" },
      { value: "formal", label: "Многу формален", description: "Официјален и почитувачки" },
    ],
    required: false,
    defaultValue: () => "friendly",
  },
  {
    id: "language",
    group: "Стил на chatbot-от",
    question: "На кој јазик да одговара?",
    type: "radio",
    options: [
      { value: "mk", label: "Македонски" },
      { value: "mk_en", label: "Македонски и Англиски" },
      { value: "en", label: "Англиски" },
      { value: "sq", label: "Албански" },
    ],
    required: false,
    defaultValue: () => "mk",
  },
  {
    id: "response_length",
    group: "Стил на chatbot-от",
    question: "Колку опширни да бидат одговорите?",
    type: "radio",
    options: [
      { value: "concise", label: "Кратки", description: "1-2 реченици, право на поента" },
      { value: "balanced", label: "Балансирани", description: "Доволно детали, без претерување" },
      { value: "detailed", label: "Детални", description: "Целосни објаснувања со примери" },
    ],
    required: false,
    defaultValue: () => "balanced",
  },
  {
    id: "unknown_answer",
    group: "Стил на chatbot-от",
    question: "Кога не знае одговор, што да направи?",
    type: "radio",
    options: [
      { value: "admit_contact", label: "Признај и упати", description: "Кажи дека не знае + даде контакт" },
      { value: "admit_only", label: "Само признај", description: "Кажи дека не знае" },
      { value: "try_help", label: "Обиди се да помогне", description: "Дај најблизок одговор" },
    ],
    required: false,
    defaultValue: () => "admit_contact",
  },
  {
    id: "greeting_message",
    group: "Стил на chatbot-от",
    question: "Порака за добредојде",
    subtitle: "Првата порака што клиентите ќе ја видат.",
    type: "textarea",
    placeholder: (a) => {
      const name = a.business_name as string;
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
  // STEP 4: Персонализација (3 questions)
  // ══════════════════════════════════════════════════════════════
  {
    id: "custom_instructions",
    group: "Персонализација",
    question: "Специјални инструкции за chatbot-от",
    subtitle: "Конкретни правила или однесување. Пример: 'Секогаш понуди бесплатна достава за нарачки над 2000 ден.'",
    type: "textarea",
    placeholder: "нпр. Кога клиентот прашува за попуст, понуди 10% за прва нарачка. Никогаш не споменувај ги конкурентите...",
    required: false,
  },
  {
    id: "custom_faq",
    group: "Персонализација",
    question: "Најчести прашања и одговори",
    subtitle: "Внесете прашања што ги добивате често, заедно со точните одговори.",
    type: "textarea",
    placeholder: "П: Дали имате паркинг?\nО: Да, имаме бесплатен паркинг зад зградата.\n\nП: Колку чини достава?\nО: Достава е бесплатна за нарачки над 1500 ден.",
    required: false,
  },
  {
    id: "custom_personality",
    group: "Персонализација",
    question: "Како сакате да звучи вашиот chatbot?",
    subtitle: "Опишете ја личноста со ваши зборови — шеговит, строг, формален, емотикони итн.",
    type: "textarea",
    placeholder: "нпр. Да биде пријателски но професионален, да користи емотикони повремено, да се обраќа со 'Вие'...",
    required: false,
  },
];

// ── Helpers ────────────────────────────────────────────────────

function getVisibleQuestions(answers: WizardAnswers): WizardQuestion[] {
  return wizardQuestions.filter((q) => {
    if (q.showWhen) return q.showWhen(answers);
    return true;
  });
}

export function getVisibleGroups(answers: WizardAnswers): WizardGroup[] {
  const visible = getVisibleQuestions(answers);
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
