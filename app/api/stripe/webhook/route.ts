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
    console.log('Webhook event type:', event.type)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any
      
      console.log('Session metadata:', session.metadata)
      console.log('Customer email:', session.customer_details?.email)
      
      let moduleName = session.metadata?.moduleName
      let userId = session.metadata?.userId
      
      if (!moduleName || !userId) {
        const supabase = await createServiceSupabaseClient()
        const customerEmail = session.customer_details?.email
        
        console.log('Looking up user with email:', customerEmail)
        
        if (customerEmail) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, email')
            .ilike('email', customerEmail)
            .single()
          
          console.log('Profile found:', profile)
          
          if (profile) {
            userId = profile.id
          }
        }
        
        if (session.payment_link === 'plink_1TCsXMBx8VCQp7jplRInlBiI') {
          moduleName = 'innervue'
        }
      }
      
      console.log('userId:', userId, 'moduleName:', moduleName)
      
      if (!userId || !moduleName) {
        console.error('Missing data')
        return NextResponse.json({ error: 'Missing required data' }, { status: 400 })
      }

      const supabase = await createServiceSupabaseClient()

      await supabase.from('purchases').insert({
        user_id: userId,
        module_name: moduleName,
        amount_paid: session.amount_total,
        stripe_payment_intent_id: session.payment_intent,
        stripe_customer_id: session.customer,
        status: 'completed',
      })

      await supabase.rpc('unlock_module', {
        p_user_id: userId,
        p_module_name: moduleName,
      })

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
          session.amount_total,
          `${process.env.NEXT_PUBLIC_APP_URL}/modules/innervue`
        )
      }
    }

    return NextResponse.json({ received: true })
    
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
