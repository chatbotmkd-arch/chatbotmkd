import { env } from "../config/env";

const META_BASE = `https://graph.facebook.com/${env.metaApiVersion}`;

interface MetaPage {
  id: string;
  name: string;
  access_token: string;
}

interface MetaApiResponse {
  access_token?: string;
  data?: MetaPage[];
  instagram_business_account?: { id: string };
  error?: { code: number; message: string };
  success?: boolean;
}

async function metaFetch(url: string, options?: RequestInit): Promise<MetaApiResponse> {
  const res = await fetch(url, options);
  return (await res.json()) as MetaApiResponse;
}

export class MetaService {
  /** Exchange authorization code for a short-lived user access token */
  static async exchangeCodeForToken(code: string, redirectUri: string): Promise<string> {
    const url = new URL(`${META_BASE}/oauth/access_token`);
    url.searchParams.set("client_id", env.metaAppId);
    url.searchParams.set("client_secret", env.metaAppSecret);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("code", code);

    const data = await metaFetch(url.toString());
    if (data.error) throw new Error(`Meta OAuth error: ${data.error.message}`);
    return data.access_token!;
  }

  /** Exchange short-lived token for a long-lived user access token */
  static async getLongLivedToken(shortLivedToken: string): Promise<string> {
    const url = new URL(`${META_BASE}/oauth/access_token`);
    url.searchParams.set("grant_type", "fb_exchange_token");
    url.searchParams.set("client_id", env.metaAppId);
    url.searchParams.set("client_secret", env.metaAppSecret);
    url.searchParams.set("fb_exchange_token", shortLivedToken);

    const data = await metaFetch(url.toString());
    if (data.error) throw new Error(`Meta token exchange error: ${data.error.message}`);
    return data.access_token!;
  }

  /** Get list of Facebook Pages the user manages */
  static async getUserPages(userAccessToken: string): Promise<MetaPage[]> {
    const url = new URL(`${META_BASE}/me/accounts`);
    url.searchParams.set("access_token", userAccessToken);

    const data = await metaFetch(url.toString());
    if (data.error) throw new Error(`Meta pages error: ${data.error.message}`);
    return data.data || [];
  }

  /** Get Instagram Business Account linked to a Facebook Page */
  static async getInstagramAccount(
    pageId: string,
    pageAccessToken: string
  ): Promise<string | null> {
    const url = new URL(`${META_BASE}/${pageId}`);
    url.searchParams.set("fields", "instagram_business_account");
    url.searchParams.set("access_token", pageAccessToken);

    const data = await metaFetch(url.toString());
    return data.instagram_business_account?.id || null;
  }

  /** Subscribe our app to a page's webhook events */
  static async subscribePageWebhook(pageId: string, pageAccessToken: string): Promise<void> {
    const url = new URL(`${META_BASE}/${pageId}/subscribed_apps`);
    url.searchParams.set("access_token", pageAccessToken);
    url.searchParams.set("subscribed_fields", "messages,messaging_postbacks");

    const data = await metaFetch(url.toString(), { method: "POST" });
    if (data.error) throw new Error(`Meta webhook subscribe error: ${data.error.message}`);
  }

  /** Unsubscribe our app from a page's webhook events */
  static async unsubscribePageWebhook(pageId: string, pageAccessToken: string): Promise<void> {
    const url = new URL(`${META_BASE}/${pageId}/subscribed_apps`);
    url.searchParams.set("access_token", pageAccessToken);

    const data = await metaFetch(url.toString(), { method: "DELETE" });
    if (data.error) throw new Error(`Meta webhook unsubscribe error: ${data.error.message}`);
  }

  /** Send a text message reply via Facebook Messenger */
  static async sendFacebookMessage(
    recipientPsid: string,
    text: string,
    pageAccessToken: string
  ): Promise<void> {
    const url = new URL(`${META_BASE}/me/messages`);
    url.searchParams.set("access_token", pageAccessToken);

    const data = await metaFetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: recipientPsid },
        message: { text },
      }),
    });

    if (data.error) {
      if (data.error.code === 190 || data.error.code === 200) {
        throw new MetaTokenError(data.error.message);
      }
      throw new Error(`Meta Send API error: ${data.error.message}`);
    }
  }

  /** Send a text message reply via Instagram DM */
  static async sendInstagramMessage(
    instagramAccountId: string,
    recipientId: string,
    text: string,
    pageAccessToken: string
  ): Promise<void> {
    const url = new URL(`${META_BASE}/${instagramAccountId}/messages`);
    url.searchParams.set("access_token", pageAccessToken);

    const data = await metaFetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text },
      }),
    });

    if (data.error) {
      if (data.error.code === 190 || data.error.code === 200) {
        throw new MetaTokenError(data.error.message);
      }
      throw new Error(`Instagram Send API error: ${data.error.message}`);
    }
  }
}

export class MetaTokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MetaTokenError";
  }
}
