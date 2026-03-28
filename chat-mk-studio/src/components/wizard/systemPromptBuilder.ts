import { WizardAnswers } from "./types";

const purposeLabels: Record<string, string> = {
  customer_support: "Корисничка поддршка",
  sales: "Продажба",
  info_faq: "Информации и FAQ",
  appointments: "Закажување термини",
  onboarding: "Onboarding",
};

const toneLabels: Record<string, string> = {
  professional: "професионален",
  friendly: "пријателски",
  casual: "неформален",
  formal: "многу формален",
};

const responseLengthInstructions: Record<string, string> = {
  concise: "Давај кратки и директни одговори од 1-2 реченици. Оди право на поента.",
  balanced: "Давај балансирани одговори со доволно детали, но без непотребно долги објаснувања.",
  detailed: "Давај детални одговори со целосни објаснувања и примери кога е потребно.",
};

// All checkbox option labels for topics
const topicLabels: Record<string, string> = {
  // Support topics — retail
  order_status: "Статус на нарачка",
  shipping_info: "Испорака и трошоци за достава",
  returns_exchange: "Враќање и замена на производи",
  product_availability: "Достапност на производи",
  pricing_discounts: "Цени, попусти и промоции",
  payment_methods: "Начини на плаќање",
  warranty: "Гаранција",
  size_guide: "Табела за големини",
  // Support topics — healthcare
  appointment_availability: "Слободни термини",
  preparation: "Подготовка за преглед/процедура",
  results: "Резултати од анализи",
  pricing_medical: "Ценовник на услуги",
  insurance_coverage: "Покриеност со осигурување",
  referral: "Упати и документација",
  medication: "Лекови и рецепти",
  emergency_info: "Итни случаи",
  // Support topics — food
  menu_info: "Мени и цени",
  delivery_time: "Време на достава",
  allergens: "Алергени и состојки",
  reservation_info: "Резервации за маси",
  catering_info: "Кетеринг за настани",
  opening_hours: "Работно време",
  special_offers: "Дневни понуди / Промоции",
  complaint: "Рекламации",
  // Support topics — beauty
  available_slots: "Слободни термини",
  treatment_info: "Детали за третмани",
  pricing_beauty: "Ценовник",
  cancel_reschedule: "Откажување / Преместување термин",
  aftercare: "Нега по третман",
  products_beauty: "Производи за продажба",
  // Generic support
  pricing: "Цени и попусти",
  product_info: "Информации за производи/услуги",
  technical: "Техничка поддршка",
  billing: "Фактурирање и плаќање",
  shipping: "Испорака",
  returns: "Враќање и рекламации",
  general: "Општи прашања",
  // Sales — retail
  recommend_products: "Препорачување производи по потреби",
  show_promotions: "Прикажување актуелни промоции",
  compare_products: "Споредба на производи",
  upsell_cross: "Предлагање дополнителни производи",
  collect_leads: "Собирање контакт информации",
  cart_recovery: "Потсетување за напуштена кошничка",
  gift_suggestions: "Предлози за подароци",
  // Sales — healthcare
  promote_services: "Промовирање услуги и пакети",
  free_consultation: "Понуда за бесплатна консултација",
  collect_patient_info: "Собирање информации за нов пациент",
  health_packages: "Здравствени пакети/програми",
  insurance_info: "Информации за покриеност со осигурување",
  // Sales — food
  daily_specials: "Промовирање дневни понуди",
  combo_meals: "Предлагање комбо мени",
  loyalty_program: "Програма за лојалност",
  catering_promo: "Промовирање кетеринг",
  new_items: "Најавување нови производи",
  upsell_drinks: "Предлагање пијалоци и десерти",
  // Sales — real estate
  property_search: "Помош во пребарување недвижности",
  schedule_viewing: "Закажување разгледување",
  collect_buyer_info: "Собирање информации за купувач",
  price_estimation: "Проценка на цена",
  mortgage_info: "Информации за хипотечни партнери",
  neighborhood_info: "Информации за локалитети",
  // Generic sales
  answer_pricing: "Одговарање на прашања за цени",
  upsell: "Предлагање дополнителни производи/услуги",
  schedule_demo: "Закажување демо/консултација",
  redirect_human: "Пренасочување кон продажен тим",
  // Appointment details — healthcare
  general_exam: "Општ преглед",
  specialist: "Специјалистички преглед",
  lab_tests: "Лабораториски анализи",
  follow_up: "Контролен преглед",
  vaccination: "Вакцинација",
  therapy: "Терапија / Физикална",
  // Appointment details — beauty
  hair_appointment: "Фризерски термин",
  nail_appointment: "Маникир / Педикир",
  facial_appointment: "Третман на лице",
  massage_appointment: "Масажа",
  full_package: "Пакет третмани",
  bridal: "Невестински пакет",
  // Appointment details — food
  table_reservation: "Резервација на маса",
  private_event: "Приватен настан / Прослава",
  catering_booking: "Нарачка за кетеринг",
  group_booking: "Резервација за група",
  // Appointment details — automotive
  service_appointment_auto: "Сервисен термин",
  test_drive: "Тест возење",
  tire_change: "Промена на гуми",
  inspection: "Технички преглед",
  estimate: "Проценка на трошоци",
  // Generic appointments
  consultation: "Консултација",
  service_appointment: "Термин за услуга",
  meeting: "Состанок",
  reservation: "Резервација",
  // Info scope — education
  courses_info: "Курсеви и програми",
  schedule_info: "Распоред и термини",
  tuition_info: "Школарина и плаќање",
  enrollment_info: "Процес на запишување",
  teachers_info: "Наставници и предавачи",
  certificates_info: "Сертификати и дипломи",
  location_facilities: "Локација и просторни услови",
  // Info scope — finance
  products_finance: "Финансиски производи и услуги",
  rates_info: "Каматни стапки и услови",
  apply_process: "Процес на аплицирање",
  documents_needed: "Потребна документација",
  branches_atm: "Локации на филијали/банкомати",
  online_banking: "Онлајн банкарство",
  claims_process: "Процес на пријава на штета",
  // Generic info
  company_info: "Информации за компанијата",
  products_services: "Информации за производи/услуги",
  location_hours: "Локација и работно време",
  policies: "Политики (враќање, гаранција)",
  careers: "Вработување / Кариера",
  // Onboarding
  account_setup: "Поставување на сметка",
  product_tour: "Тур низ производот",
  first_steps: "Први чекори",
  faq: "Најчесто поставувани прашања",
  documentation: "Упатства и документација",
};

const restrictionLabels: Record<string, string> = {
  no_competitors: "Никогаш не споменувај конкуренти и не споредувај со други компании.",
  no_pricing_negotiation: "Не преговарај за цени, попусти или специјални понуди надвор од официјалните.",
  no_legal_advice: "Не давај правни совети. За правни прашања упати кон адвокат.",
  no_medical_advice: "Не давај медицински совети или дијагнози. За медицински прашања упати кон лекар.",
  no_personal_opinions: "Не давај лични мислења. Држи се до фактите и официјалните информации.",
};

// Industry-specific labels for system prompt context
const industryLabels: Record<string, string> = {
  retail: "малопродажба/е-трговија",
  hospitality: "угостителство/хотелиерство",
  healthcare: "здравство",
  education: "образование",
  realestate: "недвижности",
  finance: "финансии/осигурување",
  beauty: "убавина/козметика",
  automotive: "автоиндустрија",
  legal: "правни услуги",
  it_services: "ИТ/технологија",
  food: "храна/ресторани",
  other: "",
};

function getRoleSection(answers: WizardAnswers): string {
  const purpose = answers.bot_purpose as string;
  const businessName = answers.business_name as string;
  const industry = answers.industry as string;

  switch (purpose) {
    case "customer_support":
      if (industry === "healthcare") return "Твоја главна задача е да им помагаш на пациентите со информации за термини, услуги и подготовка за прегледи. Биди емпатичен и прецизен. Никогаш не давај медицински совети или дијагнози — упати кон лекар.";
      if (industry === "retail") return "Твоја главна задача е да им помагаш на клиентите со нарачки, испорака, враќање на производи и информации за производи. Биди трпелив, ефикасен и решавај проблеми чекор по чекор.";
      if (industry === "food") return "Твоја главна задача е да им помагаш на гостите со менито, достава, резервации и рекламации. Биди пријателски и ефикасен.";
      if (industry === "beauty") return "Твоја главна задача е да им помагаш на клиентите со информации за третмани, термини и ценовник. Биди пријателски и професионален.";
      return "Твоја главна задача е да им помагаш на клиентите со нивните прашања и проблеми. Биди трпелив, емпатичен и ефикасен. Решавај проблеми чекор по чекор.";
    case "sales":
      if (industry === "retail") return "Твоја главна задача е да им помогнеш на клиентите да го најдат вистинскиот производ. Препорачувај врз основа на нивните потреби, прикажувај промоции и предлагај дополнителни производи. Биди убедлив но не агресивен.";
      if (industry === "realestate") return `Твоја главна задача е да им помогнеш на потенцијалните купувачи/закупци да најдат вистинска недвижност преку ${businessName}. Постави прашања за нивните потреби (локација, големина, буџет) и предложи соодветни опции.`;
      if (industry === "food") return `Твоја главна задача е да ги запознаеш гостите со менито на ${businessName}, да промовираш дневни понуди и да предложиш комбинации.`;
      if (industry === "healthcare") return `Твоја главна задача е да ги информираш потенцијалните пациенти за услугите и пакетите на ${businessName}. Помогни им да разберат што нудите и закажи консултација.`;
      return "Твоја главна задача е да им помогнеш на потенцијалните клиенти да го најдат вистинскиот производ или услуга. Биди убедлив но не агресивен. Препорачувај врз основа на потребите.";
    case "info_faq":
      return `Твоја главна задача е да даваш точни и корисни информации за ${businessName}. Одговарај прецизно и јасно. Ако информацијата не е во базата на знаење, кажи дека немаш информација за тоа.`;
    case "appointments":
      if (industry === "healthcare") return `Твоја главна задача е да им помогнеш на пациентите да закажат преглед кај ${businessName}. Собери: име, тип на преглед/услуга, претпочитан датум и време. Потврди ги деталите пред завршување.`;
      if (industry === "beauty") return `Твоја главна задача е да им помогнеш на клиентите да закажат термин кај ${businessName}. Прашај каков третман сакаат, претпочитан термин и дали имаат претпочитан мајстор.`;
      if (industry === "food") return `Твоја главна задача е да примаш резервации за ${businessName}. Прашај за: датум, време, број на гости и дали е специјална прилика.`;
      if (industry === "automotive") return `Твоја главна задача е да закажуваш сервисни термини и тест возења кај ${businessName}. Прашај за тип на возило, каков сервис е потребен и претпочитан датум.`;
      return `Твоја главна задача е да им помогнеш на клиентите да закажат термин кај ${businessName}. Собери ги потребните информации и потврди ги деталите.`;
    case "onboarding":
      return `Твоја главна задача е да ги водиш новите корисници низ процесот на запознавање со ${businessName}. Биди водич, објаснувај чекор по чекор. Прилагоди се на темпото на корисникот.`;
    default:
      return "Помагај им на корисниците со нивните прашања и потреби.";
  }
}

function getTopicSection(answers: WizardAnswers): string {
  const purpose = answers.bot_purpose as string;
  const industry = answers.industry as string;

  // Find the right topics based on purpose × industry combination
  let topics: string[] = [];

  switch (purpose) {
    case "customer_support":
      if (industry === "retail") topics = (answers.support_topics_retail as string[]) || [];
      else if (industry === "healthcare") topics = (answers.support_topics_healthcare as string[]) || [];
      else if (industry === "food") topics = (answers.support_topics_food as string[]) || [];
      else if (industry === "beauty") topics = (answers.support_topics_beauty as string[]) || [];
      else topics = (answers.support_topics as string[]) || [];
      break;
    case "sales":
      if (industry === "retail") topics = (answers.sales_goals_retail as string[]) || [];
      else if (industry === "healthcare") topics = (answers.sales_goals_healthcare as string[]) || [];
      else if (industry === "food") topics = (answers.sales_goals_food as string[]) || [];
      else if (industry === "realestate") topics = (answers.sales_goals_realestate as string[]) || [];
      else topics = (answers.sales_goals as string[]) || [];
      break;
    case "appointments":
      if (industry === "healthcare") topics = (answers.appointment_details_healthcare as string[]) || [];
      else if (industry === "beauty") topics = (answers.appointment_details_beauty as string[]) || [];
      else if (industry === "food") topics = (answers.appointment_details_food as string[]) || [];
      else if (industry === "automotive") topics = (answers.appointment_details_auto as string[]) || [];
      else topics = (answers.appointment_details as string[]) || [];
      break;
    case "info_faq":
      if (industry === "education") topics = (answers.info_scope_education as string[]) || [];
      else if (industry === "finance") topics = (answers.info_scope_finance as string[]) || [];
      else topics = (answers.info_scope as string[]) || [];
      break;
    case "onboarding":
      topics = (answers.onboarding_scope as string[]) || [];
      break;
  }

  if (topics.length === 0) return "";

  const lines = topics.map((t) => `- ${topicLabels[t] || t}`).join("\n");
  return `\nТЕМИ ШТО ГИ ПОКРИВАШ:\n${lines}`;
}

function getIndustryDetails(answers: WizardAnswers): string {
  const industry = answers.industry as string;
  const sections: string[] = [];

  // Industry-specific details gathered from the wizard
  if (industry === "retail") {
    const categories = (answers.product_categories as string[]) || [];
    const shippingOpts = (answers.shipping_options as string[]) || [];
    const returnPolicy = answers.return_policy as string;
    if (categories.length > 0) {
      const catLabels: Record<string, string> = {
        clothing: "Облека и обувки", electronics: "Електроника", furniture: "Мебел",
        food_products: "Прехранбени производи", cosmetics: "Козметика", sports: "Спорт",
        kids: "Детски производи", other_products: "Друго",
      };
      sections.push(`Категории: ${categories.map(c => catLabels[c] || c).join(", ")}`);
    }
    if (shippingOpts.length > 0) {
      const shipLabels: Record<string, string> = {
        free_shipping: "бесплатна испорака", express: "експрес достава",
        standard: "стандардна достава", pickup: "подигање во продавница",
        no_shipping: "без испорака",
      };
      sections.push(`Испорака: ${shippingOpts.map(s => shipLabels[s] || s).join(", ")}`);
    }
    if (returnPolicy) {
      const retLabels: Record<string, string> = {
        flexible: "Флексибилна политика за враќање (30+ дена)",
        standard_return: "Стандардна политика (14 дена со сметка)",
        strict: "Само за неисправни производи",
        no_returns: "Финална продажба — без враќање",
      };
      sections.push(`Враќање: ${retLabels[returnPolicy] || returnPolicy}`);
    }
  }

  if (industry === "healthcare") {
    const specs = (answers.specializations as string[]) || [];
    const insurance = answers.insurance_accepted as string;
    const emergency = answers.emergency_protocol as string;
    if (specs.length > 0) {
      const specLabels: Record<string, string> = {
        general: "Општа медицина", pediatrics: "Педијатрија", dermatology: "Дерматологија",
        dentistry: "Стоматологија", ophthalmology: "Офталмологија", gynecology: "Гинекологија",
        cardiology: "Кардиологија", orthopedics: "Ортопедија", lab: "Лабораторија",
        pharmacy: "Аптека", other_medical: "Друго",
      };
      sections.push(`Специјализации: ${specs.map(s => specLabels[s] || s).join(", ")}`);
    }
    if (insurance) {
      const insLabels: Record<string, string> = {
        fzo: "Примаме ФЗО (државно осигурување) со упат",
        private_insurance: "Примаме приватно осигурување",
        both: "Примаме и државно и приватно осигурување",
        no_insurance: "Само приватно плаќање",
      };
      sections.push(insLabels[insurance] || "");
    }
    if (emergency) {
      const emLabels: Record<string, string> = {
        yes_emergency: "Имаме итна служба 24/7",
        on_call: "Дежурен телефон надвор од работно време",
        no_emergency: "Работиме само во работно време",
      };
      sections.push(emLabels[emergency] || "");
    }
  }

  if (industry === "beauty") {
    const treatments = (answers.treatment_types as string[]) || [];
    const booking = answers.booking_method as string;
    const cancel = answers.cancellation_policy as string;
    if (treatments.length > 0) {
      const tLabels: Record<string, string> = {
        haircut: "Шишање", coloring: "Фарбање", manicure: "Маникир/Педикир",
        facial: "Третман на лице", massage: "Масажа", waxing: "Депилација",
        lashes: "Трепки/Веѓи", makeup: "Шминка", body_treatment: "Третман на тело",
      };
      sections.push(`Третмани: ${treatments.map(t => tLabels[t] || t).join(", ")}`);
    }
    if (booking) {
      const bLabels: Record<string, string> = {
        phone_booking: "Закажување телефонски",
        online_booking: "Онлајн букинг систем",
        walk_in: "Без закажување",
        mixed_booking: "Комбинирано (телефон + онлајн + walk-in)",
      };
      sections.push(`Закажување: ${bLabels[booking] || booking}`);
    }
    if (cancel) {
      const cLabels: Record<string, string> = {
        flexible_cancel: "Откажување е можно во секое време",
        "24h_cancel": "Откажување најмалку 24 часа однапред",
        "48h_cancel": "Откажување најмалку 48 часа однапред",
        no_cancel: "Без откажување — плаќање однапред",
      };
      sections.push(`Откажување: ${cLabels[cancel] || cancel}`);
    }
  }

  if (industry === "food") {
    const menu = (answers.menu_type as string[]) || [];
    const delivery = (answers.delivery_options as string[]) || [];
    const reserv = answers.reservation_support as string;
    if (menu.length > 0) {
      const mLabels: Record<string, string> = {
        pizza: "Пица", burgers: "Бургери/Сендвичи", traditional: "Традиционална кујна",
        international: "Интернационална кујна", desserts: "Десерти", coffee: "Кафе/Пијалоци",
        vegan: "Веган/Вегетаријанско", bakery: "Пекара",
      };
      sections.push(`Мени: ${menu.map(m => mLabels[m] || m).join(", ")}`);
    }
    if (delivery.length > 0) {
      const dLabels: Record<string, string> = {
        own_delivery: "Сопствена достава", glovo: "Glovo/Wolt", takeout: "За понесување",
        dine_in: "Јадење во ресторан", catering: "Кетеринг",
      };
      sections.push(`Достава: ${delivery.map(d => dLabels[d] || d).join(", ")}`);
    }
    if (reserv) {
      const rLabels: Record<string, string> = {
        yes_reservation: "Примаме резервации (телефон + онлајн)",
        phone_only_res: "Резервации само телефонски",
        no_reservation: "Без резервации",
      };
      sections.push(rLabels[reserv] || "");
    }
  }

  if (industry === "hospitality") {
    const rooms = (answers.room_types as string[]) || [];
    const amenitiesList = (answers.amenities as string[]) || [];
    if (rooms.length > 0) {
      const roomLabels: Record<string, string> = {
        single_room: "Еднокреветна", double_room: "Двокреветна", suite: "Suite/Апартман",
        apartment: "Апартман за издавање", villa: "Вила", hostel: "Хостел",
      };
      sections.push(`Сместување: ${rooms.map(r => roomLabels[r] || r).join(", ")}`);
    }
    if (amenitiesList.length > 0) {
      const amLabels: Record<string, string> = {
        wifi: "WiFi", parking: "Паркинг", restaurant: "Ресторан", pool: "Базен",
        spa: "Спа", gym: "Фитнес", breakfast: "Појадок", transfer: "Трансфер",
      };
      sections.push(`Погодности: ${amenitiesList.map(a => amLabels[a] || a).join(", ")}`);
    }
    const channels = (answers.booking_channels as string[]) || [];
    if (channels.length > 0) {
      const chLabels: Record<string, string> = {
        direct_booking: "Директно", website_booking: "Веб-сајт", booking_com: "Booking.com",
        airbnb: "Airbnb", tripadvisor: "TripAdvisor",
      };
      sections.push(`Букинг канали: ${channels.map(c => chLabels[c] || c).join(", ")}`);
    }
  }

  if (industry === "finance") {
    const services = (answers.financial_services as string[]) || [];
    const disclaimer = answers.regulatory_note as string;
    if (services.length > 0) {
      const fLabels: Record<string, string> = {
        banking: "Банкарство", loans: "Кредити", life_insurance: "Животно осигурување",
        property_insurance: "Имотно осигурување", car_insurance: "Авто осигурување",
        investment: "Инвестиции", accounting: "Сметководство", tax_consulting: "Даночно советување",
      };
      sections.push(`Услуги: ${services.map(s => fLabels[s] || s).join(", ")}`);
    }
    if (disclaimer === "yes_disclaimer") {
      sections.push("ВАЖНО: Секогаш напомени дека информациите не претставуваат финансиски совет и дека клиентот треба да се консултира со стручно лице.");
    } else if (disclaimer === "when_relevant") {
      sections.push("Кога зборуваш за финансиски производи, напомени дека ова не е финансиски совет.");
    }
  }

  if (industry === "legal") {
    const areas = (answers.practice_areas as string[]) || [];
    const consult = answers.consultation_type as string;
    if (areas.length > 0) {
      const lLabels: Record<string, string> = {
        corporate: "Корпоративно право", criminal: "Кривично право", family: "Семејно право",
        property_law: "Имотно право", labor: "Работни односи", tax_law: "Даночно право",
        notary: "Нотарски услуги", immigration: "Имиграција",
      };
      sections.push(`Области: ${areas.map(a => lLabels[a] || a).join(", ")}`);
    }
    if (consult === "free_initial") {
      sections.push("Прва консултација е БЕСПЛАТНА — информирај ги клиентите за ова.");
    }
  }

  if (industry === "automotive") {
    const services = (answers.service_types_auto as string[]) || [];
    const brands = answers.brands_carried as string;
    if (services.length > 0) {
      const aLabels: Record<string, string> = {
        new_cars: "Нови автомобили", used_cars: "Половни автомобили",
        service_repair: "Сервис и поправки", parts: "Авто делови",
        tires: "Гуми", car_wash: "Перење", insurance_auto: "Осигурување",
        rent_a_car: "Рент-а-кар",
      };
      sections.push(`Услуги: ${services.map(s => aLabels[s] || s).join(", ")}`);
    }
    if (brands) {
      sections.push(`Брендови: ${brands}`);
    }
  }

  if (industry === "education") {
    const programs = (answers.program_types as string[]) || [];
    const enrollment = answers.enrollment_process as string;
    if (programs.length > 0) {
      const pLabels: Record<string, string> = {
        languages: "Јазици", it_courses: "ИТ/Програмирање", business_courses: "Бизнис",
        arts: "Уметност/Музика", tutoring: "Приватни часови", professional: "Сертификати",
        kids_programs: "За деца", online_courses: "Онлајн курсеви",
      };
      sections.push(`Програми: ${programs.map(p => pLabels[p] || p).join(", ")}`);
    }
    if (enrollment) {
      const eLabels: Record<string, string> = {
        online_enrollment: "Целосно онлајн запишување",
        in_person: "Запишување лично",
        hybrid_enrollment: "Пријава онлајн, документи лично",
        open_enrollment: "Слободен пристап без формална пријава",
      };
      sections.push(`Запишување: ${eLabels[enrollment] || enrollment}`);
    }
  }

  if (industry === "it_services") {
    const model = answers.it_service_model as string;
    const stack = (answers.tech_stack as string[]) || [];
    if (model) {
      const mLabels: Record<string, string> = {
        saas: "SaaS — софтвер како услуга",
        agency: "Агенција / Проектни услуги",
        consulting: "ИТ консалтинг",
        product: "Продукт компанија",
      };
      sections.push(`Модел: ${mLabels[model] || model}`);
    }
    if (stack.length > 0) {
      const sLabels: Record<string, string> = {
        web_dev: "Веб развој", mobile_dev: "Мобилен развој", design_ui: "Дизајн/UI/UX",
        seo_marketing: "SEO/Маркетинг", cloud_hosting: "Cloud/Хостинг",
        cybersecurity: "Сајбер безбедност", data_analytics: "Аналитика",
        support_maintenance: "Поддршка и одржување",
      };
      sections.push(`Услуги: ${stack.map(s => sLabels[s] || s).join(", ")}`);
    }
  }

  if (industry === "realestate") {
    const types = (answers.property_types as string[]) || [];
    const areas = answers.service_areas as string;
    if (types.length > 0) {
      const ptLabels: Record<string, string> = {
        apartments_sale: "Станови за продажба", apartments_rent: "Станови за издавање",
        houses: "Куќи", commercial: "Деловен простор", land: "Земјиште",
        new_construction: "Новоградба",
      };
      sections.push(`Типови: ${types.map(t => ptLabels[t] || t).join(", ")}`);
    }
    if (areas) {
      sections.push(`Региони: ${areas}`);
    }
  }

  // Generic "other" industry
  if (industry === "other") {
    const products = answers.products_services_other as string;
    if (products) {
      sections.push(products);
    }
  }

  if (sections.length === 0) return "";
  return `\nДЕТАЛИ ЗА БИЗНИСОТ:\n${sections.join("\n")}`;
}

function getEscalationRules(answers: WizardAnswers): string {
  const behavior = answers.unknown_answer as string;
  const phone = answers.phone_number as string;
  const fallbackContact = phone || "";

  switch (behavior) {
    case "admit_redirect":
      return `Кога не го знаеш одговорот, кажи му на клиентот дека ќе го поврзеш со тимот.${fallbackContact ? ` Контакт: ${fallbackContact}` : ""}`;
    case "admit_contact":
      return `Кога не го знаеш одговорот, кажи му на клиентот да не контактира директно.${fallbackContact ? ` Контакт: ${fallbackContact}` : ""}`;
    case "try_help":
      return "Кога не го знаеш точниот одговор, пробај да помогнеш со информациите што ги имаш. Биди транспарентен дека одговорот можеби не е целосен.";
    case "collect_question":
      return "Кога не го знаеш одговорот, кажи му на клиентот дека ќе го проследиш прашањето до тимот и дека ќе добие одговор.";
    default:
      return "";
  }
}

function getRestrictions(answers: WizardAnswers): string {
  const restrictions = (answers.restricted_topics as string[]) || [];
  const industry = answers.industry as string;

  // If user explicitly set restrictions, use those
  if (restrictions.length > 0 && !restrictions.includes("none")) {
    const lines = restrictions
      .filter((r) => r !== "none")
      .map((r) => `- ${restrictionLabels[r] || r}`)
      .join("\n");
    return `\nОГРАНИЧУВАЊА:\n${lines}`;
  }

  // Smart defaults based on industry
  const autoRestrictions: string[] = [];
  autoRestrictions.push("- Никогаш не споменувај конкуренти и не споредувај со други компании.");
  if (industry === "healthcare") {
    autoRestrictions.push("- Не давај медицински совети или дијагнози. За медицински прашања упати кон лекар.");
  }
  if (industry === "legal") {
    autoRestrictions.push("- Не давај правни совети. За правни прашања упати кон адвокат.");
  }
  if (industry === "finance") {
    autoRestrictions.push("- Не преговарај за цени, попусти или специјални понуди надвор од официјалните.");
  }

  return `\nОГРАНИЧУВАЊА:\n${autoRestrictions.join("\n")}`;
}

function getLanguageInstruction(answers: WizardAnswers): string {
  const lang = answers.language as string;
  switch (lang) {
    case "mk":
      return "Одговарај СЕКОГАШ на македонски јазик.";
    case "mk_en":
      return "Одговарај на јазикот на кој ти пишува клиентот (македонски или англиски).";
    case "en":
      return "Always respond in English.";
    case "sq":
      return "Përgjigju GJITHMONË në gjuhën shqipe.";
    default:
      return "Одговарај на македонски јазик.";
  }
}

export function buildSystemPrompt(answers: WizardAnswers): string {
  const businessName = (answers.business_name as string) || "нашиот бизнис";
  const description = (answers.business_description as string) || "";
  const hours = answers.working_hours as string;
  const location = answers.location_info as string;
  const phone = answers.phone_number as string;
  const industry = answers.industry as string;
  const tone = toneLabels[answers.tone as string] || "пријателски";
  const responseLength = responseLengthInstructions[answers.response_length as string] || responseLengthInstructions.balanced;

  const sections: string[] = [];

  // Identity
  const industryLabel = industryLabels[industry] || "";
  const industryContext = industryLabel ? ` во областа на ${industryLabel}` : "";
  const identityParts = [`Ти си AI асистент на ${businessName}${industryContext}.`];
  if (description) identityParts.push(description);
  sections.push(identityParts.join(" "));

  // Unique value / trust
  const uniqueValue = answers.unique_value as string;
  const customerTrust = answers.customer_trust as string;
  if (uniqueValue || customerTrust) {
    const storyParts: string[] = [];
    if (uniqueValue) storyParts.push(uniqueValue);
    if (customerTrust) storyParts.push(customerTrust);
    sections.push(`\nШТО НЕ ИЗДВОЈУВА:\n${storyParts.join("\n")}`);
  }

  // Role
  sections.push(`\nТВОЈА УЛОГА:\n${getRoleSection(answers)}`);

  // Industry-specific details
  const industryDetails = getIndustryDetails(answers);
  if (industryDetails) sections.push(industryDetails);

  // Business info
  const infoLines: string[] = [];
  if (hours) infoLines.push(`Работно време: ${hours}`);
  if (location) infoLines.push(`Локација: ${location}`);
  if (phone) infoLines.push(`Телефон: ${phone}`);
  if (infoLines.length > 0) {
    sections.push(`\nКОНТАКТ ИНФОРМАЦИИ:\n${infoLines.join("\n")}`);
  }

  // Topics
  const topicSection = getTopicSection(answers);
  if (topicSection) sections.push(topicSection);

  // Behavior rules
  const rules: string[] = [];
  rules.push(`- Користи ${tone} тон`);
  rules.push(`- ${responseLength}`);
  rules.push(`- ${getLanguageInstruction(answers)}`);
  rules.push(`- ${getEscalationRules(answers)}`);
  sections.push(`\nПРАВИЛА ЗА ОДНЕСУВАЊЕ:\n${rules.join("\n")}`);

  // Restrictions
  const restrictions = getRestrictions(answers);
  if (restrictions) sections.push(restrictions);

  // Custom personality
  const customPersonality = answers.custom_personality as string;
  if (customPersonality) {
    sections.push(`\nЛИЧНОСТ НА CHATBOT-ОТ:\n${customPersonality}`);
  }

  // Custom instructions
  const customInstructions = answers.custom_instructions as string;
  if (customInstructions) {
    sections.push(`\nСПЕЦИЈАЛНИ ИНСТРУКЦИИ:\n${customInstructions}`);
  }

  // Custom FAQ
  const customFaq = answers.custom_faq as string;
  if (customFaq) {
    sections.push(`\nЧЕСТИ ПРАШАЊА И ОДГОВОРИ:\n${customFaq}`);
  }

  // Universal rules
  sections.push(`\nВАЖНО:
- Одговарај САМО врз основа на дадените информации и базата на знаење.
- Не измислувај информации, цени, или достапност.
- Ако не си сигурен, подобро кажи дека не знаеш отколку да дадеш погрешен одговор.
- Биди љубезен и почитувај го клиентот во секоја ситуација.`);

  return sections.join("\n");
}

export function buildConfig(answers: WizardAnswers) {
  const purpose = answers.bot_purpose as string;
  const responseLength = (answers.response_length as string) || "balanced";
  const lang = (answers.language as string) || "mk";

  // Temperature mapping
  let temperature = 0.5;
  if (purpose === "customer_support" || purpose === "appointments") {
    temperature = responseLength === "detailed" ? 0.5 : 0.3;
  } else if (purpose === "sales") {
    temperature = 0.6;
  } else if (purpose === "info_faq") {
    temperature = responseLength === "detailed" ? 0.5 : 0.3;
  } else if (responseLength === "detailed") {
    temperature = 0.7;
  }

  return {
    config: {
      model: "gpt-4o-mini",
      systemPrompt: buildSystemPrompt(answers),
      language: lang === "mk_en" ? "mk" : lang,
      tone: (answers.tone as string) || "friendly",
      temperature,
    },
    appearance: {
      greeting: (answers.greeting_message as string) || "Здраво! Како можам да ви помогнам денес?",
      placeholder: "Напишете порака...",
      primaryColor: "#8b5cf6",
      position: "bottom-right",
    },
  };
}
