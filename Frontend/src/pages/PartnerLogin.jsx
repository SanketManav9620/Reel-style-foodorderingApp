import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config/api'

const PartnerLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`${API_BASE_URL}/auth/partner/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.message || (typeof data === 'string' ? data : 'Login failed. Please check your partner credentials.'))
      }

      setSuccess('Partner Login successful! Redirecting to dashboard...')
      setTimeout(() => {
        navigate('/partner/dashboard')
      }, 1500)
    } catch (err) {
      setError(err.message || 'Failed to connect to backend server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page-container partner-mode">
      <Link to="/" className="nav-home-btn">
        <i className="ri-arrow-left-line"></i> Back Home
      </Link>

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-brand-badge">
            <i className="ri-store-3-line"></i> Food Partner Portal
          </div>
          <h1>Partner Login</h1>
          <p>Sign in to manage your food business & menu</p>
        </div>

        {error && (
          <div className="auth-alert auth-alert-error">
            <i className="ri-error-warning-line"></i> {error}
          </div>
        )}

        {success && (
          <div className="auth-alert auth-alert-success">
            <i className="ri-checkbox-circle-line"></i> {success}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Email field */}
          <div className="form-group">
            <label htmlFor="email">Partner Email Address</label>
            <div className="input-wrapper">
              <i className="ri-mail-line input-icon"></i>
              <input
                type="email"
                id="email"
                name="email"
                className="input-control"
                placeholder="partner@restaurant.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Password field */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <i className="ri-lock-2-line input-icon"></i>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className="input-control"
                placeholder="Enter your partner password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
              </button>
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? (
              <>
                <i className="ri-loader-4-line ri-spin"></i> Logging in...
              </>
            ) : (
              <>
                Access Partner Dashboard <i className="ri-arrow-right-line"></i>
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Not registered as a partner yet?{' '}
            <Link to="/partner/register">Register Business</Link>
          </p>
          <div className="role-switcher-banner">
            Looking for regular customer login?{' '}
            <Link to="/user/login">User Login</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PartnerLogin
