import React, { useState, useEffect, useCallback } from "react";
import { Link } from 'react-router-dom';
import "./TopBars.scss";
import Search from "./Search";
import LogoMain from "./LogoMain"
import CartManager from "../../services/CartManager"
import { useAuth } from "../../services/AuthContext"

function TopBars({handleSeachProduct}) {
  const cart = CartManager.getInstance()
  const [cartCount, setCartCount] = useState(cart.getTotalCount())
  const { user, isAuthenticated, logout } = useAuth()

  const syncCount = useCallback(() => {
    setCartCount(cart.getTotalCount())
  }, [cart])

  useEffect(() => {
    const unsubscribe = cart.subscribe(syncCount)
    return unsubscribe
  }, [cart, syncCount])

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <LogoMain />
      </div>
      <div className="top-bar-center">
        <Search handleSeachProduct={handleSeachProduct}/>
      </div>
      <div className="top-bar-right">
        {isAuthenticated ? (
          <>
            {user.roleCode === 'manager' && (
              <Link to="/manager" className="top-bar-right-action top-bar-right-dashboard">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                </svg>
                <span className="top-bar-right-action-name">Dashboard</span>
              </Link>
            )}
            <Link to="/profile" className="top-bar-right-action">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <span className="top-bar-right-action-name">{user.fullName || user.username}</span>
            </Link>
            <button className="top-bar-right-action top-bar-right-logout" onClick={handleLogout}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="top-bar-right-action">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              <span className="top-bar-right-action-name">Login</span>
            </Link>
            <Link to="/register" className="top-bar-right-action">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
              <span className="top-bar-right-action-name">Register</span>
            </Link>
          </>
        )}
        <Link to='/cart' className="top-bar-right-action">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
          </svg>
          {cartCount > 0 && (
            <span className="top-bar-right-badge">{cartCount}</span>
          )}
        </Link>
        {/* <Link to='/stores' className="top-bar-right-action">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
        </Link> */}
      </div>
    </div>
  );
}

export default TopBars;
