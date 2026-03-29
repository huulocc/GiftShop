import React from "react";

import './Search.scss'
import { Link, useLocation } from 'react-router-dom';

function Search() {
    let location = useLocation().pathname;
  return (
    <div className="search">
      <form action=""  >
      <label htmlFor="">
          <input type='text' className="input-style"/>
          <Link to='products'  >
            <input type="submit" value="Search"  className="button-style"   style={{color: '#515151'}}/>
          </Link>         
      </label>
      </form>
    </div>
  );
}

export default Search;