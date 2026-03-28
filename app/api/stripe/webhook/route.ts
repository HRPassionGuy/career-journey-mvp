import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Use service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const headersList = headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      const userId = session.metadata?.userId
      const moduleName = session.metadata?.moduleName || 'bundle_founder'

      if (!userId) {
        console.error('No userId in metadata')
        return NextResponse.json({ error: 'No userId' }, { status: 400 })
      }

      // Log the purchase
      const { error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          user_id: userId,
          product_id: 'bundle_founder',
          module_name: 'bundle_founder',
          amount_paid: session.amount_total || 14700,
          stripe_customer_id: session.customer as string,
          stripe_payment_intent_id: session.payment_intent as string,
          status: 'completed'
        })

      if (purchaseError) {
        console.error('Purchase insert error:', purchaseError)
        return NextResponse.json({ error: 'Purchase log failed' }, { status: 500 })
      }

      // Unlock ALL modules
      const modules = ['assessment', 'strengths', 'resume', 'networking', 'innervue']
      
      for (const module of modules) {
        const { error: unlockError } = await supabase
          .from('module_progress')
          .upsert({
            user_id: userId,
            module_name: module,
            is_unlocked: true,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,module_name'
          })

        if (unlockError) {
          console.error(`Error unlocking ${module}:`, unlockError)
        }
      }

      // Send to Zapier webhook
      if (process.env.ZAPIER_WEBHOOK_URL) {
        await fetch(process.env.ZAPIER_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: session.customer_email,
            name: session.customer_details?.name,
            amount: (session.amount_total || 0) / 100,
            product: 'Career Journey MVP - Founder Access',
            userId: userId
          })
        }).catch(err => console.error('Zapier webhook error:', err))
      }

      console.log('✅ Purchase completed and modules unlocked for user:', userId)
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Webhook error:', err)
    return NextResponse.json(
      { error: err.message },
      { status: 400 }
    )
  }
}
