import axios from "axios";
import * as cheerio from "cheerio";
import OpenAI from "openai";
import { env } from "../config/env";

const openai = new OpenAI({ apiKey: env.openaiApiKey });

const MAX_TEXT_LENGTH = 8000; // chars to send to OpenAI

export interface ScrapedBusinessInfo {
  businessName?: string;
  industry?: string;
  businessDescription?: string;
  phone?: string;
  location?: string;
  workingHours?: string;
  tone?: string;
  suggestedPurpose?: string;
  suggestedGreeting?: string;
}

export class ScrapeService {
  /**
   * Fetch a URL and extract business information using cheerio + OpenAI.
   */
  static async scrapeWebsite(url: string): Promise<ScrapedBusinessInfo> {
    const html = await this.fetchPage(url);
    const extracted = this.extractFromHtml(html, url);
    const businessInfo = await this.analyzeWithAI(extracted);
    return businessInfo;
  }

  /**
   * Fetch a Facebook page's public info via Graph API.
   */
  static async scrapeFacebookPage(pageIdOrUrl: string): Promise<ScrapedBusinessInfo> {
    const pageId = this.extractFacebookPageId(pageIdOrUrl);

    // Try fetching public page info (works for pages with public data)
    const fields = "name,about,description,single_line_address,phone,hours,category,category_list,website";
    const graphUrl = `https://graph.facebook.com/${env.metaApiVersion}/${pageId}?fields=${fields}&access_token=${env.metaAppId}|${env.metaAppSecret}`;

    const res = await axios.get(graphUrl, { timeout: 10000 });
    const data = res.data;

    // Map Facebook category to our industry
    const industry = this.mapFacebookCategory(data.category || "", data.category_list || []);

    // Format working hours from Facebook format
    const workingHours = data.hours ? this.formatFacebookHours(data.hours) : undefined;

    const info: ScrapedBusinessInfo = {
      businessName: data.name,
      industry,
      businessDescription: data.about || data.description,
      phone: data.phone,
      location: data.single_line_address,
      workingHours,
      tone: "friendly",
      suggestedPurpose: "customer_support",
    };

    // If we also have a website, scrape it for richer data
    if (data.website) {
      try {
        const websiteInfo = await this.scrapeWebsite(data.website);
        // Merge: Facebook data takes priority for structured fields, website for descriptions
        return {
          ...websiteInfo,
          ...info,
          businessDescription: info.businessDescription || websiteInfo.businessDescription,
        };
      } catch {
        // Website scrape failed — use Facebook data alone
      }
    }

    return info;
  }

  private static async fetchPage(url: string): Promise<string> {
    const res = await axios.get(url, {
      timeout: 15000,
      maxRedirects: 5,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ChatBotMK/1.0; +https://chatbotmk.mk)",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "mk,en;q=0.9",
      },
      // Only accept text responses, limit size
      maxContentLength: 5 * 1024 * 1024, // 5MB max
      responseType: "text",
    });

    return res.data;
  }

  private static extractFromHtml(
    html: string,
    url: string
  ): { text: string; meta: Record<string, string> } {
    const $ = cheerio.load(html);

    // Extract meta information
    const meta: Record<string, string> = {
      url,
      title: $("title").text().trim(),
      description: $('meta[name="description"]').attr("content") || "",
      ogTitle: $('meta[property="og:title"]').attr("content") || "",
      ogDescription: $('meta[property="og:description"]').attr("content") || "",
      ogSiteName: $('meta[property="og:site_name"]').attr("content") || "",
    };

    // Extract structured data (JSON-LD)
    const jsonLd: string[] = [];
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const raw = $(el).html();
        if (raw) jsonLd.push(raw);
      } catch {
        // skip malformed JSON-LD
      }
    });

    // Remove non-content elements
    $("script, style, noscript, iframe, svg, nav, footer, header").remove();
    $('[role="navigation"], [role="banner"], [role="contentinfo"]').remove();
    $(".cookie-banner, .cookie-notice, #cookie-consent").remove();

    // Get visible text
    const bodyText = $("body").text().replace(/\s+/g, " ").trim();

    // Build a structured text for AI analysis
    const parts: string[] = [];
    if (meta.title) parts.push(`Page title: ${meta.title}`);
    if (meta.ogSiteName) parts.push(`Site name: ${meta.ogSiteName}`);
    if (meta.description) parts.push(`Meta description: ${meta.description}`);
    if (meta.ogDescription && meta.ogDescription !== meta.description) {
      parts.push(`OG description: ${meta.ogDescription}`);
    }
    if (jsonLd.length > 0) {
      parts.push(`Structured data (JSON-LD): ${jsonLd.join("\n").slice(0, 2000)}`);
    }
    parts.push(`\nPage content:\n${bodyText.slice(0, MAX_TEXT_LENGTH - parts.join("\n").length)}`);

    return { text: parts.join("\n").slice(0, MAX_TEXT_LENGTH), meta };
  }

  private static async analyzeWithAI(extracted: {
    text: string;
    meta: Record<string, string>;
  }): Promise<ScrapedBusinessInfo> {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are analyzing a business website to extract key information. Return a JSON object with these fields (use null for anything you can't determine):

{
  "businessName": "the business/company name",
  "industry": "one of: retail, hospitality, healthcare, education, realestate, finance, beauty, automotive, legal, it_services, food, other",
  "businessDescription": "2-3 sentence description of the business in Macedonian language. Describe what they do, what they offer.",
  "phone": "phone number if found",
  "location": "address or city if found",
  "workingHours": "working hours if found (format: e.g. 'Пон-Пет 09:00-17:00, Саб 10:00-14:00')",
  "tone": "one of: professional, friendly, casual, formal — based on how the website communicates",
  "suggestedPurpose": "one of: customer_support, sales, info_faq, appointments — what would be the most useful chatbot purpose for this business",
  "suggestedGreeting": "a short greeting message in Macedonian that this chatbot could use, e.g. 'Здраво! Добредојдовте на [бизнис]. Како можам да ви помогнам?'"
}

Important:
- Write the businessDescription and suggestedGreeting in Macedonian.
- Be accurate — only include information you can actually find on the page.
- For industry, pick the closest match from the list.`,
        },
        {
          role: "user",
          content: `Analyze this website and extract business information:\n\nURL: ${extracted.meta.url}\n\n${extracted.text}`,
        },
      ],
    });

    const content = completion.choices[0].message.content || "{}";
    try {
      const parsed = JSON.parse(content);
      return {
        businessName: parsed.businessName || undefined,
        industry: parsed.industry || undefined,
        businessDescription: parsed.businessDescription || undefined,
        phone: parsed.phone || undefined,
        location: parsed.location || undefined,
        workingHours: parsed.workingHours || undefined,
        tone: parsed.tone || undefined,
        suggestedPurpose: parsed.suggestedPurpose || undefined,
        suggestedGreeting: parsed.suggestedGreeting || undefined,
      };
    } catch {
      return {};
    }
  }

  static isFacebookUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return (
        parsed.hostname === "facebook.com" ||
        parsed.hostname === "www.facebook.com" ||
        parsed.hostname === "m.facebook.com" ||
        parsed.hostname === "fb.com"
      );
    } catch {
      return false;
    }
  }

  private static extractFacebookPageId(input: string): string {
    // If it's a URL, extract the page identifier
    try {
      const url = new URL(input);
      // https://www.facebook.com/PageName or /PageName/
      const pathname = url.pathname.replace(/^\/+|\/+$/g, "");
      // Remove "profile.php?id=" format
      if (pathname === "profile.php") {
        return url.searchParams.get("id") || input;
      }
      // Remove /pages/ prefix if present
      const cleaned = pathname.replace(/^pages\//, "").split("/")[0];
      return cleaned || input;
    } catch {
      // Not a URL — treat as page ID directly
      return input;
    }
  }

  private static mapFacebookCategory(
    category: string,
    categoryList: Array<{ name: string }>
  ): string {
    const allCategories = [category, ...categoryList.map((c) => c.name)]
      .join(" ")
      .toLowerCase();

    if (/restaurant|food|cafe|bakery|pizza|bar|pub|catering/i.test(allCategories)) return "food";
    if (/hotel|hostel|resort|travel|accommodation/i.test(allCategories)) return "hospitality";
    if (/doctor|clinic|hospital|medical|dental|pharmacy|health/i.test(allCategories)) return "healthcare";
    if (/salon|spa|beauty|hair|nail|cosmetic/i.test(allCategories)) return "beauty";
    if (/school|university|education|training|course|tutor/i.test(allCategories)) return "education";
    if (/real estate|property|недвижн/i.test(allCategories)) return "realestate";
    if (/bank|insurance|financ|accounting/i.test(allCategories)) return "finance";
    if (/law|legal|attorney|lawyer|notary|адвокат/i.test(allCategories)) return "legal";
    if (/car|auto|motor|garage|tire|возил/i.test(allCategories)) return "automotive";
    if (/software|tech|IT|web|digital|develop/i.test(allCategories)) return "it_services";
    if (/shop|store|retail|e-commerce|продавница/i.test(allCategories)) return "retail";
    return "other";
  }

  private static formatFacebookHours(hours: Record<string, string>): string {
    // Facebook hours format: { "mon_1_open": "09:00", "mon_1_close": "17:00", ... }
    const dayMap: Record<string, string> = {
      mon: "Пон",
      tue: "Вто",
      wed: "Сре",
      thu: "Чет",
      fri: "Пет",
      sat: "Саб",
      sun: "Нед",
    };

    const dayHours: Record<string, string> = {};
    for (const [key, value] of Object.entries(hours)) {
      const match = key.match(/^(mon|tue|wed|thu|fri|sat|sun)_\d+_(open|close)$/);
      if (!match) continue;
      const day = match[1];
      const type = match[2];
      if (!dayHours[day]) dayHours[day] = "";
      if (type === "open") dayHours[day] = value + "-" + (dayHours[day] || "");
      if (type === "close") dayHours[day] = (dayHours[day] || "-") + value;
    }

    const parts: string[] = [];
    for (const [day, hrs] of Object.entries(dayHours)) {
      if (hrs && dayMap[day]) {
        parts.push(`${dayMap[day]} ${hrs}`);
      }
    }

    return parts.join(", ") || "";
  }
}
