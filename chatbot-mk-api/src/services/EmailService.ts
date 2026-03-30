import { Resend } from "resend";
import { env } from "../config/env";
import { BANK_DETAILS, PLAN_LIMITS, PlanType } from "../config/constants";

const resend = env.resendApiKey ? new Resend(env.resendApiKey) : null;

function canSend(): boolean {
  if (!resend) {
    console.warn("EmailService: RESEND_API_KEY not set, skipping email");
    return false;
  }
  return true;
}

async function send(to: string, subject: string, html: string) {
  if (!canSend()) return;
  try {
    await resend!.emails.send({
      from: env.emailFrom,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("EmailService send error:", err);
  }
}

// ── Templates ─────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name: string) {
  await send(to, "Добредојдовте во NexaAI!", `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
      <h2 style="color: #8b5cf6;">Добредојдовте, ${name}!</h2>
      <p>Ви благодариме што се регистриравте на <strong>NexaAI</strong>.</p>
      <p>Имате <strong>8 дена бесплатен пробен период</strong> и <strong>30 бесплатни пораки</strong> за да го тестирате вашиот AI chatbot.</p>
      <h3>Следни чекори:</h3>
      <ol>
        <li>Создадете го вашиот прв chatbot</li>
        <li>Додајте информации за вашиот бизнис</li>
        <li>Тестирајте го во Playground</li>
        <li>Додајте го на вашата веб-страница</li>
      </ol>
      <p>
        <a href="${env.appUrl.replace('/api', '').replace('api.', '')}" style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Отвори Dashboard
        </a>
      </p>
      <p style="color: #888; font-size: 13px; margin-top: 32px;">
        Ако имате прашања, одговорете на овој email или пишете ни на нашата страница.
      </p>
    </div>
  `);
}

export async function sendInvoiceEmail(
  to: string,
  invoice: {
    invoiceNumber: string;
    paymentReference: string;
    plan: number;
    period: string;
    amount: number;
    companyName: string;
  }
) {
  const planName = PLAN_LIMITS[invoice.plan as PlanType]?.name || "Стартер";
  const periodLabel = invoice.period === "annual" ? "годишно" : "месечно";

  await send(to, `Про-фактура ${invoice.invoiceNumber} — NexaAI`, `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
      <h2 style="color: #8b5cf6;">Про-фактура ${invoice.invoiceNumber}</h2>
      <p>Ви благодариме за надградбата на <strong>${planName}</strong> план (${periodLabel}).</p>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background: #f5f3ff;">
          <td style="padding: 10px; font-weight: bold;">План</td>
          <td style="padding: 10px;">${planName} (${periodLabel})</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold;">Износ</td>
          <td style="padding: 10px; font-size: 18px; font-weight: bold;">${invoice.amount.toLocaleString()} МКД</td>
        </tr>
        <tr style="background: #f5f3ff;">
          <td style="padding: 10px; font-weight: bold;">Компанија</td>
          <td style="padding: 10px;">${invoice.companyName}</td>
        </tr>
      </table>

      <h3>Банкарски детали за уплата:</h3>
      <table style="width: 100%; border-collapse: collapse; margin: 10px 0; border: 1px solid #e5e7eb;">
        <tr>
          <td style="padding: 8px 10px; font-weight: bold; border-bottom: 1px solid #e5e7eb;">Банка</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb;">${BANK_DETAILS.bankName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 10px; font-weight: bold; border-bottom: 1px solid #e5e7eb;">Примач</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb;">${BANK_DETAILS.accountHolder}</td>
        </tr>
        <tr>
          <td style="padding: 8px 10px; font-weight: bold; border-bottom: 1px solid #e5e7eb;">IBAN</td>
          <td style="padding: 8px 10px; font-family: monospace; border-bottom: 1px solid #e5e7eb;">${BANK_DETAILS.iban}</td>
        </tr>
        <tr>
          <td style="padding: 8px 10px; font-weight: bold; border-bottom: 1px solid #e5e7eb;">SWIFT</td>
          <td style="padding: 8px 10px; font-family: monospace; border-bottom: 1px solid #e5e7eb;">${BANK_DETAILS.swift}</td>
        </tr>
        <tr>
          <td style="padding: 8px 10px; font-weight: bold;">Повикување на број</td>
          <td style="padding: 8px 10px; font-family: monospace; font-size: 16px; font-weight: bold; color: #8b5cf6;">${invoice.paymentReference}</td>
        </tr>
      </table>

      <p style="background: #fef3c7; padding: 12px; border-radius: 8px; font-size: 13px;">
        <strong>Важно:</strong> При уплатата задолжително внесете го повикувањето на број <strong>${invoice.paymentReference}</strong> за побрза обработка.
      </p>

      <p style="color: #888; font-size: 13px; margin-top: 24px;">
        По уплатата, вашиот план ќе биде активиран во рок од 24 часа.
      </p>
    </div>
  `);
}

export async function sendTrialExpiringEmail(to: string, name: string, daysLeft: number) {
  await send(to, `Вашиот пробен период истекува за ${daysLeft} ${daysLeft === 1 ? "ден" : "дена"}`, `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
      <h2 style="color: #f59e0b;">Здраво ${name},</h2>
      <p>Вашиот бесплатен пробен период на <strong>NexaAI</strong> истекува за <strong>${daysLeft} ${daysLeft === 1 ? "ден" : "дена"}</strong>.</p>
      <p>По истекувањето, вашиот chatbot нема да одговара на пораки додека не надградите на платен план.</p>
      <p>
        <a href="${env.appUrl.replace('/api', '').replace('api.', '')}/dashboard/upgrade" style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Надградете сега
        </a>
      </p>
      <p style="font-size: 13px; color: #888;">
        Плановите започнуваат од само 700 МКД/месец.
      </p>
    </div>
  `);
}

export async function sendPlanActivatedEmail(to: string, name: string, planName: string, periodEnd: Date) {
  const formattedDate = periodEnd.toLocaleDateString("mk-MK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  await send(to, `Вашиот ${planName} план е активиран!`, `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
      <h2 style="color: #22c55e;">Планот е активиран!</h2>
      <p>Здраво ${name},</p>
      <p>Вашиот <strong>${planName}</strong> план на NexaAI е успешно активиран.</p>
      <p>Активен до: <strong>${formattedDate}</strong></p>
      <p>
        <a href="${env.appUrl.replace('/api', '').replace('api.', '')}/dashboard" style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Отвори Dashboard
        </a>
      </p>
      <p style="color: #888; font-size: 13px; margin-top: 24px;">
        Ви благодариме за довербата!
      </p>
    </div>
  `);
}
