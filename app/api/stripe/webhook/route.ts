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
      console.log('Payment link:', session.payment_link)
      
      let moduleName = session.metadata?.moduleName
      let userId = session.metadata?.userId
      
      // If no metadata, this came from a Payment Link
      if (!moduleName || !userId) {
        const supabase = await createServiceSupabaseClient()
        
        // Get customer email
        const customerEmail = session.customer_details?.email
        console.log('Looking up user with email:', customerEmail)
        
        if (customerEmail) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, email')
            .ilike('email', customerEmail)
            .single()
          
          console.log('Profile lookup result:', { profile, profileError })
          
          if (profile) {
            userId = profile.id
            console.log('Found userId:', userId)
          }
        }
        
        // Hardcode module name for this payment link
        if (session.payment_link === 'plink_1TCsXMBx8VCQp7jplRInlBiI') {
          moduleName = 'innervue'
          console.log('Set moduleName to innervue from payment link')
        }
      }
      
      console.log('Final values - userId:', userId, 'moduleName:', moduleName)
      
      if (!userId || !moduleName) {
        console.error('Missing userId or moduleName')
        return NextResponse.json({ error: 'Missing required data' }, { status: 400 })
      }

      const amountPaid = session.amount_total
      const supabase = await createServiceSupabaseClient()

      console.log('Inserting purchase...')
      const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          user_id: userId,
          module_name: moduleName,
          amount_paid: amountPaid,
          stripe_payment_intent_id: session.payment_intent,
          stripe_customer_id: session.customer,
          status: 'completed',
        })
        .select()

      console.log('Purchase insert result:', { purchase, purchaseError })

      console.log('Unlocking module...')
      const { data: unlock, error: unlockError } = await supabase
        .rpc('unlock_module', {
          p_user_
