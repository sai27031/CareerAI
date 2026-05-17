import { supabaseAdmin } from '../../lib/supabaseAdmin'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('credits, plan, plan_expires_at')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return res.status(404).json({ error: 'Profile not found' })
    }

    return res.status(200).json({
      credits: profile.credits,
      plan: profile.plan,
      planExpiresAt: profile.plan_expires_at,
    })

  } catch (error) {
    console.error('Credits fetch error:', error)
    return res.status(500).json({ error: 'Failed to fetch credits' })
  }
}