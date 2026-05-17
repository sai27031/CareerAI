import { useState } from 'react'
import Link from 'next/link'
import Navbar from '../components/Navbar'

export default function PricingPage() {

  async function handleSubscribe(plan, amount) {
    const res = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, amount }),
    })

    const data = await res.json()

    if (data.error) {
      alert(data.error)
      return
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: amount,
      currency: 'INR',
      name: 'CareerAI',
      description: plan === 'monthly' ? 'Monthly Plan — ₹199' : 'Yearly Plan — ₹899',
      order_id: data.orderId,
      handler: async function (response) {
        const verify = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...response, plan }),
        })
        const result = await verify.json()
        if (result.success) {
          alert('Payment successful! Your plan is now active.')
          window.location.href = '/dashboard'
        } else {
          alert('Payment verification failed. Please contact support.')
        }
      },
      prefill: {
        name: '',
        email: '',
      },
      theme: {
        color: '#1D9E75',
      },
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  return (
    <div>
      <Navbar />

      {/* Razorpay SDK */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" />

      <section style={styles.section}>
        <h1 style={styles.h1}>Simple pricing</h1>
        <p style={styles.subtitle}>Start free. Upgrade when you need more.</p>

        <div style={styles.grid}>

          {/* Free Plan */}
          <div className="card" style={styles.planCard}>
            <div style={styles.planName}>Free</div>
            <div style={styles.planPrice}>₹0</div>
            <div style={styles.planPeriod}>forever</div>
            <ul style={styles.featureList}>
              <li style={styles.featureItem}><span style={styles.check}>✓</span> 100 credits on signup</li>
              <li style={styles.featureItem}><span style={styles.check}>✓</span> AI Resume Generator</li>
              <li style={styles.featureItem}><span style={styles.check}>✓</span> AI Job Match Score</li>
              <li style={styles.featureItem}><span style={styles.check}>✓</span> No credit card needed</li>
            </ul>
            <Link
              href="/auth/signup"
              className="btn-outline"
              style={{ width: '100%', justifyContent: 'center', padding: '10px 0' }}
            >
              Get started free
            </Link>
          </div>

          {/* Monthly Plan */}
          <div className="card" style={{ ...styles.planCard, border: '2px solid #1D9E75' }}>
            <div className="badge-green" style={{ marginBottom: 12 }}>
              Most popular
            </div>
            <div style={styles.planName}>Monthly</div>
            <div style={styles.planPrice}>₹199</div>
            <div style={styles.planPeriod}>per month</div>
            <ul style={styles.featureList}>
              <li style={styles.featureItem}><span style={styles.check}>✓</span> Unlimited credits</li>
              <li style={styles.featureItem}><span style={styles.check}>✓</span> AI Resume Generator</li>
              <li style={styles.featureItem}><span style={styles.check}>✓</span> AI Job Match Score</li>
              <li style={styles.featureItem}><span style={styles.check}>✓</span> Priority support</li>
            </ul>
            <button
              onClick={() => handleSubscribe('monthly', 19900)}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '10px 0' }}
            >
              Subscribe — ₹199/mo
            </button>
          </div>

          {/* Yearly Plan */}
          <div className="card" style={styles.planCard}>
            <div style={styles.planName}>Yearly</div>
            <div style={styles.planPrice}>₹899</div>
            <div style={styles.planPeriod}>per year · save 62%</div>
            <ul style={styles.featureList}>
              <li style={styles.featureItem}><span style={styles.check}>✓</span> Unlimited credits</li>
              <li style={styles.featureItem}><span style={styles.check}>✓</span> AI Resume Generator</li>
              <li style={styles.featureItem}><span style={styles.check}>✓</span> AI Job Match Score</li>
              <li style={styles.featureItem}><span style={styles.check}>✓</span> Priority support</li>
            </ul>
            <button
              onClick={() => handleSubscribe('yearly', 89900)}
              className="btn-outline"
              style={{ width: '100%', justifyContent: 'center', padding: '10px 0' }}
            >
              Subscribe — ₹899/yr
            </button>
          </div>

        </div>
      </section>
    </div>
  )
}

const styles = {
  section: {
    maxWidth: 860,
    margin: '0 auto',
    padding: '60px 24px',
    textAlign: 'center',
  },
  h1: {
    fontSize: 32,
    fontWeight: 700,
    marginBottom: 10,
  },
  subtitle: {
    color: '#6b7280',
    fontSize: 15,
    marginBottom: 40,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 20,
    textAlign: 'left',
  },
  planCard: {
    padding: 24,
    borderRadius: 14,
  },
  planName: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: 500,
    marginBottom: 6,
  },
  planPrice: {
    fontSize: 36,
    fontWeight: 700,
    color: '#111827',
    marginBottom: 4,
  },
  planPeriod: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 20,
  },
  featureList: {
    listStyle: 'none',
    marginBottom: 24,
  },
  featureItem: {
    fontSize: 13,
    color: '#6b7280',
    padding: '5px 0',
    display: 'flex',
    gap: 8,
    alignItems: 'flex-start',
  },
  check: {
    color: '#1D9E75',
    fontWeight: 700,
    flexShrink: 0,
  },
}