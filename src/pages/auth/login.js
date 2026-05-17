import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const router = useRouter()

  async function handleLogin(e) {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      return setError('Please fill in all fields.')
    }

    setLoading(true)

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      setError('Invalid email or password.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <Link href="/" style={styles.logo}>
          <div style={styles.logoDot} />
          CareerAI
        </Link>

        <h1 style={styles.h1}>Welcome back</h1>
        <p style={styles.subtitle}>Sign in to your account.</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              placeholder="rahul@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '11px 0', fontSize: 14 }}
          >
            {loading ? (
              <><span className="spinner" /> Signing in...</>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <p style={styles.switchText}>
          New here?{' '}
          <Link href="/auth/signup" style={{ color: '#1D9E75', fontWeight: 600 }}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    background: '#f9fafb',
  },
  card: {
    background: 'white',
    border: '1px solid #f3f4f6',
    borderRadius: 16,
    padding: 32,
    width: '100%',
    maxWidth: 400,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    fontWeight: 700,
    fontSize: 16,
    color: '#111827',
    marginBottom: 24,
  },
  logoDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#1D9E75',
  },
  h1: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 24,
  },
  switchText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#6b7280',
    marginTop: 20,
  },
}