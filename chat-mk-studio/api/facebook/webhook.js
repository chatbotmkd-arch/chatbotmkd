import crypto from "crypto";

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN;
const APP_SECRET = process.env.FACEBOOK_APP_SECRET;

/**
 * Verify X-Hub-Signature-256 header from Meta.
 * Returns true if valid or if APP_SECRET is not configured (dev mode).
 */
function verifySignature(req) {
  if (!APP_SECRET) return true; // skip in dev if not configured

  const signature = req.headers["x-hub-signature-256"];
  if (!signature) return false;

  const body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
  const expected =
    "sha256=" +
    crypto.createHmac("sha256", APP_SECRET).update(body).digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

async function sendReply(senderPsid, text) {
  const url = `https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: senderPsid },
      message: { text },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error(`[Webhook] Send failed for ${senderPsid}:`, data.error?.message);
  }
  return data;
}

export default async function handler(req, res) {
  // --- GET: Meta verification ---
  if (req.method === "GET") {
    if (!VERIFY_TOKEN) {
      res.status(500).send("Server misconfigured");
      return;
    }

    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      res.status(200).send(challenge);
      return;
    }

    res.status(403).send("Forbidden");
    return;
  }

  // --- POST: Incoming messages ---
  if (req.method === "POST") {
    // Verify request signature from Meta
    if (!verifySignature(req)) {
      console.error("[Webhook] Invalid X-Hub-Signature-256");
      res.status(403).send("Invalid signature");
      return;
    }

    const body = req.body;

    if (body?.object === "page" && body.entry) {
      for (const entry of body.entry) {
        for (const event of entry.messaging || []) {
          const senderPsid = event.sender?.id;
          const messageText = event.message?.text;

          if (senderPsid && messageText) {
            console.log(`[Webhook] From ${senderPsid}: ${messageText}`);

            const userMessage = messageText.toLowerCase();
            let reply = "Thanks for reaching out! I'll respond shortly.";

            if (userMessage.includes("hello") || userMessage.includes("hi")) {
              reply = "Hey! 👋 How can I help you today?";
            } else if (userMessage.includes("what")) {
              reply = "I'm an AI chatbot that automatically replies to messages.";
            } else if (userMessage.includes("price") || userMessage.includes("cost")) {
              reply = "Pricing depends on the plan. Let me know what you need!";
            }

            await sendReply(senderPsid, reply);
          }
        }
      }
    }

    res.status(200).send("EVENT_RECEIVED");
    return;
  }

  res.status(405).send("Method Not Allowed");
}
