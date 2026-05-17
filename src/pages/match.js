import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import { supabase } from '../lib/supabase'

export default function MatchPage() {
  const [user, setUser]       = useState(null)
  const [credits, setCredits] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState(null)
  const [error, setError]     = useState('')
  const router = useRouter()

  const [form, setForm] = useState({
    profile: '',
    jobDescription: '',
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

  async function handleAnalyze(e) {
    e.preventDefault()
    setError('')
    setResult(null)

    if (credits < 5) {
      setError('Not enough credits. Please upgrade your plan.')
      return
    }

    if (!form.profile || !form.jobDescription) {
      setError('Please fill in both fields.')
      return
    }

    setLoading(true)

    const res = await fetch('/api/job-match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, userId: user.id }),
    })

    const data = await res.json()

    if (data.error) {
      setError(data.error)
    } else {
      setResult(data)
      setCredits(data.creditsRemaining)
    }

    setLoading(false)
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
          <div style={styles.icon}>📊</div>
          <div>
            <h1 style={styles.h1}>AI Job Match Score</h1>
            <p style={{ color: '#6b7280', fontSize: 14 }}>
              See how well your profile matches a job description — with a detailed breakdown.
            </p>
          </div>
        </div>

        {/* Credit notice */}
        <div style={styles.creditNotice}>
          ⬡ This tool costs <strong>5 credits</strong>.
          You have <strong>{credits ?? '...'} credits</strong> remaining.
          {credits !== null && credits < 5 && (
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
          <form onSubmit={handleAnalyze}>

            <div className="form-group">
              <label className="label">Your skills and experience *</label>
              <textarea
                className="input"
                name="profile"
                rows={5}
                placeholder="List your skills, experience, education and achievements..."
                value={form.profile}
                onChange={handleChange}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="form-group">
              <label className="label">Job description *</label>
              <textarea
                className="input"
                name="jobDescription"
                rows={5}
                placeholder="Paste the full job description here..."
                value={form.jobDescription}
                onChange={handleChange}
                style={{ resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading || credits < 5}
              style={{ padding: '11px 28px' }}
            >
              {loading ? (
                <><span className="spinner" /> Analyzing...</>
              ) : (
                '📊 Analyze Match — 5 credits'
              )}
            </button>

          </form>
        </div>

        {/* Result */}
        {result && (
          <div className="card">

            {/* Score circle */}
            <div style={styles.scoreSection}>
              <div style={styles.scoreCircle}>
                <div style={styles.scoreNum}>{result.score}%</div>
                <div style={styles.scoreLabel}>match</div>
              </div>
              <p style={{ color: '#6b7280', fontSize: 14, maxWidth: 400, textAlign: 'center' }}>
                {result.summary}
              </p>
            </div>

            {/* Score bars */}
            <div style={styles.barsSection}>
              <ScoreBar label="Skills match" value={result.skills_match} />
              <ScoreBar label="Experience"   value={result.experience_match} />
              <ScoreBar label="Education"    value={result.education_match} />
            </div>

            {/* Strengths */}
            {result.strengths && result.strengths.length > 0 && (
              <div style={styles.listSection}>
                <div style={styles.listTitle}>✅ Strengths</div>
                {result.strengths.map((s, i) => (
                  <div key={i} style={styles.listItem}>
                    <span style={{ color: '#1D9E75' }}>✓</span> {s}
                  </div>
                ))}
              </div>
            )}

            {/* Gaps */}
            {result.gaps && result.gaps.length > 0 && (
              <div style={styles.listSection}>
                <div style={styles.listTitle}>⚠️ Gaps to address</div>
                {result.gaps.map((g, i) => (
                  <div key={i} style={styles.listItem}>
                    <span style={{ color: '#F59E0B' }}>!</span> {g}
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  )
}

function ScoreBar({ label, value }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: '#6b7280' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{value}%</span>
      </div>
      <div style={{ height: 6, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${value}%`,
            background: '#1D9E75',
            borderRadius: 4,
            transition: 'width 0.8s ease',
          }}
        />
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
  scoreSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '24px 0',
    borderBottom: '1px solid #f3f4f6',
    marginBottom: 24,
    gap: 12,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: '50%',
    background: '#E1F5EE',
    border: '3px solid #1D9E75',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNum: {
    fontSize: 26,
    fontWeight: 700,
    color: '#1D9E75',
  },
  scoreLabel: {
    fontSize: 11,
    color: '#0F6E56',
  },
  barsSection: {
    marginBottom: 24,
  },
  listSection: {
    marginBottom: 20,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 10,
  },
  listItem: {
    fontSize: 13,
    color: '#6b7280',
    padding: '4px 0',
    display: 'flex',
    gap: 8,
  },
}