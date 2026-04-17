import React, { useState } from 'react'
import './ContactUs.scss'

function ContactUs() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  // Scroll to top on mount
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    // Clear form after delay
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ firstName: '', lastName: '', phone: '', email: '', message: '' })
    }, 4000)
  }

  return (
    <div className="contact-page">
      <div className="contact-container">
        
        {/* Header Section */}
        <div className="contact-header">
          <div className="contact-header__badge">Get in Touch</div>
          <h1 className="contact-header__title">
            We'd love to <span className="contact-header__title--accent">hear from you.</span>
          </h1>
          <p className="contact-header__subtitle">
            Whether you have a question about our products, pricing, need a demo, or anything else, our team is ready to answer all your questions.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="contact-main">
          
          {/* Left Column - Contact Form */}
          <div className="contact-card contact-form-card">
            <h2 className="contact-card__title">Send us a message</h2>
            <p className="contact-card__subtitle">We'll get back to you within 24 hours.</p>

            {submitted ? (
              <div className="contact-success">
                <div className="contact-success__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </div>
                <h3>Message Sent!</h3>
                <p>Thank you for reaching out. We will get back to you shortly.</p>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="contact-form__row">
                  <div className="contact-form__group">
                    <label>First Name</label>
                    <input 
                      type="text" 
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required 
                      placeholder="Jane" 
                    />
                  </div>
                  <div className="contact-form__group">
                    <label>Last Name</label>
                    <input 
                      type="text" 
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required 
                      placeholder="Doe" 
                    />
                  </div>
                </div>

                <div className="contact-form__row">
                  <div className="contact-form__group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required 
                      placeholder="jane@example.com" 
                    />
                  </div>
                  <div className="contact-form__group">
                    <label>Phone Number</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required 
                      placeholder="+1 (555) 000-0000" 
                    />
                  </div>
                </div>

                <div className="contact-form__group">
                  <label>Your Message</label>
                  <textarea 
                    name="message"
                    required 
                    rows="4" 
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="How can we help you?" 
                  />
                </div>

                <button type="submit" className="contact-form__submit">
                  Send Message
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </form>
            )}
          </div>

          {/* Right Column - Info & Map */}
          <div className="contact-sidebar">
            
            <div className="contact-card contact-info-card">
              <h3 className="contact-info__title">Contact Information</h3>
              
              <div className="contact-info__list">
                <div className="contact-info__item">
                  <div className="contact-info__icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div className="contact-info__text">
                    <strong>Headquarters</strong>
                    <p>590 D. Cach Mang Thang 8, Ward 11, District 3, Ho Chi Minh City</p>
                  </div>
                </div>

                <div className="contact-info__item">
                  <div className="contact-info__icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </div>
                  <div className="contact-info__text">
                    <strong>Phone</strong>
                    <p>097 729 8513</p>
                  </div>
                </div>

                <div className="contact-info__item">
                  <div className="contact-info__icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <div className="contact-info__text">
                    <strong>Email</strong>
                    <p>durableFurnitures@email.com.vn</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-card contact-map-card">
              <iframe 
                title="map" 
                src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d979.830153144561!2d106.66551812845046!3d10.786737916740972!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1svi!2s!4v1696304006211!5m2!1svi!2s" 
                width="100%" 
                height="100%" 
                style={{border:0}} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

export default ContactUs