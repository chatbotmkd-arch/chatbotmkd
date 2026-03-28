import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { scrapeBusinessUrl } from "../controllers/scrapeController";

const router = Router();

// POST /api/scrape — scrape a business URL and extract info
router.post("/", authenticate, scrapeBusinessUrl);

export default router;
