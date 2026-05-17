import Groq from 'groq-sdk'
import { supabaseAdmin } from '../../lib/supabaseAdmin'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { profile, jobDescription, userId } = req.body

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    // Check credits
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single()

    if (profileError || !userProfile) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (userProfile.credits < 5) {
      return res.status(400).json({ error: 'Not enough credits. Please upgrade your plan.' })
    }

    // Call Groq
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a career coach that analyzes how well a candidate matches a job description.
You must respond ONLY with a valid JSON object. No extra text, no markdown, no explanation.
The JSON must have exactly these fields:
{
  "score": number between 0 and 100,
  "skills_match": number between 0 and 100,
  "experience_match": number between 0 and 100,
  "education_match": number between 0 and 100,
  "summary": "2 sentence overall assessment",
  "strengths": ["strength1", "strength2", "strength3"],
  "gaps": ["gap1", "gap2"]
}`,
        },
        {
          role: 'user',
          content: `Analyze how well this candidate matches the job description.

CANDIDATE PROFILE:
${profile}

JOB DESCRIPTION:
${jobDescription}

Respond with only the JSON object. No markdown, no extra text.`,
        },
      ],
      max_tokens: 800,
    })

    const rawText = completion.choices[0].message.content

    // Parse JSON response
    let parsed
    try {
      const cleaned = rawText.replace(/```json|```/g, '').trim()
      parsed = JSON.parse(cleaned)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return res.status(500).json({ error: 'Failed to parse AI response. Please try again.' })
    }

    // Deduct credits
    const newCredits = userProfile.credits - 5
    await supabaseAdmin
      .from('profiles')
      .update({ credits: newCredits })
      .eq('id', userId)

    // Log usage
    await supabaseAdmin
      .from('usage_logs')
      .insert({
        user_id: userId,
        tool: 'match',
        credits_used: 5,
      })

    return res.status(200).json({
      ...parsed,
      creditsRemaining: newCredits,
    })

  } catch (error) {
    console.error('Job match error:', error)
    return res.status(500).json({ error: 'Failed to analyze match. Please try again.' })
  }
}