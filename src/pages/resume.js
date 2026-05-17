import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import { supabase } from '../lib/supabase'

export default function ResumePage() {
  const [user, setUser]       = useState(null)
  const [credits, setCredits] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState('')
  const [error, setError]     = useState('')
  const router = useRouter()

  const [form, setForm] = useState({
    fullName: '',
    targetRole: '',
    experience: '',
    education: '',
    skills: '',
    summary: '',
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/auth/login')
        return
      }
      setUser(data.user)
      fetchCredits(data.user.id)
    })
  }, [])

  async function fetchCredits(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single()
    if (data) setCredits(data.credits)
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleGenerate(e) {
    e.preventDefault()
    setError('')
    setResult('')

    if (credits < 10) {
      setError('Not enough credits. Please upgrade your plan.')
      return
    }

    if (!form.fullName || !form.targetRole) {
      setError('Please fill in at least your name and target role.')
      return
    }

    setLoading(true)

    const res = await fetch('/api/generate-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, userId: user.id }),
    })

    const data = await res.json()

    if (data.error) {
      setError(data.error)
    } else {
      setResult(data.resume)
      setCredits(data.creditsRemaining)
    }

    setLoading(false)
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(result)
    alert('Resume copied to clipboard!')
  }

  return (
    <div>
      <Navbar />
      <div style={styles.page}>

        {/* Back button */}
        <Link href="/dashboard" style={styles.back}>
          ← Back to dashboard
        </Link>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.icon}>📄</div>
          <div>
            <h1 style={styles.h1}>AI Resume Generator</h1>
            <p style={{ color: '#6b7280', fontSize: 14 }}>
              Fill in your details — AI will write a polished, ATS-friendly resume.
            </p>
          </div>
        </div>

        {/* Credit notice */}
        <div style={styles.creditNotice}>
          ⬡ This tool costs <strong>10 credits</strong>.
          You have <strong>{credits ?? '...'} credits</strong> remaining.
          {credits !== null && credits < 10 && (
            <>
              {' '}—{' '}
              <Link href="/pricing" style={{ color: '#854F0B', fontWeight: 600 }}>
                Upgrade to continue
              </Link>
            </>
          )}
        </div>

        {error && <div className="error-msg">{error}</div>}

        {/* Form */}
        <div className="card" style={{ marginBottom: 24 }}>
          <form onSubmit={handleGenerate}>

            <div style={styles.formRow}>
              <div className="form-group">
                <label className="label">Full name *</label>
                <input
                  className="input"
                  name="fullName"
                  placeholder="Rahul Sharma"
                  value={form.fullName}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="label">Target role *</label>
                <input
                  className="input"
                  name="targetRole"
                  placeholder="Software Engineer"
                  value={form.targetRole}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={styles.formRow}>
              <div className="form-group">
                <label className="label">Years of experience</label>
                <input
                  className="input"
                  name="experience"
                  placeholder="3 years"
                  value={form.experience}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="label">Education</label>
                <input
                  className="input"
                  name="education"
                  placeholder="B.Tech CSE, JNTU Hyderabad"
                  value={form.education}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Key skills (comma separated)</label>
              <input
                className="input"
                name="skills"
                placeholder="React, Node.js, Python, SQL"
                value={form.skills}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="label">Brief work summary</label>
              <textarea
                className="input"
                name="summary"
                rows={4}
                placeholder="Describe your most recent role and key achievements..."
                value={form.summary}
                onChange={handleChange}
                style={{ resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading || credits < 10}
              style={{ padding: '11px 28px' }}
            >
              {loading ? (
                <><span className="spinner" /> Generating...</>
              ) : (
                '✨ Generate Resume — 10 credits'
              )}
            </button>

          </form>
        </div>

        {/* Result */}
        {result && (
          <div className="card">
            <div style={styles.resultHeader}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>
                Your Generated Resume
              </div>
              <button
                onClick={copyToClipboard}
                className="btn-outline"
                style={{ padding: '6px 14px', fontSize: 13 }}
              >
                📋 Copy
              </button>
            </div>
            <pre style={styles.resultText}>{result}</pre>
          </div>
        )}

      </div>
    </div>
  )
}

const styles = {
  page: {
    maxWidth: 800,
    margin: '0 auto',
    padding: '32px 24px',
  },
  back: {
    fontSize: 13,
    color: '#6b7280',
    display: 'inline-block',
    marginBottom: 24,
  },
  header: {
    display: 'flex',
    gap: 16,
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  icon: {
    width: 48,
    height: 48,
    background: '#E1F5EE',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
    flexShrink: 0,
  },
  h1: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 4,
  },
  creditNotice: {
    background: '#f9fafb',
    border: '1px solid #f3f4f6',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 20,
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
  },
  resultHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  resultText: {
    whiteSpace: 'pre-wrap',
    fontFamily: 'inherit',
    fontSize: 14,
    color: '#374151',
    lineHeight: 1.7,
    background: '#f9fafb',
    borderRadius: 8,
    padding: 16,
  },
}