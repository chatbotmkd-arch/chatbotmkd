# ChatBot MK — Next Steps

## Phase 1 — Billing & Limits System

### 1.1 Backend: Plan & Trial Schema Updates
- [ ] **`config/constants.ts`** — Redefine plans:
  - Free (0): 20 messages lifetime, 8-day trial, 1 chatbot
  - Стартер (1): 200 conversations/month, 3 chatbots
  - Про (2): 500 conversations/month, 10 chatbots
  - Add `trialDays: 8`, `graceDays: 8`
- [ ] **`models/Team.ts`** — Add fields:
  - `trialEndsAt: Date` (set on signup = createdAt + 8 days)
  - `graceEndsAt: Date | null` (set when user requests upgrade = now + 8 days)
- [ ] **Auth registration** — Set `trialEndsAt` on team creation

### 1.2 Backend: Limit Enforcement
- [ ] **`utils/planLimits.ts`** — Update logic:
  - Free plan: check both message count (20 lifetime) AND trial expiration (8 days)
  - Paid plans: count **conversations per month** (not messages) — `Conversation.countDocuments({ chatbotId: { $in: ... }, createdAt: { $gte: monthStart } })`
  - Grace period: if `plan === 0` and `graceEndsAt > now`, allow continued use
  - Return distinct error types: `trial_expired`, `messages_exhausted`, `conversations_exhausted`
- [ ] **`controllers/chatController.ts`** — Use new limit check in `sendMessage`, `playgroundMessage`, and WebSocket handler
- [ ] **Upgrade flow** — When user creates ProformaInvoice, set `team.graceEndsAt = now + 8 days`

### 1.3 Frontend: Limit-Hit UI
- [ ] Distinguish between trial expired vs. message/conversation limit
- [ ] Show banner/modal with clear CTA to upgrade page
- [ ] Upgrade page triggers grace period on invoice creation

## Phase 2 — Admin Dashboard

### 2.1 Backend: Admin API
- [ ] **`middleware/auth.ts`** — Add `requireSuperAdmin` middleware (check against hardcoded admin email or `superadmin` role)
- [ ] **`routes/admin.ts`** + **`controllers/adminController.ts`**:
  - `GET /api/admin/users` — List all teams with: owner name, email, plan, trial status, usage (messages/conversations), chatbot count, created date
  - `PATCH /api/admin/teams/:teamId/plan` — Change plan (0/1/2), set subscription period (monthly/annual), update Team + User + Subscription in one call
  - `POST /api/admin/teams/:teamId/extend-grace` — Extend grace period by N days
  - `PATCH /api/admin/invoices/:invoiceId/mark-paid` — Mark invoice as paid, activate plan, set `currentPeriodEnd` (now + 1mo or 12mo)
  - `GET /api/admin/stats` — Total users, active subscriptions, revenue, messages today

### 2.2 Frontend: Admin Page
- [ ] **`pages/AdminDashboard.tsx`** — Protected by superadmin role
  - Users table: name, email, plan badge, trial/grace status, usage bar, created date
  - Row actions: Change plan dropdown, extend grace, view invoices
  - Invoice management: list pending invoices, one-click "Mark as Paid" with plan + period selector
  - Basic stats cards at top (total users, active paid, messages today)
- [ ] **`App.tsx`** — Add `/admin` route

## Phase 3 — Email Service

- [ ] Install `resend` package
- [ ] Add `RESEND_API_KEY` and `EMAIL_FROM` to `env.ts`
- [ ] Create `src/services/EmailService.ts`:
  - `sendWelcomeEmail(to, name)` — Registration confirmation
  - `sendInvoiceEmail(to, invoiceData)` — Pro-forma invoice with bank details & payment reference
  - `sendTrialExpiringEmail(to, name, daysLeft)` — Reminder before trial ends
  - `sendPlanActivatedEmail(to, name, plan, periodEnd)` — Confirmation after admin activates plan
- [ ] Hook into registration, invoice creation, and admin plan activation

## Phase 4 — Production Deployment

### External Services (Martin)
- [ ] MongoDB Atlas — Create cluster, get connection string
- [ ] Domain — Buy/configure (e.g. chatbotmkd.mk)
  - Frontend: `chatbotmkd.mk` → Vercel
  - Backend: `api.chatbotmkd.mk` → Railway
- [ ] Resend — Sign up, verify domain, get API key
- [ ] OpenAI — Confirm billing is active

### Code Changes
- [ ] Frontend: Replace hardcoded `localhost:3001` with `import.meta.env.VITE_API_BASE_URL` (partially done)
- [ ] Backend: Verify `npm run build && npm start` works cleanly
- [ ] Backend: Remove unused deps (`ioredis`, `bullmq`, `multer`) and `REDIS_URL` from env

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
