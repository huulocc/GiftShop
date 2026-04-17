import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/AuthContext'
import './RegisterPage.scss'

function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
  })
  const [errors, setErrors] = useState([])
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors([])
    setSuccess('')
  }

  const validate = () => {
    const err = []
    if (!form.fullName.trim()) err.push('Full name is required')
    if (!form.username.trim()) err.push('Username is required')
    if (!form.email.trim()) err.push('Email is required')
    else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(form.email)) err.push('Please enter a valid email address')
    }
    if (!form.phone.trim()) err.push('Phone number is required')
    else {
      const phoneRegex = /^[+]?[\d\s\-().]{7,20}$/
      if (!phoneRegex.test(form.phone.trim())) err.push('Please enter a valid phone number')
    }
    if (!form.password) err.push('Password is required')
    else if (form.password.length < 6) err.push('Password must be at least 6 characters')
    if (form.password !== form.confirmPassword) err.push('Passwords do not match')
    return err
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setSubmitting(true)
    setErrors([])
    try {
      const result = await register({
        fullName: form.fullName.trim(),
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
        address: form.address.trim() || null,
      })

      if (result.success) {
        setSuccess('Account created successfully! Redirecting to login...')
        setTimeout(() => navigate('/login'), 1500)
      } else {
        setErrors([result.error || 'Registration failed'])
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'An unexpected error occurred'
      setErrors([msg])
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-header">
          <div className="auth-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          </div>
          <h1>Create Account</h1>
          <p>Join GiftShop and start shopping today</p>
        </div>

        {errors.length > 0 && (
          <div className="auth-alert auth-alert--error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <div>
              {errors.map((err, i) => <p key={i}>{err}</p>)}
            </div>
          </div>
        )}

        {success && (
          <div className="auth-alert auth-alert--success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <p>{success}</p>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-form-group">
            <label htmlFor="register-fullName">Full Name</label>
            <input
              id="register-fullName"
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              value={form.fullName}
              onChange={handleChange}
              autoComplete="name"
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="register-username">Username</label>
            <input
              id="register-username"
              type="text"
              name="username"
              placeholder="Choose a username"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="register-phone">
              Phone Number
            </label>
            <div className="auth-input-icon-wrap">
              <svg className="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.63a19.79 19.79 0 01-3.07-8.63A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.18 6.18l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
              </svg>
              <input
                id="register-phone"
                type="tel"
                name="phone"
                placeholder="e.g. 0901 234 567"
                value={form.phone}
                onChange={handleChange}
                autoComplete="tel"
              />
            </div>
          </div>

          <div className="auth-form-row">
            <div className="auth-form-group">
              <label htmlFor="register-password">Password</label>
              <input
                id="register-password"
                type="password"
                name="password"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>
            <div className="auth-form-group">
              <label htmlFor="register-confirmPassword">Confirm Password</label>
              <input
                id="register-confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="auth-form-group">
            <label htmlFor="register-address">Address <span className="auth-optional">(optional)</span></label>
            <input
              id="register-address"
              type="text"
              name="address"
              placeholder="Your shipping address"
              value={form.address}
              onChange={handleChange}
              autoComplete="street-address"
            />
          </div>

          <button
            type="submit"
            className="auth-btn"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="auth-spinner" />
                Creating Account...
              </>
            ) : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
