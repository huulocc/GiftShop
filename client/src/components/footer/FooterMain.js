import React, { useState, useEffect } from 'react'
import './FooterMain.scss'
import { Link } from 'react-router-dom'
import categoryService from '../../services/categoryService'

function FooterMain() {
  const [footerCategories, setFooterCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await categoryService.getAll()
        if (result.success) {
          setFooterCategories(result.data.slice(0, 4)); // Keep footer tidy with top 4
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }
    fetchCategories()
  }, [])

  const footercontent = {
    About: [
      { id: '1', info: 'Home', path: '/' },
      { id: '2', info: 'About us', path: '/about-us' },
      { id: '3', info: 'Comparison', path: '/compare' },
      { id: '4', info: 'Contact', path: '/contact' },
    ],
    // Categories are fetched dynamically now
    Social: [
      // { id: '1', info: 'Facebook', path: 'https://www.facebook.com/', icon: 'facebook' },
      // { id: '2', info: 'Twitter', path: 'https://twitter.com/', icon: 'twitter' },
      // { id: '3', info: 'Instagram', path: 'https://www.instagram.com/', icon: 'instagram' },
      // { id: '4', info: 'Pinterest', path: 'https://www.pinterest.com/', icon: 'pinterest' }
    ]
  }

  const socialIcons = {
    facebook: (
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>
    ),
    twitter: (
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" /></svg>
    ),
    instagram: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
    ),
    pinterest: (
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" /></svg>
    ),
  };

  return (
    <footer className='footer'>
      <div className='footer-inner'>

        {/* Link columns */}
        <div className="footer-columns">
          <div className="footer-col">
            <h4 className="footer-col-title">About</h4>
            <ul className="footer-col-list">
              {footercontent.About.map((item) => (
                <li key={item.id}><Link to={item.path} className="footer-col-link">{item.info}</Link></li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4 className="footer-col-title">Categories</h4>
            <ul className="footer-col-list">
              {footerCategories.map((item) => (
                <li key={item.categoryId}><Link to={`/search?q=${item.categoryId}`} className="footer-col-link">{item.categoryName}</Link></li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4 className="footer-col-title">Contact</h4>
            <div className="footer-contact-info">
              <p>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                590 D. CMT8, District 3, HCM City
              </p>
              <p>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" /></svg>
                0866 186 503
              </p>
              <p>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                GiftShop@email.com.vn
              </p>
            </div>
          </div>
        </div>

        {/* Social row */}
        {/* <div className="footer-social">
          <h4 className="footer-social-title">Follow Us</h4>
          <div className="footer-social-icons">
            {footercontent.Social.map((item) => (
              <a key={item.id} href={item.path} className="footer-social-link" target="_blank" rel="noopener noreferrer" aria-label={item.info}>
                {socialIcons[item.icon]}
              </a>
            ))}
          </div>
        </div> */}

        {/* Copyright */}
        <div className="footer-copyright">
          <p>&copy; {new Date().getFullYear()} GiftShop — Group 4 T3.2307.E1 Aptech</p>
        </div>
      </div>
    </footer>
  )
}

export default FooterMain