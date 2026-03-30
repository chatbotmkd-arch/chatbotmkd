const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN;

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
    const body = req.body;

    if (body?.object === "page" && body.entry) {
      for (const entry of body.entry) {
        for (const event of entry.messaging || []) {
          const senderPsid = event.sender?.id;
          const messageText = event.message?.text;

          if (senderPsid && messageText) {
            console.log(`[Webhook] From ${senderPsid}: ${messageText}`);
            await sendReply(senderPsid, "Hello! This is my chatbot 🚀");
          }
        }
      }
    }

    res.status(200).send("EVENT_RECEIVED");
    return;
  }

  res.status(405).send("Method Not Allowed");
}
