import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { verifyWebhookSignature } from '@/lib/stripe'
import { createServiceSupabaseClient } from '@/lib/supabase'
import { sendPurchaseConfirmationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    const event = verifyWebhookSignature(body, signature)

    // Handle successful payment
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any

      const userId = session.metadata.userId
      const moduleName = session.metadata.moduleName
      const amountPaid = session.amount_total

      const supabase = await createServiceSupabaseClient()

      // Record purchase
      await supabase.from('purchases').insert({
        user_id: userId,
        module_name: moduleName,
        amount_paid: amountPaid,
        stripe_payment_intent_id: session.payment_intent,
        stripe_customer_id: session.customer,
        status: 'completed',
      })

      // Unlock module
      await supabase.rpc('unlock_module', {
        p_user_id: userId,
        p_module_name: moduleName,
      })

      // Get user profile for email
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', userId)
        .single()

      if (profile) {
        // Send confirmation email
        await sendPurchaseConfirmationEmail(
          profile.email,
          profile.full_name || 'there',
          moduleName,
          amountPaid,
          `${process.env.NEXT_PUBLIC_APP_URL}/modules/${moduleName}`
        )
      }
    }

    return NextResponse.json({ received: true })
    
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}
