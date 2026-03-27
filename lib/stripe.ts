import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

export const MODULE_PRICES = {
  // ONLY THE BUNDLE - Everything else is included
  bundle_founder: 14700,  // $147 Founder's Access
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
  
  const price = MODULE_PRICES[moduleName]
  
  return await stripe.checkout.sessions.create({
    customer_email: userEmail,
    client_reference_id: userId,
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Career Journey MVP - Founder\'s Access',
          description: 'Complete system: Resume transformation, job leads, and interview mastery',
        },
        unit_amount: price,
      },
      quantity: 1,
    }],
    metadata: { 
      userId, 
      moduleName,
      // Mark all modules as unlocked
      unlocks: 'assessment,strengths,resume,networking,innervue'
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  })
}

export function verifyWebhookSignature(payload: string | Buffer, signature: string): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET!)
}

export async function getOrCreateStripeCustomer(email: string, userId: string): Promise<Stripe.Customer> {
  const existing = await stripe.customers.list({ email, limit: 1 })
  if (existing.data.length > 0) return existing.data[0]
  return await stripe.customers.create({ email, metadata: { userId } })
}
