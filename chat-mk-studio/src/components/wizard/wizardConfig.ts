import { WizardQuestion, WizardAnswers } from "./types";

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
  // GROUP 1: Основни информации (quick general — asked first)
  // ══════════════════════════════════════════════════════════════
  {
    id: "bot_name",
    group: "Основни информации",
    question: "Како ќе се вика вашиот chatbot?",
    subtitle: "Ова е интерно име за вас. Клиентите нема да го видат.",
    type: "text",
    placeholder: "нпр. Поддршка за клиенти",
    required: true,
  },
  {
    id: "business_name",
    group: "Основни информации",
    question: "Како се вика вашиот бизнис?",
    type: "text",
    placeholder: "нпр. Мебел Дизајн ДООЕЛ",
    required: true,
  },
  {
    id: "phone_number",
    group: "Основни информации",
    question: "Телефон за контакт?",
    subtitle: "Chatbot-от ќе го користи ова за да ги упати клиентите кон вас.",
    type: "text",
    placeholder: "нпр. 02 3111 222 / 070 123 456",
    required: false,
  },
  {
    id: "location_info",
    group: "Основни информации",
    question: "Каде се наоѓате?",
    subtitle: "Внесете адреса, град, или 'онлајн' ако немате физичка локација.",
    type: "text",
    placeholder: "нпр. ул. Македонија 5, Скопје",
    required: false,
  },
  {
    id: "working_hours",
    group: "Основни информации",
    question: "Кои се вашите работни часови?",
    subtitle: "Chatbot-от ќе ги информира клиентите за вашето работно време.",
    type: "text",
    placeholder: "нпр. Пон-Пет 09:00-17:00, Саб 10:00-14:00",
    required: true,
  },

  // ══════════════════════════════════════════════════════════════
  // GROUP 2: Вашиот бизнис (industry + description)
  // ══════════════════════════════════════════════════════════════
  {
    id: "industry",
    group: "Вашиот бизнис",
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
  {
    id: "business_description",
    group: "Вашиот бизнис",
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
    required: true,
  },

  // ══════════════════════════════════════════════════════════════
  // GROUP 3: Industry-specific details
  // ══════════════════════════════════════════════════════════════

  // ── RETAIL ──
  {
    id: "product_categories",
    group: "Детали за бизнисот",
    question: "Кои категории на производи ги продавате?",
    subtitle: "Изберете ги сите релевантни категории.",
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
    required: true,
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
    required: true,
    showWhen: (a) => a.industry === "retail",
  },
  {
    id: "return_policy",
    group: "Детали за бизнисот",
    question: "Каква е вашата политика за враќање?",
    type: "radio",
    options: [
      { value: "flexible", label: "Флексибилна", description: "30+ дена, без прашања" },
      { value: "standard_return", label: "Стандардна", description: "14 дена со сметка" },
      { value: "strict", label: "Строга", description: "Само за неисправни производи" },
      { value: "no_returns", label: "Без враќање", description: "Финална продажба" },
    ],
    required: true,
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
    required: true,
    showWhen: (a) => a.industry === "healthcare",
  },
  {
    id: "insurance_accepted",
    group: "Детали за бизнисот",
    question: "Дали примате здравствено осигурување?",
    type: "radio",
    options: [
      { value: "fzo", label: "Да — ФЗО (државно)", description: "Примаме со упат од матичен лекар" },
      { value: "private_insurance", label: "Да — приватно осигурување", description: "Триглав, Сава, Кроација..." },
      { value: "both", label: "И државно и приватно" },
      { value: "no_insurance", label: "Не — само приватно плаќање" },
    ],
    required: true,
    showWhen: (a) => a.industry === "healthcare",
  },
  {
    id: "emergency_protocol",
    group: "Детали за бизнисот",
    question: "Дали имате итна служба или дежурства?",
    type: "radio",
    options: [
      { value: "yes_emergency", label: "Да, имаме итна служба 24/7" },
      { value: "on_call", label: "Имаме дежурен телефон надвор од работно време" },
      { value: "no_emergency", label: "Не — само во работно време" },
    ],
    required: true,
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
    required: true,
    showWhen: (a) => a.industry === "beauty",
  },
  {
    id: "booking_method",
    group: "Детали за бизнисот",
    question: "Како клиентите закажуваат термини кај вас?",
    type: "radio",
    options: [
      { value: "phone_booking", label: "Телефонски", description: "Клиентите се јавуваат" },
      { value: "online_booking", label: "Онлајн систем", description: "Имаме онлајн букинг" },
      { value: "walk_in", label: "Без закажување", description: "Прв дојден - прв услужен" },
      { value: "mixed_booking", label: "Комбинирано", description: "Телефон + онлајн + walk-in" },
    ],
    required: true,
    showWhen: (a) => a.industry === "beauty",
  },
  {
    id: "cancellation_policy",
    group: "Детали за бизнисот",
    question: "Каква е политиката за откажување на термини?",
    type: "radio",
    options: [
      { value: "flexible_cancel", label: "Флексибилна — откажете кога сакате" },
      { value: "24h_cancel", label: "24 часа однапред" },
      { value: "48h_cancel", label: "48 часа однапред" },
      { value: "no_cancel", label: "Без откажување — плаќање однапред" },
    ],
    required: true,
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
    required: true,
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
    required: true,
    showWhen: (a) => a.industry === "food",
  },
  {
    id: "reservation_support",
    group: "Детали за бизнисот",
    question: "Дали примате резервации за маси?",
    type: "radio",
    options: [
      { value: "yes_reservation", label: "Да — телефонски и онлајн" },
      { value: "phone_only_res", label: "Да — само телефонски" },
      { value: "no_reservation", label: "Не — прв дојден, прв услужен" },
    ],
    required: true,
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
    required: true,
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
    required: true,
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
    required: true,
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
    required: true,
    showWhen: (a) => a.industry === "education",
  },
  {
    id: "enrollment_process",
    group: "Детали за бизнисот",
    question: "Како функционира процесот на запишување?",
    type: "radio",
    options: [
      { value: "online_enrollment", label: "Целосно онлајн", description: "Пријава и плаќање преку веб" },
      { value: "in_person", label: "Лично", description: "Треба да дојдат во просториите" },
      { value: "hybrid_enrollment", label: "Комбинирано", description: "Пријава онлајн, документи лично" },
      { value: "open_enrollment", label: "Без формална пријава", description: "Слободен пристап" },
    ],
    required: true,
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
    required: true,
    showWhen: (a) => a.industry === "realestate",
  },
  {
    id: "service_areas",
    group: "Детали за бизнисот",
    question: "Во кои градови/региони работите?",
    type: "text",
    placeholder: "нпр. Скопје, Битола, Охрид",
    required: true,
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
    required: true,
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
    required: true,
    showWhen: (a) => a.industry === "finance",
  },
  {
    id: "regulatory_note",
    group: "Детали за бизнисот",
    question: "Дали chatbot-от треба да напомене дека не дава финансиски совети?",
    subtitle: "Регулаторен disclaimer — препорачливо за финансиски институции.",
    type: "radio",
    options: [
      { value: "yes_disclaimer", label: "Да — секогаш да напомене", description: "\"Ова не е финансиски совет\"" },
      { value: "when_relevant", label: "Само кога е релевантно" },
      { value: "no_disclaimer", label: "Не е потребно" },
    ],
    required: true,
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
    required: true,
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
    required: true,
    showWhen: (a) => a.industry === "legal",
  },

  // ── IT / TECHNOLOGY ──
  {
    id: "it_service_model",
    group: "Детали за бизнисот",
    question: "Каков бизнис модел имате?",
    type: "radio",
    options: [
      { value: "saas", label: "SaaS (софтвер како услуга)", description: "Месечна/годишна претплата" },
      { value: "agency", label: "Агенција / Фриленс", description: "Проектни услуги" },
      { value: "consulting", label: "ИТ консалтинг", description: "Советодавни услуги" },
      { value: "product", label: "Продукт компанија", description: "Еднократна продажба" },
    ],
    required: true,
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
    required: true,
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
    required: true,
    showWhen: (a) => a.industry === "other",
  },

  // ══════════════════════════════════════════════════════════════
  // GROUP 4: Цел на chatbot-от
  // ══════════════════════════════════════════════════════════════
  {
    id: "bot_purpose",
    group: "Цел на chatbot-от",
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
    subtitle: "Врз основа на ова, ќе добиете специфични предлози за вашата дејност.",
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

  // ══════════════════════════════════════════════════════════════
  // GROUP 5: Purpose × Industry specific questions
  // ══════════════════════════════════════════════════════════════

  // ── CUSTOMER SUPPORT: industry-specific topics ──
  {
    id: "support_topics_retail",
    group: "Детали за улогата",
    question: "За кои теми најчесто ве прашуваат клиентите?",
    subtitle: "Изберете ги сите теми — chatbot-от ќе биде обучен за нив.",
    type: "checkbox",
    options: [
      { value: "order_status", label: "Статус на нарачка" },
      { value: "shipping_info", label: "Испорака и трошоци за достава" },
      { value: "returns_exchange", label: "Враќање и замена на производи" },
      { value: "product_availability", label: "Достапност на производи" },
      { value: "pricing_discounts", label: "Цени, попусти и промоции" },
      { value: "payment_methods", label: "Начини на плаќање" },
      { value: "warranty", label: "Гаранција" },
      { value: "size_guide", label: "Табела за големини" },
    ],
    required: true,
    showWhen: (a) => a.bot_purpose === "customer_support" && a.industry === "retail",
  },
  {
    id: "support_topics_healthcare",
    group: "Детали за улогата",
    question: "За кои теми најчесто ве контактираат пациентите?",
    type: "checkbox",
    options: [
      { value: "appointment_availability", label: "Слободни термини" },
      { value: "preparation", label: "Подготовка за преглед/процедура" },
      { value: "results", label: "Резултати од анализи" },
      { value: "pricing_medical", label: "Ценовник на услуги" },
      { value: "insurance_coverage", label: "Покриеност со осигурување" },
      { value: "referral", label: "Упати и документација" },
      { value: "medication", label: "Лекови и рецепти" },
      { value: "emergency_info", label: "Итни случаи" },
    ],
    required: true,
    showWhen: (a) => a.bot_purpose === "customer_support" && a.industry === "healthcare",
  },
  {
    id: "support_topics_food",
    group: "Детали за улогата",
    question: "За кои теми најчесто прашуваат гостите?",
    type: "checkbox",
    options: [
      { value: "menu_info", label: "Мени и цени" },
      { value: "delivery_time", label: "Време на достава" },
      { value: "allergens", label: "Алергени и состојки" },
      { value: "reservation_info", label: "Резервации за маси" },
      { value: "catering_info", label: "Кетеринг за настани" },
      { value: "opening_hours", label: "Работно време" },
      { value: "special_offers", label: "Дневни понуди / Промоции" },
      { value: "complaint", label: "Рекламации" },
    ],
    required: true,
    showWhen: (a) => a.bot_purpose === "customer_support" && a.industry === "food",
  },
  {
    id: "support_topics_beauty",
    group: "Детали за улогата",
    question: "За кои теми најчесто ве прашуваат клиентите?",
    type: "checkbox",
    options: [
      { value: "available_slots", label: "Слободни термини" },
      { value: "treatment_info", label: "Детали за третмани" },
      { value: "pricing_beauty", label: "Ценовник" },
      { value: "cancel_reschedule", label: "Откажување / Преместување термин" },
      { value: "aftercare", label: "Нега по третман" },
      { value: "products_beauty", label: "Производи за продажба" },
    ],
    required: true,
    showWhen: (a) => a.bot_purpose === "customer_support" && a.industry === "beauty",
  },
  // Generic support (for industries without specific support questions)
  {
    id: "support_topics",
    group: "Детали за улогата",
    question: "За кои теми најчесто ве прашуваат клиентите?",
    subtitle: "Изберете ги сите теми кои се релевантни.",
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
    required: true,
    showWhen: (a) => a.bot_purpose === "customer_support" && !["retail", "healthcare", "food", "beauty"].includes(a.industry as string),
  },

  // ── SALES: industry-specific ──
  {
    id: "sales_goals_retail",
    group: "Детали за улогата",
    question: "Како треба chatbot-от да помага со продажба?",
    type: "checkbox",
    options: [
      { value: "recommend_products", label: "Препорачај производи по потреби" },
      { value: "show_promotions", label: "Прикажи актуелни промоции" },
      { value: "compare_products", label: "Споредба на производи" },
      { value: "upsell_cross", label: "Предложи дополнителни производи (upsell/cross-sell)" },
      { value: "collect_leads", label: "Собери email за newsletter" },
      { value: "cart_recovery", label: "Потсети за напуштена кошничка" },
      { value: "gift_suggestions", label: "Предлози за подароци" },
    ],
    required: true,
    showWhen: (a) => a.bot_purpose === "sales" && a.industry === "retail",
  },
  {
    id: "sales_goals_healthcare",
    group: "Детали за улогата",
    question: "Како треба chatbot-от да генерира нови пациенти?",
    type: "checkbox",
    options: [
      { value: "promote_services", label: "Промовирај услуги и пакети" },
      { value: "free_consultation", label: "Понуди бесплатна консултација" },
      { value: "collect_patient_info", label: "Собери информации за нов пациент" },
      { value: "health_packages", label: "Прикажи здравствени пакети/програми" },
      { value: "insurance_info", label: "Информирај за покриеност со осигурување" },
    ],
    required: true,
    showWhen: (a) => a.bot_purpose === "sales" && a.industry === "healthcare",
  },
  {
    id: "sales_goals_food",
    group: "Детали за улогата",
    question: "Како треба chatbot-от да зголеми продажбата?",
    type: "checkbox",
    options: [
      { value: "daily_specials", label: "Промовирај дневни понуди" },
      { value: "combo_meals", label: "Предложи комбо мени" },
      { value: "loyalty_program", label: "Информирај за програма за лојалност" },
      { value: "catering_promo", label: "Промовирај кетеринг за настани" },
      { value: "new_items", label: "Најави нови производи од менито" },
      { value: "upsell_drinks", label: "Предложи пијалоци и десерти" },
    ],
    required: true,
    showWhen: (a) => a.bot_purpose === "sales" && a.industry === "food",
  },
  {
    id: "sales_goals_realestate",
    group: "Детали за улогата",
    question: "Како треба chatbot-от да генерира клиенти?",
    type: "checkbox",
    options: [
      { value: "property_search", label: "Помогни во пребарување недвижности" },
      { value: "schedule_viewing", label: "Закажи разгледување" },
      { value: "collect_buyer_info", label: "Собери информации за купувач (лид)" },
      { value: "price_estimation", label: "Дај проценка на цена" },
      { value: "mortgage_info", label: "Информирај за хипотечни партнери" },
      { value: "neighborhood_info", label: "Информации за локалитети/населби" },
    ],
    required: true,
    showWhen: (a) => a.bot_purpose === "sales" && a.industry === "realestate",
  },
  // Generic sales
  {
    id: "sales_goals",
    group: "Детали за улогата",
    question: "Што треба chatbot-от да прави при продажба?",
    type: "checkbox",
    options: [
      { value: "recommend_products", label: "Препорачај производи/услуги" },
      { value: "collect_leads", label: "Собери контакт информации (лид)" },
      { value: "answer_pricing", label: "Одговарај на прашања за цени" },
      { value: "upsell", label: "Предложи дополнителни производи/услуги" },
      { value: "schedule_demo", label: "Закажи демо/консултација" },
      { value: "redirect_human", label: "Пренасочи кон продажен тим" },
    ],
    required: true,
    showWhen: (a) => a.bot_purpose === "sales" && !["retail", "healthcare", "food", "realestate"].includes(a.industry as string),
  },

  // ── APPOINTMENTS: industry-specific ──
  {
    id: "appointment_details_healthcare",
    group: "Детали за улогата",
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
    required: true,
    showWhen: (a) => a.bot_purpose === "appointments" && a.industry === "healthcare",
  },
  {
    id: "appointment_details_beauty",
    group: "Детали за улогата",
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
    required: true,
    showWhen: (a) => a.bot_purpose === "appointments" && a.industry === "beauty",
  },
  {
    id: "appointment_details_food",
    group: "Детали за улогата",
    question: "Какви резервации закажува chatbot-от?",
    type: "checkbox",
    options: [
      { value: "table_reservation", label: "Резервација на маса" },
      { value: "private_event", label: "Приватен настан / Прослава" },
      { value: "catering_booking", label: "Нарачка за кетеринг" },
      { value: "group_booking", label: "Резервација за група" },
    ],
    required: true,
    showWhen: (a) => a.bot_purpose === "appointments" && a.industry === "food",
  },
  {
    id: "appointment_details_auto",
    group: "Детали за улогата",
    question: "Какви термини закажува chatbot-от?",
    type: "checkbox",
    options: [
      { value: "service_appointment_auto", label: "Сервисен термин" },
      { value: "test_drive", label: "Тест возење" },
      { value: "tire_change", label: "Промена на гуми" },
      { value: "inspection", label: "Технички преглед" },
      { value: "estimate", label: "Проценка на трошоци" },
    ],
    required: true,
    showWhen: (a) => a.bot_purpose === "appointments" && a.industry === "automotive",
  },
  // Generic appointments
  {
    id: "appointment_details",
    group: "Детали за улогата",
    question: "Какви термини закажува chatbot-от?",
    type: "checkbox",
    options: [
      { value: "consultation", label: "Консултација" },
      { value: "service_appointment", label: "Термин за услуга" },
      { value: "meeting", label: "Состанок" },
      { value: "reservation", label: "Резервација" },
    ],
    required: true,
    showWhen: (a) => a.bot_purpose === "appointments" && !["healthcare", "beauty", "food", "automotive"].includes(a.industry as string),
  },

  // ── INFO/FAQ: industry-specific ──
  {
    id: "info_scope_education",
    group: "Детали за улогата",
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
    required: true,
    showWhen: (a) => a.bot_purpose === "info_faq" && a.industry === "education",
  },
  {
    id: "info_scope_finance",
    group: "Детали за улогата",
    question: "За кои теми треба chatbot-от да информира?",
    type: "checkbox",
    options: [
      { value: "products_finance", label: "Финансиски производи и услуги" },
      { value: "rates_info", label: "Каматни стапки и услови" },
      { value: "apply_process", label: "Процес на аплицирање" },
      { value: "documents_needed", label: "Потребна документација" },
      { value: "branches_atm", label: "Локации на филијали/банкомати" },
      { value: "online_banking", label: "Онлајн банкарство" },
      { value: "claims_process", label: "Процес на пријава на штета" },
    ],
    required: true,
    showWhen: (a) => a.bot_purpose === "info_faq" && a.industry === "finance",
  },
  // Generic info/FAQ
  {
    id: "info_scope",
    group: "Детали за улогата",
    question: "За што треба chatbot-от да дава информации?",
    type: "checkbox",
    options: [
      { value: "company_info", label: "За компанијата (историја, мисија)" },
      { value: "products_services", label: "За производи/услуги" },
      { value: "pricing", label: "Ценовник и пакети" },
      { value: "location_hours", label: "Локација и работно време" },
      { value: "policies", label: "Политики (враќање, гаранција)" },
      { value: "careers", label: "Вработување / Кариера" },
    ],
    required: true,
    showWhen: (a) => a.bot_purpose === "info_faq" && !["education", "finance"].includes(a.industry as string),
  },

  // ── ONBOARDING (generic — works across industries) ──
  {
    id: "onboarding_scope",
    group: "Детали за улогата",
    question: "Со што треба chatbot-от да им помогне на новите корисници?",
    type: "checkbox",
    options: [
      { value: "account_setup", label: "Поставување на сметка" },
      { value: "product_tour", label: "Тур низ производот/услугата" },
      { value: "first_steps", label: "Први чекори" },
      { value: "faq", label: "Најчесто поставувани прашања" },
      { value: "documentation", label: "Упатства и документација" },
    ],
    required: true,
    showWhen: (a) => a.bot_purpose === "onboarding",
  },

  // ══════════════════════════════════════════════════════════════
  // GROUP 6: Однесување
  // ══════════════════════════════════════════════════════════════
  {
    id: "tone",
    group: "Однесување",
    question: "Каков тон треба да користи chatbot-от?",
    type: "radio",
    options: [
      { value: "professional", label: "Професионален", description: "Формален, деловен јазик" },
      { value: "friendly", label: "Пријателски", description: "Топол, но сепак професионален" },
      { value: "casual", label: "Неформален", description: "Опуштен, разговорен стил" },
      { value: "formal", label: "Многу формален", description: "Институционален, званичен" },
    ],
    required: true,
  },
  {
    id: "response_length",
    group: "Однесување",
    question: "Колку долги треба да бидат одговорите?",
    type: "radio",
    options: [
      { value: "concise", label: "Кратки и директни", description: "1-2 реченици, право на поента" },
      { value: "balanced", label: "Балансирани", description: "Доволно детали без да е предолго" },
      { value: "detailed", label: "Детални", description: "Целосни објаснувања со примери" },
    ],
    required: true,
  },
  {
    id: "unknown_answer",
    group: "Однесување",
    question: "Што да прави chatbot-от кога не го знае одговорот?",
    type: "radio",
    options: [
      { value: "admit_redirect", label: "Признај и пренасочи кон човек", description: "\"Не сум сигурен, ве поврзувам со тимот\"" },
      { value: "admit_contact", label: "Признај и остави контакт", description: "\"За ова контактирајте нè на...\"" },
      { value: "try_help", label: "Пробај да помогне", description: "Ќе даде најблизок одговор од базата на знаење" },
      { value: "collect_question", label: "Собери го прашањето", description: "\"Ќе го проследам вашето прашање до тимот\"" },
    ],
    required: true,
  },
  {
    id: "escalation_contact",
    group: "Однесување",
    question: "Наведете контакт за пренасочување.",
    subtitle: "Chatbot-от ќе ги упати клиентите на овој контакт кога не може да помогне.",
    type: "text",
    placeholder: "нпр. info@kompanija.mk / 02 3111 222",
    required: true,
    showWhen: (a) => a.unknown_answer === "admit_redirect" || a.unknown_answer === "admit_contact",
  },
  {
    id: "restricted_topics",
    group: "Однесување",
    question: "Дали chatbot-от треба да избегнува некои теми?",
    type: "checkbox",
    options: [
      { value: "no_competitors", label: "Да не споменува конкуренти" },
      { value: "no_pricing_negotiation", label: "Да не преговара за цени" },
      { value: "no_legal_advice", label: "Да не дава правни совети" },
      { value: "no_medical_advice", label: "Да не дава медицински совети" },
      { value: "no_personal_opinions", label: "Да не дава лични мислења" },
      { value: "none", label: "Нема ограничувања" },
    ],
    required: false,
  },

  // ══════════════════════════════════════════════════════════════
  // GROUP 7: Финализирај
  // ══════════════════════════════════════════════════════════════
  {
    id: "greeting_message",
    group: "Финализирај",
    question: "Каков поздрав да користи chatbot-от?",
    subtitle: "Ова е првата порака што клиентот ја гледа кога ќе го отвори чатот.",
    type: "textarea",
    placeholder: "нпр. Здраво! Како можам да ви помогнам денес?",
    required: true,
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
      if (purpose === "info_faq") {
        return `Здраво! Имате прашање за ${name}? Јас сум тука да ви помогнам со информации.`;
      }
      if (purpose === "appointments") {
        if (industry === "healthcare") return `Здраво! Дали сакате да закажете преглед кај ${name}? Ќе ви помогнам да најдете слободен термин.`;
        if (industry === "beauty") return `Здраво! Дали сакате да закажете термин кај ${name}? Кажете ми каков третман ве интересира.`;
        if (industry === "food") return `Здраво! Дали сакате да резервирате маса кај ${name}? Кажете ми за колку лица и кога.`;
        return `Здраво! Дали сакате да закажете термин кај ${name}? Јас ќе ви помогнам.`;
      }
      if (purpose === "onboarding") {
        return `Добредојдовте во ${name}! Јас ќе ви помогнам да започнете. Што сакате да дознаете прво?`;
      }
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
    required: true,
  },
];

/**
 * Returns the visible (filtered) questions for the current answer state.
 */
export function getVisibleQuestions(answers: WizardAnswers): WizardQuestion[] {
  return wizardQuestions.filter((q) => !q.showWhen || q.showWhen(answers));
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
