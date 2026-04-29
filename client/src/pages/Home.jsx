import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import heroImage from "../assets/landing-hero.jpeg";
import phoneMockup from "../assets/phone-mockup.jpeg";
import logo from "../assets/logo.png";
import "../styles/Home.css";

const Home = () => {
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleGetStarted = () => {
    if (token || isAuthenticated) {
      navigate("/lessons");
    } else {
      navigate("/auth");
    }
  };

  const handleStartLearning = () => {
    if (token || isAuthenticated) {
      navigate("/lessons");
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="sb-landing">
      {/* Floating Navbar */}
      <nav className={`sb-navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="sb-nav-container">
          <div className="sb-logo">
            <img src={logo} alt="SignBridge" />
            <span>SignBridge</span>
          </div>
          <div className="sb-nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#news">News</a>
            <a href="#mobile-app">Mobile App</a>
          </div>
          
          <button onClick={handleGetStarted} className="sb-nav-btn">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="sb-hero">
        <div className="sb-hero-bg">
          <div className="sb-hero-gradient"></div>
        </div>
        <div className="sb-hero-inner">
          <div className="sb-hero-left">
            <div className="sb-hero-badge">
              <span className="sb-badge-pulse"></span>
              <span>🌟 Available Now</span>
            </div>
            <h1 className="sb-hero-title">
              Learn Uzbek Sign Language
              <span className="sb-title-highlight"> & Start Building Bridges</span>
            </h1>
            <p className="sb-hero-text">
              Join thousands of learners mastering Uzbek Sign Language through our
              structured, interactive platform. Learn at your own pace, track your
              progress, and communicate with confidence.
            </p>
            <div className="sb-hero-actions">
              <button onClick={handleStartLearning} className="sb-btn sb-btn-primary">
                Start Learning Free
              </button>
              <a href="#features" className="sb-btn sb-btn-outline">
                Watch Demo
              </a>
            </div>
            <div className="sb-hero-stats">
              <div className="sb-stat">
                <span className="sb-stat-number">500+</span>
                <span className="sb-stat-label">Active Learners</span>
              </div>
              <div className="sb-stat">
                <span className="sb-stat-number">50+</span>
                <span className="sb-stat-label">Interactive Lessons</span>
              </div>
              <div className="sb-stat">
                <span className="sb-stat-number">1000+</span>
                <span className="sb-stat-label">Signs Learned</span>
              </div>
            </div>
          </div>
          <div className="sb-hero-right">
            <div className="sb-hero-image-shell">
              <div className="sb-hero-image-ring">
                <img src={heroImage} alt="People communicating with sign language" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="sb-section">
        <div className="sb-section-inner">
          <div className="sb-section-head">
            <span className="sb-chip">Why Choose SignBridge</span>
            <h2 className="sb-section-title center">
              Everything You Need to Master Sign Language
            </h2>
            <p className="sb-section-subtitle">
              Our platform combines proven learning methods with modern technology
            </p>
          </div>

          <div className="sb-features-grid">
            <div className="sb-feature-card">
              <div className="sb-feature-icon">📚</div>
              <h3>Structured Lessons</h3>
              <p>Learn through carefully designed lessons that build upon each other</p>
            </div>
            <div className="sb-feature-card">
              <div className="sb-feature-icon">🎯</div>
              <h3>Interactive Quizzes</h3>
              <p>Test your knowledge with engaging quizzes and instant feedback</p>
            </div>
            <div className="sb-feature-card">
              <div className="sb-feature-icon">🤖</div>
              <h3>AI Recognition</h3>
              <p>Practice with our camera-based sign recognition technology</p>
            </div>
            <div className="sb-feature-card">
              <div className="sb-feature-icon">📊</div>
              <h3>Progress Tracking</h3>
              <p>Monitor your improvement with detailed analytics and achievements</p>
            </div>
            <div className="sb-feature-card">
              <div className="sb-feature-icon">🏆</div>
              <h3>Gamification</h3>
              <p>Earn badges, maintain streaks, and stay motivated</p>
            </div>
            <div className="sb-feature-card">
              <div className="sb-feature-icon">💬</div>
              <h3>Community Support</h3>
              <p>Connect with fellow learners and practice together</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="sb-section sb-section-light">
        <div className="sb-section-inner">
          <div className="sb-section-head">
            <span className="sb-chip">Simple Process</span>
            <h2 className="sb-section-title center">
              Learn Sign Language in 4 Easy Steps
            </h2>
          </div>

          <div className="sb-steps-grid">
            <div className="sb-step">
              <div className="sb-step-number">01</div>
              <h3>Choose a Lesson</h3>
              <p>Browse our library of structured lessons for all skill levels</p>
            </div>
            <div className="sb-step-arrow">→</div>
            <div className="sb-step">
              <div className="sb-step-number">02</div>
              <h3>Learn Signs</h3>
              <p>Study signs with clear images and video demonstrations</p>
            </div>
            <div className="sb-step-arrow">→</div>
            <div className="sb-step">
              <div className="sb-step-number">03</div>
              <h3>Practice</h3>
              <p>Reinforce learning with interactive quizzes and exercises</p>
            </div>
            <div className="sb-step-arrow">→</div>
            <div className="sb-step">
              <div className="sb-step-number">04</div>
              <h3>Master</h3>
              <p>Track progress and earn achievement badges</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile App Coming Soon */}
      <section id="mobile-app" className="sb-section sb-section-gradient">
        <div className="sb-section-inner sb-two-col">
          <div className="sb-device-visual">
            <div className="sb-device-card sb-device-glow">
              <img src={phoneMockup} alt="SignBridge mobile app preview" />
              <div className="sb-coming-soon-badge">Coming Soon</div>
            </div>
          </div>
          <div className="sb-section-copy">
            <span className="sb-chip sb-chip-light">📱 On the Go</span>
            <h2 className="sb-section-title light">
              Mobile App Coming Soon
            </h2>
            <p className="sb-section-text light">
              Take your sign language learning anywhere with our upcoming mobile app.
              Learn on your phone, practice during your commute, and never miss a day.
            </p>
            <div className="sb-app-features">
              <div className="sb-app-feature">
                <span>✓</span> Offline access to lessons
              </div>
              <div className="sb-app-feature">
                <span>✓</span> Camera sign recognition on mobile
              </div>
              <div className="sb-app-feature">
                <span>✓</span> Push notifications for daily practice
              </div>
              <div className="sb-app-feature">
                <span>✓</span> Sync progress across devices
              </div>
            </div>
            <div className="sb-app-store-badges">
              <div className="sb-store-badge">App Store</div>
              <div className="sb-store-badge">Google Play</div>
            </div>
          </div>
        </div>
      </section>

      {/* News & Updates */}
      <section id="news" className="sb-section">
        <div className="sb-section-inner">
          <div className="sb-section-head">
            <span className="sb-chip">Latest Updates</span>
            <h2 className="sb-section-title center">
              What's New at SignBridge
            </h2>
          </div>

          <div className="sb-news-grid">
            <div className="sb-news-card">
              <div className="sb-news-date">April 2026</div>
              <h3>AI Recognition Now Supports 50+ Signs</h3>
              <p>Our camera-based sign recognition has been expanded to recognize over 50 different signs with improved accuracy.</p>
              <span className="sb-news-tag">New Feature</span>
            </div>
            <div className="sb-news-card">
              <div className="sb-news-date">March 2026</div>
              <h3>Advanced Progress Analytics Dashboard</h3>
              <p>Track your learning journey with detailed statistics, achievement badges, and personalized insights.</p>
              <span className="sb-news-tag">Update</span>
            </div>
            <div className="sb-news-card">
              <div className="sb-news-date">February 2026</div>
              <h3>Mobile App Development Started</h3>
              <p>We're actively developing our mobile app to bring SignBridge to iOS and Android devices.</p>
              <span className="sb-news-tag">Announcement</span>
            </div>
          </div>
        </div>
      </section>

      {/* Future Enhancements */}
      <section className="sb-section sb-section-dark">
        <div className="sb-section-inner">
          <div className="sb-section-head">
            <span className="sb-chip sb-chip-light">Coming Soon</span>
            <h2 className="sb-section-title light center">
              Exciting Features on the Horizon
            </h2>
          </div>

          <div className="sb-future-grid">
            <div className="sb-future-card">
              <div className="sb-future-icon">🎥</div>
              <h3>Video Lessons</h3>
              <p>Professional video tutorials with native signers</p>
              <span className="sb-future-badge">Q3 2026</span>
            </div>
            <div className="sb-future-card">
              <div className="sb-future-icon">👥</div>
              <h3>Live Practice Sessions</h3>
              <p>Connect with other learners for real-time practice</p>
              <span className="sb-future-badge">Q4 2026</span>
            </div>
            <div className="sb-future-card">
              <div className="sb-future-icon">📜</div>
              <h3>Certificate Program</h3>
              <p>Earn official certification upon course completion</p>
              <span className="sb-future-badge">2027</span>
            </div>
            <div className="sb-future-card">
              <div className="sb-future-icon">🤝</div>
              <h3>Corporate Training</h3>
              <p>Specialized programs for businesses and organizations</p>
              <span className="sb-future-badge">In Planning</span>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter & CTA */}
      <section className="sb-section sb-section-cta">
        <div className="sb-section-inner sb-cta-wrapper">
          <h2>Ready to Start Your Journey?</h2>
          <p>Join thousands of learners and start mastering Uzbek Sign Language today</p>
          <div className="sb-cta-buttons">
            <button onClick={handleStartLearning} className="sb-btn sb-btn-primary">
              Create Free Account
            </button>
            <a href="#features" className="sb-btn sb-btn-outline">
              Explore Features
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="sb-footer">
        <div className="sb-footer-inner">
          <div className="sb-footer-grid">
            <div className="sb-footer-col">
              <div className="sb-footer-logo">
                <img src={logo} alt="SignBridge" />
                <span>SignBridge</span>
              </div>
              <p>Building bridges through sign language education.</p>
            </div>
            <div className="sb-footer-col">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#how-it-works">How it works</a>
              <a href="#mobile-app">Mobile App</a>
              <a href="/subscription">Pricing</a>
            </div>
            <div className="sb-footer-col">
              <h4>Company</h4>
              <a href="#">About Us</a>
              <a href="#">Blog</a>
              <a href="#">Careers</a>
              <a href="#">Press</a>
            </div>
            <div className="sb-footer-col">
              <h4>Resources</h4>
              <a href="#">Help Center</a>
              <a href="#">Community</a>
              <a href="#">Contact</a>
              <a href="#">Privacy Policy</a>
            </div>
          </div>
          <div className="sb-footer-bottom">
            <p>&copy; 2026 SignBridge. All rights reserved.</p>
            <div className="sb-footer-social">
              <span>📘</span>
              <span>🐦</span>
              <span>📷</span>
              <span>💼</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;