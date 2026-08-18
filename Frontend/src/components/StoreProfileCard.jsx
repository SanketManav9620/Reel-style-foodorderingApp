import React, { useEffect, useState } from 'react'
import { API_BASE_URL } from '../config/api'

const StoreProfileCard = ({ partnerId, initialPartner, initialFoods, allReels = [], onSelectVideo, onClose }) => {
  const [partner, setPartner] = useState(initialPartner || null)
  const [foods, setFoods] = useState(initialFoods || [])
  const [loading, setLoading] = useState(!initialPartner && !!partnerId)


  useEffect(() => {
    let isMounted = true;
    const targetName = initialPartner?.name || partner?.name;
    const targetId = partnerId || initialPartner?._id || partner?._id;

    // Filter system reels for this store
    const matchedFromSystem = allReels.filter(r => {
      if (!r.foodPartner) return false;
      if (targetId && (r.foodPartner._id === targetId || r.foodPartner === targetId)) return true;
      if (targetName && r.foodPartner.name && r.foodPartner.name.toLowerCase() === targetName.toLowerCase()) return true;
      return false;
    });

    if (partnerId && typeof partnerId === 'string' && partnerId.length === 24) {
      setLoading(true)
      fetch(`${API_BASE_URL}/food/partner/${partnerId}`)
        .then(res => res.json())
        .then(data => {
          if (!isMounted) return;
          if (data.partner || data.name) {
            const fetchedPartner = data.partner || data;
            const fetchedFoods = data.foods || [];
            
            // Combine backend foods and system reels
            const combined = [...fetchedFoods];
            matchedFromSystem.forEach(sysFood => {
              if (!combined.some(f => f._id === sysFood._id || f.name === sysFood.name)) {
                combined.push(sysFood);
              }
            });

            setPartner(fetchedPartner);
            setFoods(combined);
          } else if (matchedFromSystem.length > 0) {
            setFoods(matchedFromSystem);
          }
        })
        .catch(() => {
          if (matchedFromSystem.length > 0 && isMounted) {
            setFoods(matchedFromSystem);
          }
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        })
    } else {
      if (matchedFromSystem.length > 0) {
        setFoods(prev => {
          const combined = [...(initialFoods || prev)];
          matchedFromSystem.forEach(sf => {
            if (!combined.some(c => c._id === sf._id || c.name === sf.name)) {
              combined.push(sf);
            }
          });
          return combined;
        });
      }
    }

    return () => { isMounted = false; };
  }, [partnerId, initialPartner, allReels])

  if (loading) {
    return (
      <div className="store-profile-card" style={{ padding: '3rem', textAlign: 'center', color: '#fff' }}>
        <i className="ri-loader-4-line spin-icon" style={{ fontSize: '2rem', display: 'block', marginBottom: '1rem' }}></i>
        <p>Loading Store Profile...</p>
      </div>
    )
  }

  const currentPartner = partner || initialPartner || {}
  const businessName = currentPartner.name || 'Sweet Cravings'
  const addressText = currentPartner.address 
    ? (currentPartner.city ? `${currentPartner.address}, ${currentPartner.city}` : currentPartner.address)
    : '99 Dessert Drive, Whitefield'

  const totalMeals = foods.length || currentPartner.totalMeals || 43;

  // Dynamic customer served count based on store name
  const getCustomerServed = (name) => {
    if (currentPartner.customerServe) return currentPartner.customerServe;
    if (!name) return '15K';
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const count = (Math.abs(hash) % 35 + 10);
    return `${count}K`;
  }

  const customerServe = getCustomerServed(businessName);

  return (
    <div className="store-profile-card">
      {/* Reddish/Maroon Header Card matching exact user screenshot */}
      <div className="store-profile-header">
        {onClose && (
          <button 
            onClick={onClose} 
            style={{ 
              float: 'right', 
              background: 'transparent', 
              border: 'none', 
              color: '#fff', 
              fontSize: '1.4rem', 
              cursor: 'pointer',
              marginTop: '-0.5rem'
            }}
          >
            <i className="ri-close-line"></i>
          </button>
        )}

        <div className="store-profile-top-row">
          {/* Circular green Profile Picture */}
          <div className="store-avatar-circle">
            <i className="ri-store-3-line"></i>
          </div>

          {/* Stacked Green Pill Badges for Business Name and Address */}
          <div className="store-pills-container">
            <div className="store-pill-badge" title={businessName}>
              <span className="pill-text">{businessName}</span>
            </div>
            <div className="store-pill-badge" title={addressText}>
              <span className="pill-text">{addressText}</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="store-stats-row">
          <div className="store-stat-box">
            <span className="store-stat-label">total meals</span>
            <span className="store-stat-value">{totalMeals}</span>
          </div>
          <div className="store-stat-box">
            <span className="store-stat-label">customer serve</span>
            <span className="store-stat-value">{customerServe}</span>
          </div>
        </div>

        {/* Divider line separating Header from Video Section */}
        <div className="store-header-divider"></div>
      </div>

      {/* Dark Blue Video Section (3x3 Grid matching screenshot) */}
      <div className="store-video-grid-container">
        <div className="store-video-grid">
          {foods.length > 0 ? (
            foods.map((food, index) => (
              <div 
                key={food._id || index} 
                className="store-video-card"
                onClick={() => onSelectVideo && onSelectVideo(food)}
              >
                {food.videoUrl ? (
                  <video 
                    src={food.videoUrl} 
                    muted 
                    loop 
                    playsInline 
                    onMouseOver={e => e.target.play().catch(() => {})} 
                    onMouseOut={e => e.target.pause()} 
                  />
                ) : (
                  <span className="store-video-label-placeholder">video</span>
                )}
                
                <div className="store-video-overlay-info">
                  <span className="store-video-title">{food.name || 'video'}</span>
                  {food.price && <span className="store-video-price">₹{food.price}</span>}
                </div>
              </div>
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', padding: '2.5rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
              <i className="ri-film-line" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.4rem', color: '#475569' }}></i>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e2e8f0' }}>No videos available for this store yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StoreProfileCard

