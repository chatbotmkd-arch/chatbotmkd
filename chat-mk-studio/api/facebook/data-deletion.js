import crypto from "crypto";

const APP_SECRET = process.env.FACEBOOK_APP_SECRET;

/**
 * Facebook Data Deletion Callback
 *
 * Meta requires this endpoint so users can request deletion of their data.
 * When a user removes the app from their Facebook settings, Meta sends a
 * signed POST request here. We return a confirmation code and a status URL.
 *
 * Configure this URL in Facebook App → Settings → Data Deletion Callback:
 *   https://<your-domain>/api/facebook/data-deletion
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  // Verify the signed request from Meta
  const signedRequest = req.body?.signed_request;
  if (!signedRequest) {
    res.status(400).json({ error: "Missing signed_request" });
    return;
  }

  const data = parseSignedRequest(signedRequest);
  if (!data) {
    res.status(403).json({ error: "Invalid signature" });
    return;
  }

  const userId = data.user_id;
  const confirmationCode = crypto.randomUUID();

  console.log(`[Data Deletion] Request from user ${userId}, code: ${confirmationCode}`);

  // Meta expects this exact JSON shape
  res.status(200).json({
    url: `https://ai.nexa.mk/deletion-status?code=${confirmationCode}`,
    confirmation_code: confirmationCode,
  });
}

/**
 * Parse and verify a Facebook signed_request.
 * Returns the payload if valid, null otherwise.
 */
function parseSignedRequest(signedRequest) {
  if (!APP_SECRET) {
    console.error("[Data Deletion] FACEBOOK_APP_SECRET not configured");
    return null;
  }

  const [encodedSig, payload] = signedRequest.split(".", 2);
  if (!encodedSig || !payload) return null;

  const sig = base64UrlDecode(encodedSig);
  const expectedSig = crypto
    .createHmac("sha256", APP_SECRET)
    .update(payload)
    .digest();

  if (!crypto.timingSafeEqual(sig, expectedSig)) {
    console.error("[Data Deletion] Signature mismatch");
    return null;
  }

  return JSON.parse(base64UrlDecode(payload).toString("utf8"));
}

function base64UrlDecode(str) {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(padded, "base64");
}
