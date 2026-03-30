export const TRIAL_DAYS = 8;
export const GRACE_DAYS = 8;

export const PLAN_LIMITS = {
  0: {
    name: "Бесплатен",
    maxChatbots: 1,
    maxMessages: 30, // lifetime credits
    maxSources: 2,
    maxFileSize: 2 * 1024 * 1024, // 2 MB
  },
  1: {
    name: "Стартер",
    maxChatbots: 3,
    maxMessages: 300, // credits per month
    maxSources: 10,
    maxFileSize: 10 * 1024 * 1024,
  },
  2: {
    name: "Про",
    maxChatbots: 10,
    maxMessages: 500, // credits per month
    maxSources: 50,
    maxFileSize: 50 * 1024 * 1024,
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS; // 0 | 1 | 2

export const PLAN_PRICING = {
  1: { monthly: 700, annual: 6000 },
  2: { monthly: 1200, annual: 12000 },
} as const;

export const BANK_DETAILS = {
  bankName: "Стопанска Банка АД Скопје",
  accountHolder: "NexaAI ДООЕЛ Скопје",
  iban: "MK07300000000000000", // TODO: replace with real IBAN
  swift: "STOBMK2X",
  purpose: "Про-фактура",
} as const;
