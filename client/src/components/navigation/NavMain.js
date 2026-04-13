import './NavMain.scss'
import React, { useState, useEffect } from 'react'
import { NavLink, Link } from "react-router-dom";
import categoryService from '../../services/categoryService';

export default function NavMain() {
  const [menuList, setMenuList] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await categoryService.getAll()
        if (result.success) {
          setMenuList(result.data)
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }
    fetchCategories()
  }, [])

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
                  <li key={items.categoryId} className='nav-dropdown-item'>
                    <Link to={`/search?q=${items.categoryId}`} className='nav-dropdown-link' onClick={() => setMobileOpen(false)}>{items.categoryName}</Link>
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