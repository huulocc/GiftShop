import React from "react";
import { Link } from 'react-router-dom';
import "./TopBars.scss";
import Search from "./Search";
import LogoMain from "./LogoMain"

function TopBars({handleSeachProduct, indexofCart, handlelogin, registerUser}) {
  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <LogoMain />
      </div>
      <div className="top-bar-center">
        <Search handleSeachProduct={handleSeachProduct}/>
      </div>
      <div className="top-bar-right">
        <div className="top-bar-right-action" onClick={() => handlelogin && handlelogin()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          {registerUser !== undefined && (
            <span className="top-bar-right-action-name">{registerUser.name}</span>
          )}
        </div>
        <Link to='/cart' className="top-bar-right-action">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
          </svg>
          {indexofCart > 0 && (
            <span className="top-bar-right-badge">{indexofCart}</span>
          )}
        </Link>
        <Link to='/stores' className="top-bar-right-action">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
        </Link>
      </div>
    </div>
  );
}

export default TopBars;
