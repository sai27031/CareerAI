import Razorpay from 'razorpay'
import { supabaseAdmin } from '../../lib/supabaseAdmin'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { plan, amount } = req.body

  if (!plan || !amount) {
    return res.status(400).json({ error: 'Plan and amount are required' })
  }

  // Get logged in user
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ error: 'Please sign in first to subscribe.' })
  }

  try {
    // Verify user from token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return res.status(401).json({ error: 'Please sign in first to subscribe.' })
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount,
      currency: 'INR',
      receipt: `receipt_${user.id}_${Date.now()}`,
      notes: {
        userId: user.id,
        plan: plan,
      },
    })

    // Save order to database
    await supabaseAdmin
      .from('subscriptions')
      .insert({
        user_id: user.id,
        razorpay_order_id: order.id,
        plan: plan,
        amount: amount,
        status: 'created',
      })

    return res.status(200).json({
      orderId: order.id,
    })

  } catch (error) {
    console.error('Create order error:', error)
    return res.status(500).json({ error: 'Failed to create order. Please try again.' })
  }
}