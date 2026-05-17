import crypto from 'crypto'
import { supabaseAdmin } from '../../lib/supabaseAdmin'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    plan,
  } = req.body

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing payment details' })
  }

  try {
    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Invalid payment signature' })
    }

    // Get subscription from database
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('razorpay_order_id', razorpay_order_id)
      .single()

    if (subError || !subscription) {
      return res.status(404).json({ success: false, error: 'Subscription not found' })
    }

    // Calculate plan expiry date
    const now = new Date()
    let planExpiresAt

    if (plan === 'monthly') {
      planExpiresAt = new Date(now.setMonth(now.getMonth() + 1))
    } else if (plan === 'yearly') {
      planExpiresAt = new Date(now.setFullYear(now.getFullYear() + 1))
    }

    // Update subscription status
    await supabaseAdmin
      .from('subscriptions')
      .update({
        razorpay_payment_id: razorpay_payment_id,
        status: 'paid',
      })
      .eq('razorpay_order_id', razorpay_order_id)

    // Update user profile — set plan and give unlimited credits
    await supabaseAdmin
      .from('profiles')
      .update({
        plan: plan,
        credits: 999999,
        plan_expires_at: planExpiresAt.toISOString(),
      })
      .eq('id', subscription.user_id)

    return res.status(200).json({ success: true })

  } catch (error) {
    console.error('Verify payment error:', error)
    return res.status(500).json({ success: false, error: 'Payment verification failed' })
  }
}