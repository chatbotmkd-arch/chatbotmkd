export default function handler(req, res) {
  const VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN;

  if (!VERIFY_TOKEN) {
    console.error("[Webhook] FACEBOOK_VERIFY_TOKEN not configured");
    res.status(500).send("Server misconfigured");
    return;
  }

  if (req.method === "GET") {
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

  if (req.method === "POST") {
    const body = req.body;

    if (body?.entry) {
      for (const entry of body.entry) {
        const messaging = entry.messaging || [];
        for (const event of messaging) {
          const senderId = event.sender?.id;
          const messageText = event.message?.text;
          if (senderId && messageText) {
            console.log(`[Webhook] Message received from ${senderId}`);
          }
        }
      }
    }

    res.status(200).send("EVENT_RECEIVED");
    return;
  }

  res.status(405).send("Method Not Allowed");
}
