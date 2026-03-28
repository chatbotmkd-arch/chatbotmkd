import { Response } from "express";
import { AuthRequest } from "../types";
import { ScrapeService } from "../services/ScrapeService";

export async function scrapeBusinessUrl(req: AuthRequest, res: Response) {
  const { url } = req.body;

  if (!url || typeof url !== "string") {
    res.status(400).json({ error: "URL е задолжителен" });
    return;
  }

  // Basic URL validation
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    res.status(400).json({ error: "Невалиден URL формат" });
    return;
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    res.status(400).json({ error: "Само HTTP/HTTPS линкови се дозволени" });
    return;
  }

  // Block private/internal IPs
  const hostname = parsed.hostname;
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("10.") ||
    hostname.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname) ||
    hostname === "metadata.google.internal" ||
    hostname === "169.254.169.254"
  ) {
    res.status(400).json({ error: "Невалиден URL" });
    return;
  }

  try {
    let result;

    if (ScrapeService.isFacebookUrl(url)) {
      result = await ScrapeService.scrapeFacebookPage(url);
    } else {
      result = await ScrapeService.scrapeWebsite(url);
    }

    res.json(result);
  } catch (err: any) {
    console.error("Scrape error:", err.message, err.code, err.response?.status, err.response?.data);

    // Provide user-friendly error messages
    if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
      res.status(400).json({ error: "Не можев да пристапам до веб-страницата. Проверете го линкот." });
      return;
    }
    if (err.response?.status === 403 || err.response?.status === 401) {
      res.status(400).json({ error: "Веб-страницата не дозволува пристап. Пробајте со друг линк." });
      return;
    }
    if (err.code === "ECONNABORTED") {
      res.status(400).json({ error: "Веб-страницата е премногу бавна. Пробајте повторно." });
      return;
    }
    if (err.message?.includes("Request failed with status")) {
      res.status(400).json({ error: `Страницата врати грешка. Проверете дали линкот е точен.` });
      return;
    }
    if (err.message?.includes("Invalid URL") || err.code === "ERR_INVALID_URL") {
      res.status(400).json({ error: "Невалиден формат на линкот." });
      return;
    }

    res.status(500).json({ error: "Грешка при анализа на страницата. Пробајте повторно или прескокнете го овој чекор." });
  }
}
