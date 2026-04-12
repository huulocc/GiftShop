import React from "react";
import './Search.scss'
import { Link } from 'react-router-dom';

function Search() {
  return (
    <div className="search">
      <form className="search-form">
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input
          type='text'
          className="search-input"
          placeholder="Search gifts..."
        />
        <Link to='products'>
          <button type="button" className="search-btn">Search</button>
        </Link>
      </form>
    </div>
  );
}

export default Search;