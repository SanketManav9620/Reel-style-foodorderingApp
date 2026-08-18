import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const videoList = [
  {
    id: 1,
    url: '/videos/video1.mp4',
    title: 'Sizzling Gourmet Burger',
    tag: '#CrispyBurger 🍔',
    chef: 'Chef Marco',
    likes: '14.2K'
  },
  {
    id: 2,
    url: '/videos/video2.mp4',
    title: 'Woodfired Artisan Pizza',
    tag: '#CheesyBurst 🍕',
    chef: 'Bella Italia',
    likes: '18.9K'
  },
  {
    id: 3,
    url: '/videos/video3.mp4',
    title: 'Chef Special Masterclass',
    tag: '#ChefSpecial 👨‍🍳',
    chef: 'Kitchen Confidential',
    likes: '24.1K'
  },
  {
    id: 4,
    url: '/videos/video4.mp4',
    title: 'Decadent Chocolate Lava',
    tag: '#DessertGasm 🍰',
    chef: 'Sweet Cravings',
    likes: '31.5K'
  }
]

const Home = () => {
  const [activeModalVideo, setActiveModalVideo] = useState(null)

  return (
    <div className="landing-wrapper">
      {/* Dynamic Blurred Video Mesh in Background */}
      <div className="video-bg-overlay">
        <video
          className="video-bg-video"
          src="/videos/video1.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="video-bg-gradient"></div>
      </div>

      {/* Top Navbar */}
      <header className="landing-nav">
        <Link to="/" className="brand-logo">
          <div className="brand-icon-box">
            <i className="ri-movie-2-line"></i>
          </div>
          <span className="brand-text">Reel Food</span>
        </Link>

        <div className="live-badge">
          <span className="live-dot"></span> 4.2k Food Reels Live Now
        </div>

        <div className="nav-actions">
          <Link to="/user/login" className="nav-link-btn user-btn">
            <i className="ri-user-3-line"></i> User Portal
          </Link>
          <Link to="/partner/login" className="nav-link-btn partner-btn">
            <i className="ri-store-3-line"></i> Partner Portal
          </Link>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="hero-content">
        <div className="hero-pill">
          <i className="ri-sparkles-line" style={{ color: '#ff5e3a' }}></i> Next-Gen Food Discovery Platform
        </div>
        <h1 className="hero-headline">
          Watch, Taste & Order <br />
          <span className="text-gradient-user">Fresh Food Reels</span> Live
        </h1>
        <p className="hero-subtext">
          Explore short, mouth-watering food videos created by local chefs and partners.
          Order instantly or join as a food partner to grow your business.
        </p>
      </main>

      {/* Action Cards Split Grid */}
      <section className="roles-grid">
        {/* User Card */}
        <div className="role-card-hero user-side">
          <div className="role-card-header">
            <span className="role-badge-tag">
              <i className="ri-user-heart-line"></i> For Food Lovers
            </span>
            <i className="ri-heart-3-fill" style={{ color: '#ff5e3a', fontSize: '1.2rem' }}></i>
          </div>
          <h2 className="card-title">Customer Account</h2>
          <p className="card-desc">
            Discover trending food videos near you, save favorite recipes, and get meals delivered straight to your door.
          </p>

          <div className="card-video-preview">
            <video
              className="card-video-element"
              src="/videos/video1.mp4"
              autoPlay
              loop
              muted
              playsInline
            />
            <div className="video-overlay-gradient">
              <span className="video-tag-pill">
                <i className="ri-play-fill"></i> Watch & Order
              </span>
            </div>
          </div>

          <div className="card-actions-row">
            <Link to="/user/login" className="action-btn-main action-btn-primary">
              Log In <i className="ri-arrow-right-line"></i>
            </Link>
            <Link to="/user/register" className="action-btn-main action-btn-secondary">
              Create Account
            </Link>
          </div>
        </div>

        {/* Food Partner Card */}
        <div className="role-card-hero partner-side">
          <div className="role-card-header">
            <span className="role-badge-tag">
              <i className="ri-restaurant-2-line"></i> For Restaurants & Chefs
            </span>
            <i className="ri-fire-fill" style={{ color: '#10b981', fontSize: '1.2rem' }}></i>
          </div>
          <h2 className="card-title">Food Partner</h2>
          <p className="card-desc">
            Upload short sizzle reels of your kitchen, showcase signature dishes, and boost orders with viral food content.
          </p>

          <div className="card-video-preview">
            <video
              className="card-video-element"
              src="/videos/video3.mp4"
              autoPlay
              loop
              muted
              playsInline
            />
            <div className="video-overlay-gradient">
              <span className="video-tag-pill">
                <i className="ri-video-upload-line"></i> Partner & Stream
              </span>
            </div>
          </div>

          <div className="card-actions-row">
            <Link to="/partner/login" className="action-btn-main action-btn-primary">
              Partner Login <i className="ri-arrow-right-line"></i>
            </Link>
            <Link to="/partner/register" className="action-btn-main action-btn-secondary">
              Register Business
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Food Video Reels Showcase */}
      <section className="reels-section">
        <div className="section-header">
          <h2>Trending Food Reels 🔥</h2>
          <p>Click any video clip to expand and watch in high definition</p>
        </div>

        <div className="reels-grid-showcase">
          {videoList.map((video) => (
            <div
              key={video.id}
              className="reel-card-item"
              onClick={() => setActiveModalVideo(video)}
            >
              <video
                className="reel-video"
                src={video.url}
                autoPlay
                loop
                muted
                playsInline
              />

              <div className="reel-info-overlay">
                <div className="reel-top-bar">
                  <span className="reel-chef-pill">
                    <i className="ri-shield-user-line"></i> {video.chef}
                  </span>
                  <span className="reel-likes">
                    <i className="ri-heart-fill"></i> {video.likes}
                  </span>
                </div>

                <div className="reel-bottom-info">
                  <span className="dish-name">{video.title}</span>
                  <span className="dish-tag">{video.tag}</span>
                </div>
              </div>

              <div className="reel-play-indicator">
                <i className="ri-play-large-fill"></i>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust & Stats Bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <h3>50K+</h3>
          <p>Food Reels Uploaded</p>
        </div>
        <div className="stat-item">
          <h3>500+</h3>
          <p>Verified Food Partners</p>
        </div>
        <div className="stat-item">
          <h3>100K+</h3>
          <p>Happy Foodies Served</p>
        </div>
        <div className="stat-item">
          <h3>4.9 ★</h3>
          <p>Community Rating</p>
        </div>
      </div>

      {/* Video Modal Player Popup */}
      {activeModalVideo && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}
          onClick={() => setActiveModalVideo(null)}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '420px',
              height: '75vh',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveModalVideo(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                zIndex: 10,
                background: 'rgba(0,0,0,0.6)',
                border: 'none',
                color: '#fff',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <i className="ri-close-line"></i>
            </button>
            <video
              src={activeModalVideo.url}
              controls
              autoPlay
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
