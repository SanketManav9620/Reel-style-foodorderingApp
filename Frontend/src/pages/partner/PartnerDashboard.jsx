import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../../config/api'

const PartnerDashboard = () => {
  const [foodItems, setFoodItems] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [videoFile, setVideoFile] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    videoUrl: '',
    imageUrl: '',
    category: ''
  })

  const navigate = useNavigate()

  // Fetch partner's food items
  useEffect(() => {
    fetchFoodItems()
  }, [])

  const fetchFoodItems = async () => {
    setFetchLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/food/my-items`, { credentials: 'include' })
      if (res.status === 401) {
        navigate('/partner/login')
        return
      }
      const data = await res.json()
      setFoodItems(data.foods || [])
    } catch {
      // Silently fail
    } finally {
      setFetchLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (error) setError('')
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setVideoFile(file)
      if (error) setError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      let res;

      // If a video file is selected, send multipart/form-data to ImageKit.io handler
      if (videoFile) {
        const bodyData = new FormData()
        bodyData.append('name', formData.name)
        bodyData.append('description', formData.description)
        bodyData.append('price', formData.price)
        bodyData.append('category', formData.category || 'General')
        bodyData.append('imageUrl', formData.imageUrl || '')
        bodyData.append('video', videoFile)

        res = await fetch(`${API_BASE_URL}/food/add`, {
          method: 'POST',
          credentials: 'include',
          body: bodyData
        })
      } else {
        // Otherwise send JSON with videoUrl text input
        if (!formData.videoUrl) {
          throw new Error('Please upload a video file or enter a video URL')
        }

        res = await fetch(`${API_BASE_URL}/food/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            ...formData,
            price: Number(formData.price)
          })
        })
      }

      let data;
      const contentType = res.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        data = await res.json()
      } else {
        const text = await res.text()
        if (res.status === 401) {
          throw new Error('Partner session expired. Please login again.')
        }
        throw new Error(`Server returned error (${res.status}): ${text.replace(/<[^>]*>?/gm, '').substring(0, 80)}`)
      }

      if (!res.ok) {
        throw new Error(data?.message || 'Failed to add food item')
      }

      setSuccess('🎉 Food item and video reel added successfully!')
      setFormData({ name: '', description: '', price: '', videoUrl: '', imageUrl: '', category: '' })
      setVideoFile(null)
      setShowAddForm(false)
      fetchFoodItems()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setShowLogoutModal(true)
  }

  const confirmLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/partner/logout`, { credentials: 'include' })
    } catch { /* ignore */ }
    setShowLogoutModal(false)
    navigate('/')
  }

  return (
    <div className="partner-dashboard">
      {/* Header */}
      <header className="pd-header">
        <Link to="/" className="feed-brand">
          <div className="feed-brand-icon pd-brand-icon">
            <i className="ri-store-2-line"></i>
          </div>
          <span>Partner Dashboard</span>
        </Link>
        <div className="pd-header-actions">
          <button className="pd-add-btn" onClick={() => setShowAddForm(true)}>
            <i className="ri-add-circle-line"></i> Add Food Item
          </button>
          <button className="feed-logout-btn" onClick={handleLogout}>
            <i className="ri-logout-box-r-line"></i> Logout
          </button>
        </div>
      </header>

      {/* Status Alerts */}
      {success && (
        <div className="pd-alert pd-alert-success">
          <i className="ri-checkbox-circle-line"></i> {success}
        </div>
      )}
      {error && (
        <div className="pd-alert pd-alert-error">
          <i className="ri-error-warning-line"></i> {error}
        </div>
      )}

      {/* Stats Summary */}
      <div className="pd-stats">
        <div className="pd-stat-card">
          <i className="ri-restaurant-line"></i>
          <div>
            <h3>{foodItems.length}</h3>
            <p>Food Items Listed</p>
          </div>
        </div>
        <div className="pd-stat-card">
          <i className="ri-video-line"></i>
          <div>
            <h3>{foodItems.filter(f => f.videoUrl).length}</h3>
            <p>Video Reels</p>
          </div>
        </div>
        <div className="pd-stat-card">
          <i className="ri-cloud-line"></i>
          <div>
            <h3>ImageKit.io</h3>
            <p>Cloud Storage</p>
          </div>
        </div>
      </div>

      {/* Food Items Grid */}
      <section className="pd-section">
        <div className="pd-section-header">
          <h2><i className="ri-restaurant-2-line"></i> Your Food Items & Video Reels</h2>
        </div>

        {fetchLoading ? (
          <div className="pd-loading">
            <i className="ri-loader-4-line ri-spin"></i>
            <p>Loading your food items...</p>
          </div>
        ) : foodItems.length === 0 ? (
          <div className="pd-empty">
            <i className="ri-restaurant-line"></i>
            <h3>No Food Items Listed Yet</h3>
            <p>Add your first food item and video reel to showcase it on Reel Food!</p>
            <button className="pd-add-btn" onClick={() => setShowAddForm(true)}>
              <i className="ri-add-circle-line"></i> Add Your First Item
            </button>
          </div>
        ) : (
          <div className="pd-food-grid">
            {foodItems.map(item => (
              <div className="pd-food-card" key={item._id}>
                {item.videoUrl && (
                  <div className="pd-food-video-wrap">
                    <video
                      src={item.videoUrl}
                      muted
                      loop
                      playsInline
                      onMouseEnter={e => e.target.play()}
                      onMouseLeave={e => { e.target.pause(); e.target.currentTime = 0 }}
                    />
                    <div className="pd-food-video-overlay">
                      <i className="ri-play-circle-line"></i>
                    </div>
                  </div>
                )}
                <div className="pd-food-info">
                  <div className="pd-food-top">
                    <h3>{item.name}</h3>
                    <span className="pd-food-price">₹{item.price}</span>
                  </div>
                  <p className="pd-food-desc">{item.description}</p>
                  <div className="pd-food-tags">
                    {item.category && (
                      <span className="pd-food-category">{item.category}</span>
                    )}
                    {item.videoUrl && item.videoUrl.includes('imagekit.io') && (
                      <span className="pd-cloud-badge">
                        <i className="ri-cloud-line"></i> ImageKit Hosted
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Add Food Item Modal Form */}
      {showAddForm && (
        <div className="feed-drawer-overlay" onClick={() => setShowAddForm(false)}>
          <div className="pd-modal" onClick={e => e.stopPropagation()}>
            <div className="pd-modal-header">
              <h2><i className="ri-add-circle-line"></i> Add Food Item & Upload Reel</h2>
              <button className="feed-drawer-close" onClick={() => setShowAddForm(false)}>
                <i className="ri-close-line"></i>
              </button>
            </div>

            <form className="pd-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="food-name">Food Name</label>
                <div className="input-wrapper">
                  <i className="ri-restaurant-line input-icon"></i>
                  <input
                    type="text"
                    id="food-name"
                    name="name"
                    className="input-control"
                    placeholder="e.g. Sizzling Gourmet Burger"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="food-desc">Description</label>
                <div className="input-wrapper">
                  <i className="ri-file-text-line input-icon" style={{ top: '1rem' }}></i>
                  <textarea
                    id="food-desc"
                    name="description"
                    className="input-control pd-textarea"
                    placeholder="Describe your mouth-watering dish..."
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={3}
                  />
                </div>
              </div>

              <div className="pd-form-row">
                <div className="form-group">
                  <label htmlFor="food-price">Price (₹)</label>
                  <div className="input-wrapper">
                    <i className="ri-money-rupee-circle-line input-icon"></i>
                    <input
                      type="number"
                      id="food-price"
                      name="price"
                      className="input-control"
                      placeholder="349"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      min="1"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="food-category">Category</label>
                  <div className="input-wrapper">
                    <i className="ri-price-tag-3-line input-icon"></i>
                    <input
                      type="text"
                      id="food-category"
                      name="category"
                      className="input-control"
                      placeholder="e.g. Burgers, Pizza"
                      value={formData.category}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* ImageKit Video File Upload */}
              <div className="form-group">
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Upload Video Reel</span>
                  <span style={{ fontSize: '0.75rem', color: '#34d399' }}>
                    <i className="ri-cloud-upload-line"></i> ImageKit.io Online Storage
                  </span>
                </label>
                <div className="input-wrapper">
                  <i className="ri-upload-cloud-2-line input-icon"></i>
                  <input
                    type="file"
                    accept="video/*"
                    className="input-control"
                    onChange={handleFileChange}
                    style={{ paddingLeft: '2.8rem' }}
                  />
                </div>
                {videoFile && (
                  <p style={{ fontSize: '0.8rem', color: '#34d399', marginTop: '0.25rem' }}>
                    Selected: {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                )}
              </div>

              {/* Fallback Video URL input */}
              <div className="form-group">
                <label htmlFor="food-video">Or Video URL Link (Fallback)</label>
                <div className="input-wrapper">
                  <i className="ri-video-line input-icon"></i>
                  <input
                    type="text"
                    id="food-video"
                    name="videoUrl"
                    className="input-control"
                    placeholder="/videos/video1.mp4 or https://..."
                    value={formData.videoUrl}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="food-image">Image URL (optional)</label>
                <div className="input-wrapper">
                  <i className="ri-image-line input-icon"></i>
                  <input
                    type="text"
                    id="food-image"
                    name="imageUrl"
                    className="input-control"
                    placeholder="https://... (optional)"
                    value={formData.imageUrl}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button type="submit" className="btn-submit pd-submit" disabled={loading}>
                {loading ? (
                  <>
                    <i className="ri-loader-4-line ri-spin"></i> Uploading to ImageKit...
                  </>
                ) : (
                  <>
                    <i className="ri-upload-cloud-line"></i> Upload Reel & List Food
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="logout-modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="logout-modal-card" onClick={e => e.stopPropagation()}>
            <div className="logout-modal-icon-wrapper">
              <i className="ri-logout-box-r-line"></i>
            </div>
            <h3 className="logout-modal-title">Confirm Logout</h3>
            <p className="logout-modal-message">
              Are you sure you want to logout from Partner Dashboard?
            </p>
            <div className="logout-modal-actions">
              <button 
                className="logout-modal-btn cancel-btn" 
                onClick={() => setShowLogoutModal(false)}
              >
                No, Stay
              </button>
              <button 
                className="logout-modal-btn confirm-btn" 
                onClick={confirmLogout}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PartnerDashboard
