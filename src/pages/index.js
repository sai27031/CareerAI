import Link from 'next/link'
import Navbar from '../components/Navbar'

export default function HomePage() {
  return (
    <div>
      <Navbar />

      {/* Hero Section */}
      <section style={styles.hero}>
        <div className="badge-green" style={{ marginBottom: 20 }}>
          🎁 100 free credits on signup — no credit card needed
        </div>
        <h1 style={styles.h1}>
          AI tools built for<br />
          <span style={{ color: '#1D9E75' }}>job seekers</span>
        </h1>
        <p style={styles.subtitle}>
          Generate professional resumes and check how well your profile matches
          any job description — powered by AI, in seconds.
        </p>
        <div style={styles.actions}>
          <Link href="/auth/signup" className="btn-primary" style={{ padding: '12px 28px', fontSize: 15 }}>
            Start for free
          </Link>
          <Link href="/pricing" className="btn-outline" style={{ padding: '12px 28px', fontSize: 15 }}>
            See pricing
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.featuresSection}>
        <div style={styles.featuresGrid}>
          <div className="card" style={styles.featureCard}>
            <div style={styles.featureIcon}>📄</div>
            <h3 style={styles.featureTitle}>AI Resume Generator</h3>
            <p style={styles.featureDesc}>
              Fill in your details and get a complete, ATS-friendly resume
              tailored to your target role.
            </p>
            <span className="badge-green">10 credits per use</span>
          </div>

          <div className="card" style={styles.featureCard}>
            <div style={styles.featureIcon}>📊</div>
            <h3 style={styles.featureTitle}>AI Job Match Score</h3>
            <p style={styles.featureDesc}>
              Paste any job description and see how well your profile matches
              with a detailed breakdown.
            </p>
            <span className="badge-green">5 credits per use</span>
          </div>

          <div className="card" style={styles.featureCard}>
            <div style={styles.featureIcon}>🎁</div>
            <h3 style={styles.featureTitle}>100 Free Credits</h3>
            <p style={styles.featureDesc}>
              Every new account gets 100 credits instantly. That is 10 resumes
              or 20 job matches for free.
            </p>
            <span className="badge-green">Free on signup</span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>
          Ready to land your next job?
        </h2>
        <p style={{ color: '#6b7280', marginBottom: 28, fontSize: 15 }}>
          Join thousands of job seekers using CareerAI.
        </p>
        <Link href="/auth/signup" className="btn-primary" style={{ padding: '12px 32px', fontSize: 15 }}>
          Get started — it is free
        </Link>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1D9E75' }} />
          <span style={{ fontWeight: 700 }}>CareerAI</span>
        </div>
        <p style={{ color: '#9ca3af', fontSize: 13, marginTop: 8 }}>
          © {new Date().getFullYear()} CareerAI. All rights reserved.
        </p>
      </footer>
    </div>
  )
}

const styles = {
  hero: {
    textAlign: 'center',
    padding: '80px 24px 60px',
    maxWidth: 700,
    margin: '0 auto',
  },
  h1: {
    fontSize: 44,
    fontWeight: 700,
    lineHeight: 1.2,
    marginBottom: 18,
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 1.7,
    marginBottom: 36,
    maxWidth: 500,
    margin: '0 auto 36px',
  },
  actions: {
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  featuresSection: {
    maxWidth: 960,
    margin: '0 auto',
    padding: '20px 24px 80px',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 20,
  },
  featureCard: {
    padding: 24,
  },
  featureIcon: {
    fontSize: 28,
    marginBottom: 14,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 8,
    color: '#111827',
  },
  featureDesc: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 1.6,
    marginBottom: 14,
  },
  ctaSection: {
    background: '#f0fdf8',
    border: '1px solid #d1fae5',
    borderRadius: 16,
    padding: '60px 24px',
    textAlign: 'center',
    maxWidth: 700,
    margin: '0 auto 80px',
  },
  footer: {
    borderTop: '1px solid #f3f4f6',
    padding: '32px 24px',
    textAlign: 'center',
  },
}