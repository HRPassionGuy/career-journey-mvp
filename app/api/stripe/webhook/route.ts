import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      // Get customer email
      const customerEmail = session.customer_details?.email || session.metadata?.email
      
      if (!customerEmail) {
        console.error('No customer email found in session')
        return NextResponse.json({ error: 'No email found' }, { status: 400 })
      }

      // Get user_id from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', customerEmail)
        .single()

      if (!profile) {
        console.error('No profile found for email:', customerEmail)
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
      }

      // Log purchase to Supabase
      const { error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          user_id: profile.id,
          product_id: 'bundle_founder',  // CHANGED: Always bundle_founder
          amount_paid: session.amount_total,
          stripe_payment_intent_id: session.payment_intent as string,
          stripe_customer_id: session.customer as string,
          status: 'completed',
        })

      if (purchaseError) {
        console.error('Error logging purchase:', purchaseError)
        return NextResponse.json({ error: 'Purchase log failed' }, { status: 500 })
      }

      // Unlock ALL modules
      const modules = ['assessment', 'strengths', 'resume', 'networking', 'innervue']
      
      for (const moduleName of modules) {
        await supabase.from('module_progress').upsert({
          user_id: profile.id,
          module_name: moduleName,
          status: 'unlocked',
          is_unlocked: true,
          unlocked_at: new Date().toISOString(),
          progress_percent: 0,
          is_completed: false
        }, {
          onConflict: 'user_id,module_name'
        })
      }

      console.log('All modules unlocked for:', customerEmail)

      // Send to Zapier webhook
      const zapierWebhookUrl = process.env.ZAPIER_WEBHOOK_URL
      if (zapierWebhookUrl) {
        const zapierResponse = await fetch(zapierWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: customerEmail,
            product_name: 'Career Journey MVP - Founder Access',
            amount: (session.amount_total! / 100).toFixed(2),
            purchase_date: new Date().toISOString(),
            status: 'completed',
            platform: 'Stripe',
            payment_intent_id: session.payment_intent,
          }),
        })
        console.log('Zapier webhook response:', await zapierResponse.text())
      }

      return NextResponse.json({ received: true })
      
    } catch (error) {
      console.error('Error processing webhook:', error)
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}

export const runtime = 'nodejs'
