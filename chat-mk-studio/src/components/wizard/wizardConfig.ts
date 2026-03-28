import { WizardQuestion, WizardAnswers, WizardGroup } from "./types";

function q(question: WizardQuestion["question"], answers: WizardAnswers): string {
  return typeof question === "function" ? question(answers) : question;
}

function ph(placeholder: WizardQuestion["placeholder"], answers: WizardAnswers): string {
  if (!placeholder) return "";
  return typeof placeholder === "function" ? placeholder(answers) : placeholder;
}

export { q, ph };

// IDs of all conditional questions — used for branching cleanup
export const INDUSTRY_QUESTION_IDS = [
  "product_categories", "shipping_options", "return_policy",
  "specializations", "insurance_accepted", "emergency_protocol",
  "treatment_types", "booking_method", "cancellation_policy",
  "menu_type", "delivery_options", "reservation_support",
  "room_types", "amenities", "booking_channels",
  "program_types", "enrollment_process",
  "property_types", "service_areas",
  "service_types_auto", "brands_carried",
  "financial_services", "regulatory_note",
  "practice_areas", "consultation_type",
  "it_service_model", "tech_stack",
  "products_services_other",
];

export const PURPOSE_QUESTION_IDS = [
  "support_topics", "support_topics_retail", "support_topics_healthcare",
  "support_topics_food", "support_topics_beauty",
  "sales_goals", "sales_goals_retail", "sales_goals_healthcare",
  "sales_goals_food", "sales_goals_realestate",
  "appointment_details", "appointment_details_healthcare",
  "appointment_details_beauty", "appointment_details_food",
  "appointment_details_auto",
  "info_scope", "info_scope_education", "info_scope_finance",
  "onboarding_scope",
];

export const wizardQuestions: WizardQuestion[] = [
  // ══════════════════════════════════════════════════════════════
  // SCREEN 1: Индустрија (1 question — critical branching point)
  // ══════════════════════════════════════════════════════════════
  {
    id: "industry",
    group: "Индустрија",
    question: "Во која индустрија е вашиот бизнис?",
    subtitle: "Врз основа на ова, ќе ви поставиме прашања специфични за вашата дејност.",
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

  // ══════════════════════════════════════════════════════════════
  // SCREEN 2: Вашиот бизнис (2 questions)
  // ══════════════════════════════════════════════════════════════
  {
    id: "business_name",
    group: "Вашиот бизнис",
    question: "Како се вика вашиот бизнис?",
    type: "text",
    placeholder: "нпр. Мебел Дизајн ДООЕЛ",
    required: true,
  },
  {
    id: "business_description",
    group: "Вашиот бизнис",
    required: false,
    question: (a) => {
      const ind = a.industry as string;
      if (ind === "retail") return "Опишете ја вашата продавница во 2-3 реченици.";
      if (ind === "healthcare") return "Опишете ја вашата здравствена установа.";
      if (ind === "beauty") return "Опишете го вашиот салон/студио.";
      if (ind === "food") return "Опишете го вашиот ресторан/кафуле.";
      if (ind === "hospitality") return "Опишете го вашиот објект.";
      if (ind === "education") return "Опишете ја вашата образовна институција.";
      return "Опишете го вашиот бизнис во 2-3 реченици.";
    },
    subtitle: "Што нудите? Кои се вашите клиенти?",
    type: "textarea",
    placeholder: (a) => {
      const ind = a.industry as string;
      if (ind === "retail") return "нпр. Онлајн продавница за мебел со испорака низ цела Македонија. Нудиме мебел за дома и канцеларија.";
      if (ind === "healthcare") return "нпр. Приватна ординација за општа медицина со лабораторија. Работиме 15 години во Скопје.";
      if (ind === "beauty") return "нпр. Козметички салон со третмани за лице и тело. Два локации во Скопје.";
      if (ind === "food") return "нпр. Пицерија со достава низ Скопје. Нудиме пици, пасти и десерти.";
      if (ind === "hospitality") return "нпр. Хотел со 4 ѕвезди на брегот на Охридско Езеро. 50 соби и ресторан.";
      return "нпр. Ние сме компанија која нуди...";
    },
    required: false,
  },

  // ══════════════════════════════════════════════════════════════
  // SCREEN 3: Контакт информации (3 questions)
  // ══════════════════════════════════════════════════════════════
  {
    id: "phone_number",
    group: "Контакт информации",
    question: "Телефон за контакт",
    subtitle: "Chatbot-от ќе го користи ова за да ги упати клиентите кон вас.",
    type: "text",
    placeholder: "нпр. 02 3111 222 / 070 123 456",
    required: false,
  },
  {
    id: "location_info",
    group: "Контакт информации",
    question: "Каде се наоѓате?",
    subtitle: "Адреса, град, или 'онлајн' ако немате физичка локација.",
    type: "text",
    placeholder: "нпр. ул. Македонија 5, Скопје",
    required: false,
  },
  {
    id: "working_hours",
    group: "Контакт информации",
    question: "Работно време",
    type: "text",
    placeholder: "нпр. Пон-Пет 09:00-17:00, Саб 10:00-14:00",
    required: false,
  },

  // ══════════════════════════════════════════════════════════════
  // SCREEN 4: Вашата приказна (soul of the business)
  // ══════════════════════════════════════════════════════════════
  {
    id: "unique_value",
    group: "Вашата приказна",
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
    subtitle: (a) => {
      const ind = a.industry as string;
      const map: Record<string, string> = {
        retail: "Ексклузивни брендови, цени, квалитет, брза испорака...?",
        hospitality: "Локација, услуга, атмосфера, автентично искуство...?",
        healthcare: "Искуство, технологија, грижа, достапност...?",
        education: "Методологија, резултати, практична работа, менторство...?",
        realestate: "Познавање на пазарот, персонален пристап, портфолио...?",
        finance: "Доверба, транспарентност, персонален пристап...?",
        beauty: "Мајстори, производи, техники, атмосфера...?",
        automotive: "Искуство, оригинални делови, гаранција, брзина...?",
        legal: "Искуство, специјализација, успешност, дискреција...?",
        it_services: "Технологија, тим, резултати, иновативност...?",
        food: "Рецепти, состојки, атмосфера, традиција...?",
      };
      return map[ind] || "Што ве издвојува од конкуренцијата?";
    },
    type: "textarea",
    placeholder: (a) => {
      const ind = a.industry as string;
      const map: Record<string, string> = {
        retail: "нпр. Нудиме ексклузивни брендови кои не можете да ги најдете на друго место во Македонија, со бесплатна испорака за 24 часа.",
        healthcare: "нпр. Имаме 20 години искуство, најнова опрема и индивидуален пристап кон секој пациент.",
        beauty: "нпр. Работиме само со премиум козметика, нашите мајстори имаат 10+ години искуство и редовно се обучуваат.",
        food: "нпр. Користиме само свежи, домашни состојки. Нашите рецепти се традиционални, пренесени од три генерации.",
        legal: "нпр. Имаме 15 години искуство во корпоративно право, со над 500 успешно завршени случаи.",
        automotive: "нпр. Овластен сервис за BMW и Mercedes, со оригинални делови и 2 години гаранција на секој сервис.",
      };
      return map[ind] || "нпр. Нашата предност е...";
    },
    required: false,
  },
  {
    id: "customer_trust",
    group: "Вашата приказна",
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
    subtitle: (a) => {
      const ind = a.industry as string;
      const map: Record<string, string> = {
        healthcare: "Сертификати, години искуство, број на задоволни пациенти...",
        legal: "Години пракса, број на случаи, области на експертиза...",
        finance: "Лиценци, регулаторни одобренија, партнерства...",
        education: "Статистики за вработување, сертификати, рангирања...",
        it_services: "Портфолио, познати клиенти, технолошки партнерства...",
      };
      return map[ind] || "Искуство, задоволни клиенти, награди, сертификати...";
    },
    type: "textarea",
    placeholder: (a) => {
      const ind = a.industry as string;
      const map: Record<string, string> = {
        healthcare: "нпр. Д-р Петровски има 20 години искуство и е член на Европското здружение за кардиологија. Над 5000 задоволни пациенти.",
        legal: "нпр. Тим од 5 адвокати со просечно 12 години искуство. Специјалисти за трговско и имотно право. 95% успешност.",
        finance: "нпр. Лиценциран од НБРМ, 10 години на пазарот, над 2000 задоволни клиенти.",
        education: "нпр. 90% од нашите студенти се вработуваат во рок од 3 месеци. Партнери сме со 15 ИТ компании.",
        it_services: "нпр. Работевме со Телеком, А1 и неколку банки. Microsoft Gold Partner. Тим од 20 инженери.",
      };
      return map[ind] || "нпр. Имаме 10+ години искуство и над 1000 задоволни клиенти...";
    },
    required: false,
  },

  // ══════════════════════════════════════════════════════════════
  // SCREEN 5: Детали за бизнисот (industry-specific, 2-3 per screen)
  // ══════════════════════════════════════════════════════════════

  // ── RETAIL ──
  {
    id: "product_categories",
    group: "Детали за бизнисот",
    question: "Кои категории на производи ги продавате?",
    type: "checkbox",
    options: [
      { value: "clothing", label: "Облека и обувки" },
      { value: "electronics", label: "Електроника и техника" },
      { value: "furniture", label: "Мебел и декорација" },
      { value: "food_products", label: "Прехранбени производи" },
      { value: "cosmetics", label: "Козметика и парфеми" },
      { value: "sports", label: "Спорт и рекреација" },
      { value: "kids", label: "Детски производи" },
      { value: "other_products", label: "Друго" },
    ],
    required: false,
    showWhen: (a) => a.industry === "retail",
  },
  {
    id: "shipping_options",
    group: "Детали за бизнисот",
    question: "Какви опции за испорака нудите?",
    type: "checkbox",
    options: [
      { value: "free_shipping", label: "Бесплатна испорака" },
      { value: "express", label: "Експрес достава (1-2 дена)" },
      { value: "standard", label: "Стандардна достава (3-5 дена)" },
      { value: "pickup", label: "Подигање во продавница" },
      { value: "no_shipping", label: "Немаме испорака (само физичка продавница)" },
    ],
    required: false,
    showWhen: (a) => a.industry === "retail",
  },
  {
    id: "return_policy",
    group: "Детали за бизнисот",
    question: "Политика за враќање",
    type: "radio",
    options: [
      { value: "flexible", label: "Флексибилна", description: "30+ дена, без прашања" },
      { value: "standard_return", label: "Стандардна", description: "14 дена со сметка" },
      { value: "strict", label: "Строга", description: "Само за неисправни производи" },
      { value: "no_returns", label: "Без враќање", description: "Финална продажба" },
    ],
    required: false,
    showWhen: (a) => a.industry === "retail",
  },

  // ── HEALTHCARE ──
  {
    id: "specializations",
    group: "Детали за бизнисот",
    question: "Кои специјализации ги нудите?",
    type: "checkbox",
    options: [
      { value: "general", label: "Општа медицина" },
      { value: "pediatrics", label: "Педијатрија" },
      { value: "dermatology", label: "Дерматологија" },
      { value: "dentistry", label: "Стоматологија" },
      { value: "ophthalmology", label: "Офталмологија" },
      { value: "gynecology", label: "Гинекологија" },
      { value: "cardiology", label: "Кардиологија" },
      { value: "orthopedics", label: "Ортопедија" },
      { value: "lab", label: "Лабораторија" },
      { value: "pharmacy", label: "Аптека" },
      { value: "other_medical", label: "Друго" },
    ],
    required: false,
    showWhen: (a) => a.industry === "healthcare",
  },
  {
    id: "insurance_accepted",
    group: "Детали за бизнисот",
    question: "Дали примате здравствено осигурување?",
    type: "radio",
    options: [
      { value: "fzo", label: "Да — ФЗО (државно)", description: "Примаме со упат од матичен лекар" },
      { value: "private_insurance", label: "Да — приватно осигурување" },
      { value: "both", label: "И државно и приватно" },
      { value: "no_insurance", label: "Не — само приватно плаќање" },
    ],
    required: false,
    showWhen: (a) => a.industry === "healthcare",
  },
  {
    id: "emergency_protocol",
    group: "Детали за бизнисот",
    question: "Итна служба / дежурства?",
    type: "radio",
    options: [
      { value: "yes_emergency", label: "Да, имаме итна служба 24/7" },
      { value: "on_call", label: "Дежурен телефон надвор од работно време" },
      { value: "no_emergency", label: "Не — само во работно време" },
    ],
    required: false,
    showWhen: (a) => a.industry === "healthcare",
  },

  // ── BEAUTY ──
  {
    id: "treatment_types",
    group: "Детали за бизнисот",
    question: "Кои третмани и услуги ги нудите?",
    type: "checkbox",
    options: [
      { value: "haircut", label: "Шишање и стилизирање" },
      { value: "coloring", label: "Фарбање и хајлајти" },
      { value: "manicure", label: "Маникир / Педикир" },
      { value: "facial", label: "Третман на лице" },
      { value: "massage", label: "Масажа" },
      { value: "waxing", label: "Депилација" },
      { value: "lashes", label: "Трепки / Веѓи" },
      { value: "makeup", label: "Шминка" },
      { value: "body_treatment", label: "Третман на тело" },
    ],
    required: false,
    showWhen: (a) => a.industry === "beauty",
  },
  {
    id: "booking_method",
    group: "Детали за бизнисот",
    question: "Како клиентите закажуваат термини?",
    type: "radio",
    options: [
      { value: "phone_booking", label: "Телефонски" },
      { value: "online_booking", label: "Онлајн систем" },
      { value: "walk_in", label: "Без закажување" },
      { value: "mixed_booking", label: "Комбинирано (телефон + онлајн + walk-in)" },
    ],
    required: false,
    showWhen: (a) => a.industry === "beauty",
  },
  {
    id: "cancellation_policy",
    group: "Детали за бизнисот",
    question: "Политика за откажување термини",
    type: "radio",
    options: [
      { value: "flexible_cancel", label: "Флексибилна — откажете кога сакате" },
      { value: "24h_cancel", label: "24 часа однапред" },
      { value: "48h_cancel", label: "48 часа однапред" },
      { value: "no_cancel", label: "Без откажување — плаќање однапред" },
    ],
    required: false,
    showWhen: (a) => a.industry === "beauty",
  },

  // ── FOOD / RESTAURANT ──
  {
    id: "menu_type",
    group: "Детали за бизнисот",
    question: "Какви типови храна/пијалоци нудите?",
    type: "checkbox",
    options: [
      { value: "pizza", label: "Пица" },
      { value: "burgers", label: "Бургери / Сендвичи" },
      { value: "traditional", label: "Традиционална кујна" },
      { value: "international", label: "Интернационална кујна" },
      { value: "desserts", label: "Десерти / Слатки" },
      { value: "coffee", label: "Кафе / Пијалоци" },
      { value: "vegan", label: "Веган / Вегетаријанско" },
      { value: "bakery", label: "Пекара / Бурекџилница" },
    ],
    required: false,
    showWhen: (a) => a.industry === "food",
  },
  {
    id: "delivery_options",
    group: "Детали за бизнисот",
    question: "Какви опции за достава нудите?",
    type: "checkbox",
    options: [
      { value: "own_delivery", label: "Сопствена достава" },
      { value: "glovo", label: "Glovo / Wolt" },
      { value: "takeout", label: "За понесување" },
      { value: "dine_in", label: "Јадење во ресторан" },
      { value: "catering", label: "Кетеринг / Нарачки за настани" },
    ],
    required: false,
    showWhen: (a) => a.industry === "food",
  },
  {
    id: "reservation_support",
    group: "Детали за бизнисот",
    question: "Примате резервации за маси?",
    type: "radio",
    options: [
      { value: "yes_reservation", label: "Да — телефонски и онлајн" },
      { value: "phone_only_res", label: "Да — само телефонски" },
      { value: "no_reservation", label: "Не — прв дојден, прв услужен" },
    ],
    required: false,
    showWhen: (a) => a.industry === "food",
  },

  // ── HOSPITALITY ──
  {
    id: "room_types",
    group: "Детали за бизнисот",
    question: "Какви типови сместување нудите?",
    type: "checkbox",
    options: [
      { value: "single_room", label: "Еднокреветна соба" },
      { value: "double_room", label: "Двокреветна соба" },
      { value: "suite", label: "Апартман / Suite" },
      { value: "apartment", label: "Апартман за издавање" },
      { value: "villa", label: "Вила / Куќа" },
      { value: "hostel", label: "Хостел / Дормитори" },
    ],
    required: false,
    showWhen: (a) => a.industry === "hospitality",
  },
  {
    id: "amenities",
    group: "Детали за бизнисот",
    question: "Кои погодности ги нудите?",
    type: "checkbox",
    options: [
      { value: "wifi", label: "Бесплатен WiFi" },
      { value: "parking", label: "Паркинг" },
      { value: "restaurant", label: "Ресторан" },
      { value: "pool", label: "Базен" },
      { value: "spa", label: "Спа / Велнес" },
      { value: "gym", label: "Фитнес" },
      { value: "breakfast", label: "Вклучен појадок" },
      { value: "transfer", label: "Аеродромски трансфер" },
    ],
    required: false,
    showWhen: (a) => a.industry === "hospitality",
  },
  {
    id: "booking_channels",
    group: "Детали за бизнисот",
    question: "Каде можат гостите да резервираат?",
    type: "checkbox",
    options: [
      { value: "direct_booking", label: "Директно (телефон/email)" },
      { value: "website_booking", label: "Наш веб-сајт" },
      { value: "booking_com", label: "Booking.com" },
      { value: "airbnb", label: "Airbnb" },
      { value: "tripadvisor", label: "TripAdvisor" },
    ],
    required: false,
    showWhen: (a) => a.industry === "hospitality",
  },

  // ── EDUCATION ──
  {
    id: "program_types",
    group: "Детали за бизнисот",
    question: "Какви програми/курсеви нудите?",
    type: "checkbox",
    options: [
      { value: "languages", label: "Јазични курсеви" },
      { value: "it_courses", label: "ИТ / Програмирање" },
      { value: "business_courses", label: "Бизнис / Менаџмент" },
      { value: "arts", label: "Уметност / Музика" },
      { value: "tutoring", label: "Приватни часови / Подготовки" },
      { value: "professional", label: "Професионални сертификати" },
      { value: "kids_programs", label: "Програми за деца" },
      { value: "online_courses", label: "Онлајн курсеви" },
    ],
    required: false,
    showWhen: (a) => a.industry === "education",
  },
  {
    id: "enrollment_process",
    group: "Детали за бизнисот",
    question: "Како функционира процесот на запишување?",
    type: "radio",
    options: [
      { value: "online_enrollment", label: "Целосно онлајн" },
      { value: "in_person", label: "Лично" },
      { value: "hybrid_enrollment", label: "Комбинирано (онлајн + лично)" },
      { value: "open_enrollment", label: "Слободен пристап без формална пријава" },
    ],
    required: false,
    showWhen: (a) => a.industry === "education",
  },

  // ── REAL ESTATE ──
  {
    id: "property_types",
    group: "Детали за бизнисот",
    question: "Со какви типови недвижности работите?",
    type: "checkbox",
    options: [
      { value: "apartments_sale", label: "Станови за продажба" },
      { value: "apartments_rent", label: "Станови за издавање" },
      { value: "houses", label: "Куќи" },
      { value: "commercial", label: "Деловен простор" },
      { value: "land", label: "Земјиште" },
      { value: "new_construction", label: "Новоградба" },
    ],
    required: false,
    showWhen: (a) => a.industry === "realestate",
  },
  {
    id: "service_areas",
    group: "Детали за бизнисот",
    question: "Во кои градови/региони работите?",
    type: "text",
    placeholder: "нпр. Скопје, Битола, Охрид",
    required: false,
    showWhen: (a) => a.industry === "realestate",
  },

  // ── AUTOMOTIVE ──
  {
    id: "service_types_auto",
    group: "Детали за бизнисот",
    question: "Какви автомобилски услуги нудите?",
    type: "checkbox",
    options: [
      { value: "new_cars", label: "Продажба на нови автомобили" },
      { value: "used_cars", label: "Продажба на половни автомобили" },
      { value: "service_repair", label: "Сервис и поправки" },
      { value: "parts", label: "Авто делови" },
      { value: "tires", label: "Гуми и вулканизер" },
      { value: "car_wash", label: "Перење автомобили" },
      { value: "insurance_auto", label: "Авто осигурување" },
      { value: "rent_a_car", label: "Рент-а-кар" },
    ],
    required: false,
    showWhen: (a) => a.industry === "automotive",
  },
  {
    id: "brands_carried",
    group: "Детали за бизнисот",
    question: "Со кои брендови работите?",
    type: "text",
    placeholder: "нпр. BMW, Mercedes, VW, Toyota...",
    required: false,
    showWhen: (a) => a.industry === "automotive",
  },

  // ── FINANCE ──
  {
    id: "financial_services",
    group: "Детали за бизнисот",
    question: "Какви финансиски услуги нудите?",
    type: "checkbox",
    options: [
      { value: "banking", label: "Банкарски услуги" },
      { value: "loans", label: "Кредити и заеми" },
      { value: "life_insurance", label: "Животно осигурување" },
      { value: "property_insurance", label: "Имотно осигурување" },
      { value: "car_insurance", label: "Авто осигурување" },
      { value: "investment", label: "Инвестициско советување" },
      { value: "accounting", label: "Сметководство" },
      { value: "tax_consulting", label: "Даночно советување" },
    ],
    required: false,
    showWhen: (a) => a.industry === "finance",
  },
  {
    id: "regulatory_note",
    group: "Детали за бизнисот",
    question: "Chatbot-от да напомене дека не дава финансиски совети?",
    type: "radio",
    options: [
      { value: "yes_disclaimer", label: "Да — секогаш" },
      { value: "when_relevant", label: "Само кога е релевантно" },
      { value: "no_disclaimer", label: "Не е потребно" },
    ],
    required: false,
    showWhen: (a) => a.industry === "finance",
  },

  // ── LEGAL ──
  {
    id: "practice_areas",
    group: "Детали за бизнисот",
    question: "Кои правни области ги покривате?",
    type: "checkbox",
    options: [
      { value: "corporate", label: "Корпоративно право" },
      { value: "criminal", label: "Кривично право" },
      { value: "family", label: "Семејно право" },
      { value: "property_law", label: "Имотно право" },
      { value: "labor", label: "Работни односи" },
      { value: "tax_law", label: "Даночно право" },
      { value: "notary", label: "Нотарски услуги" },
      { value: "immigration", label: "Имиграција / Визи" },
    ],
    required: false,
    showWhen: (a) => a.industry === "legal",
  },
  {
    id: "consultation_type",
    group: "Детали за бизнисот",
    question: "Како ги спроведувате консултациите?",
    type: "radio",
    options: [
      { value: "in_office", label: "Во канцеларија" },
      { value: "online_legal", label: "Онлајн (видео повик)" },
      { value: "both_legal", label: "И лично и онлајн" },
      { value: "free_initial", label: "Прва консултација бесплатна" },
    ],
    required: false,
    showWhen: (a) => a.industry === "legal",
  },

  // ── IT / TECHNOLOGY ──
  {
    id: "it_service_model",
    group: "Детали за бизнисот",
    question: "Каков бизнис модел имате?",
    type: "radio",
    options: [
      { value: "saas", label: "SaaS (софтвер како услуга)" },
      { value: "agency", label: "Агенција / Фриленс" },
      { value: "consulting", label: "ИТ консалтинг" },
      { value: "product", label: "Продукт компанија" },
    ],
    required: false,
    showWhen: (a) => a.industry === "it_services",
  },
  {
    id: "tech_stack",
    group: "Детали за бизнисот",
    question: "Кои услуги ги нудите?",
    type: "checkbox",
    options: [
      { value: "web_dev", label: "Веб развој" },
      { value: "mobile_dev", label: "Мобилен развој" },
      { value: "design_ui", label: "Дизајн / UI/UX" },
      { value: "seo_marketing", label: "SEO / Дигитален маркетинг" },
      { value: "cloud_hosting", label: "Cloud / Хостинг" },
      { value: "cybersecurity", label: "Сајбер безбедност" },
      { value: "data_analytics", label: "Аналитика / BI" },
      { value: "support_maintenance", label: "Поддршка и одржување" },
    ],
    required: false,
    showWhen: (a) => a.industry === "it_services",
  },

  // ── OTHER / GENERIC ──
  {
    id: "products_services_other",
    group: "Детали за бизнисот",
    question: "Наведете ги главните производи или услуги.",
    subtitle: "Chatbot-от ќе ги користи овие информации за одговарање.",
    type: "textarea",
    placeholder: "нпр. Ние нудиме услуги за..., Нашите главни производи се...",
    required: false,
    showWhen: (a) => a.industry === "other",
  },

  // ══════════════════════════════════════════════════════════════
  // SCREEN 5: Цел и теми (bot_purpose + topic questions)
  // ══════════════════════════════════════════════════════════════
  {
    id: "bot_purpose",
    group: "Цел и теми",
    question: (a) => {
      const ind = a.industry as string;
      const industryNames: Record<string, string> = {
        retail: "вашата продавница",
        healthcare: "вашата здравствена установа",
        beauty: "вашиот салон",
        food: "вашиот ресторан",
        hospitality: "вашиот хотел/објект",
        education: "вашата школа",
        realestate: "вашата агенција",
        automotive: "вашиот автосервис/салон",
        finance: "вашата финансиска институција",
        legal: "вашата канцеларија",
        it_services: "вашата компанија",
      };
      const name = industryNames[ind] || "вашиот бизнис";
      return `Која е главната цел на chatbot-от за ${name}?`;
    },
    type: "radio",
    options: [
      { value: "customer_support", label: "Корисничка поддршка", description: "Одговарање на прашања, решавање проблеми" },
      { value: "sales", label: "Продажба", description: "Генерирање лидови, препорачување производи" },
      { value: "info_faq", label: "Информации и FAQ", description: "Давање информации за вашиот бизнис" },
      { value: "appointments", label: "Закажување термини", description: "Закажување состаноци, термини, резервации" },
      { value: "onboarding", label: "Onboarding", description: "Водење нови корисници/клиенти" },
    ],
    required: true,
  },

  // ── CUSTOMER SUPPORT: industry-specific topics ──
  {
    id: "support_topics_retail",
    group: "Цел и теми",
    question: "За кои теми најчесто ве прашуваат клиентите?",
    type: "checkbox",
    options: [
      { value: "order_status", label: "Статус на нарачка" },
      { value: "shipping_info", label: "Испорака и трошоци" },
      { value: "returns_exchange", label: "Враќање и замена" },
      { value: "product_availability", label: "Достапност на производи" },
      { value: "pricing_discounts", label: "Цени и попусти" },
      { value: "payment_methods", label: "Начини на плаќање" },
      { value: "warranty", label: "Гаранција" },
      { value: "size_guide", label: "Табела за големини" },
    ],
    required: false,
    showWhen: (a) => a.bot_purpose === "customer_support" && a.industry === "retail",
  },
  {
    id: "support_topics_healthcare",
    group: "Цел и теми",
    question: "За кои теми најчесто ве контактираат пациентите?",
    type: "checkbox",
    options: [
      { value: "appointment_availability", label: "Слободни термини" },
      { value: "preparation", label: "Подготовка за преглед" },
      { value: "results", label: "Резултати од анализи" },
      { value: "pricing_medical", label: "Ценовник" },
      { value: "insurance_coverage", label: "Покриеност со осигурување" },
      { value: "referral", label: "Упати и документација" },
      { value: "medication", label: "Лекови и рецепти" },
      { value: "emergency_info", label: "Итни случаи" },
    ],
    required: false,
    showWhen: (a) => a.bot_purpose === "customer_support" && a.industry === "healthcare",
  },
  {
    id: "support_topics_food",
    group: "Цел и теми",
    question: "За кои теми најчесто прашуваат гостите?",
    type: "checkbox",
    options: [
      { value: "menu_info", label: "Мени и цени" },
      { value: "delivery_time", label: "Време на достава" },
      { value: "allergens", label: "Алергени и состојки" },
      { value: "reservation_info", label: "Резервации" },
      { value: "catering_info", label: "Кетеринг" },
      { value: "opening_hours", label: "Работно време" },
      { value: "special_offers", label: "Дневни понуди" },
      { value: "complaint", label: "Рекламации" },
    ],
    required: false,
    showWhen: (a) => a.bot_purpose === "customer_support" && a.industry === "food",
  },
  {
    id: "support_topics_beauty",
    group: "Цел и теми",
    question: "За кои теми најчесто ве прашуваат клиентите?",
    type: "checkbox",
    options: [
      { value: "available_slots", label: "Слободни термини" },
      { value: "treatment_info", label: "Детали за третмани" },
      { value: "pricing_beauty", label: "Ценовник" },
      { value: "cancel_reschedule", label: "Откажување / Преместување" },
      { value: "aftercare", label: "Нега по третман" },
      { value: "products_beauty", label: "Производи за продажба" },
    ],
    required: false,
    showWhen: (a) => a.bot_purpose === "customer_support" && a.industry === "beauty",
  },
  {
    id: "support_topics",
    group: "Цел и теми",
    question: "За кои теми најчесто ве прашуваат клиентите?",
    type: "checkbox",
    options: [
      { value: "pricing", label: "Цени и попусти" },
      { value: "product_info", label: "Информации за производи/услуги" },
      { value: "technical", label: "Техничка поддршка" },
      { value: "billing", label: "Фактурирање и плаќање" },
      { value: "shipping", label: "Испорака" },
      { value: "returns", label: "Враќање и рекламации" },
      { value: "general", label: "Општи прашања" },
    ],
    required: false,
    showWhen: (a) => a.bot_purpose === "customer_support" && !["retail", "healthcare", "food", "beauty"].includes(a.industry as string),
  },

  // ── SALES: industry-specific ──
  {
    id: "sales_goals_retail",
    group: "Цел и теми",
    question: "Како треба chatbot-от да помага со продажба?",
    type: "checkbox",
    options: [
      { value: "recommend_products", label: "Препорачај производи" },
      { value: "show_promotions", label: "Прикажи промоции" },
      { value: "compare_products", label: "Споредба на производи" },
      { value: "upsell_cross", label: "Предложи дополнителни производи" },
      { value: "collect_leads", label: "Собери email за newsletter" },
      { value: "cart_recovery", label: "Потсети за напуштена кошничка" },
      { value: "gift_suggestions", label: "Предлози за подароци" },
    ],
    required: false,
    showWhen: (a) => a.bot_purpose === "sales" && a.industry === "retail",
  },
  {
    id: "sales_goals_healthcare",
    group: "Цел и теми",
    question: "Како треба chatbot-от да генерира нови пациенти?",
    type: "checkbox",
    options: [
      { value: "promote_services", label: "Промовирај услуги и пакети" },
      { value: "free_consultation", label: "Понуди бесплатна консултација" },
      { value: "collect_patient_info", label: "Собери информации за нов пациент" },
      { value: "health_packages", label: "Здравствени пакети" },
      { value: "insurance_info", label: "Покриеност со осигурување" },
    ],
    required: false,
    showWhen: (a) => a.bot_purpose === "sales" && a.industry === "healthcare",
  },
  {
    id: "sales_goals_food",
    group: "Цел и теми",
    question: "Како треба chatbot-от да зголеми продажбата?",
    type: "checkbox",
    options: [
      { value: "daily_specials", label: "Промовирај дневни понуди" },
      { value: "combo_meals", label: "Предложи комбо мени" },
      { value: "loyalty_program", label: "Програма за лојалност" },
      { value: "catering_promo", label: "Промовирај кетеринг" },
      { value: "new_items", label: "Најави нови производи" },
      { value: "upsell_drinks", label: "Предложи пијалоци и десерти" },
    ],
    required: false,
    showWhen: (a) => a.bot_purpose === "sales" && a.industry === "food",
  },
  {
    id: "sales_goals_realestate",
    group: "Цел и теми",
    question: "Како треба chatbot-от да генерира клиенти?",
    type: "checkbox",
    options: [
      { value: "property_search", label: "Помогни во пребарување" },
      { value: "schedule_viewing", label: "Закажи разгледување" },
      { value: "collect_buyer_info", label: "Собери информации (лид)" },
      { value: "price_estimation", label: "Проценка на цена" },
      { value: "mortgage_info", label: "Хипотечни партнери" },
      { value: "neighborhood_info", label: "Информации за локалитети" },
    ],
    required: false,
    showWhen: (a) => a.bot_purpose === "sales" && a.industry === "realestate",
  },
  {
    id: "sales_goals",
    group: "Цел и теми",
    question: "Што треба chatbot-от да прави при продажба?",
    type: "checkbox",
    options: [
      { value: "recommend_products", label: "Препорачај производи/услуги" },
      { value: "collect_leads", label: "Собери контакт информации" },
      { value: "answer_pricing", label: "Одговарај на прашања за цени" },
      { value: "upsell", label: "Предложи дополнителни производи" },
      { value: "schedule_demo", label: "Закажи демо/консултација" },
      { value: "redirect_human", label: "Пренасочи кон продажен тим" },
    ],
    required: false,
    showWhen: (a) => a.bot_purpose === "sales" && !["retail", "healthcare", "food", "realestate"].includes(a.industry as string),
  },

  // ── APPOINTMENTS: industry-specific ──
  {
    id: "appointment_details_healthcare",
    group: "Цел и теми",
    question: "Какви термини закажува chatbot-от?",
    type: "checkbox",
    options: [
      { value: "general_exam", label: "Општ преглед" },
      { value: "specialist", label: "Специјалистички преглед" },
      { value: "lab_tests", label: "Лабораториски анализи" },
      { value: "follow_up", label: "Контролен преглед" },
      { value: "vaccination", label: "Вакцинација" },
      { value: "therapy", label: "Терапија / Физикална" },
    ],
    required: false,
    showWhen: (a) => a.bot_purpose === "appointments" && a.industry === "healthcare",
  },
  {
    id: "appointment_details_beauty",
    group: "Цел и теми",
    question: "Какви термини закажува chatbot-от?",
    type: "checkbox",
    options: [
      { value: "hair_appointment", label: "Фризерски термин" },
      { value: "nail_appointment", label: "Маникир / Педикир" },
      { value: "facial_appointment", label: "Третман на лице" },
      { value: "massage_appointment", label: "Масажа" },
      { value: "full_package", label: "Пакет третмани" },
      { value: "bridal", label: "Невестински пакет" },
    ],
    required: false,
    showWhen: (a) => a.bot_purpose === "appointments" && a.industry === "beauty",
  },
  {
    id: "appointment_details_food",
    group: "Цел и теми",
    question: "Какви резервации закажува chatbot-от?",
    type: "checkbox",
    options: [
      { value: "table_reservation", label: "Резервација на маса" },
      { value: "private_event", label: "Приватен настан / Прослава" },
      { value: "catering_booking", label: "Нарачка за кетеринг" },
      { value: "group_booking", label: "Резервација за група" },
    ],
    required: false,
    showWhen: (a) => a.bot_purpose === "appointments" && a.industry === "food",
  },
  {
    id: "appointment_details_auto",
    group: "Цел и теми",
    question: "Какви термини закажува chatbot-от?",
    type: "checkbox",
    options: [
      { value: "service_appointment_auto", label: "Сервисен термин" },
      { value: "test_drive", label: "Тест возење" },
      { value: "tire_change", label: "Промена на гуми" },
      { value: "inspection", label: "Технички преглед" },
      { value: "estimate", label: "Проценка на трошоци" },
    ],
    required: false,
    showWhen: (a) => a.bot_purpose === "appointments" && a.industry === "automotive",
  },
  {
    id: "appointment_details",
    group: "Цел и теми",
    question: "Какви термини закажува chatbot-от?",
    type: "checkbox",
    options: [
      { value: "consultation", label: "Консултација" },
      { value: "service_appointment", label: "Термин за услуга" },
      { value: "meeting", label: "Состанок" },
      { value: "reservation", label: "Резервација" },
    ],
    required: false,
    showWhen: (a) => a.bot_purpose === "appointments" && !["healthcare", "beauty", "food", "automotive"].includes(a.industry as string),
  },

  // ── INFO/FAQ: industry-specific ──
  {
    id: "info_scope_education",
    group: "Цел и теми",
    question: "За што треба chatbot-от да дава информации?",
    type: "checkbox",
    options: [
      { value: "courses_info", label: "Курсеви и програми" },
      { value: "schedule_info", label: "Распоред и термини" },
      { value: "tuition_info", label: "Школарина и плаќање" },
      { value: "enrollment_info", label: "Процес на запишување" },
      { value: "teachers_info", label: "Наставници и предавачи" },
      { value: "certificates_info", label: "Сертификати и дипломи" },
      { value: "location_facilities", label: "Локација и просторни услови" },
    ],
    required: false,
    showWhen: (a) => a.bot_purpose === "info_faq" && a.industry === "education",
  },
  {
    id: "info_scope_finance",
    group: "Цел и теми",
    question: "За кои теми треба chatbot-от да информира?",
    type: "checkbox",
    options: [
      { value: "products_finance", label: "Финансиски производи" },
      { value: "rates_info", label: "Каматни стапки и услови" },
      { value: "apply_process", label: "Процес на аплицирање" },
      { value: "documents_needed", label: "Потребна документација" },
      { value: "branches_atm", label: "Филијали/банкомати" },
      { value: "online_banking", label: "Онлајн банкарство" },
      { value: "claims_process", label: "Пријава на штета" },
    ],
    required: false,
    showWhen: (a) => a.bot_purpose === "info_faq" && a.industry === "finance",
  },
  {
    id: "info_scope",
    group: "Цел и теми",
    question: "За што треба chatbot-от да дава информации?",
    type: "checkbox",
    options: [
      { value: "company_info", label: "За компанијата" },
      { value: "products_services", label: "За производи/услуги" },
      { value: "pricing", label: "Ценовник и пакети" },
      { value: "location_hours", label: "Локација и работно време" },
      { value: "policies", label: "Политики (враќање, гаранција)" },
      { value: "careers", label: "Вработување / Кариера" },
    ],
    required: false,
    showWhen: (a) => a.bot_purpose === "info_faq" && !["education", "finance"].includes(a.industry as string),
  },

  // ── ONBOARDING ──
  {
    id: "onboarding_scope",
    group: "Цел и теми",
    question: "Со што треба chatbot-от да им помогне на новите корисници?",
    type: "checkbox",
    options: [
      { value: "account_setup", label: "Поставување на сметка" },
      { value: "product_tour", label: "Тур низ производот/услугата" },
      { value: "first_steps", label: "Први чекори" },
      { value: "faq", label: "Најчесто поставувани прашања" },
      { value: "documentation", label: "Упатства и документација" },
    ],
    required: false,
    showWhen: (a) => a.bot_purpose === "onboarding",
  },

  // ══════════════════════════════════════════════════════════════
  // SCREEN 6: Стил и однесување (3 questions)
  // ══════════════════════════════════════════════════════════════
  {
    id: "tone",
    group: "Стил и однесување",
    question: "Каков тон треба да користи chatbot-от?",
    type: "radio",
    options: [
      { value: "professional", label: "Професионален", description: "Формален, деловен јазик" },
      { value: "friendly", label: "Пријателски", description: "Топол, но сепак професионален" },
      { value: "casual", label: "Неформален", description: "Опуштен, разговорен стил" },
      { value: "formal", label: "Многу формален", description: "Институционален, званичен" },
    ],
    required: false,
    defaultValue: () => "friendly",
  },
  {
    id: "response_length",
    group: "Стил и однесување",
    question: "Колку долги треба да бидат одговорите?",
    type: "radio",
    options: [
      { value: "concise", label: "Кратки и директни", description: "1-2 реченици" },
      { value: "balanced", label: "Балансирани", description: "Доволно детали без да е предолго" },
      { value: "detailed", label: "Детални", description: "Целосни објаснувања со примери" },
    ],
    required: false,
    defaultValue: () => "balanced",
  },
  {
    id: "unknown_answer",
    group: "Стил и однесување",
    question: "Кога не го знае одговорот?",
    type: "radio",
    options: [
      { value: "admit_redirect", label: "Признај и пренасочи кон човек" },
      { value: "admit_contact", label: "Признај и остави контакт" },
      { value: "try_help", label: "Пробај да помогне со тоа што го има" },
      { value: "collect_question", label: "Собери го прашањето за тимот" },
    ],
    required: false,
    defaultValue: () => "admit_contact",
  },

  // ══════════════════════════════════════════════════════════════
  // SCREEN 7: Персонализација (free-text customization)
  // ══════════════════════════════════════════════════════════════
  {
    id: "custom_instructions",
    group: "Персонализација",
    question: "Дали имате специјални инструкции за chatbot-от?",
    subtitle: "Напишете конкретни правила или однесување. Пример: 'Секогаш понуди бесплатна достава за нарачки над 2000 ден.' или 'Кога клиент прашува за цена, упати го да се јави на телефон.'",
    type: "textarea",
    placeholder: "нпр. Кога клиентот прашува за попуст, понуди 10% за прва нарачка. Никогаш не споменувај ги конкурентите...",
    required: false,
  },
  {
    id: "custom_faq",
    group: "Персонализација",
    question: "Најчести прашања и одговори",
    subtitle: "Внесете прашања што ги добивате често, заедно со точните одговори. Chatbot-от ќе ги користи.",
    type: "textarea",
    placeholder: "П: Дали имате паркинг?\nО: Да, имаме бесплатен паркинг зад зградата.\n\nП: Колку чини достава?\nО: Достава е бесплатна за нарачки над 1500 ден.",
    required: false,
  },
  {
    id: "custom_personality",
    group: "Персонализација",
    question: "Како сакате да звучи вашиот chatbot?",
    subtitle: "Опишете ја личноста на chatbot-от со ваши зборови — дали треба да биде шеговит, строг, формален, да користи емотикони итн.",
    type: "textarea",
    placeholder: "нпр. Да биде пријателски но професионален, да користи емотикони повремено, да се обраќа со 'Вие'...",
    required: false,
  },

  // ══════════════════════════════════════════════════════════════
  // SCREEN 8: Финализирај (2 questions)
  // ══════════════════════════════════════════════════════════════
  {
    id: "greeting_message",
    group: "Финализирај",
    question: "Каков поздрав да користи chatbot-от?",
    subtitle: "Првата порака што клиентот ја гледа кога ќе го отвори чатот.",
    type: "textarea",
    placeholder: "нпр. Здраво! Како можам да ви помогнам денес?",
    required: false,
    defaultValue: (a) => {
      const name = a.business_name as string || "нашата компанија";
      const purpose = a.bot_purpose as string;
      const industry = a.industry as string;

      if (purpose === "customer_support") {
        if (industry === "healthcare") return `Здраво! Јас сум виртуелниот асистент на ${name}. Дали имате прашање за наши услуги, термини или резултати?`;
        if (industry === "retail") return `Здраво! Добредојдовте во ${name}. Дали имате прашање за нарачка, испорака или производ?`;
        return `Здраво! Јас сум виртуелниот асистент на ${name}. Како можам да ви помогнам денес?`;
      }
      if (purpose === "sales") {
        if (industry === "retail") return `Добредојдовте во ${name}! Дали барате нешто конкретно? Ќе ви помогнам да најдете совршен производ.`;
        if (industry === "realestate") return `Добредојдовте! Дали барате стан, куќа или деловен простор? Јас сум тука да ви помогнам.`;
        return `Добредојдовте во ${name}! Со задоволство ќе ви помогнам да го најдете вистинскиот производ.`;
      }
      if (purpose === "info_faq") return `Здраво! Имате прашање за ${name}? Јас сум тука да ви помогнам со информации.`;
      if (purpose === "appointments") {
        if (industry === "healthcare") return `Здраво! Дали сакате да закажете преглед кај ${name}? Ќе ви помогнам да најдете слободен термин.`;
        if (industry === "beauty") return `Здраво! Дали сакате да закажете термин кај ${name}? Кажете ми каков третман ве интересира.`;
        if (industry === "food") return `Здраво! Дали сакате да резервирате маса кај ${name}? Кажете ми за колку лица и кога.`;
        return `Здраво! Дали сакате да закажете термин кај ${name}? Јас ќе ви помогнам.`;
      }
      if (purpose === "onboarding") return `Добредојдовте во ${name}! Јас ќе ви помогнам да започнете. Што сакате да дознаете прво?`;
      return `Здраво! Како можам да ви помогнам денес?`;
    },
  },
  {
    id: "language",
    group: "Финализирај",
    question: "На кој јазик треба да одговара chatbot-от?",
    type: "radio",
    options: [
      { value: "mk", label: "Македонски", description: "Одговара само на македонски" },
      { value: "mk_en", label: "Македонски и Англиски", description: "Одговара на јазикот на кој пишува клиентот" },
      { value: "en", label: "Англиски", description: "Одговара само на англиски" },
      { value: "sq", label: "Албански", description: "Одговара само на албански" },
    ],
    required: false,
    defaultValue: () => "mk",
  },
];

/**
 * Returns the visible (filtered) questions for the current answer state.
 */
export function getVisibleQuestions(answers: WizardAnswers): WizardQuestion[] {
  return wizardQuestions.filter((q) => !q.showWhen || q.showWhen(answers));
}

/**
 * Returns visible questions grouped by their group name.
 */
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

/**
 * Returns step groups with their question counts for the progress indicator.
 */
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
