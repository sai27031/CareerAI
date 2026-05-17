import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import { supabase } from '../lib/supabase'

export default function DashboardPage() {
  const [profile, setProfile] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }
    fetchProfile(user.id)
    fetchHistory(user.id)
  }

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
    setLoading(false)
  }

  async function fetchHistory(userId) {
    const { data } = await supabase
      .from('usage_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)
    setHistory(data || [])
  }

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={{ textAlign: 'center', padding: 80, color: '#6b7280' }}>
          Loading...
        </div>
      </div>
    )
  }

  const creditPercent = Math.min(100, (profile?.credits / 100) * 100)
  const isLowCredits = profile?.credits < 20

  return (
    <div>
      <Navbar />
      <div style={styles.page}>

        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.h1}>
            Welcome back, {profile?.full_name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p style={{ color: '#6b7280', fontSize: 14 }}>
            Use your credits to generate resumes and check job matches.
          </p>
        </div>

        {/* Low credit warning */}
        {isLowCredits && profile?.credits > 0 && (
          <div style={styles.warningBanner}>
            ⚠️ You are running low on credits.{' '}
            <Link href="/pricing" style={{ color: '#854F0B', fontWeight: 600 }}>
              Upgrade now →
            </Link>
          </div>
        )}

        {/* No credit warning */}
        {profile?.credits === 0 && (
          <div style={styles.dangerBanner}>
            ❌ You are out of credits.{' '}
            <Link href="/pricing" style={{ color: '#991B1B', fontWeight: 600 }}>
              Upgrade to continue →
            </Link>
          </div>
        )}

        {/* Stats */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Credits remaining</div>
            <div style={styles.statValue}>{profile?.credits}</div>
            <div style={styles.creditBarWrap}>
              <div
                style={{
                  ...styles.creditBar,
                  width: `${creditPercent}%`,
                  background: isLowCredits ? '#ef4444' : '#1D9E75',
                }}
              />
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Plan</div>
            <div style={{ ...styles.statValue, fontSize: 18, textTransform: 'capitalize' }}>
              {profile?.plan || 'Free'}
            </div>
            <Link href="/pricing" style={{ fontSize: 13, color: '#1D9E75', fontWeight: 500 }}>
              Upgrade →
            </Link>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Tools used</div>
            <div style={styles.statValue}>{history.length}</div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>total sessions</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Credits used</div>
            <div style={styles.statValue}>
              {history.reduce((sum, h) => sum + h.credits_used, 0)}
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>total spent</div>
          </div>
        </div>

        {/* Tools */}
        <h2 style={styles.sectionTitle}>AI Tools</h2>
        <div style={styles.toolsGrid}>

          <div className="card" style={styles.toolCard}>
            <div style={styles.toolIcon}>📄</div>
            <div style={styles.toolName}>AI Resume Generator</div>
            <div style={styles.toolDesc}>
              Fill in your details and get a complete, ATS-optimized resume in seconds.
            </div>
            <div style={styles.toolFooter}>
              <span className="badge-green">10 credits</span>
              <Link
                href="/resume"
                className="btn-primary"
                style={{ padding: '7px 14px', fontSize: 13 }}
              >
                Use tool →
              </Link>
            </div>
          </div>

          <div className="card" style={styles.toolCard}>
            <div style={styles.toolIcon}>📊</div>
            <div style={styles.toolName}>AI Job Match Score</div>
            <div style={styles.toolDesc}>
              Paste a job description and see how well your profile matches with improvement tips.
            </div>
            <div style={styles.toolFooter}>
              <span className="badge-green">5 credits</span>
              <Link
                href="/match"
                className="btn-primary"
                style={{ padding: '7px 14px', fontSize: 13 }}
              >
                Use tool →
              </Link>
            </div>
          </div>

        </div>

        {/* History */}
        <h2 style={{ ...styles.sectionTitle, marginTop: 36 }}>Recent activity</h2>
        {history.length === 0 ? (
          <p style={{ fontSize: 14, color: '#9ca3af' }}>
            No activity yet. Use a tool to get started.
          </p>
        ) : (
          <div>
            {history.map((item) => (
              <div key={item.id} style={styles.historyItem}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>
                    {item.tool === 'resume' ? '📄 AI Resume Generator' : '📊 AI Job Match Score'}
                  </div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                    {new Date(item.created_at).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <span className="badge-green">{item.credits_used} credits</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

const styles = {
  page: {
    maxWidth: 900,
    margin: '0 auto',
    padding: '32px 24px',
  },
  header: {
    marginBottom: 28,
  },
  h1: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 6,
  },
  warningBanner: {
    background: '#FAEEDA',
    border: '1px solid #FAC775',
    borderRadius: 10,
    padding: '12px 16px',
    fontSize: 13,
    color: '#633806',
    marginBottom: 24,
  },
  dangerBanner: {
    background: '#FEF2F2',
    border: '1px solid #FECACA',
    borderRadius: 10,
    padding: '12px 16px',
    fontSize: 13,
    color: '#991B1B',
    marginBottom: 24,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: 14,
    marginBottom: 36,
  },
  statCard: {
    background: '#f9fafb',
    borderRadius: 10,
    padding: 16,
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 700,
    color: '#111827',
    marginBottom: 6,
  },
  creditBarWrap: {
    height: 4,
    background: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  creditBar: {
    height: '100%',
    borderRadius: 4,
    transition: 'width 0.5s ease',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 16,
  },
  toolsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 16,
  },
  toolCard: {
    cursor: 'default',
  },
  toolIcon: {
    fontSize: 28,
    marginBottom: 12,
  },
  toolName: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 6,
  },
  toolDesc: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 1.6,
    marginBottom: 16,
  },
  toolFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyItem: {
    background: 'white',
    border: '1px solid #f3f4f6',
    borderRadius: 10,
    padding: '12px 16px',
    marginBottom: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
}