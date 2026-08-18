import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../../config/api'

const LikedReelsPage = () => {
  const navigate = useNavigate()
  const [likedList, setLikedList] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeReelModal, setActiveReelModal] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchLikedReels()
  }, [])

  const fetchLikedReels = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/food/user/liked`, { credentials: 'include' })
      const data = await res.json()
      if (data.likedItems && data.likedItems.length > 0) {
        setLikedList(data.likedItems)
      } else {
        setLikedList([])
      }
    } catch (err) {
      console.error("Fetch liked reels error:", err)
      setLikedList([])
    } finally {
      setLoading(false)
    }
  }

  const handleUnlike = async (foodId, e) => {
    if (e) e.stopPropagation()
    try {
      await fetch(`${API_BASE_URL}/food/${foodId}/like`, {
        method: 'POST',
        credentials: 'include'
      })
      setLikedList(prev => prev.filter(item => (item.food?._id || item._id) !== foodId))
      if (activeReelModal && activeReelModal._id === foodId) {
        setActiveReelModal(null)
      }
    } catch (err) {
      console.error("Unlike error:", err)
    }
  }

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'Recently'
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  return (
    <div className="sp-page-container">
      {/* Ambient Background Glows */}
      <div className="sp-ambient-bg">
        <div className="sp-aura-top" style={{ background: 'radial-gradient(circle, rgba(239, 68, 68, 0.18) 0%, transparent 70%)' }}></div>
        <div className="sp-aura-bottom" style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)' }}></div>
      </div>

      {/* Floating Header Navbar */}
      <nav className="sp-navbar">
        <button className="sp-back-btn" onClick={() => navigate('/feed')}>
          <i className="ri-arrow-left-line"></i> Back to Feed
        </button>

        <div className="sp-nav-title">
          <i className="ri-heart-3-fill" style={{ color: '#ef4444' }}></i>
          <span>Liked Reels</span>
        </div>

        <div className="sp-nav-actions">
          <button className="sp-icon-btn" title="Saved Reels" onClick={() => navigate('/user/saved')}>
            <i className="ri-bookmark-3-fill" style={{ color: '#f59e0b' }}></i>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="sp-content-wrapper">
        <div className="sp-hero-card">
          
          {/* Header Summary Banner */}
          <div className="sp-hero-banner" style={{ background: 'linear-gradient(135deg, #3b1116 0%, #1e090b 100%)' }}>
            <div className="sp-hero-top-row">
              <div className="sp-avatar-wrapper">
                <div className="sp-avatar-circle" style={{ background: 'linear-gradient(135deg, #991b1b, #ef4444)', borderColor: '#ef4444' }}>
                  <i className="ri-heart-3-fill" style={{ color: '#fff' }}></i>
                </div>
              </div>

              <div className="sp-pills-col">
                <div className="sp-pill-badge" style={{ background: 'rgba(153, 27, 27, 0.85)', borderColor: '#ef4444' }}>
                  <i className="ri-heart-pulse-fill" style={{ color: '#fca5a5' }}></i>
                  <span className="sp-pill-text">My Favorite Food Reels</span>
                </div>
                <div className="sp-pill-badge" style={{ background: 'rgba(30, 41, 59, 0.85)', borderColor: 'rgba(255,255,255,0.2)' }}>
                  <i className="ri-film-fill" style={{ color: '#34d399' }}></i>
                  <span className="sp-pill-text">{likedList.length} Reels Saved in Favorites</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3-Column Video Reels Grid Section */}
          <div className="sp-video-section">
            <div className="sp-section-header">
              <div className="sp-section-title">
                <i className="ri-heart-3-line" style={{ color: '#ef4444' }}></i>
                <span>Your Liked Food Collection</span>
              </div>
              <span className="sp-reel-count-tag" style={{ color: '#fca5a5', background: 'rgba(239,68,68,0.15)' }}>
                {likedList.length} Items
              </span>
            </div>

            {/* Video Grid */}
            <div className="sp-video-grid">
              {loading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="sp-grid-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="ri-loader-4-line spin-icon" style={{ fontSize: '1.5rem', color: '#ef4444' }}></i>
                  </div>
                ))
              ) : likedList.length > 0 ? (
                likedList.map((item, idx) => {
                  const food = item.food || item
                  return (
                    <div 
                      key={food._id || idx} 
                      className="sp-grid-card"
                      onClick={() => setActiveReelModal(food)}
                    >
                      {food.videoUrl ? (
                        <video 
                          src={food.videoUrl} 
                          preload="metadata"
                          muted 
                          loop 
                          playsInline 
                          onMouseOver={e => e.target.play().catch(() => {})} 
                          onMouseOut={e => e.target.pause()} 
                        />
                      ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>
                          video
                        </div>
                      )}

                      <div className="sp-grid-play-icon">
                        <i className="ri-play-fill"></i>
                      </div>

                      {/* Unlike quick button on thumbnail */}
                      <button 
                        onClick={(e) => handleUnlike(food._id, e)}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          left: '8px',
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: 'rgba(239, 68, 68, 0.85)',
                          border: 'none',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          zIndex: 10
                        }}
                        title="Unlike Reel"
                      >
                        <i className="ri-heart-dislike-line"></i>
                      </button>

                      <div className="sp-grid-info-overlay">
                        <span className="sp-grid-title">{food.name || 'Liked Dish'}</span>
                        <div className="sp-grid-bottom-row">
                          <span className="sp-grid-price">₹{food.price || 299}</span>
                          <span className="sp-grid-likes" style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                            <i className="ri-time-line"></i> {formatTimeAgo(item.likedAt || item.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div style={{ gridColumn: '1 / -1', padding: '4rem 1rem', textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <i className="ri-heart-add-line" style={{ fontSize: '3rem', display: 'block', marginBottom: '0.75rem', color: '#ef4444' }}></i>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.4rem' }}>No Liked Reels Yet</h3>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.5rem', maxWidth: '320px', margin: '0 auto 1.5rem auto' }}>
                    Tap the heart icon on any reel in your feed to save your favorite food videos here!
                  </p>
                  <button 
                    onClick={() => navigate('/feed')}
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      border: 'none',
                      color: '#fff',
                      padding: '0.65rem 1.5rem',
                      borderRadius: '14px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Explore Food Reels
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Full Reel Video Player Modal */}
      {activeReelModal && (
        <div className="sp-reel-modal-overlay" onClick={() => setActiveReelModal(null)}>
          <div className="sp-reel-modal-content" onClick={e => e.stopPropagation()}>
            <button className="sp-reel-close-btn" onClick={() => setActiveReelModal(null)}>
              <i className="ri-close-line"></i>
            </button>

            <video 
              src={activeReelModal.videoUrl} 
              autoPlay 
              controls 
              loop 
              playsInline 
              className="sp-reel-video-player"
            />

            <div className="sp-reel-overlay-caption">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>{activeReelModal.name}</h3>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.4 }}>{activeReelModal.description}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#4ade80' }}>₹{activeReelModal.price}</span>
                <button 
                  onClick={(e) => handleUnlike(activeReelModal._id, e)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#f87171',
                    padding: '0.5rem 1.2rem',
                    borderRadius: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <i className="ri-heart-dislike-line"></i> Unlike Reel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LikedReelsPage
