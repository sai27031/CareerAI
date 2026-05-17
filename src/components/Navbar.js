import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

export default function Navbar() {
  const [user, setUser]       = useState(null)
  const [credits, setCredits] = useState(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user)
        fetchCredits(data.user.id)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchCredits(session.user.id)
      else setCredits(null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function fetchCredits(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single()
    if (data) setCredits(data.credits)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav style={styles.nav}>
      <Link href="/" style={styles.logo}>
        <div style={styles.logoDot} />
        CareerAI
      </Link>

      <div style={styles.right}>
        {user ? (
          <>
            <div style={styles.creditPill}>
              <span style={{ color: '#1D9E75', fontSize: 14 }}>⬡</span>
              <span style={styles.creditNum}>{credits ?? '...'}</span>
              <span style={{ color: '#6b7280' }}>credits</span>
            </div>
            <Link href="/dashboard" style={styles.navLink}>Dashboard</Link>
            <button onClick={handleLogout} style={styles.logoutBtn}>Sign out</button>
          </>
        ) : (
          <>
            <Link href="/pricing" style={styles.navLink}>Pricing</Link>
            <Link href="/auth/login" style={styles.loginBtn}>Sign in</Link>
            <Link href="/auth/signup" className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
              Get started free
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    background: 'white',
    borderBottom: '1px solid #f3f4f6',
    padding: '0 24px',
    height: 56,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontWeight: 700,
    fontSize: 16,
    color: '#111827',
  },
  logoDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#1D9E75',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  creditPill: {
    background: '#f9fafb',
    border: '1px solid #f3f4f6',
    borderRadius: 20,
    padding: '4px 12px',
    fontSize: 13,
    display: 'flex',
    alignItems: 'center',
    gap: 5,
  },
  creditNum: {
    fontWeight: 700,
    color: '#111827',
  },
  navLink: {
    fontSize: 13,
    color: '#6b7280',
    padding: '4px 8px',
  },
  loginBtn: {
    fontSize: 13,
    color: '#374151',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: '7px 14px',
  },
  logoutBtn: {
    background: 'none',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: '7px 14px',
    fontSize: 13,
    color: '#374151',
    cursor: 'pointer',
  },
}