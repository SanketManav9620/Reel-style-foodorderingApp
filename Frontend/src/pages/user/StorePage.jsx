import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { API_BASE_URL } from '../../config/api'

// Dedicated store video catalog - strictly separated per store!
const storeCatalogMap = {
  'the liquid lounge': [
    {
      _id: 'll1',
      name: 'Artisanal Berry Mocktail',
      description: 'Refreshing handcrafted summer drink infused with wild berries, floral lavender, citrus, and sparkling soda.',
      price: 249,
      videoUrl: '/videos/video4.mp4',
      likesCount: '31.5k',
      category: 'Beverages'
    },
    {
      _id: 'll2',
      name: 'Tropical Citrus Cooler',
      description: 'Zesty orange, passionfruit, and mint cooler served over crushed ice.',
      price: 199,
      videoUrl: '/videos/video4.mp4',
      likesCount: '18.8k',
      category: 'Beverages'
    }
  ],
  'burger palace': [
    {
      _id: 'bp1',
      name: 'Sizzling Double Cheese Burger',
      description: 'Juicy flame-grilled gourmet burger loaded with melted cheddar, fresh lettuce, pickles, and secret sauce.',
      price: 299,
      videoUrl: '/videos/video3.mp4',
      likesCount: '24.2k',
      category: 'Burgers'
    },
    {
      _id: 'bp2',
      name: 'Smokey Bacon Cheese Smash Burger',
      description: 'Double crispy smashed beef patties with cheddar cheese and smoked bacon.',
      price: 349,
      videoUrl: '/videos/video3.mp4',
      likesCount: '22.1k',
      category: 'Burgers'
    }
  ],
  'royal biryani house': [
    {
      _id: 'rb1',
      name: 'Hyderabadi Dum Biryani',
      description: 'Fragrant basmati rice cooked with rich aromatic spices, tender meat, saffron, and fresh herbs.',
      price: 349,
      videoUrl: '/videos/video1.mp4',
      likesCount: '14.2k',
      category: 'Biryani'
    },
    {
      _id: 'rb2',
      name: 'Mutton Shahi Dum Biryani',
      description: 'Slow-cooked succulent mutton chunks layered with long grain basmati rice and fried onions.',
      price: 449,
      videoUrl: '/videos/video1.mp4',
      likesCount: '19.3k',
      category: 'Biryani'
    }
  ],
  'the biryani express': [
    {
      _id: 'be1',
      name: 'Special Dum Biryani Plate',
      description: 'Slow-cooked authentic handi biryani served piping hot with raita and spicy salan.',
      price: 399,
      videoUrl: '/videos/video2.mp4',
      likesCount: '18.9k',
      category: 'Biryani'
    },
    {
      _id: 'be2',
      name: 'Chicken 65 Special Platter',
      description: 'Crispy spicy fried chicken tossed in curry leaves, garlic, and yogurt sauce.',
      price: 299,
      videoUrl: '/videos/video2.mp4',
      likesCount: '15.8k',
      category: 'Starters'
    }
  ]
}

const demoStoresMap = {
  'demo1': {
    _id: 'demo1',
    name: 'Royal Biryani House',
    ownerName: 'Chef Zaheer',
    phone: '+91 98765 43210',
    address: '42 Royal Palace Road, Koramangala',
    city: 'Bangalore',
    cuisineType: 'Hyderabadi Biryani',
    rating: '4.9 ★',
    customerServe: '14.2K'
  },
  'demo2': {
    _id: 'demo2',
    name: 'The Biryani Express',
    ownerName: 'Chef Tariq',
    phone: '+91 87654 32100',
    address: '18 Grand Avenue, Indiranagar',
    city: 'Bangalore',
    cuisineType: 'Mughlai & Biryani',
    rating: '4.8 ★',
    customerServe: '18.9K'
  },
  'demo3': {
    _id: 'demo3',
    name: 'Burger Palace',
    ownerName: 'Chef Marco',
    phone: '+91 76543 21000',
    address: '7 Flame Lane, HSR Layout',
    city: 'Bangalore',
    cuisineType: 'American Grill',
    rating: '4.9 ★',
    customerServe: '24.1K'
  },
  'demo4': {
    _id: 'demo4',
    name: 'The Liquid Lounge',
    ownerName: 'Mixologist Riya',
    phone: '+91 65432 10000',
    address: '99 Chill Drive, Whitefield',
    city: 'Bangalore',
    cuisineType: 'Beverages & Cocktails',
    rating: '4.9 ★',
    customerServe: '31.5K'
  }
}

const StorePage = () => {
  const { partnerId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [partner, setPartner] = useState(location.state?.partner || null)
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [activeReelModal, setActiveReelModal] = useState(null)
  const [isFollowing, setIsFollowing] = useState(false)

  useEffect(() => {
    let isMounted = true
    window.scrollTo(0, 0)

    const rawParam = partnerId || ''
    const decodedId = decodeURIComponent(rawParam).trim()

    // 1. Identify Store Partner Info
    let targetPartner = location.state?.partner || null

    if (!targetPartner) {
      if (demoStoresMap[decodedId]) {
        targetPartner = demoStoresMap[decodedId]
      } else {
        const found = Object.values(demoStoresMap).find(
          s => s.name.toLowerCase() === decodedId.toLowerCase()
        )
        if (found) targetPartner = found
      }
    }

    const storeName = targetPartner?.name || decodedId || 'Sweet Cravings'
    const storeKey = storeName.toLowerCase()

    // Default store specific videos for demo stores
    const defaultStoreFoods = storeCatalogMap[storeKey] || []

    if (targetPartner) setPartner(targetPartner)

    // 2. Fetch Store Profile & Videos from Database if 24-char ObjectId
    if (decodedId && decodedId.length === 24) {
      setLoading(true)
      fetch(`${API_BASE_URL}/food/partner/${decodedId}`)
        .then(res => res.json())
        .then(data => {
          if (!isMounted) return
          if (data.partner) setPartner(data.partner)
          // Strictly show ONLY dishes belonging to this partner!
          if (data.foods && Array.isArray(data.foods) && data.foods.length > 0) {
            setFoods(data.foods)
          } else {
            setFoods(defaultStoreFoods)
          }
        })
        .catch(() => {
          if (isMounted) setFoods(defaultStoreFoods)
        })
        .finally(() => {
          if (isMounted) setLoading(false)
        })
    } else {
      // For non-objectId or demo stores, fetch system foods and strictly filter by store name/ID
      setLoading(true)
      fetch(`${API_BASE_URL}/food/all`)
        .then(res => res.json())
        .then(data => {
          if (!isMounted) return
          if (data.foods && data.foods.length > 0) {
            const matched = data.foods.filter(f => {
              if (!f.foodPartner) return false
              if (typeof f.foodPartner === 'object') {
                return f.foodPartner._id === decodedId || 
                       (f.foodPartner.name && f.foodPartner.name.toLowerCase() === storeKey)
              }
              return f.foodPartner === decodedId
            })
            // If backend has items for this store, show them. Otherwise show default store-specific catalog
            setFoods(matched.length > 0 ? matched : defaultStoreFoods)
          } else {
            setFoods(defaultStoreFoods)
          }
        })
        .catch(() => {
          if (isMounted) setFoods(defaultStoreFoods)
        })
        .finally(() => {
          if (isMounted) setLoading(false)
        })
    }

    return () => { isMounted = false }
  }, [partnerId, location.state])

  // Derive dynamic store details
  const storeName = partner?.name || decodeURIComponent(partnerId || 'Sweet Cravings')
  const storeAddress = partner?.address 
    ? (partner.city ? `${partner.address}, ${partner.city}` : partner.address)
    : '99 Dessert Drive, Whitefield, Bangalore'
  const cuisine = partner?.cuisineType || 'Multi-Cuisine & Gourmet Treats'
  const ownerName = partner?.ownerName || 'Master Chef'
  const phone = partner?.phone || '+91 98765 43210'

  // Dynamic calculations for stats
  const totalMealsCount = foods.length
  
  const getCustomerServed = (name) => {
    if (partner?.customerServe) return partner.customerServe
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    const count = (Math.abs(hash) % 35 + 12)
    return `${count}.4K`
  }

  const customerServed = getCustomerServed(storeName)

  // Extract categories dynamically from the store's ACTUAL food items
  const availableCategories = ['All', ...Array.from(new Set(foods.map(f => f.category).filter(Boolean)))]

  // Filter video reels by selected category
  const filteredFoods = selectedCategory === 'All' 
    ? foods 
    : foods.filter(f => (f.category || '').toLowerCase().includes(selectedCategory.toLowerCase()))

  return (
    <div className="sp-page-container">
      {/* Ambient Lighting Glow Effects */}
      <div className="sp-ambient-bg">
        <div className="sp-aura-top"></div>
        <div className="sp-aura-bottom"></div>
      </div>

      {/* Floating Navigation Header Bar */}
      <nav className="sp-navbar">
        <button className="sp-back-btn" onClick={() => navigate(-1)}>
          <i className="ri-arrow-left-line"></i> Back to Feed
        </button>

        <div className="sp-nav-title">
          <i className="ri-store-3-line" style={{ color: '#10b981' }}></i>
          <span>{storeName}</span>
        </div>

        <div className="sp-nav-actions">
          <button className="sp-icon-btn" title="Share Store" onClick={() => alert('Store link copied to clipboard!')}>
            <i className="ri-share-line"></i>
          </button>
          <button className="sp-icon-btn" title="Call Store" onClick={() => window.open(`tel:${phone}`)}>
            <i className="ri-phone-line"></i>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="sp-content-wrapper">
        <div className="sp-hero-card">
          
          {/* Header Card Banner matching exact pill badge specs */}
          <div className="sp-hero-banner">
            <div className="sp-hero-top-row">
              {/* Profile Avatar */}
              <div className="sp-avatar-wrapper">
                <div className="sp-avatar-circle">
                  <i className="ri-restaurant-2-line"></i>
                </div>
                <div className="sp-verified-badge" title="Verified Food Partner">
                  <i className="ri-checkbox-circle-fill"></i>
                </div>
              </div>

              {/* Stacked Green Pill Badges for Business Name and Address */}
              <div className="sp-pills-col">
                <div className="sp-pill-badge" title={storeName}>
                  <i className="ri-store-2-line"></i>
                  <span className="sp-pill-text">{storeName}</span>
                </div>
                <div className="sp-pill-badge" title={storeAddress}>
                  <i className="ri-map-pin-2-line"></i>
                  <span className="sp-pill-text">{storeAddress}</span>
                </div>
              </div>
            </div>

            {/* Chef Info & Cuisine Chips */}
            <div className="sp-meta-row">
              <span className="sp-meta-chip">
                <i className="ri-user-star-fill"></i> {ownerName}
              </span>
              <span className="sp-meta-chip">
                <i className="ri-goblet-line"></i> {cuisine}
              </span>
              <span className="sp-meta-chip">
                <i className="ri-star-fill" style={{ color: '#f59e0b' }}></i> 4.9 Rating
              </span>
            </div>

            {/* Key Statistics Row Cards */}
            <div className="sp-stats-grid">
              <div className="sp-stat-card">
                <span className="sp-stat-label">total meals</span>
                <span className="sp-stat-value">{totalMealsCount}</span>
                <span className="sp-stat-subtext">Listed Dishes</span>
              </div>
              <div className="sp-stat-card">
                <span className="sp-stat-label">customer serve</span>
                <span className="sp-stat-value">{customerServed}</span>
                <span className="sp-stat-subtext">Happy Foodies</span>
              </div>
              <div className="sp-stat-card">
                <span className="sp-stat-label">rating</span>
                <span className="sp-stat-value">4.9 ★</span>
                <span className="sp-stat-subtext">Top Quality</span>
              </div>
            </div>

            {/* Interactive Actions */}
            <div className="sp-actions-bar">
              <button 
                className={`sp-primary-btn ${isFollowing ? 'following' : ''}`}
                onClick={() => setIsFollowing(!isFollowing)}
              >
                <i className={isFollowing ? "ri-user-check-line" : "ri-user-add-line"}></i>
                {isFollowing ? 'Following Store' : 'Follow Store'}
              </button>
              <button className="sp-secondary-btn" onClick={() => window.open(`tel:${phone}`)}>
                <i className="ri-phone-fill"></i> Order Call
              </button>
            </div>
          </div>

          {/* Dark Blue Video Section with 3-Column Grid */}
          <div className="sp-video-section">
            <div className="sp-section-header">
              <div className="sp-section-title">
                <i className="ri-movie-2-line"></i>
                <span>Store Video Reels</span>
              </div>
              <span className="sp-reel-count-tag">{filteredFoods.length} Videos</span>
            </div>

            {/* Dynamic Category Filter Pills */}
            <div className="sp-tabs-row">
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  className={`sp-tab-chip ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* 3-Column Video Grid */}
            <div className="sp-video-grid">
              {loading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="sp-grid-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="ri-loader-4-line spin-icon" style={{ fontSize: '1.5rem', color: '#10b981' }}></i>
                  </div>
                ))
              ) : filteredFoods.length > 0 ? (
                filteredFoods.map((item, idx) => (
                  <div 
                    key={item._id || idx} 
                    className="sp-grid-card"
                    onClick={() => setActiveReelModal(item)}
                  >
                    {item.videoUrl ? (
                      <video 
                        src={item.videoUrl} 
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

                    <div className="sp-grid-info-overlay">
                      <span className="sp-grid-title">{item.name || 'Special Recipe'}</span>
                      <div className="sp-grid-bottom-row">
                        <span className="sp-grid-price">₹{item.price || 299}</span>
                        <span className="sp-grid-likes">
                          <i className="ri-heart-3-fill"></i> {item.likesCount || '12.4k'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ gridColumn: '1 / -1', padding: '3.5rem 1rem', textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <i className="ri-film-line" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.6rem', color: '#475569' }}></i>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.3rem' }}>
                    No {selectedCategory !== 'All' ? selectedCategory : ''} Dishes Available
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    {storeName} does not currently have any items listed in this category.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Full Interactive Video Reel Modal Player */}
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
                  onClick={() => alert(`Order placed for ${activeReelModal.name}!`)}
                  style={{
                    background: '#10b981',
                    border: 'none',
                    color: '#fff',
                    padding: '0.5rem 1.2rem',
                    borderRadius: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Order Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StorePage
