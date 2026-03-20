import Stripe from 'stripe'

// Initialize Stripe with secret key (server-side only)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

export const MODULE_PRICES = {
  strengths: 6700,      // $67
  resume: 19700,        // $197
  networking: 0,        // FREE
  innervue: 14700,      // $147
  bundle_intro: 19700,  // $197 (launch special - first 30 days only)
  bundle_regular: 49700, // $497 (regular price - after 30 days)
  annual: 21800,        // $218 (renewal)
} as const

export type ModuleName = keyof typeof MODULE_PRICES

// Create Stripe checkout session
export async function createCheckoutSession({
  userId,
  moduleName,
  userEmail,
  successUrl,
  cancelUrl,
}: {
  userId: string
  moduleName: ModuleName
  userEmail: string
  successUrl: string
  cancelUrl: string
}): Promise<Stripe.Checkout.Session> {
  
  const price = MODULE_PRICES[moduleName]
  const isSubscription = moduleName === 'annual'
  
  const session = await stripe.checkout.sessions.create({
    customer_email: userEmail,
    client_reference_id: userId,
    payment_method_types: ['card'],
    mode: isSubscription ? 'subscription' : 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: getModuleDisplayName(moduleName),
            description: getModuleDescription(moduleName),
          },
          unit_amount: price,
          ...(isSubscription && {
            recurring: {
              interval: 'year'
            }
          })
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      moduleName,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  })
  
  return session
}

// Helper: Get display name for module
function getModuleDisplayName(moduleName: ModuleName): string {
  const names: Record<ModuleName, string> = {
    strengths: 'Strengths Discovery Module',
    resume: 'Resume Mastery + Job Match System',
    networking: 'Networking Accelerator',
    innervue: 'Inner Vue Interview Tool (1 Year Access)',
    bundle_intro: 'Career Accelerator - Intro Offer',
    bundle_regular: 'Career Accelerator - Regular Price',
    annual: 'Career Journey Annual Renewal',
  }
  return names[moduleName]
}

// Helper: Get description for module
function getModuleDescription(moduleName: ModuleName): string {
  const descriptions: Record<ModuleName, string> = {
    strengths: 'Discover your unique strengths and leverage them in your career',
    resume: 'AI-powered resume rewrite in proven template + 12-15 targeted job matches + 5 custom variants',
    networking: 'Strategic networking frameworks, templates, and LinkedIn optimization',
    innervue: 'Unlimited AI-powered interview practice with personalized S.O.A.R. method feedback',
    bundle_intro: 'Complete career transformation - All modules included (Limited Time: Save $311)',
    bundle_regular: 'Complete career transformation - All modules included (Save $111)',
    annual: 'Continued access to all modules, Inner Vue, and quarterly job market updates',
  }
  return descriptions[moduleName]
}

// Verify Stripe webhook signature
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
}

// Create or retrieve Stripe customer
export async function getOrCreateStripeCustomer(
  email: string,
  userId: string
): Promise<Stripe.Customer> {
  // Search for existing customer
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  })
  
  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0]
  }
  
  // Create new customer
  return await stripe.customers.create({
    email,
    metadata: {
      userId,
    },
  })
}
