import Groq from 'groq-sdk'
import { supabaseAdmin } from '../../lib/supabaseAdmin'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { fullName, targetRole, experience, education, skills, summary, userId } = req.body

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    // Check credits
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (profile.credits < 10) {
      return res.status(400).json({ error: 'Not enough credits. Please upgrade your plan.' })
    }

    // Call Groq
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a professional resume writer. Write clean, ATS-friendly resumes that are concise and impactful.',
        },
        {
          role: 'user',
          content: `Write a professional ATS-friendly resume for the following person:

Name: ${fullName}
Target Role: ${targetRole}
Experience: ${experience || 'Fresher'}
Education: ${education || 'Not specified'}
Skills: ${skills || 'Not specified'}
Work Summary: ${summary || 'Not specified'}

Format the resume with these sections:
1. Contact Information
2. Professional Summary
3. Skills
4. Work Experience
5. Education

Make it professional, concise and ATS-friendly.`,
        },
      ],
      max_tokens: 1500,
    })

    const resume = completion.choices[0].message.content

    // Deduct credits
    const newCredits = profile.credits - 10
    await supabaseAdmin
      .from('profiles')
      .update({ credits: newCredits })
      .eq('id', userId)

    // Log usage
    await supabaseAdmin
      .from('usage_logs')
      .insert({
        user_id: userId,
        tool: 'resume',
        credits_used: 10,
      })

    return res.status(200).json({
      resume,
      creditsRemaining: newCredits,
    })

  } catch (error) {
    console.error('Resume generation error:', error)
    return res.status(500).json({ error: 'Failed to generate resume. Please try again.' })
  }
}