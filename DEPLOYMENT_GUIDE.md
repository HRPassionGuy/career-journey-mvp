# WEEKEND DEPLOYMENT GUIDE
## Get Your Career Journey App Live in 48 Hours

---

## SATURDAY MORNING (9am - 11am) - SETUP ACCOUNTS

### Step 1: Create Supabase Project (20 min)

1. Go to https://supabase.com
2. Click "Start your project" → Sign up with GitHub
3. Click "New Project"
   - Name: `career-journey-prod`
   - Database Password: (Generate strong password - SAVE THIS!)
   - Region: Choose closest to Detroit (US East)
4. Wait 2-3 minutes for project to provision
5. **SAVE THESE** (Settings → API):
   ```
   Project URL: https://xxxxx.supabase.co
   anon public key: eyJhbGci...
   service_role secret: eyJhbGci... (click "Reveal" to see it)
   ```

### Step 2: Create Stripe Account (15 min)

1. Go to https://stripe.com
2. Sign up → Business info:
   - Business name: HR Passion LLC
   - Type: Individual/Sole proprietor
   - Industry: Professional services
3. Complete verification (may take 1-2 days for full approval, but test mode works immediately)
4. Go to **Developers → API Keys**
5. **SAVE THESE**:
   ```
   Publishable key: pk_test_...
   Secret key: sk_test_... (click "Reveal secret key")
   ```
6. **Enable Test Mode** toggle in top right (you'll switch to live mode after testing)

### Step 3: Get Anthropic API Key (5 min)

1. You already have this! Go to https://console.anthropic.com
2. Settings → API Keys → Create Key
3. **SAVE THIS**:
   ```
   API Key: sk-ant-...
   ```
4. Add $20 credit to your account (Settings → Billing)

### Step 4: Create Resend Account (10 min)

1. Go to https://resend.com
2. Sign up with email
3. **Add your domain** (hrpassionguy.com):
   - API Keys → Domains → Add Domain
   - Enter: hrpassionguy.com
   - Copy the DNS records shown
4. **Add DNS records** (in your domain registrar - GoDaddy/Namecheap/etc):
   - Add TXT record: `resend._domainkey`
   - Add MX record as shown
   - Wait 5-10 minutes for verification
5. Once verified, create API key:
   - API Keys → Create API Key
   - **SAVE THIS**: `re_...`

### Step 5: Create GitHub Account (if needed) (5 min)

1. Go to https://github.com
2. Sign up (or sign in)
3. Create new repository:
   - Name: `career-journey-mvp`
   - Private repository
   - Don't initialize with README
4. **SAVE THIS**: Your repo URL `https://github.com/YOUR_USERNAME/career-journey-mvp`

### Step 6: Create Vercel Account (5 min)

1. Go to https://vercel.com
2. Sign up with GitHub (connects automatically)
3. That's it! You'll use this later to deploy

---

## SATURDAY AFTERNOON (2pm - 5pm) - UPLOAD & DEPLOY

### Step 7: Download Code from Claude (5 min)

1. In this chat, tell me: "Package everything for download"
2. I'll create a ZIP file with all code
3. Download and extract to your computer

### Step 8: Upload to GitHub (15 min)

**Option A: GitHub Desktop (Easiest)**
1. Download GitHub Desktop: https://desktop.github.com
2. File → Add Local Repository → Choose extracted folder
3. Publish repository → Select `career-journey-mvp`
4. Commit & Push

**Option B: Command Line**
```bash
cd /path/to/extracted/folder
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/career-journey-mvp.git
git push -u origin main
```

**Option C: GitHub Website (Drag & Drop)**
1. Go to your repo: `github.com/YOUR_USERNAME/career-journey-mvp`
2. Click "uploading an existing file"
3. Drag all files from extracted folder
4. Commit changes

### Step 9: Deploy to Vercel (20 min)

1. Go to https://vercel.com
2. Click "Add New..." → Project
3. Import your GitHub repository `career-journey-mvp`
4. **Add Environment Variables** (CRITICAL):
   
   Click "Environment Variables" and add these one by one:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
   
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=(leave blank for now)
   
   ANTHROPIC_API_KEY=sk-ant-...
   
   RESEND_API_KEY=re_...
   
   NEXT_PUBLIC_APP_URL=https://career-journey-mvp.vercel.app
   ```

5. Click "Deploy"
6. Wait 2-3 minutes
7. **SAVE THIS**: Your app URL (will be like `https://career-journey-mvp.vercel.app`)

### Step 10: Setup Database (30 min)

1. Go to your Supabase project
2. Click "SQL Editor" (left sidebar)
3. Click "New Query"
4. Open the file `database-schema.sql` from your download
5. Copy ALL the SQL code
6. Paste into Supabase SQL Editor
7. Click "Run" (or press Cmd/Ctrl + Enter)
8. You should see "Success. No rows returned" - this is good!
9. Click "Database" (left sidebar) → You should see all tables created:
   - profiles
   - assessments
   - module_progress
   - purchases
   - resumes
   - interview_sessions
   - email_logs
   - subscriptions

### Step 11: Setup Stripe Webhook (15 min)

1. In Stripe Dashboard: **Developers → Webhooks**
2. Click "Add endpoint"
3. Endpoint URL: `https://YOUR-VERCEL-URL.vercel.app/api/stripe/webhook`
   (Replace with your actual Vercel URL from Step 9)
4. Select events to listen to:
   - `checkout.session.completed`
5. Click "Add endpoint"
6. Click on the webhook you just created
7. Click "Reveal" under "Signing secret"
8. **COPY THIS**: `whsec_...`
9. Go back to Vercel → Your Project → Settings → Environment Variables
10. Edit `STRIPE_WEBHOOK_SECRET` → Paste the `whsec_...` value
11. Click "Save"
12. Redeploy: Deployments → Click "..." on latest → "Redeploy"

---

## SATURDAY EVENING (6pm - 7pm) - TEST EVERYTHING

### Step 12: Test Signup Flow (10 min)

1. Go to your Vercel URL: `https://YOUR-APP.vercel.app`
2. Enter test name and email (use your real email to get confirmation emails)
3. Click "Start Free Assessment"
4. Check if you're redirected to assessment page
5. **Expected**: Supabase should have a new user in Authentication → Users
6. **Expected**: New row in `profiles` table with your info

### Step 13: Test Assessment (10 min)

1. Complete all 6 questions
2. Click "See My Results"
3. **Expected**: 
   - Redirected to results page
   - See your breakthrough type
   - Email received with results
4. Check Supabase `assessments` table → Should have your answers
5. Check `module_progress` table → Networking should be unlocked

### Step 14: Test Payment Flow (20 min)

1. Go to Dashboard: `YOUR-URL/dashboard`
2. Click "Unlock Now" on Strengths module ($29)
3. Should redirect to Stripe checkout
4. Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
5. Complete purchase
6. **Expected**:
   - Redirected back to dashboard
   - Module is now unlocked
   - Email confirmation received
7. Check Supabase `purchases` table → Should have purchase record
8. Check `module_progress` → Strengths should be unlocked

### Step 15: Test Resume Upload (15 min)

1. From dashboard, click "Continue" on Resume module
2. Upload a test PDF resume
3. Click "Analyze My Resume"
4. Wait 30-60 seconds
5. **Expected**:
   - Analysis appears with ATS score
   - Strengths and improvements listed
   - Email received with results
6. Check Supabase `resumes` table → Should have analysis data

### Step 16: Check Email Delivery (5 min)

1. Check your inbox for 3 emails:
   - Welcome email (after signup)
   - Assessment results
   - Resume analysis complete
2. If emails not arriving:
   - Check spam folder
   - Verify Resend domain is verified
   - Check Supabase `email_logs` table for errors

---

## SUNDAY MORNING (10am - 12pm) - FIXES & POLISH

### Common Issues & Fixes

**Issue: "Unauthorized" error on assessment**
- **Fix**: Check Supabase RLS policies are enabled
- Go to: Database → Policies → Ensure all tables have policies
- SQL Editor → Run: `SELECT * FROM pg_policies;` to verify

**Issue: Stripe webhook not firing**
- **Fix**: 
  1. Check webhook URL is exactly: `https://YOUR-URL.vercel.app/api/stripe/webhook`
  2. Check webhook secret is added to Vercel env vars
  3. Test: Stripe Dashboard → Webhooks → Click webhook → "Send test webhook"

**Issue: Emails not sending**
- **Fix**:
  1. Verify domain in Resend dashboard shows green checkmark
  2. Check `FROM_EMAIL` in `/lib/email.ts` matches verified domain
  3. Update if needed: `Career Journey <noreply@hrpassionguy.com>`

**Issue: Resume analysis failing**
- **Fix**:
  1. Check Anthropic API key in Vercel env vars
  2. Check API credits: console.anthropic.com → Billing
  3. Increase timeout if needed (already set to 60s)

**Issue: Database connection errors**
- **Fix**:
  1. Verify all 3 Supabase keys in Vercel env vars
  2. Check no extra spaces in env var values
  3. Redeploy after any env var changes

### Step 17: Add Custom Domain (Optional, 30 min)

1. In Vercel: Settings → Domains
2. Add domain: `app.hrpassionguy.com` (or your choice)
3. Add DNS records shown (in your domain registrar):
   - Type: CNAME
   - Name: app (or @)
   - Value: cname.vercel-dns.com
4. Wait 10-60 minutes for DNS propagation
5. Update env var: `NEXT_PUBLIC_APP_URL=https://app.hrpassionguy.com`
6. Update Stripe webhook URL to new domain

---

## SUNDAY AFTERNOON (2pm - 4pm) - BETA TEST

### Step 18: Send to 10 Beta Users

1. Create beta tester list (friends, family, LinkedIn connections)
2. Send personal message:
   ```
   Hey [Name],

   I just launched my new Career Journey platform and I'd love your feedback!

   You'll get FREE access to everything (normally $497):
   - Career assessment
   - Resume analysis
   - Interview prep tool

   Just sign up at: [YOUR-URL]

   Let me know what you think!

   Marcus
   ```

3. Track in spreadsheet:
   - Name
   - Email
   - Signed up? (Y/N)
   - Completed assessment? (Y/N)
   - Feedback

### Step 19: Monitor & Fix Bugs

1. Watch for errors in Vercel:
   - Vercel Dashboard → Deployments → Click latest → "Functions" tab
   - Look for errors in red
2. Check Supabase logs:
   - Supabase → Logs → API logs
3. Common beta feedback to expect:
   - "Email took 5 minutes to arrive" → Normal, sometimes slow
   - "Assessment results not showing" → Check RLS policies
   - "Payment didn't unlock module" → Check webhook logs

---

## MONDAY - GO LIVE

### Step 20: Switch Stripe to Live Mode (if ready)

1. Complete Stripe verification (if not done)
2. Stripe Dashboard → Toggle "Test mode" OFF (top right)
3. Get LIVE API keys: Developers → API Keys
4. Update Vercel env vars with LIVE keys:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...`
   - `STRIPE_SECRET_KEY=sk_live_...`
5. Create new webhook for live mode (same as Step 11)
6. Redeploy

### Step 21: Launch Announcement

Post on LinkedIn:
```
After 27 years in HR, I'm excited to launch Career Journey 🚀

This isn't another generic job search course.

It's the exact system I've used to help 500+ professionals:
- Land $100K+ roles
- Negotiate 20%+ raises  
- Pivot into dream careers

Built with AI-powered tools including:
✅ Career breakthrough assessment
✅ Resume optimization that beats ATS
✅ Interview simulator with real-time feedback

Early access: [YOUR-URL]

First 50 people get 50% off ($249 instead of $497)

Let's get you hired.

#CareerCoaching #JobSearch #HRInsider
```

---

## MAINTENANCE CHECKLIST

**Daily (Week 1):**
- Check for new signups in Supabase
- Respond to beta tester feedback
- Monitor Vercel error logs
- Check Stripe dashboard for payments

**Weekly:**
- Review Anthropic API usage/costs
- Check Resend email delivery rate
- Backup Supabase database (automatic, but verify)
- Update content based on user feedback

**Monthly:**
- Review and optimize Claude prompts
- Add new features based on demand
- Check for Next.js/package updates
- Analyze user drop-off points

---

## SUPPORT CONTACTS

**Marcus (You):**
- Primary support: marcus@hrpassionguy.com
- Emergency: [Your phone]

**Platform Issues:**
- Vercel: vercel.com/support
- Supabase: supabase.com/support
- Stripe: stripe.com/support
- Anthropic: support@anthropic.com

---

## COST BREAKDOWN

**Month 1 (Expected):**
- Supabase: $0 (free tier, up to 50K users)
- Vercel: $0 (free tier, up to 100GB bandwidth)
- Stripe: $0 + 2.9% + $0.30 per transaction
- Anthropic: ~$20-50 (based on resume analysis usage)
- Resend: $0 (free up to 3K emails/month)

**Total: $20-50/month** until you scale

**Month 3 (If hitting $25K/month revenue):**
- Supabase: $25/month (Pro plan)
- Vercel: $20/month (Pro plan)
- Stripe: ~$750/month (fees on $25K revenue)
- Anthropic: ~$200/month (more resume analyses)
- Resend: $20/month (more emails)

**Total: ~$1,015/month** at $25K revenue = 4% overhead

---

## YOU'RE READY! 🚀

If you hit any snags, come back to this chat and tell me:
1. What step you're on
2. What error you're seeing
3. What you've tried

I'll debug with you in real-time.

Let's ship this thing! 💪
