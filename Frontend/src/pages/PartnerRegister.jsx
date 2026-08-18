import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config/api'

const PartnerRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    cuisineType: 'Multi-Cuisine',
    licenseNumber: '',
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
      const response = await fetch(`${API_BASE_URL}/auth/partner/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.message || (typeof data === 'string' ? data : 'Partner registration failed.'))
      }

      setSuccess('Food Partner registered successfully! Redirecting to dashboard...')
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

      <div className="auth-card" style={{ maxWidth: '600px' }}>
        <div className="auth-header">
          <div className="auth-brand-badge">
            <i className="ri-restaurant-2-line"></i> Partner Onboarding
          </div>
          <h1>Register Your Restaurant</h1>
          <p>Provide your business details to start selling on Reel Food</p>
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
          {/* Grid Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {/* Restaurant Name */}
            <div className="form-group">
              <label htmlFor="name">Restaurant / Brand Name *</label>
              <div className="input-wrapper">
                <i className="ri-store-2-line input-icon"></i>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="input-control"
                  placeholder="e.g. Spice Route Bistro"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Owner Name */}
            <div className="form-group">
              <label htmlFor="ownerName">Owner / Contact Name *</label>
              <div className="input-wrapper">
                <i className="ri-user-star-line input-icon"></i>
                <input
                  type="text"
                  id="ownerName"
                  name="ownerName"
                  className="input-control"
                  placeholder="e.g. John Doe"
                  value={formData.ownerName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Business Email */}
            <div className="form-group">
              <label htmlFor="email">Business Email *</label>
              <div className="input-wrapper">
                <i className="ri-mail-line input-icon"></i>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="input-control"
                  placeholder="contact@restaurant.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="form-group">
              <label htmlFor="phone">Contact Phone *</label>
              <div className="input-wrapper">
                <i className="ri-phone-line input-icon"></i>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="input-control"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* City */}
            <div className="form-group">
              <label htmlFor="city">City / Region *</label>
              <div className="input-wrapper">
                <i className="ri-map-pin-2-line input-icon"></i>
                <input
                  type="text"
                  id="city"
                  name="city"
                  className="input-control"
                  placeholder="e.g. Mumbai, Delhi, NY"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Cuisine Category */}
            <div className="form-group">
              <label htmlFor="cuisineType">Primary Cuisine Category *</label>
              <div className="input-wrapper">
                <i className="ri-restaurant-line input-icon"></i>
                <select
                  id="cuisineType"
                  name="cuisineType"
                  className="input-control"
                  value={formData.cuisineType}
                  onChange={handleChange}
                  required
                  style={{ appearance: 'none', cursor: 'pointer' }}
                >
                  <option value="Multi-Cuisine">Multi-Cuisine</option>
                  <option value="Fast Food">Fast Food & Burgers</option>
                  <option value="Indian">Indian / Mughlai</option>
                  <option value="Chinese / Asian">Chinese & Asian</option>
                  <option value="Italian & Pizza">Italian & Pizza</option>
                  <option value="Bakery & Desserts">Bakery & Desserts</option>
                  <option value="Beverages & Cafe">Beverages & Cafe</option>
                </select>
              </div>
            </div>
          </div>

          {/* Full Address */}
          <div className="form-group">
            <label htmlFor="address">Full Restaurant Address *</label>
            <div className="input-wrapper">
              <i className="ri-building-line input-icon"></i>
              <input
                type="text"
                id="address"
                name="address"
                className="input-control"
                placeholder="Shop No., Street, Area Landmark"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {/* FSSAI / License Number */}
            <div className="form-group">
              <label htmlFor="licenseNumber">
                Food License / FSSAI (Optional)
              </label>
              <div className="input-wrapper">
                <i className="ri-shield-check-line input-icon"></i>
                <input
                  type="text"
                  id="licenseNumber"
                  name="licenseNumber"
                  className="input-control"
                  placeholder="e.g. 12345678901234"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">Account Password *</label>
              <div className="input-wrapper">
                <i className="ri-lock-2-line input-icon"></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  className="input-control"
                  placeholder="Create password"
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
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? (
              <>
                <i className="ri-loader-4-line ri-spin"></i> Submitting Application...
              </>
            ) : (
              <>
                Submit Partner Registration <i className="ri-arrow-right-line"></i>
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already registered as a food partner?{' '}
            <Link to="/partner/login">Log In</Link>
          </p>
          <div className="role-switcher-banner">
            Looking for regular customer sign up?{' '}
            <Link to="/user/register">User Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PartnerRegister
