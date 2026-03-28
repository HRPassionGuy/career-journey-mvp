import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createCheckoutSession } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { productId } = await request.json()

    // Only allow bundle_founder purchase
    if (productId !== 'bundle_founder') {
      return NextResponse.json(
        { error: 'Invalid product' },
        { status: 400 }
      )
    }

    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Not authenticated. Please sign in and try again.' },
        { status: 401 }
      )
    }

    // Create Supabase client with the auth token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (!user) {
      console.error('Auth error:', userError)
      return NextResponse.json(
        { error: 'Not authenticated. Please sign in and try again.' },
        { status: 401 }
      )
    }

    console.log('User authenticated:', user.id)

    // Check if they already purchased
    const { data: existingPurchase, error: purchaseError } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', user.id)
      .or('product_id.eq.bundle_founder,module_name.eq.bundle_founder')
      .single()

    if (purchaseError && purchaseError.code !== 'PGRST116') {
      console.error('Purchase check error:', purchaseError)
    }

    if (existingPurchase) {
      return NextResponse.json(
        { error: 'Already purchased' },
        { status: 400 }
      )
    }

    const session = await createCheckoutSession({
      userId: user.id,
      moduleName: 'bundle_founder',
      userEmail: user.email!,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/thank-you`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
