# ChatBot MK — Production Launch Plan

## Phase 1 — External Services Setup (Martin)

- [ ] **MongoDB Atlas** — Create cluster (M0 free or M10 production), get connection string
- [ ] **Resend** — Sign up at resend.com, verify domain, get API key
- [ ] **Railway** — Create project, connect chatbot-mk-api GitHub repo
- [ ] **OpenAI** — Confirm billing is active, note API key
- [ ] **Domain** — Buy/configure domain (e.g. chatbotmk.mk)
  - Frontend: `chatbotmk.mk` → Vercel
  - Backend: `api.chatbotmk.mk` → Railway

## Phase 2 — Code Changes (Claude)

### 2.1 Frontend: Environment-based API URL
- [ ] Replace hardcoded `localhost:3001` in `src/lib/api.ts` with `import.meta.env.VITE_API_BASE_URL`
- [ ] Add WebSocket URL from `import.meta.env.VITE_WS_URL` (for ChatbotPage playground if using WS)
- [ ] Create `.env.example` with `VITE_API_BASE_URL` and `VITE_WS_URL`

### 2.2 Backend: Resend Email Service
- [ ] Install `resend` package
- [ ] Add `RESEND_API_KEY` and `EMAIL_FROM` to `env.ts`
- [ ] Create `src/services/EmailService.ts` with:
  - `sendInvoiceEmail(to, invoiceData)` — pro-forma invoice with payment instructions & reference number
  - `sendWelcomeEmail(to, name)` — registration confirmation
- [ ] Hook `sendInvoiceEmail` into `invoiceController.ts` → `createInvoice`
- [ ] Hook `sendWelcomeEmail` into `authController.ts` → `register`

### 2.3 Backend: Cleanup Unused Dependencies
- [ ] Remove `ioredis`, `bullmq`, `multer` from package.json (not used anywhere)
- [ ] Remove `REDIS_URL` from `env.ts`
- [ ] Run `npm install` to clean lockfile

### 2.4 Backend: Production Build Config
- [ ] Verify `npm run build && npm start` works cleanly
- [ ] Add `Dockerfile` (or confirm Railway nixpacks auto-detects Node)

## Phase 3 — Environment Variables

### Railway (backend)
```
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<generate 64-char random>
JWT_REFRESH_SECRET=<generate 64-char random>
DATABASE_ENCRYPTION_KEY=<generate 32-char random>
OPENAI_API_KEY=sk-...
CORS_ORIGIN=https://chatbotmk.mk
APP_URL=https://api.chatbotmk.mk
RESEND_API_KEY=re_...
EMAIL_FROM=ChatBot MK <noreply@chatbotmk.mk>
META_WEBHOOK_VERIFY_TOKEN=<generate random>
META_APP_ID=<if using Meta integration>
META_APP_SECRET=<if using Meta integration>
```

### Vercel (frontend)
```
VITE_API_BASE_URL=https://api.chatbotmk.mk/api
VITE_WS_URL=wss://api.chatbotmk.mk
```

## Phase 4 — Deploy & Verify

- [ ] Deploy backend to Railway
- [ ] Verify `https://api.chatbotmk.mk/api/health` returns `{ status: "ok" }`
- [ ] Deploy frontend to Vercel
- [ ] Configure custom domains on both Vercel and Railway
- [ ] **Test full flow:**
  1. Register new account
  2. Check welcome email arrives
  3. Create chatbot → add text source → test in playground
  4. Generate pro-forma invoice → check email arrives with payment details
  5. Manually approve plan upgrade in MongoDB → verify dashboard reflects new plan
  6. Test widget embed on external page
  7. Test message limits (send 20 messages on free plan → verify block)

## Phase 5 — Post-Launch

- [ ] Meta/WhatsApp webhook URLs → point to production domain
- [ ] Error tracking (Sentry or similar)
- [ ] MongoDB Atlas backups (automated on paid tier)
- [ ] File uploads (S3 + document processing) — add when needed
- [ ] BullMQ + Redis — add when website scraping / async jobs are needed
