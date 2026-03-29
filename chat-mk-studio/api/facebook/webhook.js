const VERIFY_TOKEN = "VerifyToken123";

export default function handler(req, res) {
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    console.log("[Webhook Verify]", { mode, token, challenge });

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("[Webhook Verify] SUCCESS");
      res.status(200).send(challenge);
      return;
    }

    console.log("[Webhook Verify] FAILED — token mismatch or bad mode");
    res.status(403).send("Forbidden");
    return;
  }

  if (req.method === "POST") {
    const body = req.body;
    console.log("[Webhook POST]", JSON.stringify(body, null, 2));

    // Extract messages if present
    if (body?.entry) {
      for (const entry of body.entry) {
        const messaging = entry.messaging || [];
        for (const event of messaging) {
          const senderId = event.sender?.id;
          const messageText = event.message?.text;
          if (senderId && messageText) {
            console.log(`[Message] From ${senderId}: ${messageText}`);
          }
        }
      }
    }

    res.status(200).send("EVENT_RECEIVED");
    return;
  }

  res.status(405).send("Method Not Allowed");
}
