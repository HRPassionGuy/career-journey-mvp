import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

export const MODULE_PRICES = {
  strengths: 6700,
  resume: 19700,
  networking: 0,
  innervue: 14700,
  bundle_intro: 19700,
  bundle_regular: 49700,
  annual: 21800,
} as const

export type ModuleName = keyof typeof MODULE_PRICES

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
  
  // Use pre-created price for innervue
  if (moduleName === 'innervue') {
    return await stripe.checkout.sessions.create({
      customer_email: userEmail,
      client_reference_id: userId,
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price: 'price_1TBPYyBx8VCQp7jpuOkqHsId',
        quantity: 1,
      }],
      metadata: { userId, moduleName },
      success_url: successUrl,
      cancel_url: cancelUrl,
    })
  }
  
  // For all other products use dynamic pricing
  const price = MODULE_PRICES[moduleName]
  
  return await stripe.checkout.sessions.create({
    customer_email: userEmail,
    client_reference_id: userId,
    payment_method_types: ['card'],
    mode: moduleName === 'annual' ? 'subscription' : 'payment',
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: getModuleDisplayName(moduleName),
          description: getModuleDescription(moduleName),
        },
        unit_amount: price,
        ...(moduleName === 'annual' ? { recurring: { interval: 'year' } } : {})
      },
      quantity: 1,
    }],
    metadata: { userId, moduleName },
    success_url: successUrl,
    cancel_url: cancelUrl,
  })
}

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

function getModuleDescription(moduleName: ModuleName): string {
  const descriptions: Record<ModuleName, string> = {
    strengths: 'Discover your unique strengths',
    resume: 'AI-powered resume + job matches',
    networking: 'Strategic networking frameworks',
    innervue: 'AI-powered interview practice',
    bundle_intro: 'Complete career transformation (Save $311)',
    bundle_regular: 'Complete career transformation (Save $111)',
    annual: 'Annual renewal with all modules',
  }
  return descriptions[moduleName]
}

export function verifyWebhookSignature(payload: string | Buffer, signature: string): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET!)
}

export async function getOrCreateStripeCustomer(email: string, userId: string): Promise<Stripe.Customer> {
  const existing = await stripe.customers.list({ email, limit: 1 })
  if (existing.data.length > 0) return existing.data[0]
  return await stripe.customers.create({ email, metadata: { userId } })
}
