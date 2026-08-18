import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../../config/api'
import StoreProfileCard from '../../components/StoreProfileCard'

// Demo data fallback when no DB items exist (likes default to 0 like an actual platform)
const demoReels = [
  {
    _id: 'demo1',
    name: 'Sizzling Gourmet Burger',
    description: 'Flame-grilled Angus patty with caramelized onions, smoked gouda, and truffle aioli on a brioche bun.',
    price: 349,
    videoUrl: '/videos/video1.mp4',
    category: 'Burgers',
    likesCount: 0,
    commentsCount: 128,
    foodPartner: {
      name: 'Burger Palace',
      handle: 'burgerpalace_official',
      ownerName: 'Chef Marco',
      phone: '+91 98765 43210',
      address: '42 Flame Street, Koramangala',
      city: 'Bangalore',
      cuisineType: 'American Grill'
    }
  },
  {
    _id: 'demo2',
    name: 'Woodfired Artisan Pizza',
    description: 'Hand-stretched dough topped with San Marzano tomatoes, fresh mozzarella, basil, and drizzled with extra-virgin olive oil.',
    price: 499,
    videoUrl: '/videos/video2.mp4',
    category: 'Pizza',
    likesCount: 0,
    commentsCount: 245,
    foodPartner: {
      name: 'Bella Italia',
      handle: 'bellaitalia_pizzeria',
      ownerName: 'Chef Luigi',
      phone: '+91 87654 32100',
      address: '18 Via Roma, Indiranagar',
      city: 'Bangalore',
      cuisineType: 'Italian'
    }
  },
  {
    _id: 'demo3',
    name: 'Chef Special Masterclass',
    description: 'A curated tasting menu featuring seasonal delicacies, molecular gastronomy bites, and signature sauces.',
    price: 799,
    videoUrl: '/videos/video3.mp4',
    category: 'Fine Dining',
    likesCount: 0,
    commentsCount: 312,
    foodPartner: {
      name: 'Kitchen Confidential',
      handle: 'kitchen_confidential',
      ownerName: 'Chef Ananya',
      phone: '+91 76543 21000',
      address: '7 Gourmet Lane, HSR Layout',
      city: 'Bangalore',
      cuisineType: 'Multi-Cuisine'
    }
  },
  {
    _id: 'demo4',
    name: 'Decadent Chocolate Lava',
    description: 'Rich dark chocolate cake with a molten center, served with vanilla bean ice cream and raspberry coulis.',
    price: 299,
    videoUrl: '/videos/video4.mp4',
    category: 'Desserts',
    likesCount: 0,
    commentsCount: 420,
    foodPartner: {
      name: 'Sweet Cravings',
      handle: 'sweetcravings_bakery',
      ownerName: 'Pastry Chef Riya',
      phone: '+91 65432 10000',
      address: '99 Dessert Drive, Whitefield',
      city: 'Bangalore',
      cuisineType: 'Bakery & Desserts'
    }
  }
]

const UserFeed = () => {
  const [reels, setReels] = useState(demoReels)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [likedReels, setLikedReels] = useState({})
  const [savedReels, setSavedReels] = useState({})
  const [followingMap, setFollowingMap] = useState({})
  
  const [showComments, setShowComments] = useState(false)
  const [showStorePopup, setShowStorePopup] = useState(false)
  const [showSavedDrawer, setShowSavedDrawer] = useState(false)
  const [showLikedDrawer, setShowLikedDrawer] = useState(false)

  const [savedList, setSavedList] = useState([])
  const [likedList, setLikedList] = useState([])

  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState({})
  const [mutedState, setMutedState] = useState(true)

  const feedContainerRef = useRef(null)
  const videoRefs = useRef([])
  const slideRefs = useRef([])
  const isScrollingRef = useRef(false)
  const navigate = useNavigate()

  // Fetch reels from API
  useEffect(() => {
    const fetchReels = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/food/all`, { credentials: 'include' })
        const data = await res.json()
        if (data.foods && data.foods.length > 0) {
          setReels(data.foods)
        }
      } catch {
        // Fallback to demo reels
      }
    }
    fetchReels()
  }, [])

  // Fetch user liked & saved interactions from MongoDB
  useEffect(() => {
    const fetchInteractions = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/food/user/interactions`, { credentials: 'include' })
        const data = await res.json()
        if (data.likedMap) setLikedReels(data.likedMap)
        if (data.savedMap) setSavedReels(data.savedMap)
      } catch (err) {
        console.error("Fetch interactions error:", err)
      }
    }
    fetchInteractions()
  }, [])

  // IntersectionObserver: Triggers active reel playback when 75% of slide is scrolled into view
  useEffect(() => {
    const container = feedContainerRef.current
    if (!container) return

    const observerOptions = {
      root: container,
      rootMargin: '0px',
      threshold: 0.75
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.75) {
          const index = Number(entry.target.getAttribute('data-index'))
          if (!isNaN(index) && index !== currentIndex) {
            setCurrentIndex(index)
          }
        }
      })
    }, observerOptions)

    slideRefs.current.forEach((slide) => {
      if (slide) observer.observe(slide)
    })

    return () => {
      observer.disconnect()
    }
  }, [reels, currentIndex])

  // Play/pause logic — ensure ONLY 1 video plays at a time
  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (video) {
        if (i === currentIndex) {
          const playPromise = video.play()
          if (playPromise !== undefined) {
            playPromise.catch(() => {})
          }
        } else {
          video.pause()
          video.currentTime = 0
        }
      }
    })
  }, [currentIndex, reels])

  // Smooth scroll helper
  const scrollToIndex = (index) => {
    if (index < 0 || index >= reels.length) return
    const container = feedContainerRef.current
    if (container && slideRefs.current[index]) {
      isScrollingRef.current = true
      slideRefs.current[index].scrollIntoView({ behavior: 'smooth', block: 'start' })
      setTimeout(() => {
        isScrollingRef.current = false
      }, 500)
    }
  }

  // Smooth Keyboard Arrow Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showComments || showStorePopup || showSavedDrawer || showLikedDrawer) return
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        if (currentIndex < reels.length - 1) {
          e.preventDefault()
          scrollToIndex(currentIndex + 1)
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        if (currentIndex > 0) {
          e.preventDefault()
          scrollToIndex(currentIndex - 1)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, reels.length, showComments, showStorePopup, showSavedDrawer, showLikedDrawer])

  // Smooth Mouse Wheel Navigation over feed container
  const handleWheelScroll = (e) => {
    if (showComments || showStorePopup || showSavedDrawer || showLikedDrawer || isScrollingRef.current) return

    if (e.deltaY > 25) {
      if (currentIndex < reels.length - 1) {
        scrollToIndex(currentIndex + 1)
      }
    } else if (e.deltaY < -25) {
      if (currentIndex > 0) {
        scrollToIndex(currentIndex - 1)
      }
    }
  }

  // Toggle Like API Call & State Sync
  const toggleLike = async (reelId) => {
    const isCurrentlyLiked = !!likedReels[reelId]

    // Optimistic UI Update
    setLikedReels(prev => {
      const next = { ...prev }
      if (isCurrentlyLiked) {
        delete next[reelId]
      } else {
        next[reelId] = { likedAt: new Date() }
      }
      return next
    })

    setReels(prev => prev.map(r => {
      if (r._id === reelId) {
        const curLikes = r.likesCount || 0
        return { ...r, likesCount: isCurrentlyLiked ? Math.max(0, curLikes - 1) : curLikes + 1 }
      }
      return r
    }))

    // API Call
    try {
      const res = await fetch(`${API_BASE_URL}/food/${reelId}/like`, {
        method: 'POST',
        credentials: 'include'
      })
      const data = await res.json()
      if (data.likesCount !== undefined) {
        setReels(prev => prev.map(r => r._id === reelId ? { ...r, likesCount: data.likesCount } : r))
      }
    } catch (err) {
      console.error("Toggle like error:", err)
    }
  }

  // Toggle Save Later API Call & State Sync
  const toggleSave = async (reelId) => {
    const isCurrentlySaved = !!savedReels[reelId]

    // Optimistic UI Update
    setSavedReels(prev => {
      const next = { ...prev }
      if (isCurrentlySaved) {
        delete next[reelId]
      } else {
        next[reelId] = { savedAt: new Date() }
      }
      return next
    })

    // API Call
    try {
      await fetch(`${API_BASE_URL}/food/${reelId}/save`, {
        method: 'POST',
        credentials: 'include'
      })
    } catch (err) {
      console.error("Toggle save error:", err)
    }
  }

  // Fetch Liked Reels from Database
  const fetchLikedList = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/food/user/liked`, { credentials: 'include' })
      const data = await res.json()
      if (data.likedItems) {
        setLikedList(data.likedItems)
      } else {
        // Fallback for demo reels
        const fallback = Object.keys(likedReels).map(id => {
          const matched = reels.find(r => r._id === id) || demoReels.find(r => r._id === id)
          return {
            _id: id,
            food: matched,
            likedAt: likedReels[id]?.likedAt || new Date()
          }
        }).filter(item => item.food != null)
        setLikedList(fallback)
      }
    } catch {
      const fallback = Object.keys(likedReels).map(id => {
        const matched = reels.find(r => r._id === id) || demoReels.find(r => r._id === id)
        return {
          _id: id,
          food: matched,
          likedAt: likedReels[id]?.likedAt || new Date()
        }
      }).filter(item => item.food != null)
      setLikedList(fallback)
    }
  }

  // Fetch Saved Reels from Database
  const fetchSavedList = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/food/user/saved`, { credentials: 'include' })
      const data = await res.json()
      if (data.savedItems) {
        setSavedList(data.savedItems)
      } else {
        // Fallback for demo reels
        const fallback = Object.keys(savedReels).map(id => {
          const matched = reels.find(r => r._id === id) || demoReels.find(r => r._id === id)
          return {
            _id: id,
            food: matched,
            savedAt: savedReels[id]?.savedAt || new Date()
          }
        }).filter(item => item.food != null)
        setSavedList(fallback)
      }
    } catch {
      const fallback = Object.keys(savedReels).map(id => {
        const matched = reels.find(r => r._id === id) || demoReels.find(r => r._id === id)
        return {
          _id: id,
          food: matched,
          savedAt: savedReels[id]?.savedAt || new Date()
        }
      }).filter(item => item.food != null)
      setSavedList(fallback)
    }
  }

  const toggleFollow = (partnerId) => {
    setFollowingMap(prev => ({ ...prev, [partnerId]: !prev[partnerId] }))
  }

  const addComment = (reelId) => {
    if (!commentText.trim()) return
    setComments(prev => ({
      ...prev,
      [reelId]: [...(prev[reelId] || []), { text: commentText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]
    }))
    setCommentText('')
  }

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/user/logout`, { credentials: 'include' })
    } catch { /* ignore */ }
    navigate('/')
  }

  const currentReel = reels[currentIndex] || reels[0]
  const likedCount = Object.keys(likedReels).length
  const savedCount = Object.keys(savedReels).length

  // Helper format timestamp nicely
  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'Just now'
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} mins ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="feed-page-wrapper">
      {/* Dynamic blurred ambient video background mesh behind mobile mockup */}
      <div className="feed-ambient-bg">
        {currentReel && (
          <video
            key={currentReel._id}
            src={currentReel.videoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="feed-ambient-video"
          />
        )}
        <div className="feed-ambient-overlay"></div>
      </div>

      {/* LEFT SIDE FLOATING QUICK ACCESS CONTROLS (Watch Liked Reels & Watch Saved Reels) */}
      <div className="feed-left-floating-controls">
        <button 
          className="floating-ctrl-btn" 
          title="Watch Liked Reels"
          onClick={() => navigate('/user/liked')}
        >
          <i className="ri-heart-3-fill" style={{ color: '#ef4444' }}></i>
          {likedCount > 0 && <span className="hdr-badge">{likedCount}</span>}
          <span className="floating-ctrl-label">Liked</span>
        </button>

        <button 
          className="floating-ctrl-btn" 
          title="Watch Saved Reels"
          onClick={() => navigate('/user/saved')}
        >
          <i className="ri-bookmark-3-fill" style={{ color: '#f59e0b' }}></i>
          {savedCount > 0 && <span className="hdr-badge">{savedCount}</span>}
          <span className="floating-ctrl-label">Saved</span>
        </button>
      </div>

      {/* RIGHT SIDE FLOATING SCROLL CONTROLS (Scroll Up ▲ & Scroll Down ▼) */}
      <div className="feed-right-floating-controls">
        <button 
          className="floating-ctrl-btn" 
          title="Scroll Up to Previous Reel"
          disabled={currentIndex === 0}
          onClick={() => scrollToIndex(currentIndex - 1)}
        >
          <i className="ri-arrow-up-s-line"></i>
          <span className="floating-ctrl-label">Prev</span>
        </button>

        <button 
          className="floating-ctrl-btn" 
          title="Scroll Down to Next Reel"
          disabled={currentIndex === reels.length - 1}
          onClick={() => scrollToIndex(currentIndex + 1)}
        >
          <i className="ri-arrow-down-s-line"></i>
          <span className="floating-ctrl-label">Next</span>
        </button>
      </div>

      {/* Main Instagram Mobile Frame Container */}
      <div className="instagram-mobile-shell">
        {/* Mobile Device Header Bar */}
        <div className="mobile-status-bar">
          <div className="mobile-camera-notch">
            <span className="notch-camera"></span>
            <span className="notch-sensor"></span>
          </div>
          <div className="mobile-header-branding">
            <span className="insta-logo-text">Reel Food ⚡</span>
            <span className="insta-live-pill"><span className="live-dot"></span> REELS</span>
          </div>

          <div className="mobile-header-actions">
            {/* Mute Toggle Button */}
            <button className="icon-hdr-btn" title="Toggle Mute" onClick={() => setMutedState(!mutedState)}>
              <i className={mutedState ? 'ri-volume-mute-fill' : 'ri-volume-up-fill'}></i>
            </button>

            {/* Logout Button */}
            <button className="icon-hdr-btn" title="Logout" onClick={handleLogout}>
              <i className="ri-logout-box-r-line"></i>
            </button>
          </div>
        </div>

        {/* Scrollable Reels Container */}
        <div
          className="instagram-reels-feed"
          ref={feedContainerRef}
          onWheel={handleWheelScroll}
        >
          {reels.map((reel, index) => {
            const isLiked = !!likedReels[reel._id]
            const isSaved = !!savedReels[reel._id]
            const isFollowing = followingMap[reel.foodPartner?.name || reel._id]
            
            // Likes default to 0 for actual platform behavior
            const baseLikes = reel.likesCount || 0
            const displayLikes = isLiked ? baseLikes + (reel.likesCount ? 0 : 1) : baseLikes
            const isActive = index === currentIndex

            return (
              <div
                key={reel._id}
                ref={el => slideRefs.current[index] = el}
                data-index={index}
                className={`instagram-reel-slide ${isActive ? 'active-slide' : ''}`}
              >
                {/* Full Reel Video */}
                <video
                  ref={el => videoRefs.current[index] = el}
                  className="reel-video-element"
                  src={reel.videoUrl}
                  preload={isActive ? "auto" : "metadata"}
                  loop
                  muted={mutedState}
                  playsInline
                  onClick={() => {
                    const v = videoRefs.current[index]
                    if (v) {
                      v.paused ? v.play() : v.pause()
                    }
                  }}
                />

                {/* Dark Vignette Overlay */}
                <div className="reel-vignette"></div>

                {/* Left Bottom Instagram Caption Overlay */}
                <div className="instagram-reel-caption">
                  {/* Partner Handle & Follow Row */}
                  <div className="insta-user-row">
                    <div
                      className="insta-avatar"
                      onClick={() => { setShowStorePopup(true); setShowComments(false) }}
                    >
                      <i className="ri-store-3-line"></i>
                    </div>
                    <span className="insta-username">
                      @{reel.foodPartner?.handle || (reel.foodPartner?.name || 'food_partner').toLowerCase().replace(/\s+/g, '_')}
                    </span>
                    <button
                      className={`insta-follow-btn ${isFollowing ? 'following' : ''}`}
                      onClick={() => toggleFollow(reel.foodPartner?.name || reel._id)}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </div>

                  {/* Food Item Name & Description */}
                  <h3 className="insta-food-title">{reel.name}</h3>
                  <p className="insta-food-desc">{reel.description}</p>

                  {/* Category Pill & Price */}
                  <div className="insta-tags-row">
                    <span className="insta-price-badge">₹{reel.price}</span>
                    {reel.category && <span className="insta-cat-tag">#{reel.category}</span>}
                    <span className="insta-cuisine-tag">#{reel.foodPartner?.cuisineType || 'FoodReels'}</span>
                  </div>

                  {/* Audio Track Ticker */}
                  <div className="insta-audio-ticker">
                    <i className="ri-music-2-fill"></i>
                    <div className="ticker-text">
                      <span>{reel.foodPartner?.name || 'Chef Special'} • Original Audio Sound</span>
                    </div>
                  </div>

                  {/* Visit Store Button below Reel Caption */}
                  <button
                    className="insta-visit-store-btn"
                    onClick={() => {
                      const pId = typeof reel.foodPartner === 'object' ? reel.foodPartner?._id || reel.foodPartner?.name : reel.foodPartner || 'Sweet Cravings'
                      navigate(`/store/${encodeURIComponent(pId)}`, { state: { partner: reel.foodPartner, reel } })
                    }}
                  >
                    <i className="ri-store-2-line"></i> Visit Store — {reel.foodPartner?.name || 'View Menu'}
                    <i className="ri-arrow-right-s-line" style={{ marginLeft: 'auto' }}></i>
                  </button>
                </div>

                {/* Right Action Bar (Instagram Reels Style) */}
                <div className="instagram-reel-sidebar">
                  {/* Like Button */}
                  <div className="sidebar-action-item">
                    <button
                      className={`action-icon-circle ${isLiked ? 'liked' : ''}`}
                      onClick={() => toggleLike(reel._id)}
                    >
                      <i className={isLiked ? 'ri-heart-3-fill' : 'ri-heart-3-line'}></i>
                    </button>
                    <span className="action-count">{displayLikes >= 1000 ? `${(displayLikes / 1000).toFixed(1)}k` : displayLikes}</span>
                  </div>

                  {/* Save Later Button */}
                  <div className="sidebar-action-item">
                    <button
                      className={`action-icon-circle ${isSaved ? 'saved' : ''}`}
                      onClick={() => toggleSave(reel._id)}
                      title={isSaved ? "Saved to list" : "Save for later"}
                    >
                      <i className={isSaved ? 'ri-bookmark-3-fill' : 'ri-bookmark-3-line'} style={{ color: isSaved ? '#f59e0b' : '#fff' }}></i>
                    </button>
                    <span className="action-count">{isSaved ? 'Saved' : 'Save'}</span>
                  </div>

                  {/* Comment Button */}
                  <div className="sidebar-action-item">
                    <button
                      className="action-icon-circle"
                      onClick={() => { setShowComments(true); setShowStorePopup(false) }}
                    >
                      <i className="ri-chat-3-line"></i>
                    </button>
                    <span className="action-count">
                      {(reel.commentsCount || 0) + (comments[reel._id] || []).length}
                    </span>
                  </div>

                  {/* Visit Store Side Button */}
                  <div className="sidebar-action-item">
                    <button
                      className="action-icon-circle store-action-icon"
                      onClick={() => {
                        const pId = typeof reel.foodPartner === 'object' ? reel.foodPartner?._id || reel.foodPartner?.name : reel.foodPartner || 'Sweet Cravings'
                        navigate(`/store/${encodeURIComponent(pId)}`, { state: { partner: reel.foodPartner, reel } })
                      }}
                    >
                      <i className="ri-shopping-bag-3-line"></i>
                    </button>
                    <span className="action-count">Store</span>
                  </div>

                  {/* Share Icon */}
                  <div className="sidebar-action-item">
                    <button className="action-icon-circle" onClick={() => alert('Link copied to clipboard!')}>
                      <i className="ri-send-plane-line"></i>
                    </button>
                    <span className="action-count">Share</span>
                  </div>

                  {/* Spinning Audio Vinyl Disc */}
                  <div className="sidebar-action-item">
                    <div className={`spinning-music-disc ${isActive ? 'spinning' : ''}`}>
                      <div className="disc-inner">
                        <i className="ri-music-fill"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Floating Scroll Nav Dots */}
        <div className="mobile-dots-indicator">
          {reels.map((_, i) => (
            <span
              key={i}
              className={`mobile-dot ${i === currentIndex ? 'active' : ''}`}
              onClick={() => scrollToIndex(i)}
            />
          ))}
        </div>
      </div>

      {/* User Liked Reels Drawer Modal */}
      {showLikedDrawer && (
        <div className="feed-drawer-overlay" onClick={() => setShowLikedDrawer(false)}>
          <div className="feed-drawer insta-comments-drawer" onClick={e => e.stopPropagation()}>
            <div className="feed-drawer-header">
              <div className="drawer-handle-bar"></div>
              <h3>
                <i className="ri-heart-3-fill" style={{ color: '#ef4444', marginRight: '0.4rem' }}></i>
                Liked Reels ({likedList.length})
              </h3>
              <button className="feed-drawer-close" onClick={() => setShowLikedDrawer(false)}>
                <i className="ri-close-line"></i>
              </button>
            </div>

            <div className="saved-items-list">
              {likedList.length === 0 ? (
                <div className="feed-no-comments" style={{ padding: '2.5rem 1rem' }}>
                  <i className="ri-heart-line" style={{ fontSize: '2.5rem', color: '#ef4444', marginBottom: '0.5rem' }}></i>
                  <p style={{ fontWeight: 600, color: '#e2e8f0' }}>No liked reels yet</p>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Tap the heart icon on any reel to save your favorite dishes here.</span>
                </div>
              ) : (
                likedList.map((item, idx) => {
                  const food = item.food || item
                  return (
                    <div key={item._id || idx} className="saved-item-card">
                      <div className="saved-item-thumb">
                        {food.videoUrl && <video src={food.videoUrl} muted loop playsInline />}
                      </div>

                      <div className="saved-item-details">
                        <span className="saved-item-title">{food.name || 'Food Reel'}</span>
                        <span className="saved-item-store">@{food.foodPartner?.name || 'Partner Store'}</span>
                        <span className="saved-item-price">₹{food.price || 299}</span>
                        <span className="saved-item-time">
                          <i className="ri-time-line"></i> Liked {formatTimeAgo(item.likedAt || item.timestamp)}
                        </span>
                      </div>

                      <div className="saved-item-actions">
                        <button 
                          className="saved-play-btn"
                          title="Play Reel"
                          onClick={() => {
                            const targetIdx = reels.findIndex(r => r._id === food._id)
                            if (targetIdx !== -1) scrollToIndex(targetIdx)
                            setShowLikedDrawer(false)
                          }}
                        >
                          <i className="ri-play-fill"></i>
                        </button>
                        <button 
                          className="saved-remove-btn"
                          title="Unlike"
                          onClick={() => {
                            toggleLike(food._id)
                            setLikedList(prev => prev.filter(l => (l.food?._id || l._id) !== food._id))
                          }}
                        >
                          <i className="ri-heart-dislike-line"></i>
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* User Saved Reels Drawer Modal */}
      {showSavedDrawer && (
        <div className="feed-drawer-overlay" onClick={() => setShowSavedDrawer(false)}>
          <div className="feed-drawer insta-comments-drawer" onClick={e => e.stopPropagation()}>
            <div className="feed-drawer-header">
              <div className="drawer-handle-bar"></div>
              <h3>
                <i className="ri-bookmark-3-fill" style={{ color: '#f59e0b', marginRight: '0.4rem' }}></i>
                Saved for Later ({savedList.length})
              </h3>
              <button className="feed-drawer-close" onClick={() => setShowSavedDrawer(false)}>
                <i className="ri-close-line"></i>
              </button>
            </div>

            <div className="saved-items-list">
              {savedList.length === 0 ? (
                <div className="feed-no-comments" style={{ padding: '2.5rem 1rem' }}>
                  <i className="ri-bookmark-line" style={{ fontSize: '2.5rem', color: '#f59e0b', marginBottom: '0.5rem' }}></i>
                  <p style={{ fontWeight: 600, color: '#e2e8f0' }}>No saved reels yet</p>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Tap the bookmark icon on any reel to save dishes to watch later.</span>
                </div>
              ) : (
                savedList.map((item, idx) => {
                  const food = item.food || item
                  return (
                    <div key={item._id || idx} className="saved-item-card">
                      <div className="saved-item-thumb">
                        {food.videoUrl && <video src={food.videoUrl} muted loop playsInline />}
                      </div>

                      <div className="saved-item-details">
                        <span className="saved-item-title">{food.name || 'Food Reel'}</span>
                        <span className="saved-item-store">@{food.foodPartner?.name || 'Partner Store'}</span>
                        <span className="saved-item-price">₹{food.price || 299}</span>
                        <span className="saved-item-time">
                          <i className="ri-time-line"></i> Saved {formatTimeAgo(item.savedAt || item.timestamp)}
                        </span>
                      </div>

                      <div className="saved-item-actions">
                        <button 
                          className="saved-play-btn"
                          title="Play Reel"
                          onClick={() => {
                            const targetIdx = reels.findIndex(r => r._id === food._id)
                            if (targetIdx !== -1) scrollToIndex(targetIdx)
                            setShowSavedDrawer(false)
                          }}
                        >
                          <i className="ri-play-fill"></i>
                        </button>
                        <button 
                          className="saved-remove-btn"
                          title="Remove from saved"
                          onClick={() => {
                            toggleSave(food._id)
                            setSavedList(prev => prev.filter(s => (s.food?._id || s._id) !== food._id))
                          }}
                        >
                          <i className="ri-bookmark-slash-line"></i>
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Instagram Style Comments Drawer */}
      {showComments && currentReel && (
        <div className="feed-drawer-overlay" onClick={() => setShowComments(false)}>
          <div className="feed-drawer insta-comments-drawer" onClick={e => e.stopPropagation()}>
            <div className="feed-drawer-header">
              <div className="drawer-handle-bar"></div>
              <h3>Comments ({((currentReel.commentsCount || 0) + (comments[currentReel._id] || []).length)})</h3>
              <button className="feed-drawer-close" onClick={() => setShowComments(false)}>
                <i className="ri-close-line"></i>
              </button>
            </div>

            <div className="feed-comments-list">
              {(comments[currentReel._id] || []).length === 0 ? (
                <div className="feed-no-comments">
                  <i className="ri-chat-heart-line"></i>
                  <p>No comments yet. Start the conversation!</p>
                </div>
              ) : (
                (comments[currentReel._id] || []).map((c, i) => (
                  <div className="feed-comment-item" key={i}>
                    <div className="feed-comment-avatar">
                      <i className="ri-user-smile-line"></i>
                    </div>
                    <div className="feed-comment-body">
                      <p className="comment-user"><strong>@foodie_user</strong> {c.text}</p>
                      <span className="feed-comment-time">{c.time}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="feed-comment-input-row">
              <input
                type="text"
                placeholder="Add a comment for Chef..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addComment(currentReel._id)}
              />
              <button onClick={() => addComment(currentReel._id)}>
                <i className="ri-send-plane-2-fill"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visit Store Modal Popup */}
      {showStorePopup && currentReel && (
        <div className="feed-drawer-overlay" onClick={() => setShowStorePopup(false)}>
          <div style={{ width: '92%', maxWidth: '480px', margin: 'auto' }} onClick={e => e.stopPropagation()}>
            <StoreProfileCard 
              partnerId={typeof currentReel.foodPartner === 'object' ? currentReel.foodPartner?._id : currentReel.foodPartner}
              initialPartner={typeof currentReel.foodPartner === 'object' ? currentReel.foodPartner : null}
              allReels={reels}
              onClose={() => setShowStorePopup(false)}
              onSelectVideo={(food) => {
                const targetIdx = reels.findIndex(r => r._id === food._id || r.name === food.name)
                if (targetIdx !== -1) {
                  setCurrentIndex(targetIdx)
                }
                setShowStorePopup(false)
              }}
            />
          </div>
        </div>
      )}

    </div>
  )
}

export default UserFeed
