# Career Journey MVP - HR Passion Guy

## Tech Stack
- **Frontend/Backend**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL + Auth)
- **Payments**: Stripe
- **AI**: Claude API (Anthropic)
- **Hosting**: Vercel
- **Email**: Resend (free tier)

## Pricing Structure
1. Assessment - FREE
2. Strengths Module - $29
3. Resume Module - $150
4. Networking Module - FREE
5. Inner Vue Access - $100
**First Year Total: $497 | Annual Renewal: $218**

## Quick Start

### Prerequisites
- Node.js 18+ installed
- GitHub account
- Accounts created (do this first):
  - Supabase (supabase.com)
  - Stripe (stripe.com)
  - Vercel (vercel.com)
  - Anthropic API (console.anthropic.com)
  - Resend (resend.com)

### Setup Steps

1. **Clone and Install**
```bash
git clone <your-repo>
cd career-journey-mvp
npm install
```

2. **Environment Variables**
Create `.env.local` file:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Anthropic
ANTHROPIC_API_KEY=your_anthropic_api_key

# Resend
RESEND_API_KEY=your_resend_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **Run Database Migrations**
```bash
# Copy the SQL from database-schema.sql into Supabase SQL Editor
# Or use Supabase CLI (if installed)
supabase db push
```

4. **Run Development Server**
```bash
npm run dev
```

Visit http://localhost:3000

## Project Structure

```
/career-journey-mvp
├── /app                      # Next.js 14 App Router
│   ├── /api                  # API routes
│   │   ├── /assessment       # Save assessment results
│   │   ├── /resume-analysis  # Claude resume analysis
│   │   ├── /stripe           # Payment webhooks
│   │   └── /email            # Email notifications
│   ├── /dashboard            # User dashboard
│   ├── /assessment           # Step 1: Free assessment
│   ├── /strengths            # Step 2: $29 module
│   ├── /resume               # Step 3: $150 module
│   ├── /networking           # Step 4: Free module
│   ├── /innervue             # Step 5: $100 access
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Landing page
├── /components               # Reusable components
│   ├── /ui                   # UI primitives (buttons, cards, etc.)
│   ├── ProgressTracker.tsx   # Journey progress bar
│   ├── PaymentButton.tsx     # Stripe checkout button
│   └── ModuleCard.tsx        # Module display card
├── /lib                      # Utilities
│   ├── supabase.ts           # Supabase client
│   ├── stripe.ts             # Stripe client
│   ├── anthropic.ts          # Claude API client
│   └── email.ts              # Email helpers
├── /public                   # Static assets
├── database-schema.sql       # Supabase database schema
├── package.json
└── README.md
```

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import repo in Vercel
3. Add environment variables
4. Deploy

### Custom Domain
1. Add domain in Vercel settings
2. Update DNS records
3. Update NEXT_PUBLIC_APP_URL in env vars

## Testing Flow

1. Sign up with test email
2. Complete assessment (saves to Supabase)
3. View dashboard (see locked modules)
4. Click "Unlock Strengths" → Stripe test checkout
5. Use test card: 4242 4242 4242 4242
6. Verify module unlocks
7. Upload resume → get Claude analysis
8. Check email confirmations

## Common Issues & Fixes

**"Supabase client error"**
- Check .env.local has correct keys
- Verify Supabase URL doesn't have trailing slash

**"Stripe webhook failed"**
- Add webhook endpoint in Stripe dashboard
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

**"Claude API timeout"**
- Resume analysis takes 10-30 seconds
- Increase timeout in api/resume-analysis/route.ts

**"Email not sending"**
- Verify Resend API key
- Check "from" domain is verified in Resend

## Weekend Build Timeline

**Saturday AM (4 hrs)**
- Create all accounts (Supabase, Stripe, Vercel, etc.)
- Clone repo, install dependencies
- Set up environment variables
- Run database migrations

**Saturday PM (6 hrs)**
- Build landing page
- Build assessment flow
- Test Supabase saves

**Sunday AM (4 hrs)**
- Integrate Stripe payments
- Add Claude resume analysis
- Set up email notifications

**Sunday PM (2 hrs)**
- Deploy to Vercel
- Test live flow end-to-end
- Fix any deployment bugs

**Monday**
- Soft launch to 10 beta users
- Collect feedback

## Support
Built by Marcus R Holmes (HR Passion Guy)
Questions? marcus@hrpassionguy.com
