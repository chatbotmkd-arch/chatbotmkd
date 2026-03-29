import { WizardAnswers } from "./types";
import type { ScrapedBusinessInfo } from "./UrlScanStep";

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

function getEscalationRules(answers: WizardAnswers): string {
  const behavior = answers.unknown_answer as string;
  const phone = answers.phone_number as string;
  const fallbackContact = phone || "";

  switch (behavior) {
    case "admit_contact":
      return `Кога не го знаеш одговорот, кажи му на клиентот да не контактира директно.${fallbackContact ? ` Контакт: ${fallbackContact}` : ""}`;
    case "admit_only":
      return "Кога не го знаеш одговорот, кажи му на клиентот дека немаш информација за тоа.";
    case "try_help":
      return "Кога не го знаеш точниот одговор, пробај да помогнеш со информациите што ги имаш. Биди транспарентен дека одговорот можеби не е целосен.";
    default:
      return "";
  }
}

function getRestrictions(answers: WizardAnswers): string {
  const industry = answers.industry as string;

  const restrictions: string[] = [];
  restrictions.push("- Никогаш не споменувај конкуренти и не споредувај со други компании.");
  if (industry === "healthcare") {
    restrictions.push("- Не давај медицински совети или дијагнози. За медицински прашања упати кон лекар.");
  }
  if (industry === "legal") {
    restrictions.push("- Не давај правни совети. За правни прашања упати кон адвокат.");
  }
  if (industry === "finance") {
    restrictions.push("- Не преговарај за цени, попусти или специјални понуди надвор од официјалните.");
  }

  return `\nОГРАНИЧУВАЊА:\n${restrictions.join("\n")}`;
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

function getScannedInfoSection(scannedInfo: ScrapedBusinessInfo | null | undefined): string {
  if (!scannedInfo) return "";

  const parts: string[] = [];
  if (scannedInfo.businessDescription) parts.push(scannedInfo.businessDescription);
  if (scannedInfo.phone) parts.push(`Телефон (од веб): ${scannedInfo.phone}`);
  if (scannedInfo.location) parts.push(`Локација (од веб): ${scannedInfo.location}`);
  if (scannedInfo.workingHours) parts.push(`Работно време (од веб): ${scannedInfo.workingHours}`);

  if (parts.length === 0) return "";
  return `\nДОПОЛНИТЕЛНИ ИНФОРМАЦИИ (од веб-страницата):\n${parts.join("\n")}`;
}

export function buildSystemPrompt(answers: WizardAnswers, scannedInfo?: ScrapedBusinessInfo | null): string {
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

  // Scanned info from website/Facebook
  const scannedSection = getScannedInfoSection(scannedInfo);
  if (scannedSection) sections.push(scannedSection);

  // Business info
  const infoLines: string[] = [];
  if (hours) infoLines.push(`Работно време: ${hours}`);
  if (location) infoLines.push(`Локација: ${location}`);
  if (phone) infoLines.push(`Телефон: ${phone}`);
  if (infoLines.length > 0) {
    sections.push(`\nКОНТАКТ ИНФОРМАЦИИ:\n${infoLines.join("\n")}`);
  }

  // Behavior rules
  const rules: string[] = [];
  rules.push(`- Користи ${tone} тон`);
  rules.push(`- ${responseLength}`);
  rules.push(`- ${getLanguageInstruction(answers)}`);
  const escalation = getEscalationRules(answers);
  if (escalation) rules.push(`- ${escalation}`);
  sections.push(`\nПРАВИЛА ЗА ОДНЕСУВАЊЕ:\n${rules.join("\n")}`);

  // Restrictions
  sections.push(getRestrictions(answers));

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
