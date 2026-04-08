import './NavMain.scss'
import React, { useState } from 'react'
import { NavLink, Link } from "react-router-dom";
import categories from '../products/Products/Categories.json';
import brands from '../products/Products/Brands.json'

export default function NavMain() {
  const menuList = categories;
  const brandList = brands;
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="nav">
      {/* Hamburger button (mobile only) */}
      <button
        className={`nav-hamburger ${mobileOpen ? 'nav-hamburger--open' : ''}`}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
      >
        <span /><span /><span />
      </button>

      <nav className={`nav-main ${mobileOpen ? 'nav-main--open' : ''}`}>
        <ul className="nav-main-ul">
          <li className="nav-main-ul-li">
            <NavLink to="/" className={({isActive}) => isActive ? "nav-link nav-link--active" : "nav-link"} onClick={() => setMobileOpen(false)}>Home</NavLink>
          </li>
          <li className="nav-main-ul-li nav-main-ul-li--has-dropdown">
            <NavLink to="products" className={({isActive}) => isActive ? "nav-link nav-link--active" : "nav-link"}>
              Categories
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </NavLink>
            <div className="nav-dropdown">
              <ul className="nav-dropdown-list">
                {menuList.map((items) => (
                  <li key={items.id} className='nav-dropdown-item'>
                    <Link to={`products/${items.id}`} className='nav-dropdown-link' onClick={() => setMobileOpen(false)}>{items.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </li>
          <li className="nav-main-ul-li nav-main-ul-li--has-dropdown">
            <NavLink to="brands/1" className={({isActive}) => isActive ? "nav-link nav-link--active" : "nav-link"}>
              Brands
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </NavLink>
            <div className="nav-dropdown">
              <ul className="nav-dropdown-list">
                {brandList.map((items) => (
                  <li key={items.id} className='nav-dropdown-item'>
                    <Link to={`brands/${items.id}`} className='nav-dropdown-link' onClick={() => setMobileOpen(false)}>{items.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </li>
          <li className="nav-main-ul-li">
            <NavLink to="/contact" className={({isActive}) => isActive ? "nav-link nav-link--active" : "nav-link"} onClick={() => setMobileOpen(false)}>Contact</NavLink>
          </li>
          <li className="nav-main-ul-li">
            <NavLink to="/orders" className={({isActive}) => isActive ? "nav-link nav-link--active" : "nav-link"} onClick={() => setMobileOpen(false)}>Orders</NavLink>
          </li>
          <li className="nav-main-ul-li">
            <NavLink to="/about-us" className={({isActive}) => isActive ? "nav-link nav-link--active" : "nav-link"} onClick={() => setMobileOpen(false)}>About Us</NavLink>
          </li>
          <li className="nav-main-ul-li">
            <NavLink to="/compare" className={({isActive}) => isActive ? "nav-link nav-link--active" : "nav-link"} onClick={() => setMobileOpen(false)}>Compare</NavLink>
          </li>
        </ul>
      </nav>
    </div>
  )
}