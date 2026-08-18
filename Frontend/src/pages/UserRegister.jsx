import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config/api'

const UserRegister = () => {
  const [formData, setFormData] = useState({
    username: '',
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
      const response = await fetch(`${API_BASE_URL}/auth/user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.message || (typeof data === 'string' ? data : 'Registration failed.'))
      }

      setSuccess('Account created successfully! Redirecting to your feed...')
      setTimeout(() => {
        navigate('/feed')
      }, 1500)
    } catch (err) {
      setError(err.message || 'Failed to connect to backend server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page-container user-mode">
      <Link to="/" className="nav-home-btn">
        <i className="ri-arrow-left-line"></i> Back Home
      </Link>

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-brand-badge">
            <i className="ri-user-add-line"></i> Create Account
          </div>
          <h1>Join as a User</h1>
          <p>Sign up to explore & order your favorite food</p>
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
          {/* Username field */}
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-wrapper">
              <i className="ri-user-line input-icon"></i>
              <input
                type="text"
                id="username"
                name="username"
                className="input-control"
                placeholder="Choose a unique username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Email field */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <i className="ri-mail-line input-icon"></i>
              <input
                type="email"
                id="email"
                name="email"
                className="input-control"
                placeholder="name@example.com"
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
                placeholder="Create a strong password"
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
                <i className="ri-loader-4-line ri-spin"></i> Creating Account...
              </>
            ) : (
              <>
                Register Account <i className="ri-arrow-right-line"></i>
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/user/login">Log In</Link>
          </p>
          <div className="role-switcher-banner">
            Want to register as a Food Partner?{' '}
            <Link to="/partner/register">Partner Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserRegister
