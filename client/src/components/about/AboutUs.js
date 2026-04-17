import React from 'react'
import './AboutUs.scss'
import { Link } from 'react-router-dom'

const stats = [
  { value: '10K+', label: 'Happy Customers' },
  { value: '500+', label: 'Curated Products' },
  { value: '4', label: 'Gift Categories' },
  { value: '99%', label: 'Satisfaction Rate' },
]

const values = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
    title: 'Crafted with Love',
    desc: 'Every product in our collection is hand-picked for quality. We believe the best gift is one that carries genuine warmth and thoughtful detail.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: 'Fast & Reliable',
    desc: 'From the moment you order to the moment it arrives, we ensure every step is smooth, swift, and dependable — because timing matters for special moments.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Trusted & Secure',
    desc: 'Shop with confidence knowing your personal data and payments are fully secured. We take privacy and integrity seriously at every step.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    title: 'Customer First',
    desc: 'Our support team is here for you before, during, and after every purchase. Your happiness is not just our goal — it\'s our standard.',
  },
]

const team = [
  { name: 'Vo Huu Loc', id: '23110039', role: 'Fullstack Developer', initials: 'HL', color: '#667eea' },
  { name: 'Le Vu Khang', id: '23110029', role: 'Fullstack Developer', initials: 'VK', color: '#764ba2' },
  { name: 'Ngo Viet Hoang', id: '23110020', role: 'UI/UX Designer', initials: 'VH', color: '#48bb78' },
  { name: 'Nguyen Hoang Lam', id: '22110048', role: 'Backend Developer', initials: 'HL', color: '#f6ad55' },
]

export default function AboutUs() {
  return (
    <div className="about">

      {/* ── Hero ── */}
      <section className="about-hero">
        <div className="about-hero__glow" />
        <div className="about-container">
          <div className="about-hero__badge">Our Story</div>
          <h1 className="about-hero__title">
            Gifts that speak<br />
            <span className="about-hero__title--accent">louder than words</span>
          </h1>
          <p className="about-hero__subtitle">
            GiftShop was born from a simple belief: the right gift can turn an ordinary moment into
            a memory that lasts a lifetime. We curate every product with intention so you never have
            to settle for "good enough."
          </p>
          <div className="about-hero__cta">
            <Link to="/search" className="about-btn about-btn--primary">Explore Products</Link>
            <Link to="/contact" className="about-btn about-btn--ghost">Get in Touch</Link>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="about-stats">
        <div className="about-container">
          <div className="about-stats__grid">
            {stats.map((s) => (
              <div key={s.label} className="about-stat-card">
                <span className="about-stat-card__value">{s.value}</span>
                <span className="about-stat-card__label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="about-mission">
        <div className="about-container about-mission__inner">
          <div className="about-mission__visual">
            <div className="about-mission__shape">
              <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="mg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="100%" stopColor="#764ba2" />
                  </linearGradient>
                </defs>
                <circle cx="100" cy="100" r="90" fill="url(#mg)" opacity="0.12" />
                <circle cx="100" cy="100" r="65" fill="url(#mg)" opacity="0.18" />
                <circle cx="100" cy="100" r="40" fill="url(#mg)" opacity="0.3" />
                {/* Gift icon */}
                <rect x="68" y="88" width="64" height="48" rx="4" fill="url(#mg)" opacity="0.9" />
                <rect x="64" y="80" width="72" height="16" rx="4" fill="url(#mg)" />
                <line x1="100" y1="80" x2="100" y2="136" stroke="white" strokeWidth="3" />
                <line x1="64" y1="88" x2="136" y2="88" stroke="white" strokeWidth="3" />
                <path d="M100 80 C100 80 88 72 86 64 C84 56 92 52 98 60 C102 66 100 80 100 80Z" fill="white" opacity="0.9" />
                <path d="M100 80 C100 80 112 72 114 64 C116 56 108 52 102 60 C98 66 100 80 100 80Z" fill="white" opacity="0.7" />
              </svg>
            </div>
          </div>
          <div className="about-mission__content">
            <div className="about-section-tag">Our Mission</div>
            <h2 className="about-section-title">More than a gift shop —<br />a feeling factory</h2>
            <p className="about-mission__text">
              We started GiftShop to solve a problem everyone has faced: the last-minute scramble
              for a gift that actually means something. We built a curated marketplace where every
              item — a mug, a bracelet, a card, a balloon — is chosen to carry emotion.
            </p>
            <p className="about-mission__text">
              Today, we help thousands of customers celebrate birthdays, anniversaries, graduations,
              and the quiet everyday moments that deserve to be marked with something special.
            </p>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="about-values">
        <div className="about-container">
          <div className="about-section-header">
            <div className="about-section-tag">What We Stand For</div>
            <h2 className="about-section-title">Built on values that matter</h2>
          </div>
          <div className="about-values__grid">
            {values.map((v) => (
              <div key={v.title} className="about-value-card">
                <div className="about-value-card__icon">{v.icon}</div>
                <h3 className="about-value-card__title">{v.title}</h3>
                <p className="about-value-card__desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="about-team">
        <div className="about-container">
          <div className="about-section-header">
            <div className="about-section-tag">The People Behind It</div>
            <h2 className="about-section-title">Meet our team</h2>
            <p className="about-team__subtitle">Group 4 · T3.2307.E1 · Aptech</p>
          </div>
          <div className="about-team__grid">
            {team.map((m) => (
              <div key={m.name} className="about-team-card">
                <div className="about-team-card__avatar" style={{ background: `linear-gradient(135deg, ${m.color}aa, ${m.color})` }}>
                  {m.initials}
                </div>
                <h3 className="about-team-card__name">{m.name}</h3>
                <p className="about-team-card__role">{m.role}</p>
                <p className="about-team-card__id">ID: {m.id}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="about-cta">
        <div className="about-container">
          <div className="about-cta__card">
            <h2 className="about-cta__title">Ready to find the perfect gift?</h2>
            <p className="about-cta__sub">Browse our curated collections and make someone's day unforgettable.</p>
            <Link to="/search" className="about-btn about-btn--primary about-btn--lg">
              Shop Now
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
