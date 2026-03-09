import Stripe from 'stripe'

// Initialize Stripe with secret key (server-side only)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

// Module pricing (in cents)
export const MODULE_PRICES = {
  strengths: 2900,      // $29
  resume: 15000,        // $150
  networking: 0,        // FREE
  innervue: 10000,      // $100
  annual: 21800,        // $218 (renewal)
  bundle: 49700,        // $497 (first year all-inclusive)
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
  
  if (price === 0) {
    throw new Error('This module is free')
  }

  const session = await stripe.checkout.sessions.create({
    customer_email: userEmail,
    client_reference_id: userId,
    payment_method_types: ['card'],
    mode: moduleName === 'annual' ? 'subscription' : 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: getModuleDisplayName(moduleName),
            description: getModuleDescription(moduleName),
          },
          ...(moduleName === 'annual' 
            ? { recurring: { interval: 'year' } }
            : {}
          ),
          unit_amount: price,
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
    strengths: 'Strengths Coaching Module',
    resume: 'Resume Module + Professional Redo',
    networking: 'Networking Module',
    innervue: 'Inner Vue Interview Tool (1 Year Access)',
    annual: 'Career Journey Annual Renewal',
    bundle: 'Complete Career Journey Bundle',
  }
  return names[moduleName]
}

// Helper: Get description for module
function getModuleDescription(moduleName: ModuleName): string {
  const descriptions: Record<ModuleName, string> = {
    strengths: 'Discover your unique strengths and how to leverage them in your career',
    resume: 'Professional resume analysis, templates, and automated optimization',
    networking: 'Strategic networking frameworks and connection strategies',
    innervue: 'AI-powered interview practice with personalized feedback',
    annual: 'Continued access to all modules and Inner Vue tool',
    bundle: 'Complete career transformation package - all modules included',
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
