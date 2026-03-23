import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

/**
 * Validate that route params matching common ID patterns are valid MongoDB ObjectIds.
 */
export function validateObjectIds(...paramNames: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    for (const name of paramNames) {
      const value = req.params[name];
      if (value && (typeof value !== "string" || !mongoose.Types.ObjectId.isValid(value))) {
        res.status(400).json({ error: `Invalid ${name} format` });
        return;
      }
    }
    next();
  };
}

/**
 * Validate message content length to prevent abuse.
 */
export function validateMessageLength(maxLength = 5000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const content = req.body?.message || req.body?.content;
    if (typeof content === "string" && content.length > maxLength) {
      res.status(400).json({ error: `Message too long. Maximum ${maxLength} characters.` });
      return;
    }
    next();
  };
}

/**
 * Validate URL to prevent SSRF — only allow http/https with public hostnames.
 */
export function validateUrl(fieldName = "url") {
  return (req: Request, res: Response, next: NextFunction): void => {
    const url = req.body?.[fieldName];
    if (!url) {
      next();
      return;
    }

    try {
      const parsed = new URL(url);

      // Only allow http and https
      if (!["http:", "https:"].includes(parsed.protocol)) {
        res.status(400).json({ error: "Only HTTP and HTTPS URLs are allowed" });
        return;
      }

      // Block private/internal IPs and hostnames
      const hostname = parsed.hostname.toLowerCase();
      const blocked = [
        "localhost",
        "127.0.0.1",
        "0.0.0.0",
        "::1",
        "[::1]",
        "metadata.google.internal",
        "169.254.169.254", // AWS/GCP metadata
      ];

      if (blocked.includes(hostname) || hostname.endsWith(".local") || hostname.endsWith(".internal")) {
        res.status(400).json({ error: "Internal URLs are not allowed" });
        return;
      }

      // Block private IP ranges (10.x, 172.16-31.x, 192.168.x)
      const parts = hostname.split(".").map(Number);
      if (parts.length === 4 && parts.every((p) => !isNaN(p))) {
        if (
          parts[0] === 10 ||
          (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
          (parts[0] === 192 && parts[1] === 168)
        ) {
          res.status(400).json({ error: "Internal URLs are not allowed" });
          return;
        }
      }
    } catch {
      res.status(400).json({ error: "Invalid URL format" });
      return;
    }

    next();
  };
}

/**
 * Sanitize MongoDB query operators from request body to prevent NoSQL injection.
 * Strips keys starting with $ from nested objects.
 */
export function sanitizeMongoQuery(req: Request, _res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === "object") {
    req.body = stripDollarKeys(req.body);
  }
  if (req.query && typeof req.query === "object") {
    // query params are strings, but sanitize anyway
    for (const key of Object.keys(req.query)) {
      if (key.startsWith("$")) {
        delete req.query[key];
      }
    }
  }
  next();
}

function stripDollarKeys(obj: any): any {
  if (Array.isArray(obj)) return obj.map(stripDollarKeys);
  if (obj && typeof obj === "object") {
    const clean: any = {};
    for (const [key, val] of Object.entries(obj)) {
      if (!key.startsWith("$")) {
        clean[key] = stripDollarKeys(val);
      }
    }
    return clean;
  }
  return obj;
}
