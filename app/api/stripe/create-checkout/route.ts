import { NextRequest, NextResponse } from 'next/server'
import { createClientSupabaseClient } from '@/lib/supabase'
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

    const supabase = createClientSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Check if they already purchased
    const { data: existingPurchase } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', 'bundle_founder')
      .single()

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
