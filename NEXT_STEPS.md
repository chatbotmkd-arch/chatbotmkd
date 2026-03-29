# ChatBot MK — Next Steps

## Phase 1 — Billing & Limits System

### 1.1 Backend: Plan & Trial Schema Updates ✅
- [x] **`config/constants.ts`** — Added `TRIAL_DAYS = 8`, `GRACE_DAYS = 8` as top-level exports; removed `trialDays` from individual plan objects
- [x] **`models/Team.ts`** — Added `trialEndsAt: Date` and `graceEndsAt: Date | null` to schema and interface
- [x] **Auth registration** — Sets `trialEndsAt = now + TRIAL_DAYS` on team creation; `/me` and register responses include `trialEndsAt` and `graceEndsAt`

### 1.2 Backend: Limit Enforcement ✅
- [x] **`utils/planLimits.ts`** — Updated with `LimitStatus` type (`ok | trial_expired | grace_expired | limit_reached`), `LimitCheckResult` interface with `status`, `trialEndsAt`, `graceEndsAt`, `daysLeft`. Free plan checks trial/grace active before message limit. Paid plans only check monthly message count.
- [x] **`controllers/chatController.ts`** — `sendMessage`, `playgroundMessage` use status-aware error messages. `getUsage` returns full `LimitCheckResult` + `planName`.
- [x] **`websocket/index.ts`** — Status-aware error messages with `TRIAL_EXPIRED` or `LIMIT_REACHED` codes.
- [x] **Upgrade flow** — `invoiceController.ts` sets `team.graceEndsAt = now + GRACE_DAYS` when user creates a ProformaInvoice.

### 1.3 Frontend: Limit-Hit UI ✅
- [x] **`auth.tsx`** — Team interface includes `trialEndsAt` and `graceEndsAt`; `PLAN_LIMITS` updated to match backend (30/300/500)
- [x] **`Dashboard.tsx`** — `UsageData` includes `status`, `daysLeft`, `trialEndsAt`, `graceEndsAt`. Three banner types: trial countdown (yellow, ≤3 days), trial/grace expired (red), limit reached (red). Plan card shows days remaining.

## Phase 2 — Admin Dashboard ✅

### 2.1 Backend: Admin API ✅
- [x] **`config/env.ts`** — Added `adminEmails` from `ADMIN_EMAILS` env variable (comma-separated)
- [x] **`middleware/auth.ts`** — Added `requireSuperAdmin` middleware (checks user email against `ADMIN_EMAILS`)
- [x] **`routes/admin.ts`** + **`controllers/adminController.ts`**:
  - `GET /api/admin/stats` — totalTeams, paidTeams, totalChatbots, messagesToday, pendingInvoices
  - `GET /api/admin/users` — All teams enriched with owner, usage, trial/grace status
  - `PATCH /api/admin/teams/:teamId/plan` — Change plan, update Team + User + Subscription
  - `POST /api/admin/teams/:teamId/extend-grace` — Extend grace period by N days
  - `GET /api/admin/invoices` — All invoices with team/owner info
  - `PATCH /api/admin/invoices/:invoiceId/mark-paid` — Mark paid, activate plan, set subscription period

### 2.2 Frontend: Admin Page ✅
- [x] **`pages/AdminDashboard.tsx`** — Stats cards, users table (plan badge, trial/grace status, usage bar, plan dropdown, extend grace), invoices table (mark as paid), access-denied screen
- [x] **`App.tsx`** — Added `/admin` route

## Phase 3 — Email Service ✅

- [x] Installed `resend` package
- [x] **`config/env.ts`** — Added `resendApiKey` and `emailFrom`
- [x] **`services/EmailService.ts`** — 4 email templates (Macedonian HTML):
  - `sendWelcomeEmail(to, name)` — Welcome + next steps
  - `sendInvoiceEmail(to, invoiceData)` — Pro-forma with bank details table + payment reference
  - `sendTrialExpiringEmail(to, name, daysLeft)` — Trial expiring warning
  - `sendPlanActivatedEmail(to, name, planName, periodEnd)` — Plan activated confirmation
- [x] Hooked into: registration (`authController`), invoice creation (`invoiceController`), admin mark-paid (`adminController`)
- [ ] Cron job for `sendTrialExpiringEmail` (day 6 of trial) — deferred to Phase 5

## Phase 4 — Production Deployment

### External Services (Martin)
- [ ] MongoDB Atlas — Create cluster, get connection string
- [ ] Domain — Buy/configure (e.g. chatbotmkd.mk)
  - Frontend: `chatbotmkd.mk` → Vercel
  - Backend: `api.chatbotmkd.mk` → Railway
- [ ] Resend — Sign up, verify domain, get API key
- [ ] OpenAI — Confirm billing is active

### Code Changes ✅
- [x] Frontend: `localhost:3001` is already behind `VITE_API_BASE_URL` env var (fallback only for local dev)
- [x] Backend: `npm run build && npm start` works cleanly (`tsc` → `node dist/server.js`)
- [x] Backend: No unused deps (`ioredis`, `bullmq`, `multer` already removed)

### Environment Variables

**Railway (backend):**
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<64-char random>
JWT_REFRESH_SECRET=<64-char random>
DATABASE_ENCRYPTION_KEY=<32-char random>
OPENAI_API_KEY=sk-...
CORS_ORIGIN=https://chatbotmkd.mk
APP_URL=https://api.chatbotmkd.mk
RESEND_API_KEY=re_...
EMAIL_FROM=ChatBot MK <noreply@chatbotmkd.mk>
META_WEBHOOK_VERIFY_TOKEN=<random>
META_APP_ID=<if using>
META_APP_SECRET=<if using>
ADMIN_EMAILS=your@email.com
```

**Vercel (frontend):**
```
VITE_API_BASE_URL=https://api.chatbotmkd.mk/api
VITE_WS_URL=wss://api.chatbotmkd.mk
```

### Deploy & Verify
- [ ] Deploy backend to Railway
- [ ] Deploy frontend to Vercel
- [ ] Configure custom domains
- [ ] Test full flow: register → create chatbot → test widget → hit limit → upgrade → admin activates

## Phase 5 — Post-Launch

- [ ] Meta/WhatsApp webhook URLs → point to production domain
- [ ] Error tracking (Sentry)
- [ ] MongoDB Atlas backups
- [ ] Cron job: send trial-expiring emails (day 6 of trial)
- [ ] Cron job: reset monthly conversation counts (or just query by date range)
- [ ] File uploads (S3 + document processing) — when needed
