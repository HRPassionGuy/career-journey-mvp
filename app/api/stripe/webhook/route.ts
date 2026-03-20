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
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    const event = verifyWebhookSignature(body, signature)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any
      
      // Get module name from metadata (API checkout) or line items (Payment Link)
      let moduleName = session.metadata?.moduleName
      let userId = session.metadata?.userId
      
      // If no metadata, this came from a Payment Link - get from line items
      if (!moduleName || !userId) {
        const supabase = await createServiceSupabaseClient()
        
        // Get line items to find product
        const lineItems = await fetch(
          `https://api.stripe.com/v1/checkout/sessions/${session.id}/line_items`,
          {
            headers: {
              'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`
            }
          }
        )
        const lineItemsData = await lineItems.json()
        const priceId = lineItemsData.data[0]?.price?.id
        
        // Map price ID to module name
        if (priceId === 'price_1TBPYyBx8VCQp7jpuOkqHsId') {
          moduleName = 'innervue'
        }
        
        // Get userId from customer email
        const customerEmail = session.customer_details?.email || session.customer_email
        
        if (customerEmail) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', customerEmail)
            .single()
          
          userId = profile?.id
        }
      }
      
      if (!userId || !moduleName) {
        console.error('Missing userId or moduleName:', { userId, moduleName })
        return NextResponse.json({ error: 'Missing required data' }, { status: 400 })
      }

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
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
